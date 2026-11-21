import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { Center } from './Center';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const Wide = ({ w = 900, children }: { w?: number; children: React.ReactNode }) => <div id="root" style={{ width: `${w}px` }}>{children}</div>;
// The box of an element relative to #root.
const box = (id: string) => { const o = el('root').getBoundingClientRect(), r = el(id).getBoundingClientRect(); return { x: Math.round(r.left - o.left), w: Math.round(r.width), h: Math.round(r.height) }; };
afterEach(async () => { await page.viewport(900, 700); });

describe('Center', () => {
  test('defaults: a <div>, 448px of content in the middle, 16px padding outside it; ref, className and props reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<Wide><Center id="c" ref={r} className="extra" data-x="y"><div id="kid">x</div></Center></Wide>);
    const e = el('c');
    expect([e.tagName, e.className, e.dataset.component, r.current === e, e.dataset.x]).toEqual(['DIV', 'srp-center srp-center--padded extra', 'center', true, 'y']);
    expect([box('kid').w, box('c').w, box('c').x, css(e).paddingLeft]).toEqual([448, 480, 210, '16px']);
  });

  test('maxWidth: a sizing token name or a CSS length', async () => {
    await render(<Wide><Center id="tok" maxWidth="container-sm"><div id="k1">x</div></Center><Center id="len" maxWidth="30rem" padded={false}><div id="k2">x</div></Center></Wide>);
    expect([box('k1').w, box('k2').w, css(el('len')).paddingLeft]).toEqual([384, 480, '0px']);
  });

  test('narrower than its maximum, it takes the space less the padding', async () => {
    await render(<Wide w={300}><Center id="c"><div id="kid">x</div></Center></Wide>);
    expect([box('c').w, box('kid').w]).toEqual([300, 268]);
  });

  test('vertical: at least the screen tall, its content in the middle, 32px above and below', async () => {
    await page.viewport(900, 600);
    await expect.poll(() => window.innerHeight).toBe(600);
    await render(<Wide><Center id="c" vertical><div id="kid" style={{ height: '100px' }}>x</div></Center></Wide>);
    const c = el('c').getBoundingClientRect(), k = el('kid').getBoundingClientRect();
    expect([Math.round(c.height), Math.round(k.top - c.top), css(el('c')).paddingTop, box('kid').w]).toEqual([600, 250, '32px', 448]);
  });

  test('intrinsic and centerText: each child at its own width, centered, its text centered', async () => {
    await render(<Wide><Center id="c" intrinsic centerText><span id="kid" style={{ display: 'block', width: '100px' }}>x</span></Center></Wide>);
    expect([box('kid').x, box('kid').w, css(el('c')).textAlign, css(el('c')).alignItems]).toEqual([400, 100, 'center', 'center']);
  });

  test('a nested Center takes its own maximum, not its parent\'s', async () => {
    await render(<Wide><Center maxWidth="container-2xl" padded={false}><Center id="inner" padded={false}><div id="kid">x</div></Center></Center></Wide>);
    expect(box('kid').w).toBe(448);
  });

  test('as picks the element; an unknown one is a <div>', async () => {
    await render(<Wide><Center id="m" as="main">x</Center><Center id="bad" as={'table' as never}>x</Center></Wide>);
    expect([el('m').tagName, el('bad').tagName]).toEqual(['MAIN', 'DIV']);
  });
});
