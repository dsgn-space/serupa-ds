# ADR-0018: `tone` says what a color means, `variant` how it looks, and Button is the one exception

**Status:** Accepted
**Deciders:** Diki, 21 November 2026, after the deep audit's consistency review.

## Context

The API naming table says `tone` is what a color means (`neutral`, `primary`, `info`, `success`, `warning`, `danger`) and `variant` is the visual style (`solid`, `subtle`, `outline`, `ghost`). Badge, Alert, IconTile, Timeline, Progress and Toast follow it. Button doesn't: its `variant` mixes a meaning (`primary`) with styles (`outline`, `ghost`, `link`), `secondary` is a fourth way to say "neutral", and danger is a boolean, `destructive`. SplitButton and ToggleButton copy Button.

The audit offered two ways out: give Button `tone` and `variant` like Badge, with the old names deprecated and a `serupa-migrate` rewrite, or keep Button as it is and write it into the table as the exception.

## Decision

- **Button keeps its API.** `variant="primary" | "secondary" | "outline" | "ghost" | "link"` and `destructive` stay, on Button, SplitButton and ToggleButton. Button is on nearly every screen of every app, and its names are the ones people reach for first; renaming them costs every project a rewrite for a gain only the naming table sees.
- **Everything else follows the table.** A new component, or a new prop on any other component, uses `tone` for meaning and `variant` for style. A component that says a meaning another way gets `tone` as an alias in a minor and loses the old name in the next scheduled major.
- **The exception is written down,** so it isn't copied. The naming table names Button and its two siblings as the one place a meaning sits in `variant`. A component that wraps a Button passes Button's props through as they are; it doesn't invent a third shape.

## Consequences

- No migration for Button in 17.0.0.
- A reviewer has a rule to point to: "Button does it" is not a reason for a new component to put a meaning in `variant`.
- The tone value sets still differ between components (Text calls its base `default`, Badge also takes hue names). Each gap is fixed in a minor where it costs nothing, or kept and said in that component's guide.
- Revisit if Button ever needs a meaning it can't say today (an info or success button), since that is when `tone` would pay for the rewrite.
