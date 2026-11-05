import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta = {
  title: 'Guillermo Yarull',
} satisfies RouteMeta;

// Placeholder de la fase 1: la home real se construye en la fase 4.
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Guillermo Yarull</h1>
      <p>Sitio en construcción.</p>
    </main>
  `,
})
export default class Home {}
