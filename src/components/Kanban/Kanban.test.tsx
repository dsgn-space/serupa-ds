import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Kanban, type KanbanColumn, type KanbanMove } from './Kanban';

type T = { id: string; t: string };
const START = (): KanbanColumn<T>[] => [
  { id: 'todo', title: 'To do', items: [{ id: 'a', t: 'Alpha' }, { id: 'b', t: 'Bravo' }, { id: 'c', t: 'Charlie' }] },
  { id: 'doing', title: 'Doing', limit: 1, items: [{ id: 'd', t: 'Delta' }] },
  { id: 'done', title: 'Done', items: [] },
];
const said = (text: string | RegExp) => expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toMatch(text);
// Columns are the board's sections; a column's count sits after its heading.
const columns = () => [...document.querySelectorAll<HTMLElement>('section[data-column]')];
const count = (col: Element) => col.querySelector('h1, h2, h3, h4, h5, h6')!.nextElementSibling!;
const names = () => columns().map((c) => c.querySelector('h3')!.textContent + ': ' + [...c.querySelectorAll<HTMLElement>('li[data-key]')].map((li) => li.dataset.key).join(''));
const handle = (name: string) => page.getByRole('button', { name: 'Move ' + name, exact: true });

function Board({ moves, dir, start }: { moves?: KanbanMove<T>[]; dir?: 'rtl'; start?: KanbanColumn<T>[] }) {
  const [cols, setCols] = React.useState(start || START());
  return <div dir={dir} style={{ width: '1000px' }}><Kanban aria-label="Sprint" columns={cols} getKey={(x) => x.id} getLabel={(x) => x.t} renderCard={(x) => x.t}
    onMove={(next, m) => { if (moves) moves.push(m); setCols(next); }} /></div>;
}

describe('Kanban', () => {
  test('a named group of columns, each a section headed by its title with a list of its cards; ref, className and props reach the board', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Kanban ref={ref} id="k" className="extra" data-x="y" aria-label="Sprint" columns={START()} getKey={(x) => x.id} getLabel={(x) => x.t} renderCard={(x) => x.t} onMove={() => {}} />);
    const k = document.getElementById('k')!;
    expect([ref.current === k, k.className, k.dataset.x, k.dataset.component]).toEqual([true, 'dk-kanban extra', 'y', 'kanban']);
    await expect.element(page.getByRole('group', { name: 'Sprint' })).toBeVisible();
    await expect.element(page.getByRole('region', { name: 'To do' })).toBeVisible();
    await expect.element(page.getByRole('list', { name: 'To do' })).toBeVisible();
    expect(names()).toEqual(['To do: abc', 'Doing: d', 'Done: ']);
  });

  test('each column shows its count; over its limit it says "Over limit" in words; an empty column says "No cards"', async () => {
    await render(<Board start={[...START().slice(0, 2), { id: 'done', title: 'Done', items: [] }].map((c, i) => i === 1 ? { ...c, items: [...c.items, { id: 'e', t: 'Echo' }] } : c)} />);
    const counts = columns().map((c) => count(c).textContent);
    expect(counts).toEqual(['3', '2 of 1Over limit', '0']);
    expect(document.querySelector('li:not([data-key])')!.textContent).toBe('No cards');
  });

  test('keyboard: Space picks a card up, Down moves it, Right moves it to the next column, Space drops it; each step is said and onMove gets the move', async () => {
    const moves: KanbanMove<T>[] = [];
    await render(<Board moves={moves} />);
    await userEvent.click(handle('Alpha'));
    await said('Picked up Alpha. To do, position 1 of 3.');
    await expect.element(handle('Alpha')).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await said('Alpha, To do, position 2 of 3.');
    await userEvent.keyboard('{ArrowRight}');
    await said('Alpha, Doing, position 2 of 2.');
    expect(document.activeElement).toBe(handle('Alpha').element());
    await userEvent.keyboard(' ');
    await said('Alpha moved to Doing, position 2 of 2.');
    expect(names()).toEqual(['To do: bc', 'Doing: da', 'Done: ']);
    expect(moves.map((m) => [m.item.id, m.from, m.to])).toEqual([['a', { column: 'todo', index: 0 }, { column: 'doing', index: 1 }]]);
    expect(document.activeElement).toBe(handle('Alpha').element());
  });

  test('Escape puts the card back and says so; nothing is reported', async () => {
    const moves: KanbanMove<T>[] = [];
    await render(<Board moves={moves} />);
    await userEvent.click(handle('Bravo'));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{Escape}');
    await said('Cancelled. Bravo is back in To do, position 2 of 3.');
    expect([names(), moves.length]).toEqual([['To do: abc', 'Doing: d', 'Done: '], 0]);
  });

  test('Home and End go to the top and bottom; Left at the first column and Up at the top stay put', async () => {
    await render(<Board />);
    await userEvent.click(handle('Bravo'));
    await userEvent.keyboard('{End}');
    await said('Bravo, To do, position 3 of 3.');
    await userEvent.keyboard('{Home}');
    await said('Bravo, To do, position 1 of 3.');
    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    await said('Bravo, To do, position 1 of 3.');
    await userEvent.keyboard('{Escape}');
    expect(names()).toEqual(['To do: abc', 'Doing: d', 'Done: ']);
  });

  test('right to left: Left moves to the next column in reading order', async () => {
    await render(<Board dir="rtl" />);
    await userEvent.click(handle('Alpha'));
    await userEvent.keyboard('{ArrowLeft}');
    await said('Alpha, Doing, position 1 of 2.');
    expect(names()).toEqual(['To do: bc', 'Doing: ad', 'Done: ']);
    await userEvent.keyboard('{Escape}');
  });

  test('Tab away cancels the move', async () => {
    await render(<Board />);
    await userEvent.click(handle('Alpha'));
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.tab();
    await said('Cancelled. Alpha is back in To do, position 1 of 3.');
    expect(names()).toEqual(['To do: abc', 'Doing: d', 'Done: ']);
  });

  test('"Move to…" moves the card to the end of the chosen column and keeps focus on it (a way without dragging)', async () => {
    const moves: KanbanMove<T>[] = [];
    await render(<Board moves={moves} />);
    await userEvent.click(page.getByRole('button', { name: 'Move Charlie to…' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Done' }));
    await expect.poll(names).toEqual(['To do: ab', 'Doing: d', 'Done: c']);
    await said('Charlie moved to Done, position 1 of 1.');
    await expect.poll(() => document.activeElement).toBe(handle('Charlie').element());
    expect(moves[0].to).toEqual({ column: 'done', index: 0 });
  });

  test('"Move to…" lists only the other columns', async () => {
    await render(<Board />);
    await userEvent.click(page.getByRole('button', { name: 'Move Delta to…' }));
    const items = [...document.querySelectorAll('[role=menuitem]')].map((m) => m.textContent);
    expect(items).toEqual(['To do', 'Done']);
    await userEvent.keyboard('{Escape}');
  });

  test('pointer: dragging a handle onto another column drops the card there', async () => {
    const moves: KanbanMove<T>[] = [];
    await render(<Board moves={moves} />);
    const h = handle('Alpha').element(), target = document.querySelectorAll('ul[role=list]')[2];
    const a = h.getBoundingClientRect(), b = target.getBoundingClientRect();
    h.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, clientX: a.x + 4, clientY: a.y + 4 }));
    for (let i = 1; i <= 5; i++) window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: a.x + 4 + (b.x + 40 - a.x) * i / 5, clientY: a.y + 4 + (b.y + 10 - a.y) * i / 5 }));
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: b.x + 40, clientY: b.y + 10 }));
    await expect.poll(names).toEqual(['To do: bc', 'Doing: d', 'Done: a']);
    expect(moves[0].to).toEqual({ column: 'done', index: 0 });
  });

  test('a pointer drag that is cancelled changes nothing', async () => {
    const moves: KanbanMove<T>[] = [];
    await render(<Board moves={moves} />);
    const h = handle('Alpha').element(), a = h.getBoundingClientRect();
    h.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 2, clientX: a.x, clientY: a.y }));
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 2, clientX: a.x + 400, clientY: a.y }));
    window.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 2, clientX: a.x + 400, clientY: a.y }));
    await said(/^Cancelled/);
    expect([names(), moves.length]).toEqual([['To do: abc', 'Doing: d', 'Done: '], 0]);
  });

  test('disabled: no handles and no menus', async () => {
    await render(<Kanban id="dk" aria-label="S" disabled columns={START()} getKey={(x) => x.id} getLabel={(x) => x.t} renderCard={(x) => x.t} onMove={() => {}} />);
    expect(document.getElementById('dk')!.querySelectorAll('button')).toHaveLength(0);
  });

  test('headingLevel sets the column headings', async () => {
    await render(<Kanban aria-label="S" headingLevel={2} columns={START()} getKey={(x) => x.id} getLabel={(x) => x.t} renderCard={(x) => x.t} onMove={() => {}} />);
    await expect.element(page.getByRole('heading', { level: 2, name: 'Doing' })).toBeVisible();
  });

  test('its words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels}><Board /></SerupaProvider>);
    await expect.element(page.getByRole('button', { name: 'Pindahkan Alpha', exact: true })).toBeVisible();
    expect(count(columns()[1]).textContent).toBe('1 dari 1');
  });

  test('a narrow board scrolls sideways in its own box, not the page', async () => {
    await render(<div style={{ width: '320px' }}><Kanban id="n" aria-label="S" columns={START()} getKey={(x) => x.id} getLabel={(x) => x.t} renderCard={(x) => x.t} onMove={() => {}} /></div>);
    const n = document.getElementById('n')!;
    expect([n.getBoundingClientRect().width <= 320, n.scrollWidth > n.clientWidth, css(n).overflowX]).toEqual([true, true, 'auto']);
  });

  test('text, counts and "Over limit" read 4.5:1 and the handle 3:1 on the column and card, in all six themes', async () => {
    await render(<Board start={START().map((c, i) => i === 1 ? { ...c, items: [...c.items, { id: 'e', t: 'Echo' }] } : c)} />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const col = columns()[0], card = document.querySelector('li[data-key]')!;
      const colBg = css(col).backgroundColor, cardBg = css(card).backgroundColor;
      expect(contrast(css(col.querySelector('h3')).color, colBg), th + ' title').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(count(col)).color, colBg), th + ' count').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(count(columns()[1])).color, colBg), th + ' over').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(card.lastElementChild).color, cardBg), th + ' card').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(card.querySelector('button')).color, cardBg), th + ' handle').toBeGreaterThanOrEqual(3);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
