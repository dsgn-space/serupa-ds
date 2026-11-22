import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { FileBrowser, countFiles, nameProblem, type BrowserFile } from './FileBrowser';
import { SerupaProvider } from '../../internal/provider';
const latin = (t: string | null | undefined) => (t ?? '').replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660));
// A name with its digits in Latin or Arabic-Indic, for a role query that runs in every locale.
const digits = (s: string) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\d/g, (d) => `[${d}${String.fromCharCode(0x660 + Number(d))}]`)}$`);

const active = () => document.activeElement as HTMLElement;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => latin(e.textContent).includes(latin(text)) && e.querySelector('button[aria-label="Dismiss"]'));
const files: BrowserFile[] = [
  { id: 'a', name: 'Logo.svg', kind: 'image', bytes: 18_400, modified: 0 },
  { id: 'b', name: 'Guide.pdf', kind: 'pdf', bytes: 4_820_000, modified: 0 },
  { id: 'c', name: 'Notes.docx', kind: 'doc', bytes: 24_000, modified: 0 },
];
const folders = [{ id: 'x', name: 'Archive' }, { id: 'y', name: 'Marketing', children: [{ id: 'z', name: 'Campaigns' }] }];
const rowNames = () => [...document.querySelectorAll('#file-list [role="row"]')].map((r) => r.getAttribute('aria-label') ?? r.textContent);

// File browser: files picked from a list to move or delete several at once, with Undo, and rename, move and delete
// on each row; focus stays in the list.
describe('Patterns/File browser', () => {
  test('the words for a count and the problems with a name', () => {
    expect([countFiles(1), countFiles(3), countFiles(0)]).toEqual(['1 file', '3 files', '0 files']);
    expect(nameProblem('  ', 'a', files)).toBe('Enter a name.');
    expect(nameProblem('guide.PDF', 'a', files)).toBe('“guide.PDF” is already in this folder. Choose another name.');
    expect([nameProblem('Logo.svg', 'a', files), nameProblem('New.svg', 'a', files)]).toEqual([null, null]);
  });

  test('one main and h1 named by the folder, the skip link first, and a grid of rows with a More button named for each file', async () => {
    const screen = await render(<FileBrowser folder="Brand" files={files} folders={folders} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Brand']);
    await expect.element(screen.getByRole('grid', { name: 'Files in Brand' })).toBeVisible();
    expect(screen.getByRole('row').elements()).toHaveLength(3);
    await expect.element(screen.getByRole('button', { name: 'More for Guide.pdf' })).toBeVisible();
    expect(latin(document.body.textContent)).toContain('3 files');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('picking rows says how many; Delete removes them at once with Undo, focus stays in the list, and onDelete waits for the toast', async () => {
    const onDelete = vi.fn();
    const screen = await render(<FileBrowser files={files} folders={folders} onDelete={onDelete} />);
    await screen.getByRole('checkbox', { name: 'Logo.svg' }).click();
    await screen.getByRole('checkbox', { name: 'Notes.docx' }).click();
    // The count is written in the reader's digits, so the bar is found by its word.
    const bar = screen.getByRole('group', { name: /selected$/ });
    await expect.element(bar).toBeVisible();
    expect(bar.element().textContent).toContain(new Intl.NumberFormat(navigator.language).format(2));
    await bar.getByRole('button', { name: 'Delete' }).click();
    await expect.poll(() => screen.getByRole('row').elements().length).toBe(1);
    await expect.poll(() => toasted('Deleted 2 files')).toBe(true);
    await expect.poll(() => active().closest('#file-list') != null).toBe(true);
    expect(onDelete).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => screen.getByRole('row').elements().length).toBe(3);
    expect(onDelete).not.toHaveBeenCalled();
    // Nothing stays picked after the delete, so the bar is gone.
    expect(screen.getByRole('group', { name: /selected$/ }).elements()).toHaveLength(0);
  });

  test('a row\'s Delete names the file, and deleting the last file moves focus to the h1 of an empty folder', async () => {
    const onDelete = vi.fn();
    const screen = await render(<FileBrowser files={files.slice(0, 1)} folders={folders} onDelete={onDelete} />);
    await screen.getByRole('button', { name: 'More for Logo.svg' }).click();
    await screen.getByRole('menuitem', { name: 'Delete' }).click();
    await expect.poll(() => toasted('Deleted “Logo.svg”')).toBe(true);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'This folder is empty' })).toBeVisible();
    await expect.poll(() => active().tagName).toBe('H1');
    expect(latin(document.body.textContent)).toContain('0 files');
  });

  test('Move asks for a folder, says so when none is chosen, keeps the dialog open on a failure, then moves the files out and says where', async () => {
    let fail = true;
    const onMove = vi.fn((_ids: string[], _to: string) => (fail ? Promise.reject(new Error('offline')) : Promise.resolve()));
    const screen = await render(<FileBrowser files={files} folders={folders} onMove={onMove} defaultSelected={['a', 'b']} />);
    await screen.getByRole('group', { name: /selected$/ }).getByRole('button', { name: 'Move' }).click();
    const dialog = screen.getByRole('dialog', { name: digits('Move 2 files') });
    await dialog.getByRole('button', { name: 'Move' }).click();
    await expect.element(dialog.getByText('Choose a folder.')).toBeVisible();
    expect(onMove).not.toHaveBeenCalled();
    await dialog.getByRole('treeitem', { name: 'Marketing' }).click();
    await dialog.getByRole('button', { name: 'Move' }).click();
    await expect.element(dialog.getByRole('alert').filter({ hasText: /Couldn’t move [2٢] files\. Try again\./ })).toBeVisible();
    await expect.element(dialog.getByRole('treeitem', { name: 'Marketing' })).toHaveAttribute('aria-selected', 'true');
    fail = false;
    await dialog.getByRole('button', { name: 'Move' }).click();
    await expect.poll(() => toasted('Moved 2 files to Marketing')).toBe(true);
    expect(onMove.mock.calls).toEqual([[['a', 'b'], 'y'], [['a', 'b'], 'y']]);
    await expect.poll(() => rowNames().length).toBe(1);
    await expect.poll(() => active().closest('#file-list') != null).toBe(true);
  });

  test('Move: the folders are a tree, and a folder inside another can be chosen from the keyboard', async () => {
    const onMove = vi.fn((_ids: string[], _to: string) => Promise.resolve());
    const screen = await render(<FileBrowser files={files} folders={folders} onMove={onMove} defaultSelected={['a']} />);
    await screen.getByRole('group', { name: /selected$/ }).getByRole('button', { name: 'Move' }).click();
    const dialog = screen.getByRole('dialog');
    const tree = dialog.getByRole('tree', { name: 'Folders' });
    await expect.element(tree).toBeVisible();
    expect(dialog.getByRole('treeitem', { name: 'Campaigns' }).elements()).toHaveLength(0);
    (tree.getByRole('treeitem', { name: 'Archive' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}{Enter}');
    await expect.element(dialog.getByRole('treeitem', { name: 'Campaigns' })).toHaveAttribute('aria-selected', 'true');
    await dialog.getByRole('button', { name: 'Move' }).click();
    await expect.poll(() => onMove.mock.calls).toEqual([[['a'], 'z']]);
  });

  test('Rename checks the name next to the field, sends a good one, shows it in the row, and returns focus to the file\'s More button', async () => {
    const onRename = vi.fn((_id: string, _name: string) => Promise.resolve());
    const screen = await render(<FileBrowser files={files} folders={folders} onRename={onRename} />);
    await screen.getByRole('button', { name: 'More for Logo.svg' }).click();
    await screen.getByRole('menuitem', { name: 'Rename' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Rename' });
    const field = dialog.getByRole('textbox', { name: /^Name/ });
    await expect.element(field).toHaveValue('Logo.svg');
    await field.fill('guide.pdf');
    await dialog.getByRole('button', { name: 'Rename' }).click();
    // Read from the field's own description: the same words are copied into the live region while it's being said.
    await expect.poll(() => (field.element().getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ')).toContain('“guide.pdf” is already in this folder. Choose another name.');
    expect(field.element().getAttribute('aria-invalid')).toBe('true');
    await expect.poll(() => active().id).toBe('file-name');
    expect(onRename).not.toHaveBeenCalled();
    await field.fill(' Mark.svg ');
    await dialog.getByRole('button', { name: 'Rename' }).click();
    await expect.poll(() => onRename.mock.calls).toEqual([['a', 'Mark.svg']]);
    await expect.element(screen.getByRole('button', { name: 'More for Mark.svg' })).toBeVisible();
    await expect.poll(() => active().getAttribute('aria-label')).toBe('More for Mark.svg');
    await expect.poll(() => toasted('Renamed to “Mark.svg”')).toBe(true);
  });

  test('a rename that fails says so in the dialog and keeps what was typed', async () => {
    const screen = await render(<FileBrowser files={files} folders={folders} onRename={() => Promise.reject(new Error('no'))} />);
    await screen.getByRole('button', { name: 'More for Guide.pdf' }).click();
    await screen.getByRole('menuitem', { name: 'Rename' }).click();
    const dialog = screen.getByRole('dialog', { name: 'Rename' });
    await dialog.getByRole('textbox', { name: /^Name/ }).fill('Handbook.pdf');
    await dialog.getByRole('button', { name: 'Rename' }).click();
    await expect.element(dialog.getByRole('alert').filter({ hasText: 'Couldn’t rename “Guide.pdf”. Try again.' })).toBeVisible();
    await expect.element(dialog.getByRole('textbox', { name: /^Name/ })).toHaveValue('Handbook.pdf');
  });

  test('ways out that change nothing: Clear selection, Cancel and Escape in each dialog, and a rename to the same name', async () => {
    const onMove = vi.fn(), onRename = vi.fn();
    const screen = await render(<FileBrowser files={files} folders={folders} onMove={onMove} onRename={onRename} defaultSelected={['a']} />);
    await screen.getByRole('button', { name: 'Clear selection' }).click();
    await expect.element(screen.getByRole('checkbox', { name: 'Logo.svg' })).not.toBeChecked();
    // One file moves from its own menu, without being picked first: the dialog names it.
    await screen.getByRole('button', { name: 'More for Notes.docx' }).click();
    await screen.getByRole('menuitem', { name: 'Move' }).click();
    await expect.element(screen.getByRole('dialog', { name: 'Move “Notes.docx”' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    await screen.getByRole('button', { name: 'More for Notes.docx' }).click();
    await screen.getByRole('menuitem', { name: 'Move' }).click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    await screen.getByRole('button', { name: 'More for Notes.docx' }).click();
    await screen.getByRole('menuitem', { name: 'Rename' }).click();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    await screen.getByRole('button', { name: 'More for Notes.docx' }).click();
    await screen.getByRole('menuitem', { name: 'Rename' }).click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    await screen.getByRole('button', { name: 'More for Notes.docx' }).click();
    await screen.getByRole('menuitem', { name: 'Rename' }).click();
    await screen.getByRole('dialog').getByRole('button', { name: 'Rename' }).click();
    await expect.poll(() => screen.getByRole('dialog').elements().length).toBe(0);
    expect([onMove.mock.calls.length, onRename.mock.calls.length, screen.getByRole('row').elements().length]).toEqual([0, 0, 3]);
  });

  test('the keyboard picks rows: Space on the focused row, and Ctrl+A for every file', async () => {
    const screen = await render(<FileBrowser files={files} folders={folders} />);
    (document.querySelector('#file-list [tabindex="0"]') as HTMLElement).focus();
    await userEvent.keyboard(' ');
    await expect.element(screen.getByRole('checkbox', { name: 'Logo.svg' })).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Guide.pdf' })).not.toBeChecked();
    await userEvent.keyboard('{Control>}a{/Control}');
    await expect.element(screen.getByRole('checkbox', { name: 'Notes.docx' })).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Select all' })).toBeChecked();
  });

  test('while the files load the list is busy and named once; a failed load says so with Try again; an empty folder offers Upload files', async () => {
    const onRetry = vi.fn(), onUpload = vi.fn();
    const screen = await render(<FileBrowser loading />);
    expect(document.querySelector('#file-list[aria-busy="true"]')).not.toBeNull();
    await expect.element(screen.getByText('Loading files')).toBeInTheDocument();
    expect(screen.getByRole('checkbox').elements()).toHaveLength(0);
    await screen.rerender(<FileBrowser loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the files' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalled();
    await screen.rerender(<FileBrowser files={[]} onUpload={onUpload} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'This folder is empty' })).toBeVisible();
    await screen.getByRole('main').getByRole('button', { name: 'Upload files' }).last().click();
    await screen.getByRole('main').getByRole('button', { name: 'Upload files' }).first().click();
    expect(onUpload).toHaveBeenCalledTimes(2);
  });

  test('counts follow the locale’s digits', async () => {
    const bodyText = () => document.body.textContent ?? '';
    expect(countFiles(12, 'ar-EG')).toBe('١٢ files');
    await render(<SerupaProvider locale="ar-EG"><FileBrowser /></SerupaProvider>);
    expect(bodyText()).toContain('٦ files');
  });

  test('"changed 3 hours ago" stays together: the line under a name breaks before "changed", never after it', async () => {
    await render(<FileBrowser files={files} folders={folders} />);
    const whens = [...document.querySelectorAll('#file-list time')].map((t) => t.parentElement!);
    expect(whens.length).toBeGreaterThan(0);
    expect(whens.map((w) => [w.textContent.startsWith('changed'), getComputedStyle(w).whiteSpace])).toEqual(whens.map(() => [true, 'nowrap']));
  });
});
