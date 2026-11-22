---
"@diki-stwn/serupa-ds": patch
---

Changed (Patterns): 66 patterns lay out their page with Container and Stack, as the guide tells apps to, instead of utility classes on `<main>`. main is a Container (`as="main"`), at the size nearest the old width: prose (672px) for the narrow pages, md (768), lg (1024) or xl (1280), with Container's side padding, which grows from 16px to 24px and 32px on wider screens. Its content sits in a Stack with the gap it had. Pages that were 896px or 1152px wide become 1024px or 1280px.
