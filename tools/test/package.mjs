// The package as a project installs it (npm run build first): every file in package.json's exports exists,
// the components import as ES modules and render on the server (Next.js, Remix) with no browser globals,
// the types build, and bundle.css is exactly components.css followed by utilities.css.
//   node tools/test/package.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { HERE, PROJECT, read, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const pkg = JSON.parse(read('package.json'));

// 1. exports
const targets = [];
for (const [k, v] of Object.entries(pkg.exports)) for (const f of typeof v === 'string' ? [v] : Object.values(v)) if (!f.includes('*')) targets.push([k, f]);
const absent = targets.filter(([, f]) => !fs.existsSync(path.join(PROJECT, f)));
t('every file package.json exports exists', !absent.length, absent.map(([k, f]) => `${k} → ${f}`).join(', '));
const index = read('src/index.ts');
const exported = /export \{ ([^}]*) \};/.exec(index)[1].split(', ');
const typed = new Set([...index.matchAll(/(\w+): typeof \w+;/g)].map((m) => m[1]));
const browserTs = read('src/browser.ts');
const untyped = exported.filter((n) => !typed.has(n)), unbundled = exported.filter((n) => !new RegExp(`\\b${n}: Serupa\\.${n}\\b`).test(browserTs));
t('every export is on window.Serupa (src/browser.ts) and in its type (src/index.ts)', !untyped.length && !unbundled.length, `not typed: ${untyped.join(', ')}; not in browser.ts: ${unbundled.join(', ')}`);
t('react and react-dom are peer dependencies (one React in the app)', pkg.peerDependencies && pkg.peerDependencies.react && pkg.peerDependencies['react-dom'] && !(pkg.dependencies || {}).react);

// 2. server rendering: no window, document or navigator while importing and rendering
for (const g of ['window', 'document']) t(`no ${g} in Node`, typeof globalThis[g] === 'undefined');
let D = null, err = null;
try { D = await import(pathToFileURL(path.join(PROJECT, 'dist', 'index.js')).href); } catch (e) { err = e; }
t('dist/index.js imports in Node (no browser globals at load time)', D, err && err.stack);
if (D) {
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const h = React.createElement;
  const warnings = [];
  const keep = [console.error, console.warn];
  console.error = console.warn = (...a) => warnings.push(a.map(String).join(' ').split('\n')[0]);
  const cases = {
    Badge: h(D.Badge, { tone: 'success', dot: true }, 'Live'),
    Button: h(D.Button, { leftIcon: 'add', loading: true }, 'Save'),
    'Button (link)': h(D.Button, { href: '/docs', variant: 'link' }, 'Docs'),
    Checkbox: h(D.Checkbox, { defaultChecked: true, description: 'Weekly' }, 'Email me'),
    Field: h(D.Field, { label: 'Name', hint: 'As on your ID', error: 'Required', required: true }, h(D.Input, {})),
    Icon: h(D.Icon, { name: 'home', 'aria-label': 'Home' }),
    Input: h(D.Input, { leftIcon: 'search', placeholder: 'Search' }),
    Loader: h(D.Loader, { variant: 'pixel', delay: 0 }),
    RadioGroup: h(D.RadioGroup, { defaultValue: 'a', 'aria-label': 'Plan' }, h(D.Radio, { value: 'a' }, 'A'), h(D.Radio, { value: 'b' }, 'B')),
    Select: h(D.Select, { placeholder: 'Pick one', options: ['One', 'Two'] }),
    Switch: h(D.Switch, { defaultChecked: true }, 'Wi-Fi'),
    Textarea: h(D.Textarea, { autoResize: true, showCount: true, maxLength: 200 }),
    Accordion: h(D.Accordion, { defaultValue: 'a' }, h(D.AccordionItem, { value: 'a', title: 'Shipping' }, 'Free over $50')),
    Alert: h(D.Alert, { tone: 'warning', title: 'Heads up', onClose() {} }, 'Check your details.'),
    Avatar: h(D.Avatar, { name: 'Ada Lovelace', status: 'online' }),
    AvatarGroup: h(D.AvatarGroup, { max: 2 }, h(D.Avatar, { name: 'Ada Lovelace' }), h(D.Avatar, { name: 'Alan Turing' }), h(D.Avatar, { name: 'Grace Hopper' })),
    Breadcrumb: h(D.Breadcrumb, null, h(D.BreadcrumbItem, { href: '/' }, 'Home'), h(D.BreadcrumbItem, null, 'Settings')),
    ButtonGroup: h(D.ButtonGroup, { attached: true }, h(D.Button, null, 'Day'), h(D.ToggleButton, { pressed: true }, 'Week')),
    Calendar: h(D.Calendar, { defaultValue: '2026-10-18', locale: 'en-GB' }),
    Card: h(D.Card, null, h(D.CardHeader, null, 'Title'), h(D.CardBody, null, 'Body'), h(D.CardFooter, null, 'Footer')),
    Carousel: h(D.Carousel, { label: 'Photos' }, h('div', null, 'One'), h('div', null, 'Two')),
    Combobox: h(D.Combobox, { 'aria-label': 'Country', options: ['France', { value: 'de', label: 'Germany' }] }),
    DatePicker: h(D.DatePicker, { 'aria-label': 'Date', defaultValue: '2026-10-18', name: 'date' }),
    DateRangePicker: h(D.DateRangePicker, { 'aria-label': 'Dates' }),
    Dialog: h(D.Dialog, { open: true, title: 'Invite', onOpenChange() {}, footer: h(D.Button, null, 'Send') }, 'Body'),
    Drawer: h(D.Drawer, { open: true, title: 'Filters', onOpenChange() {} }, 'Body'),
    EmptyState: h(D.EmptyState, { icon: 'folder_open', title: 'No projects yet', description: 'Create one to start.' }),
    Fab: h(D.Fab, { icon: 'add', label: 'New' }),
    FileUpload: h(D.FileUpload, { accept: 'image/*', multiple: true }),
    Image: h(D.Image, { src: '/a.png', alt: 'A lake', ratio: '16/9', viewable: true }),
    IconButton: h(D.IconButton, { icon: 'close', label: 'Close' }),
    Kbd: h(D.Kbd, null, 'mod+k'),
    Layout: h(D.Container, null, h(D.Stack, { gap: 4 }, h(D.Heading, { level: 2 }, 'Title'), h(D.Divider), h(D.Grid, { columns: 2 }, h(D.Text, { tone: 'muted' }, 'a'), h(D.Text, null, 'b')))),
    Link: h(D.Link, { href: 'https://example.com', external: true }, 'Docs'),
    List: h(D.List, null, h(D.ListItem, { title: 'Inbox', description: '3 new' })),
    Menu: h(D.Menu, { trigger: h(D.Button, null, 'Actions') }, h(D.MenuGroup, { label: 'File' }, h(D.MenuItem, null, 'Rename')), h(D.MenuSeparator), h(D.MenuItem, null, 'Delete')),
    Navbar: h(D.Navbar, { brand: 'Serupa' }, h(D.NavbarLink, { href: '/', active: true }, 'Home')),
    NumberInput: h(D.NumberInput, { 'aria-label': 'Quantity', defaultValue: 2, min: 0 }),
    Pagination: h(D.Pagination, { count: 20, page: 5, onPageChange() {} }),
    PasswordInput: h(D.PasswordInput, { 'aria-label': 'Password' }),
    Popover: h(D.Popover, { trigger: h(D.Button, null, 'Share'), title: 'Share' }, 'Body'),
    Progress: h(D.Progress, { value: 40, label: 'Uploading' }),
    SearchInput: h(D.SearchInput, { 'aria-label': 'Search', defaultValue: 'tokens' }),
    SegmentedControl: h(D.SegmentedControl, { 'aria-label': 'View', options: [{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }] }),
    Sidebar: h(D.Sidebar, null, h(D.SidebarSection, { title: 'Workspace' }, h(D.SidebarItem, { href: '/', icon: 'home', label: 'Home', active: true }))),
    Slider: h(D.Slider, { 'aria-label': 'Price', defaultValue: [20, 80] }),
    Stepper: h(D.Stepper, { current: 1, steps: [{ title: 'Account' }, { title: 'Plan' }, { title: 'Pay' }] }),
    Table: h(D.Table, null, h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Name'))), h(D.TableBody, null, h(D.TableRow, null, h(D.TableCell, null, 'Ada'))), h(D.TableFoot, null, h(D.TableRow, null, h(D.TableCell, null, '1')))),
    Tabs: h(D.Tabs, { defaultValue: 'a' }, h(D.TabList, { 'aria-label': 'Sections' }, h(D.Tab, { value: 'a' }, 'A'), h(D.Tab, { value: 'b' }, 'B')), h(D.TabPanel, { value: 'a' }, 'Panel')),
    TimePicker: h(D.TimePicker, { 'aria-label': 'Time', defaultValue: '14:30', name: 'time' }),
    Toaster: h(D.Toaster),
    Tooltip: h(D.Tooltip, { content: 'Copy link' }, h(D.Button, null, 'Copy')),
    VisuallyHidden: h(D.VisuallyHidden, null, 'Skip'),
  };
  // Every component the package exports renders in one of the cases above (as the case or a part inside it), so a
  // new component can't skip this check.
  const seen = new Set();
  const walk = (el) => {
    if (Array.isArray(el)) return el.forEach(walk);
    if (!el || typeof el !== 'object' || !el.props) return;
    for (const [k, v] of Object.entries(D)) if (v === el.type) seen.add(k);
    for (const v of Object.values(el.props)) walk(v);
  };
  Object.values(cases).forEach(walk);
  const unrendered = Object.keys(D).filter((k) => /^[A-Z]/.test(k) && !seen.has(k));
  t('every component the package exports is server-rendered here', !unrendered.length, `add a case for: ${unrendered.join(', ')}`);
  for (const [name, el] of Object.entries(cases)) {
    let html = '', e = null;
    try { html = renderToString(el); } catch (x) { e = x; }
    t(`${name} renders on the server`, !e && /class="dk-/.test(html), e ? e.message : html.slice(0, 160));
  }
  [console.error, console.warn] = keep;
  t('no React warnings while rendering on the server', !warnings.length, warnings.slice(0, 3).join(' | '));
  t('version matches package.json', D.version === pkg.version, D.version);
  // Icons: the ones the components use are in index.js and draw on the server; the full set is a separate chunk.
  const iconHtml = (name) => renderToString(h(D.Icon, { name }));
  t('a built-in icon ("close") draws on the server; another name ("sports_cricket") keeps its empty box until the full set loads', /<path d="/.test(iconHtml('close')) && !/<svg/.test(iconHtml('sports_cricket')), iconHtml('sports_cricket'));
  // index.js and every module it imports (dist/js/), as a bundler puts them together, without the full icon set.
  const indexJs = esbuild.buildSync({ entryPoints: [path.join(PROJECT, 'dist', 'index.js')], bundle: true, write: false, format: 'esm', external: ['react', 'react-dom', './material/icons.js'], logLevel: 'silent' }).outputFiles[0].text;
  t('index.js leaves the full icon set out (loaded on demand) and stays under 150 KB gzipped', !indexJs.includes('"sports_cricket"') && zlib.gzipSync(indexJs).length < 150 * 1024, `${Math.round(zlib.gzipSync(indexJs).length / 1024)} KB`);
  // Tree-shaking: a bundler keeps only what a project imports. Every component is made by component() or named()
  // with a /* @__PURE__ */ mark and nothing else runs at the top of a module, so Divider alone is a few hundred bytes.
  const alone = (name) => zlib.gzipSync(esbuild.buildSync({ stdin: { contents: `import { ${name} } from './dist/index.js'; console.log(${name});`, resolveDir: PROJECT }, bundle: true, minify: true, write: false, format: 'esm', external: ['react', 'react-dom', './material/icons.js'], logLevel: 'silent' }).outputFiles[0].contents).length;
  const shaken = { Divider: alone('Divider'), toast: alone('toast') };
  t('a bundler drops the components a project doesn\'t import (Divider or toast alone: under 2 KB gzipped)', shaken.Divider < 2048 && shaken.toast < 2048, JSON.stringify(shaken));
  // React Server Components: the interactive components are client modules ("use client"), the rest render on the
  // server, and the helpers run there (tools/test/server-components/render.mjs).
  const rsc = spawnSync(process.execPath, ['--conditions=react-server', path.join(HERE, 'server-components', 'render.mjs'), path.join(PROJECT, 'dist')], { encoding: 'utf8' });
  let sc = null;
  try { sc = JSON.parse(rsc.stdout); } catch { /* reported below */ }
  t('Server Components: every component without "use client" renders with React\'s server build, and the helpers run there', sc && !sc.errors.length && sc.server.length > 0 && sc.helpers.buttonClass === 'dk-btn dk-btn--outline dk-btn--size-md' && sc.helpers.formatFileSize === '1.5 KB', sc ? JSON.stringify(sc.errors) : rsc.stderr.slice(0, 500));
  // Each module that needs the browser (state, effects, context, event handlers) says so with "use client".
  const clientOnly = /\bReact\.(useState|useEffect|useLayoutEffect|useReducer|useRef|useContext|useSyncExternalStore|useImperativeHandle|createContext)\b|\bon[A-Z]\w*=\{/;
  const unmarked = fs.readdirSync(path.join(PROJECT, 'src', 'components'), { recursive: true }).map(String).filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx$/.test(f))
    .filter((f) => { const src = read(`src/components/${f}`); return clientOnly.test(src) && !/^"use client";/.test(src); });
  t('every component module that uses state, effects, context or event handlers starts with "use client"', !unmarked.length, unmarked.join(', '));
  t('buttonClass and configure are exported', D.buttonClass({ variant: 'outline' }) === 'dk-btn dk-btn--outline dk-btn--size-md' && typeof D.configure === 'function');
}

// 3. types and CSS
const dts = fs.existsSync(path.join(PROJECT, 'dist', 'index.d.ts')) ? read('dist/index.d.ts') : '';
const missingTypes = ['Badge', 'Button', 'Checkbox', 'Field', 'Icon', 'Input', 'Loader', 'Radio', 'RadioGroup', 'Select', 'Switch', 'Textarea', 'ButtonProps', 'InputProps', 'SerupaConfig', 'CustomIconName']
  .filter((n) => !new RegExp(`\\b${n}\\b`).test(dts));
t('dist/index.d.ts declares every component and its props', dts && !missingTypes.length, missingTypes.join(', '));
// Each file starts with its banner and the cascade layer order; the rest is the styles.
const body = (f) => read(f).replace(/^\/\*![^\n]*\*\/\n@layer [^;]*;\n/, '');
t('bundle.css = components.css + utilities.css', body('dist/bundle.css') === body('dist/components.css') + body('dist/utilities.css'));
t('components.css holds no utility classes (only dk-* and the keyframes they use)', !/^\.(?!dk-)[a-z]/m.test(body('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '')));
t('the old bundle.js alias is gone (removed in 8.0.0)', !fs.existsSync(path.join(PROJECT, 'dist', 'bundle.js')));

process.exit(report('Package', R) ? 0 : 1);
