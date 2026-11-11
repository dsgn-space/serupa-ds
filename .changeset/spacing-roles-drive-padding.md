---
"serupa-ds": minor
---

Spacing roles now set the padding the docs say they do: Dialog, Drawer and Card `padding="lg"` read `--space-surface`, and Popover reads `--space-content`, so setting a role on `:root` or on part of the page makes them denser or roomier with it. Nothing changes until you set one: the values are the same (24px and 16px). A component's own token (`--dialog-padding`, `--drawer-padding`, `--card-padding-lg`, `--popover-padding`) still wins. The usage text no longer promises a 24px card (Card's default, md, is 20px) or menu padding from `space-content`.
