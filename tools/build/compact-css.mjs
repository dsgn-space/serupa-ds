// Whitespace-only compaction of the shipped CSS: drops the spaces and line breaks around { } ; : , > and each
// block's last ";", outside strings, comments and escapes, and starts a new line after each "}" so devtools still
// shows about one rule per line. A custom property's value (and @property's initial-value) is kept as written,
// since the browser keeps its whitespace in the computed value. Nothing else changes: no rule, selector or value is
// rewritten (tools/test/compact-css.mjs reads the CSS back through lightningcss and checks it's the same).
const PUNCT = '{};,>';
const CUSTOM = /(--[\w-]+|initial-value)\s*:\s*/y;

export function compactCss(css) {
  // Built as an array of pieces, each ending where the next decision looks (string slicing a 1.5 MB result is slow).
  const out = [];
  let i = 0, space = false, at = false;   // at: the statement being written is an at-rule (@media, @layer …)
  const n = css.length;
  const last = () => { const p = out[out.length - 1]; return p ? p[p.length - 1] : undefined; };
  const drop = () => { const p = out.pop(); if (p.length > 1) out.push(p.slice(0, -1)); };
  // A space between two tokens survives only where neither side is punctuation (a descendant combinator, a value list).
  const word = (next) => {
    if (space && out.length && !PUNCT.includes(last()) && last() !== '\n' && last() !== ':' && !PUNCT.includes(next)) out.push(' ');
    space = false;
  };
  while (i < n) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2) + 2, comment = css.slice(i, end);
      word('/');
      out.push(comment);
      if (comment.startsWith('/*!')) out.push('\n');   // the banner keeps its own line
      i = end;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && css[j] !== ch) j += css[j] === '\\' ? 2 : 1;
      word(ch);
      out.push(css.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (ch === '\\') {
      // An escape, and the one whitespace that ends a hex escape, which belongs to it (".\31 0").
      let j = i + 1;
      if (/[0-9a-fA-F]/.test(css[j])) { while (j < n && j < i + 7 && /[0-9a-fA-F]/.test(css[j])) j++; if (/\s/.test(css[j] || '')) j++; } else j++;
      word('\\');
      out.push(css.slice(i, j));
      i = j;
      continue;
    }
    if (/\s/.test(ch)) { space = true; i++; continue; }
    // A custom property: its name, then its value as written up to the ";" or "}" that ends it.
    if ((last() === '{' || last() === ';') && (ch === '-' || ch === 'i')) {
      CUSTOM.lastIndex = i;
      const m = CUSTOM.exec(css);
      if (m) {
        let j = CUSTOM.lastIndex, depth = 0;
        while (j < n) {
          const c = css[j];
          if (c === '"' || c === "'") { j++; while (j < n && css[j] !== c) j += css[j] === '\\' ? 2 : 1; }
          else if (c === '\\') j++;
          else if (c === '(' || c === '[') depth++;
          else if (c === ')' || c === ']') depth--;
          else if (depth === 0 && (c === ';' || c === '}')) break;
          j++;
        }
        space = false;
        out.push(m[1] + ':' + css.slice(CUSTOM.lastIndex, j).trim());
        i = j;
        continue;
      }
    }
    if (PUNCT.includes(ch)) {
      space = false;
      if (last() === '\n' && ch !== '}') drop();
      if (ch === '}' && last() === ';') drop();
      out.push(ch);
      // A new line after each "}", and after the "{" of an at-rule's block, so its first rule starts a line too.
      if (ch === '}' || (ch === '{' && at)) out.push('\n');
      if (ch !== ',' && ch !== '>') at = false;
      i++;
      continue;
    }
    word(ch);
    if (ch === '@' && /[{};\n]/.test(last() || '\n')) at = true;
    out.push(ch);
    i++;
    if (ch === ':') space = false;
  }
  return out.join('');
}
