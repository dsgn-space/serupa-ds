---
"@diki-stwn/serupa-ds": patch
---

Security review: four places where a crafted link, page or stored value could misbehave.

- **serupa.iife.js** no longer lets an element named `currentScript` in the page's HTML (`<img name="currentScript" src="https://elsewhere/">`, which HTML sanitizers let through) choose where `serupa-icons.iife.js` loads from. Only the real script element's address counts, and the icon stays empty otherwise.
- **TableOfContents, Faq:** a link whose `#fragment` isn't valid percent-encoding (`#%`) no longer throws and takes the page down. The fragment is read as written.
- **Pagination:** the "Go to page" field follows `getHref` only to a web page, `mailto:` or `tel:`, as CommandPalette does. A `javascript:` URL does nothing.
- **Onboarding:** a value under `saveKey` that isn't the page's own shape is left out, where it threw on every visit until the storage was cleared.
