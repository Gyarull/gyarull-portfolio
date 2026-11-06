import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Lista de etiquetas cortas (tecnologías). */
@Component({
  selector: 'app-tag-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul [attr.aria-label]="label()">
      @for (tag of tags(); track tag) {
        <li>{{ tag }}</li>
      }
    </ul>
  `,
  styles: `
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3xs) var(--space-2xs);
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      font-family: var(--font-mono);
      font-size: var(--step--1);
      line-height: 1.4;
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      color: var(--color-text-muted);
    }
  `,
})
export class TagList {
  readonly tags = input.required<readonly string[]>();
  readonly label = input<string>();
}
