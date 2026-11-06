import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { STACK } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';

@Component({
  selector: 'app-stack-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="groups">
      <section class="group" aria-labelledby="stack-production">
        <h3 id="stack-production">{{ i18n.t().stack.production }}</h3>
        <ul class="chips">
          @for (item of stack.production; track item.name) {
            <li>
              {{ item.name }}
              @if (item.years) {
                <span class="meta">{{ i18n.format(i18n.t().stack.years, { n: item.years }) }}</span>
              }
            </li>
          }
        </ul>
      </section>

      @if (stack.recent.length) {
        <section class="group" aria-labelledby="stack-recent">
          <h3 id="stack-recent">{{ i18n.t().stack.recent }}</h3>
          <ul class="rows">
            @for (item of stack.recent; track item.name) {
              <li>
                <span class="name">{{ item.name }}</span>
                <span class="meta">
                  @if (item.time) {
                    {{ i18n.format(i18n.t().stack.learnedIn, { time: i18n.pick(item.time) }) }}
                  }
                  @if (item.time && item.context) {
                    <span aria-hidden="true"> · </span>
                  }
                  @if (item.context) {
                    {{ i18n.pick(item.context) }}
                  }
                </span>
              </li>
            }
          </ul>
        </section>
      }

      @if (stack.learning.length) {
        <section class="group" aria-labelledby="stack-learning">
          <h3 id="stack-learning">{{ i18n.t().stack.learning }}</h3>
          <ul class="chips">
            @for (item of stack.learning; track item.name) {
              <li>{{ item.name }}</li>
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .groups {
      display: grid;
      gap: var(--space-l);
    }
    @media (min-width: 992px) {
      .groups {
        grid-template-columns: 1fr 1.3fr 0.7fr;
      }
    }
    h3 {
      font-family: var(--font-mono);
      font-size: var(--step--1);
      font-weight: var(--weight-regular);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-text-muted);
      margin-block-end: var(--space-s);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs);
    }
    .chips li {
      padding: var(--space-3xs) var(--space-xs);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
    }
    .rows li {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-block: var(--space-2xs);
      border-bottom: 1px solid var(--color-border);
    }
    .name {
      font-weight: var(--weight-medium);
    }
    .meta {
      font-size: var(--step--1);
      color: var(--color-text-muted);
    }
  `,
})
export class StackSection {
  protected readonly i18n = inject(LangService);
  protected readonly stack = STACK;
}
