import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProjectEntry } from '../core/content/content.service';
import { LangService } from '../core/i18n/lang.service';
import { caseStudyPath } from '../core/i18n/routes';
import { Icon } from '../ui/icon';
import { TagList } from '../ui/tag-list';

/** Tarjeta de la grilla "Otros proyectos". */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Icon, TagList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = project();
    <article class="card">
      <h3>{{ p.title }}</h3>
      <p>{{ p.summary }}</p>
      <app-tag-list [tags]="p.stack" [label]="i18n.t().projects.stack" />
      <div class="links">
        @if (p.caseStudy) {
          <a [routerLink]="caseStudyPath(i18n.lang(), p.caseStudy)">{{
            i18n.t().projects.caseStudy
          }}</a>
        }
        @if (p.demo) {
          <a class="link-arrow" [href]="p.demo" target="_blank" rel="noopener">
            {{ i18n.t().projects.demo }} <app-icon name="arrowUpRight" />
            <span class="visually-hidden">{{ i18n.t().projects.opensNewTab }}</span>
          </a>
        }
        @if (p.repo) {
          <a class="link-arrow" [href]="p.repo">
            {{ i18n.t().projects.repo }} <app-icon name="arrowUpRight" />
          </a>
        }
      </div>
    </article>
  `,
  styles: `
    .card {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-s);
      padding: var(--space-m);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }
    h3,
    p {
      margin: 0;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-s);
      margin-block-start: auto;
    }
  `,
})
export class ProjectCard {
  protected readonly i18n = inject(LangService);
  readonly project = input.required<ProjectEntry>();
  protected readonly caseStudyPath = caseStudyPath;
}
