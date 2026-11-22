import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css, color } from '../../../tools/test/vitest/helpers';
import { QRCode } from './QRCode';
import { encodeQR } from './encode';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const announcer = () => document.querySelector('[data-srp-announcer]')?.textContent || '';
// A matrix as one string of rows, and a short fingerprint of it.
const rows = (m: boolean[][]) => m.map((r) => r.map((b) => (b ? 1 : 0)).join('')).join('/');
const hash = (s: string) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h; };
const FINDER = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111'];

describe('encodeQR', () => {
  // The two fingerprints are of codes a separate decoder (jsQR) read back to the same text when the encoder was
  // written; a change to the encoder that moves them needs that check again.
  test('makes the codes a decoder reads back: a URL at M, and UTF-8 text at Q', () => {
    expect(hash(rows(encodeQR('https://example.com/pay/1042', 'M')))).toBe(3831412149);
    expect(hash(rows(encodeQR('Hello, dunia! 你好 🌏', 'Q')))).toBe(869707605);
  });

  test('picks the smallest version that fits: 21 modules for a letter, more for more text or a higher level', () => {
    const size = (t: string, l: 'L' | 'M' | 'Q' | 'H' = 'M') => encodeQR(t, l).length;
    expect([size('A', 'L'), size('https://example.com/pay/1042'), size('https://example.com/pay/1042', 'H'), size('x'.repeat(500), 'L')]).toEqual([21, 29, 33, 77]);
    expect(encodeQR('x'.repeat(1200)).length % 4).toBe(1);
  });

  test('the finder patterns sit in three corners, with the timing rows between them', () => {
    const m = encodeQR('https://example.com/pay/1042');
    const n = m.length;
    const block = (x: number, y: number) => m.slice(y, y + 7).map((r) => r.slice(x, x + 7).map((b) => (b ? 1 : 0)).join(''));
    expect([block(0, 0), block(n - 7, 0), block(0, n - 7)]).toEqual([FINDER, FINDER, FINDER]);
    for (let i = 8; i < n - 8; i++) expect([m[6]![i], m[i]![6]]).toEqual([i % 2 === 0, i % 2 === 0]);
  });

  test('throws a RangeError for a value too long for any version', () => {
    expect(() => encodeQR('x'.repeat(3000), 'H')).toThrow(RangeError);
  });
});

describe('QRCode', () => {
  test('renders a <div>; ref, className and other props reach it; the code is one SVG image named by label', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<QRCode id="x" ref={ref} className="extra" data-x="y" value="https://example.com/pay/1042" label="QR code to pay order 1042" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.status]).toEqual(['DIV', true, 'srp-qr-code srp-qr-code--md extra', 'y', 'qr-code', 'active']);
    const svg = e.querySelector('svg')!;
    expect([svg.getAttribute('role'), svg.getAttribute('aria-label'), svg.getAttribute('viewBox')]).toEqual(['img', 'QR code to pay order 1042', '0 0 37 37']);
    expect(e.querySelectorAll('path').length).toBe(1);
  });

  test('the sizes are 96, 160 and 240 pixels, quiet zone included', async () => {
    await render(<>
      <QRCode id="s" size="sm" value="a" label="a" />
      <QRCode id="m" value="a" label="a" />
      <QRCode id="l" size="lg" value="a" label="a" />
    </>);
    expect(['s', 'm', 'l'].map((id) => Math.round(el(id).querySelector('svg')!.getBoundingClientRect().width))).toEqual([96, 160, 240]);
  });

  test('it is dark on light in every theme, dark ones included, for the scanner\'s sake', async () => {
    await render(<QRCode id="c" value="https://example.com" label="Code" />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const dark = css(el('c').querySelector('path')).fill;
      const light = css(el('c').querySelector('rect')).fill;
      expect([color(dark), color(light)], th).toEqual(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']);
    }
  });

  test('a logo sits on a light square in the middle, and turns the level up to H', async () => {
    await render(<>
      <QRCode id="p" value="https://example.com/pay/1042" label="Pay" />
      <QRCode id="g" value="https://example.com/pay/1042" label="Pay" logo="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
    </>);
    const image = el('g').querySelector('image')!;
    expect(image.getAttribute('href')).toContain('data:image/gif');
    // H needs more modules than M for the same value: 33 + 8 against 29 + 8.
    expect([el('p').querySelector('svg')!.getAttribute('viewBox'), el('g').querySelector('svg')!.getAttribute('viewBox')]).toEqual(['0 0 37 37', '0 0 41 41']);
    expect(Number(image.getAttribute('x')) + Number(image.getAttribute('width')) / 2).toBe(20.5);
  });

  test('a value too long draws no modules and warns once, in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<QRCode id="t" value={'x'.repeat(3000)} label="Too long" level="H" />);
    expect(el('t').querySelector('path')).toBeNull();
    expect(warn.mock.calls.flat().join(' ')).toContain('Shorten it');
    warn.mockRestore();
  });

  test('loading shows a Loader; expired says so with a button that calls onRefresh; scanned says so with a check', async () => {
    const onRefresh = vi.fn();
    await render(<>
      <QRCode id="lo" value="a" label="a" status="loading" />
      <QRCode id="ex" value="a" label="a" status="expired" onRefresh={onRefresh} />
      <QRCode id="sc" value="a" label="a" status="scanned" />
      <QRCode id="nb" value="a" label="a" status="expired" />
    </>);
    expect(el('lo').querySelector('[data-component="loader"]')).not.toBeNull();
    expect(el('ex').querySelector('p')!.textContent).toBe('Code expired');
    await userEvent.click(el('ex').querySelector('button')!);
    expect(onRefresh).toHaveBeenCalledOnce();
    expect([el('sc').textContent, el('sc').querySelector('p [data-icon]') !== null]).toEqual(['Scanned', true]);
    expect(el('nb').querySelector('button')).toBeNull();
  });

  test('a status that changes after it shows is said; the first one isn\'t', async () => {
    const { rerender } = await render(<QRCode id="a" value="a" label="Code" status="expired" />);
    expect(announcer()).not.toContain('Code expired');
    await rerender(<QRCode id="a" value="a" label="Code" />);
    await rerender(<QRCode id="a" value="a" label="Code" status="scanned" />);
    await expect.poll(announcer).toContain('Scanned');
    await rerender(<QRCode id="a" value="a" label="Code" status="expired" />);
    // Said once "Scanned" has had its half second (announce's HOLD), which a busy WebKit run took past the second a poll waits.
    await expect.poll(announcer, { timeout: 3000 }).toContain('Code expired');
  });

  test('the status message reads 4.5:1 over the faded code, on its light and its dark modules, in every theme', async () => {
    await render(<QRCode id="v" value="a" label="a" status="scanned" />);
    const mix = (fg: string, bg: string, a: number) => {
      const [f, b] = [color(fg), color(bg)].map((c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number));
      return 'rgb(' + f!.map((x, i) => Math.round(x * a + b![i]! * (1 - a))).join(', ') + ')';
    };
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const faded = Number(css(el('v').querySelector('svg')).opacity);
      const surface = css(el('v')).backgroundColor;
      const text = css(el('v').querySelector('p')).color;
      for (const module of ['rgb(0, 0, 0)', 'rgb(255, 255, 255)']) expect(contrast(text, mix(module, surface, faded)), th + ' ' + module).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('the words come from the labels: Indonesian', async () => {
    await render(<SerupaProvider labels={idLabels}>
      <QRCode id="i" value="a" label="a" status="expired" onRefresh={() => {}} />
    </SerupaProvider>);
    expect(el('i').textContent).toBe('Kode kedaluwarsaMinta kode baru');
  });
});
