"""Foundation audit: checks that the system stays self-contained and that everything reads its tokens.

usage: python3 tools/test/foundation.py [project dir]

Checks
  1. tokens.json fits the design system page's format (group and token limits, names, values).
  2. bundle.css stays under the 2 MB limit.
  3. Every var(--x) in bundle.css names a real token (or a --dk-* internal variable), and every
     fallback value matches its token, so the page looks the same before tokens.css loads.
  4. No utility class writes out a value that a token already holds (it should read the token).
  5. Button and Icon styles use no values except tokens and the few listed in ALLOWED_COMPONENT_LITERALS.
  6. Nothing loads from another server (no http(s) URLs or @import in the shipped CSS/JS).
  7. tokens.css is exactly what tools/tokens/build.mjs makes from tokens.json; if it isn't, run
     npm run tokens.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..'))
results = []
def check(name, ok, detail=''):
    results.append((name, ok, detail))

t = json.load(open(os.path.join(P, 'tokens.json'), encoding='utf-8'))
css_raw = open(os.path.join(P, 'dist', 'bundle.css'), encoding='utf-8').read()
css = re.sub(r'/\*.*?\*/', '', css_raw, flags=re.S)
js = open(os.path.join(P, 'dist', 'bundle.js'), encoding='utf-8').read()

first = lambda v: next(iter(v.values())) if isinstance(v, dict) else v
groups = {k: v for k, v in t.items() if isinstance(v, dict) and isinstance(v.get('tokens'), list)}
CORE = {'color', 'spacing', 'radius', 'shadow'}
TV = {x['name']: str(first(x['value'])) for g in groups.values() for x in g['tokens']}
FAM = {'font-' + k: v for k, v in t['type']['families'].items()}

# 1. format
others = [k for k in groups if k not in CORE]
check('tokens.json: at most 12 extra token groups', len(others) <= 12, f'{len(others)}: {others}')
big = [f'{k} ({len(g["tokens"])})' for k, g in groups.items() if k != 'color' and len(g['tokens']) > 60]
check('tokens.json: at most 60 tokens per group', not big, ', '.join(big))
names = [x['name'] for g in groups.values() for x in g['tokens']]
dupes = sorted({n for n in names if names.count(n) > 1})
check('tokens.json: token names are unique', not dupes, ', '.join(dupes))
badn = [n for n in names if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,63}', n)]
check('tokens.json: token names use letters, digits, - _ .', not badn, ', '.join(badn[:10]))
badv = [x['name'] for k in others for x in groups[k]['tokens']
        if not re.fullmatch(r'[A-Za-z0-9 #%(),./+_-]{1,200}', str(first(x['value']))) or 'var(' in str(first(x['value']))]
check('tokens.json: extra-group values are plain values (no var(), allowed characters, 200 max)', not badv, ', '.join(badv[:10]))

# 2. size
size = os.path.getsize(os.path.join(P, 'dist', 'bundle.css'))
check('bundle.css is under 2 MB', size < 2 * 1024 * 1024, f'{size / 1048576:.2f} MB')

# component tokens (src/components/<Name>/<name>.tokens.json): their CSS variables are overrides with a default
import glob
COMP = {}   # css var name (without --) -> (file, token)
for f in sorted(glob.glob(os.path.join(P, 'src', 'components', '*', '*.tokens.json'))):
    data = json.load(open(f, encoding='utf-8'))
    def walk(tree):
        for k, v in tree.items():
            if k.startswith('$'): continue
            if isinstance(v, dict) and '$value' in v: COMP[v['$extensions']['com.diki']['cssVar'][2:]] = (os.path.relpath(f, P), v)
            elif isinstance(v, dict): walk(v)
    walk(data)
DT_BASE = json.load(open(os.path.join(P, 'design-tokens', 'diki.tokens.json'), encoding='utf-8')) if os.path.exists(os.path.join(P, 'design-tokens', 'diki.tokens.json')) else {}
ALIASES = {x['name'] for x in groups['color']['tokens'] if isinstance(x['value'], dict) and len(x['value']) > 1}
def comp_default(tok):
    v = tok['$value']
    if isinstance(v, dict): return 'transparent' if v.get('alpha', 1) == 0 else None
    grp, name = v[1:-1].split('.', 1)
    if grp == 'color': return f'var(--{name})' if name in ALIASES or name in TV else None
    node = DT_BASE.get(grp, {}).get(name)
    if not node: return None
    css = node['$extensions']['com.diki']['cssVar'][2:]
    return f'var(--{css.replace(".", chr(92) + ".")}, {TV[css]})'

# 3. var() references and fallbacks
def norm(v): return re.sub(r'\s+', ' ', v.strip().strip('"').replace('"', "'"))
missing, wrongfb = set(), set()
for m in re.finditer(r'var\(--([A-Za-z0-9\\._-]+)(?:,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))*))?\)', css):
    n = m.group(1).replace('\\', ''); fb = m.group(2)
    if n.startswith('dk-') or n in COMP: continue
    if n not in TV and n not in FAM: missing.add(n); continue
    if fb is not None and fb.strip() and n in TV and norm(fb) != norm(TV[n]):
        wrongfb.add(f'{n}: fallback {fb.strip()[:40]} ≠ token {TV[n][:40]}')
check('bundle.css: every var() names a token', not missing, ', '.join(sorted(missing)[:15]))
check('bundle.css: every fallback matches its token', not wrongfb, '; '.join(sorted(wrongfb)[:10]))

# 3b. component tokens: each refers to a shared token, is used, and every use carries exactly its default
bad_ref, unused, wrong = [], [], []
for n, (f, tok) in COMP.items():
    d = comp_default(tok)
    if d is None: bad_ref.append(f'{n} → {tok["$value"]}'); continue
    uses = re.findall(r'var\(--' + re.escape(n) + r'(?:,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))*))?\)', css)
    if not uses: unused.append(n)
    for fb in uses:
        if norm(fb) != norm(d): wrong.append(f'{n}: CSS default {fb.strip()[:50]} ≠ {d}')
if COMP:
    check(f'component tokens: all {len(COMP)} refer to shared tokens', not bad_ref, '; '.join(bad_ref[:8]))
    check('component tokens: every one is used, with exactly the default its tokens file gives', not unused and not wrong, '; '.join((['unused: ' + ', '.join(unused)] if unused else []) + wrong[:8]))

# 4. literal values that a token holds
EXCEPT = re.compile(r'^-?(shadow|inset-shadow|text-shadow|drop-shadow|rounded(-[a-z]+)?-full)\b')  # documented exceptions
lit = []
for m in re.finditer(r'(?:(?<=\} )|(?<=\*/ )|^)\.(-?[a-z0-9-]+(?:\\[./][0-9a-z]+)?) \{([^{}]*)\}', css, flags=re.M):
    cls = m.group(1).replace('\\', ''); body = m.group(2)
    if cls.startswith('dk-') or EXCEPT.match(cls): continue
    outside = re.sub(r'var\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)', '', body)
    parts = cls.lstrip('-').split('-')
    cands = {'-'.join(parts[i:]) for i in range(len(parts))} | {'spacing-' + '-'.join(parts[i:]) for i in range(len(parts))}
    fm = re.search(r'-(\d+)/(\d+)$', cls)
    if fm: cands.add(f'sizing-{fm.group(1)}-{fm.group(2)}')
    for n in cands:
        v = TV.get(n)
        if v and v not in ('0', '1', 'none', 'auto', '0px', '100%') and re.search(r'(?<![\w.-])' + re.escape(v) + r'(?![\w.%])', outside):
            lit.append(f'.{cls} writes {v} ({n})')
check('utilities: no class writes out a value its token holds', not lit, '; '.join(lit[:10]))

# 5. components
ALLOWED_COMPONENT_LITERALS = {'0', '1em'}   # 0 = none/off, 1em = an icon box that follows its own font size
comp = '\n'.join(m.group(0) for m in re.finditer(r'[^{}]*\.dk-[^{}]*\{[^{}]*\}', css))
bad = set()
for prop, val in re.findall(r'([a-z-]+)\s*:\s*([^;{}]+);', comp):
    if prop.startswith('--dk'): continue
    outside = re.sub(r'var\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)', '', val)
    for num in re.findall(r'(?<![\w#-])-?\d*\.?\d+(?:px|rem|em|ms|s|%|deg)?(?![\w-])', outside):
        if num not in ALLOWED_COMPONENT_LITERALS: bad.add(f'{prop}: {val.strip()[:60]}')
check('components: Button and Icon use only tokens', not bad, '; '.join(sorted(bad)[:10]))

# 6. self-contained
extra = ''
for f in ('src/styles/base.css', 'src/theme.js'):
    fp = os.path.join(P, f)
    if os.path.exists(fp): extra += open(fp, encoding='utf-8').read()
ext = re.findall(r'(?:https?:)?//[a-z0-9.-]+\.[a-z]{2,}/[^\s"\')]*', css_raw + js + extra)
ext = [u for u in ext if not u.startswith('//')]
check('nothing loads from another server', not ext and '@import' not in css_raw + extra, ', '.join(ext[:5]))

# 8. contrast in every theme (WCAG 2.2: 4.5:1 text, 3:1 large text, icons, borders and focus)
PAL = {x['name']: first(x['value']) for x in groups['color']['tokens'] if not (isinstance(x['value'], dict) and len(x['value']) > 1)}
ALIAS = {x['name']: x['value'] for x in groups['color']['tokens'] if isinstance(x['value'], dict) and len(x['value']) > 1}
THEMES = list(next(iter(ALIAS.values())).keys())
def resolve(name, th):
    v = ALIAS[name][th] if name in ALIAS else PAL[name]
    m = re.fullmatch(r'\{(.+)\}', v)
    return resolve(m.group(1), th) if m else v
def lum(h):
    h = h.lstrip('#'); r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def ratio(a, b):
    la, lb = lum(a), lum(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
PAIRS = [('text', 'surface', 4.5), ('text', 'surface-muted', 4.5), ('text-muted', 'surface', 4.5), ('text-muted', 'surface-muted', 4.5),
         ('text-inverse', 'surface-inverse', 4.5), ('on-primary', 'primary', 4.5), ('on-primary', 'primary-hover', 4.5),
         ('on-danger', 'danger', 4.5), ('on-danger', 'danger-hover', 4.5), ('danger-text', 'surface', 4.5), ('danger-text', 'danger-subtle', 4.5),
         ('primary', 'surface', 3), ('focus-ring', 'surface', 3), ('text', 'secondary', 4.5), ('text', 'secondary-hover', 4.5),
         ('text', 'field', 4.5), ('placeholder', 'field', 4.5), ('field-border', 'field', 3), ('field-border', 'surface', 3),
         ('info', 'surface', 4.5), ('text', 'primary-subtle', 4.5),
         ('primary', 'surface', 4.5), ('primary-hover', 'primary-subtle', 4.5), ('danger', 'surface', 3)]   # secondary button: brand text and border on surface, hover tint; destructive secondary border
low = []
for th in THEMES:
    for fg, bg, need in PAIRS:
        if fg not in ALIAS and fg not in PAL or bg not in ALIAS and bg not in PAL: continue
        r = ratio(resolve(fg, th), resolve(bg, th))
        if r < need: low.append(f'{th}: {fg} on {bg} {r:.2f}:1 (needs {need})')
check(f'contrast: {len(PAIRS)} text, control and focus pairs pass WCAG in all {len(THEMES)} themes', not low, '; '.join(low[:8]))

# 9. responsive variants use the breakpoint tokens
SCR = {x['name'][7:]: x['value'] for x in groups['layout']['tokens'] if x['name'].startswith('screen-')}
bad_bp = []
for m in re.finditer(r'@media \(min-width: ([0-9a-z.]+)\) \{ \.([a-z0-9]+)\\:', css):
    if SCR.get(m.group(2)) != m.group(1): bad_bp.append(f'{m.group(2)}: at {m.group(1)}, token says {SCR.get(m.group(2))}')
check('responsive variants switch at the screen-* breakpoints', not bad_bp, '; '.join(bad_bp))

# 10. base.css reads tokens only
bp = os.path.join(P, 'src', 'styles', 'base.css')
if os.path.exists(bp):
    base = re.sub(r'/\*.*?\*/', '', open(bp, encoding='utf-8').read(), flags=re.S)
    miss = sorted({n for n in re.findall(r'var\(--([A-Za-z0-9._-]+)', base) if n not in TV and n not in FAM})
    lits = []
    for prop, val in re.findall(r'([a-z-]+)\s*:\s*([^;{}]+);', base):
        if prop.endswith('text-size-adjust'): continue   # a browser behaviour switch (stop phones inflating text), not a design value
        out = re.sub(r'var\((?:[^()]|\([^()]*\))*\)', '', val)
        if re.search(r'(?<![\w#-])\d*\.?\d+(?:px|rem|em|ms|s|%)(?![\w-])', out): lits.append(f'{prop}: {val.strip()}')
    check('base.css: every value is a token', not miss and not lits, '; '.join(miss + lits))

# 11. one version everywhere (package.json, file headers, Diki.version, CHANGELOG)
import subprocess
rv = subprocess.run([sys.executable, '-I', os.path.join(HERE, '..', 'release.py'), '--check'], capture_output=True, text=True)
check('version: package.json, file headers, Diki.version and CHANGELOG agree', rv.returncode == 0, rv.stdout.strip().replace('\n', '; '))

# 7. tokens.css is generated from tokens.json (tools/tokens/build.mjs --check compares it byte for byte)
tc = subprocess.run(['node', os.path.join(HERE, '..', 'tokens', 'build.mjs'), '--check', P], capture_output=True, text=True)
check('tokens.css is exactly what tokens.json gives (npm run tokens if not)', tc.returncode == 0, (tc.stdout + tc.stderr).strip())

for name, ok, detail in results:
    print(f'{"PASS" if ok else "FAIL"}  {name}' + ('' if ok or not detail else f'\n      {detail}'))
failed = [r for r in results if not r[1]]
print(f'\nFoundation: {len(results) - len(failed)}/{len(results)} passed')
sys.exit(1 if failed else 0)
