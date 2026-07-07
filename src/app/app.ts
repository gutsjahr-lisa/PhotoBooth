import { Component, OnDestroy, signal } from '@angular/core';
import { Landing } from './landing/landing';
import { Entering } from './entering/entering';
import { Capture } from './capture/capture';
import { Result } from './result/result';
import { CameraService } from './services/camera.service';
import { CollageService } from './services/collage.service';
import { BoothOptions, ColorMode, Frame, Orientation, Phase } from './types';

const ENTER_ANIMATION_MS = 1400;

@Component({
  selector: 'app-root',
  imports: [Landing, Entering, Capture, Result],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected readonly phase = signal<Phase>('landing');
  protected readonly stream = signal<MediaStream | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly collageCanvas = signal<HTMLCanvasElement | null>(null);
  protected readonly colorMode = signal<ColorMode>('bw');

  private orientation: Orientation = 'horizontal';
  private frame: Frame = 'white';

  constructor(
    private readonly camera: CameraService,
    private readonly collage: CollageService
  ) {}

  protected async onStart(options: BoothOptions): Promise<void> {
    if (this.phase() !== 'landing') {
      return;
    }

    this.orientation = options.orientation;
    this.frame = options.frame;
    this.colorMode.set(options.colorMode);
    this.errorMessage.set('');
    this.phase.set('entering');
    const minAnimation = this.delay(ENTER_ANIMATION_MS);

    try {
      const stream = await this.camera.requestStream();
      await minAnimation;

      if (this.phase() !== 'entering') {
        this.camera.stop(stream);
        return;
      }

      this.stream.set(stream);
      this.phase.set('capturing');
    } catch (error) {
      await minAnimation;
      if (this.phase() !== 'entering') {
        return;
      }
      this.errorMessage.set(this.camera.friendlyError(error));
      this.phase.set('landing');
    }
  }

  protected onCaptured(photos: HTMLCanvasElement[]): void {
    // Leaving the booth: release the camera before showing the result.
    this.camera.stop(this.stream());
    this.stream.set(null);
    this.collageCanvas.set(this.collage.compose(photos, this.orientation, this.frame));
    this.phase.set('result');
  }

  protected onRestart(): void {
    this.collageCanvas.set(null);
    this.errorMessage.set('');
    this.phase.set('landing');
  }

  ngOnDestroy(): void {
    this.camera.stop(this.stream());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}
