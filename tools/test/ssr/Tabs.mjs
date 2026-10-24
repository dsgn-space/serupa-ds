// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Tabs: h(D.Tabs, { defaultValue: 'a' }, h(D.TabList, { 'aria-label': 'Sections' }, h(D.Tab, { value: 'a' }, 'A'), h(D.Tab, { value: 'b' }, 'B')), h(D.TabPanel, { value: 'a' }, 'Panel')),
});
