import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Tema claro/oscuro. Por defecto sigue al sistema; si el usuario elige uno, se guarda en
 * localStorage y se aplica como data-theme en <html>. El script inline de index.html lo aplica
 * antes del primer pintado; este servicio mantiene el estado en sincronía después.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly systemDark = signal(false);
  readonly preference = signal<ThemePreference>('system');

  readonly theme = computed<Theme>(() => {
    const pref = this.preference();
    if (pref !== 'system') return pref;
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    if (!this.isBrowser) return;

    const view = this.document.defaultView;
    const media =
      typeof view?.matchMedia === 'function'
        ? view.matchMedia('(prefers-color-scheme: dark)')
        : null;
    if (media) {
      this.systemDark.set(media.matches);
      media.addEventListener('change', (e) => this.systemDark.set(e.matches));
    }

    const stored = this.readStored();
    if (stored) this.preference.set(stored);
  }

  /** Alterna entre claro y oscuro a partir del tema visible en este momento. */
  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(pref: ThemePreference): void {
    this.preference.set(pref);
    if (!this.isBrowser) return;

    const root = this.document.documentElement;
    if (pref === 'system') {
      delete root.dataset['theme'];
    } else {
      root.dataset['theme'] = pref;
    }
    try {
      if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Almacenamiento bloqueado (modo privado, etc.): el tema funciona igual durante la visita.
    }
  }

  private readStored(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
