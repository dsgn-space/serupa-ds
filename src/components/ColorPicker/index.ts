// The package exports what this file exports: tools/build/registry.mjs collects every component folder's index.ts.
export { ColorPicker } from './ColorPicker';
export type { ColorPickerProps, ColorSwatch } from './ColorPicker';
// The hue and tone a color's name is built from (the colorName label).
export type { ColorHue, ColorTone } from '../../internal/color';
