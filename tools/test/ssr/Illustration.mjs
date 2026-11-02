// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Illustration: h(D.Illustration, { name: 'search' }),
  'Illustration labelled': h(D.Illustration, { name: 'offline', size: 'sm', label: "You're offline" }),
});
