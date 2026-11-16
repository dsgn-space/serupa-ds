import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { TaskBoard, countTasks, overLimit, putBack, type BoardColumn } from './TaskBoard';
import { SerupaProvider } from '../../internal/provider';
const latin = (t: string | null | undefined) => (t ?? '').replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660));

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => latin(e.textContent).includes(latin(text)) && e.querySelector('button[aria-label="Dismiss"]'));
const a = { id: 'a', title: 'Alpha' }, b = { id: 'b', title: 'Bravo' }, c = { id: 'c', title: 'Charlie' };
const board = (): BoardColumn[] => [
  { id: 'todo', title: 'To do', items: [a, b] },
  { id: 'doing', title: 'Doing', limit: 1, items: [c] },
  { id: 'done', title: 'Done', items: [] },
];
// Each column as "To do: Alpha, Bravo", read from the page.
const shown = () => [...document.querySelectorAll('[data-component="kanban"] section')].map((s) =>
  `${s.querySelector('h2')?.textContent}: ${[...s.querySelectorAll('button[aria-label^="Move "]')].map((k) => /^Move (.*) to…$/.exec(k.getAttribute('aria-label') ?? '')?.[1]).filter(Boolean).join(', ')}`);

// Task board: moves show at once and are saved after, a move that can't be saved goes back and says so, a column
// over its limit says what to do, and a task is added from a dialog.
describe('Patterns/Task board', () => {
  test('the words for a count, the columns over their limit, and a card put back where it came from', () => {
    expect([countTasks(1), countTasks(4)]).toEqual(['1 task', '4 tasks']);
    expect(overLimit(board())).toEqual([]);
    const moved: BoardColumn[] = [{ id: 'todo', title: 'To do', items: [b] }, { id: 'doing', title: 'Doing', limit: 1, items: [c, a] }, { id: 'done', title: 'Done', items: [] }];
    expect(overLimit(moved)).toEqual(['Doing has 2 tasks, over its limit of 1.']);
    const back = putBack(moved, { item: a, from: { column: 'todo', index: 0 }, to: { column: 'doing', index: 1 } });
    expect(back.map((col) => col.items.map((t) => t.id).join(''))).toEqual(['ab', 'c', '']);
    // Put back at the end when the column has since lost the cards that were before it.
    const short = putBack([{ id: 'todo', title: 'To do', items: [] }, { id: 'doing', title: 'Doing', items: [b] }], { item: b, from: { column: 'todo', index: 1 }, to: { column: 'doing', index: 0 } });
    expect(short.map((col) => col.items.length)).toEqual([1, 0]);
  });

  test('one main and h1 named by the board, the skip link first, columns as h2 sections, and how many tasks', async () => {
    const screen = await render(<TaskBoard title="Sprint 7" columns={board()} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Sprint 7']);
    expect(screen.getByRole('heading', { level: 2 }).elements().map((h) => h.textContent)).toEqual(['To do', 'Doing', 'Done']);
    expect(latin(document.body.textContent)).toContain('3 tasks');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('a move shows at once, is sent to onMove, and a column over its limit says which and what to do', async () => {
    const onMove = vi.fn(() => Promise.resolve());
    const screen = await render(<TaskBoard columns={board()} onMove={onMove} />);
    expect(screen.getByRole('status').filter({ hasText: 'over its limit' }).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Move Alpha to…' }).click();
    await screen.getByRole('menuitem', { name: 'Doing' }).click();
    await expect.poll(shown).toEqual(['To do: Bravo', 'Doing: Charlie, Alpha', 'Done: ']);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect((onMove.mock.calls[0] as unknown[])[0]).toMatchObject({ item: { id: 'a' }, from: { column: 'todo', index: 0 }, to: { column: 'doing', index: 1 } });
    await expect.element(screen.getByRole('status').filter({ hasText: 'Doing has 2 tasks, over its limit of 1.' })).toBeVisible();
    expect(latin(document.body.textContent)).toContain('Finish or move a task before starting another.');
  });

  test('a move that can\'t be saved puts the card back and says which card and where it is', async () => {
    const screen = await render(<TaskBoard columns={board()} onMove={() => Promise.reject(new Error('offline'))} />);
    await screen.getByRole('button', { name: 'Move Bravo to…' }).click();
    await screen.getByRole('menuitem', { name: 'Done' }).click();
    await expect.poll(() => toasted('Couldn’t move “Bravo”')).toBe(true);
    expect(toasted('It’s back in To do. Try again.')).toBe(true);
    await expect.poll(shown).toEqual(['To do: Alpha, Bravo', 'Doing: Charlie', 'Done: ']);
  });

  test('New task asks for a title next to the field, keeps the dialog open on a failure, then adds the card and returns focus to New task', async () => {
    let fail = true;
    const onAdd = vi.fn((_d: { title: string; column: string }) => (fail ? Promise.reject(new Error('offline')) : Promise.resolve('d')));
    const screen = await render(<TaskBoard columns={board()} onAdd={onAdd} />);
    await screen.getByRole('button', { name: 'New task' }).click();
    const dialog = screen.getByRole('dialog', { name: 'New task' });
    await dialog.getByRole('button', { name: 'Add task' }).click();
    // The field's own message, not the live region that says it too (while it still holds the words, getByText finds two).
    await expect.poll(() => dialog.getByText('Enter a title for the task.').elements().filter((e) => !e.closest('[data-dk-announcer], [data-dk-announcer-assertive]') && e.checkVisibility()).length).toBe(1);
    await expect.poll(() => active().id).toBe('task-title');
    expect(onAdd).not.toHaveBeenCalled();
    await dialog.getByRole('textbox', { name: /^Title/ }).fill(' Delta ');
    await dialog.getByRole('combobox', { name: 'Column' }).selectOptions('done');
    await dialog.getByRole('button', { name: 'Add task' }).click();
    // By its words: a toast from an earlier test can still be showing, and it's an alert too.
    await expect.element(dialog.getByRole('alert').filter({ hasText: 'Couldn’t add the task. Try again.' })).toBeVisible();
    await expect.element(dialog.getByRole('textbox', { name: /^Title/ })).toHaveValue(' Delta ');
    fail = false;
    await dialog.getByRole('button', { name: 'Add task' }).click();
    await expect.poll(shown).toEqual(['To do: Alpha, Bravo', 'Doing: Charlie', 'Done: Delta']);
    expect(onAdd.mock.calls.at(-1)).toEqual([{ title: 'Delta', column: 'done' }]);
    await expect.poll(() => toasted('Added “Delta” to Done')).toBe(true);
    await expect.poll(() => latin(active().textContent)).toBe('New task');
    expect(latin(document.body.textContent)).toContain('4 tasks');
    // The new card moves like the others.
    await expect.element(screen.getByRole('button', { name: 'Move Delta to…' })).toBeVisible();
  });

  test('Cancel and Escape close New task without adding, and it opens empty again', async () => {
    const onAdd = vi.fn();
    const screen = await render(<TaskBoard columns={board()} onAdd={onAdd} />);
    await screen.getByRole('button', { name: 'New task' }).click();
    await screen.getByRole('dialog').getByRole('textbox', { name: /^Title/ }).fill('Delta');
    await screen.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    await screen.getByRole('button', { name: 'New task' }).click();
    await expect.element(screen.getByRole('dialog').getByRole('textbox', { name: /^Title/ })).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    expect(onAdd).not.toHaveBeenCalled();
    expect(latin(document.body.textContent)).toContain('3 tasks');
  });

  test('while the tasks load the board is busy with no cards and New task waits; a failed load says so with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<TaskBoard columns={board()} loading />);
    expect(document.querySelector('[data-component="kanban"][aria-busy="true"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /^Move .* to…$/ }).elements()).toHaveLength(0);
    await expect.element(screen.getByRole('button', { name: 'New task' })).toBeDisabled();
    await screen.rerender(<TaskBoard columns={board()} loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the board' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalled();
  });

  test('counts follow the locale’s digits', async () => {
    const bodyText = () => document.body.textContent ?? '';
    expect(countTasks(12, 'ar-EG')).toBe('١٢ tasks');
    expect(overLimit([{ id: 'c', title: 'Doing', limit: 1, items: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] }], 'ar-EG')).toEqual(['Doing has ٢ tasks, over its limit of ١.']);
    await render(<SerupaProvider locale="ar-EG"><TaskBoard /></SerupaProvider>);
    expect(bodyText()).toContain('٧ tasks');
  });

  test('the cards that arrive once loading ends are the ones on the board', async () => {
    const screen = await render(<TaskBoard loading columns={[]} />);
    await screen.rerender(<TaskBoard columns={board()} />);
    await expect.poll(shown).toEqual(['To do: Alpha, Bravo', 'Doing: Charlie', 'Done: ']);
  });
});
