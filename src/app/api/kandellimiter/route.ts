// src/app/api/kandellimiter/route.ts
// Route que invoca KANDELlimiter para control de tráfico y dispositivos
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ip, limit, interface: iface } = body;

    switch (action) {
      case 'scan': {
        const cmd = `ip neigh show 2>&1 | head -20`;
        exec(cmd, { timeout: 10000 }, (error, stdout) => {
          if (error) return NextResponse.json({ error: error.message }, { status: 500 });
          const devices = stdout.trim().split('\n').filter((l: string) => l.includes('REACHABLE') || l.includes('STALE')).map((line: string) => {
            const parts = line.trim().split(' ');
            return { ip: parts[0], mac: parts[4] || '', hostname: parts[1] || '', status: 'active' };
          });
          return NextResponse.json({ success: true, devices, count: devices.length });
        });
        return NextResponse.json({ success: true, message: 'Escaneo de dispositivos iniciado' });
      }
      case 'limit': {
        const { ip: targetIp, limitKB } = body;
        const cmd = `tc qdisc add dev ${iface || 'wlp3s0'} root handle 1: htb default 10 2>/dev/null || tc class add dev ${iface || 'wlp3s0'} parent 1:1 classid 1:${parseInt(targetIp.split('.').pop() || '1')} htb rate ${limitKB}kbit 2>/dev/null`;
        exec(cmd, { timeout: 5000 }, (error) => {
          if (error) return NextResponse.json({ error: `Error al limitar: ${error.message}` }, { status: 500 });
          return NextResponse.json({ success: true, ip: targetIp, limit: `${limitKB}Kbit`, action: 'limited' });
        });
        return NextResponse.json({ success: true, message: `Limitando ${targetIp} a ${limitKB}Kbit` });
      }
      case 'block': {
        const { ip: targetIp } = body;
        const cmd = `iptables -A FORWARD -d ${targetIp} -j DROP 2>/dev/null`;
        exec(cmd, { timeout: 5000 }, (error) => {
          if (error) return NextResponse.json({ error: `Error al bloquear: ${error.message}` }, { status: 500 });
          return NextResponse.json({ success: true, ip: targetIp, action: 'blocked' });
        });
        return NextResponse.json({ success: true, message: `Bloqueado ${targetIp}` });
      }
      case 'unlimit': {
        const { ip: targetIp } = body;
        const cmd = `tc filter del dev ${iface || 'wlp3s0'} parent 1: protocol ip handle ${parseInt(targetIp.split('.').pop() || '1')} fw 2>/dev/null && iptables -D FORWARD -d ${targetIp} -j DROP 2>/dev/null`;
        exec(cmd, { timeout: 5000 }, (error) => {
          if (error) return NextResponse.json({ error: `Error al liberar: ${error.message}` }, { status: 500 });
          return NextResponse.json({ success: true, ip: targetIp, action: 'released' });
        });
        return NextResponse.json({ success: true, message: `Liberado ${targetIp}` });
      }
      case 'status': {
        return NextResponse.json({
          success: true,
          tools: { tc: 'v1.5', iptables: 'v1.8' },
          interface: iface || 'wlp3s0',
          version: 'v0.1.0',
        });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar petición de red' }, { status: 500 });
  }
}
