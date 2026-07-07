import { Component, model, signal } from '@angular/core';
import { ColorMode, Frame, Orientation } from '../../types';

@Component({
  selector: 'app-options',
  templateUrl: './options.html',
  styleUrl: './options.css'
})
export class Options {
  readonly orientation = model<Orientation>('horizontal');
  readonly frame = model<Frame>('white');
  readonly colorMode = model<ColorMode>('bw');

  protected readonly expanded = signal(false);

  protected toggleExpanded(): void {
    this.expanded.update(value => !value);
  }
}
