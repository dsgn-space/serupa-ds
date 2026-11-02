import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Illustration } from './Illustration';
import { EmptyState } from '../EmptyState/EmptyState';

const el = (id: string) => document.getElementById(id) as unknown as SVGSVGElement;
// The parts, by the class each <path> carries (the picture has no roles inside to find them by).
const part = (svg: Element, kind: string) => [...svg.querySelectorAll('path')].find((p) => p.getAttribute('class') === 'dk-illustration__' + kind);
const NAMES = ['empty', 'search', 'error', 'offline', 'no-access', 'success'] as const;

describe('Illustration', () => {
  test('renders an <svg>; ref, className and other props reach it', async () => {
    const ref = React.createRef<SVGSVGElement>();
    await render(<Illustration id="x" ref={ref} className="extra" data-x="y" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.getAttribute('class'), e.dataset.x, e.dataset.component, e.dataset.name]).toEqual(['svg', true, 'dk-illustration extra', 'y', 'illustration', 'empty']);
  });

  test('is hidden from screen readers by default, and an image with its name given a label', async () => {
    await render(<><Illustration id="a" /><Illustration id="b" name="offline" label="You're offline" /></>);
    expect([el('a').getAttribute('aria-hidden'), el('a').getAttribute('role'), el('a').getAttribute('focusable')]).toEqual(['true', null, 'false']);
    expect([el('b').getAttribute('aria-hidden'), el('b').getAttribute('role'), el('b').getAttribute('aria-label')]).toEqual([null, 'img', "You're offline"]);
  });

  test('draws each picture, and an unknown name falls back to empty', async () => {
    await render(<>{NAMES.map((n) => <Illustration key={n} id={n} name={n} />)}<Illustration id="u" name={'nope' as 'empty'} /></>);
    const drawn = NAMES.map((n) => part(el(n), 'accent')?.getAttribute('d'));
    expect(new Set(drawn).size).toBe(NAMES.length);
    expect(el('u').dataset.name).toBe('empty');
  });

  test('sm, md and lg are 96, 160 and 224px wide at 4:3', async () => {
    await render(<><Illustration id="s" size="sm" /><Illustration id="m" /><Illustration id="l" size="lg" /></>);
    expect(['s', 'm', 'l'].map((id) => { const r = el(id).getBoundingClientRect(); return [r.width, r.height]; })).toEqual([[96, 72], [160, 120], [224, 168]]);
  });

  test('its lines and accent read 3:1 on the surface in all six themes', async () => {
    await render(<div id="bg" style={{ background: 'var(--surface)' }}><Illustration id="c" name="search" /></div>);
    const line = part(el('c'), 'line')!;
    const accent = part(el('c'), 'accent')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(document.getElementById('bg')).backgroundColor;
      expect(contrast(css(line).stroke, bg), th + ' line').toBeGreaterThanOrEqual(3);
      expect(contrast(css(accent).stroke, bg), th + ' accent').toBeGreaterThanOrEqual(3);
    }
  });

  test('sits in an EmptyState icon slot at its own size, without the circle', async () => {
    await render(<EmptyState id="e" icon={<Illustration id="i" name="search" />} title="No results" />);
    const slot = el('i').parentElement as HTMLElement;
    expect([slot.classList.contains('dk-empty-state__icon--custom'), slot.getBoundingClientRect().width, css(slot).backgroundColor]).toEqual([true, 160, 'rgba(0, 0, 0, 0)']);
  });
});
