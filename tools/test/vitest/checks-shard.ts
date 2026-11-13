// The checks shards (CI runs `--shard=i/3` side by side) split by how long each file takes, not by the hash of its
// path: the checks run one file at a time (fileParallelism: false), so a shard lasts as long as its files together,
// and Vitest's own split put page, size and reproducible in one shard (208 s) beside 138 s in the other (13 Nov).
// Seconds per file, measured on 13 Nov with a timing reporter; a file not listed counts as 2. Re-measure when a
// shard runs much longer than the others.
import { BaseSequencer, type TestSpecification } from 'vitest/node';

export const SECONDS: Record<string, number> = {
  'tree-shake.mjs': 111, 'purge-components.mjs': 86, 'size.mjs': 44, 'reproducible.mjs': 27, 'utilities.mjs': 15,
  'no-css.mjs': 14, 'browser-baseline.mjs': 10, 'package-lint.mjs': 9, 'package.mjs': 9, 'props.mjs': 9, 'page.mjs': 8,
  'unused.mjs': 8, 'create-app.mjs': 5,
};

/** Longest first, each to the shard with the least so far: every shard gets the same list, so they agree. */
export function shareOut(names: string[], count: number): string[][] {
  const shards = Array.from({ length: count }, () => ({ load: 0, names: [] as string[] }));
  const order = [...names].sort((a, b) => (SECONDS[b] ?? 2) - (SECONDS[a] ?? 2) || (a < b ? -1 : 1));
  for (const n of order) {
    const s = shards.reduce((min, x) => (x.load < min.load ? x : min));
    s.load += SECONDS[n] ?? 2;
    s.names.push(n);
  }
  return shards.map((s) => s.names);
}

export class ChecksSequencer extends BaseSequencer {
  override async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const { index, count } = this.ctx.config.shard!;
    const name = (f: TestSpecification) => f.moduleId.split('/').pop()!;
    const mine = new Set(shareOut(files.map(name), count)[index - 1]);
    return files.filter((f) => mine.has(name(f)));
  }
}
