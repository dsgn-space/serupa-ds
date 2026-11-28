import { describe, expect, test } from 'vitest';
import script from './theme.js?raw';

type Info = { brand: string; mode: string; theme: string };
type Theme = { get(): Info; set(o: { brand?: string; mode?: string }): Info; onChange(fn: (i: Info) => void): () => void };

// theme.js runs once per page, so each case gets a page of its own: an iframe with the <html> attributes it starts from.
// The iframe shares this page's storage, so no case starts from a choice another one saved.
async function page(htmlAttrs: string) {
  localStorage.removeItem('serupa-theme');
  const frame = document.createElement('iframe');
  frame.srcdoc = `<!doctype html><html ${htmlAttrs}><head><script>${script}</script></head><body><p>x</p></body></html>`;
  document.body.appendChild(frame);
  await new Promise((ok) => frame.addEventListener('load', ok, { once: true }));
  const win = frame.contentWindow as Window & { Serupa: { theme: Theme } };
  return { win, html: frame.contentDocument!.documentElement, done: () => { frame.remove(); localStorage.removeItem('serupa-theme'); } };
}

describe('theme.js', () => {
  test('a page\'s own data-theme of a brand it names with a digit in it, like b2b-dark, is kept', async () => {
    const p = await page('data-brands="b2b" data-theme="b2b-dark"');
    try {
      expect([p.html.getAttribute('data-theme'), p.win.Serupa.theme.get().brand, p.win.Serupa.theme.get().mode]).toEqual(['b2b-dark', 'b2b', 'dark']);
    } finally { p.done(); }
  });

  test('onChange hears a change of mode that keeps the same colors, light to auto under a light system, crossfade or not', async () => {
    const p = await page('data-brand="blue" data-mode="light"');
    try {
      const seen: string[] = [];
      p.win.Serupa.theme.onChange((i) => seen.push(`${i.theme}:${i.mode}`));
      const scheme = p.win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      p.win.Serupa.theme.set({ mode: scheme === 'dark' ? 'dark' : 'light' });
      p.win.Serupa.theme.set({ mode: 'auto' });
      await expect.poll(() => seen.at(-1)).toBe(`blue-${scheme}:auto`);
    } finally { p.done(); }
  });
});
