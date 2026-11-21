import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { coarsePointer } from '../../tools/test/vitest/helpers';
import { Rating } from '../components/Rating/Rating';
import { SortableList } from '../components/SortableList/SortableList';
import { Kanban } from '../components/Kanban/Kanban';
import { Menu, MenuItem } from '../components/Menu/Menu';
import { Button } from '../components/Button/Button';
import { Tabs, TabList, Tab, TabPanel } from '../components/Tabs/Tabs';
import { Sidebar, SidebarItem } from '../components/Sidebar/Sidebar';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';

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
  star: around('.srp-rating__star', '.srp-rating__choice'),
  list: around('.srp-sortable-list__handle', '.srp-sortable-list__handle'),
  kanban: around('.srp-kanban__handle', '.srp-kanban__handle'),
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

// Packed rows (EQ1): menu items, sidebar items, tabs and color swatches sit edge to edge (or a few px apart), so a press
// can't reach past one without taking its neighbour's. On a touch screen the row itself grows to 44px; with a mouse it
// keeps its compact size (32px items and swatches, 36px tabs).
function Rows() {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '64px', width: '480px' }}>
    <Tabs defaultValue="a"><TabList aria-label="Project"><Tab value="a">Overview</Tab><Tab value="b">Activity</Tab></TabList><TabPanel value="a">All good</TabPanel><TabPanel value="b">Nothing new</TabPanel></Tabs>
    <Sidebar aria-label="Main"><SidebarItem href="#home" label="Home" /><SidebarItem href="#inbox" label="Inbox" /></Sidebar>
    <ColorPicker aria-label="Label color" swatches={['#1D4ED8', '#fde047', '#18181b']} />
    <Menu defaultOpen trigger={<Button>Actions</Button>}><MenuItem>Edit</MenuItem><MenuItem>Delete</MenuItem></Menu>
  </div>;
}
const h = (sel: string) => Math.round($(sel).getBoundingClientRect().height);
const rows = () => ({ tab: h('[role="tab"]'), sidebar: h('.srp-sidebar__item'), swatch: h('.srp-color-picker__swatch'), menu: h('[role="menuitem"]') });

describe('touch-sized packed rows', () => {
  test('with a mouse: compact rows', async () => {
    await render(<Rows />);
    await expect.poll(() => document.querySelector('[role="menuitem"]')).toBeTruthy();
    expect(rows()).toEqual({ tab: 36, sidebar: 36, swatch: 32, menu: 32 });
  });

  test('on a touch screen: every row is 44px high', async () => {
    await render(<Rows />);
    await coarsePointer(async (active) => {
      if (!active) return;
      await expect.poll(() => document.querySelector('[role="menuitem"]')).toBeTruthy();
      expect(rows()).toEqual({ tab: 44, sidebar: 44, swatch: 44, menu: 44 });
    });
  });
});
