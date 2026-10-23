import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, css } from '../../../tools/test/vitest/helpers';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card, CardBody, CardFooter, CardHeader } from './Card';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const q = (sel: string) => document.querySelector(sel) as HTMLElement;

/** Applies the stylesheets' rules for a media feature (forced colors, reduced motion) as if it matched, until the returned function is called. */
function emulate(feature: 'forced-colors' | 'prefers-reduced-motion'): () => void {
  const on = feature === 'forced-colors' ? /forced-colors:\s*active/ : /prefers-reduced-motion:\s*reduce/;
  const off = feature === 'forced-colors' ? /forced-colors:\s*none/ : /prefers-reduced-motion:\s*no-preference/;
  const flipped: Array<[MediaList, string]> = [];
  const walk = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      if (r instanceof CSSMediaRule && (on.test(r.media.mediaText) || off.test(r.media.mediaText))) {
        flipped.push([r.media, r.media.mediaText]);
        r.media.mediaText = on.test(r.media.mediaText) ? 'all' : 'not all';
      }
      if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
    }
  };
  for (const s of Array.from(document.styleSheets)) { try { walk(s.cssRules); } catch { /* cross-origin */ } }
  return () => { for (const [m, t] of flipped) m.mediaText = t; };
}

// Colors with alpha, composited over what's behind them, for WCAG contrast.
type RGBA = [number, number, number, number];
const rgb = (c: string): RGBA => { const m = (c.match(/[\d.]+/g) || []).map(Number); return [m[0]!, m[1]!, m[2]!, m.length > 3 ? m[3]! : 1]; };
const lum = (c: RGBA) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!; };
const over = (fg: RGBA, bg: RGBA): RGBA => (fg[3] >= 1 ? fg : fg.map((x, i) => (i < 3 ? x * fg[3] + bg[i]! * (1 - fg[3]) : 1)) as RGBA);
const ratio = (a: RGBA, b: RGBA) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05); };

const Parts = () => <>
  <CardHeader title="Team plan" description="Up to 10 members" action={<Badge>Active</Badge>} />
  <CardBody>Body text</CardBody>
  <CardFooter><Button>Go</Button></CardFooter>
</>;
const Col = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>{children}</div>;
const Variants = () => <Col>
  <Card id="def"><Parts /></Card>
  <Card id="el" variant="elevated"><Parts /></Card>
  <Card id="fi" variant="filled"><Parts /></Card>
</Col>;

describe('Card', () => {
  test('defaults: a <div> card (outline, padding md) with header, body and footer; ref, className and other props reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<Card id="def" ref={r} className="extra" data-x="y"><Parts /></Card>);
    const e = el('def');
    expect([e.tagName, e.className, e.dataset.component, e.dataset.variant, r.current === e, e.dataset.x, [...e.children].map((c) => c.className).join(' | ')])
      .toEqual(['DIV', 'dk-card extra', 'card', 'outline', true, 'y', 'dk-card__header | dk-card__body | dk-card__footer']);
    expect([e.querySelector('.dk-card__title')!.tagName, e.querySelector('.dk-card__description')!.tagName, !!e.querySelector('.dk-card__header > .dk-card__action .dk-badge')]).toEqual(['H3', 'P', true]);
  });

  test('unknown variant, padding and element fall back to outline, md and <div>; as article and li; headingLevel sets the title\'s heading', async () => {
    await render(<Col>
      {/* @ts-expect-error: unknown values, as plain JavaScript could pass */}
      <Card id="bad" variant="glow" padding="xl" as="span">Bad</Card>
      <Card id="art" as="article"><CardHeader title="Level 2" headingLevel={2} /></Card>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}><Card id="li" as="li">Item</Card></ul>
    </Col>);
    expect([el('bad').tagName, el('bad').className, el('bad').dataset.variant]).toEqual(['DIV', 'dk-card', 'outline']);
    expect([el('art').tagName, el('li').tagName, q('#art .dk-card__title').tagName]).toEqual(['ARTICLE', 'LI', 'H2']);
  });

  test('outline: 20px padding, a 1px border, 12px corners, a hairline shadow, parts 16px apart, text-sm', async () => {
    await render(<Variants />);
    const s = css(el('def'));
    expect([s.paddingTop, s.paddingLeft, s.borderTopWidth, s.borderTopStyle, s.borderTopLeftRadius, s.rowGap, s.fontSize, s.lineHeight, s.display, s.flexDirection])
      .toEqual(['20px', '20px', '1px', 'solid', '12px', '16px', '14px', '20px', 'flex', 'column']);
    expect(s.boxShadow).toMatch(/1px 2px/);
  });

  test('elevated: a raised shadow and a transparent border that keeps the size; filled: surface-muted, no shadow, a transparent border', async () => {
    await render(<Variants />);
    const e = css(el('el')), f = css(el('fi'));
    expect(e.boxShadow).toMatch(/4px 6px -1px/);
    expect([e.borderTopColor, e.borderTopWidth]).toEqual(['rgba(0, 0, 0, 0)', '1px']);
    expect([f.backgroundColor, f.borderTopColor]).toEqual([color('var(--surface-muted)'), 'rgba(0, 0, 0, 0)']);
    expect(f.boxShadow === 'none' || /0px 0px 0px 0px/.test(f.boxShadow)).toBe(true);
  });

  test('padding sm 12px, lg 24px, none 0', async () => {
    await render(<Col><Card id="sm" padding="sm">S</Card><Card id="lg" padding="lg">L</Card><Card id="none" padding="none">N</Card></Col>);
    expect(['sm', 'lg', 'none'].map((id) => css(el(id)).paddingTop)).toEqual(['12px', '24px', '0px']);
  });

  test('title: text-base, font-semibold, no margins; description 4px under it', async () => {
    await render(<Card id="def"><Parts /></Card>);
    const s = css(q('#def .dk-card__title'));
    expect([s.fontSize, s.lineHeight, s.fontWeight, s.marginTop + s.marginBottom, css(q('#def .dk-card__description')).marginTop, css(q('#def .dk-card__heading')).rowGap])
      .toEqual(['16px', '24px', '600', '0px0px', '0px', '4px']);
  });

  test('an empty description and no action render nothing; header children go after the description', async () => {
    await render(<Col>
      <Card id="bare"><CardHeader title="Only a title" description="" /></Card>
      <Card id="kids"><CardHeader title="T"><span id="extra">More</span></CardHeader></Card>
    </Col>);
    expect([!!q('#bare .dk-card__description'), !!q('#bare .dk-card__action'), el('extra').parentElement!.className]).toEqual([false, false, 'dk-card__heading']);
  });

  test('footer: justify end (default, and for unknown values), start, between', async () => {
    await render(<Col>
      <Card id="def"><Parts /></Card>
      {/* @ts-expect-error: an unknown justify, as plain JavaScript could pass */}
      <Card id="jst"><CardFooter justify="start">a</CardFooter><CardFooter justify="between">b</CardFooter><CardFooter justify="up">c</CardFooter></Card>
    </Col>);
    expect([...el('jst').querySelectorAll('.dk-card__footer')].map((f) => css(f).justifyContent)).toEqual(['flex-start', 'space-between', 'flex-end']);
    expect(css(q('#def .dk-card__footer')).justifyContent).toBe('flex-end');
  });

  test('href: the whole card is an <a> (no underline, a pointer), named by its text; target _blank adds rel="noopener noreferrer"', async () => {
    await render(<Col><Card id="lnk" href="#here"><CardHeader title="Atlas" description="Updated" /></Card><Card id="blank" href="#x" target="_blank">Out</Card></Col>);
    const e = el('lnk');
    expect([e.tagName, e.getAttribute('href'), css(e).textDecorationLine, css(e).cursor, el('blank').getAttribute('rel'), e.textContent]).toEqual(['A', '#here', 'none', 'pointer', 'noopener noreferrer', 'AtlasUpdated']);
    expect(e.className).toMatch(/dk-card--link/);
  });

  test('hover: a border-strong border', async () => {
    await render(<Card id="lnk" href="#here"><CardHeader title="Atlas" description="Updated" /></Card>);
    const before = css(el('lnk')).borderTopColor, strong = color('var(--border-strong)');
    expect(before).not.toBe(strong);
    await userEvent.hover(el('lnk'));
    await expect.poll(() => css(el('lnk')).borderTopColor).toBe(strong);
  });

  test('focus from the keyboard: a 2px focus-ring outline 2px outside', async () => {
    await render(<Col><Card id="def"><Parts /></Card><Card id="lnk" href="#here"><CardHeader title="Atlas" /></Card></Col>);
    q('#def button').focus();
    await userEvent.tab();
    expect(document.activeElement!.id).toBe('lnk');
    const s = css(el('lnk'));
    expect([s.outlineWidth, s.outlineStyle, s.outlineOffset]).toEqual(['2px', 'solid', '2px']);
  });

  test('component tokens (--card-bg, --card-radius, --card-padding-md) override one card', async () => {
    await render(<Card id="tok" style={{ '--card-bg': 'rgb(1, 2, 3)', '--card-radius': '3px', '--card-padding-md': '7px' } as React.CSSProperties}>Tokens</Card>);
    const s = css(el('tok'));
    expect([s.backgroundColor, s.borderTopLeftRadius, s.paddingTop]).toEqual(['rgb(1, 2, 3)', '3px', '7px']);
  });

  test('contrast: title, description and body keep 4.5:1 on all three variants in all six themes', async () => {
    await render(<Variants />);
    const still = document.createElement('style');
    still.textContent = '*, *::before, *::after { transition: none !important; }';
    document.head.appendChild(still);
    const low: string[] = [];
    let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const id of ['def', 'el', 'fi']) {
        const card = el(id), bg = rgb(css(card).backgroundColor);
        for (const sel of ['.dk-card__title', '.dk-card__description', '.dk-card__body']) {
          const r = ratio(over(rgb(css(card.querySelector(sel)).color), bg), bg); n++;
          if (r < 4.5) low.push(`${th} ${id} ${sel}: ${r.toFixed(2)}`);
        }
      }
    }
    still.remove();
    expect([low, n]).toEqual([[], 54]);
  });

  test('forced colors: outline, elevated and filled cards all show a border', async () => {
    const restore = emulate('forced-colors');
    try {
      await render(<Variants />);
      for (const id of ['def', 'el', 'fi']) {
        const s = css(el(id));
        expect([id, s.borderTopColor !== 'rgba(0, 0, 0, 0)', s.borderTopWidth]).toEqual([id, true, '1px']);
      }
    } finally { restore(); }
  });

  test('reduced motion: no transition on a linked card', async () => {
    const restore = emulate('prefers-reduced-motion');
    try {
      await render(<Card id="lnk" href="#here">Atlas</Card>);
      expect(`${css(el('lnk')).transitionProperty}/${css(el('lnk')).transitionDuration}`).toMatch(/^(all\/0s|none\/0s)$/);
    } finally { restore(); }
  });

  test('no errors or React warnings', async () => {
    const error = vi.spyOn(console, 'error');
    await render(<Col><Variants /><Card href="#x" target="_blank">Out</Card></Col>);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
