import { Component, ElementRef, OnDestroy, OnInit, computed, input, output, signal, viewChild } from '@angular/core';
import { CollageService } from '../services/collage.service';
import { ColorMode } from '../types';

const PHOTO_COUNT = 4;
const COUNTDOWN_SECONDS = 5;
const FLASH_MS = 350;

@Component({
  selector: 'app-capture',
  templateUrl: './capture.html',
  styleUrl: './capture.css'
})
export class Capture implements OnInit, OnDestroy {
  readonly stream = input.required<MediaStream>();
  readonly colorMode = input.required<ColorMode>();
  readonly finished = output<HTMLCanvasElement[]>();

  protected readonly countdown = signal(0);
  protected readonly flash = signal(false);
  protected readonly photos = signal<HTMLCanvasElement[]>([]);
  protected readonly photoCount = PHOTO_COUNT;
  protected readonly currentShot = computed(() => Math.min(this.photos().length + 1, PHOTO_COUNT));

  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('boothVideo');
  private readonly timers = new Set<number>();
  private cancelled = false;

  constructor(private readonly collage: CollageService) {}

  ngOnInit(): void {
    void this.runCaptureSequence();
  }

  ngOnDestroy(): void {
    this.cancelled = true;
    this.clearTimers();
  }

  private async runCaptureSequence(): Promise<void> {
    const video = await this.waitForVideo();
    if (!video || this.cancelled) {
      return;
    }

    for (let shot = 0; shot < PHOTO_COUNT; shot++) {
      for (let second = COUNTDOWN_SECONDS; second >= 1; second--) {
        this.countdown.set(second);
        await this.delay(1000);
        if (this.cancelled) {
          return;
        }
      }

      this.countdown.set(0);
      this.photos.update((photos) => [...photos, this.collage.capturePhoto(video, this.colorMode())]);
      this.flash.set(true);
      await this.delay(FLASH_MS);
      this.flash.set(false);
      if (this.cancelled) {
        return;
      }
    }

    this.finished.emit(this.photos());
  }

  private async waitForVideo(): Promise<HTMLVideoElement | null> {
    for (let attempt = 0; attempt < 200; attempt++) {
      const video = this.videoRef()?.nativeElement;
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        return video;
      }
      await this.delay(50);
      if (this.cancelled) {
        return null;
      }
    }
    return this.videoRef()?.nativeElement ?? null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => {
        this.timers.delete(id);
        resolve();
      }, ms);
      this.timers.add(id);
    });
  }

  private clearTimers(): void {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers.clear();
  }
}
