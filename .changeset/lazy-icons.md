---
"serupa-ds": minor
---

- Performance: the main bundle no longer carries every icon. It's about 58 KB gzipped again (it was about 577 KB in 7.0.0). The icons the components use are built in. The full set is a separate file that loads the first time a page draws another name, and that icon appears once it has loaded. Apps that only use the built-in icons never download it. Every name still works, and nothing changes in how you use icons.
- Server rendering: built-in icons render on the server; other names render their empty box until the page loads in the browser. To render every icon on the server, call `registerIcons(await import("serupa-ds/icons"))` first.
- `getIcon(name)` returns an icon outside the built-in set only once the full set has loaded (or you registered it).
- Docs: Storybook loads the full set up front, so the Icons page and every icon control draw at once.
