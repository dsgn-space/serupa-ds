---
"@diki-stwn/serupa-ds": patch
---

Changed (Patterns): section headings on app screens are 18px everywhere, as in 48 places already. Agenda, Approvals, Data export, Poll, Product page, Recipe, Send money and Multi-step form's steps used 20px. Send money's "Sent to …" and Multi-step form's "Application sent" are now 24px, like the confirmation in every other pattern.

Docs (Foundations): the Type roles say when a section heading is 24px (a page's own sections, as in an article) and when it is 18px (`size="lg"`, a section on an app screen below its h1). A new check draws every pattern story and fails on an h2 of another size, with the documents and headlines that keep 24px named and explained.
