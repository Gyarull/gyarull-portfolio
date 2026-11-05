# Criterios de calidad

Repasar al cerrar cada fase. Marcar solo lo verificado; lo que todavía no aplica queda sin marcar.

## Build y código

- [ ] `npm run build` sin errores ni warnings de tipos
- [ ] `npm run lint` sin errores ni warnings
- [ ] `npm test` en verde

## Rendimiento y buenas prácticas (Lighthouse, mobile y desktop)

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90

## Accesibilidad

- [ ] Todo es navegable con teclado y el foco siempre se ve
- [ ] Contraste AA en tema claro y oscuro
- [ ] El contenido no depende de las animaciones
- [ ] Respeta `prefers-reduced-motion` (animaciones apagadas o simplificadas)

## Diseño

- [ ] Responsive real, revisado a 375 px y 1440 px
- [ ] El elemento firma tiene versión liviana en mobile
- [ ] Modo claro y oscuro: sigue al sistema, con botón en la barra superior y sin destello al cargar
- [ ] Selector de idioma ES/EN, con todo el contenido en ambos idiomas

## Contenido

- [ ] Nada de contenido hardcodeado en componentes
- [ ] Agregar un proyecto = agregar un `.md` y hacer push
- [ ] El CV y el teléfono no aparecen publicados en ningún lado

## SEO

- [ ] Título y descripción por página
- [ ] Open Graph por página
- [ ] `sitemap.xml` generado
- [ ] `hreflang` entre ES y EN
