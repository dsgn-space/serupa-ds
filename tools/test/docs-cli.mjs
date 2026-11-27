// The docs lookup (bin/serupa-docs.mjs) and dist/llms.txt: an agent in a project asks for a component, a part of its
// guide, a topic or a search, and gets the installed release's own words, offline. Reads the build's dist/docs.json
// and dist/llms.txt, so it needs npm run build.
//   node tools/test/docs-cli.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { answer, distance, find, findSection, search, sections } from '../../bin/serupa-docs.mjs';
import { components } from '../build/registry.mjs';
import { PROJECT, done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const data = JSON.parse(fs.readFileSync(path.join(PROJECT, 'dist', 'docs.json'), 'utf8'));
const { version } = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
const guide = (n) => fs.readFileSync(path.join(PROJECT, 'src', 'components', n, 'README.md'), 'utf8');

// What it answers from: this release, every component, its guide whole.
t('docs.json is this release\'s', data.version === version, `${data.version}, package.json says ${version}`);
const names = components(PROJECT);
t('it has every component, each with its group, status and first sentence', data.components.length === names.length && data.components.every((c) => names.includes(c.name) && c.group && c.status && /[.!?]$/.test(c.summary)),
  data.components.filter((c) => !/[.!?]$/.test(c.summary)).map((c) => c.name).join(', '));
t('Button\'s guide is its README, with links to other guides turned into the command that prints them', data.components.find((c) => c.name === 'Button').guide.startsWith('# Button\n') && !data.components.some((c) => /\]\(\.\.\/\w+\/README\.md/.test(c.guide)));
t('the skill\'s sections are its topics, its component list left out', ['Install and load', 'Theme', 'Rules'].every((n) => data.topics.some((x) => x.name === n)) && !data.topics.some((x) => x.name === 'Components'), data.topics.map((x) => x.name).join(', '));
t('every token with a description is searchable', data.tokens.length > 100 && data.tokens.some((x) => x.name === '--surface-brand' && /brand/i.test(x.description)), String(data.tokens.length));

// Finding things.
t('a component by its name, in any case', find(data, 'button').component?.name === 'Button');
t('a component by another name it\'s known by (snackbar: Toast)', find(data, 'snackbar').component?.name === 'Toast', find(data, 'snackbar').component?.name);
t('a topic by its first word (theme, install)', find(data, 'theme').topic?.name === 'Theme' && find(data, 'install').topic?.name === 'Install and load');
const props = findSection(guide('Button'), ['props']);
t('a section by its title, its ### parts with it, up to the next heading of its level', props?.title === 'Props' && !props.text.includes('## Component tokens'), props?.text.slice(0, 80));
const keys = findSection(guide('Button'), ['keyboard']);
t('a ### section (Keyboard) stops at the next ## heading', keys?.title === 'Keyboard' && keys.text.includes('| Key |') && !keys.text.includes('## Props'));
t('a # inside a code block is not a heading', sections('## A\n```sh\n## not a heading\n```\ntext\n## B\n').map((s) => s.title).join() === 'A,B');
const hits = search(data, ['date', 'range']);
t('search wants every word, and ranks a match in the name first (date range: DateRangePicker)', hits[0]?.name === 'DateRangePicker' && hits.every((h) => /date/i.test(JSON.stringify(h)) || h.kind === 'component'), hits.slice(0, 3).map((h) => h.name).join(', '));
t('one-letter typos are near (Buton: Button)', distance('buton', 'button') === 1 && distance('toast', 'toast') === 0);

// What it prints.
const list = answer(data, []);
t('with nothing asked it lists every component by group, with the version', list.code === 0 && list.stdout.startsWith(`Serupa ${version}`) && /\nActions\n {2}Button: /.test(list.stdout));
const json = answer(data, ['Button', 'props', '--json']);
t('--json gives the same answer as data', json.code === 0 && JSON.parse(json.stdout).title === 'Props' && JSON.parse(json.stdout).component === 'Button');
const typo = answer(data, ['Buton']);
t('a name it doesn\'t know exits 1 and names the closest', typo.code === 1 && typo.stderr.includes('Closest: Button'), typo.stderr);
const noSection = answer(data, ['Button', 'nothing-like-this']);
t('a section the guide doesn\'t have exits 1 and lists the ones it has', noSection.code === 1 && noSection.stderr.includes('Props'), noSection.stderr);
t('search with no words is a usage error', answer(data, ['search']).code === 2);

// The command itself, as npx runs it.
const run = (...a) => spawnSync(process.execPath, [path.join(PROJECT, 'bin', 'serupa-docs.mjs'), ...a], { encoding: 'utf8' });
const r = run('Toast', 'when not');
t('npx serupa-docs Toast "when not" prints that section', r.status === 0 && r.stdout.startsWith('## When not to use'), r.stderr || r.stdout.slice(0, 80));

// llms.txt: the first thing an agent reads.
const llms = fs.readFileSync(path.join(PROJECT, 'dist', 'llms.txt'), 'utf8');
t('llms.txt names the release, sends agents to serupa-docs and the installed skill, and lists every component', llms.startsWith(`# Serupa design system (@diki-stwn/serupa-ds ${version})`)
  && llms.includes('npx serupa-docs <Component>') && llms.includes('node_modules/@diki-stwn/serupa-ds/skills/serupa/SKILL.md') && names.every((n) => llms.includes(`**${n}**`)));
t('every command llms.txt shows works', [...llms.matchAll(/`npx serupa-docs ([^`<]*)`/g)].map((m) => m[1].trim().split(' ').filter(Boolean)).every((a) => answer(data, a).code === 0));

done(report('Docs lookup (serupa-docs)', R));
