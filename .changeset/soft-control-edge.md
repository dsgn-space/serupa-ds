---
"@diki-stwn/serupa-ds": minor
---

Softer control edges, and Switch's track fills come from track tokens.

- **`border-control` is a soft line.** It is zinc-300 in light and zinc-600 in dark (was zinc-500 and zinc-400), with `border-control-hover` (zinc-400 / zinc-500) and `border-control-pressed` (zinc-500 / zinc-400) a step stronger each. It draws the edges of Meter and Progress tracks, Carousel dots, Stepper rings and lines, ColorPicker swatches, Rating's empty stars, Kbd, Splitter, ScrollArea's thumb and Avatar's offline dot. Like `field-border`, it is now under the 3:1 WCAG 1.4.11 asks of a control's edge, a deliberate design choice; more contrast (`data-contrast="more"` or the system setting) brings back 3:1+. To keep the old edge, set `--border-control: var(--zinc-500)` in light and `var(--zinc-400)` in dark.
- **New `track-hover` and `track-pressed` tokens.** Switch's off track on hover and while held down now uses these fills instead of `border-strong` and `border-control`, with the same colors as before (zinc-300 / zinc-600 on hover, zinc-500 / zinc-400 pressed).
