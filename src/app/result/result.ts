import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-result',
  templateUrl: './result.html',
  styleUrl: './result.css'
})
export class Result {
  readonly collage = input.required<HTMLCanvasElement>();
  readonly restart = output<void>();

  protected readonly collageUrl = computed(() => this.collage().toDataURL('image/png'));

  protected download(): void {
    this.collage().toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'photobooth-strip.png';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
}
