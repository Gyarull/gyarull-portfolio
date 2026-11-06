---
title: 'Ambitrack: de una idea a un prototipo funcional en cuatro días'
summary: 'Un motor de música dinámica para juegos de mesa, hecho con Web Audio y WebGL, tecnologías que no conocía, trabajando con Claude Code: especificación primero, pruebas técnicas para cada riesgo y entregas chicas.'
date: '2026-11-05'
project: ambitrack
---

## El problema

En una partida de rol o de juegos de mesa, la música ayuda muchísimo, hasta que se corta. Una playlist no sabe que el combate empezó, y cambiar de tema a mano rompe el clima. Las herramientas que existen, como Syrinscape, están pensadas sobre todo para efectos de sonido, tardan en cargar y su soundpad responde con demora.

Yo quería lo que hacen los videojuegos desde _Ocarina of Time_: música que sigue el estado de la partida sin que se note la costura. Eso, en concreto, significaba:

- **Empalmes exactos.** Los bloques musicales se encadenan sin huecos ni clics, al nivel de la muestra de audio.
- **Cambios musicales.** Si paso de calma a combate, la frase actual termina y recién ahí entra la nueva.
- **Un solo control de intensidad** que sube o baja capas (bajo, armonía, melodía, batería) sin saltos.
- **Celular con la pantalla bloqueada.** Tiene que seguir sonando, porque es como lo uso en la mesa.

## Punto de partida

Mi experiencia es backend: APIs en ASP.NET Core y C# para sistemas en producción. El frontend que conocía era Angular, de hace unos años. Nunca había usado la Web Audio API, WebGL ni React. [TODO: confirmar o ajustar]

Me puse dos objetivos: llegar rápido a un prototipo que demostrara la mecánica central y, si no despegaba como producto, que sirviera como muestra concreta de cómo trabajo con IA.

## Arquitectura y decisiones

| Decisión                                    | Por qué                                                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PWA web** (React + Vite + TypeScript)     | Una sola versión para computadora y Android, instalable y offline. TypeScript hace verificable el código generado.                                                                                                        |
| **Motor en TypeScript puro**, sin Web Audio | Recibe la hora del reloj de audio y decide qué programar. Así los cambios de estado, el azar y las curvas de intensidad se testean con Vitest, sin parlantes. Una capa fina es lo único que toca Web Audio.               |
| **Programación por manifiesto**             | Cada bloque arranca en un instante exacto del reloj de audio, calculado como `compases × tiempos × 60 / tempo`, no por la duración del archivo. Así se descarta cualquier silencio que el archivo traiga de más al final. |
| **FLAC**, no MP3                            | MP3 agrega unos 23 ms de silencio al principio de cada archivo, y eso abre un hueco en cada empalme. FLAC no tiene ese relleno, pesa unas 5 veces menos que WAV y decodifica exactamente igual.                           |
| **Memoria acotada**                         | Los archivos quedan comprimidos en memoria y solo se decodifica el bloque actual más un candidato por estado. Un bloque de 4 capas decodificado ocupa unos 20 MB: el pack entero no entra en un celular.                  |
| **Orbe con shader propio**                  | Un fragment shader de WebGL, sin react-three-fiber: unos 0,1 ms de JavaScript por cuadro y 60 fps sin cortes de audio en desktop.                                                                                         |
| **Zod, IndexedDB y Cloudflare**             | Zod valida los packs con mensajes claros, los efectos del usuario se guardan en el dispositivo y el deploy es un Worker de Cloudflare con assets estáticos.                                                               |

## Cómo trabajé con Claude Code

El proceso fue el mismo en cada etapa:

1. **Entrevista de producto e investigación de riesgos.** Antes de una línea de código.
2. **`SPEC.md`:** qué se construye, con requisitos numerados (F1, F2…) y criterios de aceptación.
3. **`STACK.md`:** cómo se construye y por qué, con el formato de los packs.
4. **Un spike descartable por cada riesgo técnico** (empalmes, latencia, pantalla bloqueada, rendimiento del orbe), cada uno con métricas y un README de resultados.
5. **El prototipo, en pull requests chicos**, cada uno ligado a un issue de un tablero con historias de usuario.

La división de roles fue clara. Yo definí la visión, tomé las decisiones de producto y técnicas, revisé cada PR y hice las pruebas que una IA no puede hacer: escuchar los empalmes, usarlo en el celular con la pantalla apagada durante más de diez minutos. Claude Code escribió la mayor parte del código, armó los spikes con sus mediciones y mantuvo la documentación al día. Un `CLAUDE.md` en el repo fija las convenciones (idioma, tablero, cómo se nombran las cosas) para que cada sesión arranque con el mismo contexto.

## Problemas difíciles

**Empalmes sin clics.** El primer spike genera un pack sintético y renderiza secuencias al azar con un `OfflineAudioContext`, para revisar cada empalme en busca de silencios y saltos de señal. Con WAV y FLAC, los 11 empalmes salieron limpios. Con un archivo que simula el retardo de un encoder de MP3, todos fallaron por un hueco de 23 ms. Ese resultado definió el formato de los packs.

**Música con la pantalla bloqueada.** Android puede pausar las páginas en segundo plano, y Chrome solo crea los controles en la notificación para elementos `<audio>` o `<video>`, no para Web Audio. El spike compara tres formas de sacar el sonido y registra cortes del reloj, pausas y deriva. La reproducción pasó más de diez minutos con la pantalla apagada sin cortarse.

**Un orbe animado que no afecte el audio.** El orbe reacciona a la energía de la música, al estado y a la intensidad. El spike mide el tiempo de cada cuadro, los cortes de audio y el margen del planificador de bloques. Con un shader de WebGL directo, sin librería, quedó en 60 fps sin cortes.

**Música de prueba que no fuera prestada.** Un tema comercial cortado en compases sirvió para probar los empalmes, pero tenía una sola capa y no estaba cortado por frase. Así que el proyecto incluye un generador de un pack original estilo 8 bits: 9 bloques y 4 capas inspiradas en los canales de la NES. Todos los bloques terminan en el mismo acorde, para que cualquiera pueda seguir a cualquiera.

## Resultado y tiempos

- **Cuatro días** del primer commit (especificación y stack, 2 de noviembre de 2026) al prototipo publicado (5 de noviembre): 66 commits y 29 pull requests.
  - **Día 1:** especificación, stack, tres spikes y el núcleo del motor.
  - **Día 2:** soundpad, orbe, PWA offline y un tema alternativo (Leit, una llama en pixel art).
  - **Día 3:** interfaz para celular, botones de 44 px, contraste AA y packs incluidos.
  - **Día 4:** deploy en Cloudflare y cambio de nombre a Ambitrack.
- **Tests:** 14 archivos de test sobre el motor, que corren sin audio.
- **Dónde funciona:** en desktop y en Android, como app instalable.
- **Pendiente:** diseño visual final, onboarding y un mercado de packs.
- **Horas de trabajo efectivo:** [TODO: horas]

## Qué haría distinto

- **Medir en el celular desde el principio.** Varios spikes quedaron listos para probar en el teléfono, pero las cifras de Android no se registraron. Hoy las conclusiones de rendimiento valen para desktop.
- **Probar el tamaño con un encoder FLAC real** antes de tomarlo como restricción. El encoder mínimo de las pruebas dejó un pack de 45 MB, mucho más de lo esperable.
- **Definir el diseño visual con un diseñador antes de pulir la interfaz.** Varias iteraciones de layout se podrían haber ahorrado. [TODO: confirmar]
