// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  FormErrors: h(D.FormErrors, { errors: { email: 'That email is taken' } },
    h(D.ErrorSummary, {}),
    h(D.Field, { label: 'Email', name: 'email' }, h(D.Input, { type: 'email' }))),
});
