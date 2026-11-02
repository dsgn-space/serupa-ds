import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { Logo } from './Logo';

const svg = (w: number, body: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="32" viewBox="0 0 ${w} 32">${body}</svg>`);
const mark = (bg: string, fg: string) => `<rect width="32" height="32" rx="8" fill="${bg}"/><path d="M9 23 16 8l7 15h-4l-3-7-3 7z" fill="${fg}"/>`;
const word = (fill: string) => `<text x="42" y="23" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="${fill}">Acme</text>`;
const logo = svg(104, mark('#1d4ed8', '#fff') + word('#0f172a'));
const logoDark = svg(104, mark('#60a5fa', '#0f172a') + word('#f8fafc'));
const logoMark = svg(32, mark('#1d4ed8', '#fff'));
const logoMarkDark = svg(32, mark('#60a5fa', '#0f172a'));
const el = (id: string) => document.getElementById(id) as HTMLImageElement;
const loaded = (i: HTMLImageElement) => expect.poll(() => i.complete && i.currentSrc !== '').toBe(true);
const sources = (i: HTMLImageElement) => [...(i.parentElement as HTMLElement).querySelectorAll('source')].map((s) => [s.srcset === logoMark ? 'mark' : s.srcset === logoMarkDark ? 'markDark' : s.srcset === logoDark ? 'dark' : s.srcset, s.media]);

describe('Logo', () => {
  test('renders an <img> named by alt; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLImageElement>();
    await render(<Logo id="x" ref={ref} src={logo} alt="Acme" className="extra" data-x="y" />);
    const e = el('x');
    expect([e.tagName, e.alt, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.parentElement!.tagName]).toEqual(['IMG', 'Acme', true, 'dk-logo dk-logo--md extra', 'y', 'logo', 'DIV']);
    await expect.element(page.getByRole('img', { name: 'Acme' })).toBeVisible();
  });

  test('size sets its height (24, 32, 40px) and the width follows its shape', async () => {
    await render(<>{(['sm', 'md', 'lg'] as const).map((s) => <Logo key={s} id={s} src={logo} alt="" size={s} />)}</>);
    for (const [s, h] of [['sm', 24], ['md', 32], ['lg', 40]] as const) {
      await loaded(el(s));
      const r = el(s).getBoundingClientRect();
      expect([r.height, Math.round(r.width)], s).toEqual([h, Math.round((h * 104) / 32)]);
    }
  });

  test('a dark theme shows the dark version, and a light one the light, again when the theme changes', async () => {
    document.documentElement.setAttribute('data-theme', 'blue-dark');
    await render(<Logo id="d" src={logo} darkSrc={logoDark} alt="Acme" />);
    await expect.poll(() => el('d').currentSrc).toBe(logoDark);
    document.documentElement.setAttribute('data-theme', 'blue-light');
    await expect.poll(() => el('d').currentSrc).toBe(logo);
  });

  test('variant mark shows the small mark, in light and dark themes', async () => {
    document.documentElement.setAttribute('data-theme', 'emerald-light');
    await render(<Logo id="m" src={logo} darkSrc={logoDark} markSrc={logoMark} markDarkSrc={logoMarkDark} alt="Acme" variant="mark" />);
    await expect.poll(() => el('m').currentSrc).toBe(logoMark);
    document.documentElement.setAttribute('data-theme', 'emerald-dark');
    await expect.poll(() => el('m').currentSrc).toBe(logoMarkDark);
    await loaded(el('m'));
    expect(el('m').getBoundingClientRect().width).toBe(32);
  });

  test('variant auto offers the mark below collapseBelow (768px by default), ahead of the full logo', async () => {
    document.documentElement.setAttribute('data-theme', 'violet-light');
    const { rerender } = await render(<Logo id="a" src={logo} darkSrc={logoDark} markSrc={logoMark} markDarkSrc={logoMarkDark} alt="Acme" variant="auto" />);
    await expect.poll(() => sources(el('a'))).toEqual([['mark', '(max-width: 767.98px)']]);
    await rerender(<Logo id="a" src={logo} markSrc={logoMark} alt="Acme" variant="auto" collapseBelow="sm" />);
    expect(sources(el('a'))).toEqual([['mark', '(max-width: 639.98px)']]);
    await rerender(<Logo id="a" src={logo} markSrc={logoMark} alt="Acme" variant="auto" collapseBelow="lg" />);
    expect(sources(el('a'))).toEqual([['mark', '(max-width: 1023.98px)']]);
    document.documentElement.setAttribute('data-theme', 'violet-dark');
    await rerender(<Logo id="a" src={logo} darkSrc={logoDark} markSrc={logoMark} markDarkSrc={logoMarkDark} alt="Acme" variant="auto" />);
    await expect.poll(() => sources(el('a'))).toEqual([['markDark', '(max-width: 767.98px)'], ['mark', '(max-width: 767.98px)'], ['dark', 'all']]);
  });

  test('where the theme follows the screen, prefers-color-scheme picks the version', async () => {
    document.documentElement.removeAttribute('data-theme');
    await render(<div style={{ colorScheme: 'light dark' }}><Logo id="s" src={logo} darkSrc={logoDark} alt="Acme" /></div>);
    await expect.poll(() => sources(el('s'))).toEqual([['dark', '(prefers-color-scheme: dark)']]);
  });

  test('without a mark, every variant shows the full logo; without a dark version, no <picture>', async () => {
    await render(<><Logo id="f" src={logo} alt="Acme" variant="mark" /><Logo id="g" src={logo} alt="Acme" variant="auto" /></>);
    expect([el('f').getAttribute('src'), el('f').parentElement!.tagName, el('g').parentElement!.tagName]).toEqual([logo, 'DIV', 'DIV']);
  });

  test('alt="" leaves it out of the accessibility tree, for a link home that is named itself', async () => {
    await render(<a href="#home" aria-label="Acme home"><Logo id="l" src={logo} alt="" /></a>);
    expect(el('l').alt).toBe('');
    await expect.element(page.getByRole('link', { name: 'Acme home' })).toBeVisible();
  });
});
