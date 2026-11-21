---
"serupa-ds": patch
---

- Changed (Patterns): design decision on the page's background. A page built from Cards or panels (a dashboard, settings made of Card sections, a grid of Cards, a list beside its detail) sits on `bg-surface-muted`, and a page you read or fill in sits on `bg-surface`. Build a page states the rule, and a check holds the patterns to it. Before, 25 of 74 patterns were muted with no rule. Fifteen pages you fill in or read move to `bg-surface`: Accept invite, Activity log, Checkout, Consent banner, Data import, Error pages, List with search and filters, Multi-step form, Onboarding, Password reset, Permission request, Session time-out, Share dialog, Sign in and Sign up. The Card layouts still on `bg-surface` follow in the next release.
