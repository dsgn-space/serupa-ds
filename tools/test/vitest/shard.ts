// The suite's shards (CI runs `--shard=i/n` side by side) split by how long each file takes, not by the hash of its
// path, which put a whole shard's worth of slow files in one: the component tests' base shards took 252, 392 and 538 s
// with 83 files each (activity, hydrateStoriesCsp and leaks in the third), and the checks' put page, size and
// reproducible together (13 Nov).
//
// Vitest takes the sequencer from the root config only (a project's own `sequence.sequencer` is ignored), so this one
// serves every project. Seconds per file, measured on 13 Nov from CI's logs (the component tests on GitHub's x86
// runners, with coverage on); a file not listed counts as 2. Re-measure when one shard runs much longer than the
// others. The component tests run side by side, so their shards' times are not plain sums, but the longest-first
// share keeps both the sums and the longest files apart.
import path from 'node:path';
import { BaseSequencer, type TestSpecification } from 'vitest/node';

export const SECONDS: Record<string, number> = {
  // The checks (one file at a time).
  'tools/test/tree-shake.mjs': 111, 'tools/test/purge-components.mjs': 86, 'tools/test/size.mjs': 44,
  'tools/test/reproducible.mjs': 27, 'tools/test/utilities.mjs': 15, 'tools/test/no-css.mjs': 14,
  'tools/test/browser-baseline.mjs': 10, 'tools/test/package-lint.mjs': 9, 'tools/test/package.mjs': 9,
  'tools/test/props.mjs': 9, 'tools/test/page.mjs': 8, 'tools/test/unused.mjs': 8, 'tools/test/create-app.mjs': 5,
  // The component tests: the story-wide ones go through every story.
  'src/internal/activity.test.tsx': 372, 'src/internal/motion.test.tsx': 284,
  'src/internal/hydrateStoriesCsp.test.tsx': 206, 'src/internal/tabWalk.test.tsx': 205,
  'src/internal/leaks.test.tsx': 116, 'src/internal/layoutShift.test.tsx': 104, 'src/internal/mountTime.test.tsx': 100,
  'src/internal/ariaStories.test.tsx': 100, 'src/components/Badge/Badge.test.tsx': 77,
  'src/internal/hydrateStories.test.tsx': 72, 'src/components/Toast/Toast.test.tsx': 51,
  'src/internal/listRole.test.tsx': 42, 'src/internal/network.test.tsx': 41, 'src/internal/trustedTypes.test.tsx': 41,
  'src/internal/strictCsp.test.tsx': 41, 'src/internal/digitsStories.test.tsx': 39, 'src/internal/propFuzz.test.tsx': 35,
  'src/patterns/SessionTimeout/SessionTimeout.test.tsx': 25, 'src/components/Loader/Loader.test.tsx': 24,
  'src/components/Drawer/Drawer.test.tsx': 23, 'src/components/Combobox/Combobox.test.tsx': 21,
  'src/components/Button/Button.test.tsx': 18, 'src/components/VirtualList/VirtualList.test.tsx': 18,
  'src/components/Table/Table.test.tsx': 17, 'src/patterns/AccountSecurity/AccountSecurity.test.tsx': 17,
  'src/internal/announceContract.test.tsx': 16, 'src/components/SortableList/SortableList.test.tsx': 15,
  'src/components/FileUpload/FileUpload.test.tsx': 14, 'src/components/Kanban/Kanban.test.tsx': 14,
  'src/components/OfflineBanner/OfflineBanner.test.tsx': 13, 'src/components/Tooltip/Tooltip.test.tsx': 12,
  'src/components/Chat/Chat.test.tsx': 12, 'src/components/Menu/Menu.test.tsx': 11,
  'src/internal/formContract.test.tsx': 11, 'src/patterns/TeamMembers/TeamMembers.test.tsx': 11,
  'src/components/Dialog/Dialog.test.tsx': 11, 'src/components/Image/Image.test.tsx': 10,
  'src/patterns/ListSearch/ListSearch.test.tsx': 10, 'src/components/HoverCard/HoverCard.test.tsx': 10,
  'src/components/Navbar/Navbar.test.tsx': 10,
};

/** Longest first, each to the shard with the least so far: every shard gets the same list, so they agree. */
export function shareOut(names: string[], count: number): string[][] {
  const shards = Array.from({ length: count }, () => ({ load: 0, names: [] as string[] }));
  const order = [...new Set(names)].sort((a, b) => (SECONDS[b] ?? 2) - (SECONDS[a] ?? 2) || (a < b ? -1 : 1));
  for (const n of order) {
    const s = shards.reduce((min, x) => (x.load < min.load ? x : min));
    s.load += SECONDS[n] ?? 2;
    s.names.push(n);
  }
  return shards.map((s) => s.names);
}

export class TimedSequencer extends BaseSequencer {
  override async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const { index, count } = this.ctx.config.shard!;
    const name = (f: TestSpecification) => path.relative(this.ctx.config.root, f.moduleId).split(path.sep).join('/');
    const mine = new Set(shareOut(files.map(name), count)[index - 1]);
    return files.filter((f) => mine.has(name(f)));
  }
}
