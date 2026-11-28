import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { PageSection } from './PageSection';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const inner = (id: string) => el(id).firstElementChild as HTMLElement;
afterEach(async () => { await page.viewport(900, 700); document.documentElement.removeAttribute('data-theme'); });

describe('PageSection', () => {
  test('defaults: a <section> on the page\'s background, 64px above and below at 900px wide, a Container (xl) inside; ref, className and props reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<PageSection id="s" ref={r} className="extra" aria-label="Features" data-x="y"><p>One</p><p>Two</p></PageSection>);
    const e = el('s'), s = css(e);
    expect([e.tagName, e.className, e.dataset.component, r.current === e, e.dataset.x, e.getAttribute('aria-label')]).toEqual(['SECTION', 'srp-page-section srp-page-section--md extra', 'page-section', true, 'y', 'Features']);
    expect([s.paddingTop, s.paddingBottom, s.backgroundColor, s.borderTopStyle]).toEqual(['64px', '64px', 'rgba(0, 0, 0, 0)', 'none']);
    expect([inner('s').dataset.component, inner('s').dataset.size, css(inner('s')).rowGap, css(inner('s')).flexDirection]).toEqual(['container', 'xl', '32px', 'column']);
  });

  test('spacing grows from 768px: sm 32, md 48 then 64, lg 64 then 96', async () => {
    await render(<><PageSection id="sm" spacing="sm" aria-label="a">x</PageSection><PageSection id="md" aria-label="b">x</PageSection><PageSection id="lg" spacing="lg" aria-label="c">x</PageSection></>);
    const pads = () => ['sm', 'md', 'lg'].map((id) => css(el(id)).paddingTop);
    await page.viewport(600, 700);
    await expect.poll(() => window.innerWidth).toBe(600);
    const narrow = pads();
    await page.viewport(1000, 700);
    await expect.poll(() => window.innerWidth).toBe(1000);
    expect([narrow, pads()]).toEqual([['32px', '48px', '64px'], ['32px', '64px', '96px']]);
  });

  test('tone="muted" with a divider: surface-muted, a line on top, and the text reads 4.5:1 on it in every theme', async () => {
    await render(<><PageSection id="s" tone="muted" divider aria-label="a"><p id="t" className="text-text-muted">Muted text</p></PageSection><div id="probe" className="bg-surface-sunken" /></>);
    const s = css(el('s'));
    expect([el('s').className, s.borderTopStyle, s.borderTopWidth]).toEqual(['srp-page-section srp-page-section--md srp-page-section--muted srp-page-section--divider', 'solid', '1px']);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(el('s')).backgroundColor, probe = css(el('probe')).backgroundColor;
      expect([bg === probe, contrast(css(el('t')).color, bg) >= 4.5], th).toEqual([true, true]);
    }
  });

  test('align="center", size, gap and as', async () => {
    await render(<PageSection id="s" as="header" align="center" size="md" gap={4}><p>x</p></PageSection>);
    const i = inner('s');
    expect([el('s').tagName, css(i).alignItems, css(i).textAlign, i.dataset.size, css(i).rowGap]).toEqual(['HEADER', 'center', 'center', 'md', '16px']);
  });

  test('size passes every Container width on: prose, 2xl and full', async () => {
    await render(<><PageSection id="a" size="prose"><p>x</p></PageSection><PageSection id="b" size="2xl"><p>x</p></PageSection><PageSection id="c" size="full"><p>x</p></PageSection></>);
    expect(['a', 'b', 'c'].map((id) => inner(id).dataset.size)).toEqual(['prose', '2xl', 'full']);
  });

  test('unknown tone, spacing and as fall back to plain, md and <section>', async () => {
    await render(<PageSection id="s" tone={'loud' as never} spacing={'xl' as never} as={'table' as never} aria-label="a">x</PageSection>);
    expect([el('s').tagName, el('s').className]).toEqual(['SECTION', 'srp-page-section srp-page-section--md']);
  });
});
