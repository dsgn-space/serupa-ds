// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Alert: h(D.Alert, { tone: 'warning', title: 'Heads up', onClose() {} }, 'Check your details.'),
});
