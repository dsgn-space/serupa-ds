# ADR-0027: A heavy part that shows only after a press loads then, as a chunk of its own

**Status:** Accepted
**Deciders:** Diki, 21 November 2026: approved "lazy-load heavy parts" as the fourth step of the performance work. The rule and its first three uses came with it on 28 November 2026.

## Context

Each export is its own module, so a project that imports DatePicker ships DatePicker's code and what it imports, and nothing else (the per-module build in `dist/js`, checked by `tools/test/tree-shake.mjs`). What a component imports, though, comes along whether or not a page ever shows it. DatePicker carried the whole Calendar, which appears only once its popup opens; a form whose dates are only typed paid for it on every page. FilterBar carried DateRangePicker, which appears only once a date filter's chip is opened: about 18 of the 48.7 KiB it weighed imported alone.

The audit's GR311 asked the same of Sidebar, which imports Menu and Tooltip for its collapsed rail.

## Decision

- **A part that a component draws only after the person opens something, and that weighs a third or more of the component, is loaded with `React.lazy(() => import('../Part/Part'))` at module level,** inside a `<React.Suspense fallback={null}>` where it's drawn. Bundlers make it a chunk of its own, fetched the first time it's shown; `size.mjs` counts it apart from the component imported alone. The first three: DatePicker's Calendar, DateRangePicker's RangeCalendar and FilterBar's DateRangePicker.
- **A part drawn at first paint, or one that gives the first paint its names and roles, stays a static import.** Sidebar's rail is the case GR311 raised: a collapsed sidebar names each icon-only item with its Tooltip (`role="label"`) and marks a group's button with Menu's `aria-haspopup` from the first render, on the server too. Loading them later would leave the rail's buttons unnamed until the chunk arrived, so Sidebar keeps both imports.
- **What the lazy part needs from its host stays outside it.** RangeCalendar's `RangePickContext` moved to `RangeCalendar/pickContext.ts`, so DateRangePicker provides it without loading the months.
- **The tools follow `import()` as they follow `from`.** `tools/build/build.mjs` counts a lazily loaded folder in `components.json`'s `uses`, so `serupa-purge --components` keeps its styles, and `withDependents` (`tools/test/lib.mjs`) tests the host when the part changes. `tools/test/purge-components.mjs` fails if a lazy part goes missing from `uses`.

## Options considered

- **Keep every import static.** Simplest, and no flash of an empty popup while a chunk loads; but every date field pays for a calendar it may never open, and FilterBar for a range picker.
- **A loading indicator as the fallback.** The chunk is a few kilobytes from the same origin, usually there within a frame; a spinner flashing for one frame is worse than the popup's frame filling a frame late. The popup and its focus handling are already in place, so the calendar takes focus as it mounts, as before.
- **Lazy-load Sidebar's rail behind a placeholder button.** The rail's names would be missing on the server and until the chunk arrived: not something to trade for 6 KiB.

## Consequences

- DatePicker, DateRangePicker and FilterBar imported alone are smaller by their calendar's or picker's size; their budgets in `tools/test/baseline-size/` are lowered to match.
- The first time a popup opens, its contents arrive a moment after its frame, then come from the bundler's chunk cache. A project that bundles without code splitting gets one file, as before.
- An app's server render shows the popups closed, as before, so the markup a server sends doesn't change.
