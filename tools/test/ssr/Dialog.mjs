// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Dialog: h(D.Dialog, { open: true, title: 'Invite', onOpenChange() {}, footer: h(D.Button, null, 'Send') }, 'Body'),
});
