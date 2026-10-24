// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    RadioGroup: h(D.RadioGroup, { defaultValue: 'a', 'aria-label': 'Plan' }, h(D.Radio, { value: 'a' }, 'A'), h(D.Radio, { value: 'b' }, 'B')),
});
