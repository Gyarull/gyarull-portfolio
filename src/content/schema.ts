/**
 * Esquemas del contenido (Markdown) y de los datos (JSON) del sitio.
 *
 * Los usa scripts/validate-content.ts antes de cada build: si algo no cumple el esquema, el build
 * falla. La app importa solo los tipos (`import type`), así que Zod no llega al bundle.
 */
import { z } from 'zod';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const isoDate = z
  .string({ error: 'La fecha va entre comillas, con formato "AAAA-MM-DD"' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: "AAAA-MM-DD"');

const slug = z.string().regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones');

/** Ruta a un archivo de /public (por ejemplo "/images/ambitrack.webp"). */
const publicPath = z.string().startsWith('/');

// Contenido en Markdown: frontmatter

export const projectSchema = z.strictObject({
  title: z.string().min(1),
  summary: z.string().min(1).max(280),
  stack: z.array(z.string().min(1)).min(1),
  demo: z.url().optional(),
  repo: z.url().optional(),
  video: z.url().optional(),
  featured: z.boolean().default(false),
  date: isoDate,
  order: z.number().int(),
  /** Slug del caso de estudio asociado, si existe. */
  caseStudy: slug.optional(),
  cover: publicPath.optional(),
  coverAlt: z.string().optional(),
});
export type Project = z.output<typeof projectSchema>;

export const caseStudySchema = z.strictObject({
  title: z.string().min(1),
  summary: z.string().min(1).max(280),
  date: isoDate,
  /** Slug del proyecto al que pertenece, si corresponde. */
  project: slug.optional(),
  /** Los borradores no se publican ni se prerenderizan. */
  draft: z.boolean().default(false),
});
export type CaseStudy = z.output<typeof caseStudySchema>;

// Datos en JSON

const localized = z.strictObject({ es: z.string().min(1), en: z.string().min(1) });
export type Localized = z.output<typeof localized>;

export const profileSchema = z.strictObject({
  name: z.string().min(1),
  role: localized,
  tagline: localized,
  location: localized,
});
export type Profile = z.output<typeof profileSchema>;

export const contactSchema = z.strictObject({
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
});
export type Contact = z.output<typeof contactSchema>;

const stackItem = z.strictObject({
  name: z.string().min(1),
  /** Años de uso (grupo "producción"). */
  years: z.number().positive().optional(),
  /** Cuánto llevó aprenderla (grupo "aprendí para proyectos recientes"). */
  time: localized.optional(),
  /** Dónde se usó o aprendió. */
  context: localized.optional(),
});
export type StackItem = z.output<typeof stackItem>;

export const STACK_GROUPS = ['production', 'recent', 'learning'] as const;
export type StackGroupId = (typeof STACK_GROUPS)[number];

export const stackSchema = z.strictObject({
  production: z.array(stackItem).min(1),
  recent: z.array(stackItem),
  learning: z.array(stackItem),
});
export type Stack = z.output<typeof stackSchema>;

export const timelineSchema = z.array(
  z.strictObject({
    period: z.string().min(1),
    role: localized,
    org: z.string().min(1),
    location: localized.optional(),
    summary: localized,
  }),
);
export type Timeline = z.output<typeof timelineSchema>;
export type TimelineEntry = Timeline[number];

export const siteSchema = z.strictObject({
  /** URL pública del sitio, sin barra final. Se usa en canonical, Open Graph y sitemap. */
  url: z.url().refine((u) => !u.endsWith('/'), 'Sin barra final'),
});
export type Site = z.output<typeof siteSchema>;
