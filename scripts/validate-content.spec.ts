import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { validateContent } from './validate-content';

const ROOT = join(__dirname, '..');

/** Copia el contenido real del sitio a una carpeta temporal para modificarlo en cada test. */
function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-content-'));
  for (const sub of ['content', 'data', 'i18n']) {
    cpSync(join(ROOT, 'src', sub), join(dir, 'src', sub), { recursive: true });
  }
  return dir;
}

function edit(path: string, fn: (text: string) => string) {
  writeFileSync(path, fn(readFileSync(path, 'utf8')));
}

describe('validateContent', () => {
  let dir: string;

  beforeEach(() => {
    dir = fixture();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('acepta el contenido actual del sitio', () => {
    expect(validateContent(ROOT)).toEqual([]);
  });

  it('acepta un proyecto nuevo agregado en ambos idiomas', () => {
    for (const lang of ['es', 'en']) {
      writeFileSync(
        join(dir, 'src/content/projects', lang, 'nuevo.md'),
        `---\ntitle: Nuevo\nsummary: Un proyecto nuevo.\nstack: [C#]\ndate: '2026-12-01'\norder: 2\n---\n`,
      );
    }
    expect(validateContent(dir)).toEqual([]);
  });

  it('rechaza frontmatter que no cumple el esquema', () => {
    edit(join(dir, 'src/content/projects/es/ambitrack.md'), (t) =>
      t.replace('order: 1', 'order: primero').replace(/date: '.*'/, 'date: 2026-11-05'),
    );
    const errors = validateContent(dir);
    expect(errors.some((e) => e.includes('order'))).toBe(true);
    expect(errors.some((e) => e.includes('date'))).toBe(true);
  });

  it('rechaza campos desconocidos en el frontmatter', () => {
    edit(join(dir, 'src/content/projects/en/ambitrack.md'), (t) =>
      t.replace('order: 1', 'order: 1\ntitel: typo'),
    );
    expect(validateContent(dir).some((e) => e.includes('titel'))).toBe(true);
  });

  it('exige la traducción de cada archivo', () => {
    unlinkSync(join(dir, 'src/content/case-studies/en/portfolio.md'));
    expect(validateContent(dir)).toContain(
      'src/content/case-studies/en/portfolio.md: falta la traducción',
    );
  });

  it('detecta referencias a casos de estudio inexistentes', () => {
    edit(join(dir, 'src/content/projects/es/ambitrack.md'), (t) =>
      t.replace('caseStudy: ambitrack', 'caseStudy: no-existe'),
    );
    expect(validateContent(dir).some((e) => e.includes('"no-existe"'))).toBe(true);
  });

  it('valida los datos JSON', () => {
    edit(join(dir, 'src/data/contact.json'), (t) => t.replace('gyarull95@gmail.com', 'no-es-mail'));
    expect(validateContent(dir).some((e) => e.startsWith('src/data/contact.json: email'))).toBe(
      true,
    );
  });

  it('rechaza números de teléfono publicados', () => {
    edit(join(dir, 'src/data/profile.json'), (t) =>
      t.replace('Paraná, Argentina', 'Paraná, Argentina +54 343 0000000'),
    );
    expect(validateContent(dir)).toContain('src/data/profile.json: contiene un número de teléfono');
  });

  it('exige las mismas claves de interfaz en todos los idiomas', () => {
    edit(join(dir, 'src/i18n/en.json'), (t) =>
      t.replace('"journey": {', '"journey": { "extra": "x",'),
    );
    expect(validateContent(dir)).toContain('src/i18n/es.json: falta la clave "journey.extra"');
  });
});
