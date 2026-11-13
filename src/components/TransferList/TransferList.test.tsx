import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Field } from '../Field/Field';
import { TransferList } from './TransferList';

const options = [
  { value: 'name', label: 'Name' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' }, { value: 'id', label: 'ID', disabled: true },
];
const active = () => document.activeElement as HTMLElement;
const list = (n: string) => page.getByRole('group', { name: new RegExp('^' + n) });
const items = (n: string) => list(n).getByRole('checkbox').elements().map((e) => e.closest('label')?.textContent?.trim() || e.getAttribute('aria-label'));
const said = () => document.querySelector('[data-dk-announcer]')?.textContent || '';
// A list's title: what names its group of boxes; its parent is the bordered list.
const title = (n: string) => document.getElementById(list(n).element().getAttribute('aria-labelledby')!)!;
const en = (ui: React.ReactNode) => <SerupaProvider locale="en-US">{ui}</SerupaProvider>;

describe('TransferList', () => {
  test('a group named by its label, holding Available and Chosen, each named with its count; ref, className and props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(en(<TransferList id="t" ref={ref} className="extra" data-x="y" aria-label="Columns" options={options} defaultValue={['email', 'id']} />));
    const root = document.getElementById('t')!;
    expect([root.getAttribute('role'), root.getAttribute('aria-label'), ref.current === root, root.className, root.dataset.x, root.dataset.component])
      .toEqual(['group', 'Columns', true, 'dk-transfer-list extra', 'y', 'transfer-list']);
    expect([list('Available').element().getAttribute('aria-labelledby') !== null, document.getElementById(list('Available').element().getAttribute('aria-labelledby')!)?.textContent]).toEqual([true, 'Available (3)']);
    expect(items('Available')).toEqual(['All', 'Name', 'Phone', 'Company']);
    expect(items('Chosen')).toEqual(['All', 'Email', 'ID']);
  });

  test('Add moves the checked ones to the end of Chosen and says so; Remove puts them back in their place; focus stays on the button', async () => {
    const onValueChange = vi.fn();
    const screen = await render(en(<TransferList aria-label="Columns" options={options} defaultValue={['email']} onValueChange={onValueChange} />));
    await screen.getByRole('checkbox', { name: 'Company' }).click();
    await screen.getByRole('checkbox', { name: 'Name' }).click();
    const add = screen.getByRole('button', { name: 'Add' });
    await add.click();
    expect(onValueChange).toHaveBeenLastCalledWith(['email', 'name', 'company']);
    expect(items('Chosen')).toEqual(['All', 'Email', 'Name', 'Company']);
    await expect.poll(said).toBe('Name and Company moved to Chosen.');
    // Nothing checked now: Add stays reachable, says why it does nothing, and keeps focus.
    expect([active(), add.element().getAttribute('aria-disabled')]).toEqual([add.element(), 'true']);
    expect(add.element().getAttribute('aria-describedby')).toBeTruthy();
    await screen.getByRole('checkbox', { name: 'Email' }).click();
    await screen.getByRole('button', { name: 'Remove' }).click();
    expect(onValueChange).toHaveBeenLastCalledWith(['name', 'company']);
    expect(items('Available')).toEqual(['All', 'Email', 'Phone', 'ID']);
    await expect.poll(said).toBe('Email moved to Available.');
  });

  test('"All" checks every box that can move; a disabled one stays where it is', async () => {
    const onValueChange = vi.fn();
    const screen = await render(en(<TransferList aria-label="Columns" options={options} onValueChange={onValueChange} />));
    await list('Available').getByRole('checkbox', { name: 'All' }).click();
    await screen.getByRole('button', { name: 'Add' }).click();
    expect(onValueChange).toHaveBeenLastCalledWith(['name', 'email', 'phone', 'company']);
    expect(items('Available')).toEqual(['ID']);
  });

  test('an empty list says "None"; with nothing checked, Add and Remove do nothing', async () => {
    const onValueChange = vi.fn();
    const screen = await render(en(<TransferList aria-label="Columns" options={options.slice(0, 2)} onValueChange={onValueChange} />));
    await expect.element(list('Chosen')).not.toBeInTheDocument();
    await expect.element(screen.getByText('None')).toBeVisible();
    // They stay reachable (aria-disabled, so Playwright won't press them): a click from a script does nothing.
    (screen.getByRole('button', { name: 'Add' }).element() as HTMLElement).click();
    (screen.getByRole('button', { name: 'Remove' }).element() as HTMLElement).click();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('controlled: it shows value, and a move only asks', async () => {
    const onValueChange = vi.fn();
    const screen = await render(en(<TransferList aria-label="Columns" options={options} value={['phone']} onValueChange={onValueChange} />));
    await screen.getByRole('checkbox', { name: 'Phone' }).click();
    await screen.getByRole('button', { name: 'Remove' }).click();
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(items('Chosen')).toEqual(['Phone']);
  });

  test('a box checked in one list isn\'t still checked when the app moves its option away and back', async () => {
    const screen = await render(en(<TransferList aria-label="Columns" options={options} value={[]} />));
    await screen.getByRole('checkbox', { name: 'Email' }).click();
    await screen.rerender(en(<TransferList aria-label="Columns" options={options} value={['email']} />));
    await screen.rerender(en(<TransferList aria-label="Columns" options={options} value={[]} />));
    await expect.element(screen.getByRole('checkbox', { name: 'Email' })).not.toBeChecked();
    await expect.element(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-disabled', 'true');
  });

  test('with name, a form submits the chosen values in order, and a reset puts the first ones back', async () => {
    await render(en(<form id="f"><TransferList aria-label="Columns" name="cols" options={options} defaultValue={['phone', 'name']} /></form>));
    const form = document.getElementById('f') as HTMLFormElement;
    expect(new FormData(form).getAll('cols')).toEqual(['phone', 'name']);
    await page.getByRole('checkbox', { name: 'Email' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    expect(new FormData(form).getAll('cols')).toEqual(['phone', 'name', 'email']);
    form.reset();
    await expect.poll(() => new FormData(form).getAll('cols')).toEqual(['phone', 'name']);
  });

  test('disabled: every box and both buttons are off, and nothing is submitted', async () => {
    await render(en(<form id="g"><TransferList aria-label="Columns" name="cols" options={options} defaultValue={['phone']} disabled /></form>));
    expect(page.getByRole('checkbox').elements().every((e) => (e as HTMLInputElement).disabled)).toBe(true);
    expect(page.getByRole('button').elements().every((e) => (e as HTMLButtonElement).disabled)).toBe(true);
    expect(new FormData(document.getElementById('g') as HTMLFormElement).getAll('cols')).toEqual([]);
  });

  test('in a Field, the label names the group and the error marks each box invalid', async () => {
    await render(en(<Field label="Columns" error="Choose at least two."><TransferList options={options} /></Field>));
    await expect.element(page.getByRole('group', { name: 'Columns' })).toBeInTheDocument();
    expect(page.getByRole('checkbox', { name: 'Name' }).element().getAttribute('aria-invalid')).toBe('true');
  });

  test('Indonesian words come from the provider', async () => {
    const screen = await render(<SerupaProvider locale="id-ID" labels={idLabels}><TransferList aria-label="Kolom" options={options} /></SerupaProvider>);
    await expect.element(screen.getByRole('button', { name: 'Tambah' })).toBeInTheDocument();
    expect(title('Tersedia').textContent).toBe('Tersedia (5)');
  });

  test('the lists\' text and count read 4.5:1 on their background in all six themes', async () => {
    await render(en(<TransferList aria-label="Columns" options={options} />));
    const side = title('Available').parentElement!, count = title('Available').lastElementChild as HTMLElement;
    const none = page.getByText('None').element() as HTMLElement, empty = none.parentElement!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(count).color, css(side).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(side).color, css(side).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(none).color, css(empty).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('on a phone the lists stack, with the buttons in a row between them, and nothing scrolls sideways', async () => {
    await page.viewport(360, 720);
    await render(en(<TransferList aria-label="Columns" options={options} />));
    const [a, b] = [title('Available').parentElement!, page.getByText('None').element().parentElement!].map((e) => e.getBoundingClientRect());
    const moves = page.getByRole('button', { name: 'Add' }).element().parentElement!.getBoundingClientRect();
    expect([a!.bottom <= moves.top, moves.bottom <= b!.top]).toEqual([true, true]);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
  });
});
