# ADR-0022: Motion comes from named roles, and under reduced motion only fades remain

**Status:** Accepted
**Deciders:** Diki, 21 November 2026, recording how motion has worked since the motion quality gate.

## Context

Every component that moves picks a duration and an easing. Written as raw values (`250ms`, `cubic-bezier(…)`), each one is a speed of its own that no token change reaches, and two popovers drift apart. Motion can also cost: an animation of width or padding re-lays the page every frame, a surface that closes mid-entry jumps if it entered with keyframes, and anything that slides or scales can make someone with a vestibular disorder ill.

## Decision

- **Two layers of tokens.** A scale (`duration-75` … `duration-1200`, `ease-enter`, `ease-exit`, `ease-move`, `ease-spring` and the rest) and roles named for what moves: `motion-press`, `motion-hover`, `motion-enter-sm|md|lg`, `motion-exit-sm|md|lg`, `motion-change-sm|md|lg`. Component CSS names a role, never the scale and never a raw value, so changing a role moves every component that plays it. `node tools/test/motion-tokens.mjs` fails a raw value or a scale step in component CSS; Loader's own art is the one listed exception.
- **What may move.** An animation runs on the compositor (opacity, transform, filter, clip-path) or a discrete property, never on layout. A surface that can close mid-entry enters with a transition, so it reverses from where it is. Nothing animates on mount, a popup grows from the edge facing its trigger, and nothing stays promoted (`will-change`) at rest.
- **Reduced motion keeps only fades.** Under `prefers-reduced-motion: reduce`, and under an app's own setting (`data-motion="reduce"`, which the build adds to every such rule), nothing slides, scales or loops; opacity changes may stay, so a state change is still seen.
- **One gate checks every story.** `src/internal/motion.test.tsx` runs each component story, with its interactions, and fails an animation that breaks a rule above. What fails today is listed in its `KNOWN`, and that list only shrinks.

## Consequences

- A new component gets these rules from the gate on its first story, without a review having to catch them.
- The Motion page in Foundations documents the roles; the motion review in CONTRIBUTING covers what a check can't: whether a motion is worth having at all.
- A new kind of motion that no role fits gets a new role in the tokens, not a value in a component.
