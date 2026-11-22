# ADR-0023: Every pattern shows its loading, empty, failed, partial and offline states

**Status:** Accepted
**Deciders:** Diki, 21 November 2026 (the polish list after the cleanup major, item 1).

## Context

The patterns are pages an app copies. Most showed the happy path and a loading skeleton; some showed a failed load. An app that copied one had to invent the rest, and four patterns broke when their data was empty: Agenda, Appointment, Leaderboard and Transactions drew an empty table or a blank column instead of saying there was nothing yet. Nothing checked which states a pattern had, so the gaps were found only by looking.

## Decision

- **A pattern that loads data has five states besides the default,** each as a story: `Loading`, `LoadFailed`, `Empty`, `Partial` (one part failed, the rest loaded, with Try again on the part) and `Offline`.
- **A pattern that only sends** (a form, a dialog) has `SendFails`, the send rejected with the form still filled in, and `Offline`.
- **Offline is the same everywhere.** An `online` prop, left out to follow the browser, and an OfflineBanner as the first thing in main: "You're offline", then one sentence on what still works on that page.
- **One test holds it.** `src/internal/patternStates.test.tsx` lists the data patterns, fails a pattern missing a state, renders each Offline story to check the banner, and fails an exception (`NOT_HERE`, with a reason) that is no longer needed. A story may carry another name for a state (`SAME_AS`) where the pattern's own words fit better.
- **The states use the system's blocks:** Skeleton or Loader while loading, EmptyState with an icon for empty, EmptyLoadFailed for a failed load or a failed part.

## Consequences

- An app that copies a pattern copies its failure states too, worded and accessible.
- A new pattern needs its states before it merges; the test says which are missing.
- Some patterns load in one request, so a partial state can't happen; those are listed with that reason rather than given a story that couldn't occur.
