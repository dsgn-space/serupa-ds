// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Lightbox: h(D.Lightbox, { open: true, onOpenChange() {}, defaultIndex: 1, items: [{ src: '/a.png', alt: 'A lake', width: 800, height: 500 }, { src: '/b.png', alt: 'A hill', caption: 'Bromo', width: 800, height: 500 }] }),
});
