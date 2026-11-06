import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import type { Lang } from '../content/schema';
import { PROFILE, SITE } from '../content/site-data';
import { LangService } from '../i18n/lang.service';

export interface PageSeo {
  title: string;
  description: string;
  /** Ruta de esta página (ej. "/casos/ambitrack"). */
  path: string;
  /** Ruta equivalente en el otro idioma, para hreflang. Sin valor: la página no tiene traducción. */
  alternatePath?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const OG_LOCALE: Record<Lang, string> = { es: 'es_AR', en: 'en_US' };

/**
 * Metadatos por página: título, descripción, canonical, hreflang, Open Graph y Twitter.
 * Se aplican también al prerenderizar, así que quedan en el HTML estático.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(LangService);

  update(page: PageSeo): void {
    const lang = this.i18n.lang();
    const other = this.i18n.other();
    const url = absolute(page.path);
    const image = absolute(`/og/default-${lang}.png`);

    this.title.setTitle(page.title);
    this.setName('description', page.description);
    this.setName('robots', page.noindex ? 'noindex' : 'index, follow');

    this.setProperty('og:site_name', PROFILE.name);
    this.setProperty('og:type', page.type ?? 'website');
    this.setProperty('og:title', page.title);
    this.setProperty('og:description', page.description);
    this.setProperty('og:url', url);
    this.setProperty('og:locale', OG_LOCALE[lang]);
    this.setProperty('og:locale:alternate', OG_LOCALE[other]);
    this.setProperty('og:image', image);
    this.setProperty('og:image:width', '1200');
    this.setProperty('og:image:height', '630');
    this.setProperty('og:image:alt', page.title);
    this.setName('twitter:card', 'summary_large_image');

    this.setLink('canonical', url);
    this.clearAlternates();
    if (page.alternatePath) {
      const alt = absolute(page.alternatePath);
      const es = lang === 'es' ? url : alt;
      const en = lang === 'en' ? url : alt;
      this.addAlternate('es', es);
      this.addAlternate('en', en);
      this.addAlternate('x-default', es);
    }
  }

  private setName(name: string, content: string) {
    this.meta.updateTag({ name, content }, `name="${name}"`);
  }

  private setProperty(property: string, content: string) {
    this.meta.updateTag({ property, content }, `property="${property}"`);
  }

  private setLink(rel: string, href: string) {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private clearAlternates() {
    this.document.head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());
  }

  private addAlternate(hreflang: string, href: string) {
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    this.document.head.appendChild(link);
  }
}

function absolute(path: string): string {
  return path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`;
}
