/**
 * Ajustes al build estático (dist/analog/public), después del prerender:
 * - /404/index.html → /404.html, que Cloudflare Pages sirve con estado 404 para rutas inexistentes.
 * - Quita /404 del sitemap.
 * - Genera robots.txt con la URL del sitio (src/data/site.json).
 * - Precarga en cada página las fuentes del primer pintado (Newsreader y Geist, alfabeto latino),
 *   para que el título no espere al CSS y no haya salto de texto al cambiar de fuente.
 */
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const out = join(root, 'dist', 'analog', 'public');
const { url } = JSON.parse(readFileSync(join(root, 'src', 'data', 'site.json'), 'utf8')) as {
  url: string;
};

const notFoundDir = join(out, '404');
if (existsSync(join(notFoundDir, 'index.html'))) {
  renameSync(join(notFoundDir, 'index.html'), join(out, '404.html'));
  rmSync(notFoundDir, { recursive: true, force: true });
}

const sitemap = join(out, 'sitemap.xml');
if (existsSync(sitemap)) {
  const xml = readFileSync(sitemap, 'utf8').replace(
    /<url>(?:(?!<\/url>).)*?\/404<\/loc>.*?<\/url>/gs,
    '',
  );
  writeFileSync(sitemap, xml);
}

writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);

const PRELOAD_FONTS = [
  /^newsreader-latin-wght-normal-.*\.woff2$/,
  /^geist-latin-wght-normal-.*\.woff2$/,
];
const assets = readdirSync(join(out, 'assets'));
const fonts = PRELOAD_FONTS.map((re) => assets.find((f) => re.test(f)));
if (fonts.some((f) => !f)) throw new Error('Postbuild: no encontré las fuentes a precargar');
const preload = fonts
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('');

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? htmlFiles(join(dir, e.name))
      : e.name.endsWith('.html')
        ? [join(dir, e.name)]
        : [],
  );
for (const file of htmlFiles(out)) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('rel="preload" href="/assets/newsreader')) continue;
  writeFileSync(file, html.replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1${preload}`));
}

console.log('Postbuild: 404.html, sitemap, robots.txt y precarga de fuentes listos.');
