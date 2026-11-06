/**
 * Ajustes al build estático (dist/analog/public), después del prerender:
 * - /404/index.html → /404.html, que Cloudflare Pages sirve con estado 404 para rutas inexistentes.
 * - Quita /404 del sitemap.
 * - Genera robots.txt con la URL del sitio (src/data/site.json).
 */
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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

console.log('Postbuild: 404.html, sitemap y robots.txt listos.');
