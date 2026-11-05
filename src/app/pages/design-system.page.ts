import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

import { ThemeService, ThemePreference } from '../core/theme.service';

export const routeMeta = {
  title: 'Sistema de diseño',
  meta: [{ name: 'robots', content: 'noindex' }],
} satisfies RouteMeta;

interface ContrastRow {
  fg: string;
  bg: string;
  min: number;
  ratio: number;
}

// Pares a verificar: texto requiere 4.5:1 (AA); foco y bordes de controles, 3:1.
const PAIRS: readonly (readonly [string, string, number])[] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'surface-2', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['text-muted', 'surface-2', 4.5],
  ['accent', 'bg', 4.5],
  ['accent', 'surface', 4.5],
  ['accent-strong', 'bg', 4.5],
  ['on-accent', 'accent', 4.5],
  ['focus', 'bg', 3],
];

const SWATCHES = [
  'bg',
  'surface',
  'surface-2',
  'border',
  'text',
  'text-muted',
  'accent',
  'accent-strong',
  'on-accent',
];
const STEPS = [6, 5, 4, 3, 2, 1, 0, -1];
const SPACES = ['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
const RADII = ['sm', 'md', 'lg', 'pill'];

/**
 * Página interna (noindex, no se prerenderiza) para revisar los tokens del sistema de diseño.
 * Sus textos son de herramienta interna, no contenido del sitio.
 */
@Component({
  selector: 'app-design-system',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container py-5">
      <p class="eyebrow">Herramienta interna</p>
      <h1>Sistema de diseño</h1>

      <div class="controls">
        <fieldset>
          <legend>Tema</legend>
          @for (t of themes; track t) {
            <button
              type="button"
              [attr.aria-pressed]="themeService.preference() === t"
              (click)="setTheme(t)"
            >
              {{ t }}
            </button>
          }
        </fieldset>
      </div>

      <section>
        <h2>Ejemplo</h2>
        <article class="sample">
          <p class="eyebrow">Proyecto destacado</p>
          <h3>Banda sonora dinámica para juegos de mesa</h3>
          <p>
            Un motor que encadena bloques musicales según el estado de la partida y sube o baja la
            intensidad con un solo control. Texto de ejemplo para evaluar lectura, ritmo y contraste
            a tamaño real.
          </p>
          <p class="text-muted-token">Texto secundario · TypeScript · Web Audio API · WebGL</p>
          <p><a href="#colores">Un enlace de ejemplo</a> y <code>código en línea</code>.</p>
          <span class="chip">Etiqueta</span>
          <button type="button" class="cta">Acción principal</button>
        </article>
      </section>

      <section id="colores">
        <h2>Color</h2>
        <ul class="swatches">
          @for (s of swatches; track s) {
            <li>
              <span class="swatch" [style.background]="'var(--color-' + s + ')'"></span>
              <code>--color-{{ s }}</code>
            </li>
          }
        </ul>

        <h3>Contraste (WCAG AA)</h3>
        <table class="contrast">
          <thead>
            <tr>
              <th scope="col">Texto</th>
              <th scope="col">Fondo</th>
              <th scope="col">Ratio</th>
              <th scope="col">Mínimo</th>
              <th scope="col">Resultado</th>
            </tr>
          </thead>
          <tbody>
            @for (row of contrast(); track row.fg + row.bg) {
              <tr>
                <td>{{ row.fg }}</td>
                <td>{{ row.bg }}</td>
                <td>{{ row.ratio.toFixed(2) }}</td>
                <td>{{ row.min }}</td>
                <td>{{ row.ratio >= row.min ? 'OK' : 'FALLA' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h2>Tipografía</h2>
        @for (step of steps; track step) {
          <p class="type-row" [style.font-size]="'var(--step-' + step + ')'">
            <code>step-{{ step }}</code>
            <span [class.display]="step >= 2">Paraná suena distinto de noche</span>
          </p>
        }
      </section>

      <section>
        <h2>Espaciado</h2>
        @for (s of spaces; track s) {
          <div class="space-row">
            <code>--space-{{ s }}</code>
            <span class="space-bar" [style.width]="'var(--space-' + s + ')'"></span>
          </div>
        }
      </section>

      <section>
        <h2>Radios</h2>
        <div class="d-flex flex-wrap gap-3">
          @for (r of radii; track r) {
            <div class="radius" [style.border-radius]="'var(--radius-' + r + ')'">
              <code>{{ r }}</code>
            </div>
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    section {
      margin-block-start: var(--space-xl);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-m);
    }
    fieldset {
      display: flex;
      gap: var(--space-2xs);
      align-items: center;
    }
    legend {
      float: none;
      width: auto;
      margin: 0 var(--space-2xs) 0 0;
      font-size: var(--step--1);
      color: var(--color-text-muted);
    }
    button {
      font: inherit;
      font-size: var(--step--1);
      padding: var(--space-3xs) var(--space-xs);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
    }
    button[aria-pressed='true'] {
      background: var(--color-text);
      color: var(--color-bg);
      border-color: var(--color-text);
    }
    .sample {
      max-width: var(--measure);
      padding: var(--space-l);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }
    .chip {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: var(--step--1);
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      color: var(--color-text-muted);
      margin-inline-end: var(--space-s);
    }
    .cta {
      background: var(--color-accent);
      color: var(--color-on-accent);
      border-color: var(--color-accent);
      font-weight: var(--weight-semibold);
      padding: var(--space-2xs) var(--space-s);
    }
    .swatches {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: var(--space-s);
    }
    .swatch {
      display: block;
      height: 4rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-block-end: var(--space-3xs);
    }
    .contrast {
      width: 100%;
      font-size: var(--step--1);
      border-collapse: collapse;
    }
    .contrast th,
    .contrast td {
      padding: var(--space-3xs) var(--space-2xs);
      border-bottom: 1px solid var(--color-border);
      text-align: start;
    }
    .type-row {
      display: flex;
      gap: var(--space-s);
      align-items: baseline;
      line-height: var(--leading-tight);
    }
    .type-row code {
      font-size: var(--step--1);
      min-width: 5rem;
      color: var(--color-text-muted);
    }
    .display {
      font-family: var(--font-display);
      font-weight: var(--display-weight);
      letter-spacing: var(--tracking-tight);
    }
    .space-row {
      display: flex;
      align-items: center;
      gap: var(--space-s);
      margin-block-end: var(--space-3xs);
    }
    .space-row code {
      min-width: 7rem;
      font-size: var(--step--1);
    }
    .space-bar {
      height: 1rem;
      background: var(--color-accent);
    }
    .radius {
      width: 6rem;
      height: 4rem;
      display: grid;
      place-items: center;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
    }
  `,
})
export default class DesignSystemPage {
  protected readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  protected readonly themes: ThemePreference[] = ['system', 'light', 'dark'];
  protected readonly swatches = SWATCHES;
  protected readonly steps = STEPS;
  protected readonly spaces = SPACES;
  protected readonly radii = RADII;

  protected readonly contrast = signal<ContrastRow[]>([]);

  constructor() {
    afterNextRender(() => this.measure());
  }

  protected setTheme(t: ThemePreference): void {
    this.themeService.set(t);
    this.measure();
  }

  private measure(): void {
    const probe = this.document.createElement('span');
    this.document.body.appendChild(probe);
    const read = (token: string): [number, number, number] => {
      probe.style.color = `var(--color-${token})`;
      const match = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['0', '0', '0'];
      return [Number(match[0]), Number(match[1]), Number(match[2])];
    };
    this.contrast.set(
      PAIRS.map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrastRatio(read(fg), read(bg)) })),
    );
    probe.remove();
  }
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
