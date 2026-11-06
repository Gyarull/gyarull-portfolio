---
title: 'Este sitio: impacto con propósito, sin perder rendimiento'
summary: 'Cómo armé este portfolio con Analog (Angular) y Claude Code: un sistema de diseño propio, contenido en Markdown validado en cada build y animaciones que no le cuestan rendimiento al sitio.'
date: '2026-11-06'
---

## El problema

Quería un sitio que mostrara tres cosas sin tener que decirlas: que trabajo bien con herramientas de IA, que resuelvo rápido incluso en tecnologías nuevas, y que tengo criterio visual.

Las condiciones eran concretas:

- **Sitio estático:** sin backend.
- **Bilingüe:** español e inglés.
- **Lighthouse de 90 o más** en todas las categorías.
- **Accesible:** se usa con teclado, cumple contraste AA y respeta a quien prefiere menos movimiento.
- **Fácil de mantener:** agregar un proyecto tiene que ser agregar un archivo de texto, sin tocar componentes.

## Punto de partida

Angular lo usé en mi trabajo anterior (2019–2021), así que el framework no era nuevo. Analog, su meta-framework con rutas por archivo y prerender, sí lo era. El brief original, además, mezclaba ideas pensadas para otro stack (Astro y Tailwind). La primera tarea fue detectar esa contradicción y elegir con fundamento: Analog mantiene a Angular como protagonista y resuelve el contenido en Markdown y la generación estática.

## Arquitectura y decisiones

- **Todo se prerenderiza.** Cada página sale como HTML estático en el build y se publica en Cloudflare Pages. El contenido se lee sin JavaScript; Angular hidrata después para lo interactivo.
- **Contenido validado.** Proyectos y casos de estudio son archivos Markdown con frontmatter; perfil, stack y trayectoria son JSON. Antes de cada build, un validador con Zod revisa:
  - que cada campo tenga el tipo correcto y que no haya campos de más;
  - que cada archivo exista en los dos idiomas;
  - que las referencias entre proyectos y casos apunten a algo real;
  - que no se haya colado un número de teléfono.

  Si algo falla, el build se detiene.

- **Idiomas por URL.** El español va en la raíz y el inglés bajo `/en`. Los textos de la interfaz son diccionarios tipados: si falta una clave en un idioma, TypeScript no compila.
- **Sistema de diseño propio.** Los tokens cubren color semántico, escala tipográfica fluida, espaciado, radios y duraciones. Comparé dos propuestas en una página interna que mide el contraste en vivo y elegí _Partitura_: papel cálido y grafito, títulos en Newsreader y acento petróleo. De Bootstrap uso solo reboot, grilla y algunas utilidades (unos 9 KB comprimidos), conectados a los tokens.
- **Un elemento firma, no diez.** Evalué tres opciones:
  1. Un visualizador en el hero.
  2. Una mini demo con audio en el caso de estudio.
  3. Un botón de lanzamiento con estilo propio.

  Elegí el botón: un ecualizador de cinco barras que "respira" en calma y sube de intensidad con hover o foco. Es solo CSS animado por la GPU, y cualquier proyecto con demo lo muestra; no está atado a uno en particular.

- **Motion como isla.** Las animaciones de scroll usan Motion, pero se cargan aparte, solo en el navegador y solo si el usuario no pidió menos movimiento. Reexportar únicamente las tres funciones que uso bajó el peso de 61 KB a 7 KB comprimidos.

## Cómo trabajé con Claude Code

Empecé en modo plan: primero preguntas, después un plan por fases chicas y verificables, recién entonces código. Desde la primera fase quedaron dos archivos en el repo:

- un `CLAUDE.md` con las reglas que no se deducen del código (por ejemplo, "el contenido nunca va hardcodeado" o "no se publica el teléfono");
- un `docs/CRITERIA.md` con los criterios de calidad como checklist.

Cada fase cerraba igual: build, lint y tests sin warnings, revisión en el navegador (capturas en mobile y desktop, tema claro y oscuro, recorrido con teclado) y un commit. Las decisiones con gusto o criterio de por medio las tomé yo: el framework, cómo manejar los idiomas, el elemento firma, la paleta. Cuando algo del plan no funcionaba, se frenaba y se discutía en lugar de improvisar un cambio grande.

## Problemas difíciles

**Rutas fantasma.** Analog convierte cada `.md` de la carpeta de contenido también en una ruta. Con la estructura inicial (`contenido/en/case-studies/…`), esa ruta automática pisaba la URL real del caso de estudio en inglés y mostraba otra página. Reordenar las carpetas por colección y después idioma hace que esas rutas nunca coincidan con las del sitio.

**Animar sin esconder contenido.** Las animaciones de entrada son un riesgo de rendimiento y de accesibilidad: si el título arranca invisible, se retrasa el primer contenido visible (LCP), y si falla el JavaScript, el texto no aparece nunca. La directiva de revelado solo actúa sobre lo que está fuera de pantalla y aplica el estado oculto desde JavaScript, así que el HTML prerenderizado no tiene nada escondido.

**Código del navegador en el servidor.** Al prerenderizar, los hooks de "después del render" también se ejecutaban en el servidor e intentaban medir elementos que ahí no existen. Se resolvió verificando la plataforma antes de tocar el DOM o cargar Motion.

**Tema sin destello.** Si el tema elegido se aplicara recién al cargar Angular, la página parpadearía con el tema equivocado. Un script mínimo en el `<head>` lo aplica antes del primer pintado, y el ícono del botón se elige por CSS, sin depender de JavaScript.

## Resultado y tiempos

- **Tiempo:** de la primera pregunta al sitio completo, con contenido, animaciones y casos de estudio, unos dos días (5 y 6 de noviembre de 2026). [TODO: completar con el deploy]
- **Peso:** CSS global de unos 12 KB comprimidos; Motion de 7 KB, que se carga después.
- **Lighthouse:** [TODO: resultados en mobile y desktop, en la fase de rendimiento]

## Qué haría distinto

- **Revisar el brief contra el stack antes de escribirlo.** Mezclar conceptos de Astro en un proyecto Angular costó una ronda de aclaraciones.
- **Mover archivos con git, nunca a mano.** En una reorganización se perdieron archivos que todavía no estaban versionados y hubo que recrearlos.
- **Mirar el peso del JavaScript desde la primera fase.** El renderizador de Markdown terminó en el bundle inicial y quedó para optimizar al final.
