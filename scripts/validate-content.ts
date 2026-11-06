/**
 * Valida el contenido y los datos del sitio antes del build.
 *
 * - Frontmatter de cada .md contra su esquema (src/content/schema.ts).
 * - Cada proyecto y caso de estudio existe en todos los idiomas, con el mismo nombre de archivo.
 * - Las referencias entre proyectos y casos de estudio apuntan a archivos existentes.
 * - Los JSON de src/data cumplen su esquema.
 * - Los diccionarios de interfaz (src/i18n) tienen las mismas claves en todos los idiomas.
 * - No hay números de teléfono publicados.
 *
 * Uso: node scripts/validate-content.ts  (sale con código 1 si hay errores)
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import frontMatter from 'front-matter';
import type { ZodType } from 'zod';

import {
  LANGS,
  caseStudySchema,
  contactSchema,
  profileSchema,
  projectSchema,
  stackSchema,
  timelineSchema,
} from '../src/content/schema.ts';

const COLLECTIONS = {
  projects: projectSchema,
  'case-studies': caseStudySchema,
} as const;
type Collection = keyof typeof COLLECTIONS;

const DATA_FILES: Record<string, ZodType> = {
  'profile.json': profileSchema,
  'contact.json': contactSchema,
  'stack.json': stackSchema,
  'timeline.json': timelineSchema,
};

// Un teléfono: "+" y al menos 8 dígitos, con espacios o guiones opcionales.
const PHONE = /\+\d[\d\s-]{7,}\d/;

export function validateContent(root: string): string[] {
  const errors: string[] = [];
  const rel = (path: string) => relative(root, path).replaceAll('\\', '/');
  const contentDir = join(root, 'src', 'content');
  const slugs = {} as Record<Collection, Record<string, Set<string>>>;
  const attrs = {} as Record<Collection, Map<string, Record<string, unknown>>>;

  for (const collection of Object.keys(COLLECTIONS) as Collection[]) {
    slugs[collection] = {};
    attrs[collection] = new Map();

    for (const lang of LANGS) {
      const dir = join(contentDir, collection, lang);
      const found = new Set<string>();
      slugs[collection][lang] = found;
      if (!existsSync(dir)) continue;

      for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
        const path = join(dir, file);
        const slug = file.replace(/\.md$/, '');
        found.add(slug);

        if (!/^[a-z0-9-]+$/.test(slug)) {
          errors.push(
            `${rel(path)}: el nombre de archivo solo admite minúsculas, números y guiones`,
          );
        }

        const raw = readFileSync(path, 'utf8');
        let parsed: { attributes: unknown; body: string };
        try {
          parsed = frontMatter(raw);
        } catch (e) {
          errors.push(`${rel(path)}: frontmatter inválido (${(e as Error).message})`);
          continue;
        }

        const result = COLLECTIONS[collection].safeParse(parsed.attributes);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors.push(`${rel(path)}: ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
          }
        } else {
          attrs[collection].set(`${collection}/${lang}/${slug}`, result.data);
        }

        if (PHONE.test(raw)) errors.push(`${rel(path)}: contiene un número de teléfono`);
      }
    }

    // Paridad de idiomas
    const all = new Set(LANGS.flatMap((lang) => [...slugs[collection][lang]]));
    for (const slug of all) {
      for (const lang of LANGS) {
        if (!slugs[collection][lang].has(slug)) {
          errors.push(`src/content/${collection}/${lang}/${slug}.md: falta la traducción`);
        }
      }
    }
  }

  // Referencias cruzadas
  for (const [key, data] of attrs.projects) {
    const lang = key.split('/')[1];
    const ref = data['caseStudy'];
    if (typeof ref === 'string' && !slugs['case-studies'][lang]?.has(ref)) {
      errors.push(`src/content/${key}.md: caseStudy "${ref}" no existe en case-studies/${lang}`);
    }
  }
  for (const [key, data] of attrs['case-studies']) {
    const lang = key.split('/')[1];
    const ref = data['project'];
    if (typeof ref === 'string' && !slugs.projects[lang]?.has(ref)) {
      errors.push(`src/content/${key}.md: project "${ref}" no existe en projects/${lang}`);
    }
  }

  // Datos JSON
  const dataDir = join(root, 'src', 'data');
  for (const [file, schema] of Object.entries(DATA_FILES)) {
    const path = join(dataDir, file);
    if (!existsSync(path)) {
      errors.push(`${rel(path)}: no existe`);
      continue;
    }
    const raw = readFileSync(path, 'utf8');
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      errors.push(`${rel(path)}: JSON inválido (${(e as Error).message})`);
      continue;
    }
    const result = schema.safeParse(json);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${rel(path)}: ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
      }
    }
    if (PHONE.test(raw)) errors.push(`${rel(path)}: contiene un número de teléfono`);
  }

  // Diccionarios de interfaz
  const i18nDir = join(root, 'src', 'i18n');
  const keysOf = (value: unknown, prefix = ''): string[] =>
    value && typeof value === 'object'
      ? Object.entries(value).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k))
      : [prefix];
  const dictKeys = new Map<string, Set<string>>();
  for (const lang of LANGS) {
    const path = join(i18nDir, `${lang}.json`);
    if (!existsSync(path)) {
      errors.push(`${rel(path)}: no existe`);
      continue;
    }
    try {
      dictKeys.set(lang, new Set(keysOf(JSON.parse(readFileSync(path, 'utf8')))));
    } catch (e) {
      errors.push(`${rel(path)}: JSON inválido (${(e as Error).message})`);
    }
  }
  const allKeys = new Set([...dictKeys.values()].flatMap((s) => [...s]));
  for (const [lang, keys] of dictKeys) {
    for (const key of allKeys) {
      if (!keys.has(key)) errors.push(`src/i18n/${lang}.json: falta la clave "${key}"`);
    }
  }

  return errors;
}

// Ejecución directa por línea de comandos
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(fileURLToPath(import.meta.url), '..', '..');
  const errors = validateContent(root);
  if (errors.length) {
    console.error(`Contenido inválido (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('Contenido válido.');
}
