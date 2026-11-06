/**
 * Mide con Lighthouse el build estático (dist/analog/public), en mobile y desktop.
 *
 * Uso: npm run build && npm run lighthouse
 *      npm run lighthouse -- https://sitio.publicado  (mide la URL dada, sin servidor local)
 * Usa Chrome o, si no está, Edge (variable CHROME_PATH para elegir otro). Guarda un resumen en
 * docs/lighthouse/summary.md y los reportes HTML en docs/lighthouse/reports/ (no se commitean).
 * Sale con código 1 si alguna categoría queda debajo de 90.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const PORT = 4173;
const REMOTE = process.argv[2]?.replace(/\/+$/, '');
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const PAGES = ['/', '/en', '/casos/ambitrack', '/en/case-studies/portfolio'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;
const MIN = 90;

const browserCandidates = [
  process.env['CHROME_PATH'],
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter((p): p is string => !!p && existsSync(p));

if (!browserCandidates.length) {
  console.error('No encontré Chrome ni Edge. Definí CHROME_PATH.');
  process.exit(1);
}

const server = REMOTE
  ? null
  : spawn(
      process.execPath,
      [
        join(root, 'node_modules', 'serve', 'build', 'main.js'),
        '-l',
        String(PORT),
        '-n',
        'dist/analog/public',
      ],
      { cwd: root, stdio: 'ignore' },
    );
if (server) await new Promise((r) => setTimeout(r, 1500));

const chrome = await chromeLauncher.launch({
  chromePath: browserCandidates[0],
  chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions'],
});

const reportsDir = join(root, 'docs', 'lighthouse', 'reports');
mkdirSync(reportsDir, { recursive: true });

const rows: string[] = [];
let failed = false;

try {
  for (const device of ['mobile', 'desktop'] as const) {
    for (const page of PAGES) {
      const result = await lighthouse(
        `${BASE}${page}`,
        { port: chrome.port, output: 'html', onlyCategories: [...CATEGORIES], logLevel: 'error' },
        device === 'desktop' ? desktopConfig : undefined,
      );
      if (!result) throw new Error(`Sin resultado para ${page}`);
      const { lhr, report } = result;
      const scores = CATEGORIES.map((c) => Math.round((lhr.categories[c]?.score ?? 0) * 100));
      if (scores.some((s) => s < MIN)) failed = true;

      const lcp = lhr.audits['largest-contentful-paint']?.displayValue ?? '-';
      const tbt = lhr.audits['total-blocking-time']?.displayValue ?? '-';
      const cls = lhr.audits['cumulative-layout-shift']?.displayValue ?? '-';
      rows.push(`| ${device} | \`${page}\` | ${scores.join(' | ')} | ${lcp} | ${tbt} | ${cls} |`);
      console.log(
        `${device.padEnd(7)} ${page.padEnd(28)} ${scores.join(' / ')}  LCP ${lcp}  TBT ${tbt}  CLS ${cls}`,
      );

      const name = `${device}-${page.replace(/\//g, '_') || 'root'}.html`;
      writeFileSync(join(reportsDir, name), Array.isArray(report) ? report[0] : report);
    }
  }
} finally {
  await chrome.kill();
  server?.kill();
}

const summary = `# Lighthouse

Medido con \`npm run lighthouse\` sobre el build estático local (${new Date().toISOString().slice(0, 10)}).
Orden de puntajes: Performance · Accessibility · Best Practices · SEO.

| Dispositivo | Página | Perf. | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync(join(root, 'docs', 'lighthouse', 'summary.md'), summary);
process.exit(failed ? 1 : 0);
