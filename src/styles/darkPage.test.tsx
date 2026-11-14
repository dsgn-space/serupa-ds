import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { THEMES, contrast } from '../../tools/test/vitest/helpers';

// In dark, the page is the lowest level: cards and bars sit a step above it, and nothing you can press is darker than
// it. The page used to be the cards' zinc-900, with SegmentedControl's track and FileUpload's drop zone on the recessed
// zinc-950, so a control looked sunk into the page around it. In light both stay a zinc-50 tint on the white page. Lightness is read as contrast against black.
const light = (c: string) => contrast(c, '#000');
const root = document.documentElement;
afterEach(() => root.removeAttribute('data-theme'));

describe('the dark page', () => {
  test('the page is below its cards in blue and violet dark, and a SegmentedControl track and a FileUpload drop zone are never below the page in dark, with muted text at 4.5:1 in all six themes', async () => {
    const { container } = await render(<div>
      <SegmentedControl aria-label="View" options={[{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }]} defaultValue="list" />
      <FileUpload aria-label="Files" />
    </div>);
    const track = container.querySelector<HTMLElement>('[role=radiogroup]')!;
    const zone = container.querySelector<HTMLElement>('[role=presentation]')!;
    const wrong: string[] = [];
    for (const th of THEMES) {
      root.setAttribute('data-theme', th);
      const page = getComputedStyle(document.body).backgroundColor;
      // Emerald dark's cards are its page colour, zinc-950, by design.
      if (th === 'blue-dark' || th === 'violet-dark') if (!(light(page) < light('var(--surface)'))) wrong.push(`${th}: the page is not below surface`);
      for (const [name, el] of [['SegmentedControl track', track], ['FileUpload zone', zone]] as const) {
        const bg = getComputedStyle(el).backgroundColor;
        if (th.endsWith('-dark') && light(bg) < light(page)) wrong.push(`${th}: ${name} is below the page`);
        const r = contrast('var(--text-muted)', bg);
        if (r < 4.5) wrong.push(`${th}: text-muted on ${name} ${r.toFixed(2)}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});
