import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  PLATFORM_ID,
  input,
} from '@angular/core';

import { EASE_OUT, loadMotion } from '../core/motion/motion';

/**
 * Revela el elemento con un fundido y un leve desplazamiento cuando entra en pantalla.
 *
 * - Lo que ya está visible al cargar no se anima (no retrasa el pintado ni el LCP).
 * - El estado oculto se aplica recién con JS, sobre elementos fuera de pantalla: sin JS o con
 *   prefers-reduced-motion, el contenido se ve siempre.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  /** Retraso en segundos, para escalonar elementos hermanos. */
  readonly appRevealDelay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const win = inject(DOCUMENT).defaultView;
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let stop: VoidFunction | undefined;
    inject(DestroyRef).onDestroy(() => stop?.());

    afterNextRender(async () => {
      if (!isBrowser || !win || el.getBoundingClientRect().top < win.innerHeight) return;
      const motion = await loadMotion(win);
      if (!motion) return;

      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      stop = motion.inView(
        el,
        () => {
          motion.animate(
            el,
            { opacity: 1, transform: 'translateY(0px)' },
            { duration: 0.7, delay: this.appRevealDelay(), ease: EASE_OUT },
          );
        },
        // Se dispara cuando el borde superior pasa el 90 % de la pantalla. No usamos un
        // porcentaje del elemento: en textos largos podría superar la altura de la pantalla y
        // el contenido nunca se revelaría.
        { margin: '0px 0px -10% 0px' },
      );
    });
  }
}
