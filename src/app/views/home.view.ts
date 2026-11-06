import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentService } from '../core/content/content.service';
import { CONTACT, PROFILE, STACK, TIMELINE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { caseStudyPath } from '../core/i18n/routes';

/**
 * Home (ES en "/" y EN en "/en").
 * FASE 3: listado mínimo para verificar el modelo de contenido; el diseño real llega en la fase 4.
 */
@Component({
  selector: 'app-home-view',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container py-5">
      <p class="eyebrow">{{ i18n.t().hero.eyebrow }}</p>
      <h1>{{ profile.name }}</h1>
      <p>{{ i18n.pick(profile.role) }} · {{ i18n.pick(profile.location) }}</p>
      <p>{{ i18n.pick(profile.tagline) }}</p>
      <p>
        <a [href]="i18n.alternateUrl()" [attr.hreflang]="i18n.other()">{{
          i18n.t().lang.switchTo
        }}</a>
      </p>

      <h2>{{ i18n.t().nav.projects }}</h2>
      <ul data-testid="projects">
        @for (p of content.projects(); track p.slug) {
          <li>
            <strong>{{ p.title }}</strong>
            @if (p.featured) {
              ({{ i18n.t().projects.featured }})
            }
            — {{ p.summary }}
            @if (p.caseStudy) {
              <a [routerLink]="caseStudyPath(i18n.lang(), p.caseStudy)">{{
                i18n.t().projects.caseStudy
              }}</a>
            }
          </li>
        }
      </ul>

      <h2>{{ i18n.t().caseStudy.eyebrow }}</h2>
      <ul data-testid="case-studies">
        @for (c of content.caseStudies(); track c.slug) {
          <li>
            <a [routerLink]="caseStudyPath(i18n.lang(), c.slug)">{{ c.title }}</a>
          </li>
        }
      </ul>

      <h2>{{ i18n.t().stack.title }}</h2>
      <p>
        {{ i18n.t().stack.production }}:
        @for (s of stack.production; track s.name) {
          {{ s.name }}{{ $last ? '' : ', ' }}
        }
      </p>

      <h2>{{ i18n.t().journey.title }}</h2>
      <ul>
        @for (e of timeline; track e.period + e.org) {
          <li>{{ e.period }} · {{ i18n.pick(e.role) }} · {{ e.org }}</li>
        }
      </ul>

      <h2>{{ i18n.t().contact.title }}</h2>
      <p>
        <a [href]="'mailto:' + contact.email">{{ contact.email }}</a> ·
        <a [href]="contact.linkedin">{{ i18n.t().contact.linkedin }}</a>
      </p>
    </main>
  `,
})
export class HomeView {
  protected readonly i18n = inject(LangService);
  protected readonly content = inject(ContentService);
  protected readonly profile = PROFILE;
  protected readonly contact = CONTACT;
  protected readonly stack = STACK;
  protected readonly timeline = TIMELINE;
  protected readonly caseStudyPath = caseStudyPath;
}
