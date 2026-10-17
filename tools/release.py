"""Release a new version: moves the changelog's Unreleased notes under the new version and stamps the
version into every shipped file.

usage:  python3 tools/release.py 1.1.0            (or: major | minor | patch)
        python3 tools/release.py --check          only check that every file carries the same version

Then run the tests (node tools/test/run.mjs) and publish. Choosing the number (README, Versioning):
  major  something that worked stops working: a token, class, prop or file removed or renamed, or a
         default changed in a way that changes existing screens
  minor  something new, everything existing keeps working: new tokens, classes, components, props
  patch  fixes that don't change what correct code gets
"""
import datetime, json, os, re, sys

P = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
STAMPS = {   # file -> pattern whose group 1 is the version
    'package.json': r'"version": "([0-9]+\.[0-9]+\.[0-9]+)"',
    'src/styles/base.css': r'Diki Design System v([0-9]+\.[0-9]+\.[0-9]+)',
    'src/theme.js': r'Diki Design System v([0-9]+\.[0-9]+\.[0-9]+)',
}   # the built files (dist/) take the version from package.json when npm run build makes them
EXTRA = {'src/theme.js': r'window\.Diki\.version = "([0-9]+\.[0-9]+\.[0-9]+)"'}

def read(f): return open(os.path.join(P, f), encoding='utf-8').read()
def write(f, s): open(os.path.join(P, f), 'w', encoding='utf-8').write(s)

def versions():
    out = {}
    for f, pat in list(STAMPS.items()) + list(EXTRA.items()):
        m = re.findall(pat, read(f))
        out.setdefault(f, set()).update(m or ['(missing)'])
    log = re.findall(r'^## \[(\d+\.\d+\.\d+)\]', read('CHANGELOG.md'), re.M)
    out['CHANGELOG.md (latest release)'] = {log[0] if log else '(missing)'}
    return out

def check():
    v = versions()
    found = set().union(*v.values())
    if len(found) == 1:
        print('All files carry version', found.pop()); return True
    for f, s in v.items(): print(f'{f}: {", ".join(sorted(s))}')
    return False

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    if sys.argv[1] == '--check': sys.exit(0 if check() else 1)
    cur = json.loads(read('package.json'))['version']
    ma, mi, pa = map(int, cur.split('.'))
    new = {'major': f'{ma + 1}.0.0', 'minor': f'{ma}.{mi + 1}.0', 'patch': f'{ma}.{mi}.{pa + 1}'}.get(sys.argv[1], sys.argv[1])
    if not re.fullmatch(r'\d+\.\d+\.\d+', new) or tuple(map(int, new.split('.'))) <= (ma, mi, pa):
        sys.exit(f'The new version must be higher than {cur}: got {new}')
    log = read('CHANGELOG.md')
    m = re.search(r'^## \[Unreleased\]\n(.*?)(?=^## \[)', log, re.M | re.S)
    if not m or not m.group(1).strip():
        sys.exit('Write the changes under "## [Unreleased]" in CHANGELOG.md first.')
    today = datetime.date.today().isoformat()
    log = log[:m.start()] + f'## [Unreleased]\n\n## [{new}] - {today}\n\n{m.group(1).strip()}\n\n' + log[m.end():]
    write('CHANGELOG.md', log)
    for f, pat in list(STAMPS.items()) + list(EXTRA.items()):
        s = read(f)
        write(f, re.sub(pat, lambda x: x.group(0).replace(x.group(1), new), s))
    check()
    print(f'Released {new} ({cur} before). Run the tests, then publish.')
