---
"serupa-ds": minor
---

The third brand, `emerald`, is now **Modern**: a calm, neutral look with one teal accent. Its id stays `emerald`, so nothing in your code changes, but pages that use it will look different.

- The accent is teal (`teal-700` in light, `teal-400` in dark) instead of emerald green. Everything else stays neutral zinc.
- Dark mode sits on a deeper canvas (`zinc-950`), with raised surfaces, fields and menus on `zinc-900` and softer borders.
- Controls have 8px corners and surfaces (menus, popovers, alerts, tables) 12px, matching cards and dialogs.
- Shadows are one step softer, and a raised card in light keeps a 1px hairline edge.
- Motion is quicker and quieter: nothing over 200ms, no overshoot, and the soft spring instead of the snappy one.
- Charts lead with teal too: the first series, the sequential ramp (sparklines, heat maps) and the cool end of the diverging ramp. The other series are re-picked (orange, purple, blue, yellow, pink, violet, red) so neighbouring series, and any two of the first four, stay distinct under colour blindness.
- `space-surface` and `space-section` are larger (32px and 48px), for more room around surfaces and sections.
- The theme names are "Modern Light" and "Modern Dark".

Any brand can now set its own size, shadow, duration and easing tokens, not only colors: `tokens.css` writes them into the brand's `[data-brand]` and `[data-theme]` rules, and `data-shadow` keeps a brand's own elevation roles.

If you relied on the old emerald green as your primary color, set it back on your page: `--primary: light-dark(var(--emerald-700), var(--emerald-400))` (and the same for `--primary-hover`, `--primary-subtle` and `--focus-ring`).

More contrast (`data-contrast="more"` or the system setting) now also wins over a brand's own neutral colors, so Modern's softer borders still step up to the stronger ones, on the page and in a nested `data-mode` section.
