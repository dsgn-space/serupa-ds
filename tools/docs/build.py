"""Build the Diki Design System documentation site from the design system's own files.

usage:  python3 tools/docs/build.py [project dir] [out dir]
        project dir  the design system folder that holds tokens.json (default: two levels up from this file)
        out dir      where the site is written (default: ./docs-site)

Reads tokens.json and components/bundle.css, fills template.html, splits it into one
page per section, and copies the fonts. The result is a static site with no outside
requests: open out/index.html, or publish the folder as the docs artifact (its page is
index.html, published as ds-docs.html; every other file goes in `files`).
"""
import os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
project = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..'))
out = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else 'docs-site')
if not os.path.exists(os.path.join(project, 'tokens.json')):
    sys.exit(f'No tokens.json in {project}')

os.makedirs(out, exist_ok=True)
with tempfile.TemporaryDirectory() as work:
    subprocess.run([sys.executable, '-I', os.path.join(HERE, 'generate.py'), project, work], check=True, stdout=subprocess.DEVNULL)
    subprocess.run([sys.executable, '-I', os.path.join(HERE, 'split.py'), work, out], check=True, stdout=subprocess.DEVNULL)

idx = os.path.join(out, 'index.html')
s = open(idx, encoding='utf-8').read()
s = s.replace('<title>Diki Design System</title>', '<title>Diki Design System Documentation</title>', 1)
open(idx, 'w', encoding='utf-8').write(s)

# Pages that moved keep their old address: a small page that sends you on.
MOVED = {'spinner.html': ('loader.html', 'Loader')}   # Spinner became Loader in 3.0.0
for old, (new, title) in MOVED.items():
    open(os.path.join(out, old), 'w', encoding='utf-8').write(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved to {title}</title>'
        f'<meta http-equiv="refresh" content="0; url={new}"><script>location.replace("{new}" + location.hash)</script></head>'
        f'<body><p>This page moved to <a href="{new}">{title}</a>.</p></body></html>')

os.makedirs(os.path.join(out, 'fonts'), exist_ok=True)
for f in os.listdir(os.path.join(project, 'fonts')):
    shutil.copy2(os.path.join(project, 'fonts', f), os.path.join(out, 'fonts', f))
for f in os.listdir(os.path.join(HERE, 'static')):   # redirect pages for old links (aliases, palette -> colors)
    shutil.copy2(os.path.join(HERE, 'static', f), os.path.join(out, f))
print('Docs written to', out)
