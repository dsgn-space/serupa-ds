import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Stack } from '../Stack/Stack';
import { Divider } from './Divider';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const Wide = ({ children }: { children: React.ReactNode }) => <div style={{ width: '600px' }}>{children}</div>;

describe('Divider', () => {
  test('an <hr> (a separator), a 1px line, full width, no margin; ref and className reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<Wide><Divider id="dh" ref={r} className="extra" /></Wide>);
    const e = el('dh'), s = css(e), b = e.getBoundingClientRect();
    expect([e.tagName, e.getAttribute('role'), e.className, r.current === e]).toEqual(['HR', null, 'srp-divider extra', true]);
    expect([`${s.borderTopWidth} ${s.borderTopStyle}`, b.height, b.width, s.marginTop]).toEqual(['1px solid', 1, 600, '0px']);
  });

  test('label: role separator with "or" between two lines, text-xs', async () => {
    await render(<Wide><Divider id="dlabel" label="or" /></Wide>);
    const e = el('dlabel'), l = e.firstElementChild!;
    expect([e.tagName, e.getAttribute('role'), e.textContent, css(e).fontSize, getComputedStyle(e, '::before').borderTopWidth]).toEqual(['DIV', 'separator', 'or', '12px', '1px']);
    expect(l.getBoundingClientRect().left - e.getBoundingClientRect().left).toBeGreaterThan(250);
  });

  test('a text label names the separator (its children are presentational, so the "or" would be skipped); a node label is plain text with no separator role (BQ1)', async () => {
    await render(<Wide><Divider id="dtext" label="or" /><Divider id="dnode" label={<strong>Section 2</strong>} /><Divider id="down" label="or" aria-label="Or sign in with" /></Wide>);
    expect([el('dtext').getAttribute('aria-label'), el('dnode').getAttribute('role'), el('dnode').getAttribute('aria-label'), el('dnode').textContent, el('down').getAttribute('aria-label')])
      .toEqual(['or', null, null, 'Section 2', 'Or sign in with']);
  });

  test('decorative: role none and hidden', async () => {
    await render(<Divider id="ddeco" decorative />);
    expect([el('ddeco').getAttribute('role'), el('ddeco').getAttribute('aria-hidden')]).toEqual(['none', 'true']);
  });

  test('tokens (--divider-color, --divider-width) override one divider', async () => {
    await render(<Divider id="dtok" style={{ '--divider-color': 'rgb(1, 2, 3)', '--divider-width': '3px' } as React.CSSProperties} />);
    const s = css(el('dtok'));
    expect([s.borderTopColor, s.borderTopWidth]).toEqual(['rgb(1, 2, 3)', '3px']);
  });

  test('vertical: role separator, aria-orientation vertical, the row\'s height, 1px wide, no label', async () => {
    await render(<Stack direction="row" align="stretch" style={{ height: '40px' }}>a<Divider id="dv" orientation="vertical" label="ignored" />b</Stack>);
    const e = el('dv'), r = e.getBoundingClientRect();
    expect([e.getAttribute('role'), e.getAttribute('aria-orientation'), r.height, r.width, css(e).borderLeftWidth, e.textContent]).toEqual(['separator', 'vertical', 40, 1, '1px', '']);
  });

  test('contrast: the label keeps 4.5:1 on surface in every theme', async () => {
    await render(<Divider id="dlabel" label="or" />);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const r = contrast(css(el('dlabel')).color, 'var(--surface)');
      if (r < 4.5) low.push(`${th} label ${r.toFixed(2)}`);
    }
    expect(low).toEqual([]);
  });

  test('a label word longer than the line wraps between two short lines, so at 320px the page doesn\'t scroll sideways (RF1, WCAG 1.4.10)', async () => {
    await page.viewport(320, 640);
    await render(<div style={{ width: '240px' }}><Divider id="dl" label="Donaudampfschifffahrtsgesellschaftskapitänskajüte" /></div>);
    const d = el('dl'), label = d.firstElementChild as HTMLElement;
    expect([d.scrollWidth <= d.clientWidth + 1, label.getBoundingClientRect().width < 240]).toEqual([true, true]);
    expect(parseFloat(getComputedStyle(d, '::before').minWidth)).toBeGreaterThan(0);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  });
});

describe('Divider onMedia', () => {
  test('a half-strength white line and a white label on dark media, black on light, in every theme', async () => {
    await render(<div id="dm">
      <Divider id="dm-dark" onMedia="dark" />
      <Divider id="dm-light" onMedia="light" label="or" />
    </div>);
    const seen = new Set<string>();
    for (const th of THEMES) {
      document.getElementById('dm')!.setAttribute('data-theme', th);
      const label = document.getElementById('dm-light')!;
      seen.add([css(document.getElementById('dm-dark')).borderTopColor, css(label).color, getComputedStyle(label, '::before').borderTopColor].join(' / '));
    }
    expect([...seen]).toEqual(['color(srgb 1 1 1 / 0.5) / rgb(0, 0, 0) / color(srgb 0 0 0 / 0.5)']);   // color-mix() keeps its srgb form
    expect(contrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBeGreaterThan(4.5);
  });
});
