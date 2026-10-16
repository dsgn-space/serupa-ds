"""Trim components/bundle.css to the classes a product actually uses.

usage:  python3 tools/purge.py <source files or folders...> [-o out.css] [--css components/bundle.css] [--keep class ...]

Scans the sources (HTML, JSX/TSX, JS/TS, Vue, Svelte, templates…) for anything that looks like a
class name and writes a copy of bundle.css with only the rules those classes need. Kept always:
the component styles (dk-*, which components add at runtime), @keyframes, @property, @font-face and
rules that select no class. Responsive variants are matched by their full name ("md:flex").

Class names must appear whole in the source: "md:grid-cols-3" is found, but a name built at runtime
("grid-cols-" + n) is not. List those with --keep, or a safelist file with --keep @file.
"""
import argparse, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('sources', nargs='+')
ap.add_argument('-o', '--out', default='bundle.min.css')
ap.add_argument('--css', default=os.path.join(HERE, '..', 'components', 'bundle.css'))
ap.add_argument('--keep', nargs='*', default=[])
a = ap.parse_args()

EXT = ('.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte', '.astro', '.md', '.mdx', '.php', '.erb', '.hbs', '.njk', '.liquid', '.twig', '.py', '.json')
def files(p):
    if os.path.isfile(p): yield p; return
    for d, ds, fs in os.walk(p):
        ds[:] = [x for x in ds if x not in ('node_modules', '.git', 'dist', 'build', '.next')]
        for f in fs:
            if f.endswith(EXT): yield os.path.join(d, f)

used = set()
for src in a.sources:
    for f in files(src):
        text = open(f, encoding='utf-8', errors='ignore').read()
        used.update(re.findall(r'[A-Za-z0-9_:./%@-]+', text))
for k in a.keep:
    if k.startswith('@'): used.update(open(k[1:], encoding='utf-8').read().split())
    else: used.add(k)

css = open(a.css, encoding='utf-8').read()
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)   # comments go first (an apostrophe in one would look like a string)

def blocks(s):
    """Split CSS into top-level items: ('comment'|'at'|'rule', prelude, body) without a full parser."""
    i, n, out = 0, len(s), []
    while i < n:
        if s.startswith('/*', i):
            j = s.find('*/', i + 2); j = n if j < 0 else j + 2
            out.append(('comment', s[i:j], None)); i = j; continue
        if s[i].isspace(): i += 1; continue
        j = i; depth = 0; q = None
        while j < n:
            ch = s[j]
            if q:
                if ch == '\\': j += 2; continue
                if ch == q: q = None
            elif ch in '"\'': q = ch
            elif ch == '{':
                if depth == 0: brace = j
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0: j += 1; break
            elif ch == ';' and depth == 0: j += 1; break
            j += 1
        chunk = s[i:j]
        if '{' in chunk:
            pre = s[i:brace].strip(); body = s[brace + 1:j - 1]
            out.append(('at' if pre.startswith('@') else 'rule', pre, body))
        else:
            out.append(('stmt', chunk.strip(), None))
        i = j
    return out

def unescape(n):   # "\\32 xl\\:flex" -> "2xl:flex"
    n = re.sub(r'\\([0-9a-fA-F]{1,6}) ?', lambda m: chr(int(m.group(1), 16)), n)
    return re.sub(r'\\(.)', r'\1', n)

def classes_in(selector):
    return [unescape(c) for c in re.findall(r'\.((?:[A-Za-z0-9_-]|\\[0-9a-fA-F]{1,6} ?|\\.)+)', selector)]

def keep_selector(sel):
    cs = classes_in(sel)
    if not cs: return True
    return all(c.startswith('dk-') or c in used for c in cs)

def purge(s):
    out = []
    for kind, pre, body in blocks(s):
        if kind in ('comment',): continue
        if kind == 'stmt': out.append(pre); continue
        if kind == 'at':
            if re.match(r'@(media|supports|layer|container)\b', pre):
                inner = purge(body)
                if inner.strip(): out.append(pre + ' { ' + inner + ' }')
            else:
                out.append(pre + ' {' + body + '}')   # @keyframes, @property, @font-face…
            continue
        sels = [x.strip() for x in re.split(r',(?![^()]*\))', pre)]
        kept = [x for x in sels if keep_selector(x)]
        if kept: out.append(', '.join(kept) + ' {' + body + '}')
    return '\n'.join(out)

result = purge(css)
open(a.out, 'w', encoding='utf-8').write(result + '\n')
print(f'{a.out}: {len(result) / 1024:.1f} KB (from {len(css) / 1024:.0f} KB)')
