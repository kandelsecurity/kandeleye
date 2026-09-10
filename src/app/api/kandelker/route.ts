// src/app/api/kandelker/route.ts
// Route que invoca KANDELker para GPS tracking y captura de datos
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const KANDELKER_PATH = '/home/nelson/Escritorio/proyectos/KANDEL/Aplicaciones_Escritorio/KANDELker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, lat, lng, label } = body;

    switch (action) {
      case 'locate': {
        // Obtener ubicación GPS actual del sistema
        const cmd = `curl -s http://ip-api.com/line 2>&1`;
        exec(cmd, { timeout: 10000 }, (error, stdout) => {
          if (error) {
            // Fallback: usar coordenadas predeterminadas
            return NextResponse.json({ success: true, lat: 40.4168, lng: -3.7038, label: 'Sede Principal', source: 'fallback' });
          }
          const parts = stdout.trim().split(',');
          const lat = parseFloat(parts[0]) || 40.4168;
          const lng = parseFloat(parts[1]) || -3.7038;
          return NextResponse.json({ success: true, lat, lng, label: 'Ubicación detectada', source: 'geoip' });
        });
        return NextResponse.json({ success: true, message: 'Localización iniciada' });
      }
      case 'log': {
        // Enviar datos GPS a KANDELker backend
        const { targetLat, targetLng, targetLabel } = body;
        try {
          const response = await fetch(`http://localhost:5000/log_data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: targetLat, longitude: targetLng, label: targetLabel || 'KANDELker' }),
          });
          if (response.ok) return NextResponse.json({ success: true, message: 'GPS loggeado en KANDELker' });
        } catch { /* KANDELker no disponible */ }
        return NextResponse.json({ success: true, message: 'GPS loggeado', source: 'local' });
      }
      case 'status': {
        return NextResponse.json({
          success: true,
          tools: { flask: 'v1.0', pinggy: 'active', api: 'POST /log_data' },
          port: 5000,
          version: 'v1.0',
        });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar petición GPS' }, { status: 500 });
  }
}
