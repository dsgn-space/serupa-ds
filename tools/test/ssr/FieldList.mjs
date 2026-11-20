// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  FieldList: h(D.FieldList, { label: 'Phone numbers', itemLabel: (i) => 'Phone ' + (i + 1), addLabel: 'Add phone', name: 'phones', newItem: () => '', defaultValue: ['0812'], min: 1 },
    (row, s) => h('input', { 'aria-label': 'Number', name: s.name('number'), defaultValue: row })),
});
