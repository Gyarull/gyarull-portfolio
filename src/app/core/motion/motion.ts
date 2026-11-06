/**
 * Acceso a Motion como "isla": la librería se descarga con import() solo en el navegador y solo
 * si el usuario no pidió menos movimiento. El HTML prerenderizado nunca depende de ella: todo el
 * contenido es visible sin JS y las animaciones solo se agregan encima.
 */
type MotionModule = typeof import('./motion-lite');

let loading: Promise<MotionModule> | null = null;

export function prefersReducedMotion(win: Window): boolean {
  return win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Pantallas chicas o táctiles: versión liviana (sin parallax ni efectos atados al scroll). */
export function isLightweightDevice(win: Window): boolean {
  return (
    (win.matchMedia?.('(max-width: 767.98px)').matches ?? false) ||
    (win.matchMedia?.('(pointer: coarse)').matches ?? false)
  );
}

/** Motion, o null si no corresponde animar. */
export function loadMotion(win: Window | null): Promise<MotionModule | null> {
  if (!win || prefersReducedMotion(win)) return Promise.resolve(null);
  loading ??= import('./motion-lite');
  return loading;
}

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
