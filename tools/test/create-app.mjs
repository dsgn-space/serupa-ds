// The starter app's generator (bin/serupa-create.mjs, 135), without the network: the React, Vite and TypeScript it
// pins are the ones the repository tests with, the page it writes loads the stylesheets in order and has its landmarks,
// and it refuses a folder that already has files. Its `npm run check` is an agent's "done" (KP1): the lint it sets
// up passes on the app as made, and fails an <Image> with no alt and a raw #hex in the app's CSS. That runs here on
// the repository's own ESLint and Stylelint, with the built serupa-ds (npm run build first);
// tools/test/consumer.mjs installs the app it makes and runs its check and build.
//   node tools/test/create-app.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { VERSIONS, files, pages } from '../../bin/serupa-create.mjs';
import { plan } from '../../bin/serupa-add.mjs';
import { SECTION } from '../../bin/serupa-agents.mjs';
import { PROJECT, done, fail, report } from './lib.mjs';

const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
const drift = Object.entries(VERSIONS).filter(([name, v]) => !/^\d+\.\d+\.\d+$/.test(v || '') || pkg.devDependencies[name] !== v).map(([name, v]) => `${name}: ${v}, the repository has ${pkg.devDependencies[name]}`);
const out = files({ name: 'my-app', serupa: 'github:diki-stwn/serupa-ds#v1.2.3', brand: 'violet' });
const app = JSON.parse(out['package.json']);
const main = out['src/main.tsx'];
const order = ['@diki-stwn/serupa-ds/tokens.css', '@diki-stwn/serupa-ds/brands/violet.css', '@diki-stwn/serupa-ds/base.css', '@diki-stwn/serupa-ds/bundle.css'].map((f) => main.indexOf(f));
const blueMain = files({ name: 'my-app', serupa: 'github:diki-stwn/serupa-ds#v1.2.3', brand: 'blue' })['src/main.tsx'];

const bin = path.join(PROJECT, 'bin', 'serupa-create.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-create-'));
const made = spawnSync(process.execPath, [bin, path.join(tmp, 'Hello World')], { encoding: 'utf8' });
const written = fs.existsSync(path.join(tmp, 'Hello World', 'package.json')) ? JSON.parse(fs.readFileSync(path.join(tmp, 'Hello World', 'package.json'), 'utf8')) : {};
const again = spawnSync(process.execPath, [bin, path.join(tmp, 'Hello World')], { encoding: 'utf8' });
const brand = spawnSync(process.execPath, [bin, path.join(tmp, 'b'), '--brand', 'slate'], { encoding: 'utf8' });

// The lint, offline: the app as written, its node_modules linked to the repository's and serupa-ds to the build.
if (!fs.existsSync(path.join(PROJECT, 'dist', 'eslint.js'))) fail('no dist/eslint.js: run npm run build first');
const lintApp = path.join(tmp, 'lint');
for (const [file, text] of Object.entries(files({ name: 'lint', serupa: 'file:..', brand: 'blue' }))) {
  fs.mkdirSync(path.dirname(path.join(lintApp, file)), { recursive: true });
  fs.writeFileSync(path.join(lintApp, file), text);
}
const modules = path.join(lintApp, 'node_modules');
fs.mkdirSync(modules);
for (const name of fs.readdirSync(path.join(PROJECT, 'node_modules'))) {
  if (!name.startsWith('.')) fs.symlinkSync(path.join(PROJECT, 'node_modules', name), path.join(modules, name), 'junction');
}
fs.mkdirSync(path.join(modules, '@diki-stwn'), { recursive: true });
fs.symlinkSync(PROJECT, path.join(modules, '@diki-stwn/serupa-ds'), 'junction');
const lint = () => ({
  eslint: spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'eslint', 'bin', 'eslint.js'), '.'], { cwd: lintApp, encoding: 'utf8' }),
  stylelint: spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'stylelint', 'bin', 'stylelint.mjs'), 'src/**/*.css', '--allow-empty-input'], { cwd: lintApp, encoding: 'utf8' }),
});
const clean = lint();
// The same app started on a page template (--template dashboard): the pattern and its blocks in src/serupa/, App.tsx
// rendering it. Every other pattern and block goes in beside them, as serupa-add would write them, so the app's own
// lint and types have to pass on all of them: what we hand an app must pass the check we tell its agent to run.
const list = fs.existsSync(path.join(PROJECT, 'dist', 'templates.json')) ? JSON.parse(fs.readFileSync(path.join(PROJECT, 'dist', 'templates.json'), 'utf8')).templates : [];
const paged = files({ name: 'lint', serupa: 'file:..', brand: 'blue', template: { name: 'Dashboard', files: plan(list, ['Dashboard']).files || {} } });
const pageApp = path.join(tmp, 'page');
const every = Object.assign({}, ...list.map((t) => Object.fromEntries(Object.entries(t.files).map(([f, text]) => [`src/serupa/${f}`, text]))));
for (const [file, text] of Object.entries({ ...every, ...paged })) {
  fs.mkdirSync(path.dirname(path.join(pageApp, file)), { recursive: true });
  fs.writeFileSync(path.join(pageApp, file), text);
}
fs.symlinkSync(modules, path.join(pageApp, 'node_modules'), 'junction');
const onPage = {
  eslint: spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'eslint', 'bin', 'eslint.js'), '.'], { cwd: pageApp, encoding: 'utf8' }),
  tsc: spawnSync(process.execPath, [path.join(PROJECT, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '-p', '.'], { cwd: pageApp, encoding: 'utf8' }),
};
const signIn = spawnSync(process.execPath, [bin, path.join(tmp, 'sign'), '--template', 'sign-in'], { encoding: 'utf8' });
const signApp = (f) => (fs.existsSync(path.join(tmp, 'sign', f)) ? fs.readFileSync(path.join(tmp, 'sign', f), 'utf8') : '');
const signed = { page: signApp('src/serupa/SignIn.tsx'), card: signApp('src/serupa/AuthCard.tsx'), app: signApp('src/App.tsx') };
const noPage = spawnSync(process.execPath, [bin, path.join(tmp, 'nope'), '--template', 'Spaceship'], { encoding: 'utf8' });
const listed = spawnSync(process.execPath, [bin, '--template'], { encoding: 'utf8' });
fs.writeFileSync(path.join(lintApp, 'src', 'Team.tsx'), `import { Image } from '@diki-stwn/serupa-ds';\n\nexport const Team = () => <Image src="team.png" />;\n`);
fs.writeFileSync(path.join(lintApp, 'src', 'team.css'), '.team { color: #6b7280; }\n');
const planted = lint();
fs.rmSync(tmp, { recursive: true, force: true });
const said = (r) => (r.stdout + r.stderr).slice(-1500);

// serupa-agents on a project that already has an AGENTS.md and a CLAUDE.md of its own, run twice, then on one
// with last release's wording between the markers.
const agentsBin = path.join(PROJECT, 'bin', 'serupa-agents.mjs');
const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-agents-'));
fs.writeFileSync(path.join(proj, 'AGENTS.md'), '# Shop\n\nUse pnpm.\n');
fs.writeFileSync(path.join(proj, 'CLAUDE.md'), 'Be brief.\n');
const first = spawnSync(process.execPath, [agentsBin, proj], { encoding: 'utf8' });
const read = (f) => fs.readFileSync(path.join(proj, f), 'utf8');
const once = { agents: read('AGENTS.md'), claude: read('CLAUDE.md') };
const second = spawnSync(process.execPath, [agentsBin, proj], { encoding: 'utf8' });
const twice = { agents: read('AGENTS.md'), claude: read('CLAUDE.md') };
fs.writeFileSync(path.join(proj, 'AGENTS.md'), '# Shop\n\n<!-- serupa-ds:start -->\nOld words.\n<!-- serupa-ds:end -->\n\nUse pnpm.\n');
spawnSync(process.execPath, [agentsBin, proj], { encoding: 'utf8' });
const updated = read('AGENTS.md');
const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-agents-'));
spawnSync(process.execPath, [agentsBin, empty], { encoding: 'utf8' });
const fresh = { agents: fs.readFileSync(path.join(empty, 'AGENTS.md'), 'utf8'), claude: fs.readFileSync(path.join(empty, 'CLAUDE.md'), 'utf8') };
fs.rmSync(proj, { recursive: true, force: true });
fs.rmSync(empty, { recursive: true, force: true });
const SKILL = 'node_modules/@diki-stwn/serupa-ds/skills/serupa/SKILL.md';
const shipped = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8')).files.includes('skills/') && fs.existsSync(path.join(PROJECT, 'skills', 'serupa', 'SKILL.md'));

done(report('Starter app', [
  { name: 'it pins the React, Vite, TypeScript and types the repository tests with', ok: !drift.length, detail: drift.join('; ') },
  { name: 'the app installs the given serupa-ds and builds, checks types and serves with Vite', ok: app.dependencies['@diki-stwn/serupa-ds'] === 'github:diki-stwn/serupa-ds#v1.2.3' && app.scripts.build === 'vite build' && app.scripts.typecheck === 'tsc --noEmit' && app.scripts.dev === 'vite', detail: out['package.json'] },
  { name: 'the page sets the brand and mode, and the stylesheets load tokens, the brand, base, then bundle', ok: out['index.html'].includes('<html lang="en" data-brand="violet" data-mode="auto">') && order.every((n, i) => n > 0 && (i === 0 || n > order[i - 1])), detail: main },
  { name: 'a blue app loads no brand file (blue is in tokens.css)', ok: blueMain.includes('/tokens.css') && !blueMain.includes('/brands/') },
  { name: 'the app has a skip link, a main landmark it targets, one h1, and a labelled field', ok: /<SkipLink \/>/.test(out['src/App.tsx']) && /as="main" id="main"/.test(out['src/App.tsx']) && (out['src/App.tsx'].match(/level=\{1\}/g) || []).length === 1 && /<Field label="Email"/.test(out['src/App.tsx']) },
  { name: 'theme.js is served and built as its own file ahead of the app, and the build trims the CSS', ok: /injectTo: 'head-prepend'/.test(out['vite.config.ts']) && /emitFile/.test(out['vite.config.ts']) && /serupaPurge\(\{ components: true \}\)/.test(out['vite.config.ts']) },
  { name: 'by default the app installs this release by its tag, named from the folder', ok: made.status === 0 && written.name === 'hello-world' && written.dependencies?.['@diki-stwn/serupa-ds'] === `github:dsgn-space/serupa-ds#v${pkg.version}`, detail: made.stderr + JSON.stringify(written) },
  { name: 'it refuses a folder with files in it, and a brand it doesn\'t have', ok: again.status === 1 && /isn't empty/.test(again.stderr) && brand.status === 2, detail: again.stderr + brand.stderr },
  { name: 'the app\'s AGENTS.md sends its agents to the skill the installed release ships, and CLAUDE.md imports it', ok: out['AGENTS.md'].startsWith('# My app\n') && out['AGENTS.md'].includes(SECTION) && SECTION.includes(SKILL) && shipped && out['CLAUDE.md'] === '@AGENTS.md\n', detail: out['AGENTS.md'] + out['CLAUDE.md'] },
  { name: 'serupa-agents adds the section to a project\'s own AGENTS.md and @AGENTS.md to its CLAUDE.md, keeping what they said', ok: first.status === 0 && once.agents.startsWith('# Shop\n\nUse pnpm.\n\n') && once.agents.endsWith(SECTION) && once.claude === 'Be brief.\n\n@AGENTS.md\n', detail: first.stdout + first.stderr + once.agents + once.claude },
  { name: 'run again, it changes nothing; over last release\'s section, it puts the new one in its place', ok: second.status === 0 && /nothing changed/.test(second.stdout) && twice.agents === once.agents && twice.claude === once.claude && updated === '# Shop\n\n' + SECTION.trimEnd() + '\n\nUse pnpm.\n', detail: second.stdout + updated },
  { name: 'in a folder with neither file, it makes both', ok: fresh.agents === '# Agents\n\n' + SECTION && fresh.claude === '@AGENTS.md\n', detail: fresh.agents + fresh.claude },
  { name: 'npm run check runs the types, then ESLint and Stylelint with Serupa\'s configs', ok: app.scripts.check === 'npm run typecheck && npm run lint' && /eslint \./.test(app.scripts.lint) && /stylelint/.test(app.scripts.lint) && /serupa-ds\/eslint/.test(out['eslint.config.js']) && /serupa-ds\/stylelint/.test(out['stylelint.config.js']), detail: out['package.json'] },
  { name: '--template starts the app on a pattern: it and its blocks in src/serupa/, and App.tsx renders it', ok: !!paged['src/serupa/Dashboard.tsx'] && !!paged['src/serupa/StatsRow.tsx'] && /import \{ Dashboard \} from '\.\/serupa\/Dashboard';/.test(paged['src/App.tsx']) && /return <Dashboard \/>;/.test(paged['src/App.tsx']) && paged['package.json'] === out['package.json'].replace('"my-app"', '"lint"').replace('github:diki-stwn/serupa-ds#v1.2.3', 'file:..'), detail: Object.keys(paged).join(', ') },
  { name: `the app passes its own lint and type check with all ${list.length} patterns and blocks in it, as serupa-add writes them`, ok: list.length >= 40 && onPage.eslint.status === 0 && onPage.tsc.status === 0, detail: said(onPage.eslint) + said(onPage.tsc) },
  { name: 'serupa-create --template sign-in writes SignIn and the AuthCard it builds on; an unknown page lists the pages', ok: signIn.status === 0 && /export function SignIn\(/.test(signed.page) && /export function AuthCard/.test(signed.card) && /<SignIn \/>/.test(signed.app) && noPage.status === 2 && /no page called "Spaceship"/.test(noPage.stderr) && !fs.existsSync(path.join(tmp, 'nope')), detail: signIn.stdout + signIn.stderr + noPage.stderr },
  { name: '--template alone lists every pattern a page can start on (each with demo data), and none that needs props', ok: listed.status === 0 && pages(list).length >= 20 && pages(list).every((t) => listed.stdout.includes(`  ${t.name}: `)) && !/ErrorPages/.test(listed.stdout) && /Dashboard/.test(listed.stdout), detail: listed.stdout.slice(0, 400) + listed.stderr },
  { name: 'the lint passes on the app as made', ok: clean.eslint.status === 0 && clean.stylelint.status === 0, detail: said(clean.eslint) + said(clean.stylelint) },
  { name: 'and fails an <Image> with no alt (jsx-a11y) and a #hex in the app\'s CSS (serupa/no-raw-color)', ok: planted.eslint.status !== 0 && /alt-text/.test(planted.eslint.stdout) && planted.stylelint.status !== 0 && /serupa\/no-raw-color/.test(planted.stylelint.stdout + planted.stylelint.stderr), detail: said(planted.eslint) + said(planted.stylelint) },
]));
