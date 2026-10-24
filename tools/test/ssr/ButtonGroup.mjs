// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    ButtonGroup: h(D.ButtonGroup, { attached: true }, h(D.Button, null, 'Day'), h(D.ToggleButton, { pressed: true }, 'Week')),
});
