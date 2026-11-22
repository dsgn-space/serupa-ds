# ADR-0025: A state is an attribute, never a class

**Status:** Accepted
**Deciders:** written by Claude on 22 November 2026, under Diki's standing go-ahead to finish the deep audit's leftovers without a sign-off on each (deep audit of 21 November, finding 11: "decide and write the rule").

## Context

The components styled a state three ways. 50 of 129 stylesheets selected a `--state` modifier class (`.srp-input--invalid`, `.srp-list__item--selected`, `.srp-navbar__link--active`), others the ARIA attribute or a native pseudo-class, and a few `data-state`, the one [ADR-0012](0012-data-state.md) tells apps to use. Eleven components did all three in one file. The modifier classes were never documented as state hooks (Customizing says modifiers are for variant and size), yet app CSS could select on them, so they were public API.

A state that can be on with another (disabled and invalid, selected and today) doesn't fit `data-state`, which holds one value from a set.

## Decision

- **A state the element can be in at the same time as others is a `data-` attribute named for it, present or absent:** `data-disabled`, `data-readonly`, `data-invalid`, `data-loading`, `data-selected`, `data-current` (the current page or item), `data-active` (the option the keys are on), `data-checked`, `data-empty`, `data-today`, `data-outside`, `data-over`, `data-dragging`, `data-done`, `data-error`, `data-collapsed`. It is written on the element whose class had the modifier.
- **A state that is one of a set stays `data-state`,** as ADR-0012 says (`open`/`closed`, Stepper's `upcoming`/`current`/`complete`/`error`, Progress's `indeterminate`).
- **ARIA and native state stay the source for assistive tech.** The attributes are for styling and tests. Where an element already carries the state for a screen reader (`aria-expanded` on a Table's expand button, `aria-pressed` on a ToggleButton that is on; `data-pressed` stays what Button sets while a key holds it down), the stylesheet may select that instead.
- **The components' own stylesheets select states on these attributes,** never on a `--state` class. `tools/test/state-hooks.mjs` holds them to it, and checks that each element still writing a deprecated class writes its attribute too.
- **`--` modifier classes are for variant and size only.** The `--state` classes are still written in 17.x, deprecated, and removed in 18.0.0.

## Consequences

- App CSS selects `.srp-input[data-invalid]` where it selected `.srp-input--invalid`. Customizing lists the attributes, and `STATE_CLASSES` in `tools/test/state-hooks.mjs` maps every deprecated class to its attribute, for a codemod to flag them in 18.0.0.
- A selector moved from a class to a class and an attribute is one step more specific. Inside the components' own layer that changes nothing an app sees, since app CSS outside the layers wins whatever its specificity.
- Adding a state attribute is a minor. Removing the deprecated classes is part of 18.0.0, with a migration note.
- A new component writes its state as an attribute from the start, and never adds a `--state` class.
