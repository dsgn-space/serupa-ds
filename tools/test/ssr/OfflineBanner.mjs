// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  OfflineBanner: h(D.OfflineBanner, { online: false, placement: 'inline' }, 'Changes are kept.'),
});
