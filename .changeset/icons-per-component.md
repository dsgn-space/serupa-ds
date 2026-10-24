---
"serupa-ds": minor
---

- Changed: Icon: each component imports the icons it draws, so a bundle keeps only the icons of the components it uses. Button alone drops from 11.9 to 5.1 KiB gzipped, Dialog alone from 13.0 to 6.2 KiB, and all components from 50.8 to 46.8 KiB. Before, any component that drew an icon shipped all 73 icons the components use.
- Changed: Icon: a name drawn as a string (`<Icon name="close" />`, `leftIcon="close"`) now loads in the browser the first time a page draws it: the components' own icons come from a small file (about 14 KB), and any other name from the full set, as before. If you render on the server and draw icons by name, they show an empty box until the page loads. To draw them on the server, pass the imported icon (`icon={Close}` with `import { Close } from "serupa-ds/icons"`) or call `registerIcons(Close)` once before rendering. The components' own icons still draw on the server. `getIcon(name)` returns an icon once it is registered or loaded.
