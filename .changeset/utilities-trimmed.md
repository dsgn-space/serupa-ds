---
"@diki-stwn/serupa-ds": major
---

The utility classes keep what an app lays out and colors with, and drop the families nothing used: `bundle.css` is 1.10 MB (135 KB gzipped), from 1.70 MB in 16.1.0, and `utilities.css` 64 KB gzipped.

- **What breaks:** these classes are gone, with their `sm:` … `2xl:` versions, and so is `utilities-extra.css`:
  - a palette step in any color class: `bg-red-500`, `text-slate-700`, `border-zinc-200/50`, `ring-blue-500`. The role classes (`bg-primary`, `text-text-muted`, `border-border`), `white` and `black` stay.
  - masks (`mask-*`) and gradients (`bg-linear-*`, `bg-radial`, `bg-conic`, `from-*`, `via-*`, `to-*`).
  - filters: `blur-*`, `brightness-*`, `contrast-*`, `grayscale`, `invert`, `sepia`, `hue-rotate-*`, `saturate-*`, `drop-shadow-*`, `backdrop-*`.
  - transforms but translate: `rotate-*`, `scale-*`, `skew-*`, `perspective-*`, `backface-*`, `transform-*`, `origin-*`, `zoom-*`.
  - `columns-*`, `break-after/before/inside-*`, `mix-blend-*`, `bg-blend-*`, `text-shadow-*`, `inset-shadow-*`, `inset-ring-*`, `tab-*`.
  - scales inside the families that stay: a color on one side of a border (`border-t-danger`: use `border-t border-danger`), negative scroll margins and the block-side and physical-side scroll margins and paddings (`scroll-mb-*`, `scroll-pl-*`; `scroll-mt-*`, `scroll-pt-*`, the inline sides and all sides stay), and `translate-<step>`, `translate-z-*` and `translate-3d` (`translate-x-*` and `translate-y-*` stay).
- **Why:** the system's own patterns and blocks use 221 of the 28,000 classes, and none of these. A palette step doesn't follow the theme, so a role is the right class anyway. The tokens all stay.
- **Migration:** use a role class for a color, or write the property in the app's own CSS from the tokens (`background: var(--red-500)`, `filter: blur(var(--blur-md))`, `rotate: var(--rotate-45)`). `serupa-migrate --from 16` lists each file that uses a removed class (`serupa-migrate` lists them)
