import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';

import { CONTACT, PROFILE } from '../core/content/site-data';
import { LangService } from '../core/i18n/lang.service';
import { isLightweightDevice, loadMotion } from '../core/motion/motion';
import { Icon } from '../ui/icon';

@Component({
  selector: 'app-hero',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section #hero class="hero" aria-labelledby="hero-title">
      <!-- Pentagrama decorativo al pie del hero: se dibuja al cargar (CSS) y se desplaza más lento que el texto. -->
      <svg
        #staff
        class="staff"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        @for (y of staffLines; track y; let i = $index) {
          <line x1="0" [attr.y1]="y" x2="1200" [attr.y2]="y" [style.--i]="i" />
        }
      </svg>
      <div class="container content">
        <p class="eyebrow">{{ i18n.t().hero.eyebrow }}</p>
        <h1 id="hero-title">{{ profile.name }}</h1>
        <p class="role">
          {{ i18n.pick(profile.role) }}
          <span class="sep" aria-hidden="true">·</span>
          <span class="location">{{ i18n.pick(profile.location) }}</span>
        </p>
        <p class="tagline">{{ i18n.pick(profile.tagline) }}</p>

        <ul class="links" [attr.aria-label]="i18n.t().hero.profiles">
          <li>
            <a class="btn-ghost" [href]="contact.linkedin" rel="me">
              <app-icon name="linkedin" /> {{ i18n.t().contact.linkedin }}
            </a>
          </li>
          <li>
            <a class="btn-ghost" [href]="contact.github" rel="me">
              <app-icon name="github" /> {{ i18n.t().contact.github }}
            </a>
          </li>
          <li>
            <a class="btn-ghost" [href]="'mailto:' + contact.email">
              <app-icon name="mail" /> {{ i18n.t().contact.email }}
            </a>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      overflow: clip;
      padding-block: var(--space-3xl) calc(var(--space-2xl) + clamp(4rem, 9vw, 7rem));
    }
    .content {
      position: relative;
    }
    .staff {
      position: absolute;
      inset-inline: 0;
      bottom: var(--space-l);
      width: 100%;
      height: clamp(4rem, 9vw, 7rem);
      pointer-events: none;
      will-change: transform;
    }
    .staff line {
      stroke: var(--color-border);
      stroke-width: 1;
      stroke-dasharray: 1200;
      stroke-dashoffset: 0;
      animation: draw 1.6s var(--ease-out) both;
      animation-delay: calc(var(--i) * 90ms);
    }
    .staff line:nth-child(3) {
      stroke: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
    }
    @keyframes draw {
      from {
        stroke-dashoffset: 1200;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .staff line {
        animation: none;
      }
    }
    h1 {
      font-size: var(--step-6);
      margin-block-end: var(--space-s);
    }
    .role {
      font-size: var(--step-1);
      color: var(--color-text);
      margin-block-end: var(--space-m);
    }
    .sep {
      margin-inline: 0.4em;
    }
    .sep,
    .location {
      color: var(--color-text-muted);
    }
    @media (max-width: 575.98px) {
      .sep {
        display: none;
      }
      .location {
        display: block;
      }
    }
    .tagline {
      max-width: 38ch;
      font-family: var(--font-display);
      font-size: var(--step-2);
      line-height: var(--leading-snug);
      color: var(--color-text-muted);
      margin-block-end: var(--space-l);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs);
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class Hero {
  protected readonly i18n = inject(LangService);
  protected readonly profile = PROFILE;
  protected readonly contact = CONTACT;
  protected readonly staffLines = [40, 80, 120, 160, 200];

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly staff = viewChild.required<ElementRef<SVGElement>>('staff');

  constructor() {
    const win = inject(DOCUMENT).defaultView;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let stop: VoidFunction | undefined;
    inject(DestroyRef).onDestroy(() => stop?.());

    // Parallax del pentagrama atado al scroll. En mobile o táctil, versión liviana: sin parallax.
    afterNextRender(async () => {
      if (!isBrowser || !win || isLightweightDevice(win)) return;
      const motion = await loadMotion(win);
      if (!motion) return;
      stop = motion.scroll(
        motion.animate(
          this.staff().nativeElement,
          { transform: ['translateY(0px)', 'translateY(140px)'] },
          { ease: 'linear' },
        ),
        { target: this.hero().nativeElement, offset: ['start start', 'end start'] },
      );
    });
  }
}
