import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TIMELINE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { RevealDirective } from '../ui/reveal.directive';

@Component({
  selector: 'app-journey-section',
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="timeline">
      @for (entry of timeline; track entry.period + entry.org) {
        <li appReveal [appRevealDelay]="$index * 0.08">
          <p class="period">{{ entry.period }}</p>
          <div>
            <h3>{{ i18n.pick(entry.role) }}</h3>
            <p class="org">
              {{ entry.org }}
              @if (entry.location) {
                · {{ i18n.pick(entry.location) }}
              }
            </p>
            <p class="summary">{{ i18n.pick(entry.summary) }}</p>
          </div>
        </li>
      }
    </ol>
  `,
  styles: `
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: grid;
      gap: var(--space-3xs) var(--space-l);
      padding-block: var(--space-m);
      border-bottom: 1px solid var(--color-border);
    }
    li:first-child {
      padding-block-start: 0;
    }
    @media (min-width: 768px) {
      li {
        grid-template-columns: 10rem 1fr;
      }
    }
    .period {
      font-family: var(--font-mono);
      font-size: var(--step--1);
      color: var(--color-text-muted);
      margin: 0;
      padding-block-start: 0.35em;
    }
    h3 {
      font-size: var(--step-1);
      margin-block-end: var(--space-3xs);
    }
    .org {
      color: var(--color-text-muted);
      margin-block-end: var(--space-2xs);
    }
    .summary {
      max-width: var(--measure);
      margin: 0;
    }
  `,
})
export class JourneySection {
  protected readonly i18n = inject(LangService);
  protected readonly timeline = TIMELINE;
}
