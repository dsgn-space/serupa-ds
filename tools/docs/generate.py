import json,re,html,sys,os
# usage: python3 generate.py <design-system project dir> <work dir>
P=sys.argv[1].rstrip('/')+'/'; W=sys.argv[2].rstrip('/')+'/'; HERE=os.path.dirname(os.path.abspath(__file__))+'/'
t=json.load(open(P+'tokens.json'))
for _grp in t.values():  # the page stores theme-independent values as {first-theme: value}; treat those as plain values
    if isinstance(_grp,dict) and isinstance(_grp.get('tokens'),list):
        for _x in _grp['tokens']:
            if isinstance(_x.get('value'),dict) and len(_x['value'])==1: _x['value']=next(iter(_x['value'].values()))
if 'transitions' in t:  # motion tokens live in one group; split them back for the docs sections
    _tr=t['transitions']['tokens']
    t['duration']={'tokens':[x for x in _tr if x['name'].startswith(('duration-','delay-'))]}
    t['easing']={'tokens':[x for x in _tr if x['name'].startswith('ease-')]}
    t['transitionProperty']={'tokens':[x for x in _tr if x['name'].startswith('transition')]}
    t['animation']={'tokens':[x for x in _tr if x['name'].startswith('animate-')]}
bcss=open(P+'components/bundle.css').read()
E=html.escape
TH=[x['id'] for x in t['color']['themes']]; THN={x['id']:x['name'] for x in t['color']['themes']}
def val(x,th=None):
    v=x['value']; return v[th or TH[0]] if isinstance(v,dict) else v
ct=t['color']['tokens']; byname={x['name']:val(x) for x in ct}
def resolve(v,d=0):
    m=re.match(r'^\{(.+)\}$',v); return resolve(byname[m.group(1)],d+1) if m and d<16 else v
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]; return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    a,b=lum(a),lum(b); return (max(a,b)+.05)/(min(a,b)+.05)
# DS vars
dsv=[]
for x in ct:
    v=val(x); m=re.match(r'^\{(.+)\}$',v); dsv.append(f"--{x['name']}:{'var(--'+m.group(1)+')' if m else v};")
for fam in ('spacing','radius','typography','shadow','duration','easing','delay','transitionProperty','animation','fontSize','layout','sizing','filters','transforms','opacity','borders','flexGrid'):
    for x in t.get(fam,{}).get('tokens',[]): dsv.append("--"+x['name'].replace('.','\\.')+":"+str(val(x))+";")
for k,v in t['type']['families'].items(): dsv.append(f"--font-{k}:{v};")
dscss=":root{"+"".join(dsv)+"}"
for th in TH:  # every theme, the first too, so a card can return to it inside a page set to another theme
    dscss+='[data-theme="'+th+'"]{'+"".join("--"+x['name']+":"+re.sub(r'^\{(.+)\}$',r'var(--\1)',val(x,th))+";" for x in ct if isinstance(x['value'],dict))+"}"

aliases=[x for x in ct if isinstance(x['value'],dict) or re.match(r'^\{',val(x))]
prims=[x for x in ct if not re.match(r'^\{',val(x))]
fams=[]
for x in prims:
    if '-' in x['name']:
        f=x['name'].rsplit('-',1)[0]
        if f not in fams: fams.append(f)
def usage(x): 
    u=x.get('usage',''); u=re.sub(r'^Alias → `[^`]+`\. ?','',u); return u
def md(s): return re.sub(r'`([^`]+)`',r'<code>\1</code>',E(s))
# ---- sections
BRAND={'primary','primary-hover','primary-subtle','on-primary','focus-ring'}
def tgt(x,th): return val(x,th)[1:-1]
alias_rows=""
for x in aliases:
    n=x['name']; L=tgt(x,'blue-light'); Dk=tgt(x,'blue-dark')
    if n in BRAND: L=L.replace('blue','‹brand›'); Dk=Dk.replace('blue','‹brand›')
    u=re.sub(r'^Alias\. ','',usage(x))
    alias_rows+=f'''<tr><td><button class="sw" style="background:var(--{n})" data-copy="var(--{n})" aria-label="Copy var(--{n})"></button></td>
<td><code class="tok">{n}</code></td><td><code>{E(L)}</code></td><td><code>{E(Dk)}</code></td><td class="use">{md(u)}</td></tr>'''
themeopts="".join(f'<option value="{th}">{THN[th]}</option>' for th in TH)
themeheads="".join(f'<th>{THN[th]}</th>' for th in TH)
matrix=""
for x in aliases:
    matrix+=f'<tr><td><code class="tok">{x["name"]}</code></td>'+"".join(f'<td><span class="mini" style="background:{resolve(val(x,th))}"></span><code>{tgt(x,th)}</code></td>' for th in TH)+'</tr>'
cards=""
for th in TH:
    cards+=f'''<div class="tcard" data-theme="{th}"><div class="dots"><i style="background:var(--primary)"></i><i style="background:var(--primary-subtle)"></i><i style="background:var(--surface-muted)"></i><i style="background:var(--surface-inverse)"></i></div>
<h4>{THN[th]}</h4><p>Body text in <code style="background:var(--secondary);color:var(--text)">text-muted</code> on <code style="background:var(--secondary);color:var(--text)">surface</code>.</p>
<div class="row"><button type="button" class="dk-btn dk-btn--primary dk-btn--size-sm">Primary</button><button type="button" class="dk-btn dk-btn--outline dk-btn--size-sm">Outline</button><button type="button" class="dk-btn dk-btn--link dk-btn--size-sm">Link</button></div>
<div class="row"><span class="chipx" style="background:var(--success-subtle)"><span style="color:var(--success)">●</span> Success</span><span class="chipx" style="background:var(--warning-subtle)"><span style="color:var(--warning)">●</span> Warning</span><span class="chipx" style="background:var(--danger-subtle)"><span style="color:var(--danger)">●</span> Error</span><span class="chipx" style="background:var(--info-subtle)"><span style="color:var(--info)">●</span> Info</span></div></div>'''
pal=""
for f in fams:
    cells=""
    for x in prims:
        if x['name'].rsplit('-',1)[0]==f and '-' in x['name']:
            h=val(x); s=x['name'].rsplit('-',1)[1]
            fg='#fff' if cr(h,'#ffffff')>=cr(h,'#000000') else '#000'
            cells+=f'<button class="chip" style="background:{h};color:{fg}" data-copy="var(--{x["name"]})" title="{x["name"]} · {h}"><span>{s}</span><span class="hx">{h[1:]}</span></button>'
    pal+=f'<div class="ramp" data-fam="{f}"><div class="rname">{f}</div><div class="chips">{cells}</div></div>'
fam_rows=""
fontname={'sans':'Inter','serif':'Georgia','mono':'Courier New'}
for k,v in t['type']['families'].items():
    if k not in fontname: continue
    fam_rows+=f'<div class="spec"><div class="spec-meta"><code class="tok">font-{k}</code><span>{fontname[k]}</span></div><div class="spec-sample" style="font-family:var(--font-{k})">Aa Bb Cc 0123 — The quick brown fox jumps over the lazy dog</div></div>'
size_rows=""
_fst={x['name']:x['value'] for x in t['fontSize']['tokens']}
for g in [{'styles':[{'name':n,'fontSize':v,'lineHeight':_fst[n+'--line-height']} for n,v in _fst.items() if not n.endswith('--line-height')]}]:
    if True:
        for s in g['styles']:
            fs=s['fontSize']; px=float(fs.replace('rem',''))*16
            size_rows+=f'<tr><td><code class="tok">{s["name"]}</code></td><td class="num">{px:g}px</td><td class="num">{s["lineHeight"]}</td><td class="tsample"><span style="font-size:{fs};line-height:{s["lineHeight"]}">{"Design system" if px<=36 else "Aa"}</span></td></tr>'
DW={'font-normal','font-medium','font-semibold'}
TYT=t['typography']['tokens']
FWT=[x for x in TYT if x['name'].startswith('font-') and not x['name'].startswith('font-stretch')]
LST=[x for x in TYT if x['name'].startswith('tracking-')]
LHT=[x for x in TYT if x['name'].startswith('leading-')]
weights="".join(f'<div class="wt{" wt--def" if x["name"] in DW else ""}"><span style="font-weight:{x["value"]}">Aa</span><code>{x["name"]}</code><span class="num dim">{x["value"]}{" · default" if x["name"] in DW else ""}</span></div>' for x in FWT)
track="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td><span style="letter-spacing:{x["value"]};font-size:18px">DESIGN SYSTEM</span></td></tr>' for x in LST)
lead="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td class="use">{md(re.sub(r"^(?:Tailwind )?`[^`]+`\. ?","",x.get("usage","")))}</td></tr>' for x in LHT)
sp=""
for x in t['spacing']['tokens']:
    v=x['value']; px=1 if v=='1px' else float(v.replace('rem','').replace('px',''))*16
    sp+=f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{v}</td><td class="num">{px:g}px</td><td class="barcell"><span class="bar" style="width:{px}px"></span></td></tr>'
rad="".join(f'<div class="rcard"><div class="rbox" style="border-radius:{x["value"]}"></div><code class="tok">{x["name"]}</code><span class="num dim">{x["value"]}</span></div>' for x in t['radius']['tokens'])
sh="".join(f'<div class="scard"><div class="sbox" style="box-shadow:{x["value"]}"></div><code class="tok">{x["name"]}</code><span class="dim small">{md(re.sub(r"^`[^`]+`\. ?","",x.get("usage","")))}</span></div>' for x in t['shadow']['tokens'] if not x['name'].startswith('text-shadow-') and not x['name'].endswith('-none'))
tsh="".join(f'<div class="ef-ts"><b style="text-shadow:{x["value"]}">Aa Diki</b><code>{x["name"]}</code></div>' for x in t['shadow']['tokens'] if x['name'].startswith('text-shadow-') and x['name']!='text-shadow-none')
opac="".join(f'<div class="ef-op"><i style="opacity:{x["value"]}"></i><code>{x["name"].replace("opacity-","")}</code></div>' for x in t['opacity']['tokens'])
MKART='<svg viewBox="0 0 360 240" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="mkg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="360" height="240" fill="url(#mkg)"/><circle cx="110" cy="120" r="64" fill="#fbbf24"/><rect x="190" y="60" width="120" height="120" rx="20" fill="#f43f5e"/><path d="M0 200 Q90 160 180 200 T360 200 V240 H0Z" fill="#10b981"/></svg>'

plus='<span class="dk-icon">add</span>'
arrow='<span class="dk-icon">arrow_forward</span>'
RIP='<span class="dk-btn__ripples" aria-hidden="true"></span>'   # the ripple layer Button renders (not on the link variant)
def B(label,v='primary',s='md',extra='',d=False):
    return f'<button type="button" class="dk-btn dk-btn--{v}{" dk-btn--destructive" if d else ""} dk-btn--size-{s}" {extra}>{"" if v=="link" else RIP}{label}</button>'
VV=['primary','secondary','outline','ghost','link']
variants="".join(B(n.capitalize(),n) for n in VV)
destr="".join(B(n.capitalize(),n,d=True) for n in VV)
trash='<span class="dk-icon">delete</span>'
def ic(svg,side): return f'<span class="dk-btn__icon dk-btn__icon--{side}" aria-hidden="true">{svg}</span>'
def IB(svg,v='outline',s='md',d=False,label='Add'):
    return f'<button type="button" class="dk-btn dk-btn--{v}{" dk-btn--destructive" if d else ""} dk-btn--size-{s} dk-btn--icon-only" aria-label="{label}">{RIP}{ic(svg,"only")}</button>'
sizes=B('Small',s='sm')+B('Medium')+B('Large',s='lg')
content=B('Label')+B(ic(plus,'left')+'Left icon')+B('Right icon'+ic(arrow,'right'),'outline')+IB(plus)
icononly=IB(plus,s='sm')+IB(plus)+IB(plus,s='lg')+IB(trash,'ghost',d=True,label='Delete')
LAB=lambda t: f'<span class="dk-btn__label">{t}</span>'
micro=(B(LAB('Press and hold'))+B(LAB('Continue')+ic(arrow,'right'),'outline',extra='style="--button-icon-nudge:var(--spacing-0\\.5)"').replace('dk-btn--size-md','dk-btn--size-md dk-btn--icon-right')
  +B(ic(plus,'left')+LAB('Save'),'secondary',extra='data-demo-loading').replace('dk-btn--size-md','dk-btn--size-md dk-btn--icon-left')
  +B(LAB('Delete'),'ghost',d=True))
states=B('Disabled',extra='disabled')+B('Disabled','outline',extra='disabled')
code=E('''const { Button, buttonClass } = window.Diki;

<Button>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button destructive>Delete project</Button>
<Button variant="outline" destructive>Delete</Button>
<Button leftIcon="add">New project</Button>
<Button variant="outline" rightIcon="arrow_forward">Continue</Button>
<Button variant="ghost" icon="settings" aria-label="Settings" />
<Button href="/signup" rightIcon="arrow_forward">Get started</Button>
<label className={buttonClass({ variant: "outline" })}>Upload <input type="file" hidden /></label>''')
ICONS=[('add','Create / add'),('edit','Edit'),('delete','Delete'),('close','Close'),('search','Search'),('settings','Settings'),('more_vert','More'),('more_horiz','More (horizontal)'),('arrow_forward','Next'),('arrow_back','Back'),('expand_more','Open menu'),('chevron_right','Go into'),('home','Home'),('person','Account'),('notifications','Notifications'),('download','Download'),('upload','Upload'),('content_copy','Copy'),('check_circle','Success'),('error','Error'),('warning','Warning'),('info','Info'),('favorite','Favorite'),('visibility','Show')]
TONE={'check_circle':'var(--success)','error':'var(--danger)','warning':'var(--warning)','info':'var(--info)'}
icongrid="".join(f'<button type="button" class="icell" data-copy="{n}" title="Copy {n}"><span class="dk-icon"{(" style=\"color:"+TONE[n]+"\"") if n in TONE else ""}>{n}</span><code>{n}</code><span class="dim small">{l}</span></button>' for n,l in ICONS)
iconsizes="".join(f'<div class="isz"><span class="dk-icon" style="font-size:{s}px">favorite</span><span class="num">{s}px</span><span class="dim small">{u}</span></div>' for s,u in [(14,'sm buttons'),(16,'default buttons'),(20,'lg buttons, rows'),(24,'default'),(40,'empty states')])
import math
def bez(v):
    if v=='linear': return (0,0,1,1)
    return tuple(float(n) for n in re.findall(r'[\d.]+',v))
durrows="".join(f'<div class="drow"><code class="tok">{x["name"]}</code><span class="num dim">{x["value"]}</span><div class="dtrack"><span class="ddot" style="transition-duration:{x["value"]}"></span></div><span class="dim small">{md(re.sub(r"^(?:Tailwind )?`[^`]+`\. ?","",x["usage"]))}</span></div>' for x in t['duration']['tokens'])
easecards=""
for x in t['easing']['tokens']:
    a,b,c2,d=bez(x['value'])
    path=f'M0,100 C{a*100:.0f},{100-b*100:.0f} {c2*100:.0f},{100-d*100:.0f} 100,0'
    easecards+=f'<div class="ecard"><svg viewBox="-6 -6 112 112" aria-hidden="true"><rect x="0" y="0" width="100" height="100" class="egrid"/><path d="{path}" class="ecurve"/></svg><div class="etrack"><span class="edot" style="transition-timing-function:{x["value"]}"></span></div><code class="tok">{x["name"]}</code><span class="num dim small">{x["value"]}</span><span class="dim small">{md(re.sub(r"^(?:Tailwind )?`[^`]+`\. ?","",x["usage"]))}</span></div>'
tprows="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="small">{("everything in <code>transition-colors</code>, plus " if x["name"]=="transition" else "")+E(x["value"])}</td><td class="use">{md((lambda u:u[:1].upper()+u[1:])(re.sub(r"^\(default\): ?","Default: ",re.sub(r"^(?:Tailwind )?`[^`]+` ?:? ?","",x["usage"]))))}</td></tr>' for x in t['transitionProperty']['tokens'])
ANIDEMO={'animate-spin':'<span class="dk-icon animate-spin" style="font-size:32px">progress_activity</span>',
'animate-ping':'<span class="pingwrap"><span class="animate-ping pingring"></span><span class="pingdot"></span></span>',
'animate-pulse':'<div class="skel animate-pulse"><i></i><i></i><i style="width:60%"></i></div>',
'animate-bounce':'<span class="dk-icon animate-bounce" style="font-size:32px">arrow_downward</span>'}
anicards="".join(f'<div class="acard"><div class="astage">{ANIDEMO[x["name"]]}</div><code class="tok">{x["name"]}</code><span class="num dim small">{E(x["value"])}</span><span class="dim small">{md((lambda u:u[:1].upper()+u[1:])(re.sub(r"^(?:Tailwind )?`[^`]+`:? ?","",x["usage"])))}</span></div>' for x in t['animation']['tokens'] if x['name'] in ANIDEMO)
scr=[x for x in t['layout']['tokens'] if x['name'].startswith('screen-')]
bpmarks="".join(f'<div class="bpmark" style="left:{int(x["value"][:-2])/1600*100:.2f}%"><span class="bptick"></span><code>{x["name"].replace("screen-","")}</code><span class="num dim small">{x["value"]}</span></div>' for x in scr)
bprows="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td><code>@media (min-width: {x["value"]})</code></td><td class="use">{md(x["usage"].split(". ",1)[-1].rsplit(" Container",1)[0])}</td></tr>' for x in scr)
lay=t['layout']['tokens']
zt=[x for x in lay if re.fullmatch(r'z-\d+',x['name']) and x['value']!='0']
zlayers="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td class="use">{md(x["usage"].replace("Layer: ","").split(" Use the named")[0])}</td></tr>' for x in lay if re.fullmatch(r'z-[a-z]+',x['name']) and x['name']!='z-auto')
ctl=[x for x in t['sizing']['tokens'] if x['name'].startswith('control-height-')]
ctlrows="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td class="num">{float(x["value"][:-3])*16:g}px</td><td><span class="bar" style="width:{float(x["value"][:-3])*16}px;height:{float(x["value"][:-3])*16}px;border-radius:var(--rounded-md)"></span></td><td class="use">{md(x["usage"])}</td></tr>' for x in ctl)
zstack="".join(f'<div class="zlayer" style="z-index:{x["value"]};left:{i*72}px;top:{(len(zt)-1-i)*38}px"><code class="tok">{x["name"]}</code><span class="small">{E(x["usage"].split(". ",1)[-1])}</span></div>' for i,x in enumerate(zt))
aspects="".join(f'<div class="aspcard"><div class="aspbox" style="aspect-ratio:{x["value"] if x["value"]!="auto" else "auto"}">{"" if x["value"]!="auto" else "<span class=\"small dim\">content height</span>"}</div><code class="tok">{x["name"]}</code><span class="num dim small">{x["value"]}</span><span class="dim small">{E(x["usage"].split(". ",1)[-1])}</span></div>' for x in lay if x['name'].startswith('aspect-'))
colrows="".join(f'<tr><td><code class="tok">{x["name"]}</code></td><td class="num">{x["value"]}</td><td class="num">{float(x["value"][:-3])*16:g}px</td></tr>' for x in lay if x['name'].startswith('columns-'))
import random
random.seed(4)
coltiles="".join(f'<div class="ctile" style="height:{h}px"><span class="num small">{i+1}</span></div>' for i,h in enumerate([random.choice([56,72,96,120,64,88]) for _ in range(12)]))
szt=t['sizing']['tokens']
ctn=[x for x in szt if x['name'].startswith('container-')]
def cu(x):
    u=x['usage']; return u.rsplit('. ',1)[-1] if x['name']!='container-prose' else 'Body text at about 65 characters per line.'
mwbars="".join(f'<div class="mwrow"><code class="tok">{x["name"]}</code><span class="num dim">{x["value"]}{(" · "+str(int(float(x["value"][:-3])*16))+"px") if x["value"].endswith("rem") else ""}</span><div class="mwtrack"><span class="mwbar" style="width:{(float(x["value"][:-3])/80*100) if x["value"].endswith("rem") else 560/1280*100:.2f}%"></span></div><span class="dim small">{md(cu(x))}</span></div>' for x in ctn)
frt=[x for x in szt if re.match(r'sizing-\d+-\d+$',x['name'])]
fracs="".join(f'<div class="frrow"><code class="tok">{x["name"].replace("sizing-","").replace("-","/")}</code><span class="num dim">{float(x["value"][:-1]):.4g}%</span><div class="frtrack"><span class="frbar" style="width:{x["value"]}"></span></div></div>' for x in frt)
kwt=[x for x in szt if x['name'].startswith('sizing-') and not re.match(r'sizing-\d',x['name'])]
kwrows="".join(f'<tr><td><code class="tok">{x["name"].replace("sizing-","")}</code></td><td><code>{x["value"]}</code></td><td class="use">{md(x["usage"])}</td></tr>' for x in kwt)
bmopts="".join(f'<option value="{x["name"][8:]}"{" selected" if x["name"][8:]=="4" else ""}>{x["name"][8:]} · {x["value"]}</option>' for x in t['spacing']['tokens'])
bmopts2=bmopts.replace(' selected','').replace('value="6">','value="6" selected>')
n_alias=len(aliases); n_prim=len(prims)
_bt=json.load(open(P+'components/Button/button.tokens.json'))['button']
def _bdef(v): return 'transparent' if isinstance(v,dict) else v[1:-1].split('.',1)[1].replace('_','.')
btntokens="".join(f'<tr><td><code class="tok">--button-{n}</code></td><td><code>{_bdef(x["$value"])}</code></td><td class="use">{md(x["$description"])}</td></tr>' for g in ['color','spacing','sizing','border','motion'] for n,x in _bt[g].items())
import importlib.util as _ilu
_spec=_ilu.spec_from_file_location('icon_build', os.path.join(HERE,'..','icons','build.py')); _ib=_ilu.module_from_spec(_spec); _spec.loader.exec_module(_ib)
_custom=_ib.read_registry(open(P+'components/bundle.js',encoding='utf-8').read())
customicons="".join(f'<button type="button" class="icell" data-copy="{n}" title="Copy {n}"><span class="dk-icon dk-icon--custom" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor" focusable="false">{b}</svg></span><code>{n}</code></button>' for n,b in sorted(_custom.items())) or '<p class="dim small">None yet. Add SVGs to <code>assets/Icons/</code> and run <code>python3 tools/icons/build.py</code>.</p>'

# ---- changelog: CHANGELOG.md (Keep a Changelog) as a page, newest first
def _inl(t):
    t=E(t)
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',t)
    t=re.sub(r'\[([^\]]+)\]\((https?://[^)\s]+)\)',r'<a href="\2" target="_blank" rel="noopener">\1</a>',t)
    return t
def _blocks(lines):
    out=[];i=0
    while i<len(lines):
        l=lines[i]
        if not l.strip(): i+=1; continue
        if l.startswith('### '): out.append(f'<h4 class="cl-kind cl-{l[4:].strip().lower().split()[0]}">{_inl(l[4:].strip())}</h4>'); i+=1; continue
        if l.startswith('- '):
            items=[]
            while i<len(lines) and lines[i].startswith('- '): items.append(_inl(lines[i][2:].strip())); i+=1
            out.append('<ul class="cl-list">'+''.join(f'<li>{x}</li>' for x in items)+'</ul>'); continue
        if l.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'): rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i+=1
            rows=[r for r in rows if not all(re.fullmatch(r':?-+:?',c) for c in r)]
            th=''.join(f'<th>{_inl(c)}</th>' for c in rows[0]); tb=''.join('<tr>'+''.join(f'<td class="small">{_inl(c)}</td>' for c in r)+'</tr>' for r in rows[1:])
            out.append(f'<div class="tablewrap"><table><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table></div>'); continue
        para=[]
        while i<len(lines) and lines[i].strip() and not lines[i].startswith(('- ','|','### ')): para.append(lines[i].strip()); i+=1
        out.append(f'<p class="desc">{_inl(" ".join(para))}</p>')
    return ''.join(out)
_cl=open(P+'CHANGELOG.md',encoding='utf-8').read()
_parts=re.split(r'^## ',_cl,flags=re.M)
_intro=_parts[0].split('\n',1)[1] if '\n' in _parts[0] else ''
_rels=[]
for _p in _parts[1:]:
    _head,_,_body=_p.partition('\n')
    _m=re.match(r'\[([^\]]+)\](?:\s*-\s*(\S+))?',_head.strip())
    if not _m: continue
    _ver,_date=_m.group(1),_m.group(2)
    if _ver.lower()=='unreleased': continue   # the docs show only versions people can install; Unreleased stays in CHANGELOG.md
    _rels.append((_ver,_date,_blocks(_body.split('\n'))))
_vid=lambda v: 'v'+re.sub(r'[^0-9a-z]+','-',v.lower())
_current=next((v for v,d,_ in _rels if v.lower()!='unreleased'),'')
changelog=(f'<h2>Changelog</h2>{_blocks(_intro.split(chr(10)))}'
  +f'<p class="desc">Current version: <b>{_current}</b>, also in <code>package.json</code>, every file\'s header and <code>Diki.version</code>. The source is <code>CHANGELOG.md</code> in the design system.</p>'
  +'<nav class="cl-toc" aria-label="Releases">'+''.join(f'<a href="#{_vid(v)}">{"Unreleased" if v.lower()=="unreleased" else v}</a>' for v,_,_ in _rels)+'</nav>'
  +''.join(f'<article class="cl-rel" id="{_vid(v)}"><h3><span class="cl-ver">{"Unreleased" if v.lower()=="unreleased" else v}</span>{f"<time datetime={chr(34)}{d}{chr(34)}>{d}</time>" if d else ""}</h3>{body}</article>' for v,d,body in _rels))

# ---- Loader page: the component's markup, written out (the docs site doesn't run React)
_pxn=[0]
PXSTEPS={"sweep": [0, 2, 4, 0, 2, 4, 0, 2, 4], "fall": [0, 0, 0, 2, 2, 2, 4, 4, 4], "rise": [4, 4, 4, 2, 2, 2, 0, 0, 0], "snake": [0, 1, 2, 5, 4, 3, 6, 7, 8], "spiral": [0, 1, 2, 7, 8, 3, 6, 5, 4], "cross": [0, 7, 0, 7, 7, 7, 0, 7, 0], "checker": [0, 7, 0, 7, 0, 7, 0, 7, 0]}
def PXCLS(i,pattern):
    r,c=divmod(i,3)
    return f'dk-loader__px--d{r+c}' if pattern in ('','wave') else f'dk-loader__px--r{i}' if pattern=='random' else f'dk-loader__px--s{PXSTEPS[pattern][i]}'
def PXART(pattern=''):
    _pxn[0]+=1; mid=f'dk-pxdoc{_pxn[0]}'
    return (f'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white"/><path class="dk-loader__px-cut" d="M16 0V48M32 0V48M0 16H48M0 32H48" transform="scale(0.5)"/></mask><g mask="url(#{mid})">'
      +''.join(f'<rect class="dk-loader__px {PXCLS(r*3+c,pattern)}" x="{c*8}" y="{r*8}" width="8" height="8"/>' for r in range(3) for c in range(3))+'</g><path class="dk-loader__px-divider" d="M16 0V48M32 0V48M0 16H48M0 32H48" transform="scale(0.5)"/></svg>')
def SPN(v='ring',s='md',tone='',extra='',text='',pattern='',glow=False):
    cls=f'dk-loader dk-loader--{v} dk-loader--size-{s}'+(f' dk-loader--{tone}' if tone else '')+(f' dk-loader--pattern-{pattern}' if pattern and pattern!='wave' else '')+(' dk-loader--glow' if glow else '')
    if v=='text': return f'<span class="{cls}" role="progressbar" aria-label="{E(text)}" {extra}><span class="dk-loader__label" aria-hidden="true">{E(text)}</span></span>'
    art=PXART(pattern) if v=='pixel' else ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g transform="scale(0.625)">'+''.join(f'<line class="dk-loader__spoke" x1="19.2" y1="4" x2="19.2" y2="9.6" transform="rotate({-45*k} 19.2 19.2)"/>' for k in range(8))+'</g></svg>') if v=='spokes' else ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+''.join(f'<circle class="dk-loader__dot" cx="{x}" cy="12" r="2.5"/>' for x in (4,12,20))+'</svg>') if v=='dots' else \
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle class="dk-loader__track" cx="12" cy="12" r="10"/><circle class="dk-loader__arc" cx="12" cy="12" r="10" pathLength="100" stroke-dasharray="25 150"/></svg>'
    lab=f'<span class="dk-loader__label" aria-hidden="true">{E(text)}</span>' if text else ''
    return f'<span class="{cls}" role="progressbar" aria-label="{E(text) if text else "Loading"}" {extra}><span class="dk-loader__art">{art}</span>{lab}</span>'
def SK(shape='text',s='md',lines=1,tone='',cls='',label=''):
    c=f'dk-loader dk-loader--skeleton dk-loader--shape-{shape} dk-loader--size-{s}'+(f' dk-loader--{tone}' if tone else '')+(f' {cls}' if cls else '')
    a=f'role="progressbar" aria-label="{E(label)}"' if label else 'aria-hidden="true"'
    bones=''.join('<span class="dk-loader__line"><span class="dk-loader__bone"></span></span>' for _ in range(lines)) if shape=='text' else '<span class="dk-loader__bone"></span>'
    return f'<span class="{c}" {a} data-component="loader" data-variant="skeleton" data-shape="{shape}">{bones}</span>'
px_patterns='<div class="sp-pats">'+''.join(f'<span class="sp-cell">{SPN("pixel","lg",pattern=p,glow=True)}<code>{p}</code></span>' for p in ["wave", "random", "sweep", "fall", "rise", "snake", "spiral", "cross", "checker"])+'</div>'
def SROW(label,items): return f'<div class="sp-row"><span class="sp-lbl">{label}</span>{items}</div>'
spin_demo=(SROW('Ring',''.join(f'<span class="sp-cell">{SPN("ring",s)}<code>{s}</code></span>' for s in ('sm','md','lg')))
  +SROW('Spokes',''.join(f'<span class="sp-cell">{SPN("spokes",s)}<code>{s}</code></span>' for s in ('sm','md','lg'))+f'<span class="sp-cell">{SPN("spokes","md","primary")}<code>primary</code></span>')
  +SROW('Dots',''.join(f'<span class="sp-cell">{SPN("dots",s)}<code>{s}</code></span>' for s in ('sm','md','lg')))
  +SROW('Pixel',''.join(f'<span class="sp-cell">{SPN("pixel",s)}<code>{s}</code></span>' for s in ('sm','md','lg'))+f'<span class="sp-cell">{SPN("pixel","lg","primary")}<code>primary</code></span>'+f'<span class="sp-cell">{SPN("pixel","lg",pattern="random")}<code>random</code></span>')
  +SROW('Tones',''.join(f'<span class="sp-cell">{SPN("ring","md",t)}<code>{t or "neutral"}</code></span>' for t in ('','primary','muted'))+f'<span class="sp-cell">{SPN("dots","md","primary")}<code>primary</code></span>')
  +SROW('Text',''.join(f'<span class="sp-cell">{SPN("text",s,text=t)}<code>{s}</code></span>' for s,t in (('sm','Saving…'),('md','Thinking…'),('lg','Generating summary…'))))
  +SROW('Skeleton','<span class="sp-cell sp-skc">'+SK('text','md',1,label='Loading')+'<code>text</code></span><span class="sp-cell sp-skc">'+SK('text','md',3)+'<code>lines={3}</code></span><span class="sp-cell">'+SK('circle','lg')+'<code>circle</code></span><span class="sp-cell sp-skc">'+SK('rect','md',cls='h-16')+'<code>rect</code></span>')
  +SROW('Composed','<div class="sp-card" aria-busy="true">'+SK('rect','md',cls='h-28',label='Loading article')+'<div class="sp-card-row">'+SK('circle','lg')+SK('text','md',2)+'</div></div><div class="sp-card" aria-busy="true"><div class="sp-card-row">'+SK('circle','md',label='Loading comments')+SK('text','sm',3)+'</div><div class="sp-card-row">'+SK('circle','md')+SK('text','sm',2)+'</div></div>')
  +'<div class="sp-row sp-scrim"><span class="sp-lbl">Inverse</span>'+SPN('ring','md','inverse')+SPN('spokes','md','inverse')+SPN('dots','md','inverse')+SPN('pixel','md','inverse',glow=True)+SPN('text','md','inverse',text='Uploading photo…')+'<span class="sp-skc">'+SK('text','md',2,'inverse')+'</span></div>'
  +SROW('In use','<span class="sp-inline">'+SPN('ring','sm','muted').replace('role="progressbar" aria-label="Loading"','aria-hidden="true"')+'Loading projects…</span>'+B(LAB('Save changes')+'<span class="dk-btn__loader" aria-hidden="true">'+SPN('ring','md','').replace('class="dk-loader ','class="dk-loader dk-btn__spinner ').replace('role="progressbar" aria-label="Loading"','aria-hidden="true"')+'</span>',extra='aria-busy="true" aria-disabled="true"').replace('dk-btn--size-md"','dk-btn--size-md dk-btn--loading dk-btn--loading-cover"')))
_st=json.load(open(P+'components/Loader/loader.tokens.json'))['loader']
spintokens="".join(f'<tr><td><code class="tok">--loader-{n}</code></td><td><code>{_bdef(x["$value"])}</code></td><td class="use">{md(x["$description"])}</td></tr>' for g in ['color','sizing','shape','motion'] for n,x in _st[g].items())
# ---- Badge page: the component's markup, written out
BSTATUS=['neutral','primary','success','warning','danger','info']
BPAL=['red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose']
def BDG(label,variant='subtle',tone='neutral',size='md',dot=False,icon=None,count=None,remove=False,tag='span',state='',loading=False,disabled=False,ping=False):
    c=f'dk-badge dk-badge--{variant} dk-badge--tone-{tone}'+(' dk-badge--count' if count is not None else '')+(' dk-badge--lead' if (icon or dot) and count is None else '')+(' dk-badge--ping' if ping and dot and not icon and count is None else '')+(' dk-badge--removable' if remove else '')+(' dk-badge--interactive' if tag!='span' else '')+(' dk-badge--loading' if loading else '')+(f' bd-is-{state}' if state else '')
    lead=f'<span class="dk-badge__icon" aria-hidden="true"><span class="dk-icon" aria-hidden="true" translate="no">{icon}</span></span>' if icon else ('<span class="dk-badge__icon dk-badge__icon--dot" aria-hidden="true"><span class="dk-badge__dot"></span></span>' if dot else '')
    rm=f'<button type="button" class="dk-badge__remove" aria-label="Remove {E(label)}"><span class="dk-icon" aria-hidden="true" translate="no">close</span></button>' if remove else ''
    spin='<span class="dk-badge__loader" aria-hidden="true"><span class="dk-loader dk-loader--ring dk-loader--size-md" aria-hidden="true"><span class="dk-loader__art"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle class="dk-loader__track" cx="12" cy="12" r="10"/><circle class="dk-loader__arc" cx="12" cy="12" r="10" pathLength="100" stroke-dasharray="25 150"/></svg></span></span></span>' if loading else ''
    attrs=(' type="button"' if tag=='button' else '')+(' disabled' if disabled else '')+(''if tag=='button' else ' href="#badge"' if tag=='a' else '')+(' data-interactive=""' if tag!='span' else '')+(' aria-busy="true"'+(' aria-disabled="true"' if tag!='span' else '') if loading else '')
    rip='<span class="dk-badge__ripples" aria-hidden="true"></span>' if tag!='span' else ''
    return f'<{tag} class="{c}" data-component="badge" data-variant="{variant}" data-tone="{tone}"{attrs}>{rip}{lead}<span class="dk-badge__label">{E(str(label if count is None else count))}</span>{rm}{spin}</{tag}>'
def IND(tone='danger',size='md',label=None,ping=False):
    a=f' role="img" aria-label="{E(label)}"' if label else ' aria-hidden="true"'
    return f'<span class="dk-badge dk-badge--indicator dk-badge--tone-{tone}'+(' dk-badge--ping' if ping else '')+f'" data-component="badge" data-variant="indicator" data-tone="{tone}"{a}></span>'
def ONICON(icon,size='md',tone='danger',label=''):
    return f'<span class="bd-ind" role="img" aria-label="{E(label)}"><span class="dk-icon" aria-hidden="true" translate="no">{icon}</span>{IND(tone,size)}</span>'
def BROW(label,items): return f'<div class="bd-row"><span class="sp-lbl">{label}</span><div class="bd-items">{items}</div></div>'
badge_demo=(''.join(BROW(v.capitalize(),''.join(BDG(t.capitalize(),v,t) for t in BSTATUS)) for v in ('subtle','solid','outline'))
  +BROW('Palette',''.join(BDG(t.capitalize(),'subtle',t,'sm') for t in BPAL))
  )
badge_extras=(BROW('Dot',BDG('Online','subtle','success',dot=True)+BDG('Away','subtle','warning',dot=True)+BDG('Offline','outline','neutral',dot=True))
  +BROW('Icon',BDG('Verified','subtle','primary',icon='verified')+BDG('Pending','subtle','warning',icon='schedule')+BDG('Failed','solid','danger',icon='error'))
  +BROW('Count',BDG('','solid','danger',count=3)+BDG('','solid','primary',count='99+')+BDG('','subtle','neutral',count=12)+'<span class="bd-inline"><span class="dk-icon" aria-hidden="true" translate="no">notifications</span>'+BDG('','solid','danger','sm',count=5)+'</span>')
  +BROW('Removable',''.join(BDG(t,'subtle','violet',remove=True) for t in ('Design','Research','Engineering')))
  +BROW('Ping',BDG('Live','solid','danger',dot=True,ping=True)+BDG('Recording','subtle','danger',dot=True,ping=True)+BDG('In a call','subtle','success','sm',dot=True,ping=True)+'<span class="bd-ind" role="img" aria-label="Server, live"><span class="dk-icon" aria-hidden="true" translate="no">dns</span>'+IND('success','md',ping=True)+'</span>'+IND('danger','md',ping=True))
  +BROW('Indicator',ONICON('notifications','md','danger','Notifications, new')+ONICON('mail','sm','primary','Mail, new')+'<span class="bd-ind bd-ind--avatar" role="img" aria-label="Dana, online"><span class="bd-avatar" aria-hidden="true">DK</span>'+IND('success','md')+'</span>'+''.join(IND(t,'md') for t in ('neutral','primary','success','warning','danger','info'))+IND('danger','sm')))
def BSTATES(v,t): return BROW(v.capitalize(),BDG('Rest',v,t,tag='button')+BDG('Hover',v,t,tag='button',state='hover')+BDG('Active',v,t,tag='button',state='active')+BDG('Focus',v,t,tag='button',state='focus')+BDG('Loading',v,t,tag='button',loading=True)+BDG('Disabled',v,t,tag='button',disabled=True))
badge_states=BSTATES('subtle','primary')+BSTATES('solid','primary')+BSTATES('outline','primary')+BROW('Try it',BDG('Open',tag='button',tone='success',dot=True)+BDG('Docs',tag='a',tone='info',icon='open_in_new')+BDG('In review','solid','warning',tag='button'))
_bdt=json.load(open(P+'components/Badge/badge.tokens.json'))['badge']
badgetokens="".join(f'<tr><td><code class="tok">--badge-{n}</code></td><td><code>{_bdef(x["$value"])}</code></td><td class="use">{md(x["$description"])}</td></tr>' for g in ['sizing','spacing','border','state','motion'] for n,x in _bdt[g].items())
tpl=open(HERE+'template.html').read()

# ---- filters
FLART='<svg viewBox="0 0 300 200" role="img" aria-label="Sample illustration"><circle cx="92" cy="98" r="62" fill="var(--primary)"/><rect x="138" y="52" width="104" height="104" rx="18" fill="var(--amber-400)"/><path d="M196 172 L246 92 L286 172 Z" fill="var(--rose-500)"/><circle cx="92" cy="98" r="22" fill="var(--surface)"/><rect x="20" y="164" width="120" height="14" rx="7" fill="var(--emerald-500)"/></svg>'
MINI='<svg viewBox="0 0 84 84" aria-hidden="true"><circle cx="34" cy="38" r="24" fill="var(--blue-500)"/><rect x="40" y="36" width="34" height="34" rx="6" fill="var(--amber-400)"/><path d="M14 74 L30 50 L46 74 Z" fill="var(--rose-500)"/></svg>'
ft=t['filters']['tokens']
blurs="".join(f'<div class="flcard"><div class="flimg">{MINI.replace('<svg ','<svg style="filter:blur('+x["value"]+')" ')}</div><code class="tok">{x["name"]}</code><span class="num dim">{x["value"]}</span></div>' for x in ft if x['name'].startswith('blur-'))
drops="".join(f'<div class="flcard"><div class="flimg">{MINI.replace('<svg ','<svg style="filter:drop-shadow('+x["value"]+')" ')}</div><code class="tok">{x["name"]}</code><span class="num dim small">{E(x["value"])}</span></div>' for x in ft if x['name'].startswith('drop-shadow-'))
cf=[('none','none'),('grayscale','grayscale(100%)'),('sepia','sepia(100%)'),('invert','invert(100%)'),('saturate-0','saturate(0%)'),('saturate-200','saturate(200%)'),('brightness-50','brightness(50%)'),('brightness-150','brightness(150%)'),('contrast-50','contrast(50%)'),('contrast-200','contrast(200%)'),('hue-rotate-90','hue-rotate(90deg)'),('-hue-rotate-90','hue-rotate(-90deg)')]
cfilters="".join(f'<div class="flcard"><div class="flimg">{MINI.replace('<svg ','<svg style="filter:'+v+'" ')}</div><code class="tok">{"(none)" if n=="none" else n}</code></div>' for n,v in cf)

perspc="".join(f'<div class="flcard"><div class="tf-pcard" style="perspective:{x["value"]}"><div class="tf-ptile"></div></div><code class="tok">{x["name"]}</code><span class="num dim">{x["value"]}</span></div>' for x in t['transforms']['tokens'] if x['name'].startswith('perspective-'))+'<div class="flcard"><div class="tf-pcard"><div class="tf-ptile"></div></div><code class="tok">perspective-none</code><span class="num dim">none</span></div>'

STAR='<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" stroke-linejoin="round"/>'
strokes="".join(f'<div class="flcard"><div class="sv-scard"><svg viewBox="0 0 24 24" width="24" height="24" style="stroke-width:{x["value"]}" aria-hidden="true">{STAR}</svg><svg viewBox="0 0 24 24" width="48" height="48" style="stroke-width:{x["value"]}" aria-hidden="true">{STAR}</svg></div><code class="tok">{x["name"].replace("stroke-width-","stroke-")}</code><span class="num dim">{x["value"]}</span></div>' for x in t['borders']['tokens'] if x['name'].startswith('stroke-width-'))
NCLASS=22470
out=(tpl.replace('%%NCLASS%%','{:,}'.format(NCLASS)).replace('%%STROKES%%',strokes).replace('%%TSHADOW%%',tsh).replace('%%OPAC%%',opac).replace('%%MKART%%',MKART).replace('%%PERSP%%',perspc).replace('%%FLART%%',FLART).replace('%%BLURS%%',blurs).replace('%%DROPS%%',drops).replace('%%CFILTERS%%',cfilters).replace('%%DSCSS%%',dscss).replace('%%BTNCSS%%',bcss).replace('%%ALIASROWS%%',alias_rows).replace('%%THEMEOPTS%%',themeopts).replace('%%THEMEHEADS%%',themeheads).replace('%%MATRIX%%',matrix).replace('%%THEMECARDS%%',cards).replace('%%PALETTE%%',pal)
 .replace('%%FAMS%%',fam_rows).replace('%%SIZES%%',size_rows).replace('%%WEIGHTS%%',weights).replace('%%TRACK%%',track).replace('%%LEAD%%',lead)
 .replace('%%SPACING%%',sp).replace('%%BMOPTS%%',bmopts).replace('%%BMOPTS2%%',bmopts2).replace('%%RADIUS%%',rad).replace('%%SHADOW%%',sh).replace('%%VARIANTS%%',variants).replace('%%DESTR%%',destr).replace('%%BSIZES%%',sizes)
 .replace('%%STATES%%',states).replace('%%MWBARS%%',mwbars).replace('%%FRACS%%',fracs).replace('%%KWROWS%%',kwrows).replace('%%BPMARKS%%',bpmarks).replace('%%BPROWS%%',bprows).replace('%%ZSTACK%%',zstack).replace('%%ZLAYERS%%',zlayers).replace('%%CTLROWS%%',ctlrows).replace('%%ASPECTS%%',aspects).replace('%%COLROWS%%',colrows).replace('%%COLTILES%%',coltiles).replace('%%DURROWS%%',durrows).replace('%%EASECARDS%%',easecards).replace('%%TPROWS%%',tprows).replace('%%ANICARDS%%',anicards).replace('%%ICONGRID%%',icongrid).replace('%%ICONSIZES%%',iconsizes).replace('%%CONTENT%%',content).replace('%%ICONONLY%%',icononly).replace('%%CODE%%',code).replace('%%BTNTOKENS%%',btntokens).replace('%%CUSTOMICONS%%',customicons).replace('%%MICRO%%',micro).replace('%%CHANGELOG%%',changelog).replace('%%SPINDEMO%%',spin_demo).replace('%%PXPATTERNS%%',px_patterns).replace('%%SPINTOKENS%%',spintokens).replace('%%BADGEDEMO%%',badge_demo).replace('%%BADGEEXTRAS%%',badge_extras).replace('%%BADGESTATES%%',badge_states).replace('%%BADGETOKENS%%',badgetokens).replace('%%NALIAS%%',str(n_alias)).replace('%%NPRIM%%',str(n_prim)).replace('%%NFAM%%',str(len(fams))))
assert '%%' not in out
open(W+'ds-docs.html','w').write(out)
print(n_alias,n_prim,len(fams),len(out))
