/**
 * Verifica en un navegador real (Chrome o Edge headless) el comportamiento de las animaciones
 * sobre el build estático, con y sin prefers-reduced-motion:
 *
 * - Con movimiento reducido: Motion no se descarga, el ecualizador y el pentagrama quedan
 *   quietos y todo el contenido es visible después de recorrer la página.
 * - Sin reducción: Motion se carga y el contenido igual termina visible.
 *
 * Uso: npm run build && npm run check:motion  (sale con código 1 si algo falla)
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const PORT = 4174;
const executablePath = [
  process.env['CHROME_PATH'],
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p): p is string => !!p && existsSync(p));
if (!executablePath) throw new Error('No encontré Chrome ni Edge. Definí CHROME_PATH.');

const server = spawn(
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
await new Promise((r) => setTimeout(r, 1500));
const browser = await puppeteer.launch({ executablePath, headless: true });

interface Report {
  motionLoaded: boolean;
  eqAnimation: string;
  staffAnimation: string;
  hiddenAfterScroll: string[];
}

async function inspect(reduced: boolean): Promise<Report> {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ]);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  // Recorre la página de a tramos, como un usuario, y vuelve arriba.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  const result = await page.evaluate(() => {
    const anim = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).animationName : 'no encontrado';
    };
    const hidden = [...document.querySelectorAll('main *')]
      .filter((el) => getComputedStyle(el).opacity === '0' && el.getBoundingClientRect().height > 0)
      .map((el) => el.tagName.toLowerCase() + (el.className ? `.${el.className}` : ''));
    return {
      eqAnimation: anim('app-launch-button .eq i'),
      staffAnimation: anim('.staff line'),
      hiddenAfterScroll: hidden,
    };
  });
  await page.close();
  return { ...result, motionLoaded: requests.some((u) => u.includes('motion-lite')) };
}

let failed = false;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${label}`);
  if (!ok) failed = true;
};

try {
  const reduced = await inspect(true);
  check(!reduced.motionLoaded, 'reduced-motion: Motion no se descarga');
  check(
    reduced.eqAnimation === 'none',
    `reduced-motion: ecualizador quieto (${reduced.eqAnimation})`,
  );
  check(
    reduced.staffAnimation === 'none',
    `reduced-motion: pentagrama quieto (${reduced.staffAnimation})`,
  );
  check(
    reduced.hiddenAfterScroll.length === 0,
    `reduced-motion: todo visible (${reduced.hiddenAfterScroll.join(', ') || 'nada oculto'})`,
  );

  const normal = await inspect(false);
  check(normal.motionLoaded, 'normal: Motion se carga bajo demanda');
  check(normal.eqAnimation !== 'none', `normal: ecualizador animado (${normal.eqAnimation})`);
  check(
    normal.hiddenAfterScroll.length === 0,
    `normal: todo visible tras recorrer (${normal.hiddenAfterScroll.join(', ') || 'nada oculto'})`,
  );
} finally {
  await browser.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
