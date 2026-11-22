# ADR-0020: Brands other than blue, and the palette utility classes, are files an app opts into

**Status:** Accepted
**Deciders:** Diki, 21 November 2026 (deep audit, decision 2). Ships in 17.0.0.

## Context

`tokens.css` carried all 17 brands, so an app on one brand downloaded the other 16: 43% of the file, 26% after compression. Only blue, yellow and violet are drawn and tested in the component pictures, which is how fuchsia's hover color could point at violet unseen.

`utilities.css` carried a class for every palette step (`bg-red-500`, `text-slate-700`): 12,342 classes, 44% of the file. Nothing in the repo uses one. They name a raw color, so they don't follow the theme, which works against the system's own rule that color comes from roles (`bg-primary`, `text-muted`).

The alternative was to keep one file each and only close the test gap by drawing every brand nightly. That fixes safety and leaves the weight.

## Decision

- **`tokens.css` holds blue and the shared tokens.** Every other brand is `brands/<brand>.css`, and `brands/all.css` holds them all for a page that switches brands. Without its file, a brand draws as blue.
- **The palette classes move to `utilities-palette.css`.** The role classes stay in `utilities.css`.
- **The docs site and Storybook load every brand,** so the brand switcher works there as before.
- **`serupa-migrate` adds the imports** (`brands-opt-in`, `utilities-palette` in 17.0.0), and `serupa-create` adds the brand file for an app that isn't blue.

## Consequences

- An app on blue downloads less with no change. An app on another brand, or using palette classes, adds one import, which the migration writes for it.
- A new brand is a new file, not a heavier `tokens.css` for everyone.
- Nothing looks different: every brand draws as it did once its file is loaded.
