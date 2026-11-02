// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Tour: h(D.Tour, { defaultOpen: true, steps: [{ title: 'Welcome', content: 'A quick look around.' }, { target: '#new', title: 'New project' }] }),
});
