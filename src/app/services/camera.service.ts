import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraService {
  async requestStream(): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException('Camera access is not supported.', 'NotSupportedError');
    }
    return navigator.mediaDevices.getUserMedia({ video: true });
  }

  stop(stream: MediaStream | null): void {
    stream?.getTracks().forEach((track) => track.stop());
  }

  friendlyError(error: unknown): string {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'SecurityError':
          return 'Camera access was denied. Please allow access in your browser settings and try again.';
        case 'NotFoundError':
        case 'OverconstrainedError':
          return 'No camera was found. Please connect a camera and try again.';
        case 'NotReadableError':
          return 'Your camera is currently being used by another app. Close it and try again.';
        case 'NotSupportedError':
          return 'Camera access is not supported by this browser.';
      }
    }
    return 'Something went wrong while accessing the camera. Please try again.';
  }
}
