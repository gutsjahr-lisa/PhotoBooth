export type Phase = 'landing' | 'entering' | 'capturing' | 'result';
export type Orientation = 'horizontal' | 'vertical';
export type Frame = 'white' | 'black' | 'arctic';
export type ColorMode = 'bw' | 'color';

export interface BoothOptions {
  orientation: Orientation;
  frame: Frame;
  colorMode: ColorMode;
}
