// Custom icons: turns your SVG files into icons that <Icon name="…"> and Button's icon props can use.
//
// usage:  node tools/icons/build.mjs [folder of .svg files]     (default: assets/Icons)
//         node tools/icons/build.mjs --check [folder]            exit 1 if the components are out of step
//         node tools/icons/build.mjs --project <dir> [folder]    work on another copy of the system
//
// Each file becomes one icon, named after the file: serupa-sparkle.svg -> <Icon name="serupa-sparkle" />.
// The icons and their names (CustomIconName) are written into src/icons.ts, between the @icons markers;
// npm run build then puts them in dist/. Run it again after adding, changing or removing a file; an
// empty or missing folder removes every custom icon.
//
// What a file needs (the same grid as Material Symbols, so they sit together):
//   - viewBox="0 0 24 24"
//   - one color: every shape is drawn in the text color (currentColor), so the icon follows the theme.
//     Parts that should show the background are holes (fill-rule="evenodd" or a cut-out path), not
//     white shapes. fill="none" is kept, so outlined (stroke) icons work too; strokes use the text color.
//   - only shapes: path, circle, ellipse, rect, line, polyline, polygon, grouped with g.
//     No images, text, gradients, masks, clip paths, filters, <use>, styles, scripts or links.
//   - a file name in lowercase letters and digits, words joined by - or _ (serupa-sparkle, chart_up).
//
// Anything else stops the build with the reason, so nothing unsafe or off-system reaches the bundle.
// Ids, classes, styles, sizes and editor metadata (Figma, Illustrator, Sketch) are removed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIEWBOX = '0 0 24 24';
const NAME = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const MAX_BODY = 20000;   // characters of SVG markup per icon

const SHAPES = {
  path: ['d'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
  g: [],
};
const DROP_ELEMENTS = ['title', 'desc', 'metadata', 'defs'];   // defs: only if empty (checked below)
const PAINT = ['fill', 'stroke'];
const KEEP = ['fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'transform'];
const DROP_ATTRS = ['id', 'class', 'style', 'width', 'height', 'version', 'x', 'y', 'xml:space', 'data-name',
  'enable-background', 'overflow', 'color', 'mask-type'];
const NUM = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?`;
const whole = (re) => new RegExp(`^(?:${re})$`);
const VALUES = {
  d: whole(String.raw`[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+`),
  points: whole(String.raw`[0-9eE.,\s+-]+`),
  transform: whole(String.raw`(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\(\s*${NUM}(?:[\s,]+${NUM})*\s*\)\s*,?)+`),
  'fill-rule': whole('nonzero|evenodd'),
  'clip-rule': whole('nonzero|evenodd'),
  'stroke-linecap': whole('butt|round|square'),
  'stroke-linejoin': whole('miter|round|bevel|arcs|miter-clip'),
};
const NUMBER = whole(`${NUM}(?:px|%)?`);

export class IconError extends Error {}

// --- A small XML reader: elements, attributes, comments, processing instructions, CDATA and character
// references; enough for SVG exports, and strict where it matters (a malformed file is refused).
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(s, at) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);?/g, (m, e) => {
    if (!m.endsWith(';')) throw new Error(`unterminated entity at ${at}`);
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    if (!(e in ENTITIES)) throw new Error(`undefined entity &${e}; at ${at}`);
    return ENTITIES[e];
  });
}

function parseXml(text) {
  let i = 0;
  const root = { children: [] };
  const stack = [root];
  const scopes = [{ xml: 'http://www.w3.org/XML/1998/namespace' }];
  const fail = (why) => { throw new Error(`${why} (character ${i})`); };
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt < 0) { if (text.slice(i).trim() && stack.length === 1) fail('text outside the root element'); break; }
    if (text.slice(i, lt).trim() && stack.length === 1) fail('text outside the root element');
    i = lt;
    if (text.startsWith('<!--', i)) { const e = text.indexOf('-->', i + 4); if (e < 0) fail('unclosed comment'); i = e + 3; continue; }
    if (text.startsWith('<?', i)) { const e = text.indexOf('?>', i + 2); if (e < 0) fail('unclosed processing instruction'); i = e + 2; continue; }
    if (text.startsWith('<![CDATA[', i)) { const e = text.indexOf(']]>', i + 9); if (e < 0) fail('unclosed CDATA'); i = e + 3; continue; }
    if (text.startsWith('<!', i)) fail('declarations are not allowed');
    if (text[i + 1] === '/') {
      const m = /^<\/([^\s>]+)\s*>/.exec(text.slice(i));
      if (!m) fail('malformed closing tag');
      const el = stack.pop();
      scopes.pop();
      if (!el.raw || el.raw !== m[1]) fail(`mismatched tag </${m[1]}>`);
      i += m[0].length;
      continue;
    }
    const m = /^<([A-Za-z_][\w.:-]*)/.exec(text.slice(i));
    if (!m) fail('malformed tag');
    i += m[0].length;
    const el = { raw: m[1], attrs: [], children: [] };
    const raw = [];
    for (;;) {
      const a = /^\s+([A-Za-z_][\w.:-]*)\s*=\s*("([^"]*)"|'([^']*)')/.exec(text.slice(i));
      if (!a) break;
      if (raw.some(([k]) => k === a[1])) fail(`duplicate attribute ${a[1]}`);
      raw.push([a[1], decode(a[3] ?? a[4], i)]);
      i += a[0].length;
    }
    const end = /^\s*(\/?)>/.exec(text.slice(i));
    if (!end) fail(`malformed tag <${m[1]}>`);
    i += end[0].length;
    const scope = { ...scopes[scopes.length - 1] };
    for (const [k, v] of raw) if (k === 'xmlns') scope[''] = v; else if (k.startsWith('xmlns:')) scope[k.slice(6)] = v;
    // Namespaced names as ElementTree reports them: the prefix resolved to its namespace.
    const resolve = (n, attr) => {
      const c = n.indexOf(':');
      if (c < 0) return { ns: attr ? '' : scope[''] || '', local: n };
      const p = n.slice(0, c);
      if (!(p in scope)) fail(`unbound prefix ${p}`);
      return { ns: scope[p], local: n.slice(c + 1) };
    };
    el.tag = resolve(m[1], false).local;
    for (const [k, v] of raw) {
      if (k === 'xmlns' || k.startsWith('xmlns:')) continue;
      const { ns, local } = resolve(k, true);
      el.attrs.push([ns ? (ns.includes('xlink') ? 'xlink:' : ns.includes('XML/1998') ? 'xml:' : 'ns:') + local : local, v]);
    }
    if (stack.length === 1 && root.children.length) fail('more than one root element');
    stack[stack.length - 1].children.push(el);
    if (!end[1]) { stack.push(el); scopes.push(scope); }
  }
  if (stack.length > 1) fail(`unclosed <${stack[stack.length - 1].raw}>`);
  if (!root.children.length) fail('no element found');
  return root.children[0];
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const attrText = (a) => Object.keys(a).sort().map((k) => ` ${k}="${escapeAttr(a[k])}"`).join('');

/** SVG text -> the icon's inner markup (shapes only, drawn in currentColor). Throws IconError. */
export function clean(svgText, name = 'icon') {
  if (!NAME.test(name)) throw new IconError(`"${name}": name the file in lowercase letters and digits, words joined by - or _ (e.g. serupa-sparkle.svg)`);
  if (/<!DOCTYPE|<!ENTITY/i.test(svgText)) throw new IconError(`${name}: remove the DOCTYPE/ENTITY declarations`);
  let root;
  try { root = parseXml(svgText); } catch (e) { throw new IconError(`${name}: not valid SVG (${e.message})`); }
  if (root.tag !== 'svg') throw new IconError(`${name}: the file must start with <svg>`);
  const vb = ((root.attrs.find(([k]) => k === 'viewBox') || [])[1] || '').trim().split(/[\s,]+/).join(' ');
  if (vb !== VIEWBOX) throw new IconError(`${name}: viewBox is "${vb || 'missing'}"; icons are drawn on the 24×24 grid (viewBox="0 0 24 24")`);
  const colors = new Set();

  const paint = (v, where) => {
    v = v.trim().toLowerCase();
    if (v === 'none' || v === 'transparent') return 'none';
    if (v.includes('url(')) throw new IconError(`${name}: ${where} uses a gradient or pattern (url(...)); icons are one solid color`);
    if (!['currentcolor', 'inherit', ''].includes(v)) colors.add(v);
    return null;   // drawn in the text color (currentColor)
  };

  const attrs = (el, tag, allowed) => {
    const out = {};
    for (const [k, v] of el.attrs) {
      const lk = k.toLowerCase();
      if (lk.startsWith('on')) throw new IconError(`${name}: <${tag}> has an event handler (${k}); icons can't run scripts`);
      if (lk === 'href' || lk === 'xlink:href' || v.toLowerCase().includes('javascript:')) throw new IconError(`${name}: <${tag}> links to something (${k}); icons must be self-contained shapes`);
      if (v.toLowerCase().includes('url(') && !PAINT.includes(lk)) throw new IconError(`${name}: <${tag}> ${k} refers to a mask, clip path, filter or gradient; flatten it into plain shapes`);
      if (/^(xmlns|data-|sketch:|inkscape:|sodipodi:|ns:|xml:|serif:|figma)/.test(lk) || (DROP_ATTRS.includes(lk) && !allowed.includes(lk))) continue;
      if (lk === 'style') continue;
      if (PAINT.includes(lk)) { out[lk] = paint(v, `<${tag}> ${k}`) === 'none' ? 'none' : 'currentColor'; continue; }
      if (['mask', 'clip-path', 'filter', 'marker-start', 'marker-mid', 'marker-end'].includes(lk)) throw new IconError(`${name}: <${tag}> uses ${k}; flatten it into plain shapes`);
      if (allowed.includes(lk) || KEEP.includes(lk)) {
        const rule = VALUES[lk];
        if (rule && !rule.test(v.trim())) throw new IconError(`${name}: <${tag}> ${k}="${v.slice(0, 40)}" isn't a value an icon can use`);
        if (!rule && lk !== 'transform' && !NUMBER.test(v.trim())) throw new IconError(`${name}: <${tag}> ${k}="${v.slice(0, 40)}" should be a number`);
        out[lk] = v.trim();
      }
      // anything else (presentation leftovers such as font-*, letter-spacing) is dropped
    }
    // fill/stroke can also hide in style="" (Illustrator): read them for the color check
    const st = (el.attrs.find(([k]) => k === 'style') || [])[1] || '';
    for (const m of st.matchAll(/(fill|stroke)\s*:\s*([^;]+)/gi)) {
      const k = m[1].toLowerCase();
      const p = paint(m[2], `<${tag}> style ${m[1]}`);
      if (!(k in out)) out[k] = p === 'none' ? 'none' : 'currentColor';
    }
    return out;
  };

  const walk = (el) => {
    let parts = '';
    for (const child of el.children) {
      const tag = child.tag;
      if (DROP_ELEMENTS.includes(tag)) {
        if (tag === 'defs' && child.children.length) throw new IconError(`${name}: <defs> holds gradients, masks or symbols; flatten them into plain shapes`);
        continue;
      }
      if (!(tag in SHAPES)) throw new IconError(`${name}: <${tag}> isn't allowed; use only path, circle, ellipse, rect, line, polyline, polygon and g`);
      if (tag !== 'g' && child.children.length) throw new IconError(`${name}: <${tag}> has children; only <g> can group shapes`);
      const a = attrs(child, tag, SHAPES[tag]);
      if (tag === 'path' && !a.d) continue;
      const inner = tag === 'g' ? walk(child) : '';
      if (tag === 'g' && !inner) continue;
      parts += tag === 'g' ? `<g${attrText(a)}>${inner}</g>` : `<${tag}${attrText(a)}/>`;
    }
    return parts;
  };

  const ra = attrs(root, 'svg', []);   // paint and stroke settings on <svg> (stroke icons) apply to every shape
  delete ra.transform;
  let body = walk(root);
  if (!body) throw new IconError(`${name}: no shapes found`);
  if (Object.keys(ra).length) body = `<g${attrText(ra)}>${body}</g>`;
  if (colors.size > 1) {
    throw new IconError(`${name}: uses ${colors.size} colors (${[...colors].sort().join(', ')}); icons are one color. `
      + 'Make the parts that should show the background holes, not white shapes');
  }
  if (body.length > MAX_BODY) throw new IconError(`${name}: ${body.length.toLocaleString('en')} characters of shapes; simplify it (outline strokes, merge paths) to under ${MAX_BODY.toLocaleString('en')}`);
  return body;
}

/** {name: body} for every .svg in the folder, sorted by name. Throws IconError listing every problem. */
export function load(folder) {
  const icons = {};
  const errors = [];
  if (!folder || !fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) return icons;
  for (const f of fs.readdirSync(folder).sort()) {
    if (!f.toLowerCase().endsWith('.svg')) continue;
    const name = f.slice(0, -4);
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(folder, f))); } catch { errors.push(`${name}: not a UTF-8 text file`); continue; }
    try { icons[name] = clean(text, name); } catch (e) { if (e instanceof IconError) errors.push(e.message); else throw e; }
  }
  if (errors.length) throw new IconError(errors.join('\n'));
  return icons;
}

const JS_START = '/* @icons:start', JS_END = '/* @icons:end */';
const TS_START = '// @icons:start', TS_END = '// @icons:end';
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

export function jsBlock(icons) {
  const data = JSON.stringify(sorted(icons), null, 2).replace(/<\//g, '<\\/');
  return `${JS_START} generated by tools/icons/build.mjs from your icon SVGs; edit the SVGs, not this */\n`
    + `export const ICONS: Record<string, string> = ${data};\n${JS_END}`;
}

export function tsBlock(icons) {
  const list = Object.keys(icons).sort().map((n) => JSON.stringify(n));
  // A literal list, not one computed from ICONS, so a bundler can drop it when nothing uses it.
  return `${TS_START} generated by tools/icons/build.mjs\n`
    + '/** Names of the custom icons (tools/icons/build.mjs). Empty (never) until you add some. */\n'
    + `export type CustomIconName = ${list.join(' | ') || 'never'};\n`
    + '/** Names of your custom icons, sorted. */\n'
    + `export const customIcons: readonly CustomIconName[] = /* @__PURE__ */ Object.freeze([${list.join(', ')}]);\n${TS_END}`;
}

function replaceBlock(text, start, end, block, file) {
  const i = text.indexOf(start), j = text.indexOf(end);
  if (i < 0 || j < i) throw new IconError(`${file}: the ${start} … ${end} markers are missing`);
  return text.slice(0, i) + block + text.slice(j + end.length);
}

/** The icons currently in src/icons.ts. */
export function readRegistry(js) {
  const m = /ICONS(?:: Record<string, string>)? = (\{[\s\S]*?\});\s*\/\* @icons:end/.exec(js);
  if (!m) throw new IconError('src/icons.ts: no icon registry between the @icons markers');
  return JSON.parse(m[1].replace(/<\\\//g, '</'));
}

function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv.splice(i, 2)[1] : null; };
  const check = argv.includes('--check');
  argv = argv.filter((a) => a !== '--check');
  const P = path.resolve(opt('--project') || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'));
  const folder = argv[0] ? path.resolve(argv[0]) : path.join(P, 'assets', 'Icons');
  const jp = path.join(P, 'src', 'icons.ts');
  let icons, js, next;
  try {
    icons = load(folder);
    js = fs.readFileSync(jp, 'utf8');
    next = replaceBlock(js, JS_START, JS_END, jsBlock(icons), 'src/icons.ts');
    next = replaceBlock(next, TS_START, TS_END, tsBlock(icons), 'src/icons.ts');
  } catch (e) {
    if (!(e instanceof IconError)) throw e;
    console.error(`Icons not built:\n${e.message}`);
    process.exit(1);
  }
  if (check) {
    console.log(next === js ? 'Custom icons are in step' : 'Custom icons are out of step: run node tools/icons/build.mjs');
    process.exit(next === js ? 0 : 1);
  }
  if (next !== js) fs.writeFileSync(jp, next);
  const names = Object.keys(icons);
  const where = path.relative(P, folder) + (fs.existsSync(folder) ? '' : ' (not found)');
  console.log(`${names.length} custom icon${names.length === 1 ? '' : 's'} from ${where}: ${names.join(', ') || 'none'} (npm run build puts them in dist/)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
