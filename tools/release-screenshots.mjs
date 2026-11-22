// Screenshots in the release notes (94): the stories whose look changed since the last release, before and after, in
// the first theme at rest. No picture is committed (ADR-0016), so the Release workflow's screenshots job draws them:
// Visual at the previous release's commit and at this one (SERUPA_VISUAL_REST=1 node tools/test/run.mjs --group
// visual, with SERUPA_VISUAL_REF), and this attaches the pictures that differ to the GitHub release and adds the
// table under its notes. The pictures are the release's own files, so they show to whoever can see the release.
//   node tools/release-screenshots.mjs <tag> <prev-tag> <report-dir>    GH_TOKEN and GITHUB_REPOSITORY from the workflow
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SHOT = /-blue-light-rest$/;

/** The highest vX.Y.Z tag below `version` (prereleases left out), or null. */
export function previousTag(tags, version) {
  const parse = (v) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)?.slice(1).map(Number);
  const below = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  const me = parse(version);
  if (!me) return null;
  const older = tags.map((t) => [t, parse(t)]).filter(([, v]) => v && below(v, me) < 0).sort((a, b) => below(b[1], a[1]));
  return older[0]?.[0] ?? null;
}

/** Whether `version` is the newest release among `tags`: false for a patch of an older major (14.0.1 after 15.0.0),
 * which mustn't take GitHub's "Latest" from the new major. */
export function isLatest(tags, version) {
  const parse = (v) => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)?.slice(1).map(Number);
  const me = parse(version);
  return !me || !tags.some((t) => { const v = parse(t); return v && (v[0] - me[0] || v[1] - me[1] || v[2] - me[2]) > 0; });
}

/** The release asset a picture is uploaded as: Badge/Extras-blue-light-rest, after, is shot-Badge-Extras-after.png. */
export const assetName = (name, when) => `shot-${name.replace(SHOT, '').replace(/[^\w-]+/g, '-')}-${when}.png`;

/** Markdown for the stories whose picture changed or is new. `changes` is Visual's report (changes-<shard>.json, joined). */
export function screenshotNotes({ changes, prev, tag, repo, max = 12 }) {
  const rows = changes.filter((c) => (c.kind === 'changed' || c.kind === 'added') && SHOT.test(c.name));
  if (!rows.length) return '';
  const url = (f) => `https://github.com/${repo}/releases/download/${tag}/${f}`;
  const name = (n) => n.replace(SHOT, '').split('/').join(' / ');
  const img = (n, when, label) => `<img src="${url(assetName(n, when))}" width="360" alt="${name(n)}, ${label}">`;
  const changed = rows.filter((c) => c.kind === 'changed'), added = rows.filter((c) => c.kind === 'added');
  const out = ['### On screen', '', `The stories that look different, in Blue Light at rest: before (${prev}) and after (${tag}).`, ''];
  if (changed.length) {
    out.push('| Story | Before | After |', '| --- | --- | --- |');
    for (const c of changed.slice(0, max)) out.push(`| ${name(c.name)} | ${img(c.name, 'before', prev)} | ${img(c.name, 'after', tag)} |`);
    if (changed.length > max) out.push('', `And ${changed.length - max} more: ${changed.slice(max).map((c) => name(c.name)).join(', ')}.`);
    out.push('');
  }
  if (added.length) {
    out.push('New stories:', '');
    for (const c of added.slice(0, max)) out.push(`- ${name(c.name)}<br>${img(c.name, 'after', tag)}`);
    if (added.length > max) out.push(`- And ${added.length - max} more: ${added.slice(max).map((c) => name(c.name)).join(', ')}.`);
    out.push('');
  }
  return out.join('\n');
}

/** The files to attach for the notes: [asset name, picture in the report] for each picture the notes show. */
export function assets(changes, dir, max = 12) {
  const rows = changes.filter((c) => (c.kind === 'changed' || c.kind === 'added') && SHOT.test(c.name));
  const changed = rows.filter((c) => c.kind === 'changed').slice(0, max), added = rows.filter((c) => c.kind === 'added').slice(0, max);
  return [...changed.flatMap((c) => [[assetName(c.name, 'before'), path.join(dir, `${c.name}.before.png`)], [assetName(c.name, 'after'), path.join(dir, `${c.name}.png`)]]),
    ...added.map((c) => [assetName(c.name, 'after'), path.join(dir, `${c.name}.png`)])];
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const [tag, prev, dir] = process.argv.slice(2);
  if (!tag || !prev || !dir) { console.error('node tools/release-screenshots.mjs <tag> <prev-tag> <report-dir>'); process.exit(2); }
  const repo = process.env.GITHUB_REPOSITORY;
  const changes = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^changes-\d+\.json$/.test(f)).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) : [];
  const md = screenshotNotes({ changes, prev, tag, repo });
  if (!md) { console.log(`Nothing looks different between ${prev} and ${tag}.`); process.exit(0); }
  const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8' });
  const body = JSON.parse(gh('release', 'view', tag, '--repo', repo, '--json', 'body')).body;
  if (body.includes('### On screen')) { console.log(`${tag}'s notes have their pictures already.`); process.exit(0); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
  const files = assets(changes, dir).map(([name, from]) => { const to = path.join(tmp, name); fs.copyFileSync(from, to); return to; });
  gh('release', 'upload', tag, ...files, '--repo', repo, '--clobber');
  const notes = path.join(tmp, 'notes.md');
  // The pictures go above the package's SHA-256 line, which stays the notes' last.
  const at = body.lastIndexOf('\n**');
  fs.writeFileSync(notes, at >= 0 ? `${body.slice(0, at).trimEnd()}\n\n${md}\n${body.slice(at + 1)}` : `${body.trimEnd()}\n\n${md}\n`);
  gh('release', 'edit', tag, '--repo', repo, '--notes-file', notes);
  console.log(`Added ${files.length} pictures to ${tag}'s notes.`);
}
