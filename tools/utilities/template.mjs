// The utility template (src/styles/utilities.template.css) is CSS with two additions, expanded by
// tools/utilities/build.mjs:
//
//   @each <family> { <rules> }
//     <rules> once per token in that family (families.mjs), one copy per line, with {k} replaced by the
//     class-name part, {t} by the token name and {v} by the token's value. "@each <family> not(px, 0) { … }"
//     leaves out the tokens whose class-name part is listed.
//
//   @responsive { .block .flex … }
//     For each screen-* token, an @media (min-width: <value>) block with an "<screen>:" copy of each class
//     listed (.md\:flex), declaring what the class itself declares above.
//
// Everything else is copied as it is.

// Index of the brace that closes the one at `open`, skipping comments and strings.
function closing(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === '/' && s[i + 1] === '*') { i = s.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'") { i = s.indexOf(c, i + 1); continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  throw new Error(`Unclosed brace at ${open}`);
}

// A class name as a CSS selector: a leading digit has to be escaped (2xl → \32 xl).
const ident = (s) => (/^\d/.test(s) ? `\\3${s[0]} ${s.slice(1)}` : s);

export function expand(template, fams) {
  let out = '';
  let i = 0;
  const re = /@each ([\w-]+)(?: not\(([^)]*)\))? \{|@responsive \{/g;
  for (let m; (m = re.exec(template));) {
    const open = m.index + m[0].length - 1;
    const close = closing(template, open);
    const indent = /[^\S\n]*$/.exec(template.slice(0, m.index))[0];
    const body = template.slice(open + 1, close).trim();
    out += template.slice(i, m.index);
    if (m[0].startsWith('@responsive')) {
      // what each class declares, from its first rule so far
      const decl = new Map();
      for (const r of out.matchAll(/^\s*(\.\S+) (\{[^{}\n]*\})$/gm)) if (!decl.has(r[1])) decl.set(r[1], r[2]);
      const classes = body.split(/\s+/);
      for (const c of classes) if (!decl.has(c)) throw new Error(`@responsive: no rule for ${c} above it`);
      out += fams['screen-'].map(({ k, v }) => `@media (min-width: ${v}) {\n`
        + classes.map((c) => `${indent}  .${ident(k)}\\:${c.slice(1)} ${decl.get(c)}`).join('\n') + `\n${indent}}`).join('\n' + indent);
    } else {
      const not = m[2] ? m[2].split(', ') : [];
      const items = fams[m[1]] && fams[m[1]].filter((x) => !not.includes(x.k));
      if (!items) throw new Error(`@each ${m[1]}: no such token family (tools/utilities/families.mjs)`);
      const copy = body.replace(/\n\s*/g, '\n' + indent);
      out += items.map(({ k, t, v }) => copy.replaceAll('{k}', k).replaceAll('{t}', t).replaceAll('{v}', v)).join('\n' + indent);
    }
    i = re.lastIndex = close + 1;
  }
  return out + template.slice(i);
}
