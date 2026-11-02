---
'serupa-ds': minor
---

- **`serupa-brand`, a theme from your brand color (I5).** `npx serupa-brand acme "#0f766e" -o acme-theme.css` makes the brand's shades (50 to 950, in OKLCH, the color among them) and a light and a dark theme whose brand aliases pass the same contrast as the shipped themes, 7:1 for more contrast too. Load it after `tokens.css` and set `data-theme="acme-light"`, or `data-brand="acme"` with `data-mode`. `--corners sharp` or `round` sets the radius roles. A color no shade of which can pass is refused, with the reason.
- **theme.js takes your own brands.** Name them on the page, `<html data-brands="acme">`, and `data-brand="acme"` and `Serupa.theme.set({ brand: 'acme' })` work; `ThemeBrand` takes any string too.
