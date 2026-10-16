// The package as a project installs it (npm run build first): every file in package.json's exports exists,
// the components import as ES modules and render on the server (Next.js, Remix) with no browser globals,
// the types build, and bundle.css is exactly components.css followed by utilities.css.
//   node tools/test/package.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROJECT, read, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const pkg = JSON.parse(read('package.json'));

// 1. exports
const targets = [];
for (const [k, v] of Object.entries(pkg.exports)) for (const f of typeof v === 'string' ? [v] : Object.values(v)) if (!f.includes('*')) targets.push([k, f]);
const absent = targets.filter(([, f]) => !fs.existsSync(path.join(PROJECT, f)));
t('every file package.json exports exists', !absent.length, absent.map(([k, f]) => `${k} → ${f}`).join(', '));
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
  };
  for (const [name, el] of Object.entries(cases)) {
    let html = '', e = null;
    try { html = renderToString(el); } catch (x) { e = x; }
    t(`${name} renders on the server`, !e && /class="dk-/.test(html), e ? e.message : html.slice(0, 160));
  }
  [console.error, console.warn] = keep;
  t('no React warnings while rendering on the server', !warnings.length, warnings.slice(0, 3).join(' | '));
  t('version matches package.json', D.version === pkg.version, D.version);
  t('buttonClass and configure are exported', D.buttonClass({ variant: 'outline' }) === 'dk-btn dk-btn--outline dk-btn--size-md' && typeof D.configure === 'function');
}

// 3. types and CSS
const dts = fs.existsSync(path.join(PROJECT, 'dist', 'index.d.ts')) ? read('dist/index.d.ts') : '';
const missingTypes = ['Badge', 'Button', 'Checkbox', 'Field', 'Icon', 'Input', 'Loader', 'Radio', 'RadioGroup', 'Select', 'Switch', 'Textarea', 'ButtonProps', 'InputProps', 'DikiConfig', 'CustomIconName']
  .filter((n) => !new RegExp(`\\b${n}\\b`).test(dts));
t('dist/index.d.ts declares every component and its props', dts && !missingTypes.length, missingTypes.join(', '));
const body = (f) => read(f).replace(/^\/\*![^\n]*\*\/\n/, '');
t('bundle.css = components.css + utilities.css', body('dist/bundle.css') === body('dist/components.css') + body('dist/utilities.css'));
t('components.css holds no utility classes (only dk-* and the keyframes they use)', !/^\.(?!dk-)[a-z]/m.test(body('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '')));
t('the browser script and bundle.js are the same file', read('dist/diki.iife.js') === read('dist/bundle.js'));

process.exit(report('Package', R) ? 0 : 1);
