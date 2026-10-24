// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Stepper: h(D.Stepper, { current: 1, steps: [{ title: 'Account' }, { title: 'Plan' }, { title: 'Pay' }] }),
});
