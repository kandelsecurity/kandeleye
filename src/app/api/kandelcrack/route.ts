// src/app/api/kandelcrack/route.ts
// Route que invoca KANDELcrack para auditoría Wi-Fi
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const KANDELCRACK_PATH = '/home/nelson/Escritorio/proyectos/KANDEL/KANDELcrack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, interface: iface, bssid, channel } = body;

    switch (action) {
      case 'scan': {
        const cmd = `airodump-ng ${iface || 'wlp3s0'} 2>&1 | head -30`;
        exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) return NextResponse.json({ error: `Error en escaneo Wi-Fi: ${stderr}` }, { status: 500 });
          const networks = stdout.trim().split('\n').slice(2).filter((l: string) => l.trim()).map((line: string) => {
            const parts = line.trim().split(/\s{2,}/);
            return { bssid: parts[0], channel: parts[3], encryption: parts[5] || 'WPA2', signal: parts[7] || '-50' };
          });
          return NextResponse.json({ success: true, networks, count: networks.length });
        });
        return NextResponse.json({ success: true, message: 'Escaneo Wi-Fi iniciado' });
      }
      case 'handshake': {
        const { target, iface: intf } = body;
        const cmd = `aircrack-ng -b ${target} ${KANDELCRACK_PATH}/handshake.hc22000 2>&1`;
        exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
          if (error) return NextResponse.json({ error: `Error en descifrado: ${stderr}` }, { status: 500 });
          const found = stdout.includes('FOUND KEY') || stdout.includes('KEY CRACKED');
          return NextResponse.json({ success: true, keyFound: found, output: stdout.substring(0, 1000) });
        });
        return NextResponse.json({ success: true, message: 'Descifrado iniciado' });
      }
      case 'status': {
        return NextResponse.json({
          success: true,
          tools: { aircrack: 'v1.0', airodump: 'v1.0', aireplay: 'v1.0' },
          interface: iface || 'wlp3s0',
          handshake: `${KANDELCRACK_PATH}/handshake.hc22000`,
        });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar petición de Wi-Fi' }, { status: 500 });
  }
}
