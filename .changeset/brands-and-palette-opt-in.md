---
"@diki-stwn/serupa-ds": major
---

Every brand but blue is its own file, and the classes on a palette step move out of `bundle.css`, so an app downloads only what it uses.

- **What breaks:** `tokens.css` has blue only. A page with `data-brand="violet"` or `data-theme="violet-dark"` (or any brand but blue) draws blue until it loads `@diki-stwn/serupa-ds/brands/violet.css` after `tokens.css`; `brands/all.css` holds every brand, for an app where people switch brands. The utility classes on a palette step (`bg-red-500`, `text-slate-700`, `border-zinc-200/50`) are no longer in `bundle.css` or `utilities.css`: they ship in `utilities-palette.css`. The role classes (`bg-primary`, `text-text-muted`, `border-border`) stay, and so do the gradient stops, in `utilities-extra.css`.
- **Why:** every app loaded all 17 brands to use one: the 16 others were 27% of `tokens.css` gzipped (15.1 KB, now 11.1 KB, and about 0.6 KB per brand). The palette-step classes were 44% of the utility rules and nothing in the system used one, because a role follows the theme and a palette step doesn't: `bundle.css` goes from about 1.7 MB to 1.3 MB, and `utilities.css` from about 120 KB to 82 KB gzipped.
- **Migration:** add `import '@diki-stwn/serupa-ds/brands/<brand>.css'` after `tokens.css` for each brand the app uses, and `import '@diki-stwn/serupa-ds/utilities-palette.css'` after the bundle if it uses a palette-step class (better: use the role). `serupa-create --brand violet` writes the brand's import. `serupa-migrate --from 16` lists each file that names a brand or a palette-step class without the file (`serupa-migrate` lists them)
