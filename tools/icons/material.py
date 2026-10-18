"""Material Symbols (Rounded, filled, weight 400) as SVG data, drawn from the icon font.

    python3 tools/icons/material.py           write src/material/icons.ts
    python3 tools/icons/material.py --check   exit 1 if it is out of date

The source is tools/icons/source/MaterialSymbolsRounded-Filled.woff2, the font Serupa shipped up to 5.x, so every
name that worked then still works and every icon looks the same. Each glyph is read at the font's default optical
size (24) on its 960-unit grid and written as one SVG path for viewBox "0 -960 960 960".

src/material/icons.ts  every icon as a named export: `add` is Add, `arrow_forward` ArrowForward, `10k` Icon10k, and the
                       MaterialIconName type. Published as serupa-ds/icons; src/icons.ts loads it on demand so every name works.
src/material/builtin.ts the icons the components draw themselves (every icon name written as a string in src/, outside
                       stories and tests), as data in the main bundle, so they render at once and on the server.

Needs fontTools and brotli (python3 -m pip install fonttools brotli). Run it after a component starts using a new icon.
"""
import glob, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

P = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
FONT = os.path.join(P, 'tools', 'icons', 'source', 'MaterialSymbolsRounded-Filled.woff2')


def export_name(name):
    pascal = ''.join(w[:1].upper() + w[1:] for w in name.split('_'))
    return 'Icon' + pascal if pascal[:1].isdigit() else pascal


def num(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s == '-0' else s


def fmt(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    if s in ('-0', ''):
        s = '0'
    return s.replace('0.', '.', 1) if s.startswith('0.') else s.replace('-0.', '-.', 1)


def compact(d):
    """Absolute path commands (as SVGPathPen writes them) to relative ones with the shortest numbers."""
    out, prev, cx, cy, sx, sy, last = '', '', 0.0, 0.0, 0.0, 0.0, ''
    for cmd, args in re.findall(r'([MLHVQCZ])([^MLHVQCZ]*)', d):
        n = [float(x) for x in re.findall(r'-?\d*\.?\d+', args)]
        if cmd == 'Z':
            out += 'z'; prev, last, cx, cy = 'z', 'z', sx, sy
            continue
        if cmd == 'H':
            rel = [n[-1] - cx]; cx = n[-1]
        elif cmd == 'V':
            rel = [n[-1] - cy]; cy = n[-1]
        else:
            step = {'M': 2, 'L': 2, 'Q': 4, 'C': 6}[cmd]
            rel = []
            for i in range(0, len(n), step):
                for j in range(0, step, 2):
                    rel += [n[i + j] - cx, n[i + j + 1] - cy]
                cx, cy = n[i + step - 2], n[i + step - 1]
            if cmd == 'M':   # a subpath starts at its first point; any further pairs are lines
                sx, sy = n[0], n[1]
        c = cmd.lower()
        if c != last or c == 'm':
            out += c; prev = c
        for v in rel:
            t = fmt(v)
            if not (prev.isalpha() or t.startswith('-') or (t.startswith('.') and '.' in prev)):
                out += ' '
            out += t; prev = t
        last = c
    return out


def paths(font):
    """Every icon name in the font, mapped to its outline as SVG path data."""
    rev = {g: chr(u) for u, g in font.getBestCmap().items()}
    glyphs = font.getGlyphSet()
    # After the ligature (rlig) picks an icon, a single substitution (rclt) swaps some for their filled drawing.
    swap = {}
    for lookup in font['GSUB'].table.LookupList.Lookup:
        for st in lookup.SubTable:
            if st.LookupType == 7:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', None) == 1:
                swap.update(st.mapping)
    out = {}
    for lookup in font['GSUB'].table.LookupList.Lookup:
        for st in lookup.SubTable:
            if st.LookupType == 7:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', None) != 4:
                continue
            for first, ligs in st.ligatures.items():
                for lig in ligs:
                    name = rev.get(first, '?') + ''.join(rev.get(c, '?') for c in lig.Component)
                    if not re.fullmatch(r'[a-z0-9_]+', name):
                        continue
                    pen = SVGPathPen(glyphs, ntos=num)
                    glyphs[swap.get(lig.LigGlyph, lig.LigGlyph)].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))   # font y points up, SVG y down
                    d = compact(pen.getCommands())
                    if d:
                        out[name] = d
    return out



def builtin_names(icons):
    keep = set()
    for f in glob.glob(os.path.join(P, 'src', '**', '*.ts*'), recursive=True):
        if os.sep + 'material' + os.sep in f or re.search(r'\.(stories|test)\.', f):
            continue
        for m in re.finditer(r'''["'`]([a-z][a-z0-9_]{1,40})["'`]''', open(f, encoding='utf-8').read()):
            if m.group(1) in icons:
                keep.add(m.group(1))
    return sorted(keep)


def main():
    icons = paths(TTFont(FONT))
    names = sorted(icons)
    seen = {}
    for n in names:
        e = export_name(n)
        if e in seen:
            sys.exit(f'{n} and {seen[e]} both export {e}')
        seen[e] = n
    head = '/* Generated by tools/icons/material.py from Material Symbols Rounded (Apache 2.0); edit that script, not this. */\n'
    material = head + 'import type { IconData } from "./types";\n\n' + ''.join(
        f'export const {export_name(n)}: IconData = {{ name: "{n}", d: "{icons[n]}" }};\n' for n in names) + (
        '\n/** Every Material Symbol name, for autocomplete. */\nexport type MaterialIconName =\n' + ''.join(f'  | "{n}"\n' for n in names)[:-1] + ';\n')
    builtin = builtin_names(icons)
    builtin_ts = (head + 'import type { IconData } from "./types";\n\n'
                  '/** The icons the components draw themselves, in the main bundle so they render at once and on the server.\n'
                  ' * Every other name loads with the full set (src/material/icons.ts) the first time it is drawn. */\n'
                  'export const BUILTIN_ICONS: readonly IconData[] = [\n' + ''.join(f'  {{ name: "{n}", d: "{icons[n]}" }},\n' for n in builtin) + '];\n')
    out = {'src/material/icons.ts': material, 'src/material/builtin.ts': builtin_ts}
    if '--check' in sys.argv:
        stale = [f for f, s in out.items() if not os.path.exists(os.path.join(P, f)) or open(os.path.join(P, f)).read() != s]
        if stale:
            sys.exit('Out of date: ' + ', '.join(stale) + '. Run python3 tools/icons/material.py')
        print(f'Material icons are up to date ({len(names)} icons, {len(builtin)} built in)')
        return
    os.makedirs(os.path.join(P, 'src', 'material'), exist_ok=True)
    for f, s in out.items():
        open(os.path.join(P, f), 'w').write(s)
    print(f'Wrote src/material/icons.ts ({len(names)} icons, {os.path.getsize(os.path.join(P, "src/material/icons.ts")) // 1024} KB) '
          f'and src/material/builtin.ts ({len(builtin)} built in)')


if __name__ == '__main__':
    main()
