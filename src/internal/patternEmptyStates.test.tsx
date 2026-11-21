import { describe, expect, test } from 'vitest';

// The patterns' empty states look alike: an icon over the words, with no frame. EmptyState's dashed frame is for a
// drop zone or a slot to fill (its README), and no pattern's empty list is either; the blocks' empties (EmptyStates)
// already follow this.
const sources = import.meta.glob<string>(['../patterns/*/*.tsx', '!../patterns/*/*.stories.tsx', '!../patterns/*/*.test.tsx'], { eager: true, query: '?raw', import: 'default' });

/** Each `<EmptyState …>` opening tag in a source, read up to the `>` outside any `{…}`, so `actions={<Link …/>}` stays inside. */
function emptyStateTags(src: string): string[] {
  const tags: string[] = [];
  for (let i = src.indexOf('<EmptyState'); i !== -1; i = src.indexOf('<EmptyState', i + 1)) {
    if (/\w/.test(src[i + '<EmptyState'.length] ?? '')) continue;
    let depth = 0, j = i + 1;
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
    }
    tags.push(src.slice(i, j + 1));
  }
  return tags;
}

describe('the patterns\' empty states', () => {
  test('reads a tag to its own end, past JSX inside its props', () => {
    expect(emptyStateTags('<EmptyState title="A" actions={<Link href="#">B</Link>} icon="x" /> <EmptyStates />')).toEqual(['<EmptyState title="A" actions={<Link href="#">B</Link>} icon="x" />']);
  });

  test('every one has an icon and none has the dashed frame', () => {
    const off: string[] = [];
    for (const [file, src] of Object.entries(sources)) {
      for (const tag of emptyStateTags(src)) {
        if (!/\sicon=/.test(tag)) off.push(`${file}: no icon`);
        if (/variant="dashed"/.test(tag)) off.push(`${file}: dashed`);
      }
    }
    expect(Object.keys(sources).length).toBeGreaterThan(50);
    expect(off).toEqual([]);
  });
});
