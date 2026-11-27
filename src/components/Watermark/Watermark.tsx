'use client';
import * as React from 'react';
import { cn } from '../../internal/cn';
import { named } from '../../internal/component';

export interface WatermarkProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The words repeated across the content: one line, or one line per item, such as a name and an email. */
  text: string | readonly string[];
  /** Room between the marks: 'md' (the default) or 'lg', a sparser mark. It grows with the mark's text size. */
  gap?: 'md' | 'lg' | undefined;
  /** The angle of the text in degrees, -90 to 90. Negative tilts it up to the right. Defaults to -22. */
  rotate?: number | undefined;
  /** Cover the whole window instead of its own box, for a shared screen. */
  fullPage?: boolean | undefined;
  /** The content the mark lies over. */
  children?: React.ReactNode;
}

// The room between marks, in multiples of the mark's font size (--watermark-font-size), so it scales with the text.
const GAP = { md: 3, lg: 6 } as const;
// The SVG is drawn in its own units: 100 of them make one em, so a tile is (its size in em) × the font-size token.
const EM = 100;
const LINE = 1.4;

// A width estimate in em, since nothing is measured: on the server and before layout there is no font to measure
// with. Wide scripts (CJK, Hangul, emoji) take about 1em a character, the rest about 0.62em; too wide only adds room.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1f000}-\u{1faff}\u{20000}-\u{3fffd}]/u;
const width = (line: string) => [...line].reduce((sum, ch) => sum + (WIDE.test(ch) ? 1 : 0.62), 0);

const escape = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
const round = (n: number) => Math.round(n * 100) / 100;

/** The mark as one tile: the lines centred in a box turned by `rotate`, with `gap` around it. @internal */
export function tile(lines: readonly string[], gap: number, rotate: number) {
  const w = Math.max(1, ...lines.map(width));
  const h = lines.length * LINE;
  const rad = (rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const tw = round(w * cos + h * sin + gap);
  const th = round(w * sin + h * cos + gap);
  const first = round((-(lines.length - 1) * LINE * EM) / 2);
  const spans = lines.map((l, i) => `<tspan x="0" ${i ? `dy="${LINE * EM}"` : `y="${first}"`}>${escape(l)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round((-tw * EM) / 2)} ${round((-th * EM) / 2)} ${round(tw * EM)} ${round(th * EM)}">`
    + `<text transform="rotate(${rotate})" font-family="system-ui,sans-serif" font-weight="600" font-size="${EM}" text-anchor="middle" dominant-baseline="central">${spans}</text></svg>`;
  return { w: tw, h: th, url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

function WatermarkRender({ ref, className, text, gap, rotate, fullPage, children, ...rest }: WatermarkProps & React.RefAttributes<HTMLDivElement>) {
  const lines = (typeof text === 'string' ? [text] : [...text]).map((l) => l.trim()).filter(Boolean);
  const angle = Math.max(-90, Math.min(90, rotate != null && Number.isFinite(rotate) ? rotate : -22));
  const mark = tile(lines, GAP[gap ?? 'md'] ?? GAP.md, angle);
  return (
    <div {...rest} ref={ref} className={cn('srp-watermark', fullPage && 'srp-watermark--full-page', className)} data-component="watermark">
      {children}
      {lines.length > 0 && (
        <div
          aria-hidden="true"
          className="srp-watermark__mark"
          style={{ '--srp-watermark-image': mark.url, '--srp-watermark-w': mark.w, '--srp-watermark-h': mark.h } as React.CSSProperties}
        />
      )}
    </div>
  );
}

/** Repeats a name or a word faintly across its content, or the whole window, so a screenshot or a printout shows
 *  where it came from. Decorative: screen readers, the pointer, selection and copy all pass through it.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Watermark = /* @__PURE__ */ named('Watermark', WatermarkRender);
