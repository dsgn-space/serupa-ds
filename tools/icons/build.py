"""Custom icons: turns your SVG files into icons that <Icon name="…"> and Button's icon props can use.

usage:  python3 tools/icons/build.py [folder of .svg files]     (default: assets/Icons)
        python3 tools/icons/build.py --check [folder]            exit 1 if the components are out of step
        python3 tools/icons/build.py --project <dir> [folder]    work on another copy of the system

Each file becomes one icon, named after the file: diki-sparkle.svg -> <Icon name="diki-sparkle" />.
The icons are written into components/bundle.js (between the @icons markers) and their names into
components/index.d.ts (CustomIconName). Run it again after adding, changing or removing a file; an
empty or missing folder removes every custom icon.

What a file needs (the same grid as Material Symbols, so they sit together):
  - viewBox="0 0 24 24"
  - one color: every shape is drawn in the text color (currentColor), so the icon follows the theme.
    Parts that should show the background are holes (fill-rule="evenodd" or a cut-out path), not
    white shapes. fill="none" is kept, so outlined (stroke) icons work too; strokes use the text color.
  - only shapes: path, circle, ellipse, rect, line, polyline, polygon, grouped with g.
    No images, text, gradients, masks, clip paths, filters, <use>, styles, scripts or links.
  - a file name in lowercase letters and digits, words joined by - or _ (diki-sparkle, chart_up).

Anything else stops the build with the reason, so nothing unsafe or off-system reaches the bundle.
Ids, classes, styles, sizes and editor metadata (Figma, Illustrator, Sketch) are removed.
"""
import argparse, html, json, os, re, sys
import xml.etree.ElementTree as ET

VIEWBOX = '0 0 24 24'
NAME = re.compile(r'[a-z0-9]+(?:[-_][a-z0-9]+)*')
MAX_BODY = 20000          # characters of SVG markup per icon

SHAPES = {
    'path': {'d'},
    'circle': {'cx', 'cy', 'r'},
    'ellipse': {'cx', 'cy', 'rx', 'ry'},
    'rect': {'x', 'y', 'width', 'height', 'rx', 'ry'},
    'line': {'x1', 'y1', 'x2', 'y2'},
    'polyline': {'points'},
    'polygon': {'points'},
    'g': set(),
}
DROP_ELEMENTS = {'title', 'desc', 'metadata', 'defs'}   # defs: only if empty (checked below)
PAINT = {'fill', 'stroke'}
KEEP = {'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-width',
        'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'transform'}
DROP_ATTRS = {'id', 'class', 'style', 'width', 'height', 'version', 'x', 'y', 'xml:space', 'data-name',
              'enable-background', 'overflow', 'color', 'mask-type'}
NUM = r'[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?'
VALUES = {
    'd': re.compile(r'[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+'),
    'points': re.compile(r'[0-9eE.,\s+-]+'),
    'transform': re.compile(r'(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\(\s*' + NUM + r'(?:[\s,]+' + NUM + r')*\s*\)\s*,?)+'),
    'fill-rule': re.compile(r'nonzero|evenodd'),
    'clip-rule': re.compile(r'nonzero|evenodd'),
    'stroke-linecap': re.compile(r'butt|round|square'),
    'stroke-linejoin': re.compile(r'miter|round|bevel|arcs|miter-clip'),
}
NUMBER = re.compile(NUM + r'(?:px|%)?')


class IconError(Exception):
    pass


def local(tag):
    return tag.rsplit('}', 1)[-1]


def attr_name(k):
    if k.startswith('{'):
        ns, n = k[1:].split('}', 1)
        return ('xlink:' if 'xlink' in ns else 'xml:' if 'XML/1998' in ns else 'ns:') + n
    return k


def clean(svg_text, name='icon'):
    """SVG text -> the icon's inner markup (shapes only, drawn in currentColor). Raises IconError."""
    if not NAME.fullmatch(name):
        raise IconError(f'"{name}": name the file in lowercase letters and digits, words joined by - or _ (e.g. diki-sparkle.svg)')
    if re.search(r'<!DOCTYPE|<!ENTITY', svg_text, re.I):
        raise IconError(f'{name}: remove the DOCTYPE/ENTITY declarations')
    try:
        root = ET.fromstring(svg_text.encode('utf-8'))
    except ET.ParseError as e:
        raise IconError(f'{name}: not valid SVG ({e})')
    if local(root.tag) != 'svg':
        raise IconError(f'{name}: the file must start with <svg>')
    vb = ' '.join(re.split(r'[\s,]+', (root.get('viewBox') or '').strip()))
    if vb != VIEWBOX:
        raise IconError(f'{name}: viewBox is "{vb or "missing"}"; icons are drawn on the 24×24 grid (viewBox="0 0 24 24")')
    colors = set()

    def paint(v, where):
        v = v.strip().lower()
        if v in ('none', 'transparent'):
            return 'none'
        if 'url(' in v:
            raise IconError(f'{name}: {where} uses a gradient or pattern (url(...)); icons are one solid color')
        if v not in ('currentcolor', 'inherit', ''):
            colors.add(v)
            return None   # drawn in the text color (currentColor)

    def attrs(el, tag, allowed):
        out = {}
        for k, v in el.attrib.items():
            k = attr_name(k)
            lk = k.lower()
            if lk.startswith('on'):
                raise IconError(f'{name}: <{tag}> has an event handler ({k}); icons can\'t run scripts')
            if lk in ('href', 'xlink:href') or 'javascript:' in v.lower():
                raise IconError(f'{name}: <{tag}> links to something ({k}); icons must be self-contained shapes')
            if 'url(' in v.lower() and lk not in PAINT:
                raise IconError(f'{name}: <{tag}> {k} refers to a mask, clip path, filter or gradient; flatten it into plain shapes')
            if lk.startswith(('xmlns', 'data-', 'sketch:', 'inkscape:', 'sodipodi:', 'ns:', 'xml:', 'serif:', 'figma')) or lk in DROP_ATTRS and lk not in allowed:
                continue
            if lk == 'style':
                continue
            if lk in PAINT:
                p = paint(v, f'<{tag}> {k}')
                out[lk] = 'none' if p == 'none' else 'currentColor'
                continue
            if lk in ('mask', 'clip-path', 'filter', 'marker-start', 'marker-mid', 'marker-end'):
                raise IconError(f'{name}: <{tag}> uses {k}; flatten it into plain shapes')
            if lk in allowed or lk in KEEP:
                rule = VALUES.get(lk)
                if rule is not None and not rule.fullmatch(v.strip()):
                    raise IconError(f'{name}: <{tag}> {k}="{v[:40]}" isn\'t a value an icon can use')
                if rule is None and lk not in ('transform',) and not NUMBER.fullmatch(v.strip()):
                    raise IconError(f'{name}: <{tag}> {k}="{v[:40]}" should be a number')
                out[lk] = v.strip()
                continue
            # anything else (presentation leftovers such as font-*, letter-spacing) is dropped
        # fill/stroke can also hide in style="" (Illustrator): read them for the color check
        st = el.get('style') or ''
        for m in re.finditer(r'(fill|stroke)\s*:\s*([^;]+)', st, re.I):
            p = paint(m.group(2), f'<{tag}> style {m.group(1)}')
            out.setdefault(m.group(1).lower(), 'none' if p == 'none' else 'currentColor')
        return out

    def walk(el):
        parts = []
        for child in el:
            tag = local(child.tag) if isinstance(child.tag, str) else None
            if tag is None:       # comments, processing instructions
                continue
            if tag in DROP_ELEMENTS:
                if tag == 'defs' and len(child):
                    raise IconError(f'{name}: <defs> holds gradients, masks or symbols; flatten them into plain shapes')
                continue
            if tag not in SHAPES:
                raise IconError(f'{name}: <{tag}> isn\'t allowed; use only path, circle, ellipse, rect, line, polyline, polygon and g')
            if tag != 'g' and len(child):
                raise IconError(f'{name}: <{tag}> has children; only <g> can group shapes')
            a = attrs(child, tag, SHAPES[tag])
            if tag == 'path' and not a.get('d'):
                continue
            inner = walk(child) if tag == 'g' else ''
            if tag == 'g' and not inner:
                continue
            at = ''.join(f' {k}="{html.escape(a[k], quote=True)}"' for k in sorted(a))
            parts.append(f'<{tag}{at}>{inner}</{tag}>' if tag == 'g' else f'<{tag}{at}/>')
        return ''.join(parts)

    ra = attrs(root, 'svg', set())   # paint and stroke settings on <svg> (stroke icons) apply to every shape
    ra.pop('transform', None)
    body = walk(root)
    if not body:
        raise IconError(f'{name}: no shapes found')
    if ra:
        body = '<g' + ''.join(f' {k}="{html.escape(ra[k], quote=True)}"' for k in sorted(ra)) + '>' + body + '</g>'
    if len(colors) > 1:
        raise IconError(f'{name}: uses {len(colors)} colors ({", ".join(sorted(colors))}); icons are one color. '
                        'Make the parts that should show the background holes, not white shapes')
    if len(body) > MAX_BODY:
        raise IconError(f'{name}: {len(body):,} characters of shapes; simplify it (outline strokes, merge paths) to under {MAX_BODY:,}')
    return body


def load(folder):
    """{name: body} for every .svg in the folder, sorted by name. Raises IconError listing every problem."""
    icons, errors = {}, []
    if not folder or not os.path.isdir(folder):
        return icons
    for f in sorted(os.listdir(folder)):
        if not f.lower().endswith('.svg'):
            continue
        name = f[:-4]
        try:
            icons[name] = clean(open(os.path.join(folder, f), encoding='utf-8').read(), name)
        except IconError as e:
            errors.append(str(e))
        except UnicodeDecodeError:
            errors.append(f'{name}: not a UTF-8 text file')
    if errors:
        raise IconError('\n'.join(errors))
    return icons


JS_START, JS_END = '/* @icons:start', '/* @icons:end */'
TS_START, TS_END = '// @icons:start', '// @icons:end'


def js_block(icons):
    data = json.dumps(icons, indent=2, sort_keys=True, ensure_ascii=False).replace('</', '<\\/')
    return (f'{JS_START} generated by tools/icons/build.py from your icon SVGs; edit the SVGs, not this */\n'
            f'  var ICONS = {data};\n  {JS_END}')


def ts_block(icons):
    names = ' | '.join(json.dumps(n) for n in sorted(icons)) or 'never'
    return (f'{TS_START} generated by tools/icons/build.py\n'
            f'/** Names of the custom icons (tools/icons/build.py). Empty (never) until you add some. */\n'
            f'export type CustomIconName = {names};\n{TS_END}')


def replace_block(text, start, end, block, file):
    i, j = text.find(start), text.find(end)
    if i < 0 or j < i:
        raise IconError(f'{file}: the {start} … {end} markers are missing')
    return text[:i] + block + text[j + len(end):]


def read_registry(js):
    """The icons currently in bundle.js."""
    m = re.search(r'var ICONS = (\{.*?\});\s*/\* @icons:end', js, re.S)
    if not m:
        raise IconError('components/bundle.js: no icon registry between the @icons markers')
    return json.loads(m.group(1).replace('<\\/', '</'))


def main():
    ap = argparse.ArgumentParser(description='Build custom icons into the components.')
    ap.add_argument('folder', nargs='?', help='folder of .svg files (default: assets/Icons)')
    ap.add_argument('--project', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ap.add_argument('--check', action='store_true', help="don't write; exit 1 if the components are out of step")
    a = ap.parse_args()
    P = os.path.abspath(a.project)
    folder = a.folder or os.path.join(P, 'assets', 'Icons')
    try:
        icons = load(folder)
        jp, tp = os.path.join(P, 'components', 'bundle.js'), os.path.join(P, 'components', 'index.d.ts')
        js, ts = open(jp, encoding='utf-8').read(), open(tp, encoding='utf-8').read()
        njs = replace_block(js, JS_START, JS_END, js_block(icons), 'components/bundle.js')
        nts = replace_block(ts, TS_START, TS_END, ts_block(icons), 'components/index.d.ts')
    except IconError as e:
        print(f'Icons not built:\n{e}', file=sys.stderr)
        sys.exit(1)
    if a.check:
        ok = njs == js and nts == ts
        print('Custom icons are in step' if ok else 'Custom icons are out of step: run python3 tools/icons/build.py')
        sys.exit(0 if ok else 1)
    if njs != js:
        open(jp, 'w', encoding='utf-8').write(njs)
    if nts != ts:
        open(tp, 'w', encoding='utf-8').write(nts)
    where = os.path.relpath(folder, P) if os.path.isdir(folder) else f'{os.path.relpath(folder, P)} (not found)'
    print(f'{len(icons)} custom icon{"" if len(icons) == 1 else "s"} from {where}: {", ".join(icons) or "none"}')


if __name__ == '__main__':
    main()
