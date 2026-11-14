import { afterEach, describe, expect, test } from 'vitest';
import { contrast, THEMES } from '../../tools/test/vitest/helpers';

// The elevation levels (docs/foundations.md, "Elevation and layers") in every theme: recessed (surface-muted) sits a
// step below the page and raised and floating a step above or level with it, so a card on a muted page reads as
// raised in dark as it does in light. Lightness is read as contrast against black: the lighter, the higher.
const light = (v: string) => contrast(v, '#000');
const root = document.documentElement;
afterEach(() => root.removeAttribute('data-theme'));

describe('Elevation', () => {
  test('recessed is darker than the page and raised, floating and fields are not, in all six themes', () => {
    const wrong: string[] = [];
    for (const th of THEMES) {
      root.setAttribute('data-theme', th);
      const page = light('var(--surface)');
      if (!(light('var(--surface-muted)') < page)) wrong.push(`${th}: surface-muted is not below surface`);
      for (const up of ['surface-raised', 'surface-overlay', 'field']) if (light(`var(--${up})`) < page) wrong.push(`${th}: ${up} is below surface`);
      // In dark a raised card is told from a filled one by its surface alone, so the two must differ.
      if (light('var(--surface-raised)') === light('var(--surface-muted)')) wrong.push(`${th}: raised and recessed are one colour`);
    }
    expect(wrong).toEqual([]);
  });

  test('a row under the pointer shows on the page (surface-hover) and on raised and floating surfaces (surface-hover-raised), with text at 4.5:1, in all six themes', () => {
    const low: string[] = [];
    for (const th of THEMES) {
      root.setAttribute('data-theme', th);
      for (const [fill, under] of [['surface-hover', 'surface'], ['surface-hover-raised', 'surface-raised'], ['surface-hover-raised', 'surface-overlay']]) {
        if (contrast(`var(--${fill})`, `var(--${under})`) < 1.04) low.push(`${th} ${fill} on ${under}`);
        for (const t of ['text', 'text-muted']) {
          const r = contrast(`var(--${t})`, `var(--${fill})`);
          if (r < 4.5) low.push(`${th} ${t} on ${fill} ${r.toFixed(2)}`);
        }
      }
    }
    expect(low).toEqual([]);
  });

  test('a field on a raised or floating surface (field-raised) is never below it and steps up from it in dark, with text at 4.5:1, in all six themes', () => {
    const wrong: string[] = [];
    for (const th of THEMES) {
      root.setAttribute('data-theme', th);
      for (const under of ['surface-raised', 'surface-overlay']) {
        if (light('var(--field-raised)') < light(`var(--${under})`)) wrong.push(`${th}: field-raised is below ${under}`);
        if (th.endsWith('-dark') && contrast('var(--field-raised)', `var(--${under})`) < 1.1) wrong.push(`${th}: field-raised matches ${under}`);
      }
      for (const t of ['text', 'text-muted']) if (contrast(`var(--${t})`, 'var(--field-raised)') < 4.5) wrong.push(`${th}: ${t} on field-raised`);
    }
    expect(wrong).toEqual([]);
  });
});
