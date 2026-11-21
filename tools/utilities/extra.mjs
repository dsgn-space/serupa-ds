// utilities-extra.css (V4): the utility families few pages use, which ship in their own file instead of utilities.css
// and bundle.css. Masks (mask-*) and gradients (bg-linear-*, bg-radial*, bg-conic*, and the from-, via- and to-
// stops they read) are a quarter of the rules: a page that wants them imports serupa-ds/utilities-extra.css after
// bundle.css or utilities.css. Storybook and the tests load both, so the template keeps them where they belong.
//   split(css) → { core, extra, palette }, each a stylesheet in the same order, with the same @layer, @media and
//   @supports blocks around its rules; the @property rules for --srp-mask-* and --srp-gradient-* go with the extras.
// utilities-palette.css (17.0.0): the classes that name a palette step (bg-red-500, text-slate-700, border-zinc-200,
// shadow-blue-500/20) rather than a role (bg-primary, text-text-muted). They were 44% of the utility rules and
// nothing in the system used them: a role follows the theme, a palette step doesn't. A page that wants them imports
// serupa-ds/utilities-palette.css after bundle.css or utilities.css. The gradient stops on a palette step
// (from-red-500) stay with the gradients, in utilities-extra.css.

/** The classes that ship in utilities-extra.css, without a responsive prefix (md:from-primary is from-primary), negative
 *  ones (-mask-linear-45) included. */
export const EXTRA = /^-?(?:mask-|bg-(?:linear|radial|conic)\b|(?:from|via|to)-)/;
/** The classes that ship in utilities-palette.css: one that ends in a palette step, with or without an opacity. */
export const PALETTE = /-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)(?:\/[\d.]+)?$/;
/** The internal variables only those classes set or read. */
export const EXTRA_VARS = /^--srp-(?:mask|gradient)-/;

const unescape = (c) => c.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');
// The classes a selector names, and the class prefixes it matches ([class^="from-"], [class*=" mask-t-"]).
const classesIn = (sel) => [
  ...[...sel.matchAll(/\.((?:[A-Za-z0-9_-]|\\[0-9a-fA-F]{1,6} ?|\\.)+)/g)].map((m) => unescape(m[1]).replace(/^(?:[a-z0-9-]+:)+/, '')),
  ...[...sel.matchAll(/\[class[\^*]="\s?([^"]+)"\]/g)].map((m) => m[1]),
];

// Top-level items of a stylesheet (comments already gone): { pre, body } for a block, { pre } for a statement.
function items(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    let j = i, depth = 0, q = null, brace = -1;
    for (; j < s.length; j++) {
      const ch = s[j];
      if (q) { if (ch === '\\') j++; else if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") q = ch;
      else if (ch === '{') { if (depth === 0) brace = j; depth++; }
      else if (ch === '}') { if (--depth === 0) { j++; break; } }
      else if (ch === ';' && depth === 0) { j++; break; }
    }
    out.push(brace < 0 || brace > j ? { pre: s.slice(i, j).trim() } : { pre: s.slice(i, brace).trim(), body: s.slice(brace + 1, j - 1) });
    i = j;
  }
  return out;
}

export function split(css) {
  const KINDS = ['core', 'extra', 'palette'];
  const kindOf = (c) => (EXTRA.test(c) ? 'extra' : PALETTE.test(c) ? 'palette' : 'core');
  const walk = (s) => {
    const out = { core: [], extra: [], palette: [] };
    for (const { pre, body } of items(s)) {
      if (body === undefined) { out.core.push(pre); continue; }
      if (/^@(layer|media|supports|container)\b/.test(pre)) {
        const inner = walk(body);
        for (const k of KINDS) if (inner[k].trim()) out[k].push(`${pre} {\n${inner[k]}\n}`);
        continue;
      }
      if (pre.startsWith('@property')) { (EXTRA_VARS.test(pre.split(/\s+/)[1]) ? out.extra : out.core).push(`${pre} {${body}}`); continue; }
      if (pre.startsWith('@')) { out.core.push(`${pre} {${body}}`); continue; }   // @keyframes
      const kinds = new Set(classesIn(pre).map(kindOf));
      if (kinds.size > 1) throw new Error(`utilities: a rule mixes ${[...kinds].join(' and ')} classes: ${pre}`);
      out[kinds.size ? [...kinds][0] : 'core'].push(`${pre} {${body}}`);
    }
    return Object.fromEntries(KINDS.map((k) => [k, out[k].join('\n')]));
  };
  return walk(css.replace(/\/\*(?!!)[\s\S]*?\*\//g, ''));
}
