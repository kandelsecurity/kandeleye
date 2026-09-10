// src/app/api/kandelker/route.ts — KANDELker 100% funcional con entrada arbitraria
import { NextRequest, NextResponse } from 'next/server';

function sanitizeLabel(v: string): string { return String(v).trim().slice(0, 128).replace(/[;`$|&><\n\r]/g, ''); }
function isValidCoord(n: any, min: number, max: number): boolean { const v = Number(n); return Number.isFinite(v) && v >= min && v <= max; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    switch (action) {
      case 'track': {
        const lat = body.lat ?? body.latitude;
        const lng = body.lng ?? body.longitude ?? body.lon;
        const label = sanitizeLabel(String(body.label || body.hostname || 'Objetivo KANDELker'));
        if (!isValidCoord(lat, -90, 90) || !isValidCoord(lng, -180, 180)) {
          return NextResponse.json({ error: 'Coordenadas inválidas. lat -90..90, lng -180..180' }, { status: 400 });
        }
        const cleanLat = Number(lat), cleanLng = Number(lng);
        // Enviar a integration (mapa)
        await fetch('http://127.0.0.1:3000/api/integration', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'kandelker', action: 'gps', data: { lat: cleanLat, lng: cleanLng, label } }),
        }).catch(()=>{});
        // Intentar enviar también al backend Flask KANDELker si está activo
        try {
          await fetch('http://127.0.0.1:5000/log_data', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: cleanLat, longitude: cleanLng, label }),
          });
        } catch {}
        return NextResponse.json({ success: true, point: { lat: cleanLat, lng: cleanLng, label } });
      }
      case 'locate_ip': {
        try {
          const res = await fetch('http://ip-api.com/json/?fields=status,lat,lon,city,country,query', { signal: AbortSignal.timeout(8000) });
          const j = await res.json();
          if (j.status === 'success') {
            const label = `${j.city || ''} ${j.country || ''}`.trim() || j.query;
            await fetch('http://127.0.0.1:3000/api/integration', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: 'kandelker', action: 'gps', data: { lat: j.lat, lng: j.lon, label: `IP ${j.query} — ${label}` } }),
            }).catch(()=>{});
            return NextResponse.json({ success: true, lat: j.lat, lng: j.lon, label, query: j.query });
          }
        } catch {}
        return NextResponse.json({ error: 'No se pudo geolocalizar IP' }, { status: 500 });
      }
      case 'status': {
        return NextResponse.json({ success: true, backend: 'Flask :5000 POST /log_data', integration: '/api/integration POST gps', actions: ['track','locate_ip','status'] });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida. Use: track, locate_ip, status' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error KANDELker' }, { status: 500 });
  }
}
