// Fails a pull request, or a merge-queue group, whose screenshots can't match the tree they will merge into: the
// branch and main (since the branch left it) both changed the same component, and one of them changed its pictures.
// The queue then fails on Visual after 15 minutes, and every group behind it is built again; this fails in seconds.
//   node tools/fresh.mjs --base <main's commit> --head <the branch's commit>
// It reads both sides' changed files from GitHub (gh api; GH_TOKEN and GH_REPO on a runner) and checks out nothing more.
// A change outside component, block and pattern folders (tokens, shared code) is left to the after-main redraw in
// visual-baselines.yml, which draws every picture again on main.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { affectedComponents, withDependents } from './test/lib.mjs';

const VISUAL = /^tools\/test\/baseline-visual\/([A-Z]\w*)\//;
const SCOPED = /^(?:src\/(?:components|blocks|patterns)\/[A-Z]|tools\/test\/baseline-visual\/[A-Z])/;

// The components both sides reach (each with the ones that use it), where either side changed that component's pictures.
export function staleComponents(branchFiles, mainFiles, dependents = withDependents) {
  const reach = (files) => dependents(affectedComponents(files.filter((f) => SCOPED.test(f))) ?? new Set());
  const pictures = new Set([...branchFiles, ...mainFiles].map((f) => VISUAL.exec(f)?.[1]).filter(Boolean));
  const main = reach(mainFiles);
  return [...reach(branchFiles)].filter((n) => main.has(n) && pictures.has(n)).sort();
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
  console.log(`Stale: main changed ${stale.join(', ')} since this branch left it (${branch.mergeBase.slice(0, 9)}), and the pictures of`);
  console.log('those components changed on one side, so the queue would fail on Visual. Merge main into the branch, then');
  console.log('add the update-visual-baselines label to draw them again on the merged tree.');
  process.exit(1);
}
