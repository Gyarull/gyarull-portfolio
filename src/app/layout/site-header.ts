import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { homePath } from '../core/i18n/routes';
import { ThemeService } from '../core/theme.service';
import { Icon } from '../ui/icon';

export const SECTION_IDS = ['projects', 'stack', 'journey', 'contact'] as const;

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'menuOpen.set(false)',
    '[class.is-hidden]': 'hidden() && !menuOpen()',
    '(focusin)': 'hidden.set(false)',
  },
  template: `
    <header class="site-header">
      <div class="container bar">
        <a class="brand" [routerLink]="home()" (click)="menuOpen.set(false)">{{ name }}</a>

        <nav
          id="site-nav"
          class="nav"
          [class.open]="menuOpen()"
          [attr.aria-label]="i18n.t().nav.label"
        >
          <ul>
            @for (id of sections; track id) {
              <li>
                <a [routerLink]="home()" [fragment]="id" (click)="menuOpen.set(false)">{{
                  i18n.t().nav[id]
                }}</a>
              </li>
            }
          </ul>
        </nav>

        <div class="tools">
          <a
            class="tool lang"
            [href]="i18n.alternateUrl()"
            [attr.hreflang]="i18n.other()"
            [attr.lang]="i18n.other()"
            [attr.aria-label]="i18n.t().lang.switchToLabel"
          >
            {{ i18n.other().toUpperCase() }}
          </a>
          <button
            type="button"
            class="tool"
            (click)="theme.toggle()"
            [attr.aria-label]="
              theme.theme() === 'dark' ? i18n.t().theme.toLight : i18n.t().theme.toDark
            "
          >
            <app-icon name="sun" class="icon-sun" />
            <app-icon name="moon" class="icon-moon" />
          </button>
          <button
            type="button"
            class="tool menu-toggle"
            aria-controls="site-nav"
            [attr.aria-expanded]="menuOpen()"
            [attr.aria-label]="menuOpen() ? i18n.t().nav.closeMenu : i18n.t().nav.menu"
            (click)="menuOpen.set(!menuOpen())"
          >
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" />
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    /* Fijo arriba; se esconde al bajar y vuelve al subir (o al recibir foco). */
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 50;
      transition: transform var(--duration-slow) var(--ease-out);
    }
    :host(.is-hidden) {
      transform: translateY(-100%);
    }
    .site-header {
      background: color-mix(in srgb, var(--color-bg) 88%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
    }
    .bar {
      display: flex;
      align-items: center;
      gap: var(--space-s);
      height: var(--header-height);
    }
    .brand {
      font-family: var(--font-display);
      font-size: var(--step-1);
      font-weight: var(--display-weight);
      color: var(--color-text);
      text-decoration: none;
      letter-spacing: var(--tracking-tight);
      margin-inline-end: auto;
    }
    .nav ul {
      display: flex;
      gap: var(--space-m);
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav a {
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: var(--step--1);
      padding-block: var(--space-2xs);
      transition: color var(--duration-fast) var(--ease-out);
    }
    .nav a:hover {
      color: var(--color-text);
    }
    .tools {
      display: flex;
      align-items: center;
      gap: var(--space-3xs);
    }
    .tool {
      display: inline-grid;
      place-items: center;
      min-width: 2.75rem;
      height: 2.75rem;
      padding: 0 var(--space-2xs);
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: var(--step--1);
      text-decoration: none;
      cursor: pointer;
      transition: background-color var(--duration-fast) var(--ease-out);
    }
    .tool:hover {
      background: var(--color-surface-2);
      color: var(--color-text);
    }
    .tool app-icon {
      font-size: 1.25rem;
    }
    .tool app-icon {
      grid-area: 1 / 1;
    }
    /* Muestra el icono del tema contrario al visible, sin depender de JS (evita parpadeo). */
    .icon-sun {
      display: none;
    }
    :host-context([data-theme='dark']) .icon-sun {
      display: inline-flex;
    }
    :host-context([data-theme='dark']) .icon-moon {
      display: none;
    }
    @media (prefers-color-scheme: dark) {
      :host-context(html:not([data-theme='light'])) .icon-sun {
        display: inline-flex;
      }
      :host-context(html:not([data-theme='light'])) .icon-moon {
        display: none;
      }
    }
    .menu-toggle {
      display: none;
    }

    @media (max-width: 767.98px) {
      .menu-toggle {
        display: inline-grid;
      }
      .nav {
        display: none;
        position: absolute;
        inset: var(--header-height) 0 auto 0;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
        padding: var(--space-s) var(--gutter) var(--space-m);
      }
      .nav.open {
        display: block;
      }
      .nav ul {
        flex-direction: column;
        gap: 0;
      }
      .nav a {
        display: block;
        font-size: var(--step-1);
        padding-block: var(--space-xs);
        color: var(--color-text);
      }
    }
  `,
})
export class SiteHeader {
  protected readonly i18n = inject(LangService);
  protected readonly theme = inject(ThemeService);
  protected readonly name = PROFILE.name;
  protected readonly sections = SECTION_IDS;
  protected readonly menuOpen = signal(false);
  protected readonly hidden = signal(false);

  constructor() {
    const win = inject(DOCUMENT).defaultView;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isBrowser || !win) return;
      let lastY = win.scrollY;
      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = win.requestAnimationFrame(() => {
          frame = 0;
          const y = win.scrollY;
          const delta = y - lastY;
          // Umbral para ignorar micro-scrolls; cerca del tope siempre visible.
          if (y < 120) this.hidden.set(false);
          else if (delta > 8) this.hidden.set(true);
          else if (delta < -8) this.hidden.set(false);
          if (Math.abs(delta) > 8) lastY = y;
        });
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => win.removeEventListener('scroll', onScroll));
    });
  }

  protected home() {
    return homePath(this.i18n.lang());
  }
}
