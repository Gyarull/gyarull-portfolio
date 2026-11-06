import { Injectable, computed, inject } from '@angular/core';
import { injectContentFiles } from '@analogjs/content';

import type { CaseStudy, Lang, Project } from '../../../content/schema';
import { LangService } from '../i18n/lang.service';

/** Frontmatter tal como llega del .md (ya validado en el build, sin defaults aplicados). */
type RawProject = Omit<Project, 'featured'> & { featured?: boolean };
type RawCaseStudy = Omit<CaseStudy, 'draft'> & { draft?: boolean };

export type ProjectEntry = Project & { slug: string };
export type CaseStudyEntry = CaseStudy & { slug: string };

const inCollection = (lang: Lang, collection: string) => (filename: string) =>
  filename.includes(`/content/${collection}/${lang}/`);

/**
 * Proyectos y casos de estudio desde src/content/{colección}/{idioma}/*.md.
 * Las listas se resuelven en el build (sin pedidos de red) y siguen el idioma actual.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly langService = inject(LangService);

  private readonly projectFiles = injectContentFiles<RawProject>((f) =>
    f.filename.includes('/projects/'),
  );
  private readonly caseStudyFiles = injectContentFiles<RawCaseStudy>((f) =>
    f.filename.includes('/case-studies/'),
  );

  /** Proyectos del idioma actual, ordenados por `order`. */
  readonly projects = computed<ProjectEntry[]>(() => {
    const match = inCollection(this.langService.lang(), 'projects');
    return this.projectFiles
      .filter((f) => match(f.filename))
      .map((f) => ({ ...f.attributes, featured: f.attributes.featured ?? false, slug: f.slug }))
      .sort((a, b) => a.order - b.order);
  });

  readonly featured = computed(() => this.projects().find((p) => p.featured) ?? null);
  readonly others = computed(() => this.projects().filter((p) => p !== this.featured()));

  /** Casos de estudio publicados del idioma actual, del más reciente al más antiguo. */
  readonly caseStudies = computed<CaseStudyEntry[]>(() => {
    const match = inCollection(this.langService.lang(), 'case-studies');
    return this.caseStudyFiles
      .filter((f) => match(f.filename) && !f.attributes.draft)
      .map((f) => ({ ...f.attributes, draft: false, slug: f.slug }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  /** Ruta del archivo para cargar el cuerpo de un caso de estudio. */
  caseStudyFile(lang: Lang, slug: string): string {
    return `case-studies/${lang}/${slug}`;
  }
}
