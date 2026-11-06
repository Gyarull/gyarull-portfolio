import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownComponent } from '@analogjs/content';
import { contentFileResource } from '@analogjs/content/resources';
import { map } from 'rxjs';

import type { CaseStudy } from '../../content/schema';
import { ContentService } from '../core/content/content.service';
import { LangService } from '../core/i18n/lang.service';
import { homePath } from '../core/i18n/routes';

/**
 * Caso de estudio (ES en "/casos/:slug" y EN en "/en/case-studies/:slug").
 * FASE 3: render mínimo del Markdown; el diseño real llega en la fase 4.
 */
@Component({
  selector: 'app-case-study-view',
  imports: [MarkdownComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container py-5">
      <a [routerLink]="homePath(i18n.lang())">{{ i18n.t().caseStudy.back }}</a>
      @if (file.value(); as f) {
        <p class="eyebrow">{{ i18n.t().caseStudy.eyebrow }}</p>
        <h1>{{ meta()?.title }}</h1>
        <analog-markdown [content]="f.content" />
      }
    </main>
  `,
})
export class CaseStudyView {
  protected readonly i18n = inject(LangService);
  private readonly content = inject(ContentService);
  protected readonly homePath = homePath;

  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  protected readonly file = contentFileResource<CaseStudy>(
    computed(() => ({ customFilename: this.content.caseStudyFile(this.i18n.lang(), this.slug()) })),
  );

  protected readonly meta = computed(
    () => this.content.caseStudies().find((c) => c.slug === this.slug()) ?? null,
  );
}
