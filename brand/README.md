# The Serupa logo

The mark is **Nitik**: the Javanese batik motif kawung (four petals around a centre) drawn in square dots, the way nitik batik draws motifs from tiny squares to imitate woven cloth. Every dot is the same unit, so the mark is made of parts that are alike, which is what *serupa* means. The name beside it is set in Plus Jakarta Sans ExtraBold, a typeface designed in Jakarta by Tokotype, and outlined so it needs no font. Plus Jakarta Sans is under the SIL Open Font License 1.1.

Kawung and nitik are shared Indonesian cultural heritage. Credit them wherever the mark is explained.

## Files

| File | Use it for |
| --- | --- |
| `serupa-mark.svg` | The mark at any size from 48px up: slides, the docs hero, print. |
| `serupa-mark-32.svg` | The mark at exactly 32px: a 3px dot and a 1px gap. |
| `serupa-mark-24.svg` | The mark at exactly 24px: a 2px dot and a 1px gap (the docs site header). |
| `serupa-mark-16.svg` | The mark at exactly 16px: 2px cells with no gap, so the dots join into a solid kawung. |
| `serupa-logo.svg` | The mark and the name, in one color (`currentColor`). |
| `serupa-logo-light.svg` | The mark and the name for a light background: blue mark, near-black name. |
| `serupa-logo-dark.svg` | The mark and the name for a dark background: light blue mark, near-white name. |

The docs site's own copies are in `site/public/`: `favicon.svg` (the 16px drawing, which switches to the dark color when the screen prefers dark), `apple-touch-icon.png`, `icon-192.png` and `icon-512.png` (the white mark on blue, inside the safe zone of a maskable icon) and `og.png` (the link preview).

## Sizes

The mark is a 7 by 7 grid. Below 48px, use the drawing made for that size instead of scaling another one: each is snapped so every cell is a whole number of screen pixels, which keeps the dots sharp. A freely scaled mark at 16px puts cells between pixels and blurs.

| Size | Cell | Dot | Gap |
| --- | --- | --- | --- |
| 16px | 2px | 2px | none |
| 24px | 3px | 2px | 1px |
| 32px | 4px | 3px | 1px |
| 48px and up | any | 0.775 of the cell | the rest |

Don't use the full logo below 24px tall; use the mark alone.

## Color

The mark and the one-color logo are filled with `currentColor`, so they take the color of the text around them. To follow the theme, set it to the brand color: `color: var(--primary)` for the mark (or `fill: var(--primary)` on an inline SVG), and `var(--on-primary)` when it sits on a brand-colored surface. In every one of the 34 themes the mark has at least 4.7:1 contrast on the surface and on the brand color, above the 3:1 that WCAG asks of a graphic.

In forced-colors mode, draw it in `CanvasText`, as the docs site does.

## Keep it as it is

- Keep at least two cells of space around the mark, and the space of the mark's width around the full logo.
- Don't stretch it, rotate it, round the dots, outline it or add a shadow or gradient.
- Don't color the dots differently from one another. The mark is one color.
- With the [Logo](../src/components/Logo/README.md) component, pass `serupa-logo-light.svg` as `src`, `serupa-logo-dark.svg` as `darkSrc`, and `serupa-mark-24.svg` or `serupa-mark-32.svg` as `markSrc`.
