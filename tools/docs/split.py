import re,sys
# usage: python3 split.py <work dir> <out dir>
W=sys.argv[1].rstrip('/')+'/'; O=sys.argv[2].rstrip('/')+'/'
s=open(W+'ds-docs.html').read()
css=s[s.index('<style>')+7:s.index('</style>')]
script=s[s.rindex('<script>')+8:s.rindex('</script>')]
PICK=re.search(r'<div class="tpick".*?<!--/tpick-->',s,re.S).group(0)
secs=dict(re.findall(r'<section id="(\w+)"[^>]*>(.*?)</section>',s,re.S))
# drop scrollspy
script=script[:script.index("  var links=")]+"})();\n"
pages=[("index.html","overview","Overview","Start"),("changelog.html","changelog","Changelog","Start"),("themes.html","themes","Themes","Foundations"),("colors.html","colors","Colors","Foundations"),
("typography.html","typography","Typography","Foundations"),("iconography.html","iconography","Iconography","Foundations"),("spacing.html","spacing","Spacing","Foundations"),("layout.html","layout","Layout","Foundations"),("sizing.html","sizing","Sizing","Foundations"),("flexgrid.html","flexgrid","Flexbox & grid","Foundations"),("radius.html","radius","Borders & radius","Foundations"),
("effects.html","effects","Effects","Foundations"),("filters.html","filters","Filters","Foundations"),("tables.html","tables","Tables","Foundations"),("transforms.html","transforms","Transforms","Foundations"),("backgrounds.html","backgrounds","Backgrounds","Foundations"),("motion.html","motion","Motion","Foundations"),("interactivity.html","interactivity","Interactivity","Foundations"),("svg.html","svg","SVG","Foundations"),("accessibility.html","accessibility","Accessibility","Foundations"),("badge.html","badge","Badge","Components"),("button.html","button","Button","Components"),("checkbox.html","checkbox","Checkbox","Components"),("field.html","field","Field","Components"),("input.html","input","Input","Components"),("loader.html","loader","Loader","Components"),("radio.html","radio","Radio","Components"),("select.html","select","Select","Components"),("switch.html","switch","Switch","Components"),("textarea.html","textarea","Textarea","Components")]
css=css.replace("section{padding-top:48px;scroll-margin-top:16px}","section{padding-top:0}")
css+="""
nav.side a.brand{font-size:18px;font-weight:800;display:block}
nav.side a.brand:hover{background:none}
.pager{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:64px;padding-top:24px;border-top:1px solid var(--pg-line)}
.pager a{display:flex;flex-direction:column;gap:2px;padding:14px 16px;border:1px solid var(--pg-line);border-radius:10px;text-decoration:none;color:var(--pg-fg);min-width:0}
.pager a:hover{border-color:var(--pg-accent)}
.pager a span{font-size:12px;color:var(--pg-dim)}
.pager a b{font-weight:600;color:var(--pg-accent)}
.pager .next{text-align:right;grid-column:2}
.crumb{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--pg-dim);font-weight:600;margin:0 0 8px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}
.cards a{display:flex;flex-direction:column;gap:4px;padding:16px 18px;border:1px solid var(--pg-line);border-radius:10px;text-decoration:none;color:var(--pg-fg);min-width:0}
.cards a:hover{border-color:var(--pg-accent)}
.cards a b{font-weight:600}
.cards a span{font-size:14px;color:var(--pg-dim)}
.cards .pv{display:flex;gap:3px;height:20px;margin-bottom:6px}
.cards .pv i{flex:1;border-radius:3px}
"""
open(O+'styles.css','w').write(css)
open(O+'app.js','w').write(script)
def nav(cur):
    out='<nav class="side" aria-label="Sections">\n<a class="brand" href="index.html" style="padding:0;margin:0;background:none">Diki Design System</a>\n<div class="brand-sub">Design system reference</div>\n'+PICK+'\n'
    grp=None
    for f,i,t,g in pages:
        if g!=grp: out+=f'<h4>{g}</h4>\n'; grp=g
        on=' class="on" aria-current="page"' if f==cur else ''
        out+=f'<a href="{f}"{on}>{t}</a>\n'
    return out+'</nav>'
blurbs={"themes":("Blue, Violet and Emerald, in light and dark.","--blue-600,--blue-400,--violet-600,--violet-400,--emerald-700,--emerald-400"),"colors":("Alias colors and the 22-family palette.","--primary,--surface-inverse,--blue-500,--emerald-500,--amber-400,--rose-500"),
"typography":("Inter, Georgia, Courier New and the type scale.",""),
"iconography":("Material Symbols, Rounded and filled.",""),"spacing":("35 steps on a 4px grid.",""),"layout":("Breakpoints, z-index, aspect ratio, columns.",""),"sizing":("Widths, heights and the max-width scale.",""),"flexgrid":("Flex, grid, gap and alignment.",""),
"radius":("Radius, borders and outlines.",""),
"effects":("Shadows, rings, opacity, blend modes and masks.",""),"filters":("Blur, drop shadows, color and backdrop filters.",""),"tables":("Collapse, spacing, layout and captions.",""),"transforms":("Rotate, scale, skew, translate and 3D.",""),"backgrounds":("Fills, gradients and images.",""),"motion":("Durations, easings and animations.",""),"interactivity":("Cursors, form controls, scrolling and touch.",""),"svg":("Fill, stroke and stroke width.",""),"accessibility":("Forced colors and screen-reader text.",""),
"badge":("Status, counts and tags: subtle, solid and outline, in 23 tones.",""),"button":("Five variants plus destructive, three sizes, icons and loading.",""),"input":("A text field in three sizes, with icons, focus, invalid, read-only and disabled states.",""),"field":("Label, hint and error around a form control, wired up for screen readers.",""),"select":("A native select in three sizes, with a placeholder, icon and option groups.",""),"checkbox":("A native checkbox with a label and description, in three sizes, with an indeterminate state.",""),"radio":("Native radios in a RadioGroup: one choice, in three sizes, stacked or in a row.",""),"switch":("An on/off setting that applies at once: a track and thumb in three sizes, announced as a switch.",""),"changelog":("Every release, newest first, and how to upgrade.",""),"loader":("Ring, dots, text and skeleton loaders, with a show-after delay.",""),"textarea":("A multi-line text field with auto-resize and a character count.","")}
cards='<h3>Browse</h3><div class="cards">'
for f,i,t,g in pages[1:]:
    if g=='Start': continue   # the sidebar's Start pages aren't foundations
    b,sw=blurbs[i]
    pv='<div class="pv">'+''.join(f'<i style="background:var({c})"></i>' for c in sw.split(','))+'</div>' if sw else ''
    cards+=f'<a href="{f}">{pv}<b>{t}</b><span>{b}</span></a>'
cards+='</div>'
over=secs['overview'].replace('<h3>How to use it</h3>',cards+'\n  <h3>How to use it</h3>')
over=over.replace('<h4>Click to copy</h4><p>Click any swatch on this page','<h4>Click to copy</h4><p>Click any swatch in these docs')
secs['overview']=over
head_links='<script>try{var t=localStorage.getItem("dds-theme"),m=/^(blue|violet|emerald)-(light|dark)$/.exec(t||"");if(m){document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-mode",m[2]);}}catch(e){}</script>\n<link rel="stylesheet" href="styles.css">'
for n,(f,i,t,g) in enumerate(pages):
    body=secs[i]
    if i!='overview':
        body=f'<p class="crumb">{g}</p>'+body
    pager='<div class="pager">'
    if n>0: pf,_,pt,_=pages[n-1]; pager+=f'<a class="prev" href="{pf}"><span>Previous</span><b>← {pt}</b></a>'
    if n<len(pages)-1: nf,_,nt,_=pages[n+1]; pager+=f'<a class="next" href="{nf}"><span>Next</span><b>{nt} →</b></a>'
    pager+='</div>'
    inner=f'<div class="shell">\n{nav(f)}\n<main>\n<section id="{i}">{body}</section>\n{pager}\n</main>\n</div>\n<div class="toast" id="toast" role="status" aria-live="polite"></div>\n<script src="app.js"></script>'
    title='Diki Design System' if f=='index.html' else f'{t} · Diki Design System'
    if f=='index.html':
        doc=f'<title>{title}</title>\n{head_links}\n{inner}\n'
        open(O+'index.html','w').write(doc)
    else:
        doc=f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>{title}</title>\n{head_links}\n<style>html,body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>\n</head>\n<body>\n{inner}\n</body>\n</html>\n'
        open(O+f,'w').write(doc)
print('ok')
