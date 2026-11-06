/**
 * Genera las imágenes de Open Graph (1200×630) por idioma en public/og/default-{lang}.png,
 * con los datos de src/data/profile.json y los colores del tema oscuro.
 *
 * No corre en el build: se ejecuta a mano (`npm run og`) cuando cambia el perfil, y las
 * imágenes se commitean. Usa fuentes del sistema (serif y monoespaciada).
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const profile = JSON.parse(readFileSync(join(root, 'src', 'data', 'profile.json'), 'utf8')) as {
  name: string;
  role: Record<string, string>;
  location: Record<string, string>;
};

const C = {
  bg: '#111316',
  text: '#ecebe6',
  muted: '#a3a6ad',
  accent: '#6cc6d3',
  border: '#2f343a',
};

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function svg(lang: 'es' | 'en'): string {
  const bars = [0.45, 0.85, 0.6, 1, 0.7, 0.35, 0.55]
    .map((h, i) => {
      const height = Math.round(h * 120);
      return `<rect x="${980 + i * 22}" y="${510 - height}" width="12" height="${height}" rx="3" fill="${C.accent}" opacity="${0.35 + h * 0.6}"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <rect x="80" y="80" width="64" height="4" fill="${C.accent}"/>
  <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="${C.text}">${escape(profile.name)}</text>
  <text x="80" y="380" font-family="Consolas, 'Courier New', monospace" font-size="34" fill="${C.muted}">${escape(profile.role[lang])}</text>
  <text x="80" y="520" font-family="Consolas, 'Courier New', monospace" font-size="26" fill="${C.muted}">${escape(profile.location[lang])}</text>
  ${bars}
  <rect x="0" y="626" width="1200" height="4" fill="${C.border}"/>
</svg>`;
}

const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

for (const lang of ['es', 'en'] as const) {
  const file = join(outDir, `default-${lang}.png`);
  await sharp(Buffer.from(svg(lang)))
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`OG: ${file}`);
}
