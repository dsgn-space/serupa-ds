// The changes serupa-migrate makes (205, I8), without Node's modules, so the upgrade guide in the docs can list them
// too. Each one is a breaking entry of the changelog that can be made without reading the code around it.
export const CODE = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.mdx', '.vue', '.svelte', '.astro'];
const MARKUP = ['.html', '.htm', '.php', '.erb', '.hbs', '.njk', '.liquid', '.twig'];
const STYLE = ['.css', '.scss', '.sass', '.less'];
export const ALL = [...CODE, ...MARKUP, ...STYLE];

// The parts of an opening tag's text that are its own, not inside {…} or a quoted value: each other character is
// replaced by a space, so a search in the result finds only attribute names, at the same offsets.
function topLevel(s) {
  let out = '', depth = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { out += ' '; if (c === '\\') { out += s[i + 1] === undefined ? '' : ' '; i++; } else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || (c === '`' && depth > 0)) { q = c; out += ' '; continue; }
    if (c === '{') { depth++; out += ' '; continue; }
    if (c === '}') { depth--; out += ' '; continue; }
    out += depth > 0 ? ' ' : c;
  }
  return out;
}

/** Each opening tag of the component `name`, as [start, end): the text between `<Name` and the `>` that closes it. */
export function openTags(src, name) {
  const out = [];
  const re = new RegExp(`<${name.replace('.', '\\.')}(?=[\\s/>])`, 'g');
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].length;
    let i = start, depth = 0, q = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || (c === '`' && depth > 0)) q = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    out.push([start, i]);
    re.lastIndex = i;
  }
  return out;
}

const attrAt = (prop) => new RegExp(`(?<=\\s)${prop}(?=\\s*=|\\s|/|$)`, 'g');

/** Rename a prop written on the component's tags. Gives back the new text and how many it renamed. A tag that already
 * has the new name keeps both (a wrapper passing each through), rather than end with the new one twice. */
export function renameProp(src, component, from, to) {
  let n = 0;
  const tags = openTags(src, component);
  for (const [s, e] of tags.reverse()) {
    const attrs = src.slice(s, e), mask = topLevel(attrs);
    if (attrAt(to).test(mask)) continue;
    let next = attrs;
    for (const m of [...mask.matchAll(attrAt(from))].reverse()) { next = next.slice(0, m.index) + to + next.slice(m.index + from.length); n++; }
    src = src.slice(0, s) + next + src.slice(e);
  }
  return { text: src, count: n };
}

/** Change a prop's string value written on the component's tags (variant="default" to variant="plain"), in quotes or
 * in braces around quotes. Gives back the new text and how many it changed. */
export function renameValue(src, component, prop, from, to) {
  let n = 0;
  const value = new RegExp(`^(\\s*=\\s*\\{?\\s*)(["'])${from}\\2`);
  for (const [s, e] of openTags(src, component).reverse()) {
    const attrs = src.slice(s, e), mask = topLevel(attrs);
    let next = attrs;
    for (const m of [...mask.matchAll(attrAt(prop))].reverse()) {
      const at = m.index + prop.length, v = value.exec(next.slice(at));
      if (!v) continue;
      next = next.slice(0, at) + v[1] + v[2] + to + v[2] + next.slice(at + v[0].length);
      n++;
    }
    src = src.slice(0, s) + next + src.slice(e);
  }
  return { text: src, count: n };
}

// The index of the } that closes the { at i, past quotes and nested braces.
function closeBrace(s, i) {
  let depth = 0, q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return s.length - 1;
}

/** Remove a prop, with its value, from the component's tags. */
export function removeProp(src, component, prop) {
  let n = 0;
  for (const [s, e] of openTags(src, component).reverse()) {
    let attrs = src.slice(s, e);
    for (const m of [...topLevel(attrs).matchAll(attrAt(prop))].reverse()) {
      let i = m.index + prop.length;
      while (/\s/.test(attrs[i] || '')) i++;
      if (attrs[i] === '=') {
        i++;
        while (/\s/.test(attrs[i] || '')) i++;
        if (attrs[i] === '"' || attrs[i] === "'") i = attrs.indexOf(attrs[i], i + 1) + 1;
        else if (attrs[i] === '{') i = closeBrace(attrs, i) + 1;
      }
      let b = m.index;
      while (b > 0 && /[ \t]/.test(attrs[b - 1])) b--;
      if (b > 0 && attrs[b - 1] === '\n') { while (b > 0 && /\s/.test(attrs[b - 1])) b--; }
      attrs = attrs.slice(0, b) + attrs.slice(i);
      n++;
    }
    src = src.slice(0, s) + attrs + src.slice(e);
  }
  return { text: src, count: n };
}

// A utility class that 14.0.0 moved to utilities-extra.css, as written in a class list: with its variants (md:, hover:),
// not part of a longer word, and not a CSS property (mask-image:). A gradient stop counts only with a value that is
// clearly a color or a position (to-blue-500, from-transparent, via-[#fff], from-10%), since "to-" and "from-" are
// common in other words.
const STOP = '(?:from|via|to)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d|(?:transparent|current|black|white|inherit)(?![\\w-])|\\[|\\(|\\d+%)';
const MOVED = new RegExp(`(?<![\\w$./-])(?:[a-z0-9@[\\]-]+:)*-?(?:mask-[a-z0-9]|bg-(?:linear|radial|conic)(?![a-z])|${STOP})[^\\s"'\`{}<>]*(?<!:)(?![\\w-]*\\s*:)`, 'g');

const lineOf = (src, index) => src.slice(0, index).split('\n').length;
const notesFor = (src, re, message) => [...src.matchAll(re)].map((m) => ({ line: lineOf(src, m.index), message }));

// A prop renamed on one component. What's left of the old name in a file that names the component (a props
// object, a spread, a wrapper's own prop) is listed to check by hand.
// `leftovers: false` for a name too common to point at (onChange is on every input).
const propRename = (version, id, component, from, to, { leftovers = true } = {}) => ({
  version, id, exts: CODE,
  title: `${component}: \`${from}\` is \`${to}\``,
  run(src) {
    if (!new RegExp(`\\b${component}\\b`).test(src)) return { text: src, count: 0, notes: [] };
    const r = renameProp(src, component, from, to);
    if (!leftovers) return { ...r, notes: [] };
    return { ...r, notes: notesFor(r.text, new RegExp(`\\b${from}\\b`, 'g'), `\`${from}\` here isn't on a <${component}> tag: if it reaches ${component} (in a props object or a spread), rename it to \`${to}\``) };
  },
});

/** Every change, oldest major first. `version` is the major that made the change. */
export const TRANSFORMS = [
  {
    version: '7.0.0', id: 'common-icon-name', exts: CODE,
    title: 'The `CommonIconName` type is `IconName`',
    run(src) {
      let count = 0;
      let text = src.replace(/\bCommonIconName\b/g, () => { count++; return 'IconName'; });
      // `import { CommonIconName, IconName }` would import IconName twice.
      text = text.replace(/(import\s+(?:type\s+)?\{)([^}]*)(\}\s*from\s*['"]serupa-ds['"])/g, (all, a, names, b) => {
        const list = names.split(',').map((n) => n.trim()).filter(Boolean);
        const kept = [...new Set(list)];
        if (kept.length === list.length) return all;
        return a + (names.match(/^\s*/)?.[0] ?? '') + kept.join(', ') + (/,\s*$/.test(names) ? ',' : '') + (names.match(/\s*$/)?.[0] ?? '') + b;
      });
      return { text, count, notes: [] };
    },
  },
  {
    version: '8.0.0', id: 'bundle-js', exts: ALL,
    title: '`bundle.js` is `serupa.iife.js`',
    run(src) {
      let count = 0;
      const text = src.replace(/(serupa-ds\/(?:dist\/)?)bundle\.js\b/g, (_, a) => { count++; return a + 'serupa.iife.js'; });
      return { text, count, notes: [] };
    },
  },
  {
    version: '11.0.0', id: 'badge-size', exts: CODE,
    title: 'Badge: `size` is removed (badges have one size)',
    run(src) {
      if (!/\bBadge\b/.test(src)) return { text: src, count: 0, notes: [] };
      return { ...removeProp(src, 'Badge', 'size'), notes: [] };
    },
  },
  {
    version: '11.0.0', id: 'button-ripple', exts: ALL,
    title: 'Button: the press ripple and its tokens are removed',
    run: (src) => ({ text: src, count: 0, notes: notesFor(src, /--button-ripple-[\w-]+|\bdk-btn__ripples\b/g, 'the Button ripple is gone, with nothing in its place: remove this') }),
  },
  propRename('11.0.0', 'radio-group-on-change', 'RadioGroup', 'onChange', 'onValueChange', { leftovers: false }),
  {
    version: '12.0.0', id: 'badge-ripple', exts: ALL,
    title: 'Badge: the press ripple and its tokens are removed',
    run: (src) => ({ text: src, count: 0, notes: notesFor(src, /--badge-ripple-[\w-]+|\bdk-badge__ripples\b/g, 'the Badge ripple is gone, with nothing in its place: remove this') }),
  },
  propRename('13.0.0', 'icon-button-hide-title', 'IconButton', 'noTitle', 'hideTitle'),
  propRename('13.0.0', 'table-hide-caption', 'Table', 'captionHidden', 'hideCaption'),
  {
    version: '14.0.0', id: 'utilities-extra', exts: [...CODE, ...MARKUP],
    title: 'Masks and gradients (`mask-*`, `bg-linear-*`, `bg-radial*`, `bg-conic*`, `from-*`, `via-*`, `to-*`) move to `utilities-extra.css`',
    run(src) {
      // A file that imports or links the extra file already has them.
      if (/utilities-extra\.css/.test(src)) return { text: src, count: 0, notes: [] };
      const found = [...src.matchAll(MOVED)];
      if (!found.length) return { text: src, count: 0, notes: [] };
      const names = [...new Set(found.map((m) => m[0]))];
      return { text: src, count: 0, notes: [{ line: lineOf(src, found[0].index),
        message: `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` and ${names.length - 3} more` : ''} ${names.length === 1 ? 'is' : 'are'} no longer in bundle.css: import 'serupa-ds/utilities-extra.css' after the bundle (once, where the app imports it), or the masks and gradients don't show` }] };
    },
  },
  {
    version: '14.0.0', id: 'combobox-more-results', exts: ALL,
    title: 'Combobox: the `moreResults` label and `.dk-combobox__more` are removed',
    run: (src) => ({ text: src, count: 0, notes: [
      ...notesFor(src, /\bmoreResults\b/g, 'the moreResults label is gone (Combobox now draws every match as you scroll): remove it from the labels you pass to <SerupaProvider labels>'),
      ...notesFor(src, /\bdk-combobox__more\b/g, 'the "Keep typing to narrow" line is gone: remove this rule'),
    ] }),
  },
  // Deprecated in 14.x and removed in 15.0.0. The new names already work, so these are safe to run before upgrading.
  // The old names are common words (position, delay, layout), so what's left of them isn't listed.
  propRename('15.0.0', 'tooltip-open-delay', 'Tooltip', 'delay', 'openDelay', { leftovers: false }),
  propRename('15.0.0', 'switch-loading', 'Switch', 'pending', 'loading', { leftovers: false }),
  propRename('15.0.0', 'field-orientation', 'Field', 'layout', 'orientation', { leftovers: false }),
  propRename('15.0.0', 'splitter-orientation', 'Splitter', 'direction', 'orientation', { leftovers: false }),
  propRename('15.0.0', 'fab-placement', 'Fab', 'position', 'placement', { leftovers: false }),
  propRename('15.0.0', 'toaster-placement', 'Toaster', 'position', 'placement', { leftovers: false }),
  propRename('15.0.0', 'offline-banner-on-online-change', 'OfflineBanner', 'onChange', 'onOnlineChange', { leftovers: false }),
  propRename('15.0.0', 'drawer-placement', 'Drawer', 'side', 'placement', { leftovers: false }),
  propRename('15.0.0', 'notification-center-placement', 'NotificationCenter', 'side', 'placement', { leftovers: false }),
  propRename('15.0.0', 'table-loading', 'Table', 'busy', 'loading', { leftovers: false }),
  propRename('15.0.0', 'data-grid-loading', 'DataGrid', 'busy', 'loading', { leftovers: false }),
  propRename('15.0.0', 'list-loading', 'List', 'busy', 'loading', { leftovers: false }),
  propRename('15.0.0', 'button-loading-label', 'Button', 'loadingText', 'loadingLabel', { leftovers: false }),
  propRename('15.0.0', 'badge-loading-label', 'Badge', 'loadingText', 'loadingLabel', { leftovers: false }),
  ...['Checkbox', 'CheckboxGroup', 'Radio', 'RadioGroup'].map((component) => ({
    version: '15.0.0', id: `${component.replace(/(?<=.)([A-Z])/g, '-$1').toLowerCase()}-variant-plain`, exts: CODE,
    title: `${component}: \`variant="default"\` is \`variant="plain"\``,
    run: (src) => (new RegExp(`\\b${component}\\b`).test(src) ? { ...renameValue(src, component, 'variant', 'default', 'plain'), notes: [] } : { text: src, count: 0, notes: [] }),
  })),
];

const major = (v) => Number(/^v?(\d+)/.exec(String(v))?.[1]);

/** The changes for a project on `from` (a version, or null for all of them). */
export const transformsAfter = (from) => (from == null ? TRANSFORMS : TRANSFORMS.filter((t) => major(t.version) > major(from)));

/** One file's text through the changes: the new text, the count per change and what to check by hand. */
export function migrate(src, file, transforms = TRANSFORMS) {
  const ext = (/\.[^./\\]+$/.exec(file)?.[0] || '').toLowerCase();
  const counts = {}, notes = [];
  for (const t of transforms) {
    if (!t.exts.includes(ext)) continue;
    const r = t.run(src);
    src = r.text;
    if (r.count) counts[t.id] = r.count;
    for (const n of r.notes) notes.push({ ...n, id: t.id });
  }
  return { text: src, counts, notes };
}

