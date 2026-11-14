// serupa/card-direction: Card is a flex column (Card.css), so a Card given row classes (flex-wrap, justify-between,
// items-center) without a direction stays a column: its children stack, and items-center shrinks and centres them.
// Billing, Checkout and Onboarding shipped cards like that. Flags a Card whose className lays it out as a row without
// saying flex-row, or flex-col when a column is meant.
const ROW = /(?:^|\s)(?:flex-wrap|justify-between|justify-end|items-center|items-baseline)(?:\s|$)/;
const DIRECTION = /(?:^|\s)(?:sm:|md:|lg:)?flex-(?:row|col)(?:-reverse)?(?:\s|$)/;
const text = (v) => (!v ? '' : v.type === 'Literal' ? String(v.value) : v.type === 'JSXExpressionContainer' && v.expression.type === 'Literal' ? String(v.expression.value)
  : v.type === 'JSXExpressionContainer' && v.expression.type === 'TemplateLiteral' ? v.expression.quasis.map((q) => q.value.cooked).join(' ') : '');

export default {
  meta: { type: 'problem', schema: [], messages: { direction: 'Card is a column: add flex-row to lay it out as a row (or flex-col to keep the column)' } },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'Card') return;
        const attr = node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'className');
        const cls = text(attr?.value);
        if (ROW.test(cls) && !DIRECTION.test(cls)) context.report({ node: attr, messageId: 'direction' });
      },
    };
  },
};
