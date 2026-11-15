import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { coarsePointer } from '../../tools/test/vitest/helpers';
import { Rating } from '../components/Rating/Rating';
import { SortableList } from '../components/SortableList/SortableList';
import { Kanban } from '../components/Kanban/Kanban';

// Touch-sized stars and drag handles (EQ1): on a touch screen a Rating star and the drag handles of SortableList and
// Kanban take a press 44px high, as Apple and Material ask, with nothing moving; with a mouse they keep their 24px,
// so a press 18px above or below the middle misses.
const ITEMS = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }];
function Page() {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '64px', width: '480px' }}>
    <Rating aria-label="Your rating" />
    <SortableList aria-label="Missions" items={ITEMS} getKey={(i) => i.id} getLabel={(i) => i.name} renderItem={(i) => i.name} onReorder={() => {}} />
    <Kanban aria-label="Sprint" columns={[{ id: 'todo', title: 'To do', items: ITEMS }]} getKey={(x) => x.id} getLabel={(x) => x.name} renderCard={(x) => x.name} onMove={() => {}} />
  </div>;
}
const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
/** Does a press 18px above and 18px below the middle of `sel` land on it (or the radio inside it)? */
const around = (sel: string, target: string) => {
  const el = $(sel); el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, want = el.matches(target) ? el : el.querySelector(target);
  const hit = (dy: number) => document.elementFromPoint(x, y + dy)?.closest(target) === want;
  return [hit(-18), hit(18)];
};
const all = () => ({
  star: around('.dk-rating__star', '.dk-rating__choice'),
  list: around('.dk-sortable-list__handle', '.dk-sortable-list__handle'),
  kanban: around('.dk-kanban__handle', '.dk-kanban__handle'),
});

describe('touch-sized stars and drag handles', () => {
  test('with a mouse: a press 18px above or below a star or a handle misses it', async () => {
    await render(<Page />);
    expect(all()).toEqual({ star: [false, false], list: [false, false], kanban: [false, false] });
  });

  test('on a touch screen: a star or a handle takes a press 18px above or below its middle', async () => {
    await render(<Page />);
    await coarsePointer(async (active) => {
      if (!active) return;
      expect(all()).toEqual({ star: [true, true], list: [true, true], kanban: [true, true] });
    });
  });
});
