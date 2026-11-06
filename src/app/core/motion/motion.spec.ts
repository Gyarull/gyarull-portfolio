import { isLightweightDevice, loadMotion, prefersReducedMotion } from './motion';

/** Ventana falsa donde solo coinciden las media queries indicadas. */
function fakeWindow(matching: string[]): Window {
  return {
    matchMedia: (query: string) => ({ matches: matching.some((m) => query.includes(m)) }),
  } as unknown as Window;
}

describe('motion', () => {
  it('detecta prefers-reduced-motion', () => {
    expect(prefersReducedMotion(fakeWindow(['prefers-reduced-motion']))).toBe(true);
    expect(prefersReducedMotion(fakeWindow([]))).toBe(false);
  });

  it('no carga Motion con movimiento reducido ni fuera del navegador', async () => {
    await expect(loadMotion(fakeWindow(['prefers-reduced-motion']))).resolves.toBeNull();
    await expect(loadMotion(null)).resolves.toBeNull();
  });

  it('usa la versión liviana en pantallas chicas o táctiles', () => {
    expect(isLightweightDevice(fakeWindow(['max-width']))).toBe(true);
    expect(isLightweightDevice(fakeWindow(['pointer: coarse']))).toBe(true);
    expect(isLightweightDevice(fakeWindow([]))).toBe(false);
  });
});
