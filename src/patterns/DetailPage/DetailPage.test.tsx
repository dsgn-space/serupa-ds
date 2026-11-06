import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { DetailPage } from './DetailPage';

const active = () => document.activeElement as HTMLElement;
const h1 = () => document.querySelector('main h1')?.textContent;
// The toast that says text: its Undo has no aria-label (its words name it), its close button is "Dismiss".
const toastOf = (text: string) => [...document.querySelectorAll('li')].filter((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]')).at(-1) as HTMLElement;
const crumbs = () => [...document.querySelectorAll('nav[aria-label] li')].map((li) => li.textContent?.trim());

// Detail page: where it sits, the name as the h1 and editable in place, tabs, removals with Undo that keep focus in
// the list, and a delete behind typing the name that ends on a page saying it's gone.
describe('Patterns/Detail page', () => {
  test('one main and one h1 (the name), a breadcrumb that ends on the page, tabs that name their panels, the skip link first', async () => {
    const screen = await render(<DetailPage />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length, h1()]).toEqual([1, 1, 'Website redesign']);
    expect(crumbs()).toEqual(['Projects', 'Website redesign']);
    await expect.element(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: 'Website redesign' }).elements()).toHaveLength(0);
    await expect.element(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('a new name saves in place and shows in the h1 and the breadcrumb; an empty one says so and keeps the old', async () => {
    const onRename = vi.fn();
    const screen = await render(<DetailPage onRename={onRename} />);
    await screen.getByRole('button', { name: /Project name/ }).click();
    await userEvent.keyboard('{Control>}a{/Control}Site refresh{Enter}');
    await expect.poll(h1).toBe('Site refresh');
    expect(crumbs().at(-1)).toBe('Site refresh');
    expect(onRename).toHaveBeenCalledWith('name', 'Site refresh');

    await screen.getByRole('button', { name: /Project name/ }).click();
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}{Enter}');
    await expect.element(screen.getByText('Enter a name for the project.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(h1()).toBe('Site refresh');
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  test('removing a task: gone at once, focus on the next Remove, Undo brings it back; without Undo it goes for good', async () => {
    const onRemoveTask = vi.fn();
    const screen = await render(<DetailPage onRemoveTask={onRemoveTask} />);
    await screen.getByRole('tab', { name: 'Tasks' }).click();
    await screen.getByRole('button', { name: 'Remove Pick the photos' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Review the pricing page');
    expect(screen.getByRole('button', { name: 'Remove Pick the photos' }).elements()).toHaveLength(0);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Tasks (3)' })).toBeInTheDocument();
    await userEvent.click(toastOf('Removed “Pick the photos”').querySelector('button:not([aria-label])') as HTMLElement);
    await expect.element(screen.getByRole('button', { name: 'Remove Pick the photos' })).toBeInTheDocument();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Pick the photos');
    expect(onRemoveTask).not.toHaveBeenCalled();

    // Closed without Undo: removed for good.
    await screen.getByRole('button', { name: 'Remove Draft the home page copy' }).click();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Pick the photos');
    await expect.poll(() => toastOf('Removed “Draft the home page copy”')).toBeTruthy();
    (toastOf('Removed “Draft the home page copy”').querySelector('button[aria-label="Dismiss"]') as HTMLElement).click();
    await expect.poll(() => onRemoveTask.mock.calls).toEqual([['t1']]);
  });

  test('removing the last task puts focus on the list\'s heading', async () => {
    const screen = await render(<DetailPage project={{ name: 'Solo', description: '', owner: 'Ana', created: '2026-11-01', tasks: [{ id: 'a', title: 'Only one' }] }} />);
    await screen.getByRole('tab', { name: 'Tasks' }).click();
    await screen.getByRole('button', { name: 'Remove Only one' }).click();
    await expect.poll(() => active().textContent).toBe('Tasks (0)');
    await expect.element(screen.getByText('No tasks left.')).toBeVisible();
  });

  test('delete: a dialog that says what is lost; the button works once the name is typed; then a page that says it\'s gone, its h1 focused', async () => {
    const onDelete = vi.fn(() => Promise.resolve());
    const screen = await render(<DetailPage onDelete={onDelete} />);
    await screen.getByRole('tab', { name: 'Settings' }).click();
    await expect.element(screen.getByRole('region', { name: 'Delete this project' })).toBeVisible();
    await screen.getByRole('button', { name: 'Delete project' }).click();
    const dialog = screen.getByRole('alertdialog', { name: 'Delete Website redesign?' });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toMatch(/4 tasks and files .*can't be undone/);
    // Before the name is typed the button is aria-disabled (focusable, but it does nothing).
    (dialog.getByRole('button', { name: 'Delete this project' }).element() as HTMLElement).click();
    expect(onDelete).not.toHaveBeenCalled();
    await dialog.getByRole('textbox').fill('Website redesign');
    await dialog.getByRole('button', { name: 'Delete this project' }).click();
    await expect.poll(h1).toBe('Website redesign was deleted');
    expect(onDelete).toHaveBeenCalledTimes(1);
    await expect.poll(() => active().tagName).toBe('H1');
    await expect.element(screen.getByRole('link', { name: 'Back to projects' })).toBeInTheDocument();
  });

  test('at 320 px nothing scrolls the page sideways', async () => {
    await render(<div style={{ width: 320 }}><DetailPage /></div>);
    const main = document.querySelector('main') as HTMLElement;
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  });
});
