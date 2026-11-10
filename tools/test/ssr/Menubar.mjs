// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Menubar: h(D.Menubar, { 'aria-label': 'Editor' }, h(D.MenubarMenu, { label: 'File' }, h(D.MenuItem, null, 'New')), h(D.MenubarMenu, { label: 'Edit', disabled: true }, h(D.MenuItem, null, 'Undo'))),
  Open: h(D.Menubar, { 'aria-label': 'Editor' }, h(D.MenubarMenu, { label: 'File', defaultOpen: true }, h(D.MenuItem, null, 'New')), h(D.MenubarMenu, { label: 'Edit' }, h(D.MenuItem, null, 'Undo'))),
});
