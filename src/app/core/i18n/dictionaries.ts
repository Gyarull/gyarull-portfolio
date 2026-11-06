import type { Lang } from '../content/schema';
import enJson from '../../../i18n/en.json';
import esJson from '../../../i18n/es.json';

/** Textos de interfaz. El español define la forma; el inglés tiene que cumplirla (lo chequea TS). */
export type Dictionary = typeof esJson;

const en: Dictionary = enJson;

export const DICTIONARIES: Record<Lang, Dictionary> = { es: esJson, en };

/** Reemplaza {clave} por su valor: format('Probar {title}', { title: 'X' }) → 'Probar X'. */
export function format(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
