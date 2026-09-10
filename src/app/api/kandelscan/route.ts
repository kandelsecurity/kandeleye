// src/app/api/kandelscan/route.ts — KANDELscan (Nuclei) 100% funcional con entrada arbitraria
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const KANDELSCAN_PATH = '/home/nelson/Escritorio/proyectos/KANDEL/Aplicaciones_Escritorio/KANDELscan';
const NUCLEI_PATH = `${KANDELSCAN_PATH}/engine/nuclei`;
const TEMPLATES_KANDEL = `${KANDELSCAN_PATH}/plantillas/kandel`;
const TEMPLATES_NUCLEI = `${KANDELSCAN_PATH}/plantillas/nuclei-templates`;

function sanitizeTarget(t: string): string {
  // Permitir dominio, IP, URL con esquema opcional; bloquear inyección shell
  const trimmed = t.trim().slice(0, 256);
  if (!trimmed) throw new Error('Objetivo vacío');
  // Rechazar caracteres peligrosos de shell
  if (/[;`$|&><\n\r]/.test(trimmed)) throw new Error('Caracteres no permitidos en objetivo');
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, mode = 'kandel', severity = 'low' } = body;
    if (!target) return NextResponse.json({ error: 'Se requiere objetivo (dominio o IP)' }, { status: 400 });
    let cleanTarget: string;
    try { cleanTarget = sanitizeTarget(String(target)); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }

    // Construir comando nuclei según modo
    const escTarget = cleanTarget.replace(/"/g, '\\"');
    let cmd: string;
    if (mode === 'kandel') {
      // Plantillas propias KANDEL (3 plantillas) + severidad mínima
      cmd = `"${NUCLEI_PATH}" -u "${escTarget}" -t "${TEMPLATES_KANDEL}" -es info -rl 50 -c 20 -timeout 5 -jsonl 2>&1`;
    } else if (mode === 'full') {
      cmd = `"${NUCLEI_PATH}" -u "${escTarget}" -t "${TEMPLATES_NUCLEI}" -es ${severity} -rl 50 -c 20 -timeout 5 -jsonl 2>&1`;
    } else {
      // Vuln/CVE only
      cmd = `"${NUCLEI_PATH}" -u "${escTarget}" -t "${TEMPLATES_NUCLEI}/http/cves/" -es low -rl 50 -c 20 -timeout 5 -jsonl 2>&1`;
    }

    const { stdout } = await execAsync(cmd, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });
    const lines = stdout.split('\n').filter(l => l.trim().startsWith('{'));
    const vulnerabilities = lines.map(line => {
      try {
        const r = JSON.parse(line);
        const info = r.info || {};
        return {
          target: cleanTarget,
          template: r['template-id'] || r.templateID || info.name || 'unknown',
          name: info.name || r['template-id'] || 'unknown',
          severity: info.severity || 'info',
          cve: (info.classification && info.classification['cve-id']) || info['cve-id'] || r['template-id'] || '',
          host: r.host || cleanTarget,
          matched_at: r['matched-at'] || r.matched_at || new Date().toISOString(),
          description: info.description || '',
          url: r.host || r.matched_at || cleanTarget,
        };
      } catch { return null; }
    }).filter(Boolean);

    return NextResponse.json({ success: true, target: cleanTarget, mode, vulnerabilities, count: vulnerabilities.length, rawLines: lines.length });
  } catch (error: any) {
    // nuclei puede salir con código no-cero si no hay hallazgos; stdout aun contiene JSONL
    const out = error.stdout || '';
    if (out) {
      const lines = String(out).split('\n').filter((l: string) => l.trim().startsWith('{'));
      if (lines.length > 0) {
        const vulnerabilities = lines.map((line: string) => {
          try { const r = JSON.parse(line); const info = r.info || {}; return { target: String(error.target || 'unknown'), template: r['template-id'] || '', name: info.name || '', severity: info.severity || 'info', host: r.host || '' }; } catch { return null; }
        }).filter(Boolean);
        return NextResponse.json({ success: true, vulnerabilities, count: vulnerabilities.length });
      }
    }
    return NextResponse.json({ error: error.message || 'Error en escaneo', detail: String(error.stderr || '').slice(0, 500) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('status') === 'tools') {
    return NextResponse.json({ nuclei: NUCLEI_PATH, templates_kandel: TEMPLATES_KANDEL, templates_nuclei: TEMPLATES_NUCLEI, version: 'v3.10.0', modes: ['kandel','full','cves'] });
  }
  return NextResponse.json({ uso: 'POST {"target":"example.com","mode":"kandel|full|cves"}' });
}
