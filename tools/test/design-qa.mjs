// Design QA (96): tools/design-qa.mjs's review sheet groups the changed pictures by story, shows each story's six
// themes at rest before and after, marks which changed, and lists its other changed shots.
//   node tools/test/design-qa.mjs
import { report, done } from './lib.mjs';
import { changedStories, sheet, THEMES } from '../design-qa.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const D = 'tools/test/baseline-visual/';
const status = [`M\t${D}Badge/Extras-blue-light-rest.png`, `M\t${D}Badge/Extras-violet-dark-rest.png`, `M\t${D}Badge/Extras-blue-light-hover.png`,
  `M\t${D}Badge/Extras-axes.png`, `A\t${D}Card/Media-blue-light-rest.png`, `M\t${D}Foundations/Colors.png`, `M\tsrc/x.png`].join('\n');
const stories = changedStories(status);
t('pictures grouped by story; files that aren\'t a story\'s shot are left out', [...stories.keys()].join() === 'Badge/Extras,Card/Media' && stories.get('Badge/Extras').size === 4, [...stories.keys()].join());
const md = sheet({ status, base: 'aaa', head: 'bbb', repo: 'o/r', required: false });
const rows = md.split('\n').filter((l) => /^\| (blue|violet|emerald)/.test(l));
t('each story gets a row per theme, the changed ones marked, with the picture at the base and at the head', rows.length === 2 * THEMES.length
  && rows[0].startsWith('| blue-light (changed) | <img src="https://github.com/o/r/blob/aaa/tools/test/baseline-visual/Badge/Extras-blue-light-rest.png?raw=true"')
  && rows[0].includes('blob/bbb/') && rows[1].startsWith('| blue-dark |') && rows[3].startsWith('| violet-dark (changed)'), rows.slice(0, 4).join('\n'));
t('a new story has no "before"; the other shots that changed are named', /\| blue-light \(changed\) \| new \|/.test(md) && md.includes('Also changed: blue-light-hover, axes.'));
t('not required: says so; required: asks for the label', md.includes('isn\'t required') && sheet({ status, base: 'a', head: 'b', repo: 'o/r', required: true }).includes('add the **design-qa** label'));
t('no picture changed: says there is nothing to review', sheet({ status: `M\tsrc/x.ts`, base: 'a', head: 'b', repo: 'o/r', required: false }).includes('nothing to review'));
// The picture links, parsed, so the check is on each link's host and path rather than on text anywhere in the sheet.
const links = (text) => [...text.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map((m) => new URL(m[0]));
t('on GitLab the pictures are its raw files', links(sheet({ status, base: 'a', head: 'b', repo: 'g/r', required: false, gitlab: 'https://gitlab.com' }))
  .some((u) => u.host === 'gitlab.com' && u.pathname.startsWith('/g/r/-/raw/b/')));
done(report('Design QA', R));
