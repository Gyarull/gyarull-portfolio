import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PROFILE } from '../core/content/site-data';
import { DICTIONARIES } from '../core/i18n/dictionaries';
import { LangService } from '../core/i18n/lang.service';
import { homePath } from '../core/i18n/routes';
import { SeoService } from '../core/seo/seo.service';

/**
 * 404. Se prerenderiza como /404.html, que Cloudflare Pages sirve para cualquier ruta inexistente
 * (en cualquier idioma), así que muestra el mensaje en ambos idiomas.
 */
@Component({
  selector: 'app-not-found-view',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container not-found">
      <p class="eyebrow">404</p>
      <h1>{{ es.notFound.title }}</h1>
      <p>{{ es.notFound.body }}</p>
      <p>
        <a [routerLink]="homePath('es')">{{ es.notFound.back }}</a>
      </p>

      <div lang="en" class="other">
        <h2>{{ en.notFound.title }}</h2>
        <p>{{ en.notFound.body }}</p>
        <p>
          <a [routerLink]="homePath('en')">{{ en.notFound.back }}</a>
        </p>
      </div>
    </main>
  `,
  styles: `
    .not-found {
      padding-block: var(--space-3xl);
    }
    .other {
      margin-block-start: var(--space-xl);
      padding-block-start: var(--space-l);
      border-top: 1px solid var(--color-border);
    }
    h2 {
      font-size: var(--step-3);
    }
  `,
})
export class NotFoundView {
  protected readonly es = DICTIONARIES.es;
  protected readonly en = DICTIONARIES.en;
  protected readonly homePath = homePath;

  constructor() {
    const seo = inject(SeoService);
    const i18n = inject(LangService);
    effect(() => {
      i18n.lang();
      seo.update({
        title: `404 · ${PROFILE.name}`,
        description: DICTIONARIES.es.notFound.body,
        path: '/404',
        noindex: true,
      });
    });
  }
}
