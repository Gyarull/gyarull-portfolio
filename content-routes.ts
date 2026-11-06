/**
 * Rutas a prerenderizar, armadas a partir del contenido: home en cada idioma y un caso de
 * estudio por cada .md publicado (sin `draft: true`). Agregar un .md no requiere tocar nada más.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import frontMatter from 'front-matter';

const LANG_PREFIX = { es: '/casos', en: '/en/case-studies' } as const;

export function contentRoutes(root: string): string[] {
  const routes = ['/', '/en', '/404'];
  for (const [lang, prefix] of Object.entries(LANG_PREFIX)) {
    const dir = join(root, 'src', 'markdown', 'case-studies', lang);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const { attributes } = frontMatter<{ draft?: boolean }>(
        readFileSync(join(dir, file), 'utf8'),
      );
      if (!attributes.draft) routes.push(`${prefix}/${file.replace(/\.md$/, '')}`);
    }
  }
  return routes;
}
