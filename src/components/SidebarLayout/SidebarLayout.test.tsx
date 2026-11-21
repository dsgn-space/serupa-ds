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
    await render(<Wide><SidebarLayout id="l" ref={r} className="extra" data-x="y" sidebar={side}>{main}</SidebarLayout></Wide>);
    const e = el('l');
    expect([e.tagName, e.className, e.dataset.component, r.current === e, e.dataset.x]).toEqual(['DIV', 'srp-sidebar-layout extra', 'sidebar-layout', true, 'y']);
    expect([e.children[0]!.className, e.children[1]!.className]).toEqual(['srp-sidebar-layout__side', 'srp-sidebar-layout__content']);
    expect([box('side').x, box('side').w, box('main-c').x, box('main-c').w]).toEqual([0, 256, 280, 620]);
  });

  test('both columns as tall as the taller by default; align="start" keeps each its own height', async () => {
    await render(<Wide><SidebarLayout sidebar={<div id="s1">Side</div>}>{main}</SidebarLayout><SidebarLayout align="start" sidebar={<div id="s2">Side</div>}>{main}</SidebarLayout></Wide>);
    expect([Math.round((el('s1').parentElement as HTMLElement).getBoundingClientRect().height), Math.round((el('s2').parentElement as HTMLElement).getBoundingClientRect().height) < 100]).toEqual([200, true]);
  });

  test('stacks once the content would be narrower than half: the side above, both full width', async () => {
    await render(<Wide w={480}><SidebarLayout sidebar={side}>{main}</SidebarLayout></Wide>);
    expect([box('side').w, box('main-c').w, box('main-c').y]).toEqual([480, 480, 74]);
  });

  test('sidebarPlacement="end": the content first in the HTML and on screen, the side after it', async () => {
    await render(<Wide><SidebarLayout id="l" sidebarPlacement="end" sidebar={side}>{main}</SidebarLayout></Wide>);
    expect([el('l').children[0]!.className, box('main-c').x, box('side').x, el('l').className]).toEqual(['srp-sidebar-layout__content', 0, 644, 'srp-sidebar-layout srp-sidebar-layout--end']);
  });

  test('sidebarWidth (a token name or a length), contentMin and gap', async () => {
    await render(<Wide><SidebarLayout sidebarWidth="container-xs" gap={4} sidebar={<div id="a">a</div>}><div id="b">b</div></SidebarLayout>
      <SidebarLayout sidebarWidth="200px" contentMin={80} sidebar={<div id="c">c</div>}><div id="d">d</div></SidebarLayout></Wide>);
    expect([box('a').w, box('b').x]).toEqual([320, 336]);
    // 200 + 24 + 80% of 900 (720) is 944, more than 900: stacked.
    expect([box('c').w, box('d').w]).toEqual([900, 900]);
  });

  test('a contentMin out of range, an unknown as: the defaults', async () => {
    await render(<Wide><SidebarLayout id="l" as={'table' as never} contentMin={150} sidebar={side}>{main}</SidebarLayout></Wide>);
    expect([el('l').tagName, box('side').w]).toEqual(['DIV', 256]);
  });

  test('a nested SidebarLayout takes its own side width, not its parent\'s', async () => {
    await render(<Wide><SidebarLayout sidebarWidth="300px" sidebar="x"><SidebarLayout sidebar={<div id="in">in</div>}><div>y</div></SidebarLayout></SidebarLayout></Wide>);
    expect(box('in').w).toBe(256);
  });
});
