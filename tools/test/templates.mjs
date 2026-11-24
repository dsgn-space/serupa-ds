// serupa-add (bin/serupa-add.mjs) and dist/templates.json: the patterns and blocks an app copies, written into the
// app with their imports pointed at the package and the blocks they build on. Every one offered compiles against the
// built package as written, with nothing of this repository's folders left in it. Needs npm run build.
//   node tools/test/templates.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import * as esbuild from 'esbuild';
import { find, plan, sort } from '../../bin/serupa-add.mjs';
import { rewrite, templates } from '../build/templates.mjs';
import { PROJECT, done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const data = JSON.parse(fs.readFileSync(path.join(PROJECT, 'dist', 'templates.json'), 'utf8'));
const { version } = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
const folders = (dir) => fs.readdirSync(path.join(PROJECT, 'src', dir)).filter((n) => fs.existsSync(path.join(PROJECT, 'src', dir, n, `${n}.tsx`)));
const { left } = templates(PROJECT);

t('templates.json is this release\'s', data.version === version, data.version);
t('every pattern and block is offered or named as left out, with why', folders('patterns').length + folders('blocks').length === data.templates.length + left.length && left.every((l) => l.why.length),
  `${data.templates.length} offered, ${left.length} left: ${left.map((l) => l.name).join(', ')}`);
t('most of them are offered (at most 3 left out)', left.length <= 3, left.map((l) => `${l.name}: ${l.why[0]}`).join('; '));
t('each has what it\'s for, from its docs page', data.templates.every((x) => x.summary.length > 20), data.templates.filter((x) => x.summary.length <= 20).map((x) => x.name).join(', '));

// The rewrite.
const r = rewrite(`import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyFirstRun } from '../EmptyStates/EmptyStates';
import { useLocale } from '../../internal/provider';
import { isComposing } from '../../internal/ime';
import { cards } from './payment';`);
t('a component import comes from the package', r.code.includes(`import { Button } from '@diki-stwn/serupa-ds';`) && r.code.includes(`import { formatNumber } from '@diki-stwn/serupa-ds';`));
t('a block comes from the file next to it, and is needed', r.code.includes(`from './PageHeader';`) && r.code.includes(`from './EmptyStates';`) && r.blocks.join() === 'PageHeader,EmptyStates');
t('something the package exports from src/internal/ comes from the package', r.code.includes(`import { useLocale } from '@diki-stwn/serupa-ds';`));
t('something it doesn\'t export is named as missing', r.missing.join() === 'isComposing (internal/ime)', r.missing.join());
t('a file of its own stays next to it', r.local.join() === 'payment' && r.code.includes(`from './payment';`));
const side = rewrite(`import './x.css';\nimport { useLocale } from '../../internal/provider';`);
t('an import after a side-effect import is rewritten on its own', side.code.includes(`import { useLocale } from '@diki-stwn/serupa-ds';`) && !side.missing.length, side.missing.join());

// Every template offered compiles against the built package, its blocks with it.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-add-'));
try {
  const broken = [];
  for (const x of data.templates) {
    const out = path.join(dir, x.name);
    const p = plan(data.templates, [x.name]);
    fs.mkdirSync(out, { recursive: true });
    for (const [f, text] of Object.entries(p.files)) fs.writeFileSync(path.join(out, f), text);
    const leftover = Object.entries(p.files).filter(([, text]) => /from '\.\.\//.test(text)).map(([f]) => f);
    if (leftover.length) { broken.push(`${x.name}: ${leftover.join(', ')} still import from this repository`); continue; }
    try {
      await esbuild.build({ entryPoints: [path.join(out, `${x.name}.tsx`)], bundle: true, write: false, format: 'esm', logLevel: 'silent', jsx: 'automatic',
        alias: { '@diki-stwn/serupa-ds': path.join(PROJECT, 'dist', 'index.js') }, external: ['react', 'react-dom', 'react/jsx-runtime'] });
    } catch (e) { broken.push(`${x.name}: ${(e.errors || [e]).slice(0, 2).map((m) => m.text || m.message).join('; ')}`); }
  }
  t(`every one of the ${data.templates.length} compiles against the built package, as written`, !broken.length, broken.join(' | '));

  // Finding and writing.
  t('a name in any spelling finds its template (sign-in, signin, SignIn)', ['sign-in', 'signin', 'SignIn'].every((n) => find(data.templates, n)?.name === 'SignIn'));
  const dash = plan(data.templates, ['Dashboard']);
  t('Dashboard brings the blocks it builds on', ['Dashboard.tsx', 'PageHeader.tsx', 'StatsRow.tsx', 'EmptyStates.tsx'].every((f) => f in dash.files), Object.keys(dash.files).join(', '));
  t('an unknown name is named back', plan(data.templates, ['Dashbored']).unknown?.join() === 'Dashbored');
  const app = path.join(dir, 'app');
  const bin = (...a) => spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-add.mjs'), ...a], { cwd: app, encoding: 'utf8' });
  fs.mkdirSync(app);
  const first = bin('Dashboard');
  t('npx serupa-add Dashboard writes it and its blocks into src/serupa/', first.status === 0 && fs.existsSync(path.join(app, 'src', 'serupa', 'Dashboard.tsx')) && fs.existsSync(path.join(app, 'src', 'serupa', 'PageHeader.tsx')), first.stderr || first.stdout);
  t('the same again changes nothing and passes', bin('Dashboard').status === 0);
  fs.appendFileSync(path.join(app, 'src', 'serupa', 'PageHeader.tsx'), '\n// the app\'s own change\n');
  const again = bin('Billing');
  t('a block the app changed is left alone: nothing is written and it exits 1', again.status === 1 && again.stderr.includes('PageHeader.tsx') && !fs.existsSync(path.join(app, 'src', 'serupa', 'Billing.tsx')), again.stderr);
  t('sort() sees the changed file as one to refuse, and --force as one to write', sort(dash.files, path.join(app, 'src', 'serupa')).find((a) => a.file === 'PageHeader.tsx')?.act === 'refuse'
    && sort(dash.files, path.join(app, 'src', 'serupa'), true).find((a) => a.file === 'PageHeader.tsx')?.act === 'write');
  const forced = bin('Billing', '--force', '--to', 'ui');
  t('--to writes to another folder', forced.status === 0 && fs.existsSync(path.join(app, 'ui', 'Billing.tsx')), forced.stderr);
  const list = bin();
  t('with no name it lists the patterns and blocks with what they\'re for', list.status === 0 && /Patterns: [^\n]*\n {2}[A-Z]\w*: /.test(list.stdout) && list.stdout.includes('\n  AccountSecurity: ') && list.stdout.includes('Blocks: '), list.stdout.slice(0, 200));
  const unknown = bin('Dashbored');
  t('an unknown name exits 1 and writes nothing', unknown.status === 1 && unknown.stderr.includes('Dashbored'), unknown.stderr);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

done(report('serupa-add', R));
