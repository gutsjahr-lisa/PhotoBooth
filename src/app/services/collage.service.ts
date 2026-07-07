import { Injectable } from '@angular/core';
import { ColorMode, Frame, Orientation } from '../types';

const BW_FILTER = 'grayscale(1) contrast(1.15)';
const VINTAGE_FILTER = 'sepia(0.35) saturate(1.6) contrast(1.05) brightness(1.05) hue-rotate(-8deg)';

@Injectable({ providedIn: 'root' })
export class CollageService {
  /** Captured frames live only in memory; never persisted or sent anywhere. */
  capturePhoto(video: HTMLVideoElement, colorMode: ColorMode): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }

    // Mirror the frame and grade it to match the chosen look.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.filter = colorMode === 'color' ? VINTAGE_FILTER : BW_FILTER;
    ctx.drawImage(video, 0, 0);
    ctx.filter = 'none';

    if (colorMode === 'color') {
      this.applyVignette(ctx, canvas.width, canvas.height);
    }

    return canvas;
  }

  private applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.35,
      width / 2, height / 2, height * 0.78
    );
    gradient.addColorStop(0, 'rgba(20,10,5,0)');
    gradient.addColorStop(1, 'rgba(20,10,5,0.35)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  compose(photos: HTMLCanvasElement[], orientation: Orientation, frame: Frame): HTMLCanvasElement {
    const isHorizontal = orientation === 'horizontal';
    const mat = frame === 'black' ? '#111111' : '#f4f1e9';
    const ink = frame === 'black' ? '#f4f1e9' : '#111111';

    const photoWidth = photos[0].width;
    const photoHeight = photos[0].height;
    const border = Math.round(photoHeight * (frame === 'arctic' ? 0.14 : 0.08));
    const gap = Math.round(photoHeight * 0.05);
    const footer = Math.round(photoHeight * 0.18);

    const contentWidth = isHorizontal ? photoWidth * photos.length + gap * (photos.length - 1) : photoWidth;
    const contentHeight = isHorizontal ? photoHeight : photoHeight * photos.length + gap * (photos.length - 1);

    const canvas = document.createElement('canvas');
    canvas.width = border * 2 + contentWidth;
    canvas.height = border * 2 + contentHeight + footer;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }

    ctx.fillStyle = mat;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoLine = Math.max(2, Math.round(photoHeight * 0.006));
    photos.forEach((photo, index) => {
      const x = border + (isHorizontal ? index * (photoWidth + gap) : 0);
      const y = border + (isHorizontal ? 0 : index * (photoHeight + gap));
      ctx.drawImage(photo, x, y);
      ctx.strokeStyle = ink;
      ctx.lineWidth = photoLine;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
    });

    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(3, Math.round(photoHeight * 0.008));
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);

    if (frame === 'arctic') {
      this.drawArcticPattern(ctx, canvas.width, canvas.height, border);
    }

    return canvas;
  }

  private drawArcticPattern(ctx: CanvasRenderingContext2D, width: number, height: number, border: number): void {
    const glyphs = ['❄️', '🦌'];
    const size = Math.round(border * 0.5);
    const step = size * 1.5;

    ctx.save();
    ctx.font = `${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let i = 0;
    for (const y of [border / 2, height - border / 2]) {
      for (let x = step / 2; x < width; x += step) {
        ctx.fillText(glyphs[i++ % 2], x, y);
      }
    }
    for (const x of [border / 2, width - border / 2]) {
      for (let y = border + step / 2; y < height - border; y += step) {
        ctx.fillText(glyphs[i++ % 2], x, y);
      }
    }
    ctx.restore();
  }
}
