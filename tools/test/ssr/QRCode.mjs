// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  QRCode: h(D.QRCode, { value: 'https://example.com/pay/8841', label: 'Payment code' }),
  'QRCode expired': h(D.QRCode, { value: 'https://example.com/login', label: 'Sign-in code', status: 'expired', onRefresh: () => {} }),
});
