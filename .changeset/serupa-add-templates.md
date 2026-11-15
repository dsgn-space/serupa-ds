---
"@diki-stwn/serupa-ds": minor
---

- New `serupa-add` command: write a ready-made screen or section into your app as source you own. `npx serupa-add` lists the patterns (Dashboard, Sign in, Settings form, Team members and 18 more) and blocks (Page header, Pricing, Stats row and 10 more), and `npx serupa-add Dashboard` writes `src/serupa/Dashboard.tsx` with the blocks it builds on. Their imports point at the package. A file you've already changed is left alone unless you pass `--force`, and `--to` picks another folder. Checkout and Comment thread aren't offered yet, because they use helpers the package doesn't export.
- Page header's "More actions" button on narrow screens is now an IconButton, so the block uses only what the package exports. It looks and works the same.
