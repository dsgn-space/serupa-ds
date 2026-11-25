// Tokens for native apps (138): the colors, spacing, radii, border widths, sizes, font sizes, opacities and durations
// of design-tokens/, as Swift, Kotlin and Android resources. npm run build writes them into dist/native/:
//   ios/SerupaTokens.swift                  SwiftUI: SerupaTokens (sizes in points, durations in seconds),
//                                           SerupaPalette (every palette color) and SerupaColors (the alias colors,
//                                           one value per theme: SerupaColors.blueLight.primary)
//   android/SerupaTokens.kt                 Jetpack Compose: the same three, in dp, sp and milliseconds
//                                           (SerupaColors.BlueLight.primary)
//   android/res/values/serupa_tokens.xml    the palette, the sizes (dp, font sizes sp), durations (integers, ms) and
//                                           opacities (float dimens)
//   android/res-<brand>/values/serupa_colors.xml, values-night/   the alias colors of a brand, light and dark: add
//                                           the brand's folder as a resource directory, and night mode picks the dark
// Swift and Kotlin also carry the easings (SerupaEasing), the drop shadows (SerupaShadow, layer by layer) and the type
// styles (SerupaTypeStyle in Swift, SerupaType's TextStyles in Kotlin). A rem is 16 points (dp). Inset shadows and
// values the formats have no type for aren't included.
// The release also attaches the files as archives, with an Xcode asset catalog the package leaves out (some 1,700
// small files): SerupaColors.xcassets, a folder per brand whose colors hold the light and the dark value, so iOS picks
// by the appearance (assetCatalog below, tools/release-kits.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { loadThemes } from '../tokens/themeFiles.mjs';

const NS = 'com.serupa';
const GROUPS = { spacing: 'size', radius: 'size', borders: 'size', sizing: 'size', fontSize: 'font', opacity: 'ratio', transitions: 'time' };

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
function* walk(tree, p = []) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$') || !isObj(v)) continue;
    if ('$value' in v) yield [[...p, k], v];
    else yield* walk(v, [...p, k]);
  }
}
const cssName = (tok, p) => (tok.$extensions?.[NS]?.cssVar || '--' + p.join('-')).slice(2);
/** blue-600 → blue600, spacing-0.5 → spacing0_5, rounded-2xl → rounded2xl */
export const camel = (n) => n.replace(/\./g, '_').replace(/-+([a-z0-9])/g, (_, c) => c.toUpperCase());
const pascal = (n) => camel(n).replace(/^./, (c) => c.toUpperCase());
const snake = (n) => 'serupa_' + n.replace(/[.-]+/g, '_');
const num = (n) => String(Number(n.toFixed(4)));
const doc = (s) => (s ? String(s).replace(/\s+/g, ' ').replace(/\*\//g, '* /').trim() : '');

/** Every token the native files carry, resolved: { name, kind, value, description } (kind: color, size, font, ratio, time). */
export function nativeTokens(dir) {
  const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const base = load('serupa.tokens.json');
  const themes = loadThemes(dir);
  const index = new Map([...walk(base)].map(([p, t]) => [p.join('.'), t]));
  const resolve = (v, more = new Map()) => {
    for (let i = 0; typeof v === 'string' && /^\{.+\}$/.test(v) && i < 10; i++) { const k = v.slice(1, -1); v = (more.get(k) || index.get(k))?.$value; }
    return v;
  };
  const value = (tok, more) => {
    const v = resolve(tok.$value, more);
    if (tok.$type === 'color' && isObj(v)) return { r: v.components[0], g: v.components[1], b: v.components[2], a: v.alpha ?? 1, hex: v.hex };
    if (tok.$type === 'dimension' && isObj(v)) return v.unit === 'rem' ? v.value * 16 : v.value;
    if (tok.$type === 'duration' && isObj(v)) return v.unit === 's' ? v.value * 1000 : v.value;
    if (tok.$type === 'number' && typeof v === 'number') return v;
    return null;
  };
  const palette = [], scalar = [];
  for (const [p, tok] of walk(base)) {
    if (p[0] === 'color' && tok.$type === 'color') {
      const v = value(tok);
      if (v) palette.push({ name: cssName(tok, p), kind: 'color', value: v, description: doc(tok.$description) });
      continue;
    }
    const kind = GROUPS[p[0]];
    if (!kind) continue;
    const want = { size: 'dimension', font: 'dimension', ratio: 'number', time: 'duration' }[kind];
    if (tok.$type !== want) continue;
    const v = value(tok);
    if (v != null) scalar.push({ name: cssName(tok, p), kind, value: v, description: doc(tok.$description) });
  }
  // The easings, the drop shadows (inset ones have no native counterpart) and the type styles.
  const easings = [], shadows = [], types = [];
  const px = (d) => (isObj(d) ? (d.unit === 'rem' ? d.value * 16 : d.value) : 0);
  const fonts = Object.fromEntries(Object.entries(base.font || {}).filter(([k]) => !k.startsWith('$')).map(([k, t]) => [k, String(t.$value[0]).split(',')[0].replace(/"/g, '').trim()]));
  for (const [p, tok] of walk(base)) {
    const name = cssName(tok, p), description = doc(tok.$description);
    if (tok.$type === 'cubicBezier' && Array.isArray(tok.$value)) easings.push({ name, value: tok.$value, description });
    else if (tok.$type === 'shadow' && p[0] === 'shadow' && !/^inset-/.test(p[1])) {
      const v = resolve(tok.$value);
      const layers = (Array.isArray(v) ? v : [v]).map((l) => ({ color: { r: l.color.components[0], g: l.color.components[1], b: l.color.components[2], a: l.color.alpha ?? 1, hex: l.color.hex }, x: px(l.offsetX), y: px(l.offsetY), blur: px(l.blur), spread: px(l.spread) }));
      shadows.push({ name, value: layers, description });
    } else if (tok.$type === 'typography' && isObj(tok.$value)) {
      const v = tok.$value, size = px(v.fontSize);
      const family = fonts[String(v.fontFamily).replace(/^\{font\.|\}$/g, '')] || 'Inter';
      types.push({ name: tok.$extensions?.[NS]?.class || p.at(-1), value: { family, size, lineHeight: +(size * v.lineHeight).toFixed(2), weight: v.fontWeight, tracking: px(v.letterSpacing) }, description });
    }
  }
  const aliases = {};
  // A theme sets the alias colors only.
  for (const [th, { color }] of Object.entries(themes)) {
    const tree = { color };
    const own = new Map([...walk(tree)].map(([p, t]) => [p.join('.'), t]));
    aliases[th] = [...walk(tree)].map(([p, tok]) => ({ name: cssName(tok, p), kind: 'color', value: value(tok, own), description: doc(tok.$description) })).filter((x) => x.value);
  }
  return { palette, scalar, aliases, easings, shadows, types };
}

const hex8 = (c) => {
  const a = Math.round(c.a * 255).toString(16).padStart(2, '0');
  return (a + c.hex.slice(1)).toUpperCase();
};
const swiftColor = (c) => `Color(.sRGB, red: ${num(c.r)}, green: ${num(c.g)}, blue: ${num(c.b)}, opacity: ${num(c.a)})`;
const swiftValue = (x) => (x.kind === 'time' ? `TimeInterval = ${num(x.value / 1000)}` : x.kind === 'ratio' ? `Double = ${num(x.value)}` : `CGFloat = ${num(x.value)}`);
const ktValue = (x) => (x.kind === 'time' ? `${Math.round(x.value)}L` : x.kind === 'ratio' ? `${num(x.value)}f` : `${num(x.value)}.${x.kind === 'font' ? 'sp' : 'dp'}`);
const line = (indent, x, body) => `${x.description ? `${indent}/** ${x.description} */\n` : ''}${indent}${body}\n`;

/** The files of dist/native/, by their path in it. */
export function nativeFiles(dir, version) {
  const { palette, scalar, aliases, easings, shadows, types } = nativeTokens(dir);
  const themes = Object.keys(aliases);
  const head = (c) => `${c} Serupa ${version}: design tokens for native apps, generated from design-tokens/ (tools/build/native-tokens.mjs). Don't edit.\n`;
  const names = aliases[themes[0]].map((x) => x.name);
  const files = {};

  let swift = head('//') + '\nimport SwiftUI\n\n/// Sizes in points (a rem is 16), durations in seconds, opacities from 0 to 1.\npublic enum SerupaTokens {\n';
  for (const x of scalar) swift += line('    ', x, `public static let ${camel(x.name)}: ${swiftValue(x)}`);
  swift += '}\n\n/// Every color of the palette, the same in every theme.\npublic enum SerupaPalette {\n';
  for (const x of palette) swift += line('    ', x, `public static let ${camel(x.name)} = ${swiftColor(x.value)}`);
  swift += `}\n\n/// The alias colors, one set per theme: SerupaColors.${camel(themes[0])}.primary.\npublic struct SerupaColors {\n`;
  for (const x of aliases[themes[0]]) swift += line('    ', x, `public let ${camel(x.name)}: Color`);
  for (const th of themes) {
    swift += `\n    public static let ${camel(th)} = SerupaColors(\n`;
    swift += aliases[th].map((x) => `        ${camel(x.name)}: ${swiftColor(x.value)}`).join(',\n') + '\n    )\n';
  }
  swift += '}\n';
  swift += `\n/// The alias colors from SerupaColors.xcassets (in the release's native archive), a brand's light and dark in one\n/// color, so the system picks by the appearance: SerupaAssetColors(brand: "${themes[0].split('-')[0]}").primary.\npublic struct SerupaAssetColors {\n    public let brand: String\n    public let bundle: Bundle?\n    public init(brand: String, bundle: Bundle? = nil) { self.brand = brand; self.bundle = bundle }\n`;
  for (const x of aliases[themes[0]]) swift += line('    ', x, `public var ${camel(x.name)}: Color { Color("\\(brand)/${x.name}", bundle: bundle) }`);
  swift += '}\n';
  swift += '\n/// An easing curve, CSS\'s cubic-bezier(): .animation(SerupaEasing.easeEnter.animation(duration: SerupaTokens.duration150)).\npublic struct SerupaEasing {\n    public let x1: Double, y1: Double, x2: Double, y2: Double\n    public func animation(duration: TimeInterval) -> Animation { .timingCurve(x1, y1, x2, y2, duration: duration) }\n\n';
  for (const x of easings) swift += line('    ', x, `public static let ${camel(x.name)} = SerupaEasing(x1: ${x.value.map(num).map((v, i) => `${['', 'y1: ', 'x2: ', 'y2: '][i]}${v}`).join(', ')})`);
  swift += '}\n';
  swift += '\n/// A drop shadow, layer by layer as CSS draws it, in points: view.serupaShadow(SerupaShadow.elevationRaised). SwiftUI\'s\n/// radius is half the CSS blur; it has no spread, so a layer\'s spread is kept for drawing it yourself.\npublic struct SerupaShadow {\n    public struct Layer {\n        public let color: Color\n        public let x: CGFloat, y: CGFloat, blur: CGFloat, spread: CGFloat\n        public var radius: CGFloat { blur / 2 }\n    }\n    public let layers: [Layer]\n\n';
  for (const x of shadows) swift += line('    ', x, `public static let ${camel(x.name)} = SerupaShadow(layers: [${x.value.map((l) => `Layer(color: ${swiftColor(l.color)}, x: ${num(l.x)}, y: ${num(l.y)}, blur: ${num(l.blur)}, spread: ${num(l.spread)})`).join(', ')}])`);
  swift += '}\n\npublic extension View {\n    /// Draws each layer of a Serupa shadow, the first on top.\n    func serupaShadow(_ shadow: SerupaShadow) -> some View {\n        shadow.layers.reversed().reduce(AnyView(self)) { view, l in AnyView(view.shadow(color: l.color, radius: l.radius, x: l.x, y: l.y)) }\n    }\n}\n';
  const WEIGHT = { 100: 'ultraLight', 200: 'thin', 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'heavy', 900: 'black' };
  swift += '\n/// A type style in points: the family (add the font to the app, or the system font stands in), size, line height\n/// (the whole line, as CSS sets it), weight and tracking. Text(…).font(SerupaTypeStyle.typeHeading1.font).\npublic struct SerupaTypeStyle {\n    public let family: String\n    public let size: CGFloat, lineHeight: CGFloat\n    public let weight: Font.Weight\n    public let tracking: CGFloat\n    public var font: Font { .custom(family, size: size).weight(weight) }\n    /// The space between lines that makes up the line height with the font\'s own (about 1.2 times its size).\n    public var lineSpacing: CGFloat { max(0, lineHeight - size * 1.2) }\n\n';
  for (const x of types) swift += line('    ', x, `public static let ${camel(x.name)} = SerupaTypeStyle(family: "${x.value.family}", size: ${num(x.value.size)}, lineHeight: ${num(x.value.lineHeight)}, weight: .${WEIGHT[x.value.weight] || 'regular'}, tracking: ${num(x.value.tracking)})`);
  files['ios/SerupaTokens.swift'] = swift + '}\n';

  let kt = head('//') + '\npackage com.serupa.tokens\n\nimport androidx.compose.animation.core.CubicBezierEasing\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.text.TextStyle\nimport androidx.compose.ui.text.font.FontWeight\nimport androidx.compose.ui.unit.Dp\nimport androidx.compose.ui.unit.dp\nimport androidx.compose.ui.unit.sp\n\n';
  kt += '/** Sizes in dp (a rem is 16), font sizes in sp, durations in milliseconds, opacities from 0 to 1. */\nobject SerupaTokens {\n';
  for (const x of scalar) kt += line('    ', x, `${x.kind === 'time' || x.kind === 'ratio' ? 'const val' : 'val'} ${camel(x.name)} = ${ktValue(x)}`);
  kt += '}\n\n/** Every color of the palette, the same in every theme. */\nobject SerupaPalette {\n';
  for (const x of palette) kt += line('    ', x, `val ${camel(x.name)} = Color(0x${hex8(x.value)})`);
  kt += `}\n\n/** The alias colors, one set per theme: SerupaColors.${pascal(themes[0])}.primary. */\ndata class SerupaColors(\n`;
  kt += aliases[themes[0]].map((x) => line('    ', x, `val ${camel(x.name)}: Color,`)).join('') + ') {\n    companion object {\n';
  for (const th of themes) {
    kt += `        val ${pascal(th)} = SerupaColors(\n`;
    kt += aliases[th].map((x) => `            ${camel(x.name)} = Color(0x${hex8(x.value)}),`).join('\n') + '\n        )\n';
  }
  kt += '    }\n}\n';
  kt += '\n/** The easings, CSS\'s cubic-bezier(): tween(SerupaTokens.duration150.toInt(), easing = SerupaEasing.easeEnter). */\nobject SerupaEasing {\n';
  for (const x of easings) kt += line('    ', x, `val ${camel(x.name)} = CubicBezierEasing(${x.value.map((v) => `${num(v)}f`).join(', ')})`);
  kt += '}\n\n/** One layer of a drop shadow, as CSS draws it, in dp. */\ndata class SerupaShadowLayer(val color: Color, val x: Dp, val y: Dp, val blur: Dp, val spread: Dp)\n\n/** The drop shadows, layer by layer, the first on top: Modifier.dropShadow(…) for each layer. */\nobject SerupaShadows {\n';
  for (const x of shadows) kt += line('    ', x, `val ${camel(x.name)} = listOf(${x.value.map((l) => `SerupaShadowLayer(Color(0x${hex8(l.color)}), ${num(l.x)}.dp, ${num(l.y)}.dp, ${num(l.blur)}.dp, ${num(l.spread)}.dp)`).join(', ')})`);
  kt += '}\n\n/** The type styles, in sp, without a font family: add the app\'s with .copy(fontFamily = …) (the web uses Inter). */\nobject SerupaType {\n';
  for (const x of types) kt += line('    ', x, `val ${camel(x.name)} = TextStyle(fontSize = ${num(x.value.size)}.sp, lineHeight = ${num(x.value.lineHeight)}.sp, fontWeight = FontWeight(${x.value.weight}), letterSpacing = ${num(x.value.tracking)}.sp)`);
  files['android/SerupaTokens.kt'] = kt + '}\n';

  const xml = (body) => `<?xml version="1.0" encoding="utf-8"?>\n${head('<!--').replace(/\n$/, ' -->\n')}<resources>\n${body}</resources>\n`;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/--/g, '- -');
  const xcolor = (x) => `    <color name="${snake(x.name)}">#${hex8(x.value)}</color>${x.description ? ` <!-- ${esc(x.description)} -->` : ''}\n`;
  let res = '';
  for (const x of palette) res += xcolor(x);
  for (const x of scalar) {
    const c = x.description ? ` <!-- ${esc(x.description)} -->` : '';
    if (x.kind === 'size' || x.kind === 'font') res += `    <dimen name="${snake(x.name)}">${num(x.value)}${x.kind === 'font' ? 'sp' : 'dp'}</dimen>${c}\n`;
    else if (x.kind === 'time') res += `    <integer name="${snake(x.name)}">${Math.round(x.value)}</integer>${c}\n`;
    else res += `    <item name="${snake(x.name)}" format="float" type="dimen">${num(x.value)}</item>${c}\n`;
  }
  files['android/res/values/serupa_tokens.xml'] = xml(res);
  for (const th of themes) {
    const [brand, mode] = th.split('-');
    if (aliases[th].map((x) => x.name).join() !== names.join()) throw new Error(`${th} has other alias colors than ${themes[0]}`);
    files[`android/res-${brand}/values${mode === 'dark' ? '-night' : ''}/serupa_colors.xml`] = xml(aliases[th].map(xcolor).join(''));
  }
  return files;
}

/** An Xcode asset catalog of the alias colors, by its path: SerupaColors.xcassets/<brand>/<name>.colorset/Contents.json,
 * each with the brand's light value and its dark one for the dark appearance. The brand folders are namespaces, so a
 * color is Color("blue/primary") (SerupaAssetColors in SerupaTokens.swift). Not in the package: the release attaches it. */
export function assetCatalog(dir) {
  const { aliases } = nativeTokens(dir);
  const info = { author: 'xcode', version: 1 };
  const json = (o) => JSON.stringify(o, null, 2) + '\n';
  const comp = (c) => ({ 'color-space': 'srgb', components: { red: c.r.toFixed(3), green: c.g.toFixed(3), blue: c.b.toFixed(3), alpha: c.a.toFixed(3) } });
  const files = { 'SerupaColors.xcassets/Contents.json': json({ info }) };
  const brands = [...new Set(Object.keys(aliases).map((th) => th.split('-')[0]))];
  for (const b of brands) {
    const light = aliases[`${b}-light`], dark = new Map(aliases[`${b}-dark`].map((x) => [x.name, x.value]));
    files[`SerupaColors.xcassets/${b}/Contents.json`] = json({ info, properties: { 'provides-namespace': true } });
    for (const x of light) {
      files[`SerupaColors.xcassets/${b}/${x.name}.colorset/Contents.json`] = json({ colors: [
        { color: comp(x.value), idiom: 'universal' },
        { appearances: [{ appearance: 'luminosity', value: 'dark' }], color: comp(dark.get(x.name)), idiom: 'universal' },
      ], info });
    }
  }
  return files;
}
