---
"serupa-ds": minor
---

ListItem's `linkProps` are now typed by `as`: with `as={RouterLink}`, `linkProps={{ to: '/team' }}` is checked against your router link's props, and a typo is a type error (an `<a>`'s props by default, `data-*` on either). Pagination's `linkAs` takes a component that accepts `href`, the prop it passes. Four types you met in hovers can now be imported: `ColorHue` and `ColorTone` (ColorPicker's `colorName` label), `ToastMessage` (a `toast.promise` step) and `ListItemOwnProps`.
