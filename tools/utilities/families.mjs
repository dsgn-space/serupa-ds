// The token families the utility template loops over, read from tokens.json. Each item has
//   k  the class-name part, CSS-escaped (".p-0\.5")
//   t  the token name, CSS-escaped ("var(--spacing-0\.5)")
// A family named in the template ("@each spacing- { … }") gets one copy per token, in tokens.json order,
// so a new token gets its utility classes without anyone editing the CSS. The families:
//   color       every color token; k is the token name (.bg-primary → var(--primary))
//   fraction    the sizing-a-b tokens; k is a/b (.w-1/2 → var(--sizing-1-2))
//   <prefix>-   every token whose name starts with <prefix>-; k is the rest (.p-4 → var(--spacing-4))
const esc = (s) => s.replace(/[./%]/g, (c) => '\\' + c);

export function families(tokens) {
  const all = Object.values(tokens).filter((g) => g && Array.isArray(g.tokens)).flatMap((g) => g.tokens);
  const item = (x, k) => ({ k: esc(k), t: esc(x.name), v: typeof x.value === 'string' ? x.value : '' });
  const fams = {
    color: tokens.color.tokens.map((x) => item(x, x.name)),
    fraction: all.filter((x) => /^sizing-\d+-\d+$/.test(x.name)).map((x) => item(x, x.name.slice(7).replace('-', '/'))),
  };
  return new Proxy(fams, {
    get: (f, name) => f[name] || (typeof name === 'string' && name.endsWith('-')
      ? (f[name] = all.filter((x) => x.name.startsWith(name)).map((x) => item(x, x.name.slice(name.length))))
      : undefined),
  });
}

// Every prefix family the token names allow, for the template converter.
export function prefixes(tokens) {
  const all = Object.values(tokens).filter((g) => g && Array.isArray(g.tokens)).flatMap((g) => g.tokens.map((x) => x.name));
  const set = new Set();
  for (const n of all) { const parts = n.split('-'); for (let i = 1; i < parts.length; i++) set.add(parts.slice(0, i).join('-') + '-'); }
  return [...set];
}
