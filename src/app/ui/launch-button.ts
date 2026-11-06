import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LangService } from '../core/i18n/lang.service';
import { Icon } from './icon';

/**
 * Botón para abrir la demo de un proyecto (elemento firma). Genérico: lo muestra cualquier
 * proyecto con `demo` en su frontmatter. La animación del ecualizador llega en la fase 5.
 */
@Component({
  selector: 'app-launch-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="launch" [href]="url()" target="_blank" rel="noopener">
      <span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <span class="label">{{ label() }}</span>
      <app-icon name="arrowUpRight" />
      <span class="visually-hidden">{{ i18n.t().projects.opensNewTab }}</span>
    </a>
  `,
  styles: `
    .launch {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-m);
      min-height: 3rem;
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-on-accent);
      font-weight: var(--weight-semibold);
      text-decoration: none;
      transition:
        background-color var(--duration-fast) var(--ease-out),
        transform var(--duration-fast) var(--ease-out);
    }
    .launch:hover {
      background: var(--color-accent-strong);
      color: var(--color-on-accent);
    }
    .launch:active {
      transform: translateY(1px);
    }
    .bars {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 1em;
    }
    .bars i {
      display: block;
      width: 3px;
      border-radius: 1px;
      background: currentColor;
    }
    .bars i:nth-child(1) {
      height: 45%;
    }
    .bars i:nth-child(2) {
      height: 85%;
    }
    .bars i:nth-child(3) {
      height: 60%;
    }
    .bars i:nth-child(4) {
      height: 30%;
    }
  `,
})
export class LaunchButton {
  protected readonly i18n = inject(LangService);
  readonly url = input.required<string>();
  readonly title = input.required<string>();
  protected readonly label = computed(() =>
    this.i18n.format(this.i18n.t().projects.launch, { title: this.title() }),
  );
}
