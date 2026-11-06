# Lighthouse

Medido con `npm run lighthouse` sobre el build estático local (2026-11-06).
Orden de puntajes: Performance · Accessibility · Best Practices · SEO.

| Dispositivo | Página                       | Perf. | A11y | BP  | SEO | LCP   | TBT   | CLS   |
| ----------- | ---------------------------- | ----- | ---- | --- | --- | ----- | ----- | ----- |
| mobile      | `/`                          | 100   | 100  | 100 | 100 | 0.8 s | 20 ms | 0     |
| mobile      | `/en`                        | 100   | 100  | 100 | 100 | 0.8 s | 0 ms  | 0     |
| mobile      | `/casos/ambitrack`           | 100   | 100  | 100 | 100 | 0.8 s | 40 ms | 0     |
| mobile      | `/en/case-studies/portfolio` | 100   | 100  | 100 | 100 | 0.8 s | 0 ms  | 0     |
| desktop     | `/`                          | 100   | 100  | 100 | 100 | 0.2 s | 0 ms  | 0     |
| desktop     | `/en`                        | 100   | 100  | 100 | 100 | 0.2 s | 0 ms  | 0.001 |
| desktop     | `/casos/ambitrack`           | 100   | 100  | 100 | 100 | 0.2 s | 0 ms  | 0     |
| desktop     | `/en/case-studies/portfolio` | 100   | 100  | 100 | 100 | 0.2 s | 0 ms  | 0.001 |
