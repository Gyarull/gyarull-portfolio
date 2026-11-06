import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CONTACT } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { Icon } from '../ui/icon';

@Component({
  selector: 'app-contact-section',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="lead">{{ i18n.t().contact.lead }}</p>
    <p class="email">
      <a [href]="'mailto:' + contact.email">{{ contact.email }}</a>
    </p>
    <a class="btn-ghost" [href]="contact.linkedin" rel="me">
      <app-icon name="linkedin" /> {{ i18n.t().contact.linkedin }}
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
    .lead {
      max-width: var(--measure);
      font-size: var(--step-1);
      color: var(--color-text-muted);
    }
    .email {
      font-family: var(--font-display);
      font-size: var(--step-4);
      line-height: var(--leading-tight);
      overflow-wrap: anywhere;
      margin-block: var(--space-m) var(--space-l);
    }
    .email a {
      text-decoration-thickness: 2px;
    }
  `,
})
export class ContactSection {
  protected readonly i18n = inject(LangService);
  protected readonly contact = CONTACT;
}
