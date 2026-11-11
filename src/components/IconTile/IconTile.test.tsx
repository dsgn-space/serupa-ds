import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import * as icons from '../../material/builtin';
import { IconTile, type IconTileTone } from './IconTile';

const TONES: IconTileTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
const el = (id: string) => document.getElementById(id) as HTMLElement;
const box = (id: string) => el(id).getBoundingClientRect();
const glyph = (id: string) => el(id).querySelector('svg')!.getBoundingClientRect();

describe('IconTile (RU16)', () => {
  test('decorative by default: hidden from screen readers; with label, an image named by it', async () => {
    const s = await render(<><IconTile id="a" icon={icons.CloudDone} /><IconTile id="b" icon={icons.Warning} label="Needs attention" /></>);
    expect(el('a').getAttribute('aria-hidden')).toBe('true');
    expect(el('a').getAttribute('role')).toBeNull();
    await expect.element(s.getByRole('img', { name: 'Needs attention' })).toBeInTheDocument();
    expect(el('b').hasAttribute('aria-hidden')).toBe(false);
  });

  test('sizes: a 32, 40, 48 or 64px square with a 16, 20, 24 or 32px icon, centered; circle rounds it fully', async () => {
    await render(<>{(['sm', 'md', 'lg', 'xl'] as const).map((s) => <IconTile key={s} id={s} size={s} icon={icons.CloudDone} />)}<IconTile id="c" shape="circle" icon={icons.CloudDone} /><IconTile id="x" size={'huge' as 'md'} icon={icons.CloudDone} /></>);
    const want = { sm: [32, 16], md: [40, 20], lg: [48, 24], xl: [64, 32] } as const;
    for (const [id, [side, icon]] of Object.entries(want)) {
      expect([box(id).width, box(id).height]).toEqual([side, side]);
      expect(Math.round(glyph(id).width)).toBe(icon);
      const mid = (r: DOMRect) => [r.left + r.width / 2, r.top + r.height / 2];
      const [a, b] = [mid(box(id)), mid(glyph(id))];
      expect(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])).toBeLessThan(1);
    }
    expect(box('x').width).toBe(40);   // an unknown size falls back to md
    expect(parseFloat(css(el('c')).borderTopLeftRadius)).toBeGreaterThanOrEqual(20);
    expect(parseFloat(css(el('md')).borderTopLeftRadius)).toBe(8);
  });

  test('every tone keeps its icon at 3:1 on its fill in all six themes; a token overrides one tile', async () => {
    await render(<>{TONES.map((t) => <IconTile key={t} id={t} tone={t} icon={icons.CloudDone} />)}<IconTile id="tok" icon={icons.CloudDone} style={{ '--icon-tile-neutral-bg': 'rgb(1, 2, 3)' } as React.CSSProperties} /></>);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const t of TONES) {
        const r = contrast(css(el(t)).color, css(el(t)).backgroundColor);
        if (r < 3) low.push(`${th} ${t} ${r.toFixed(2)}`);
      }
    }
    document.documentElement.removeAttribute('data-theme');
    expect(low).toEqual([]);
    expect(css(el('tok')).backgroundColor).toBe('rgb(1, 2, 3)');
    // Tones differ from each other, so they say something.
    expect(new Set(TONES.map((t) => css(el(t)).backgroundColor)).size).toBe(TONES.length);
  });

  test('className, style, ref and other props reach the span', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    await render(<IconTile id="r" ref={ref} className="mine" data-x="1" icon={icons.Info} />);
    expect(ref.current).toBe(el('r'));
    expect(el('r').classList.contains('mine')).toBe(true);
    expect(el('r').dataset.x).toBe('1');
    expect(el('r').dataset.component).toBe('icon-tile');
  });
});
