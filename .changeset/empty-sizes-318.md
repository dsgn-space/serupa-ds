---
"serupa-ds": minor
---

Added (Blocks): `size` on EmptyFirstRun, EmptyNoResults, EmptyNoAccess and EmptyLoadFailed, passed to EmptyState: `md` (default) on a page, `sm` inside a card, a table or a panel. ActivityFeed's load failure, Onboarding's "You're all set" and "No projects yet", and ApiKeys' "No API keys yet" sit in a Card, so they now use `sm` (24px round the words, not 48px). The Empty states stories show the blocks on a plain page, as a page's empty state is, rather than in a Card on the muted surface.
