import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LangService } from '../core/i18n/lang.service';
import { Icon } from './icon';

/**
 * Botón para abrir la demo de un proyecto (elemento firma). Genérico: lo muestra cualquier
 * proyecto con `demo` en su frontmatter.
 *
 * Un ecualizador de cinco barras "respira" en calma en reposo y sube de intensidad con hover,
 * foco o al tocarlo. Es solo CSS (transform: scaleY, compuesto en GPU), sin JS. Con
 * prefers-reduced-motion las barras quedan quietas.
 */
@Component({
  selector: 'app-launch-button',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="launch" [href]="url()" target="_blank" rel="noopener">
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="label">{{ label() }}</span>
      <app-icon name="arrowUpRight" class="arrow" />
      <span class="visually-hidden">{{ i18n.t().projects.opensNewTab }}</span>
    </a>
  `,
  styles: `
    .launch {
      --eq-speed: 1.8s;
      --eq-gain: 0.45;

      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      min-height: 3rem;
      padding: var(--space-xs) var(--space-m) var(--space-xs) var(--space-s);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-on-accent);
      font-weight: var(--weight-semibold);
      text-decoration: none;
      isolation: isolate;
      transition:
        background-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-fast) var(--ease-out);
    }

    /* Halo que crece con la intensidad. */
    .launch::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 45%, transparent);
      transition: box-shadow var(--duration-slow) var(--ease-out);
    }

    .launch:hover,
    .launch:focus-visible,
    .launch:active {
      --eq-speed: 0.42s;
      --eq-gain: 1;
      background: var(--color-accent-strong);
      color: var(--color-on-accent);
    }
    .launch:hover::before,
    .launch:focus-visible::before {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-accent) 22%, transparent);
    }
    .launch:active {
      transform: translateY(1px);
    }

    .eq {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 1.1em;
    }
    .eq i {
      display: block;
      width: 3px;
      height: 100%;
      border-radius: 1px;
      background: currentColor;
      transform-origin: 50% 100%;
      transform: scaleY(var(--rest));
      animation: eq var(--eq-speed) var(--ease-in-out) infinite alternate;
      animation-delay: var(--delay);
    }
    /* Altura de reposo, pico y desfase de cada barra: un patrón irregular, como un vúmetro. */
    .eq i:nth-child(1) {
      --rest: 0.35;
      --peak: 0.75;
      --delay: -0.2s;
    }
    .eq i:nth-child(2) {
      --rest: 0.55;
      --peak: 1;
      --delay: -0.9s;
    }
    .eq i:nth-child(3) {
      --rest: 0.3;
      --peak: 0.85;
      --delay: -0.5s;
    }
    .eq i:nth-child(4) {
      --rest: 0.6;
      --peak: 0.95;
      --delay: -1.3s;
    }
    .eq i:nth-child(5) {
      --rest: 0.25;
      --peak: 0.6;
      --delay: -0.7s;
    }

    @keyframes eq {
      from {
        transform: scaleY(var(--rest));
      }
      to {
        /* En calma la barra sube una fracción del pico; con intensidad, todo el recorrido. */
        transform: scaleY(calc(var(--rest) + (var(--peak) - var(--rest)) * var(--eq-gain)));
      }
    }

    .arrow {
      transition: transform var(--duration-base) var(--ease-out);
    }
    .launch:hover .arrow,
    .launch:focus-visible .arrow {
      transform: translate(2px, -2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .eq i {
        animation: none;
      }
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
