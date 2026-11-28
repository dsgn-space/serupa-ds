// The docs' own helpers that read the project's files: a component's changes from CHANGELOG.md (docs/changes.ts) and
// how the label table shows a label (docs/labelWord.ts).
//   node tools/test/docs-helpers.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, done, report } from './lib.mjs';
import { changesFor } from '../../docs/changes.ts';
import { BUILT, labelWord } from '../../docs/labelWord.ts';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

// The older releases' headings have no brackets (## 7.1.0 - 2026-10-18): each entry still goes with its own version.
const log = '# Changelog\n\n## [Unreleased]\n\n## 9.0.0 - 2026-10-20\n\n### Fixed\n\n- **Button**: nine.\n\n## [8.0.0] - 2026-10-19\n\n### Fixed\n\n- **Button**: eight.\n\n## 7.1.0 - 2026-10-18\n\n### Added\n\n- **Button**: seven.\n';
const got = changesFor('Button', log).map((c) => `${c.version} ${c.date} ${c.kind} ${c.text}`);
t('each change goes with its own release, with or without brackets round the version', JSON.stringify(got) === JSON.stringify(['9.0.0 2026-10-20 Fixed **Button**: nine.', '8.0.0 2026-10-19 Fixed **Button**: eight.', '7.1.0 2026-10-18 Added **Button**: seven.']), JSON.stringify(got));
const real = changesFor('Button', fs.readFileSync(path.join(PROJECT, 'CHANGELOG.md'), 'utf8'));
const versions = new Set(real.map((c) => c.version.split('.')[0]));
t(`Button's changes in CHANGELOG.md span its majors, the old unbracketed ones too (${versions.size})`, ['1', '2', '3', '4'].some((v) => versions.has(v)), [...versions].join(', '));

// A label that is a function is shown with a letter for each argument; one that can't be shown that way says so.
t('a label shown with a letter for each argument', labelWord((n, total) => `Step ${n} of ${total}`) === 'Step n of m' && labelWord((a, b, c) => `${a}–${b} of ${c}`) === 'n–m of k', labelWord((n, total) => `Step ${n} of ${total}`));
t('a string label as it is', labelWord('Close') === 'Close');
t('a label that looks a word up, gives nothing or throws is "(built from its arguments)"', [labelWord((k) => ({ bar: 'Bar chart' })[k]), labelWord(() => ''), labelWord((list) => list.join(' / ')), labelWord((c) => `${String({ red: 'Red' }[c]).replace(/^./, (x) => x.toUpperCase())}`)].every((w) => w === BUILT));

done(report('Docs helpers', R));
