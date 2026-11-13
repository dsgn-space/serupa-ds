// Screenshots in the release notes (94): tools/release-screenshots.mjs picks the previous release's tag and turns
// the changed visual baselines into a before and after table, against this repository's own history.
//   node tools/test/release-screenshots.mjs
import { execFileSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';
import { isLatest, previousTag, screenshotNotes } from '../release-screenshots.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
t('the previous tag is the highest release below this one, prereleases and other tags left out',
  previousTag(['v9.10.0', 'v9.9.1', 'v10.0.0', 'v10.1.0-beta.1', 'latest', 'v12.0.0'], '10.1.0') === 'v10.0.0' && previousTag(['v1.0.0'], '1.0.0') === null);
t('a release is the latest unless a higher one is out: a 14.x patch after 15.0.0 isn\'t', isLatest(['v14.6.0', 'v14.7.0'], '14.8.0')
  && !isLatest(['v14.7.0', 'v15.0.0', 'v15.0.1'], '14.7.1') && isLatest(['v14.7.0', 'v15.0.0-beta.1', 'latest'], '14.7.1'));
const D = 'tools/test/baseline-visual/';
const status = [`M\t${D}Badge/Extras-blue-light-rest.png`, `M\t${D}Badge/Extras-blue-dark-rest.png`, `M\t${D}Badge/Extras-blue-light-hover.png`,
  `A\t${D}Card/Media-blue-light-rest.png`, `D\t${D}Card/Old-blue-light-rest.png`, `M\ttools/test/other.png`].join('\n');
const md = screenshotNotes({ status, prev: 'v12.0.0', tag: 'v12.1.0', repo: 'owner/repo' });
t('a changed story gets a row with the picture at each tag; a new one its picture; other themes, states and deleted ones none',
  md.includes('| Badge / Extras | <img src="https://github.com/owner/repo/blob/v12.0.0/tools/test/baseline-visual/Badge/Extras-blue-light-rest.png?raw=true"')
  && md.includes('blob/v12.1.0/tools/test/baseline-visual/Badge/Extras-blue-light-rest.png?raw=true') && md.includes('- Card / Media<br>')
  && !md.includes('Old') && !md.includes('blue-dark') && !md.includes('hover') && (md.match(/<img /g) || []).length === 3, md);
t('nothing changed on screen: nothing added', screenshotNotes({ status: `M\tsrc/x.ts`, prev: 'v1.0.0', tag: 'v1.1.0', repo: 'o/r' }) === '');
const many = Array.from({ length: 15 }, (_, i) => `M\t${D}Button/S${i}-blue-light-rest.png`).join('\n');
const capped = screenshotNotes({ status: many, prev: 'v1.0.0', tag: 'v1.1.0', repo: 'o/r' });
t('more than 12: the rest are named, not shown', (capped.match(/<img /g) || []).length === 24 && /And 3 more: Button \/ S12, Button \/ S13, Button \/ S14\./.test(capped));
// The real history: between the last two releases, if this checkout has their tags.
const tags = execFileSync('git', ['tag', '--list', 'v*'], { cwd: PROJECT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const last = previousTag(tags, '999.0.0'), before = last && previousTag(tags, last.slice(1));
if (last && before) {
  const real = execFileSync('git', ['diff', '--name-status', '--no-renames', before, last, '--', 'tools/test/baseline-visual'], { cwd: PROJECT, encoding: 'utf8' });
  const out = screenshotNotes({ status: real, prev: before, tag: last, repo: 'o/r' });
  t(`between ${before} and ${last}: every picture links a baseline that exists at its tag`, !out || [...out.matchAll(/blob\/(v[\d.]+)\/([^?]+)\?raw/g)].every(([, ref, f]) => {
    try { execFileSync('git', ['cat-file', '-e', `${ref}:${f}`], { cwd: PROJECT, stdio: 'ignore' }); return true; } catch { return false; }
  }), out.slice(0, 300));
}
done(report('Release screenshots', R));
