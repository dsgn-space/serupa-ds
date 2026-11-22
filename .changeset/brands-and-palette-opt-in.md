---
"@diki-stwn/serupa-ds": major
---

Every brand but blue is its own file, so an app downloads only the brands it uses.

- **What breaks:** `tokens.css` has blue only. A page with `data-brand="violet"` or `data-theme="violet-dark"` (or any brand but blue) draws blue until it loads `@diki-stwn/serupa-ds/brands/violet.css` after `tokens.css`; `brands/all.css` holds every brand, for an app where people switch brands.
- **Why:** every app loaded all 17 brands to use one: the 16 others were 27% of `tokens.css` gzipped (15.1 KB, now 11.1 KB, and about 0.6 KB per brand).
- **Migration:** add `import '@diki-stwn/serupa-ds/brands/<brand>.css'` after `tokens.css` for each brand the app uses. `serupa-create --brand violet` writes the brand's import. `serupa-migrate --from 16` lists each file that names a brand without the file (`serupa-migrate` lists them)
