import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import type { Lang, Localized } from '../../../content/schema';
import { DICTIONARIES, format } from './dictionaries';
import { langFromUrl, translatePath } from './routes';

/**
 * Idioma actual, derivado de la URL (/en/... = inglés, el resto = español).
 * Expone el diccionario de interfaz y mantiene <html lang> en sincronía.
 */
@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly lang = computed<Lang>(() => langFromUrl(this.url()));
  readonly other = computed<Lang>(() => (this.lang() === 'es' ? 'en' : 'es'));
  readonly t = computed(() => DICTIONARIES[this.lang()]);
  /** URL actual traducida al otro idioma. */
  readonly alternateUrl = computed(() => translatePath(this.url(), this.other()));

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.lang();
    });
  }

  /** Texto de un dato bilingüe ({ es, en }) en el idioma actual. */
  pick(value: Localized): string {
    return value[this.lang()];
  }

  format = format;

  /** Fecha "AAAA-MM-DD" en formato largo del idioma actual. */
  date(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(this.lang() === 'es' ? 'es-AR' : 'en-US', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, d)));
  }
}
