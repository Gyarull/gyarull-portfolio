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
- **Privacidad:** no publicar el CV ni el teléfono. Los únicos medios de contacto son LinkedIn
  y el correo de `src/data/contact.json`.
- El sitio no depende de Ambitrack: un proyecto con `demo` en su frontmatter muestra el botón de
  lanzamiento, sin lógica específica por proyecto.
- Sin backend: todo se prerenderiza. Una ruta nueva se agrega a `prerender.routes` en
  `vite.config.ts`.
- Colores, tipografía, espaciado y radios salen de los tokens; no hay valores sueltos en
  componentes. Bootstrap se usa solo en parte (reboot, grid, algunas utilidades), con variables
  sobrescritas por tokens.
- Componentes standalone con `OnPush`, signals y control flow nativo. Lo interactivo que no es
  crítico carga con `@defer`.
- Toda animación tiene alternativa con `prefers-reduced-motion`, y el contenido es legible sin ella.
- Commits en Conventional Commits, uno por fase.
