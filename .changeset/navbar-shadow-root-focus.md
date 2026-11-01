---
"serupa-ds": patch
---

Navbar `sticky`: focusing a field inside a shadow root no longer scrolls the page away from it. The bar's Safari fix for a field left under it measured the shadow root's host, which the focus event names there, instead of the field (GR95).
