import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProjectEntry } from '../core/content/content.service';
import { LangService } from '../core/i18n/lang.service';
import { caseStudyPath } from '../core/i18n/routes';
import { Icon } from '../ui/icon';
import { LaunchButton } from '../ui/launch-button';
import { TagList } from '../ui/tag-list';

@Component({
  selector: 'app-featured-project',
  imports: [RouterLink, Icon, LaunchButton, TagList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = project();
    <article class="featured" aria-labelledby="featured-title">
      <p class="eyebrow">{{ i18n.t().projects.featured }}</p>
      <h3 id="featured-title">{{ p.title }}</h3>
      <p class="summary">{{ p.summary }}</p>
      <app-tag-list [tags]="p.stack" [label]="i18n.t().projects.stack" />

      <div class="actions">
        @if (p.demo) {
          <app-launch-button [url]="p.demo" [title]="p.title" />
        }
        @if (p.caseStudy) {
          <a class="btn-ghost" [routerLink]="caseStudyPath(i18n.lang(), p.caseStudy)">
            {{ i18n.t().projects.caseStudy }}
          </a>
        }
        @if (p.repo) {
          <a class="link-arrow" [href]="p.repo">
            {{ i18n.t().projects.repo }} <app-icon name="arrowUpRight" />
          </a>
        }
        @if (p.video) {
          <a class="link-arrow" [href]="p.video">
            {{ i18n.t().projects.video }} <app-icon name="arrowUpRight" />
          </a>
        }
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .featured {
      padding: var(--space-l);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }
    h3 {
      font-size: var(--step-4);
      margin-block: var(--space-2xs) var(--space-s);
    }
    .summary {
      max-width: var(--measure);
      font-size: var(--step-1);
      line-height: var(--leading-body);
      margin-block-end: var(--space-m);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-s) var(--space-m);
      margin-block-start: var(--space-l);
    }
  `,
})
export class FeaturedProject {
  protected readonly i18n = inject(LangService);
  readonly project = input.required<ProjectEntry>();
  protected readonly caseStudyPath = caseStudyPath;
}
