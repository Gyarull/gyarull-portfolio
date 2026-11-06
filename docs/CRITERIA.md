# Criterios de calidad

Repasar al cerrar cada fase. Marcar solo lo verificado; lo que todavía no aplica queda sin marcar.

## Build y código

- [x] `npm run build` sin errores ni warnings de tipos
- [x] `npm run lint` sin errores ni warnings
- [x] `npm test` en verde

## Rendimiento y buenas prácticas (Lighthouse, mobile y desktop)

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90

## Accesibilidad

- [x] Todo es navegable con teclado y el foco siempre se ve
- [x] Contraste AA en tema claro y oscuro
- [x] El contenido no depende de las animaciones
- [ ] Respeta `prefers-reduced-motion` (animaciones apagadas o simplificadas)

## Diseño

- [x] Responsive real, revisado a 375 px y 1440 px
- [x] El elemento firma tiene versión liviana en mobile
- [x] Modo claro y oscuro: sigue al sistema, con botón en la barra superior y sin destello al cargar
- [x] Selector de idioma ES/EN, con todo el contenido en ambos idiomas

## Contenido

- [x] Nada de contenido hardcodeado en componentes
- [x] Agregar un proyecto = agregar un `.md` y hacer push
- [x] El CV y el teléfono no aparecen publicados en ningún lado

## SEO

- [x] Título y descripción por página
- [x] Open Graph por página
- [x] `sitemap.xml` generado
- [x] `hreflang` entre ES y EN
