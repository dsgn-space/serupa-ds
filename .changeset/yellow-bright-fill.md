---
"@diki-stwn/serupa-ds": major
---

Yellow is bright in both modes, and a fill too light for the page gets a thin edge.

- Changed: Yellow Dark keeps the bright `yellow-400` under `yellow-950` text, rather than the light theme's darker shade under white.
- Changed: Yellow Light fills with the bright `yellow-500` under `yellow-950` text (it was `yellow-700` under white, which read as brown), with hover #d9a500 and held down `yellow-600`.
- Added: `primary-edge`, a 1px edge just inside a `primary` fill that has no text on it, for a theme whose fill is under 3:1 on the page: `yellow-700` in Yellow Light (`yellow-500` is 1.9:1 on white), transparent in every other theme. Checkbox, Radio, Switch, Slider, Progress, Meter, TreeView, Stepper, Calendar, PeriodPicker, Pagination, pill Tabs, Carousel, Timeline and NotificationCenter draw it, each through its own component token (`--checkbox-edge-checked`, `--switch-track-edge-checked`, `--progress-fill-edge` and so on). Progress's ring has a second arc under the first for it.
- Added: `--switch-pending-checked`, the loading ring on an on Switch's thumb. `--switch-pending` is now the ring on the off thumb only, and defaults to `primary-text`.

- **What breaks:** in Yellow Light, text on `primary` is dark (`on-primary` is `yellow-950`), and a custom mark filled with `primary` with no text on it is 1.9:1 on white without the edge. A page that set `--switch-pending` for an on Switch sets `--switch-pending-checked` too.
- **Why:** a yellow dark enough to carry white text reads as brown, so yellow keeps its bright shades and dark text, and the edge keeps a checked box or an on Switch visible on white (WCAG 1.4.11).
- **Migration:** give a custom mark filled with `primary` the edge: `box-shadow: inset 0 0 0 1px var(--primary-edge)`. Draw text on a `primary` fill with `on-primary`, never a fixed white.
