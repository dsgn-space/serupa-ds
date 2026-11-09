// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  InputAction: h(D.Input, { 'aria-label': 'Coupon code', defaultValue: 'WELCOME10', actions: [h(D.InputAction, { key: 'a', label: 'Apply' }), h(D.InputAction, { key: 'c', icon: 'close', label: 'Clear coupon code' })] }),
});
