// An app's own "Reduce motion" setting: data-motion="reduce" on <html> (or on a section) works like the system's
// prefers-reduced-motion: reduce. The CSS is written once, against the media query; this adds the attribute:
//   @media (prefers-reduced-motion: reduce) { X }        gains a copy of X for :where([data-motion="reduce"]) X,
//                                                        right after it, at the same specificity;
//   @media (prefers-reduced-motion: no-preference) { X } keeps X off inside [data-motion="reduce"], through a
//                                                        :not(:where([data-motion="reduce"], [data-motion="reduce"] *))
//                                                        on each selector's subject (no specificity added).
// A rule for the root itself (html, :root, ::view-transition-*) takes the attribute on the root. The setting only
// ever reduces: there is no attribute that turns motion back on against the system's setting.
// tools/build/build.mjs runs it over every CSS file it ships, and postcss.config.mjs over the source in Storybook and
// the tests, so both see the same rules. tools/test/motion-attribute.mjs checks the rewriting.
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const ATTR = '[data-motion="reduce"]';
const REDUCE = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
const NO_PREF = /\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/;
// "not (prefers-reduced-motion: reduce)" on its own means the same as no-preference; any other query with "not" in it
// negates the whole query, so it is left as it is.
const NOT_REDUCE = /^\s*not\s+\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*$/;
// The pseudo-elements CSS 2 wrote with one colon, which are still pseudo-elements.
const OLD_ELEMENT = /^:(?:after|before|first-line|first-letter)$/i;
// The selector's first compound names the root: html, :root, or a view transition pseudo-element (which hangs off it).
const ROOTISH = /^(?::where\(html\)|html|:root)(?![\w-])|^::view-transition/;

/** @param {(root: import('postcss-selector-parser').Root) => void} fn @returns {(sel: string) => string} */
const parse = (fn) => (sel) => selectorParser(fn).processSync(sel);

// TypeScript 7's nightly finds postcss-selector-parser's types for adding or replacing nodes "infinitely circular"
// (TS5115, through Container and Diff: a Selector holds every kind of Node but a Selector), so those calls go
// through this plain type.
/** @typedef {{ append(child: unknown): unknown, replaceWith(node: unknown): unknown, insertBefore(old: unknown, node: unknown): unknown }} Mutable */
/** @param {unknown} node */
const mutable = (node) => /** @type {Mutable} */ (node);

/** A selector holding this text as it is. @param {string} value */
const raw = (value) => {
  const sel = selectorParser.selector({ value: '' });
  mutable(sel).append(selectorParser.string({ value }));
  return sel;
};

// Under the attribute: :where([data-motion="reduce"]) before the selector, or the attribute on the root itself.
const under = parse((sels) => {
  sels.each((s) => {
    const text = String(s).trim();
    if (ROOTISH.test(text)) {
      const rest = text.replace(/^(?::where\(html\)|html|:root)/, '');
      mutable(s).replaceWith(raw(`:where(:root${ATTR})${rest}`));
    } else {
      mutable(s).replaceWith(raw(`:where(${ATTR}) ${text}`));
    }
  });
});

// Not under the attribute: :not(:where(…)) on the last compound, before any pseudo-element.
const notUnder = parse((sels) => {
  sels.each((s) => {
    const guard = selectorParser.pseudo({ value: ':not' });
    mutable(guard).append(raw(`:where(${ATTR}, ${ATTR} *)`));
    const nodes = /** @type {{ type: string, value: string }[]} */ (/** @type {{ nodes: unknown }} */ (/** @type {unknown} */ (s)).nodes);
    let i = nodes.length;
    while (i > 0 && nodes[i - 1].type !== 'combinator') i--;
    let at = nodes.length;
    for (let j = i; j < nodes.length; j++) if (nodes[j].type === 'pseudo' && (nodes[j].value.startsWith('::') || OLD_ELEMENT.test(nodes[j].value))) { at = j; break; }
    if (at === nodes.length) mutable(s).append(guard); else mutable(s).insertBefore(nodes[at], guard);
  });
});

// The rules a media block holds, at any depth of nested at-rules (@starting-style, @supports), but not inside a
// rule's own nested rules: those take their parent's selector, which is already rewritten.
/** @param {import('postcss').Container} block @param {(r: import('postcss').Rule) => void} fn */
const rulesIn = (block, fn) => block.each((n) => { if (n.type === 'rule') fn(n); else if (n.type === 'atrule' && n.nodes) rulesIn(n, fn); });

// A media block nested in a rule can hold declarations of its own, which apply to the rule's elements: they go into a
// nested rule with this selector, so they keep to the attribute like the rules beside them.
/** @param {import('postcss').Container} block @param {(parent: string) => string} selector */
const ownDeclarations = (block, selector) => {
  let rule = /** @type {import('postcss').Rule | null} */ (null);
  for (const n of [...(block.nodes || [])]) {
    if (n.type !== 'decl') continue;
    if (!rule) {
      let up = block.parent;
      while (up && up.type !== 'rule' && up.type !== 'root') up = up.parent;
      rule = postcss.rule({ selector: selector(up && up.type === 'rule' ? /** @type {import('postcss').Rule} */ (up).selector : '') });
      n.before(rule);
    }
    rule.append(n);
  }
};

/** @returns {import('postcss').Plugin} */
export const motionAttribute = () => ({
  postcssPlugin: 'serupa-motion-attribute',
  Once(root) {
    const made = new WeakSet();   // media blocks this added or already guarded, which the walk reaches again
    root.walkAtRules('media', (m) => {
      if (made.has(m)) return;
      if (NOT_REDUCE.test(m.params) || NO_PREF.test(m.params)) {
        rulesIn(m, (r) => { r.selector = notUnder(r.selector); });
        ownDeclarations(m, () => `&:not(:where(${ATTR}, ${ATTR} *))`);
        made.add(m);
      } else if (REDUCE.test(m.params) && !/^\s*not\b/i.test(m.params)) {
        // Without the condition: its "and" goes too, at the start, the end or between two others.
        const rest = m.params.replace(REDUCE, '').replace(/\s+and\s+and\s+/g, ' and ').replace(/^\s*and\s+|\s+and\s*$/g, '').trim();
        const copy = m.clone();
        rulesIn(copy, (r) => { r.selector = under(r.selector); });
        ownDeclarations(copy, (parent) => (ROOTISH.test(parent.trim()) ? `&:where(${ATTR})` : `:where(${ATTR}) &`));
        if (rest) { copy.params = rest; made.add(copy); m.after(copy); }
        else m.after(copy.nodes);
      }
    });
  },
});
motionAttribute.postcss = true;

/** The CSS text with the attribute added (for the build, which works on strings). */
/** @param {string} css @param {string} [from] */
export function withMotionAttribute(css, from) {
  return postcss([motionAttribute()]).process(css, { from }).css;
}
