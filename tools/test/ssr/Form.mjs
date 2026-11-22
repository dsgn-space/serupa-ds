// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Form: h(D.Form, { 'aria-label': 'Sign up', defaultValues: { name: 'Ani' } }, h(D.Field, { label: 'Name' }, h(D.Input, { name: 'name' }))),
  FormSteps: h(D.Form, { 'aria-label': 'Apply' }, h(D.FormSteps, { submitLabel: 'Send' },
    h(D.FormStep, { title: 'You' }, h(D.Field, { label: 'Name' }, h(D.Input, { name: 'name' }))),
    h(D.FormStep, { title: 'Address' }, h(D.Field, { label: 'City' }, h(D.Input, { name: 'city' }))))),
});
