import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LangService } from './core/i18n/lang.service';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main" (click)="skipToMain($event)">{{
      i18n.t().nav.skipToContent
    }}</a>
    <app-site-header />
    <div id="main" tabindex="-1">
      <router-outlet />
    </div>
    <app-site-footer />
  `,
  styles: `
    #main:focus {
      outline: none;
    }
  `,
})
export class App {
  protected readonly i18n = inject(LangService);

  /** Con <base href="/">, un href "#main" navegaría a la home: movemos el foco a mano. */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    const main = (event.target as HTMLElement).ownerDocument.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  }
}
