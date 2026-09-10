// src/app/api/integration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { integrationAggregator } from '@/lib/integration/aggregator';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  switch (type) {
    case 'vulnerabilities':
      return NextResponse.json(integrationAggregator.getVulnerabilities());
    case 'wifi':
      return NextResponse.json(integrationAggregator.getWiFiNetworks());
    case 'devices':
      return NextResponse.json(integrationAggregator.getNetworkDevices());
    case 'gps':
      return NextResponse.json(integrationAggregator.getGPSPoints());
    case 'summary':
      return NextResponse.json(integrationAggregator.getSummary());
    case 'all':
    default:
      return NextResponse.json(integrationAggregator.getState());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, action, data } = body;

    switch (source) {
      case 'kandelscan':
        if (action === 'vulnerability') {
          const vuln = integrationAggregator.addVulnerability(data);
          return NextResponse.json({ success: true, point: vuln });
        }
        break;
      case 'kandelcrack':
        if (action === 'network') {
          const net = integrationAggregator.addWiFiNetwork(data);
          return NextResponse.json({ success: true, network: net });
        }
        break;
      case 'kandellimiter':
        if (action === 'device') {
          const dev = integrationAggregator.addNetworkDevice(data);
          return NextResponse.json({ success: true, device: dev });
        }
        break;
      case 'kandelker':
        if (action === 'gps') {
          const gps = integrationAggregator.addGPSPoint(data);
          return NextResponse.json({ success: true, point: gps });
        }
        break;
      case 'audit':
        if (action === 'start') {
          integrationAggregator.clearAll();
          return NextResponse.json({ success: true, message: 'Auditoría iniciada' });
        }
        if (action === 'complete') {
          const summary = integrationAggregator.getSummary();
          return NextResponse.json({ success: true, summary });
        }
        break;
      default:
        return NextResponse.json({ error: 'Fuente o acción no reconocida' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar datos' }, { status: 500 });
  }
}
