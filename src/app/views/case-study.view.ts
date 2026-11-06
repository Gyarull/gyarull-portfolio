import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownComponent } from '@analogjs/content';
import { contentFileResource } from '@analogjs/content/resources';
import { map } from 'rxjs';

import type { CaseStudy } from '../../content/schema';
import { ContentService } from '../core/content/content.service';
import { PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { caseStudyPath, homePath } from '../core/i18n/routes';
import { SeoService } from '../core/seo/seo.service';
import { Icon } from '../ui/icon';
import { LaunchButton } from '../ui/launch-button';
import { TagList } from '../ui/tag-list';

/** Caso de estudio: ES en "/casos/:slug" y EN en "/en/case-studies/:slug". */
@Component({
  selector: 'app-case-study-view',
  imports: [MarkdownComponent, RouterLink, Icon, LaunchButton, TagList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container">
      <article class="case-study">
        <a class="back link-arrow" [routerLink]="homePath(i18n.lang())">
          <app-icon name="arrowLeft" /> {{ i18n.t().caseStudy.back }}
        </a>

        @if (meta(); as m) {
          <header class="head">
            <p class="eyebrow">{{ i18n.t().caseStudy.eyebrow }}</p>
            <h1>{{ m.title }}</h1>
            <p class="summary">{{ m.summary }}</p>
            <p class="date">
              <time [attr.datetime]="m.date">{{
                i18n.format(i18n.t().caseStudy.published, { date: i18n.date(m.date) })
              }}</time>
            </p>
          </header>

          @if (project(); as p) {
            <aside class="project" [attr.aria-label]="i18n.t().caseStudy.project">
              <p class="eyebrow">{{ i18n.t().caseStudy.project }}</p>
              <p class="project-title">{{ p.title }}</p>
              <app-tag-list [tags]="p.stack" [label]="i18n.t().projects.stack" />
              @if (p.demo) {
                <app-launch-button [url]="p.demo" [title]="p.title" />
              }
            </aside>
          }
        }

        @if (file.value(); as f) {
          <analog-markdown class="prose" [content]="f.content" />
        }
      </article>
    </main>
  `,
  styles: `
    .case-study {
      padding-block: var(--space-l) var(--space-xl);
    }
    .back {
      font-size: var(--step--1);
    }
    .head {
      max-width: 48rem;
      margin-block: var(--space-xl) var(--space-l);
    }
    h1 {
      font-size: var(--step-5);
    }
    .summary {
      font-family: var(--font-display);
      font-size: var(--step-2);
      line-height: var(--leading-snug);
      color: var(--color-text-muted);
    }
    .date {
      font-size: var(--step--1);
      color: var(--color-text-muted);
    }
    .project {
      display: grid;
      gap: var(--space-s);
      justify-items: start;
      max-width: 48rem;
      padding: var(--space-m);
      margin-block-end: var(--space-xl);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }
    .project .eyebrow,
    .project-title {
      margin: 0;
    }
    .project-title {
      font-family: var(--font-display);
      font-size: var(--step-2);
    }
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

  protected readonly project = computed(() => {
    const ref = this.meta()?.project;
    return ref ? (this.content.projects().find((p) => p.slug === ref) ?? null) : null;
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const m = this.meta();
      const slug = this.slug();
      if (!m || !slug) return;
      seo.update({
        title: `${m.title} · ${PROFILE.name}`,
        description: m.summary,
        path: caseStudyPath(this.i18n.lang(), slug),
        alternatePath: caseStudyPath(this.i18n.other(), slug),
        type: 'article',
      });
    });
  }
}
