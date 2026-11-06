# Portfolio de Guillermo Yarull

Sitio personal estático en Analog (Angular), bilingüe ES/EN, desplegado en Cloudflare Workers como assets estáticos (`wrangler.jsonc`).
Convenciones del framework: `node_modules/@analogjs/platform/AGENTS.md`.

## Comandos

- `npm run dev`: servidor de desarrollo (http://localhost:5173)
- `npm run build`: validación de contenido + chequeo de tipos (`ngc`) + build + prerender a
  `dist/analog/public` + postbuild (404, sitemap, robots, precarga de fuentes)
- `npm run lint`, `npm run format`, `npm test`
- `npm run lighthouse`: Lighthouse mobile y desktop sobre el build (resumen en
  `docs/lighthouse/summary.md`); falla si alguna categoría baja de 90
- `npm run check:motion`: verifica en Chrome/Edge headless el comportamiento con y sin
  `prefers-reduced-motion`
- `npm run og`: regenera las imágenes de Open Graph (se commitean)
- `npm run preview`: sirve el build estático

Una fase está terminada cuando build, lint y tests pasan sin errores ni warnings y se repasó
[docs/CRITERIA.md](docs/CRITERIA.md). Si el cambio toca rendimiento o animaciones, también
`npm run lighthouse` y `npm run check:motion`.

## Reglas

- **Contenido en Markdown o datos, nunca hardcodeado.** Textos, proyectos, stack, trayectoria y
  contacto viven en `src/markdown/` (Markdown con frontmatter) y `src/data/` (JSON). Los textos de
  la interfaz van en los archivos de idioma. Agregar un proyecto = agregar un `.md`, sin tocar
  componentes.
- Todo texto visible existe en ES y EN.
- Estructura del contenido:
  - `src/markdown/{projects|case-studies}/{es|en}/<slug>.md`: el mismo slug en ambos idiomas.
    Frontmatter según `src/app/core/content/schema.ts`.
  - `src/data/*.json`: perfil, contacto, stack, trayectoria y URL del sitio. Los textos van como
    `{ "es", "en" }`.
  - `src/i18n/{es,en}.json`: textos de interfaz. Las claves son las mismas en ambos idiomas.
  - `npm run check:content` valida todo esto y corre al inicio del build.
- El contenido se lee con `import.meta.glob` en `content.service.ts`, usando las transformaciones
  de build de Analog (`?analog-content-list`, `?analog-content-file`). No usar el runtime de
  `@analogjs/content` (`injectContentFiles`, `MarkdownComponent`): suma unos 230 KB al bundle
  inicial. No mover el Markdown a `src/content/`: Analog crea rutas automáticas para esa carpeta.
- Rutas: ES en `/` y `/casos/<slug>`, EN en `/en` y `/en/case-studies/<slug>`
  (`src/app/core/i18n/routes.ts`).
- **Privacidad:** no publicar el CV ni el teléfono. Los únicos medios de contacto son LinkedIn
  y el correo de `src/data/contact.json`.
- El sitio no depende de Ambitrack: un proyecto con `demo` en su frontmatter muestra el botón de
  lanzamiento, sin lógica específica por proyecto.
- Sin backend: todo se prerenderiza. Las rutas de contenido salen solas de `content-routes.ts`;
  una página nueva que no sea de contenido se agrega ahí.
- Colores, tipografía, espaciado y radios salen de los tokens; no hay valores sueltos en
  componentes. De Bootstrap se usa solo reboot, contenedores, `visually-hidden` y algunas
  utilidades sin variantes responsive (`src/styles/_bootstrap.scss`), con variables conectadas a
  los tokens. El layout usa CSS grid propio.
- Componentes standalone con `OnPush`, signals y control flow nativo. El código que toca el DOM
  en hooks (`afterNextRender`) se protege con `isPlatformBrowser`: también corre en el prerender.
- Toda animación tiene alternativa con `prefers-reduced-motion`, y el contenido es legible sin ella.
  Motion se usa solo vía `loadMotion()` (`src/app/core/motion/`): se carga con `import()` en el
  navegador y nunca en el prerender. Si necesitás otra API, reexportala en `motion-lite.ts`
  (importar `motion` entero suma unos 60 KB). Para revelar al hacer scroll, usá `appReveal`.
- Commits en Conventional Commits, uno por fase.
