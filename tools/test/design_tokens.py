"""Checks design-tokens/ (the W3C Design Tokens export): in step with tokens.json, valid against the format
(DTCG 2025.10), every reference resolves, and every token in tokens.json is exported somewhere.

usage: python3 tools/test/design_tokens.py [project dir]
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..'))
D = os.path.join(P, 'design-tokens')
R = []
def check(name, ok, detail=''): R.append((name, ok, detail))

r = subprocess.run([sys.executable, '-I', os.path.join(HERE, '..', 'tokens', 'export.py'), '--check'], capture_output=True, text=True, cwd=P)
check('design-tokens/ is in step with tokens.json', r.returncode == 0, r.stdout.strip())
if r.returncode != 0 and not os.path.exists(os.path.join(D, 'diki.tokens.json')):
    for n, ok, d in R: print(f'{"PASS" if ok else "FAIL"}  {n}' + ('' if ok else f'\n      {d}'))
    sys.exit(1)

base = json.load(open(os.path.join(D, 'diki.tokens.json'), encoding='utf-8'))
themes = {f[:-len('.tokens.json')]: json.load(open(os.path.join(D, 'themes', f), encoding='utf-8')) for f in sorted(os.listdir(os.path.join(D, 'themes')))}
css_only = json.load(open(os.path.join(D, 'css-values.json'), encoding='utf-8'))

TYPES = {'color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography'}
def tokens(tree, path=()):
    for k, v in tree.items():
        if k.startswith('$'): continue
        if isinstance(v, dict) and '$value' in v: yield path + (k,), v
        elif isinstance(v, dict): yield from tokens(v, path + (k,))

def is_ref(v): return isinstance(v, str) and re.fullmatch(r'\{[^{}]+\}', v)
def ok_color(v): return is_ref(v) or (isinstance(v, dict) and v.get('colorSpace') == 'srgb' and isinstance(v.get('components'), list) and len(v['components']) == 3 and all(0 <= c <= 1 for c in v['components']) and 0 <= v.get('alpha', 1) <= 1 and re.fullmatch(r'#[0-9a-f]{6}', v.get('hex', '#000000')))
def ok_dim(v): return is_ref(v) or (isinstance(v, dict) and isinstance(v.get('value'), (int, float)) and v.get('unit') in ('px', 'rem'))
def ok_shadow_layer(v): return isinstance(v, dict) and ok_color(v.get('color')) and all(ok_dim(v.get(k)) for k in ('offsetX', 'offsetY', 'blur', 'spread')) and isinstance(v.get('inset', False), bool)
SHAPE = {
    'color': ok_color, 'dimension': ok_dim,
    'fontFamily': lambda v: is_ref(v) or isinstance(v, str) or (isinstance(v, list) and v and all(isinstance(x, str) for x in v)),
    'fontWeight': lambda v: is_ref(v) or (isinstance(v, (int, float)) and 1 <= v <= 1000),
    'duration': lambda v: is_ref(v) or (isinstance(v, dict) and isinstance(v.get('value'), (int, float)) and v.get('unit') in ('ms', 's')),
    'cubicBezier': lambda v: is_ref(v) or (isinstance(v, list) and len(v) == 4 and 0 <= v[0] <= 1 and 0 <= v[2] <= 1),
    'number': lambda v: is_ref(v) or isinstance(v, (int, float)),
    'shadow': lambda v: is_ref(v) or ok_shadow_layer(v) or (isinstance(v, list) and v and all(ok_shadow_layer(x) for x in v)),
    'typography': lambda v: isinstance(v, dict) and all(k in v for k in ('fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight')),
}
bad_type, bad_value, bad_name = [], [], []
all_files = [('diki.tokens.json', base)] + [(f'themes/{k}.tokens.json', v) for k, v in themes.items()]
comp_dir = os.path.join(D, 'components')
components = {f: json.load(open(os.path.join(comp_dir, f), encoding='utf-8')) for f in sorted(os.listdir(comp_dir))} if os.path.isdir(comp_dir) else {}
all_files += [(f'components/{f}', v) for f, v in components.items()]
for f, tree in all_files:
    for path, tok in tokens(tree):
        if any(re.search(r'[.{}]|^\$', p) for p in path): bad_name.append('.'.join(path))
        ty = tok.get('$type')
        if ty not in TYPES: bad_type.append(f'{f}: {".".join(path)} ({ty})'); continue
        if not SHAPE.get(ty, lambda v: True)(tok['$value']): bad_value.append(f'{f}: {".".join(path)}')
check('every token has a standard $type', not bad_type, '; '.join(bad_type[:8]))
check('every $value has the shape its type requires', not bad_value, '; '.join(bad_value[:8]))
check('token names avoid the reserved characters . { } and a leading $', not bad_name, '; '.join(bad_name[:8]))

index = {'.'.join(p) for p, _ in tokens(base)}
index |= {'.'.join(p) for p, _ in tokens(next(iter(themes.values())))}   # component tokens may point at theme aliases
unres = []
def refs(v):
    if is_ref(v): yield v[1:-1]
    elif isinstance(v, (dict, list)):
        for x in (v.values() if isinstance(v, dict) else v): yield from refs(x)
for f, tree in all_files:
    for path, tok in tokens(tree):
        for rf in refs(tok['$value']):
            if rf not in index: unres.append(f'{f}: {".".join(path)} → {{{rf}}}')
check('every reference resolves (to diki.tokens.json or a theme alias)', not unres, '; '.join(unres[:8]))

src = json.load(open(os.path.join(P, 'tokens.json'), encoding='utf-8'))
exported = {tok['$extensions']['com.diki']['cssVar'][2:] for f, tree in all_files for _, tok in tokens(tree) if tok.get('$extensions', {}).get('com.diki', {}).get('cssVar')}
exported |= {n for g, v in css_only.items() if isinstance(v, dict) for n in v}
missing = [x['name'] for g, v in src.items() if isinstance(v, dict) and isinstance(v.get('tokens'), list) for x in v['tokens'] if x['name'] not in exported]
check('every token in tokens.json is exported (typed, as an alias, or as a CSS value)', not missing, ', '.join(missing[:10]))
n_alias = {len(t.get('color', {})) for t in themes.values()}
check(f'each of the {len(themes)} theme files has the same aliases', len(n_alias) == 1, str(n_alias))

for n, ok, d in R: print(f'{"PASS" if ok else "FAIL"}  {n}' + ('' if ok or not d else f'\n      {d}'))
failed = [x for x in R if not x[1]]
print(f'\nDesign tokens: {len(R) - len(failed)}/{len(R)} passed')
sys.exit(1 if failed else 0)
