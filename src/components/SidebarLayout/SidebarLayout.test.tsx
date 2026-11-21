import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { SidebarLayout } from './SidebarLayout';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const Wide = ({ w = 900, children }: { w?: number; children: React.ReactNode }) => <div id="root" style={{ width: `${w}px` }}>{children}</div>;
const box = (id: string) => { const o = el('root').getBoundingClientRect(), r = el(id).getBoundingClientRect(); return { x: Math.round(r.left - o.left), y: Math.round(r.top - o.top), w: Math.round(r.width), h: Math.round(r.height) }; };
const side = <div id="side" style={{ height: '50px' }}>Side</div>;
const main = <div id="main-c" style={{ height: '200px' }}>Content</div>;

describe('SidebarLayout', () => {
  test('defaults: a <div>, the side 256px first, the content the rest, 24px apart; ref, className and props reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<Wide><SidebarLayout id="l" ref={r} className="extra" data-x="y" side={side}>{main}</SidebarLayout></Wide>);
    const e = el('l');
    expect([e.tagName, e.className, e.dataset.component, r.current === e, e.dataset.x]).toEqual(['DIV', 'dk-sidebar-layout extra', 'sidebar-layout', true, 'y']);
    expect([e.children[0]!.className, e.children[1]!.className]).toEqual(['dk-sidebar-layout__side', 'dk-sidebar-layout__content']);
    expect([box('side').x, box('side').w, box('main-c').x, box('main-c').w]).toEqual([0, 256, 280, 620]);
  });

  test('both columns as tall as the taller by default; align="start" keeps each its own height', async () => {
    await render(<Wide><SidebarLayout side={<div id="s1">Side</div>}>{main}</SidebarLayout><SidebarLayout align="start" side={<div id="s2">Side</div>}>{main}</SidebarLayout></Wide>);
    expect([Math.round((el('s1').parentElement as HTMLElement).getBoundingClientRect().height), Math.round((el('s2').parentElement as HTMLElement).getBoundingClientRect().height) < 100]).toEqual([200, true]);
  });

  test('stacks once the content would be narrower than half: the side above, both full width', async () => {
    await render(<Wide w={480}><SidebarLayout side={side}>{main}</SidebarLayout></Wide>);
    expect([box('side').w, box('main-c').w, box('main-c').y]).toEqual([480, 480, 74]);
  });

  test('sidePosition="end": the content first in the HTML and on screen, the side after it', async () => {
    await render(<Wide><SidebarLayout id="l" sidePosition="end" side={side}>{main}</SidebarLayout></Wide>);
    expect([el('l').children[0]!.className, box('main-c').x, box('side').x, el('l').className]).toEqual(['dk-sidebar-layout__content', 0, 644, 'dk-sidebar-layout dk-sidebar-layout--end']);
  });

  test('sideWidth (a token name or a length), contentMin and gap', async () => {
    await render(<Wide><SidebarLayout sideWidth="container-xs" gap={4} side={<div id="a">a</div>}><div id="b">b</div></SidebarLayout>
      <SidebarLayout sideWidth="200px" contentMin={80} side={<div id="c">c</div>}><div id="d">d</div></SidebarLayout></Wide>);
    expect([box('a').w, box('b').x]).toEqual([320, 336]);
    // 200 + 24 + 80% of 900 (720) is 944, more than 900: stacked.
    expect([box('c').w, box('d').w]).toEqual([900, 900]);
  });

  test('a contentMin out of range, an unknown as: the defaults', async () => {
    await render(<Wide><SidebarLayout id="l" as={'table' as never} contentMin={150} side={side}>{main}</SidebarLayout></Wide>);
    expect([el('l').tagName, box('side').w]).toEqual(['DIV', 256]);
  });

  test('a nested SidebarLayout takes its own side width, not its parent\'s', async () => {
    await render(<Wide><SidebarLayout sideWidth="300px" side="x"><SidebarLayout side={<div id="in">in</div>}><div>y</div></SidebarLayout></SidebarLayout></Wide>);
    expect(box('in').w).toBe(256);
  });
});
