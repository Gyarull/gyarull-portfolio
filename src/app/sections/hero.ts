import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CONTACT, PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { Icon } from '../ui/icon';

@Component({
  selector: 'app-hero',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero container" aria-labelledby="hero-title">
      <p class="eyebrow">{{ i18n.t().hero.eyebrow }}</p>
      <h1 id="hero-title">{{ profile.name }}</h1>
      <p class="role">
        {{ i18n.pick(profile.role) }}
        <span class="sep" aria-hidden="true">·</span>
        <span class="location">{{ i18n.pick(profile.location) }}</span>
      </p>
      <p class="tagline">{{ i18n.pick(profile.tagline) }}</p>

      <ul class="links" [attr.aria-label]="i18n.t().hero.profiles">
        <li>
          <a class="btn-ghost" [href]="contact.linkedin" rel="me">
            <app-icon name="linkedin" /> {{ i18n.t().contact.linkedin }}
          </a>
        </li>
        <li>
          <a class="btn-ghost" [href]="contact.github" rel="me">
            <app-icon name="github" /> {{ i18n.t().contact.github }}
          </a>
        </li>
        <li>
          <a class="btn-ghost" [href]="'mailto:' + contact.email">
            <app-icon name="mail" /> {{ i18n.t().contact.email }}
          </a>
        </li>
      </ul>
    </section>
  `,
  styles: `
    .hero {
      padding-block: var(--space-3xl) var(--space-2xl);
    }
    h1 {
      font-size: var(--step-6);
      margin-block-end: var(--space-s);
    }
    .role {
      font-size: var(--step-1);
      color: var(--color-text);
      margin-block-end: var(--space-m);
    }
    .sep {
      margin-inline: 0.4em;
    }
    .sep,
    .location {
      color: var(--color-text-muted);
    }
    @media (max-width: 575.98px) {
      .sep {
        display: none;
      }
      .location {
        display: block;
      }
    }
    .tagline {
      max-width: 38ch;
      font-family: var(--font-display);
      font-size: var(--step-2);
      line-height: var(--leading-snug);
      color: var(--color-text-muted);
      margin-block-end: var(--space-l);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs);
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class Hero {
  protected readonly i18n = inject(LangService);
  protected readonly profile = PROFILE;
  protected readonly contact = CONTACT;
}
