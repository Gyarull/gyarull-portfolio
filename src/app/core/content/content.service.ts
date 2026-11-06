import { Injectable, computed, inject } from '@angular/core';

import { LangService } from '../i18n/lang.service';
import type { CaseStudy, Lang, Project } from './schema';

/** Frontmatter tal como llega del .md (ya validado en el build, sin defaults aplicados). */
type RawProject = Omit<Project, 'featured'> & { featured?: boolean };
type RawCaseStudy = Omit<CaseStudy, 'draft'> & { draft?: boolean };

export type ProjectEntry = Project & { slug: string };
export type CaseStudyEntry = CaseStudy & { slug: string };

/*
 * Contenido desde src/markdown/{colección}/{idioma}/<slug>.md, resuelto en el build por Vite:
 *
 * - `?analog-content-list=true` devuelve solo el frontmatter como JSON (la transformación de
 *   Analog parsea el YAML en el build). Las listas no cargan nada en el navegador.
 * - `?analog-content-file=true` devuelve el Markdown ya convertido a HTML (con el código
 *   coloreado por Shiki), precedido por su frontmatter. Se carga bajo demanda.
 *
 * Así no hace falta el runtime de @analogjs/content, que traía un parser de YAML y de Markdown
 * al bundle inicial (unos 230 KB).
 */
const PROJECTS = import.meta.glob<RawProject>('/src/markdown/projects/*/*.md', {
  query: { 'analog-content-list': 'true' },
  import: 'default',
  eager: true,
});
const CASE_STUDIES = import.meta.glob<RawCaseStudy>('/src/markdown/case-studies/*/*.md', {
  query: { 'analog-content-list': 'true' },
  import: 'default',
  eager: true,
});
const CASE_STUDY_BODIES = import.meta.glob<string>('/src/markdown/case-studies/*/*.md', {
  query: { 'analog-content-file': 'true' },
  import: 'default',
});

/** Entradas de un idioma, con el slug tomado del nombre de archivo. */
function entriesFor<T extends object>(
  files: Record<string, T>,
  lang: Lang,
): (T & { slug: string })[] {
  return Object.entries(files).flatMap(([path, attrs]) => {
    const [fileLang, file] = path.split('/').slice(-2);
    return fileLang === lang ? [{ ...attrs, slug: file.replace(/\.md$/, '') }] : [];
  });
}

/** Proyectos y casos de estudio del idioma actual. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly langService = inject(LangService);

  /** Proyectos del idioma actual, ordenados por `order`. */
  readonly projects = computed<ProjectEntry[]>(() =>
    entriesFor(PROJECTS, this.langService.lang())
      .map((p) => ({ ...p, featured: p.featured ?? false }))
      .sort((a, b) => a.order - b.order),
  );

  readonly featured = computed(() => this.projects().find((p) => p.featured) ?? null);
  readonly others = computed(() => this.projects().filter((p) => p !== this.featured()));

  /** Casos de estudio publicados del idioma actual, del más reciente al más antiguo. */
  readonly caseStudies = computed<CaseStudyEntry[]>(() =>
    entriesFor(CASE_STUDIES, this.langService.lang())
      .filter((c) => !c.draft)
      .map((c) => ({ ...c, draft: false }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  );

  /** HTML del cuerpo de un caso de estudio, o null si no existe. */
  async caseStudyHtml(lang: Lang, slug: string): Promise<string | null> {
    const load = CASE_STUDY_BODIES[`/src/markdown/case-studies/${lang}/${slug}.md`];
    if (!load) return null;
    const raw = await load();
    // El archivo llega como "---\n<frontmatter>\n---\n\n<html>": nos quedamos con el HTML.
    return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
  }
}
