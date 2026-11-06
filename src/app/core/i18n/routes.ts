import type { Lang } from '../../../content/schema';

/**
 * Rutas del sitio por idioma. Español va en la raíz y el inglés bajo /en.
 * Los slugs de contenido son los mismos en ambos idiomas (mismo nombre de archivo).
 */
export const ROUTES = {
  home: { es: '/', en: '/en' },
  caseStudy: { es: '/casos', en: '/en/case-studies' },
} as const satisfies Record<string, Record<Lang, string>>;

export function langFromUrl(url: string): Lang {
  const path = url.split(/[?#]/)[0];
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'es';
}

export function homePath(lang: Lang): string {
  return ROUTES.home[lang];
}

export function caseStudyPath(lang: Lang, slug: string): string {
  return `${ROUTES.caseStudy[lang]}/${slug}`;
}

/** Ruta equivalente en el otro idioma, para el selector de idioma y los enlaces hreflang. */
export function translatePath(url: string, to: Lang): string {
  const [path, hash = ''] = url.split('#');
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  const from = langFromUrl(clean);
  const suffix = hash ? `#${hash}` : '';

  const prefix = ROUTES.caseStudy[from];
  if (clean.startsWith(`${prefix}/`)) {
    return caseStudyPath(to, clean.slice(prefix.length + 1)) + suffix;
  }
  return homePath(to) + suffix;
}
