import { Component, input, output, signal } from '@angular/core';
import { Options } from './options/options';
import { BoothOptions, ColorMode, Frame, Orientation } from '../types';

@Component({
  selector: 'app-landing',
  imports: [Options],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  readonly errorMessage = input('');
  readonly start = output<BoothOptions>();

  protected readonly orientation = signal<Orientation>('horizontal');
  protected readonly frame = signal<Frame>('white');
  protected readonly colorMode = signal<ColorMode>('bw');

  protected startBooth(): void {
    this.start.emit({
      orientation: this.orientation(),
      frame: this.frame(),
      colorMode: this.colorMode()
    });
  }
}
