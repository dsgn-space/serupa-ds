---
"serupa-ds": patch
---

- Fixed: Button: in right-to-left text, a button with an icon puts its extra 4px of padding on the text side, as it does in left-to-right text. Before, it landed next to the icon.
- Changed: Tooling: component CSS can't use physical left and right properties (`padding-left`, `left`, `float: right`…); Stylelint asks for the logical ones (`padding-inline-start`, `inset-inline`, `float: inline-start`…), so every component keeps working in right-to-left text. Navbar's mobile menu, the centered Toast stack and Field's group label move to the logical properties, with no visible change.
- Changed: Docs: Storybook's toolbar has a Direction switch (left to right, right to left), so any story can be checked mirrored.
