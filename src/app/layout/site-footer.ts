import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CONTACT, PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="container inner">
        <p>{{ i18n.format(i18n.t().footer.rights, { year, name }) }}</p>
        <p>{{ i18n.t().footer.builtWith }}</p>
        <ul>
          <li>
            <a [href]="'mailto:' + contact.email">{{ i18n.t().contact.email }}</a>
          </li>
          <li>
            <a [href]="contact.linkedin" rel="me">{{ i18n.t().contact.linkedin }}</a>
          </li>
          <li>
            <a [href]="contact.github" rel="me">{{ i18n.t().contact.github }}</a>
          </li>
        </ul>
      </div>
    </footer>
  `,
  styles: `
    .site-footer {
      border-top: 1px solid var(--color-border);
      padding-block: var(--space-l);
      margin-block-start: var(--space-2xl);
      font-size: var(--step--1);
      color: var(--color-text-muted);
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs) var(--space-m);
      align-items: baseline;
    }
    p {
      margin: 0;
    }
    ul {
      display: flex;
      gap: var(--space-s);
      list-style: none;
      margin: 0 0 0 auto;
      padding: 0;
    }
    a {
      color: var(--color-text-muted);
    }
    a:hover {
      color: var(--color-text);
    }
  `,
})
export class SiteFooter {
  protected readonly i18n = inject(LangService);
  protected readonly contact = CONTACT;
  protected readonly name = PROFILE.name;
  protected readonly year = new Date().getFullYear();
}
