# ADR-0025: A dark theme fills with its light theme's brand shade, and brand text is its own token

**Status:** Accepted
**Deciders:** Diki, 22 November 2026: asked for light and dark colors that aren't too different, as Apple's system colors are, and agreed to the fill keeping its shade in both modes with a lighter one for text. Ships in 18.0.0.

## Context

`primary` was one token with two jobs: the fill of a primary button, a checked box or a selected day, and the color of brand text, links, icons and thin lines. In light themes one shade does both (brand 600 or 700: white text on it at 4.5:1, and 4.5:1 as text on white). In dark themes no shade can: text on a dark card needs a light shade (brand 400, 7:1), and a light shade can't carry white text. So dark themes filled with brand 400 under brand-950 text.

That made the two modes look like different brands. Blue Light's button was `blue-600` (#2563eb) under white; Blue Dark's was `blue-400` (#60a5fa) under navy, 0.17 lighter in OKLCH and with its text flipped. Every brand moved 0.16 to 0.32.

Apple's system colors move a few points between modes (systemBlue #007AFF to #0A84FF) and keep white on them. The status colors here already did the same: `danger` is `red-600` under white in both modes, with `danger-text` for text.

## Decision

- **`primary` is the fill, the same shade in both modes.** A dark theme's `primary` is its light theme's, under a white `on-primary`, lightened in OKLCH (hue and chroma kept) only as far as 3:1 on a raised dark card (`surface-raised`, zinc-800) asks, with a little room (3.05:1). `blue-600` #2563eb becomes #2968f0. No brand moves more than 0.07; yellow, lime, green and amber move under 0.01. White text keeps 4.8:1 or more.
- **Hover and held down are the light theme's too,** lightened by the same amount: darker than the fill in both modes.
- **`primary-text` is the brand as text, a line, a border or an icon,** with `primary-text-hover`. In light themes it is `primary`'s shade; in dark, brand 400 and 300, what `primary` was. It keeps 4.5:1 on every surface and tint.
- **The dark fills are written as colors, not palette steps,** since they sit between two steps. `darkFillShift` in `bin/brand/generate.mjs` is the rule; `serupa-brand` uses it for a new brand, and `tools/test/brand.mjs` fails a shipped theme whose dark fill isn't what it gives.
- **More contrast is unchanged in dark:** brand 300 under brand-950 text, since 7:1 as text and a fill that stands out need the light shade there.
- **Which token a component takes:** a fill that carries `on-primary` content or is a solid mark on a surface (Button, Checkbox, Radio, Switch, Slider, Progress, Meter, the selected day, the current page, a Stepper circle) takes `primary`. Text, icons, checks, 1px or 2px lines and borders, and anything drawn on `primary-subtle` take `primary-text`.

## Options considered

- **Brand 500 in dark.** Closer than 400, but white text on it is 3.7:1 and navy text 4.0:1 for blue: neither passes.
- **The light shade unchanged.** `blue-600` is 2.88:1 on a raised dark card, under the 3:1 a Meter's fill or a checked box needs there. Lightening by 0.014 fixes it and can't be seen side by side.
- **Keep one token and accept brand 400.** No change for projects, and the modes keep looking like two brands.

## Consequences

- A primary button, a Switch that's on and a Progress bar are the same color in light and dark. Links, the line under a tab and outline buttons in dark look as they did.
- Text set from `--primary` in a project's own CSS is 3.6:1 on a dark card, and a theme file made before 18.0.0 has no `--primary-text`. `serupa-migrate` rewrites the first and lists the second.
- The status fills (`info`, `success`, `warning`) and Badge's palette still take a lighter shade in dark. They can follow the same rule in a later release without a new token, since each already has its `-text`.
