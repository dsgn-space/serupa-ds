// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  MaskedValue: h(D.MaskedValue, { value: '4111111111111234', label: 'Card number' }),
  'MaskedValue revealable': h(D.MaskedValue, { value: '4111111111111234', label: 'Card number', revealable: true }),
});
