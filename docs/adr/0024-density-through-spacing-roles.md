# ADR-0024: Density changes the spacing roles, and components read the roles

**Status:** Accepted
**Deciders:** Diki, 21 November 2026 (the polish list after the cleanup major, item 3).

## Context

`data-density="compact"` existed, but it reached little: the token build applied compact values only to the few spacing roles that had one, and most components padded rows, items and cards with their own tokens set straight from the spacing scale. A compact Table looked like a normal one. Making density work component by component would have meant a compact value on each of dozens of component tokens, with nothing to keep them in step.

## Decision

- **Density lives in the semantic spacing roles.** Each role that sets how tight a component feels has a compact value: `space-item` (a tight row: a small table, a data grid, a sidebar item), `space-row` (a table or list row), `space-content` (inside a disclosure or panel), `space-card` (a card's padding) and `space-surface` (a large surface). The token build writes them under `[data-density="compact"]`; `comfortable` restores the defaults, so a part of the page can opt back out.
- **Components read the roles.** A component token for padding falls back to the role (`var(--table-padding-y, var(--space-row))`), so it follows density without a compact value of its own. An app that sets the component token keeps its value at every density.
- **The layout roles don't change with density.** The space between a page's sections and its gutters stays: compact makes the content tighter, not the page cramped.
- **Control heights don't change either.** `size` sets those (24, 32 and 44px), and a pointer target stays at least 24px.

## Consequences

- One attribute on a page, or on a part of it, tightens tables, data grids, lists, the sidebar, accordions and cards together.
- A new component that pads a row, an item or a card reads the matching role, and so gets density for free.
- A change to a role's default moves every component that reads it; the visual review shows which.
