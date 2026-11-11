// serupa/no-literal-words: a component's words come from its labels (labels.ts, with the Indonesian), so a word
// written into its JSX is English in every language. Flags JSX text with letters and string literals given to the
// attributes people hear or read: aria-label, aria-description, aria-roledescription, aria-valuetext,
// aria-placeholder, title, alt, placeholder. A string reaches them, or a JSX child ({'Close'}), as a literal, as the
// fixed text of a template literal (`${n} more`), or as either side of a condition (open ? 'Hide' : 'Show', a || 'None')
// (GR276). Symbols and punctuation (×, →, ·) pass; so does anything in the "allow" option.
const SPOKEN = new Set(['aria-label', 'aria-description', 'aria-roledescription', 'aria-valuetext', 'aria-placeholder', 'title', 'alt', 'placeholder']);

// The fixed strings an expression can evaluate to, with the node each one sits in.
const strings = (e, out = []) => {
  if (!e) return out;
  if (e.type === 'Literal' && typeof e.value === 'string') out.push([e, e.value]);
  else if (e.type === 'TemplateLiteral') for (const q of e.quasis) out.push([q, q.value.cooked ?? q.value.raw]);
  else if (e.type === 'ConditionalExpression') { strings(e.consequent, out); strings(e.alternate, out); }
  else if (e.type === 'LogicalExpression') { strings(e.left, out); strings(e.right, out); }
  else if (e.type === 'TSAsExpression' || e.type === 'TSSatisfiesExpression' || e.type === 'TSNonNullExpression') strings(e.expression, out);
  return out;
};
const WORDS = /\p{L}{2,}/u;

export default {
  meta: { type: 'problem', schema: [{ type: 'object', properties: { allow: { type: 'array', items: { type: 'string' } } }, additionalProperties: false }], messages: { literal: 'Words in a component come from its labels (labels.ts) so they follow the language: "{{text}}"' } },
  create(context) {
    const allow = new Set(context.options[0]?.allow || []);
    const flag = (node, text) => { const t = text.trim(); if (WORDS.test(t) && !allow.has(t)) context.report({ node, messageId: 'literal', data: { text: t.slice(0, 40) } }); };
    return {
      JSXText(node) { flag(node, node.value); },
      JSXAttribute(node) {
        const name = typeof node.name.name === 'string' ? node.name.name : '';
        if (!SPOKEN.has(name) || !node.value) return;
        if (node.value.type === 'Literal' && typeof node.value.value === 'string') flag(node.value, node.value.value);
        else if (node.value.type === 'JSXExpressionContainer') for (const [n, t] of strings(node.value.expression)) flag(n, t);
      },
      JSXExpressionContainer(node) {
        if (node.parent.type !== 'JSXElement' && node.parent.type !== 'JSXFragment') return;   // a child, not an attribute's value
        for (const [n, t] of strings(node.expression)) flag(n, t);
      },
    };
  },
};
