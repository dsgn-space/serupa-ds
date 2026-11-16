import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { TransferList } from '../components/TransferList/TransferList';

// The groups take readOnly and required as every single control does: read-only shows the state without letting it
// change and still sends it; required stops the form while nothing is chosen.
const options = [{ value: 'ana', label: 'Ana' }, { value: 'budi', label: 'Budi' }];
const formData = () => [...new FormData(document.getElementById('gf') as HTMLFormElement).getAll('x')];

describe('readOnly and required on the groups', () => {
  test('CheckboxGroup readOnly: a click changes nothing, each box is aria-readonly and focusable, and the form still sends the checked ones', async () => {
    let told = 0;
    await render(<form id="gf"><CheckboxGroup aria-label="Team" name="x" defaultValue={['a']} readOnly onValueChange={() => told++}>
      <Checkbox value="a">A</Checkbox><Checkbox value="b">B</Checkbox></CheckboxGroup></form>);
    const b = page.getByRole('checkbox', { name: 'B' });
    await userEvent.click(b);
    await expect.element(b).not.toBeChecked();
    expect([told, b.element().getAttribute('aria-readonly'), (b.element() as HTMLInputElement).disabled, formData()]).toEqual([0, 'true', false, ['a']]);
  });

  test('TransferList readOnly: no Add or Remove, the boxes are read-only, and the form still sends the chosen values', async () => {
    await render(<form id="gf"><TransferList aria-label="Reviewers" options={options} defaultValue={['budi']} name="x" readOnly /></form>);
    expect(page.getByRole('button', { name: /Add|Remove/ }).elements()).toHaveLength(0);
    const ana = page.getByRole('checkbox', { name: 'Ana' });
    await userEvent.click(ana);
    await expect.element(ana).not.toBeChecked();
    expect([ana.element().getAttribute('aria-readonly'), formData()]).toEqual(['true', ['budi']]);
  });

  test('TransferList required: nothing chosen stops the form, the boxes are marked and the first takes focus; a chosen value clears it', async () => {
    let sent = 0;
    await render(<form id="gf" onSubmit={(e) => { e.preventDefault(); sent++; }}><TransferList aria-label="Reviewers" options={options} name="x" required /><button>Send</button></form>);
    const form = document.getElementById('gf') as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(page.getByRole('button', { name: 'Send' }));
    const ana = page.getByRole('checkbox', { name: 'Ana' });
    await expect.poll(() => ana.element().getAttribute('aria-invalid')).toBe('true');
    expect([sent, document.activeElement === page.getByRole('checkbox', { name: /all/i }).element()]).toEqual([0, true]);
    await userEvent.click(ana);
    await userEvent.click(page.getByRole('button', { name: /^Add/ }));
    expect([form.checkValidity(), page.getByRole('checkbox', { name: 'Budi' }).element().getAttribute('aria-invalid')]).toEqual([true, null]);
  });
});
