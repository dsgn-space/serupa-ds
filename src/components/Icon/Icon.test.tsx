import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { iconPoints, settle } from '../../../tools/test/vitest/helpers';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { loadIcon } from '../../icons';
import { Close } from '../../material/builtin';
import { NAMED_ICONS } from '../../material/named';
import { Checkbox } from '../Checkbox/Checkbox';
import { Loader } from '../Loader/Loader';
import { Progress } from '../Progress/Progress';
import { Rating } from '../Rating/Rating';
import { Icon } from './Icon';

const path = (id: string) => document.querySelector(`#${id} svg path`);

describe('Icon', () => {
  test('before the stylesheet arrives, every inline svg is 1em, not the width of its container (FEC7)', () => {
    const html = renderToString(<div>
      <Icon icon={Close} /><Icon name="close" /><Checkbox defaultChecked aria-label="Done" />
      {(['ring', 'spokes', 'dots', 'pixel'] as const).map((v) => <Loader key={v} variant={v} />)}
      <Progress variant="circle" value={40} aria-label="Upload" /><Rating defaultValue={3} aria-label="Score" />
    </div>);
    // A shadow root keeps the page's stylesheets out, as if bundle.css hadn't loaded.
    const host = document.createElement('div');
    host.style.cssText = 'width:600px;font-size:16px';
    document.body.append(host);
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = html;
    const svgs = [...root.querySelectorAll('svg')];
    expect(svgs.length).toBeGreaterThan(8);
    for (const svg of svgs) expect(Math.round(svg.getBoundingClientRect().width), svg.outerHTML.slice(0, 80)).toBe(16);
    host.remove();
  });

  test('an imported icon draws on the first render, on the server too', async () => {
    expect(renderToString(<Icon icon={Close} />)).toContain(`d="${Close.d}"`);
    await render(<Icon id="imported" icon={Close} />);
    expect(path('imported')).not.toBeNull();
  });

  test("a component's own icons draw on the first render, on the server too", async () => {
    expect(renderToString(<Checkbox defaultChecked aria-label="Done" />)).toContain('<path d="');
    await render(<Checkbox id="done" defaultChecked aria-label="Done" />);
    expect(document.getElementById('done')!.nextElementSibling!.querySelector('svg path')).not.toBeNull();
  });

  test("a component icon's name loads from the small chunk, then draws", async () => {
    expect(NAMED_ICONS.some((d) => d.name === 'close')).toBe(true);
    await render(<Icon id="close" name="close" />);
    await vi.waitFor(() => expect(path('close')).not.toBeNull());
  });

  test('any other Material Symbol loads the full set once, then draws', async () => {
    expect(NAMED_ICONS.some((d) => d.name === 'sports_cricket')).toBe(false);
    await render(<Icon id="cricket" name="sports_cricket" />);
    await vi.waitFor(() => expect(path('cricket')).not.toBeNull());
  });

  test('an unknown name stays an empty box and warns once the full set has loaded', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Icon id="unknown" name="not_a_real_icon" />);
    await vi.waitFor(() => expect(warn.mock.calls.some((c) => String(c[0]).includes('"not_a_real_icon"'))).toBe(true));
    await settle(50);
    expect(document.querySelector('#unknown svg')).toBeNull();
    warn.mockRestore();
  });

  test('a name in another spelling (the export\'s "Home", "arrow-forward", "Looks3") warns with the snake_case name to use (GN4)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<><Icon name="Home" /><Icon name="arrow-forward" /><Icon name="Looks3" /><Icon name="Nonsense_Thing" /></>);
    const said = (n: string) => warn.mock.calls.map((c) => String(c[0])).find((m) => m.includes(`"${n}"`));
    // Each name's warning comes once its part of the table has loaded, in whatever order those arrive.
    await vi.waitFor(() => expect(['Home', 'arrow-forward', 'Looks3', 'Nonsense_Thing'].every((n) => said(n))).toBe(true));
    expect(said('Home')).toContain('Did you mean "home"?');
    expect(said('arrow-forward')).toContain('Did you mean "arrow_forward"?');
    expect(said('Looks3')).toContain('Did you mean "looks_3"?');
    expect([said('Nonsense_Thing')!.includes('Did you mean'), said('Nonsense_Thing')!.includes('Foundations/Icons')]).toEqual([false, true]);
    warn.mockRestore();
  });

  test('size: a number and a number as a string are px ("20" doesn\'t fall back to 24px); a CSS length is kept', async () => {
    await render(<>
      <Icon id="sn" name="close" size={20} />
      <Icon id="ss" name="close" size="20" />
      <Icon id="sd" name="close" size=" 18.5 " />
      <Icon id="sl" name="close" size="2rem" />
    </>);
    const fs = (id: string) => getComputedStyle(document.getElementById(id)!).fontSize;
    expect(['sn', 'ss', 'sd', 'sl'].map(fs)).toEqual(['20px', '20px', '18.5px', '32px']);
  });

  test('inline in running text, each size step leaves its text\'s line as tall as it was, centred on the text (GR110)', async () => {
    const steps = [['xs', 'text-xs'], ['sm', 'text-sm'], ['md', 'text-base'], ['lg', 'text-lg']] as const;
    await render(<>{steps.map(([s, t]) => <React.Fragment key={s}>
      <p id={'bare-' + s} className={t} style={{ margin: 0 }}>Label</p>
      <p id={'with-' + s} className={t} style={{ margin: 0 }}><Icon id={'i-' + s} name="close" size={s} /><span id={'t-' + s}>Label</span></p>
    </React.Fragment>)}</>);
    for (const [s] of steps) {
      const h = (id: string) => document.getElementById(id)!.getBoundingClientRect();
      const mid = (r: DOMRect) => (r.top + r.bottom) / 2;
      // Within half a pixel: Firefox and WebKit put the icon's box on a subpixel baseline, so the line can come out
      // 0.2px taller there (16.22 for 16), which no one sees; a line that grows by the icon is a pixel or more.
      expect(Math.abs(h('with-' + s).height - h('bare-' + s).height), s).toBeLessThan(0.5);
      expect(Math.abs(mid(h('i-' + s)) - mid(h('t-' + s))), s).toBeLessThanOrEqual(2);
    }
  });

  test('mirror: in right-to-left text a directional icon (arrow_forward, chevron_right) flips to point the way reading goes; others don\'t; true flips any, false none', async () => {
    const fwd = { name: 'arrow_forward', d: 'M0 0' }, home = { name: 'home', d: 'M0 0' };
    await render(<>
      <p dir="rtl"><Icon id="r1" icon={fwd} /><Icon id="r2" icon={Close} /><Icon id="r3" icon={fwd} mirror={false} /><Icon id="r4" icon={home} mirror /></p>
      <p><Icon id="l1" icon={fwd} /><Icon id="l2" icon={home} mirror /></p>
    </>);
    const scale = (id: string) => getComputedStyle(document.querySelector(`#${id} svg`)!).scale;
    expect([iconPoints(document.getElementById('r1')!), scale('r2'), scale('r3'), scale('r4'), iconPoints(document.getElementById('l1')!), scale('l2')])
      .toEqual(['left', 'none', 'none', '-1 1', 'right', 'none']);
  });

  test('mirror: the panel and dock icons flip in right-to-left text too, where a sidebar sits on the right; menu_open and backspace with them', async () => {
    const names = ['left_panel_close', 'right_panel_open', 'dock_to_left', 'menu_open', 'keyboard_backspace', 'toc'];
    await render(<p dir="rtl">{names.map((n) => <Icon key={n} id={n} icon={{ name: n, d: 'M0 0' }} />)}</p>);
    expect(names.map((n) => getComputedStyle(document.querySelector(`#${n} svg`)!).scale)).toEqual(names.map(() => '-1 1'));
  });

  test('a decorative Icon is aria-hidden; with aria-label it is role="img"', async () => {
    await render(<><Icon id="deco" name="home" /><Icon id="meaning" name="error" aria-label="Error" /></>);
    expect(document.getElementById('deco')!.getAttribute('aria-hidden')).toBe('true');
    expect(document.getElementById('meaning')!.getAttribute('role')).toBe('img');
  });

  test('hydrating: an icon this page loaded but the server never had is drawn right after the hydration, not during it', async () => {
    expect(await loadIcon('schedule')).toBeTruthy();   // loaded here (another island, say), not registered
    const ui = <Icon id="hyd" name="schedule" />;
    const host = document.createElement('div');
    host.innerHTML = renderToString(ui);
    expect(host.querySelector('svg')).toBeNull();   // the server's box is empty
    document.body.appendChild(host);
    const errors: string[] = [];
    const root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) });
    await expect.poll(() => !!host.querySelector('#hyd svg')).toBe(true);
    expect(errors).toEqual([]);
    root.unmount(); host.remove();
  });
});

describe('Icon: the size scale and weights (116+76)', () => {
  test('size="xs" to "xl" are the icon-size tokens, 14, 16, 20, 24 and 40px; the default is lg', async () => {
    await render(<div>{(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => <Icon key={s} id={'size-' + s} icon={Close} size={s} />)}<Icon id="size-none" icon={Close} /></div>);
    const px = (id: string) => document.getElementById(id)!.getBoundingClientRect().width;
    expect(['xs', 'sm', 'md', 'lg', 'xl', 'none'].map((s) => px('size-' + s))).toEqual([14, 16, 20, 24, 40, 24]);
  });

  test('weight thickens a Material Symbol by a stroke of the icon-weight token; regular draws no stroke', async () => {
    await render(<div>{(['regular', 'semibold', 'bold'] as const).map((w) => <Icon key={w} id={'weight-' + w} icon={Close} size={40} weight={w} />)}</div>);
    const stroke = (w: string) => getComputedStyle(document.querySelector(`#weight-${w} path`)!);
    expect(stroke('regular').stroke).toBe('none');
    expect(stroke('semibold').strokeWidth).toBe('0.8px');   // 0.02em of 40px
    expect(stroke('bold').strokeWidth).toBe('1.4px');       // 0.035em of 40px
    expect(stroke('bold').vectorEffect).toBe('non-scaling-stroke');
    expect(stroke('bold').stroke).toBe(stroke('bold').fill);
  });
});

describe('Icon: outlined (I10)', () => {
  test('serupa-ds/icons/outlined has every name serupa-ds/icons has; an icon with an outlined drawing is its own (named "<name>:outlined"), the rest are the filled ones; both draw', async () => {
    const [filled, outlined] = await Promise.all([import('../../material/icons'), import('../../material/outlined')]);
    const names = (m: object) => Object.keys(m).filter((k) => /^[A-Z]/.test(k)).sort();
    expect(names(outlined)).toEqual(names(filled));
    const f = filled as unknown as Record<string, { name: string; d: string }>, o = outlined as unknown as Record<string, { name: string; d: string }>;
    expect([o.Home.name, o.Home.d !== f.Home.d, o.Favorite.name, o.Add === f.Add]).toEqual(['home:outlined', true, 'favorite:outlined', true]);
    const own = names(outlined).filter((k) => o[k] !== f[k]);
    expect([own.length > 2000, own.every((k) => o[k].name === f[k].name + ':outlined' && o[k].d !== f[k].d)]).toEqual([true, true]);
    await render(<p><Icon id="ho" icon={o.Home} /><Icon id="hf" icon={f.Home} /></p>);
    expect([path('ho')!.getAttribute('d'), path('hf')!.getAttribute('d')]).toEqual([o.Home.d, f.Home.d]);
  });
});
