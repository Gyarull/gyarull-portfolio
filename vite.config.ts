/// <reference types="vitest" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import type { DeprecationOrId } from 'sass';

import { contentRoutes } from './content-routes.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const site = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8')) as {
  url: string;
};

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    target: ['es2022'],
  },
  resolve: {
    mainFields: ['module'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa @import y funciones globales de Sass; silenciamos esas
        // deprecaciones (son de Bootstrap, no nuestras) para que el build quede sin warnings.
        quietDeps: true,
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ] satisfies DeprecationOrId[],
      },
    },
  },
  plugins: [
    analog({
      // Sitio 100 % estático: todo se prerenderiza a HTML en dist/analog/public.
      static: true,
      // Markdown → HTML en el build. Shiki colorea el código sin JS en el cliente,
      // con un tema por modo (claro/oscuro) vía variables CSS.
      content: {
        highlighter: 'shiki',
        shikiOptions: {
          highlight: { themes: { light: 'github-light', dark: 'github-dark' } },
          highlighter: { additionalLangs: ['csharp', 'scss', 'sql'] },
        },
      },
      prerender: {
        // Home en cada idioma + un caso de estudio por cada .md publicado + 404.
        routes: () => Promise.resolve(contentRoutes(root)),
        sitemap: { host: site.url },
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    reporters: ['default'],
  },
}));
