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
// The selector's first compound names the root: html, :root, or a view transition pseudo-element (which hangs off it).
const ROOTISH = /^(?::where\(html\)|html|:root)(?![\w-])|^::view-transition/;

/** @param {(root: import('postcss-selector-parser').Root) => void} fn @returns {(sel: string) => string} */
const parse = (fn) => (sel) => selectorParser(fn).processSync(sel);

// Under the attribute: :where([data-motion="reduce"]) before the selector, or the attribute on the root itself.
const under = parse((sels) => {
  sels.each((s) => {
    const text = String(s).trim();
    if (ROOTISH.test(text)) {
      const rest = text.replace(/^(?::where\(html\)|html|:root)/, '');
      s.replaceWith(selectorParser.selector({ value: '' }).append(selectorParser.string({ value: `:where(:root${ATTR})${rest}` })));
    } else {
      s.replaceWith(selectorParser.selector({ value: '' }).append(selectorParser.string({ value: `:where(${ATTR}) ${text}` })));
    }
  });
});

// Not under the attribute: :not(:where(…)) on the last compound, before any pseudo-element.
const notUnder = parse((sels) => {
  sels.each((s) => {
    const guard = selectorParser.pseudo({ value: ':not' });
    guard.append(selectorParser.selector({ value: '' }).append(selectorParser.string({ value: `:where(${ATTR}, ${ATTR} *)` })));
    let i = s.nodes.length;
    while (i > 0 && s.nodes[i - 1].type !== 'combinator') i--;
    let at = s.nodes.length;
    for (let j = i; j < s.nodes.length; j++) if (s.nodes[j].type === 'pseudo' && s.nodes[j].value.startsWith('::')) { at = j; break; }
    if (at === s.nodes.length) s.append(guard); else s.insertBefore(s.nodes[at], guard);
  });
});

// The rules a media block holds, at any depth of nested at-rules (@starting-style, @supports), but not inside a
// rule's own nested rules: those take their parent's selector, which is already rewritten.
/** @param {import('postcss').Container} block @param {(r: import('postcss').Rule) => void} fn */
const rulesIn = (block, fn) => block.each((n) => { if (n.type === 'rule') fn(n); else if (n.type === 'atrule' && n.nodes) rulesIn(n, fn); });

/** @returns {import('postcss').Plugin} */
export const motionAttribute = () => ({
  postcssPlugin: 'serupa-motion-attribute',
  Once(root) {
    const made = new WeakSet();   // media blocks this added or already guarded, which the walk reaches again
    root.walkAtRules('media', (m) => {
      if (made.has(m)) return;
      if (REDUCE.test(m.params)) {
        const rest = m.params.replace(REDUCE, '').replace(/^\s*and\s+|\s+and\s*$/g, '').trim();
        const copy = m.clone();
        rulesIn(copy, (r) => { r.selector = under(r.selector); });
        if (rest) { copy.params = rest; made.add(copy); m.after(copy); }
        else m.after(copy.nodes);
      } else if (NO_PREF.test(m.params)) {
        rulesIn(m, (r) => { r.selector = notUnder(r.selector); });
        made.add(m);
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
