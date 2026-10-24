// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Accordion: h(D.Accordion, { defaultValue: 'a' }, h(D.AccordionItem, { value: 'a', title: 'Shipping' }, 'Free over $50')),
});
