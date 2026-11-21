---
"@diki-stwn/serupa-ds": minor
---

Added: four layout components, so a page's structure needs no CSS of its own.

- **AppShell**, the frame around an app's pages: a skip link, the header, a sidebar that sticks below a sticky Navbar and goes away below a width you pick, main on a plain or muted background, the footer and a BottomNav.
- **SidebarLayout**, a narrow column beside a wide one, which stacks once the space is too narrow for both: filters beside results, a summary beside a form. It follows the space it's in, so it works in a Dialog or a Card too.
- **Center**, content at a maximum width in the middle of the space, and with `vertical` in the middle of the screen's height: a sign-in page, an error page.
- **PageSection**, one full-width band of a long page, plain or muted, with space above and below and its content in a Container: a landing page's hero, features and pricing.

Stack's guide now says how to make the cluster (inline) layout: `direction="row" wrap`.
