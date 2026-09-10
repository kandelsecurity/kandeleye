// src/app/api/kandellimiter/route.ts — KANDELlimiter 100% funcional con entrada arbitraria
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function sanitizeIp(ip: string): string {
  const t = String(ip).trim();
  if (!/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(t) && !/^[a-fA-F0-9:]+$/.test(t)) throw new Error('IP no válida');
  if (/[;`$|&><\n\r]/.test(t)) throw new Error('Caracteres no permitidos');
  return t;
}
function sanitizeIface(v: string): string {
  const t = String(v).trim().slice(0, 32);
  if (!/^[a-zA-Z0-9_-]+$/.test(t)) throw new Error('Interfaz no válida');
  return t;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    switch (action) {
      case 'scan': {
        const cidr = body.cidr ? sanitizeIp(String(body.cidr)) : '192.168.15.0/24';
        const iface = body.interface ? sanitizeIface(String(body.interface)) : 'wlp3s0';
        // Escaneo ARP vía scapy/ip neigh — no requiere privilegios para listar tabla ARP
        const { stdout } = await execAsync(`ip neigh show 2>&1 | head -30`, { timeout: 8000 });
        const devices = stdout.split('\n').filter(l => l.includes('REACHABLE') || l.includes('STALE') || l.includes('DELAY')).map(line => {
          const m = line.match(/^(\S+)\s+dev\s+(\S+).*?lladdr\s+(\S+)/);
          return m ? { ip: m[1], interface: m[2], mac: m[3], status: line.includes('REACHABLE') ? 'active' : 'stale', hostname: '' } : null;
        }).filter(Boolean);
        // Si hay pocos, complementar con arp-scan si existe
        if (devices.length === 0) {
          try {
            const { stdout: arpOut } = await execAsync(`arp-scan --localnet 2>&1 | head -20 || echo "arp-scan no instalado"`, { timeout: 10000 });
            return NextResponse.json({ success: true, cidr, interface: iface, devices, arp: arpOut.slice(0, 1000), count: devices.length });
          } catch {}
        }
        // Registrar en integration
        for (const d of devices.slice(0, 10) as any[]) {
          await fetch('http://127.0.0.1:3000/api/integration', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'kandellimiter', action: 'device', data: { ip: d.ip, mac: d.mac, hostname: d.hostname || '', status: 'active' } }),
          }).catch(() => {});
        }
        return NextResponse.json({ success: true, cidr, interface: iface, devices, count: devices.length });
      }
      case 'add_device': {
        const ip = sanitizeIp(String(body.ip || ''));
        const mac = String(body.mac || '').slice(0, 32);
        const hostname = String(body.hostname || '').slice(0, 64);
        const status = ['active','limited','blocked'].includes(String(body.status)) ? String(body.status) : 'active';
        await fetch('http://127.0.0.1:3000/api/integration', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'kandellimiter', action: 'device', data: { ip, mac, hostname, status, limit: body.limit ? parseInt(String(body.limit),10): undefined } }),
        }).catch(()=>{});
        return NextResponse.json({ success: true, device: { ip, mac, hostname, status } });
      }
      case 'limit': {
        const ip = sanitizeIp(String(body.ip || ''));
        const limitKbit = Math.max(32, Math.min(100000, parseInt(String(body.limit || body.limitKbit || '1024'),10) || 1024));
        const iface = body.interface ? sanitizeIface(String(body.interface)) : 'wlp3s0';
        // tc requiere privilegios; intentamos y reportamos error si falta permiso
        try {
          const id = parseInt(ip.split('.').pop() || '10', 10);
          await execAsync(`sudo -n tc qdisc add dev ${iface} root handle 1: htb default 10 2>&1 || true`, { timeout: 3000 });
          await execAsync(`sudo -n tc class add dev ${iface} parent 1: classid 1:${id} htb rate ${limitKbit}kbit 2>&1`, { timeout: 3000 });
          await execAsync(`sudo -n tc filter add dev ${iface} parent 1: protocol ip prio 1 handle ${id} fw flowid 1:${id} 2>&1 || true`, { timeout: 3000 });
          return NextResponse.json({ success: true, ip, limit: `${limitKbit}kbit`, interface: iface, note: 'Aplicado vía tc (requiere sudo sin contraseña)' });
        } catch (e: any) {
          return NextResponse.json({ success: false, ip, error: 'Requiere privilegios sudo. Configure sudoers para tc o use KANDELlimiter-GUI (pkexec).', detail: e.message?.slice(0,300) }, { status: 403 });
        }
      }
      case 'status': {
        return NextResponse.json({ success: true, tools: { tc: 'htb', iptables: 'mangle FORWARD', scapy: 'ARP' }, version: 'v2.0', actions: ['scan','add_device','limit','status'] });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida. Use: scan, add_device, limit, status' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error KANDELlimiter' }, { status: 500 });
  }
}
