// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  SignaturePad: h(D.SignaturePad, { 'aria-label': 'Signature', name: 'signature' }),
  SignaturePadTyped: h(D.SignaturePad, { 'aria-label': 'Signature', defaultMethod: 'type' }),
});
