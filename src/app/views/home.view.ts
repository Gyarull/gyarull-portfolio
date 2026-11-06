import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { ContentService } from '../core/content/content.service';
import { PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { homePath } from '../core/i18n/routes';
import { SeoService } from '../core/seo/seo.service';
import { ContactSection } from '../sections/contact-section';
import { FeaturedProject } from '../sections/featured-project';
import { Hero } from '../sections/hero';
import { JourneySection } from '../sections/journey-section';
import { ProjectCard } from '../sections/project-card';
import { StackSection } from '../sections/stack-section';
import { RevealDirective } from '../ui/reveal.directive';

/** Home: ES en "/" y EN en "/en". */
@Component({
  selector: 'app-home-view',
  imports: [
    Hero,
    FeaturedProject,
    ProjectCard,
    StackSection,
    JourneySection,
    ContactSection,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-hero />

      <section id="projects" class="section container" aria-labelledby="projects-title">
        <header class="section-head" appReveal>
          <h2 id="projects-title">{{ i18n.t().nav.projects }}</h2>
        </header>
        @if (content.featured(); as featured) {
          <app-featured-project [project]="featured" appReveal [appRevealDelay]="0.1" />
        }
        @if (content.others().length) {
          <h3 class="others-title">{{ i18n.t().projects.others }}</h3>
          <ul class="grid">
            @for (p of content.others(); track p.slug) {
              <li appReveal [appRevealDelay]="$index * 0.08"><app-project-card [project]="p" /></li>
            }
          </ul>
        }
      </section>

      <section id="stack" class="section container" aria-labelledby="stack-title">
        <header class="section-head" appReveal>
          <h2 id="stack-title">{{ i18n.t().stack.title }}</h2>
        </header>
        <app-stack-section appReveal [appRevealDelay]="0.1" />
      </section>

      <section id="journey" class="section container" aria-labelledby="journey-title">
        <header class="section-head" appReveal>
          <h2 id="journey-title">{{ i18n.t().journey.title }}</h2>
        </header>
        <app-journey-section />
      </section>

      <section id="contact" class="section container" aria-labelledby="contact-title">
        <header class="section-head" appReveal>
          <h2 id="contact-title">{{ i18n.t().contact.title }}</h2>
        </header>
        <app-contact-section appReveal [appRevealDelay]="0.1" />
      </section>
    </main>
  `,
  styles: `
    .others-title {
      margin-block: var(--space-xl) var(--space-m);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      gap: var(--space-m);
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class HomeView {
  protected readonly i18n = inject(LangService);
  protected readonly content = inject(ContentService);

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const lang = this.i18n.lang();
      seo.update({
        title: `${PROFILE.name} · ${this.i18n.pick(PROFILE.role)}`,
        description: this.i18n.t().meta.siteDescription,
        path: homePath(lang),
        alternatePath: homePath(this.i18n.other()),
      });
    });
  }
}
