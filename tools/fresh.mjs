// Fails a pull request, or a merge-queue group, whose screenshots can't match the tree they will merge into: the branch
// changed a component's pictures, and main (since the branch left it) changed that component or the pictures of one
// it shows.
// The queue then fails on Visual after 15 minutes, and every group behind it is built again; this fails in seconds.
//   node tools/fresh.mjs --base <main's commit> --head <the branch's commit>
// It reads both sides' changed files from GitHub (gh api; GH_TOKEN and GH_REPO on a runner) and checks out nothing more.
// A change to the theme on main (tokens.css, the base styles, the fonts) makes every picture the branch drew stale: the
// after-main redraw in visual-baselines.yml draws main's own pictures again, but not a branch's (13 Nov: two new
// patterns drawn before a theme change failed Visual in the queue three times). Other shared code is left to that redraw.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { affectedComponents, withDependents } from './test/lib.mjs';

const VISUAL = /^tools\/test\/baseline-visual\/([A-Z]\w*)\//;
const SCOPED = /^(?:src\/(?:components|blocks|patterns)\/[A-Z]|tools\/test\/baseline-visual\/[A-Z])/;
// What every picture is drawn with: the built tokens (tokens.css, made from tokens/ and tokens.json), the base styles
// and the fonts.
const THEME = /^(?:tokens\.css$|src\/styles\/[^/]+\.css$|fonts\/)/;

// The pictures the branch drew that can't match after the merge: the branch changed a component's pictures, and main
// changed that component (its code or its pictures) or the pictures of one it shows (a pattern showing a Button).
// Only the branch's own pictures count. Where main drew pictures again, the branch's own Visual run (the components it
// changes and every one that uses them) already showed its change moves none of those pictures: otherwise it would
// have drawn them too. Counting them sent a wide pull request back each time main redrew a component it touches,
// faster than a redraw takes; the queue's Visual still checks the merged tree.
// A code change with no picture change (labels, behaviour) moves no picture, here or in what uses it.
export function staleComponents(branchFiles, mainFiles, dependents = withDependents) {
  const side = (files) => {
    const scoped = files.filter((f) => SCOPED.test(f));
    const pictures = new Set(scoped.map((f) => VISUAL.exec(f)?.[1]).filter(Boolean));
    return { pictures, touched: affectedComponents(scoped) ?? new Set(), reach: dependents(pictures) };
  };
  const b = side(branchFiles), m = side(mainFiles);
  if (mainFiles.some((f) => THEME.test(f))) return [...b.pictures].sort();
  const stale = new Set();
  for (const n of b.pictures) if (m.touched.has(n) || m.reach.has(n)) stale.add(n);
  return [...stale].sort();
}

// Through the gh CLI, which every GitHub runner has (GH_TOKEN) and a person is signed in to.
const api = (path) => JSON.parse(execFileSync('gh', ['api', `repos/{owner}/{repo}/${path}`], { encoding: 'utf8', maxBuffer: 64 << 20 }));

// Every file a comparison changed, page by page (a page holds 100).
function changed(base, head) {
  const files = [];
  let mergeBase;
  for (let page = 1; ; page++) {
    const c = api(`compare/${base}...${head}?per_page=100&page=${page}`);
    mergeBase ??= c.merge_base_commit.sha;
    files.push(...(c.files ?? []).flatMap((f) => [f.filename, f.previous_filename].filter(Boolean)));
    if ((c.files ?? []).length < 100) return { files, mergeBase };
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const base = arg('--base'), head = arg('--head');
  if (!base || !head) { console.error('Usage: node tools/fresh.mjs --base <sha> --head <sha>'); process.exit(2); }
  const branch = changed(base, head);
  const main = changed(branch.mergeBase, base);
  const stale = staleComponents(branch.files, main.files);
  if (!stale.length) { console.log(`Fresh: main changed ${main.files.length} files since the branch left it, none in its components' pictures.`); process.exit(0); }
  console.log(`Stale: the pictures of ${stale.join(', ')} can't match main, which changed since this branch left it (${branch.mergeBase.slice(0, 9)}),`);
  console.log('so the queue would fail on Visual. Merge main into the branch, then');
  console.log('add the update-visual-baselines label to draw them again on the merged tree.');
  process.exit(1);
}
