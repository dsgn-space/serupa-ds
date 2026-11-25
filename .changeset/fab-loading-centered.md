---
"@diki-stwn/serupa-ds": patch
---

Fab and FabMenu: a loading Fab's spinner is centered and as big as its 24px icon. Fab's rule that sizes its icon's SVG also stretched the spinner's ring to 24px inside Button's 16px spinner box, so it sat 4px low and to the end. The spinner now takes `--fab-icon-size`, as the icon does.
