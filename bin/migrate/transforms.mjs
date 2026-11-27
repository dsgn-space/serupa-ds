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
      let i = m.index + prop.length, j = i;
      while (/\s/.test(attrs[j] || '')) j++;
      if (attrs[j] === '=') {
        i = j + 1;
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

/** Whether the word at `at` is inside a class list on its line: class="…", className="…", className={`…`} or
 * class: '…'. Only there is a bare ease-in-out the utility class rather than the CSS keyword or a word of prose. */
function inClassList(src, at) {
  const line = src.slice(src.lastIndexOf('\n', at - 1) + 1, at);
  const open = /(["'`])[^"'`]*$/.exec(line);
  return !!open && /\bclass(?:Name)?\s*[=:]\s*\{?\s*$/.test(line.slice(0, open.index));
}
// The same, or inside a class-joining call (cn, clsx, cx, classNames, twMerge) that starts on the line.
function inClasses(src, at) {
  if (inClassList(src, at)) return true;
  const line = src.slice(src.lastIndexOf('\n', at - 1) + 1, at);
  const open = /(["'`])[^"'`]*$/.exec(line);
  if (!open) return false;
  const before = line.slice(0, open.index);
  const call = [...before.matchAll(/\b(?:cn|clsx|cx|classNames|twMerge)\(/g)].pop();
  // Still inside the call: no tag or statement has ended since it opened.
  return !!call && !/[>;]/.test(before.slice(call.index));
}
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

// Props renamed on several components at once (17.0.0's icon and nav names). As propRename, what's left of an old name
// in a file that names one of them is listed to check by hand.
const ICON_PROP_COMPONENTS = ['Button', 'SplitButton', 'Badge', 'Input', 'Select', 'Combobox', 'NumberInput', 'PasswordInput', 'PhoneInput'];
function propsRename(version, id, title, components, pairs, { leftovers = true } = {}) {
  return {
    version, id, exts: CODE, title,
    run(src) {
      const here = components.filter((c) => new RegExp(`\\b${c}\\b`).test(src));
      if (!here.length) return { text: src, count: 0, notes: [] };
      let text = src, count = 0;
      for (const c of here) for (const [from, to] of pairs) { const r = renameProp(text, c, from, to); text = r.text; count += r.count; }
      const notes = leftovers ? pairs.flatMap(([from, to]) => notesFor(text, new RegExp(`\\b${from}\\b`, 'g'), `\`${from}\` here isn't on a <${here.join('>, <')}> tag: if it reaches one (in a props object or a spread), rename it to \`${to}\``)) : [];
      return { text, count, notes };
    },
  };
}

// The callbacks whose second argument became a details object in 17.0.0: [component, prop, what it was, what it is].
const DETAILS_17 = [
  ['Calendar', 'onValueChange', 'the day as "yyyy-mm-dd"', '{ iso }'],
  ['DatePicker', 'onValueChange', 'the day as "yyyy-mm-dd"', '{ iso }'],
  ['DateRangePicker', 'onValueChange', 'the range as "yyyy-mm-dd" strings ({ start, end })', '{ iso: { start, end } }'],
  ['RangeCalendar', 'onValueChange', 'the range as "yyyy-mm-dd" strings ({ start, end })', '{ iso: { start, end } }'],
  ['PeriodPicker', 'onValueChange', 'the first and last days ({ start, end })', '{ range: { start, end } }'],
  ['Checkbox', 'onCheckedChange', 'the change event', '{ event }'],
  ['CheckboxGroup', 'onValueChange', 'the change event', '{ event }'],
  ['RadioGroup', 'onValueChange', 'the change event', '{ event }'],
  ['Switch', 'onCheckedChange', 'the change event', '{ event }'],
  ['TableSelectCell', 'onCheckedChange', 'the change event', '{ event }'],
  ['Pagination', 'onPageSizeChange', 'the page, as a number', '{ page }'],
];

// Component tokens that put the state before the property, renamed with the state last in 14.x (the old names read as
// fallbacks until 15.0.0). tools/test/upgrades.mjs checks this list against each $deprecated token.
// 20.0.0 names the color tokens thing first, then variant, then state (surface-raised-hover, text-danger): each old
// name and its new one. The old names stay, deprecated, until 21.0.0. A token merged into another (surface-overlay into
// surface-raised) maps to the one it joined.
export const TOKENS_20 = {
  'surface-page': 'background', 'surface-muted': 'surface-sunken', 'pressed': 'surface-pressed',
  'surface-hover-raised': 'surface-raised-hover', 'disabled-surface': 'surface-disabled',
  'highlight': 'surface-highlight', 'highlight-indicator': 'surface-highlight-indicator',
  'secondary': 'surface-secondary', 'secondary-hover': 'surface-secondary-hover',
  'secondary-pressed': 'surface-secondary-pressed', 'overlay': 'backdrop', 'primary': 'surface-brand',
  'primary-hover': 'surface-brand-hover', 'primary-pressed': 'surface-brand-pressed',
  'primary-subtle': 'surface-brand-subtle', 'primary-subtle-pressed': 'surface-brand-subtle-pressed',
  'on-primary': 'text-on-brand', 'primary-text': 'text-brand', 'primary-text-hover': 'text-brand-hover',
  'primary-edge': 'border-brand', 'surface-control': 'control', 'placeholder': 'field-placeholder',
  'text-muted-shaded': 'text-secondary', 'disabled-text': 'text-disabled', 'disabled-border': 'border-disabled',
  'border-overlay': 'border-raised', 'picture-edge': 'border-picture', 'link-visited': 'text-link-visited',
  'success': 'surface-success', 'success-hover': 'surface-success-hover', 'success-subtle': 'surface-success-subtle',
  'success-subtle-hover': 'surface-success-subtle-hover', 'success-text': 'text-success',
  'on-success': 'text-on-success', 'success-border': 'border-success', 'warning': 'surface-warning',
  'warning-hover': 'surface-warning-hover', 'warning-subtle': 'surface-warning-subtle',
  'warning-subtle-hover': 'surface-warning-subtle-hover', 'warning-text': 'text-warning',
  'on-warning': 'text-on-warning', 'warning-border': 'border-warning', 'danger': 'surface-danger',
  'danger-hover': 'surface-danger-hover', 'danger-subtle': 'surface-danger-subtle',
  'danger-subtle-hover': 'surface-danger-subtle-hover', 'danger-text': 'text-danger', 'on-danger': 'text-on-danger',
  'danger-border': 'border-danger', 'info': 'surface-info', 'info-hover': 'surface-info-hover',
  'info-subtle': 'surface-info-subtle', 'info-subtle-hover': 'surface-info-subtle-hover', 'info-text': 'text-info',
  'on-info': 'text-on-info', 'info-border': 'border-info', 'danger-pressed': 'surface-danger-pressed',
  'surface-overlay': 'surface-raised', 'border-elevated': 'border-raised', 'border-control': 'border-strong',
  'border-control-hover': 'field-border-hover', 'field-hover': 'surface-raised-hover',
  'field-pressed': 'surface-raised-pressed',
};
// The utility class families made from every color token (tools/utilities/families.mjs: bg-surface-brand).
const COLOR_CLASSES = 'text|decoration|bg|border|divide|outline|shadow|ring-offset|ring|accent|caret|scrollbar-thumb|scrollbar-track|fill|stroke';

export const TOKENS_15 = {
  '--avatar-group-more-hover-bg': '--avatar-group-more-bg-hover',
  '--button-disabled-bg': '--button-bg-disabled', '--button-disabled-text': '--button-text-disabled', '--button-disabled-border': '--button-border-disabled',
  '--calendar-selected-bg': '--calendar-bg-selected', '--calendar-selected-color': '--calendar-color-selected', '--calendar-selected-depth': '--calendar-depth-selected',
  '--carousel-dot-active-width': '--carousel-dot-width-active',
  '--data-grid-selected-bg': '--data-grid-bg-selected',
  '--pagination-current-bg': '--pagination-bg-current', '--pagination-current-text': '--pagination-text-current', '--pagination-current-depth': '--pagination-depth-current',
  '--period-picker-selected-bg': '--period-picker-bg-selected', '--period-picker-selected-text': '--period-picker-text-selected', '--period-picker-selected-depth': '--period-picker-depth-selected',
  '--stepper-active-bg': '--stepper-bg-active', '--stepper-active-text': '--stepper-text-active', '--stepper-active-depth': '--stepper-depth-active',
  '--stepper-error-bg': '--stepper-bg-error', '--stepper-error-text': '--stepper-text-error',
};

// 16.0.0: a theme is its colors. The tactile look (the depth-* tokens, data-depth and each component's depth token) is
// removed with nothing in its place: the layers were empty outside the violet brand. tools/test/upgrades.mjs checks
// that none of these is a token any more.
export const DEPTH_TOKENS_16 = ['--depth-control', '--depth-control-hover', '--depth-control-pressed', '--depth-sheen', '--depth-sheen-pressed', '--depth-part',
  '--depth-field', '--depth-well', '--depth-surface', '--depth-card', '--depth-card-lift', '--depth-press'];
export const COMPONENT_TOKENS_REMOVED_16 = [
  '--button-depth', '--button-depth-hover', '--button-depth-pressed', '--calendar-depth-selected', '--card-depth', '--card-depth-hover',
  '--cascade-select-panel-depth', '--chart-tip-depth', '--checkbox-depth', '--checkbox-depth-checked', '--checkbox-draw-duration',
  '--combobox-listbox-depth', '--date-picker-popup-depth', '--dialog-depth', '--drawer-depth', '--hover-card-depth', '--input-depth',
  '--kanban-card-depth', '--kbd-depth', '--menu-depth', '--meter-track-depth', '--navbar-menu-depth', '--offline-banner-depth',
  '--pagination-depth-current', '--period-picker-depth', '--period-picker-depth-selected', '--period-picker-panel-depth', '--pin-input-depth',
  '--popover-depth', '--progress-track-depth', '--radio-depth', '--radio-depth-checked', '--segmented-control-indicator-depth', '--select-depth',
  '--select-picker-depth', '--slider-thumb-depth', '--slider-track-depth', '--sortable-list-item-depth', '--stepper-depth-active',
  '--switch-thumb-depth', '--switch-track-depth', '--textarea-depth', '--time-picker-list-depth', '--toast-depth', '--toggle-button-depth-pressed',
  '--tooltip-depth', '--tour-depth',
];
// The three motion roles that only differed in the tactile look, and what each was everywhere else.
export const MOTION_TOKENS_16 = { '--motion-toggle': '--motion-press', '--ease-toggle': '--ease-move', '--motion-draw': '--duration-0' };

// The raw easing curves 16.0.0 removes, each with the role that has the same curve.
export const EASINGS_16 = {
  'ease-out': 'ease-enter', 'ease-out-quart': 'ease-enter', 'ease-in-out': 'ease-move', 'ease-in-out-cubic': 'ease-move',
  'ease-out-expo': 'ease-settle', 'ease-out-cubic': 'ease-fling', 'ease-out-back': 'ease-pop', 'ease-spring-snappy': 'ease-spring', 'ease-elastic': 'ease-celebrate',
};
// …and those no role has the curve of, with the role that does their job (so the curve changes a little).
export const EASINGS_NEAREST_16 = {
  'ease-in': 'ease-exit', 'ease-in-cubic': 'ease-exit', 'ease-in-quart': 'ease-exit', 'ease-in-expo': 'ease-exit',
  'ease-in-out-quart': 'ease-move', 'ease-in-out-expo': 'ease-move', 'ease-spring-soft': 'ease-spring',
};
// ease-in, ease-out and ease-in-out are CSS keywords too: written bare in a style file they are the browser's own curve.
const CSS_KEYWORDS = new Set(['ease-in', 'ease-out', 'ease-in-out']);

/** The package name as written in an import or a path (`serupa-ds`, `serupa-ds/tokens.css`), renamed to `to`. A word
 * that only starts the same (`serupa-ds-extra`) or ends a longer name (`@x/serupa-ds`) is left. */
export function renamePackage(src, to) {
  let count = 0;
  // In quotes: an import, a require, an import() or a CSS @import; after node_modules/ or a CDN path: a file link.
  const text = src.replace(/(['"`]|node_modules\/|\/npm\/)serupa-ds(?=['"`/@])(?<!@[\w.-]+\/serupa-ds)/g, (_, a) => { count++; return a + to; });
  return { text, count };
}

/** 17.0.0: the `dk` prefix is `srp`: classes (`dk-btn` → `srp-btn`), the internal custom properties (`--dk-*` →
 * `--srp-*`), data attributes (`data-dk-*`), ids, events and the cascade layers (`dk.components` → `srp.components`,
 * and `dk` in an `@layer` list). A `dk` that isn't followed by `-` or one of the layers (a word, a country code) stays. */
export function renamePrefix(src) {
  let count = 0;
  const to = () => { count++; return 'srp'; };
  let text = src.replace(/(?<![A-Za-z0-9_$]|[A-Za-z0-9_$]-)dk(?=-)/g, to)
    .replace(/(?<=(?<![A-Za-z0-9_$-])data-)dk(?=-)/g, to)
    .replace(/(?<=(?<![A-Za-z0-9_$-])--)dk(?![A-Za-z0-9_$-])/g, to)
    .replace(/(?<=\\b)dk(?=-)/g, to)   // in a regular expression: /\bdk-…/
    .replace(/(?<![A-Za-z0-9_$-])dk(?=\.(?:tokens|base|components|utilities)\b|\.\*)/g, to);
  text = text.replace(/@layer\s+[^{;]+/g, (m) => m.replace(/(?<![A-Za-z0-9_$.-])dk(?![A-Za-z0-9_$.-])/g, to));
  return { text, count };
}

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
  {
    version: '15.0.0', id: 'token-names-state-last', exts: ALL,
    title: 'Component tokens put the state last (`--button-disabled-bg` is `--button-bg-disabled`, and 19 more)',
    run(src) {
      let count = 0;
      let text = src;
      for (const [from, to] of Object.entries(TOKENS_15)) {
        // A file that already names the new token handles both on purpose (a fallback chain, a test of the old name).
        if (text.includes(to)) continue;
        text = text.replace(new RegExp(`${from}(?![\\w-])`, 'g'), () => { count++; return to; });
      }
      return { text, count, notes: [] };
    },
  },
  {
    // 15.0.0 removes `border-raised`: a raised card's edge is `border`, as every card's is. 14.x has both names, so this is safe to run before upgrading.
    // From 20.0.0 `border-raised` is a token again (the line on a raised surface), so with no --from this one is left.
    version: '15.0.0', id: 'token-border-raised', exts: ALL, withFrom: true,
    title: '`border-raised` is `border` (`--border-raised`, `color.border-raised`, `bg-border-raised` and the other utility classes)',
    run(src, file, listOnly = false) {
      if (listOnly) return { text: src, count: 0, notes: [] };
      let count = 0;
      // The CSS variable, a token reference, or a utility class (`bg-`, `border-x-`, `hover:ring-`); a longer name that
      // only ends the same (`--my-border-raised`) is left.
      // A name that is a whole inline code span (`--border-raised` in a changelog or a migration note) is prose about
      // the rename, and is left.
      const text = src.replace(/(?<![\w-])(--|color\.|[a-z][a-z-]*-)?border-raised(?![\w-]|\.md\b)/g, (m, pre = '', at) => {
        if (src[at - 1] === '`' && src[at + m.length] === '`') return m;
        count++; return `${pre}border`;
      });
      return { text, count, notes: [] };
    },
  },
  {
    version: '15.0.0', id: 'button-icon', exts: CODE,
    title: 'Button: `icon` is removed; an icon-only button is an IconButton, with a required `label`',
    run(src) {
      if (!/\bButton\b/.test(src)) return { text: src, count: 0, notes: [] };
      const notes = [];
      for (const [s, e] of openTags(src, 'Button')) {
        const m = attrAt('icon').exec(topLevel(src.slice(s, e)));
        if (m) notes.push({ line: lineOf(src, s + m.index), message: 'Button `icon` is gone: make this an <IconButton icon=… label="…"> (its label is the button\'s name, shown as a tooltip; take it from aria-label)' });
      }
      return { text: src, count: 0, notes };
    },
  },
  ...['Checkbox', 'CheckboxGroup', 'Radio', 'RadioGroup'].map((component) => ({
    version: '15.0.0', id: `${component.replace(/(?<=.)([A-Z])/g, '-$1').toLowerCase()}-variant-plain`, exts: CODE,
    title: `${component}: \`variant="default"\` is \`variant="plain"\``,
    run: (src) => (new RegExp(`\\b${component}\\b`).test(src) ? { ...renameValue(src, component, 'variant', 'default', 'plain'), notes: [] } : { text: src, count: 0, notes: [] }),
  })),
  {
    // 16.0.0: violet and emerald differ from blue in color only, and the tactile look is removed.
    version: '16.0.0', id: 'theme-looks-removed', exts: ALL,
    title: 'The tactile look is removed: `data-depth`, the `depth-*` tokens, each component\'s `--…-depth` token, and `motion-toggle`, `ease-toggle` and `motion-draw`',
    run(src) {
      let count = 0;
      let text = src;
      // Read through var(), a removed motion role takes the token it always was outside the tactile look.
      for (const [from, to] of Object.entries(MOTION_TOKENS_16)) text = text.replace(new RegExp(`(var\\(\\s*)${from}(?![\\w-])`, 'g'), (_, pre) => { count++; return pre + to; });
      // The `ease-toggle` utility class and token reference (`hover:ease-toggle`, `{transitions.ease-toggle}`) are `ease-move`.
      // A name that is a whole inline code span is prose about the change, and is left.
      text = text.replace(/(?<![\w-])ease-toggle(?![\w-])/g, (m, at) => { if (text[at - 1] === '`' && text[at + m.length] === '`') return m; count++; return 'ease-move'; });
      const removed = new RegExp(`(?<![\\w-])(?:${[...DEPTH_TOKENS_16, ...COMPONENT_TOKENS_REMOVED_16, ...Object.keys(MOTION_TOKENS_16)].sort((a, b) => b.length - a.length).join('|')})(?![\\w-])`, 'g');
      return { text, count, notes: [
        ...notesFor(text, removed, 'this token is removed with the tactile look and nothing reads it: delete the declaration, or the layer it adds to a box-shadow or background'),
        ...notesFor(text, /\bdata-depth\b/g, '`data-depth` is removed with the tactile look: delete the attribute (every brand is flat)'),
      ] };
    },
  },
  {
    // 16.0.0: the easing tokens are the roles. The raw curves behind them (ease-out-quart, ease-spring-snappy, …) are gone.
    version: '16.0.0', id: 'easing-roles', exts: ALL,
    title: 'The raw easing curves are removed: `ease-in`, `ease-out`, `ease-in-out`, their `-cubic`, `-quart` and `-expo` forms, `ease-out-back`, `ease-spring-soft`, `ease-spring-snappy` and `ease-elastic` (tokens and utility classes) are the easing role with that curve',
    run(src, file = '') {
      const style = /\.(?:css|scss|sass|less)$/i.test(file);
      const all = { ...EASINGS_16, ...EASINGS_NEAREST_16 };
      const names = Object.keys(all).sort((a, b) => b.length - a.length).join('|');
      let count = 0;
      const notes = [];
      // A CSS variable (--ease-out-quart), a token reference ({transitions.ease-out-quart}) or a utility class
      // (ease-out-quart, hover:ease-out-quart). A name that is a whole inline code span is prose about the change, and is
      // left; so is a bare ease-in / ease-out / ease-in-out in a style file, which is the CSS keyword, not the class.
      const text = src.replace(new RegExp(`(?<![\\w-])(--|transitions\\.)?(${names})(?![\\w-])`, 'g'), (m, pre = '', name, at) => {
        if (src[at - 1] === '`' && src[at + m.length] === '`') return m;
        if (!pre && CSS_KEYWORDS.has(name) && (style || !inClassList(src, at))) return m;
        count++;
        if (EASINGS_NEAREST_16[name]) notes.push({ line: lineOf(src, at), message: `${name} has no role with its curve: it is now ${all[name]}, which does its job with a different curve; check the motion still reads right` });
        return pre + all[name];
      });
      return { text, count, notes };
    },
  },
  {
    // 16.0.0: every accent color has a theme, so "emerald" is the emerald ramp and what it was (the teal ramp) is "teal".
    // Both are themes now, so which one a page wants is its own choice: each place is listed, none is rewritten.
    version: '16.0.0', id: 'emerald-is-emerald', exts: ALL,
    title: 'The `emerald` brand draws in the emerald ramp, and the teal it drew in before is the new `teal` brand',
    run(src) {
      const named = /(?<![\w-])emerald-(?:light|dark)(?![\w-])|data-brand["']?\s*[:=]\s*\{?\s*["'`]emerald(?=["'`])|\bbrand\s*[:=]\s*["'`]emerald["'`]|--brand[ =]emerald\b/g;
      return { text: src, count: 0, notes: notesFor(src, named, 'the `emerald` brand is now the emerald ramp, a greener green: write `teal` here (`teal-light`, `teal-dark`, `data-brand="teal"`) to keep the color it was') };
    },
  },
  {
    // 16.0.0 makes the classes of a component's inner parts private: they may change in any release. Nothing is
    // renamed now, so each line that selects one is listed, with the way to style it that keeps working.
    version: '16.0.0', id: 'inner-classes-private', exts: ALL,
    title: 'A component\'s inner classes (`.dk-btn__label`, `.dk-card__header`) are private: style with tokens, `data-component`, `data-state` and the block and modifier classes',
    run(src) {
      const seen = new Set(), notes = [];
      for (const m of src.matchAll(/(?<![\w-])dk-[a-z0-9-]+__[a-z0-9-]+/g)) {
        // The ones an earlier major removed already have their own note.
        if (/^dk-(btn__ripples|badge__ripples|combobox__more)$/.test(m[0])) continue;
        const line = lineOf(src, m.index);
        if (seen.has(line)) continue;
        seen.add(line);
        notes.push({ line, message: `${m[0]} is an inner part's class, which may change in any release from 16.0.0: use a component token, [data-component], [data-state] or the block and modifier classes, or ask for a token if none fits` });
      }
      return { text: src, count: 0, notes };
    },
  },  propRename('17.0.0', 'timeline-item-tone', 'TimelineItem', 'status', 'tone', { leftovers: false }),
  propRename('17.0.0', 'combobox-on-input-value-change', 'Combobox', 'onInputChange', 'onInputValueChange', { leftovers: false }),
  propRename('17.0.0', 'password-input-revealed', 'PasswordInput', 'visible', 'revealed', { leftovers: false }),
  propRename('17.0.0', 'password-input-default-revealed', 'PasswordInput', 'defaultVisible', 'defaultRevealed', { leftovers: false }),
  propRename('17.0.0', 'password-input-on-revealed-change', 'PasswordInput', 'onVisibleChange', 'onRevealedChange', { leftovers: false }),
  {
    version: '17.0.0', id: 'timeline-tone-type', exts: CODE,
    title: '`TimelineStatus` is `TimelineTone`',
    run(src) {
      let count = 0;
      const text = src.replace(/\bTimelineStatus\b/g, () => { count++; return 'TimelineTone'; });
      return { text, count, notes: [] };
    },
  },
  {
    // It changes what code means, not a name, so it edits only when --from says the code was written for an earlier
    // major; without --from, code may be 17.0.0's already, and each Accordion with no type is listed to check instead.
    version: '17.0.0', id: 'accordion-type-single', exts: CODE, withFrom: true,
    title: 'Accordion: `selectionMode` (16.x `type`) is `"multiple"` by default; one written without one gets `selectionMode="single"`, so it stays one open at a time',
    run(src, file, listOnly = false) {
      if (!/\bAccordion\b/.test(src)) return { text: src, count: 0, notes: [] };
      let count = 0;
      const notes = [];
      for (const [s, e] of openTags(src, 'Accordion').reverse()) {
        const mask = topLevel(src.slice(s, e));
        if (attrAt('type').test(mask) || attrAt('selectionMode').test(mask)) continue;
        // Props spread in may carry a type: leave the tag, and say where to look.
        if (listOnly) { notes.unshift({ line: lineOf(src, s), message: 'Accordion with no `selectionMode`: it is `"multiple"` by default from 17.0.0; add selectionMode="single" if it should stay one open at a time (or run with --from)' }); continue; }
        if (/\{\s*\.\.\./.test(src.slice(s, e))) { notes.unshift({ line: lineOf(src, s), message: 'Accordion with spread props and no `selectionMode`: it is `"multiple"` by default now; add selectionMode="single" if the spread doesn\'t set one and it should stay one open at a time' }); continue; }
        src = src.slice(0, s) + ' selectionMode="single"' + src.slice(s);
        count++;
      }
      return { text: src, count, notes };
    },
  },
  {
    version: '17.0.0', id: 'prefix-srp', exts: ALL,
    title: 'The `dk` prefix is `srp`: `dk-*` classes, `--dk-*` properties, `data-dk-*` attributes and the `dk.*` cascade layers',
    run: (src) => ({ ...renamePrefix(src), notes: [] }),
  },
  {
    version: '17.0.0', id: 'brands-opt-in', exts: ALL,
    title: 'Every brand but blue is its own file, `brands/<brand>.css`, loaded after `tokens.css`',
    run(src) {
      const notes = [], seen = new Set();
      for (const m of src.matchAll(BRAND_USE)) {
        const brand = m[1] || m[2] || m[3];
        // A file that already loads the brand (or every brand) has it.
        if (seen.has(brand) || new RegExp(`brands/(?:${brand}|all)\\.css`).test(src)) continue;
        seen.add(brand);
        notes.push({ line: lineOf(src, m.index), message: `the ${brand} brand is no longer in tokens.css: import '@diki-stwn/serupa-ds/brands/${brand}.css' after tokens.css (once, where the app imports it), or brands/all.css where people can switch between brands; without it the page draws blue` });
      }
      return { text: src, count: 0, notes };
    },
  },
  {
    version: '17.0.0', id: 'utilities-trimmed', exts: [...CODE, ...MARKUP],
    title: 'The palette-step, mask, gradient, filter and 3D utility classes are removed (`bg-red-500`, `mask-*`, `bg-linear-*`, `blur-*`, `rotate-*`, `scale-*`)',
    run(src) {
      const names = new Set([...src.matchAll(PALETTE_CLASS), ...src.matchAll(MOVED)].map((m) => m[0]));
      for (const m of src.matchAll(TRIMMED_17)) if (inClassList(src, m.index)) names.add(m[0]);
      if (!names.size) return { text: src, count: 0, notes: [] };
      const list = [...names];
      const first = Math.min(...list.map((n) => src.indexOf(n)));
      return { text: src, count: 0, notes: [{ line: lineOf(src, first),
        message: `${list.slice(0, 3).join(', ')}${list.length > 3 ? ` and ${list.length - 3} more` : ''} ${list.length === 1 ? 'is' : 'are'} no longer a class: for a color use a role class (bg-primary, text-text-muted, border-border), which follows the theme, or var(--red-500) in the app's own CSS; for a mask, gradient, filter or rotate, write that CSS property in the app's own CSS` }] };
    },
  },
  propsRename('17.0.0', 'icon-start-end', 'The icon props say start and end, not left and right: `leftIcon` is `startIcon`, `rightIcon` is `endIcon`',
    ICON_PROP_COMPONENTS, [['leftIcon', 'startIcon'], ['rightIcon', 'endIcon']]),
  propsRename('17.0.0', 'nav-current', 'A nav link marks the current page with `current`, as BreadcrumbItem and TabNavLink do: `active` is `current`',
    ['BottomNavLink', 'NavbarLink', 'NavbarMenu', 'NavbarMenuLink', 'SidebarItem'], [['active', 'current']], { leftovers: false }),
  {
    version: '17.0.0', id: 'callback-details', exts: CODE,
    title: 'A callback\'s second argument is a details object on the eleven callbacks that took a bare value: `(value, { iso })`, `(value, { event })`, `(pageSize, { page })`',
    run(src) {
      const notes = [];
      for (const [component, prop, was, now] of DETAILS_17) {
        if (!new RegExp(`\\b${component}\\b`).test(src)) continue;
        for (const [s, e] of openTags(src, component)) {
          const m = attrAt(prop).exec(topLevel(src.slice(s, e)));
          if (m) notes.push({ line: lineOf(src, s + m.index), message: `${component} ${prop}: the second argument was ${was}, and is now ${now}. A handler that reads it changes; one that takes only the first doesn't` });
        }
      }
      return { text: src, count: 0, notes };
    },
  },
  {
    version: '17.0.0', id: 'text-tone-neutral', exts: CODE,
    title: 'Text: `tone="default"` is `tone="neutral"`, the name every other tone uses',
    run: (src) => (/\bText\b/.test(src) ? { ...renameValue(src, 'Text', 'tone', 'default', 'neutral'), notes: [] } : { text: src, count: 0, notes: [] }),
  },
  propsRename('17.0.0', 'selection-mode', 'Accordion and ToggleGroup say one or many with `selectionMode`, as List, TagGroup and TreeView do: `type` is `selectionMode`',
    ['Accordion', 'ToggleGroup'], [['type', 'selectionMode']], { leftovers: false }),
  propsRename('17.0.0', 'group-aria-label', 'BottomNav, Carousel, Toaster and AvatarGroup take their name for screen readers as `aria-label`, as every other landmark and group does: `label` is `aria-label`',
    ['BottomNav', 'Carousel', 'Toaster', 'AvatarGroup'], [['label', 'aria-label']], { leftovers: false }),
  propsRename('17.0.0', 'switch-label-placement', 'Switch: `labelPosition` is `labelPlacement`, the word every other side or edge uses',
    ['Switch'], [['labelPosition', 'labelPlacement']]),
  propsRename('17.0.0', 'mention-trigger-char', 'MentionInput: `trigger` is `triggerChar`, since `trigger` is the element that opens a Menu, Popover or HoverCard',
    ['MentionInput'], [['trigger', 'triggerChar']], { leftovers: false }),
  propsRename('17.0.0', 'table-cell-in-header', 'TableSelectCell and TableExpandCell: `header` is `inHeader`, since `header` is content on Sidebar',
    ['TableSelectCell', 'TableExpandCell'], [['header', 'inHeader']], { leftovers: false }),
  propsRename('17.0.0', 'list-loading-show-description', 'ListLoadingItems: `description` is `showDescription`, since `description` is text everywhere else',
    ['ListLoadingItems'], [['description', 'showDescription']], { leftovers: false }),
  {
    version: '17.0.0', id: 'drawer-start-end', exts: CODE,
    title: 'Drawer: `placement` is `start`, `end`, `top` or `bottom`; `left` is `start` and `right` is `end`, which follow the reading direction',
    run(src) {
      if (!/\bDrawer\b/.test(src)) return { text: src, count: 0, notes: [] };
      const a = renameValue(src, 'Drawer', 'placement', 'left', 'start');
      const b = renameValue(a.text, 'Drawer', 'placement', 'right', 'end');
      return { text: b.text, count: a.count + b.count, notes: [] };
    },
  },
  {
    version: '19.0.0', id: 'tokens-removed', exts: ALL,
    title: 'Tokens merged or removed: `--field-action` is `--primary-text`, `--rounded` is `--rounded-sm`, `--motion-ripple(-fade)` is `--duration-500` (`-300`), and the `gray`, `neutral` and `stone` ramps are gone',
    run(src) {
      let count = 0;
      let text = src.replace(/(?<![\w-])--rounded(?![\w-])/g, () => { count++; return '--rounded-sm'; })
        .replace(/(?<![\w-])--motion-ripple(-fade)?(?![\w-])/g, (_, fade) => { count++; return fade ? '--duration-300' : '--duration-500'; })
        .replace(/(?<![\w-])--field-action(?![\w-])/g, () => { count++; return '--primary-text'; });
      // the class, in a written class list: class="rounded p-2", className='rounded'
      text = text.replace(/(\bclass(?:Name)?=)(["'])([^"'\n]*)\2/g, (m, attr, q, list) => {
        const next = list.replace(/(?<![\w-])rounded(?![\w-])/g, () => { count++; return 'rounded-sm'; })
          .replace(/(?<![\w-])([a-z-]+)-field-action(?![\w-])/g, (_, kind) => { count++; return kind + '-primary-text'; });
        return attr + q + next + q;
      });
      return { text, count, notes: notesFor(text, /--(gray|neutral|stone)-\d+/g, 'The gray, neutral and stone ramps are removed in 19.0.0: use --zinc-* (the neutral every alias uses) or --slate-* (cooler)') };
    },
  },
  {
    // 19.0.0 folds VirtualList into List, as Table's TableVirtualBody: the List keeps its own props, the rows' go to
    // ListVirtualItems inside it.
    version: '19.0.0', id: 'virtual-list-in-list', exts: ALL,
    title: 'VirtualList is a List with `ListVirtualItems` inside: `<List aria-label variant divided as><ListVirtualItems count renderItem itemKey estimatedItemHeight overscan /></List>`, and `--virtual-list-height` is `--list-virtual-height`',
    run(src, file) {
      if (!/VirtualList|virtual-list/.test(src)) return { text: src, count: 0, notes: [] };
      let count = 0;
      const notes = [];
      let text = src.replace(/(?<![\w-])--virtual-list-height(?![\w-])/g, () => { count++; return '--list-virtual-height'; })
        .replace(/(?<![\w-])--virtual-list-focus-ring(?![\w-])/g, () => { count++; return '--list-focus-ring'; });
      if (CODE.includes((/\.[^./\\]+$/.exec(file)?.[0] || '').toLowerCase())) {
        for (const [s, e] of openTags(text, 'VirtualList').reverse()) {
          const attrs = text.slice(s, e);
          if (!/\/\s*$/.test(attrs) || /\{\s*\.\.\./.test(attrs)) {
            notes.unshift({ line: lineOf(text, s), message: 'VirtualList with spread props or children: make it a <List> (aria-label, variant, divided, as and the rest) with <ListVirtualItems count renderItem itemKey estimatedItemHeight overscan /> inside' });
            continue;
          }
          const body = attrs.replace(/\/\s*$/, ''), mask = topLevel(body);
          const starts = [...mask.matchAll(/(?<=\s)[A-Za-z_$][\w$:.-]*/g)].map((m) => m.index);
          const list = [], rows = [];
          starts.forEach((a, k) => {
            const one = body.slice(a, k + 1 < starts.length ? starts[k + 1] : body.length).trim();
            (/^(count|renderItem|itemKey|estimatedItemHeight|overscan)\b/.test(one) ? rows : list).push(one);
          });
          const open = s - '<VirtualList'.length;
          text = text.slice(0, open) + `<List${list.map((x) => ' ' + x).join('')}><ListVirtualItems${rows.map((x) => ' ' + x).join('')} /></List>` + text.slice(e + 1);
          count++;
        }
        // The import: List and ListVirtualItems in its place, once each, when no VirtualList is left to change by hand.
        const left = (t) => (t.replace(/import\s*(?:type\s*)?\{[^}]*\}\s*from\s*["'][^"']*["']/g, '').match(/\bVirtualList\b/g) || []).length;
        if (!left(text)) text = text.replace(/import\s*\{([^}]*)\}(\s*from\s*["']@diki-stwn\/serupa-ds[^"']*["'])/g, (m, names, from) => {
          const list = names.split(',').map((x) => x.trim()).filter(Boolean);
          if (!list.includes('VirtualList')) return m;
          const next = [];
          for (const n of list.flatMap((x) => (x === 'VirtualList' ? ['List', 'ListVirtualItems'] : [x]))) if (!next.includes(n)) next.push(n);
          count++;
          return `import { ${next.join(', ')} }${from}`;
        });
        notes.push(...notesFor(text, /\bVirtualListProps\b/g, '`VirtualListProps` is gone: the List takes `ListProps`, and ListVirtualItems `ListVirtualItemsProps`'));
        const listed = new Set(notes.map((n) => n.line));
        notes.push(...notesFor(text, /\bVirtualList\b(?!Props)/g, 'VirtualList is removed in 19.0.0: use a <List> with <ListVirtualItems> inside').filter((n) => !listed.has(n.line)));
      }
      notes.push(...notesFor(text, /srp-virtual-list\b|data-component=["']?virtual-list/g, 'a VirtualList is a List now: select [data-component="list"], or .srp-list:has(> .srp-list__spacer) for one with ListVirtualItems inside'));
      return { text, count, notes };
    },
  },
  {
    // 19.0.0 keeps Loader's ring, dots and text. Skeleton took the skeleton variant in 18.x; spokes and pixel draw the ring.
    version: '19.0.0', id: 'loader-ring-dots-text', exts: ALL,
    title: 'Loader is a ring, dots or text: `variant="skeleton"` is `<Skeleton>`, `"spokes"` and `"pixel"` are the ring (their `pattern` and `glow` go), and `--loader-skeleton-*` is `--skeleton-*`',
    run(src, file) {
      if (!/Loader|loader-/.test(src)) return { text: src, count: 0, notes: [] };
      let count = 0;
      const notes = [];
      let text = src.replace(/(?<![\w-])--loader-skeleton-(rect-height|fill|shine|radius|text-radius)(?![\w-])/g, (m, name) => { count++; return '--skeleton-' + name; });
      if (CODE.includes((/\.[^./\\]+$/.exec(file)?.[0] || '').toLowerCase())) {
        for (const [s, e] of openTags(text, 'Loader').reverse()) {
          const attrs = text.slice(s, e), m = attrAt('variant').exec(topLevel(attrs));
          const v = m && /^\s*=\s*\{?\s*(["'])(skeleton|spokes|pixel)\1\s*\}?/.exec(attrs.slice(m.index + 'variant'.length));
          if (!v) continue;
          const open = s - '<Loader'.length;
          let tag = text.slice(open, e);
          tag = removeProp(tag, 'Loader', 'variant').text;
          if (v[2] === 'skeleton') {
            // Skeleton's tone is neutral or inverse; primary and muted, which a skeleton Loader ignored, go.
            if (/\btone\s*=\s*\{?\s*["'](primary|muted)["']/.test(tag)) tag = removeProp(tag, 'Loader', 'tone').text;
            tag = removeProp(removeProp(tag, 'Loader', 'pattern').text, 'Loader', 'glow').text.replace(/^<Loader/, '<Skeleton');
            // Its closing tag, when it has one: the first after it (the tags are taken last first).
            const rest = /\/\s*$/.test(tag) ? text.slice(e) : text.slice(e).replace('</Loader>', '</Skeleton>');
            text = text.slice(0, open) + tag + rest;
          } else {
            for (const p of ['pattern', 'glow']) tag = removeProp(tag, 'Loader', p).text;
            text = text.slice(0, open) + tag + text.slice(e);
          }
          count++;
        }
        // Skeleton in the import beside Loader, and Loader out of it when nothing else names it.
        if (/<Skeleton\b/.test(text)) text = text.replace(/import\s*\{([^}]*)\}(\s*from\s*["']@diki-stwn\/serupa-ds[^"']*["'])/g, (m, names, from) => {
          const list = names.split(',').map((x) => x.trim()).filter(Boolean);
          if (!list.includes('Loader') || list.includes('Skeleton')) return m;
          const others = text.replace(m, '').match(/\bLoader\b/g);
          return `import { ${(others ? list.concat('Skeleton') : list.map((x) => (x === 'Loader' ? 'Skeleton' : x))).join(', ')} }${from}`;
        });
        text = text.replace(/\bLoaderShape\b/g, () => { count++; return 'SkeletonShape'; });
        notes.push(...notesFor(text, /\bLoaderPattern\b/g, '`LoaderPattern` is gone with the pixel variant in 19.0.0'));
      }
      notes.push(...notesFor(text, /(?<![\w-])--loader-(pixel|spokes)-[\w-]+/g, 'the pixel and spokes Loaders are removed in 19.0.0, and their tokens with them: a Loader is a ring, dots or text'));
      return { text, count, notes };
    },
  },
  // 18.0.0 removes the names 17.x deprecated for it: a prop named on… reads as an event handler, empty is emptyText
  // as on Combobox, and a Placement spells the middle top and bottom.
  propsRename('18.0.0', 'surface-not-on-media', '`onMedia` is `surface`, the same values', ['Button', 'IconButton', 'Link', 'Divider', 'CopyButton', 'ToggleButton', 'Fab', 'FabMenu'], [['onMedia', 'surface']]),
  propsRename('18.0.0', 'empty-text', 'TagGroup and NotificationCenter: `empty` is `emptyText`', ['TagGroup', 'NotificationCenter'], [['empty', 'emptyText']], { leftovers: false }),
  {
    version: '18.0.0', id: 'toaster-top-bottom', exts: CODE,
    title: 'Toaster: `placement="top-center"` is `"top"` and `"bottom-center"` is `"bottom"`',
    run(src) {
      if (!/\bToaster\b/.test(src)) return { text: src, count: 0, notes: [] };
      const a = renameValue(src, 'Toaster', 'placement', 'top-center', 'top');
      const b = renameValue(a.text, 'Toaster', 'placement', 'bottom-center', 'bottom');
      return { text: b.text, count: a.count + b.count, notes: [] };
    },
  },
  {
    version: '18.0.0', id: 'placement-types', exts: CODE,
    title: '`ToasterPosition` is `ToasterPlacement` and `FabPosition` is `FabPlacement`, named after the prop they type',
    run(src) {
      let count = 0;
      const text = src.replace(/\b(Toaster|Fab)Position\b/g, (m, c) => { count++; return `${c}Placement`; });
      return { text, count, notes: [] };
    },
  },
  {
    // 18.0.0 splits the brand color by job: `primary` is the fill (the same shade in light and dark, under white
    // text) and `primary-text` is the brand as text, a line or an icon (brand 400 in dark, as `primary` was). Text set
    // straight from `--primary` would be about 3.6:1 on a dark page, so it takes the text token.
    version: '18.0.0', id: 'primary-text', exts: ALL,
    title: 'Brand text is `primary-text`: `color: var(--primary)` and the `text-primary` class take `--primary-text` and `text-primary-text`; `primary` is the fill, the same in light and dark',
    run(src, file) {
      let count = 0;
      // A text color set straight from the token; a fallback inside another var() is a component token's default, left.
      let text = src.replace(/(?<![\w-])((?:color|text-decoration-color|caret-color)\s*:\s*var\(--primary)(-hover)?\)/g, (m, head, hover = '', at, all) => {
        // A class named for the token itself (.text-primary { color: var(--primary) }) says what it sets: left.
        if (/-primary(?:-hover)?(?:::?[\w-]+)*\s*\{[^{}]*$/.test(all.slice(all.lastIndexOf('\n', at) + 1, at))) return m;
        count++; return `${head}-text${hover})`;
      });
      // The utility classes, with their variants (hover:, md:); a name that is a whole code span is prose, left.
      text = text.replace(/(?<![\w$./-])((?:[a-z0-9@[\]-]+:)*(?:text|decoration|caret|placeholder)-primary)(-hover)?(?![\w/-])/g, (m, head, hover = '', at, all) => {
        if (all[at - 1] === '`' && all[at + m.length] === '`') return m;
        if (/\.(?:css|scss|sass|less)$/i.test(file)) return m;
        count++; return `${head}-text${hover}`;
      });
      // A theme of the project's own that sets the fill and not the text: serupa-brand makes both.
      const notes = /--primary-text\s*:/.test(text) ? [] : notesFor(text, /(?<![\w-])--primary\s*:/g, 'this sets `--primary` and not `--primary-text`, so brand text here stays blue: make the theme again with `npx serupa-brand`, or set `--primary-text` and `--primary-text-hover` (what `--primary` and `--primary-hover` were) and give `--primary` the light theme\'s shade in dark too, with `--on-primary: var(--white)`').slice(0, 1);
      return { text, count, notes };
    },
  },
  {
    // Safe to run before upgrading: 19.x has only the old names, and 20.x has both.
    version: '20.0.0', id: 'token-names-thing-first', exts: ALL,
    title: 'Color tokens name the thing first: `--primary` is `--surface-brand`, `--primary-text` `--text-brand`, `--surface-muted` `--surface-sunken`, `--danger-text` `--text-danger`, and 59 more (the CSS variable, `color.<name>` and the utility classes: `bg-primary` is `bg-surface-brand`)',
    run(src) {
      let count = 0;
      const names = Object.keys(TOKENS_20).sort((a, b) => b.length - a.length).join('|');
      // The CSS variable, where it's read and where a theme of the project's own sets it, and a token reference
      // ({color.primary}); a longer name that only ends the same (--my-primary, --button-primary) is left.
      let text = src.replace(new RegExp(`(?<![\\w-])(--|(?<![\\w.])color\\.)(${names})(?![\\w-])`, 'g'), (m, pre, name, at, all) => {
        if (all[at - 1] === '`' && all[at + m.length] === '`') return m;
        count++; return pre + TOKENS_20[name];
      });
      // A utility class, with its variants (hover:, md:) and an opacity (/50), in a class list: class="…", className,
      // or a cn(), clsx() or cx() call on the same line. Elsewhere `text-danger` may be the new token's name.
      text = text.replace(new RegExp(`(?<![\\w$./-])((?:[a-z0-9@[\\]-]+:)*(?:${COLOR_CLASSES})-)(${names})(?![\\w-])`, 'g'), (m, head, name, at, all) => {
        if (!inClasses(all, at)) return m;
        count++; return head + TOKENS_20[name];
      });
      return { text, count, notes: [] };
    },
  },
];

// The brands 17.0.0 moved out of tokens.css, as a page names them: data-brand="violet", data-theme="violet-dark", or
// brand: 'violet' (Serupa.theme.set, useTheme().set).
const OPT_IN_BRANDS = 'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose';
const BRAND_USE = new RegExp(`data-brand\\s*=\\s*\\{?\\s*["'\`](${OPT_IN_BRANDS})["'\`]|data-theme\\s*=\\s*\\{?\\s*["'\`](${OPT_IN_BRANDS})-(?:light|dark)["'\`]|\\bbrand\\s*:\\s*["'\`](${OPT_IN_BRANDS})["'\`]`, 'g');
// A utility class on a palette step, as written in a class list: with its variants (md:, hover:) and an opacity
// (/50), not a custom property (--red-500), and not a gradient stop (from-red-500: 14.0.0's utilities-extra.css).
const RAMPS = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
// The other families 17.0.0 removed (tools/utilities/trimmed.mjs), as written in a class list: words like blur, scale
// and transform are common elsewhere, so these count only inside class="…" (inClassList).
const TRIMMED_17 = /(?<![\w$./-])(?:[a-z0-9@[\]-]+:)*-?(?:(?:from|via|to)(?=-[a-z0-9[(])|blur|brightness|contrast|grayscale|invert|sepia|hue-rotate|saturate|drop-shadow|backdrop-[a-z]+|mix-blend|bg-blend|rotate|skew|scale|perspective|backface|transform|zoom|origin|columns|break-(?:after|before|inside)|text-shadow|inset-shadow|inset-ring|tab|scroll-[mp](?:r|b|l|y|bs|be)(?=-)|(?<=-)scroll-m[a-z]*(?=-)|translate(?=-(?:z-|\d|full|px|3d))|border-(?:[trblxy]|s|e|bs|be)(?=-[a-z]))(?:-[\w./%]+)*(?![\w-])/g;
const PALETTE_CLASS = new RegExp(`(?<![\\w$./-])(?:[a-z0-9@[\\]-]+:)*-?(?!(?:from|via|to)-)[a-z][a-z-]*-(?:${RAMPS})-(?:50|[1-9]00|950)(?:\\/[\\d.]+)?(?![\\w-])`, 'g');

const major = (v) => Number(/^v?(\d+)/.exec(String(v))?.[1]);

/** The changes for a project on `from` (a version, or null for all of them; then a change that alters what code means,
 * rather than a name, only lists where to look). */
export const transformsAfter = (from) => (from == null ? TRANSFORMS.map((t) => (t.withFrom ? { ...t, run: (src, file) => /** @type {(src: string, file: string, listOnly: boolean) => any} */ (t.run)(src, file, true) } : t)) : TRANSFORMS.filter((t) => major(t.version) > major(from)));

/** One file's text through the changes: the new text, the count per change and what to check by hand. */
export function migrate(src, file, transforms = TRANSFORMS) {
  const ext = (/\.[^./\\]+$/.exec(file)?.[0] || '').toLowerCase();
  const counts = {}, notes = [];
  for (const t of transforms) {
    if (!t.exts.includes(ext)) continue;
    const r = t.run(src, file);
    src = r.text;
    if (r.count) counts[t.id] = r.count;
    for (const n of r.notes) notes.push({ ...n, id: t.id });
  }
  return { text: src, counts, notes };
}

