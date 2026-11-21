// Screenshots in the release notes (94): tools/release-screenshots.mjs picks the previous release's tag and turns
// Visual's report of what changed into a before and after table of the pictures it attaches to the release.
//   node tools/test/release-screenshots.mjs
import { report, done } from './lib.mjs';
import { assets, assetName, isLatest, previousTag, screenshotNotes } from '../release-screenshots.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
t('the previous tag is the highest release below this one, prereleases and other tags left out',
  previousTag(['v9.10.0', 'v9.9.1', 'v10.0.0', 'v10.1.0-beta.1', 'latest', 'v12.0.0'], '10.1.0') === 'v10.0.0' && previousTag(['v1.0.0'], '1.0.0') === null);
t('a release is the latest unless a higher one is out: a 14.x patch after 15.0.0 isn\'t', isLatest(['v14.6.0', 'v14.7.0'], '14.8.0')
  && !isLatest(['v14.7.0', 'v15.0.0', 'v15.0.1'], '14.7.1') && isLatest(['v14.7.0', 'v15.0.0-beta.1', 'latest'], '14.7.1'));
const changes = [{ name: 'Badge/Extras-blue-light-rest', kind: 'changed' }, { name: 'Badge/Extras-blue-dark-rest', kind: 'changed' },
  { name: 'Card/Media-blue-light-rest', kind: 'added' }, { name: 'Card/Old-blue-light-rest', kind: 'removed' }];
const md = screenshotNotes({ changes, prev: 'v12.0.0', tag: 'v12.1.0', repo: 'owner/repo' });
t('a changed story gets a row with its before and after attached to the release; a new one its picture; other themes and removed ones none',
  md.includes('| Badge / Extras | <img src="https://github.com/owner/repo/releases/download/v12.1.0/shot-Badge-Extras-before.png"')
  && md.includes('releases/download/v12.1.0/shot-Badge-Extras-after.png') && md.includes('- Card / Media<br>')
  && !md.includes('Old') && !md.includes('blue-dark') && (md.match(/<img /g) || []).length === 3, md);
const files = assets(changes, '/r');
t('the attached files are the pictures the notes show, from the report', files.length === 3 && files[0][0] === assetName('Badge/Extras-blue-light-rest', 'before')
  && files[0][1] === '/r/Badge/Extras-blue-light-rest.before.png' && files[1][1] === '/r/Badge/Extras-blue-light-rest.png' && files[2][0] === 'shot-Card-Media-after.png', JSON.stringify(files));
t('nothing changed on screen: nothing added', screenshotNotes({ changes: [], prev: 'v1.0.0', tag: 'v1.1.0', repo: 'o/r' }) === '');
const many = Array.from({ length: 15 }, (_, i) => ({ name: `Button/S${i}-blue-light-rest`, kind: 'changed' }));
const capped = screenshotNotes({ changes: many, prev: 'v1.0.0', tag: 'v1.1.0', repo: 'o/r' });
t('more than 12: the rest are named, not shown', (capped.match(/<img /g) || []).length === 24 && /And 3 more: Button \/ S12, Button \/ S13, Button \/ S14\./.test(capped)
  && assets(many, '/r').length === 24);
done(report('Release screenshots', R));
