// tools/visual-review.mjs: the visual review of a pull request (ADR-0016). No network: publishing and the label are
// GitHub's.
//   node tools/test/visual-review.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { approved, filesOf, readChanges, sheet } from '../visual-review.mjs';
import { done, report } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-review-test-'));
fs.writeFileSync(path.join(dir, 'changes-2.json'), JSON.stringify([{ name: 'Tabs/Default-blue-light-rest', kind: 'changed', detail: '1.20% of pixels differ' }]));
fs.writeFileSync(path.join(dir, 'changes-1.json'), JSON.stringify([{ name: 'Badge/New-axes', kind: 'added' }, { name: 'Badge/Old-axes', kind: 'removed' }]));
const changes = readChanges(dir);
t('the shards\' reports are read together, sorted by picture', changes.map((c) => c.name).join() === 'Badge/New-axes,Badge/Old-axes,Tabs/Default-blue-light-rest');
fs.writeFileSync(path.join(dir, 'changes-4.json'), JSON.stringify([{ name: 'playground.stories.tsx/Element-blue-light-rest', kind: 'added' }]));
t('a story without a component folder (src/internal\'s playground) is a picture too', readChanges(dir).some((c) => c.name === 'playground.stories.tsx/Element-blue-light-rest'));
fs.rmSync(path.join(dir, 'changes-4.json'));
t('nothing reported: nothing to review', readChanges(path.join(dir, 'none')).length === 0);
fs.writeFileSync(path.join(dir, 'changes-3.json'), JSON.stringify([{ name: '../../.github/workflows/ci', kind: 'changed' }]));
let refused = false;
try { readChanges(dir); } catch { refused = true; }
t('a name that isn\'t a picture\'s (a path out of the folder) is refused', refused);
for (const name of ['../ci', 'Tabs/../../x', '.git/config', 'Tabs/.hidden', 'a/b/c']) {
  fs.writeFileSync(path.join(dir, 'changes-3.json'), JSON.stringify([{ name, kind: 'added' }]));
  let no = false;
  try { readChanges(dir); } catch { no = true; }
  t(`"${name}" is refused`, no);
}
fs.rmSync(dir, { recursive: true, force: true });
t('an added picture has no before, a removed one no after, a changed one both',
  filesOf(changes[0]).join() === 'Badge/New-axes.png' && filesOf(changes[1]).join() === 'Badge/Old-axes.before.png'
  && filesOf(changes[2]).join() === 'Tabs/Default-blue-light-rest.png,Tabs/Default-blue-light-rest.before.png');
const md = sheet(changes, (f) => `https://example.test/${f}`);
t('the sheet shows main\'s picture beside the branch\'s, and asks for the design-qa label',
  md.includes('https://example.test/Tabs/Default-blue-light-rest.before.png') && md.includes('https://example.test/Tabs/Default-blue-light-rest.png')
  && md.includes('new story') && md.includes('story removed') && md.includes('**design-qa**'));
const marked = sheet([{ name: 'Badge/New-axes', kind: 'added', detail: '1.20% differ <img src="https://elsewhere.invalid/x"> [here](https://elsewhere.invalid) | a\n| b |' + 'x'.repeat(300) }], null);
t('a detail is plain text in its cell: no tag, link or row of its own, and 200 characters at most',
  !/<img|\]\(|\n\| b|a \| /.test(marked) && marked.includes('1.20% differ &#60;img') && !marked.includes('x'.repeat(200)), marked);
t('the sheet with nothing changed says so', sheet([], null).includes('nothing to review'));
t('the sheet stops at its limit and says how many more', sheet(changes, null, 1).includes('And 2 more'));
t('the label added after the last commit counts', approved('2026-11-15T17:00:00Z', '2026-11-15T16:59:00Z'));
t('the label added before the last commit doesn\'t', !approved('2026-11-15T16:00:00Z', '2026-11-15T16:59:00Z'));
t('no label doesn\'t', !approved(null, '2026-11-15T16:59:00Z'));
done(report('Visual review', R));
