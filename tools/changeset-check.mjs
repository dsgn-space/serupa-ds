// Does this pull request need a changeset, and has it got one? The Changeset workflow runs it on every pull request.
//   node tools/changeset-check.mjs <base commit>
// A change to what a project installs (the components, styles, tokens, fonts, the CLI, the build that makes dist/)
// needs a .changeset/*.md file; tests, stories, docs and the rest of tools/ don't. Fails listing the files, and
// says how to add one, or to label the pull request "no-changeset" when the change really ships nothing new.
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const P = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const base = process.argv[2];
if (!base) { console.error('Usage: node tools/changeset-check.mjs <base commit>'); process.exit(2); }

// What ships: everything a release builds from or puts in the package.
const SHIPS = [/^src\//, /^bin\//, /^fonts\//, /^design-tokens\//, /^tokens\.(json|css)$/, /^tsup\.config\.mjs$/, /^tools\/(build|utilities|icons)\//];
// Inside those, what doesn't reach a project: tests, stories, docs pages and usage guides.
const ASIDE = [/\.test\.tsx?$/, /\.stories\.tsx$/, /\.mdx$/, /\.md$/, /^src\/components\/[^/]+\/preview\.html$/];

const changed = execFileSync('git', ['diff', '--name-status', '--no-renames', `${base}...HEAD`], { cwd: P, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean).map((l) => l.split('\t'));
const shipping = changed.map(([, f]) => f).filter((f) => SHIPS.some((r) => r.test(f)) && !ASIDE.some((r) => r.test(f)));
const changesets = changed.filter(([s, f]) => s !== 'D' && /^\.changeset\/[^/]+\.md$/.test(f) && f !== '.changeset/README.md').map(([, f]) => f);

if (!shipping.length) { console.log('No change to what the package ships: no changeset needed.'); process.exit(0); }
if (changesets.length) { console.log(`Changeset: ${changesets.join(', ')} (for ${shipping.length} shipped file${shipping.length > 1 ? 's' : ''}).`); process.exit(0); }
console.log(`These files change what a project installs, and the pull request has no changeset:\n${shipping.map((f) => '  ' + f).join('\n')}`);
console.log('\nAdd one with npx changeset (see .changeset/README.md). If the change really ships nothing new (a comment, a refactor\nwith identical output), label the pull request "no-changeset".');
process.exit(1);
