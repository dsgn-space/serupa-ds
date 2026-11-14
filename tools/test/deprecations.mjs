// Deprecations name the major that removes them, and can't outlive it (SCB1). Badge's size said "Removed in 4.0.0"
// and was still there at 10.1.0; RadioGroup's onChange "goes in the next major" and survived 10.0.0. So each
// @deprecated JSDoc in src/, each deprecation warning (a warnOnce whose message says "deprecated") and each
// $deprecated token says "removed in N.0.0", and this fails when one has no N, or when the major the next release
// ships as has reached N, so a major can't ship with an expired deprecation. A deprecated prop or warning also needs
// its warnings.md section and a line in CHANGELOG.md or a pending changeset that names it. And a major can't remove
// a name sooner than four weeks after the release that deprecated it (GR247), unless tools/release-policy.json
// switches that window off.
//   node tools/test/deprecations.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, read, report, done } from './lib.mjs';

// The major the next release ships as. A pending major changeset makes it package.json's major plus one, so a
// deprecation due then fails on the pull request that could still remove it, not on the release pull request
// (12.0.0 shipped with two that said "removed in 12.0.0").
const current = Number(JSON.parse(read('package.json')).version.split('.')[0]);
const changesets = fs.readdirSync(path.join(PROJECT, '.changeset')).filter((n) => n.endsWith('.md') && n !== 'README.md');
// An empty changeset (--- then ---, for a change that releases nothing) bumps nothing.
const bumps = changesets.map((n) => { const text = read(path.join('.changeset', n)); return [n, /^---\s*\n---/.test(text) ? 'none' : /^---\n[\s\S]*?["']serupa-ds["']\s*:\s*(\w+)\s*\n[\s\S]*?---/.exec(text)?.[1]]; });
const pendingMajor = bumps.some(([, bump]) => bump === 'major');
const major = pendingMajor ? current + 1 : current;
const now = pendingMajor ? `the next release is ${major}.0.0, with a pending major changeset` : `the package is ${major}.x`;
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
// The next major is read from the pending changesets, so each must name its serupa-ds bump where this finds it.
for (const [n, bump] of bumps) t(`.changeset/${n} names a patch, minor or major bump for serupa-ds, or none`, ['patch', 'minor', 'major', 'none'].includes(bump), 'start it with ---, "serupa-ds": patch, minor or major, then ---');
const removedIn = (s) => { const m = /removed in (\d+)\.0\.0/i.exec(s); return m ? Number(m[1]) : null; };
const due = (where, what, text) => {
  const n = removedIn(text);
  t(`${where}: ${what} says which major removes it, and that major is still ahead (${now})`, n !== null && n > major,
    n === null ? 'add "removed in N.0.0" to its text' : `removed in ${n}.0.0, but ${now}: remove it now`);
};

const walk = (dir, keep) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? (e.name === 'generated' ? [] : walk(p, keep)) : keep(e.name) ? [p] : [];
});
const rel = (p) => path.relative(PROJECT, p);
const sources = walk(path.join(PROJECT, 'src'), (n) => /\.tsx?$/.test(n) && !/\.(test|stories)\.tsx?$/.test(n));
// Right after a major (14.0.0 removed every deprecation and used up every changeset) the loops below find nothing,
// so these always run: the search reaches the code, and the major is read the way the loops read it.
t(`finds the source files to search (${sources.length})`, sources.length > 50, 'walk src/ for .ts and .tsx files');
t('reads the major from "removed in N.0.0", and nothing from a text without one',
  removedIn('Deprecated: removed in 15.0.0.') === 15 && removedIn('Removed In 9.0.0') === 9 && removedIn('goes in the next major') === null, 'removedIn');
const warnings = read('docs/warnings.md');
const history = read('CHANGELOG.md') + fs.readdirSync(path.join(PROJECT, '.changeset')).filter((n) => n.endsWith('.md')).map((n) => read(path.join('.changeset', n))).join('\n');
const named = (name) => new RegExp('`' + name + '`').test(history);

for (const f of sources) {
  const text = fs.readFileSync(f, 'utf8'), lines = text.split('\n');
  lines.forEach((line, i) => {
    if (!/@deprecated/.test(line)) return;
    // The comment ends on this line or a later one; what it documents is the first line after it.
    let j = i; while (j < lines.length && !/\*\//.test(lines[j])) j++;
    const comment = lines.slice(i, j + 1).join(' '), next = (lines[j + 1] || '').trim();
    const name = (/^(?:readonly\s+)?["']?([\w-]+)["']?\??\s*[:(]/.exec(next) || /(?:function|const|let|class|interface|type)\s+(\w+)/.exec(next) || [])[1] || next.slice(0, 40);
    due(`${rel(f)}:${i + 1}`, `@deprecated ${name}`, comment);
    t(`${rel(f)}:${i + 1}: ${name} is named in CHANGELOG.md or a pending changeset`, named(name), `say in a changeset that \`${name}\` is deprecated`);
  });
  // The message's alternatives can't overlap (a quote only starts a string), so a long call can't backtrack forever.
  for (const m of text.matchAll(/warnOnce\(\s*["']([\w-]+)["']\s*,((?:"[^"]*"|`[^`]*`|'[^']*'|[^;"'`])*?)\)\s*;/g)) {
    if (!/deprecat/i.test(m[2])) continue;
    const at = `${rel(f)}:${text.slice(0, m.index).split('\n').length}`;
    due(at, `the ${m[1]} warning`, m[2]);
    t(`${at}: the ${m[1]} warning has its section in docs/warnings.md`, new RegExp(`^## ${m[1]}$`, 'm').test(warnings), `add "## ${m[1]}" to docs/warnings.md`);
  }
}

// Tokens: tokens.json and each component's *.tokens.json. A $deprecated may be true or a sentence; either way the
// $deprecated text or the token's $description names the major.
const tokenFiles = ['tokens.json', ...walk(path.join(PROJECT, 'src', 'components'), (n) => n.endsWith('.tokens.json')).map(rel)];
for (const f of tokenFiles) {
  const visit = (node, trail) => {
    if (!node || typeof node !== 'object') return;
    if (node.$deprecated !== undefined && node.$deprecated !== false) {
      due(f, `the token ${trail.join('.') || node.name}`, `${typeof node.$deprecated === 'string' ? node.$deprecated : ''} ${node.$description || ''} ${node.usage || ''}`);
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) visit(v, [...trail, v && v.name ? v.name : k]);
  };
  visit(JSON.parse(read(f)), []);
}

// GR247: a deprecation lives at least four weeks before a major removes it (CONTRIBUTING.md, Release cadence). For
// each name a pending major changeset removes (a line that says "Removed" and names it in backticks) that was ever
// deprecated, the latest release that deprecated it, found in CHANGELOG.md on a line that says "deprecated" and names it, came
// out at least 28 days ago. A name deprecated only in a pending changeset hasn't been released at all. A name never
// deprecated is a breaking change of its own, which the RFC covers (upgrades.mjs).
export const WINDOW_DAYS = 28;
const releasesOf = (changelog) => [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})\s*$([\s\S]*?)(?=^## \[|(?![\s\S]))/gm)].map((m) => ({ version: m[1], date: m[2], text: m[3] }));
const mentions = (text, name) => text.split('\n').some((line) => /deprecat/i.test(line) && line.includes('`' + name + '`'));
/** The latest release that deprecated `name`: { version, date }, or null. The latest, since two components can
    deprecate the same name (RadioGroup's onChange in 9.2.0, OfflineBanner's in 14.2.0), and the newer one decides. */
export const deprecatedIn = (name, changelog) => releasesOf(changelog).filter((r) => mentions(r.text, name)).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
/** Whether a major released on `today` may remove `name`: '' if so, else why not. `pending` is the unreleased changesets' text. */
export const tooSoon = (name, changelog, pending, today) => {
  const r = deprecatedIn(name, changelog);
  if (!r) return mentions(pending, name) ? `\`${name}\` is deprecated only in a pending changeset: release the deprecation first, and remove it ${WINDOW_DAYS} days later` : '';
  const days = Math.floor((Date.parse(today) - Date.parse(r.date)) / 864e5);
  return days >= WINDOW_DAYS ? '' : `\`${name}\` was deprecated in ${r.version} on ${r.date}, ${days} days ago: it can go in a major from ${new Date(Date.parse(r.date) + WINDOW_DAYS * 864e5).toISOString().slice(0, 10)}`;
};
{
  const log = '## [Unreleased]\n\n## [14.2.0] - 2026-11-07\n\n- Deprecated: `onChange`. Use `onOnlineChange`.\n\n## [13.0.0] - 2026-10-01\n\n- Deprecated: `noTitle`.\n- Deprecated (RadioGroup): `onChange`.\n';
  t('the deprecation window: finds the release that deprecated a name, and holds a removal to 28 days after it',
    deprecatedIn('onChange', log)?.version === '14.2.0' && deprecatedIn('noTitle', log)?.date === '2026-10-01' && deprecatedIn('hideTitle', log) === null
    && tooSoon('noTitle', log, '', '2026-11-08') === '' && /from 2026-12-05/.test(tooSoon('onChange', log, '', '2026-11-08'))
    && tooSoon('onChange', log, '', '2026-12-05') === '' && /only in a pending/.test(tooSoon('size', log, '- Deprecated: `size`.', '2026-11-08'))
    && tooSoon('hideTitle', log, '', '2026-11-08') === '', 'deprecatedIn and tooSoon');
}
// The window can be switched off in tools/release-policy.json ("deprecationWindow": false): Diki suspended it on
// 14 Nov 2026, while the API is still being adjusted, so a major may remove a name as soon as it is deprecated. It
// still needs its migration note and, where a script can make it, its serupa-migrate change.
const windowOn = JSON.parse(read('tools/release-policy.json')).deprecationWindow !== false;
t(`reads the deprecation window's switch from tools/release-policy.json (${windowOn ? 'on' : 'off'})`, typeof windowOn === 'boolean');
const today = process.env.SERUPA_TODAY || new Date().toISOString().slice(0, 10);
const changelog = read('CHANGELOG.md');
const pendingText = changesets.map((n) => read(path.join('.changeset', n))).join('\n');
for (const [n, bump] of bumps) {
  if (bump !== 'major' || !windowOn) continue;
  for (const line of read(path.join('.changeset', n)).split('\n').filter((l) => /\bRemoved\b/.test(l))) {
    for (const [, name] of line.matchAll(/`([\w.-]+)`/g)) {
      const why = tooSoon(name, changelog, pendingText, today);
      if (deprecatedIn(name, changelog) || why) t(`.changeset/${n}: \`${name}\` was deprecated at least ${WINDOW_DAYS} days before this major removes it`, !why, why);
    }
  }
}

done(report('Deprecations', R));
