"""Export tokens.json in the W3C Design Tokens format (DTCG 2025.10), for design tools and token pipelines.

usage:  python3 tools/tokens/export.py            write design-tokens/
        python3 tools/tokens/export.py --check    exit 1 if design-tokens/ is out of date with tokens.json

Writes
  design-tokens/diki.tokens.json            palette and every scale (the theme-independent tokens)
  design-tokens/themes/<theme>.tokens.json  the 33 alias colors for one theme, as references into the palette
                                            ("{color.blue-600}"); layer one theme file over diki.tokens.json
  design-tokens/components/<name>.tokens.json  component tokens (Button's --button-*), referencing the tokens above
  design-tokens/css-values.json             tokens the format has no type for yet (degrees, em, %, viewport
                                            units, keywords, CSS shorthands), as plain CSS values

Token paths are "<group>.<token name>", e.g. color.blue-600, spacing.spacing-4. The format doesn't allow "."
in a name, so "spacing-0.5" becomes "spacing-0_5"; $extensions["com.diki"].cssVar always gives the CSS variable.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(P, 'design-tokens')
t = json.load(open(os.path.join(P, 'tokens.json'), encoding='utf-8'))
first = lambda v: next(iter(v.values())) if isinstance(v, dict) else v
GROUPS = {k: v for k, v in t.items() if isinstance(v, dict) and isinstance(v.get('tokens'), list)}
ALIAS = [x for x in GROUPS['color']['tokens'] if isinstance(x['value'], dict) and len(x['value']) > 1]
THEMES = list(ALIAS[0]['value'].keys())

def hexcolor(h):
    h = h.lstrip('#')
    if len(h) in (3, 4): h = ''.join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1
    v = {'colorSpace': 'srgb', 'components': [round(c / 255, 4) for c in rgb], 'hex': '#' + h[:6].lower()}
    if a != 1: v['alpha'] = round(a, 3)
    return v
def rgbfn(s):   # rgb(0 0 0 / 0.05)
    m = re.fullmatch(r'rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)', s.strip())
    r, g, b = (float(m.group(i)) for i in (1, 2, 3)); a = m.group(4)
    a = 1 if a is None else (float(a[:-1]) / 100 if a.endswith('%') else float(a))
    v = {'colorSpace': 'srgb', 'components': [round(r / 255, 4), round(g / 255, 4), round(b / 255, 4)], 'hex': '#%02x%02x%02x' % (int(r), int(g), int(b))}
    if a != 1: v['alpha'] = round(a, 3)
    return v
def color(s):
    s = s.strip()
    return hexcolor(s) if s.startswith('#') else rgbfn(s)
def dim(s):
    m = re.fullmatch(r'(-?\d*\.?\d+)(px|rem)', s.strip())
    return {'value': float(m.group(1)) if '.' in m.group(1) else int(m.group(1)), 'unit': m.group(2)} if m else None
def shadow(s):
    layers = []
    for part in re.split(r',(?![^()]*\))', s):
        part = part.strip(); inset = part.startswith('inset ')
        if inset: part = part[6:]
        cm = re.search(r'(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})$', part)
        if not cm: return None
        nums = part[:cm.start()].split()
        if not 2 <= len(nums) <= 4: return None
        nums = [n if n.endswith(('px', 'rem')) else n + 'px' for n in nums] + ['0px'] * (4 - len(nums))
        L = {'color': color(cm.group(1)), 'offsetX': dim(nums[0]), 'offsetY': dim(nums[1]), 'blur': dim(nums[2]), 'spread': dim(nums[3])}
        if inset: L['inset'] = True
        layers.append(L)
    return layers[0] if len(layers) == 1 else layers

def typed(group, name, v):
    """(type, value) in the format, or None when it has no type for this value yet."""
    v = str(v).strip()
    if group == 'color': return ('color', color(v)) if v.startswith(('#', 'rgb')) else None
    if name.startswith('text-shadow'): return None   # CSS text-shadow has no spread; the format's shadow type always has one
    if group == 'shadow' or name.startswith('drop-shadow-'):
        s = shadow(v) if v != 'none' else None
        return ('shadow', s) if s else None
    if group == 'transitions':
        m = re.fullmatch(r'(\d+)ms', v)
        if m: return ('duration', {'value': int(m.group(1)), 'unit': 'ms'})
        m = re.fullmatch(r'cubic-bezier\(([^)]*)\)', v)
        if m: return ('cubicBezier', [float(x) for x in m.group(1).split(',')])
        if v == 'linear': return ('cubicBezier', [0, 0, 1, 1])
        return None
    if re.fullmatch(r'font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)', name) and re.fullmatch(r'\d+', v):
        return ('fontWeight', int(v))
    d = dim(v)
    if d: return ('dimension', d)
    if re.fullmatch(r'-?\d*\.?\d+', v): return ('number', float(v) if '.' in v else int(v))
    if re.fullmatch(r'-?\d*\.?\d+%', v) and (group in ('opacity', 'filters', 'transforms')):   # opacity, brightness, scale… as ratios
        return ('number', round(float(v[:-1]) / 100, 6))
    return None

def path_name(n): return n.replace('.', '_')
def ext(name): return {'com.diki': {'cssVar': '--' + name}}

base, css_only = {}, {}
for g, grp in GROUPS.items():
    for x in grp['tokens']:
        if g == 'color' and x in ALIAS: continue
        v = first(x['value']); r = typed(g, x['name'], v)
        if not r:
            css_only.setdefault(g, {})[x['name']] = {'css': str(v), 'description': re.sub(r'^Tailwind ', '', x.get('usage', ''))}
            continue
        tok = {'$type': r[0], '$value': r[1]}
        if x.get('usage'): tok['$description'] = x['usage']
        tok['$extensions'] = ext(x['name'])
        base.setdefault(g, {})[path_name(x['name'])] = tok
# font families
base['font'] = {k: {'$type': 'fontFamily', '$value': [f.strip().strip('"\'') for f in re.split(r',(?![^"]*")', v)], '$extensions': ext('font-' + k)} for k, v in t['type']['families'].items()}
# type styles as typography composites
for grp in t['type']['groups']:
    for s in grp['styles']:
        fs = dim(s['fontSize']); lh = s['lineHeight']
        lhd = dim(lh)
        ratio = round(lhd['value'] / fs['value'], 4) if lhd and lhd['unit'] == fs['unit'] else float(lh)
        fam = s.get('family') or grp.get('family') or 'sans'
        ls = str(s.get('letterSpacing', '0'))
        base.setdefault('type', {})[path_name(s['name'])] = {
            '$type': 'typography',
            '$value': {'fontFamily': '{font.%s}' % fam, 'fontSize': fs, 'fontWeight': int(s.get('fontWeight', 400)),
                       'letterSpacing': dim(ls) or {'value': 0, 'unit': 'px'}, 'lineHeight': ratio},
            '$description': s.get('usage', ''), '$extensions': {'com.diki': {'class': s['name']}}}

def ref(v):
    m = re.fullmatch(r'\{(.+)\}', v)
    return '{color.%s}' % path_name(m.group(1)) if m else color(v)
themes = {}
for th in THEMES:
    themes[th] = {'color': {path_name(x['name']): {'$type': 'color', '$value': ref(x['value'][th]), '$description': x.get('usage', ''), '$extensions': ext(x['name'])} for x in ALIAS}}

files = {'diki.tokens.json': base, 'css-values.json': {'$description': 'Tokens the W3C Design Tokens format (2025.10) has no type for yet: degrees, em, percentages of a box, viewport units, keywords, CSS shorthands, and text shadows (the shadow type in the format always has a spread, which CSS text-shadow does not allow). Use the CSS value as-is.', **css_only}}
for th, d in themes.items(): files[f'themes/{th}.tokens.json'] = d
# component tokens (src/components/<Name>/<name>.tokens.json) are already in the format: published as they are
import glob
for f in sorted(glob.glob(os.path.join(P, 'src', 'components', '*', '*.tokens.json'))):
    files['components/' + os.path.basename(f)] = json.load(open(f, encoding='utf-8'))
dump = lambda d: json.dumps(d, indent=2, ensure_ascii=False) + '\n'

if '--check' in sys.argv:
    stale = [f for f, d in files.items() if not os.path.exists(os.path.join(OUT, f)) or open(os.path.join(OUT, f), encoding='utf-8').read() != dump(d)]
    if stale: print('design-tokens/ is out of date: run python3 tools/tokens/export.py (' + ', '.join(stale) + ')'); sys.exit(1)
    print('design-tokens/ matches tokens.json'); sys.exit(0)
for f, d in files.items():
    os.makedirs(os.path.dirname(os.path.join(OUT, f)), exist_ok=True)
    open(os.path.join(OUT, f), 'w', encoding='utf-8').write(dump(d))
n_typed = sum(len(v) for v in base.values()); n_css = sum(len(v) for k, v in css_only.items())
print(f'design-tokens/: {n_typed} typed tokens, {len(ALIAS)} aliases × {len(THEMES)} themes, {n_css} CSS-only values')
