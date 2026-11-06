# Portfolio de Guillermo Yarull

Sitio personal estático en Analog (Angular), bilingüe ES/EN, desplegado en Cloudflare Pages.
Convenciones del framework: `node_modules/@analogjs/platform/AGENTS.md`.

## Comandos

- `npm run dev`: servidor de desarrollo (http://localhost:5173)
- `npm run build`: chequeo de tipos (`ngc`) + build + prerender a `dist/analog/public`
- `npm run lint`, `npm run format`, `npm test`
- `npm run preview`: sirve el build estático

Una fase está terminada cuando build, lint y tests pasan sin errores ni warnings y se repasó
[docs/CRITERIA.md](docs/CRITERIA.md).

## Reglas

- **Contenido en Markdown o datos, nunca hardcodeado.** Textos, proyectos, stack, trayectoria y
  contacto viven en `src/content/` (Markdown con frontmatter) y `src/data/` (JSON). Los textos de
  la interfaz van en los archivos de idioma. Agregar un proyecto = agregar un `.md`, sin tocar
  componentes.
- Todo texto visible existe en ES y EN.
- Estructura del contenido:
  - `src/content/{projects|case-studies}/{es|en}/<slug>.md`: el mismo slug en ambos idiomas.
    Frontmatter según `src/content/schema.ts`.
  - `src/data/*.json`: perfil, contacto, stack y trayectoria. Los textos van como `{ "es", "en" }`.
  - `src/i18n/{es,en}.json`: textos de interfaz. Las claves son las mismas en ambos idiomas.
  - `npm run check:content` valida todo esto y corre al inicio del build.
- Rutas: ES en `/` y `/casos/<slug>`, EN en `/en` y `/en/case-studies/<slug>`
  (`src/app/core/i18n/routes.ts`). Analog también crea rutas para cada `.md` de `src/content`;
  por eso la carpeta empieza por la colección y no por el idioma, para que esas rutas automáticas
  nunca coincidan con las del sitio. No se enlazan ni se prerenderizan.
- **Privacidad:** no publicar el CV ni el teléfono. Los únicos medios de contacto son LinkedIn
  y el correo de `src/data/contact.json`.
- El sitio no depende de Ambitrack: un proyecto con `demo` en su frontmatter muestra el botón de
  lanzamiento, sin lógica específica por proyecto.
- Sin backend: todo se prerenderiza. Las rutas de contenido salen solas de `content-routes.ts`;
  una página nueva que no sea de contenido se agrega ahí.
- Colores, tipografía, espaciado y radios salen de los tokens; no hay valores sueltos en
  componentes. Bootstrap se usa solo en parte (reboot, grid, algunas utilidades), con variables
  sobrescritas por tokens.
- Componentes standalone con `OnPush`, signals y control flow nativo. Lo interactivo que no es
  crítico carga con `@defer`.
- Toda animación tiene alternativa con `prefers-reduced-motion`, y el contenido es legible sin ella.
- Commits en Conventional Commits, uno por fase.
