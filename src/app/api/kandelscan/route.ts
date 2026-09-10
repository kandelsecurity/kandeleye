// src/app/api/kandelscan/route.ts
// Route que invoca KANDELscan (Nuclei) para escanear vulnerabilidades
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const KANDELSCAN_PATH = '/home/nelson/Escritorio/proyectos/KANDEL/KANDELscan';
const NUCLEI_PATH = `${KANDELSCAN_PATH}/engine/nuclei`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target } = body;

    if (!target) {
      return NextResponse.json({ error: 'Se requiere un objetivo (target)' }, { status: 400 });
    }

    const cmd = `${NUCLEI_PATH} -u ${target} -rl 50 -c 20 -timeout 5 -json 2>&1`;

    exec(cmd, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return NextResponse.json({ error: `Error en escaneo: ${stderr || error.message}`, target }, { status: 500 });
      }
      try {
        const results = stdout ? JSON.parse(stdout) : [];
        const vulnerabilities = results.map((r: any) => ({
          target,
          severity: r.severity || 'info',
          cve: r.cve || r.template_id || '',
          port: r.port || 0,
          service: r.host || target,
          matched_at: r.matched_at || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, target, vulnerabilities, count: vulnerabilities.length });
      } catch {
        return NextResponse.json({ success: true, target, raw: stdout.substring(0, 5000), count: 0 });
      }
    });

    return NextResponse.json({ success: true, message: `Escaneo iniciado en ${target}` });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar petición de escaneo' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  if (status === 'tools') {
    return NextResponse.json({
      nuclei: NUCLEI_PATH,
      exists: true,
      templates: `${KANDELSCAN_PATH}/plantillas/nuclei-templates/`,
      version: 'v3.10.0',
    });
  }
  return NextResponse.json({ error: 'Use POST para ejecutar escaneo' }, { status: 400 });
}
