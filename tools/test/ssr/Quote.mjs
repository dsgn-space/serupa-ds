// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Quote: h(D.Quote, { author: 'Ada Rahman', source: 'Lumen', cite: 'https://example.com' }, 'Fast.'),
  'Quote, large, words only': h(D.Quote, { size: 'lg' }, h('p', null, 'One.'), h('p', null, 'Two.')),
});
