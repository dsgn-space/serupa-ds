# ADR-0019: Layout components for a page's structure, utility classes for the details inside it

**Status:** Accepted
**Deciders:** Diki, 21 November 2026 (deep audit, overlap item 4, and the layout primitives work).

## Context

Serupa has both: layout components (`Stack`, `Grid`, `Container`, and the frame components that build on them) and utility classes (`flex`, `gap-4`, `p-6`, `max-w-…`). Both can lay out a page. Until November the patterns and blocks used utilities for everything, while the docs recommended the components, so an app copying a pattern learned the opposite of what the guides said. A page's frame (skip link, header, sidebar beside main, footer) was written out again in each pattern, each with its own small differences.

## Decision

- **A page's structure is components.** The frame of an app page, the width a page's content keeps, the columns that stack on a narrow screen, and the bands of a long page come from the layout components. They hold what has to be the same on every page: the skip link and landmarks, the widths from the sizing tokens, where columns stack, the page background.
- **Inside a part, either is fine.** Spacing, alignment and one-off arrangements within a card, a form or a toolbar may use `Stack` or the utility classes. Neither is wrong; pick the one that reads better there.
- **No component that only repeats a utility.** A layout a utility already says in one class (`flex flex-wrap gap-2`) doesn't get a component of its own. `Stack direction="row" wrap` is the inline row; there is no separate Inline or Cluster.
- **Utilities stay first-class.** An app without React, or one that already lays out with utilities, keeps working without the components. The components draw with the same tokens, so the two agree.

## Consequences

- The patterns are rebuilt on the layout components, so copying one copies the right structure.
- Build a page lists which layout component each kind of page starts from.
- Layout components that are Server Components set widths and gaps through inline styles, which a strict CSP has to allow (`style-src-attr 'unsafe-inline'`), as it already must for `Grid` and `Stack`. Getting started says so.
