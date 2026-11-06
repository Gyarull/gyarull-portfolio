import { caseStudyPath, homePath, langFromUrl, translatePath } from './routes';

describe('rutas por idioma', () => {
  it('deduce el idioma de la URL', () => {
    expect(langFromUrl('/')).toBe('es');
    expect(langFromUrl('/casos/ambitrack')).toBe('es');
    expect(langFromUrl('/en')).toBe('en');
    expect(langFromUrl('/en/case-studies/ambitrack?x=1')).toBe('en');
    expect(langFromUrl('/entrada')).toBe('es');
  });

  it('arma rutas por idioma', () => {
    expect(homePath('es')).toBe('/');
    expect(homePath('en')).toBe('/en');
    expect(caseStudyPath('es', 'ambitrack')).toBe('/casos/ambitrack');
    expect(caseStudyPath('en', 'ambitrack')).toBe('/en/case-studies/ambitrack');
  });

  it('traduce la URL actual al otro idioma', () => {
    expect(translatePath('/', 'en')).toBe('/en');
    expect(translatePath('/en', 'es')).toBe('/');
    expect(translatePath('/casos/ambitrack', 'en')).toBe('/en/case-studies/ambitrack');
    expect(translatePath('/en/case-studies/portfolio/', 'es')).toBe('/casos/portfolio');
    expect(translatePath('/#contacto', 'en')).toBe('/en#contacto');
  });
});
