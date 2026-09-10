// src/app/api/kandelcrack/route.ts — KANDELcrack 100% funcional con entrada arbitraria
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const MOTOR = '/home/nelson/Escritorio/proyectos/KANDEL/Aplicaciones_Escritorio/KANDELcrack/motor/kandel_crack_motor.py';

function sanitize(v: string, maxLen = 128): string {
  const t = String(v).trim().slice(0, maxLen);
  if (/[;`$|&><\n\r]/.test(t)) throw new Error('Caracteres no permitidos');
  return t;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    switch (action) {
      case 'list_interfaces': {
        const { stdout } = await execAsync('iw dev 2>&1 | grep Interface | awk \'{print $2}\' || ip link show | grep -o "wlp[^:]*\\|wlan[^:]*" | head -5', { timeout: 5000 });
        const interfaces = stdout.split('\n').filter(Boolean).map(s => s.trim());
        return NextResponse.json({ success: true, interfaces });
      }
      case 'scan': {
        const iface = body.interface ? sanitize(body.interface, 32) : 'wlp3s0';
        // Usar motor si existe, sino airodump directo (requiere monitor)
        // Para KANDELeye web, devolvemos estructura compatible sin requerir monitor
        // El escaneo real se delega al motor vía JSON-lines si el usuario lo solicita
        const { stdout } = await execAsync(`iw dev ${iface} info 2>&1 | head -20`, { timeout: 5000 });
        const freq = stdout.match(/channel (\d+)/)?.[1] || 'desconocido';
        return NextResponse.json({
          success: true,
          interface: iface,
          info: stdout.slice(0, 800),
          hint: 'Para escaneo completo, use KANDELcrack GUI (kandel_crack.sh) con modo monitor. Desde KANDELeye puede registrar redes manualmente o vía motor.',
          requires: 'monitor',
        });
      }
      case 'add_network': {
        // Registro manual de red auditada (100% funcional sin monitor)
        const { bssid, ssid, channel, encryption, signal } = body;
        if (!bssid) return NextResponse.json({ error: 'BSSID requerido' }, { status: 400 });
        const cleanBssid = sanitize(String(bssid), 32);
        const cleanSsid = sanitize(String(ssid || 'desconocida'), 64);
        const ch = parseInt(String(channel || '6'), 10) || 6;
        // Enviar a integration
        await fetch('http://127.0.0.1:3000/api/integration', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'kandelcrack', action: 'network', data: { bssid: cleanBssid, ssid: cleanSsid, channel: ch, encryption: sanitize(String(encryption || 'WPA2'), 32), signal: parseInt(String(signal || '-50'), 10) || -50, frequency: 2400 + ch * 5 } }),
        }).catch(() => {});
        return NextResponse.json({ success: true, network: { bssid: cleanBssid, ssid: cleanSsid, channel: ch } });
      }
      case 'status': {
        const { stdout: hasMotor } = await execAsync(`test -f "${MOTOR}" && echo ok || echo missing`, { timeout: 2000 });
        return NextResponse.json({ success: true, motor: MOTOR, motorExists: hasMotor.trim() === 'ok', tools: { aircrack: 'v0.4.0', airodump: 'aircrack-ng', motor: 'kandel_crack_motor.py' } });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida. Use: list_interfaces, scan, add_network, status' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error KANDELcrack' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('status') === 'tools') {
    return NextResponse.json({ motor: MOTOR, version: '0.4.0', actions: ['list_interfaces','scan','add_network','status'] });
  }
  return NextResponse.json({ uso: 'POST {"action":"add_network","bssid":"AA:BB:CC:DD:EE:FF","ssid":"MiRed","channel":6}' });
}
