// What the package keeps in the browser: SECURITY.md lists every localStorage and sessionStorage key, so an app can
// put them in its privacy notice. This fails when code in src/ uses a storage the table doesn't list for that file,
// when a key written as a string in the code isn't in the table, or when a row names a file or storage the code no
// longer uses. A key the app passes in (storageKey, saveKey) is listed as "your `name`".
//   node tools/test/storage.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, read, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

/** Each (file, storage) the code uses, with the string keys it names: from calls like localStorage.getItem('k'), and
    from a KEY = 'k' that such a call is given. */
export function uses(file, text) {
  const out = new Map();
  const consts = Object.fromEntries([...text.matchAll(/\b([A-Z_]*KEY)\s*=\s*['"]([\w-]+)['"]/g)].map((m) => [m[1], m[2]]));
  for (const m of text.matchAll(/\b(localStorage|sessionStorage)\s*\.\s*(?:getItem|setItem|removeItem)\(\s*(?:['"]([\w-]+)['"]|(\w+))/g)) {
    const keys = out.get(m[1]) || new Set();
    const key = m[2] ?? consts[m[3]];
    if (key) keys.add(key);
    out.set(m[1], keys);
  }
  return [...out].map(([storage, keys]) => ({ file, storage, keys: [...keys] }));
}
/** The table's rows: { file, storage, key }. */
export function rows(md) {
  return [...md.matchAll(/^\| `(src\/[^`]+)` \| (localStorage|sessionStorage) \| ([^|]+) \|/gm)]
    .map((m) => ({ file: m[1], storage: m[2], key: (/^`([^`]+)`$/.exec(m[3].trim()) || [])[1] ?? m[3].trim() }));
}

t('reads storage calls and their keys, and the table rows',
  JSON.stringify(uses('a.js', "var KEY = 'k'; localStorage.getItem(KEY); localStorage.removeItem('old'); window.sessionStorage.setItem(key, v)"))
    === JSON.stringify([{ file: 'a.js', storage: 'localStorage', keys: ['k', 'old'] }, { file: 'a.js', storage: 'sessionStorage', keys: [] }])
  && JSON.stringify(rows('| `src/a.js` | localStorage | `k` | x |\n| `src/b.tsx` | sessionStorage | your `saveKey` | y |'))
    === JSON.stringify([{ file: 'src/a.js', storage: 'localStorage', key: 'k' }, { file: 'src/b.tsx', storage: 'sessionStorage', key: 'your `saveKey`' }]),
  'uses and rows');

const files = fs.readdirSync(path.join(PROJECT, 'src'), { recursive: true }).map((f) => 'src/' + String(f).split(path.sep).join('/'))
  .filter((f) => /\.(tsx?|js)$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f) && !f.endsWith('.d.ts') && !f.includes('/generated/'));
const found = files.flatMap((f) => uses(f, read(f)));
const table = rows(read('SECURITY.md'));
t(`finds the storage calls in src/ (${found.length} file and storage pairs)`, found.length >= 5, 'search src/ for localStorage and sessionStorage');
for (const u of found) {
  const mine = table.filter((r) => r.file === u.file && r.storage === u.storage);
  t(`SECURITY.md lists ${u.file}'s ${u.storage}`, mine.length, `add a row for \`${u.file}\` | ${u.storage} to "What's kept in the browser"`);
  for (const k of u.keys) t(`SECURITY.md lists ${u.file}'s ${u.storage} key ${k}`, mine.some((r) => r.key === k), `add \`${k}\` to its row`);
}
for (const r of table) {
  const u = found.find((x) => x.file === r.file && x.storage === r.storage);
  t(`SECURITY.md's row for ${r.file}, ${r.storage}, ${r.key} matches the code`, u && (r.key.startsWith('your ') || u.keys.includes(r.key)),
    u ? `the code no longer names \`${r.key}\`` : `${r.file} no longer uses ${r.storage}: remove the row`);
}

done(report('Storage', R));
