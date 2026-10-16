"""Icon builder: tools/icons/build.py turns SVG files into safe, one-color icons on the 24×24 grid.

usage: python3 tools/test/icons.py [project dir]

Checks that clean exports (Figma, Illustrator, hand-written, outlined/stroke icons) are accepted and
drawn in currentColor; that anything unsafe or off-system is refused with a reason; that the build is
repeatable and --check notices a stale bundle; and that the icons now in bundle.js and index.d.ts are
exactly what the builder would write.
"""
import importlib.util, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..'))
BUILD = os.path.join(P, 'tools', 'icons', 'build.py')
spec = importlib.util.spec_from_file_location('icon_build', BUILD)
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)

results = []
def check(name, ok, detail=''):
    results.append((name, ok, detail))

def svg(inner, attrs='viewBox="0 0 24 24"'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" {attrs}>{inner}</svg>'

def accepts(src, name='test-icon'):
    try:
        return B.clean(src, name), None
    except B.IconError as e:
        return None, str(e)

def refuses(label, src, expect, name='test-icon'):
    body, err = accepts(src, name)
    check(f'refuses {label}', body is None and expect.lower() in (err or '').lower(), f'got: {err or body}')

# --- accepted, and normalised to currentColor
FIGMA = svg('<path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 16.5L5.5 21L7.5 13.5L2 9H9Z" fill="#1E1E1E"/>',
            'width="24" height="24" viewBox="0 0 24 24" fill="none"')
body, err = accepts(FIGMA)
check('accepts a Figma export (svg fill="none", path fill="#1E1E1E") and draws it in currentColor',
      body is not None and 'fill="currentColor"' in body and '#1E1E1E' not in body and 'width' not in body, err or body)
STROKE = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
             'viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')
body, err = accepts(STROKE)
check('accepts an outlined (stroke) icon: shapes stay unfilled, strokes use currentColor',
      body is not None and body.startswith('<g ') and 'fill="none"' in body and 'stroke="currentColor"' in body and 'stroke-width="2"' in body, err or body)
HOLES = svg('<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zm0 5a5 5 0 1 1 0 10a5 5 0 1 1 0-10z"/>')
body, err = accepts(HOLES)
check('keeps fill-rule="evenodd" holes', body is not None and 'fill-rule="evenodd"' in body, err or body)
ILLUSTRATOR = ('<?xml version="1.0" encoding="utf-8"?><!-- Generator: Adobe Illustrator -->'
               '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">'
               '<style type="text/css"></style><title>bolt</title><g id="Group"><rect x="4" y="4" width="16" height="16" rx="3" style="fill:#333333"/></g></svg>')
body, err = accepts(ILLUSTRATOR)
check('refuses an Illustrator <style> element', body is None and '<style>' in (err or ''), err or body)
ILLUSTRATOR2 = ILLUSTRATOR.replace('<style type="text/css"></style>', '')
body, err = accepts(ILLUSTRATOR2)
check('accepts an Illustrator export: drops ids, title, style, xml:space; keeps the rect in currentColor',
      body == '<g><rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"/></g>', err or body)
body, err = accepts(svg('<path d="M4 4h16v16H4z" fill="currentColor" opacity=".5"/><path d="M8 8h8v8H8z"/>'))
check('allows one color at two opacities (a duotone in one color)', body is not None and 'opacity=".5"' in body, err or body)
body, err = accepts(svg('<path d="M2 2h20v20H2z"/>', 'viewBox="0,0,24,24"'))
check('accepts a viewBox written with commas', body is not None, err)

# --- refused, with a reason
refuses('<script>', svg('<script>alert(1)</script><path d="M0 0h24v24H0z"/>'), 'isn\'t allowed')
refuses('event handlers (onload)', svg('<path d="M0 0h24v24H0z" onload="alert(1)"/>'), 'event handler')
refuses('event handlers on <svg>', svg('<path d="M0 0h24v24H0z"/>', 'viewBox="0 0 24 24" onclick="x()"'), 'event handler')
refuses('<use href>', svg('<use href="#a"/>'), 'isn\'t allowed')
refuses('xlink:href', svg('<path d="M0 0h24v24H0z" xlink:href="https://x.test/a.svg"/>', 'xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"'), 'links to something')
refuses('<image>', svg('<image href="data:image/png;base64,AAAA" width="24" height="24"/>'), 'isn\'t allowed')
refuses('<foreignObject>', svg('<foreignObject width="24" height="24"><div>x</div></foreignObject>'), 'isn\'t allowed')
refuses('<text>', svg('<text x="0" y="12">A</text>'), 'isn\'t allowed')
refuses('gradients (url(...) fill)', svg('<defs><linearGradient id="g"/></defs><path d="M0 0h24v24H0z" fill="url(#g)"/>'), 'defs')
refuses('a gradient fill without defs', svg('<path d="M0 0h24v24H0z" fill="url(#g)"/>'), 'gradient')
refuses('masks', svg('<path d="M0 0h24v24H0z" mask="url(#m)"/>'), 'mask')
refuses('javascript: in a value', svg('<path d="M0 0h24v24H0z" transform="javascript:alert(1)"/>'), 'links to something')
refuses('a DOCTYPE / entity (XML bombs)', '<!DOCTYPE svg [<!ENTITY a "aaaa">]>' + svg('<path d="M0 0h24v24H0z"/>'), 'DOCTYPE')
refuses('another grid (viewBox 0 0 32 32)', svg('<path d="M0 0h32v32H0z"/>', 'viewBox="0 0 32 32"'), '24×24')
refuses('a missing viewBox', svg('<path d="M0 0h24v24H0z"/>', 'width="24" height="24"'), 'missing')
refuses('two colors (white shapes instead of holes)', svg('<circle cx="12" cy="12" r="10" fill="#000"/><circle cx="12" cy="12" r="4" fill="#fff"/>'), '2 colors')
refuses('a color in style="" plus a fill', svg('<path d="M0 0h9v9H0z" style="fill:#f00"/><path d="M9 9h9v9H9z" fill="#00f"/>'), '2 colors')
refuses('bad path data', svg('<path d="M0 0 &quot;x"/>'), 'isn\'t a value')
refuses('non-numeric geometry', svg('<circle cx="calc(1)" cy="12" r="4"/>'), 'number')
refuses('an empty icon', svg('<g></g>'), 'no shapes')
refuses('file names with spaces or capitals', svg('<path d="M0 0h24v24H0z"/>'), 'lowercase', name='My Icon')
refuses('not SVG at all', 'hello', 'not valid SVG')

# --- the build: writes src/icons.ts (the registry and CustomIconName), repeatable, --check, and the shipped registry
tmp = tempfile.mkdtemp()
try:
    proj = os.path.join(tmp, 'p')
    os.makedirs(os.path.join(proj, 'src'))
    shutil.copy(os.path.join(P, 'src', 'icons.ts'), os.path.join(proj, 'src', 'icons.ts'))
    ICONS_TS = os.path.join(proj, 'src', 'icons.ts')
    icons = os.path.join(tmp, 'icons')
    os.makedirs(icons)
    open(os.path.join(icons, 'diki-star.svg'), 'w').write(FIGMA)
    open(os.path.join(icons, 'diki-clock.svg'), 'w').write(STROKE)
    open(os.path.join(icons, 'notes.txt'), 'w').write('ignored')
    run = lambda *a: subprocess.run([sys.executable, '-I', BUILD, '--project', proj, *a], capture_output=True, text=True)
    r = run(icons)
    js = ts = open(ICONS_TS).read()
    reg = B.read_registry(js)
    check('build writes the icons into src/icons.ts, sorted by name', r.returncode == 0 and list(reg) == ['diki-clock', 'diki-star'], r.stdout + r.stderr)
    check('build writes CustomIconName into src/icons.ts', 'export type CustomIconName = "diki-clock" | "diki-star";' in ts, re.search(r'CustomIconName = [^;]*;', ts).group(0))
    check('src/icons.ts holds no literal </script and no outside URL', '</script' not in js.lower() and 'http' not in json.dumps(reg))
    r2 = run(icons)
    check('building again changes nothing', open(ICONS_TS).read() == js and r2.returncode == 0)
    check('--check passes when in step', run('--check', icons).returncode == 0)
    open(os.path.join(icons, 'diki-new.svg'), 'w').write(HOLES)
    check('--check fails after an icon is added', run('--check', icons).returncode == 1)
    open(os.path.join(icons, 'bad.svg'), 'w').write(svg('<script>x</script>'))
    r3 = run(icons)
    check('a bad file stops the build and leaves src/icons.ts untouched',
          r3.returncode == 1 and 'bad:' in r3.stderr and open(ICONS_TS).read() == js, r3.stderr)
    os.remove(os.path.join(icons, 'bad.svg'))
    r4 = run(os.path.join(tmp, 'nowhere'))
    check('a missing folder removes every custom icon', r4.returncode == 0 and B.read_registry(open(ICONS_TS).read()) == {}
          and 'CustomIconName = never;' in open(ICONS_TS).read(), r4.stdout + r4.stderr)
finally:
    shutil.rmtree(tmp, ignore_errors=True)

# the icons shipped now: each one is exactly what the builder makes of it, and the types list the same names
js = ts = open(os.path.join(P, 'src', 'icons.ts'), encoding='utf-8').read()
reg = B.read_registry(js)
unsafe = []
for n, b in reg.items():
    try:
        if B.clean(svg(b), n) != b:
            unsafe.append(n)
    except B.IconError as e:
        unsafe.append(f'{n} ({e})')
check(f'shipped custom icons ({len(reg)}) are clean builder output', not unsafe, ', '.join(unsafe))
check('CustomIconName lists the same custom icon names as the registry', B.ts_block(reg) in ts)
built = os.path.join(P, 'dist', 'index.d.ts')
if os.path.exists(built):
    check('the built types (dist/index.d.ts) carry the same CustomIconName', re.search(r'type CustomIconName = ([^;]*);', open(built, encoding='utf-8').read()).group(1) == (' | '.join(json.dumps(n) for n in sorted(reg)) or 'never'))
src = os.path.join(P, 'assets', 'Icons')
if os.path.isdir(src):
    r = subprocess.run([sys.executable, '-I', BUILD, '--project', P, '--check', src], capture_output=True, text=True)
    check('assets/Icons and the components are in step', r.returncode == 0, r.stdout + r.stderr)

failed = [r for r in results if not r[1]]
for name, ok, detail in results:
    print(f'{"PASS" if ok else "FAIL"}  {name}' + ('' if ok or not detail else f'\n      {detail}'))
print(f'\nIcon builder: {len(results) - len(failed)}/{len(results)} passed')
sys.exit(1 if failed else 0)
