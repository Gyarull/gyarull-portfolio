/**
 * Lo único que usamos de Motion. Se carga con import() desde motion.ts, así que el bundler puede
 * descartar el resto de la librería: `animate` es la versión mini (Web Animations API).
 */
export { animate } from 'motion/mini';
export { inView, scroll } from 'motion';
