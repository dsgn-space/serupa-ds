import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { FieldList, type FieldListProps } from './FieldList';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const phone = (i: number) => 'Phone ' + (i + 1);
// The words the polite announcer holds now.
const said = () => document.querySelector('[data-dk-announcer]')?.textContent || '';
// A list of phone numbers, one field a row, named for a plain form submit.
function Phones(props: Partial<FieldListProps<string>> & { ref?: React.Ref<HTMLFieldSetElement> }) {
  return (
    <FieldList<string> id="fl" label="Phone numbers" itemLabel={phone} addLabel="Add phone" newItem={() => ''} name="phones" defaultValue={['0812', '0813']} {...props}>
      {(row, s) => <input aria-label={'Number ' + (s.index + 1)} name={s.name('number')} value={row} aria-invalid={s.error ? true : undefined} onChange={(e) => s.update(e.target.value)} />}
    </FieldList>
  );
}
const groups = () => page.getByRole('group').elements().filter((g) => g.getAttribute('data-row-key') != null);
const values = () => Array.from(el('fl').querySelectorAll<HTMLInputElement>('input')).map((i) => i.value);

describe('FieldList', () => {
  test('a <fieldset> named by its legend; ref, className and other props reach it; each row is a group named by itemLabel', async () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    await render(<Phones ref={ref} className="extra" data-x="y" />);
    const e = el('fl');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['FIELDSET', true, 'dk-field-list extra', 'y', 'field-list']);
    await expect.element(page.getByRole('group', { name: 'Phone numbers' })).toBeInTheDocument();
    expect(groups().map((g) => g.getAttribute('aria-label'))).toEqual(['Phone 1', 'Phone 2']);
    expect(page.getByRole('button', { name: 'Remove Phone 2' }).elements()).toHaveLength(1);
  });

  test('a plain form submit sends every row under name[index].field, in order', async () => {
    await render(<form id="f"><Phones /></form>);
    await userEvent.click(page.getByRole('button', { name: 'Add phone' }));
    await userEvent.keyboard('0899');
    expect(Array.from(new FormData(el('f') as HTMLFormElement).entries())).toEqual([['phones[0].number', '0812'], ['phones[1].number', '0813'], ['phones[2].number', '0899']]);
  });

  test('Add puts a new row at the end, focuses its first field, says so politely and reports the rows', async () => {
    const got: string[][] = [];
    await render(<Phones onChange={(rows) => got.push(rows)} />);
    await userEvent.click(page.getByRole('button', { name: 'Add phone' }));
    expect(groups().map((g) => g.getAttribute('aria-label'))).toEqual(['Phone 1', 'Phone 2', 'Phone 3']);
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Number 3' }).element());
    await expect.poll(said).toBe('Phone 3 added');
    expect(got).toEqual([['0812', '0813', '']]);
  });

  test('Remove takes its row away, focuses the row before (or Add for the first row) and says which row went', async () => {
    await render(<Phones defaultValue={['a', 'b', 'c']} />);
    await userEvent.click(page.getByRole('button', { name: 'Remove Phone 3' }));
    expect(values()).toEqual(['a', 'b']);
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Number 2' }).element());
    await expect.poll(said).toBe('Phone 3 removed');
    await userEvent.click(page.getByRole('button', { name: 'Remove Phone 1' }));
    expect(values()).toEqual(['b']);
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Add phone' }).element());
    await expect.poll(said).toBe('Phone 1 removed');
  });

  test('a row keeps its own field as the rows around it go: the same element, with what was typed', async () => {
    await render(<Phones defaultValue={['a', 'b']} />);
    const second = page.getByRole('textbox', { name: 'Number 2' }).element();
    await userEvent.click(page.getByRole('button', { name: 'Remove Phone 1' }));
    expect([el('fl').querySelector('input') === second, (second as HTMLInputElement).value, second.getAttribute('aria-label')]).toEqual([true, 'b', 'Number 1']);
  });

  test('min: it starts with that many rows, and Remove is gone while it has no more than that', async () => {
    await render(<Phones defaultValue={undefined} min={1} />);
    expect([values(), page.getByRole('button', { name: /^Remove/ }).elements().length]).toEqual([[''], 0]);
    await userEvent.click(page.getByRole('button', { name: 'Add phone' }));
    expect(page.getByRole('button', { name: /^Remove/ }).elements()).toHaveLength(2);
  });

  test('max: Add stays in the Tab order but does nothing, and says why, to the eye and to screen readers', async () => {
    await render(<Phones max={2} />);
    const add = page.getByRole('button', { name: 'Add phone' }).element() as HTMLButtonElement;
    expect([add.disabled, add.getAttribute('aria-disabled'), el('fl').textContent.includes('Limit reached: 2.')]).toEqual([false, 'true', true]);
    const reason = (add.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(reason).toContain('Limit reached: 2.');
    add.focus();
    await userEvent.keyboard('{Enter}');
    add.click();
    expect([values(), document.activeElement === add]).toEqual([['0812', '0813'], true]);
    await userEvent.click(page.getByRole('button', { name: 'Remove Phone 2' }));
    expect([add.getAttribute('aria-disabled'), el('fl').textContent.includes('Limit reached')]).toEqual([null, false]);
  });

  test('errors: a row\'s error describes that row and reaches its fields; the list\'s error describes the fieldset', async () => {
    await render(<Phones errors={[undefined, 'Add the area code']} error="Add a mobile number" />);
    const [one, two] = groups();
    const text = (e: Element) => (e.getAttribute('aria-describedby') || '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect([one!.hasAttribute('aria-describedby'), text(two!), text(el('fl'))]).toEqual([false, 'Add the area code', 'Add a mobile number']);
    expect(page.getByRole('textbox', { name: 'Number 2' }).element().getAttribute('aria-invalid')).toBe('true');
  });

  test('controlled: value and onChange; the rows follow the value it is given', async () => {
    function Demo() {
      const [rows, setRows] = React.useState(['x']);
      return <><Phones value={rows} onChange={setRows} defaultValue={undefined} /><button id="reset" onClick={() => setRows(['p', 'q', 'r'])}>Reset</button><output id="o">{rows.join(',')}</output></>;
    }
    await render(<Demo />);
    await userEvent.type(page.getByRole('textbox', { name: 'Number 1' }), 'y');
    expect(el('o').textContent).toBe('xy');
    await userEvent.click(el('reset'));
    expect([values(), groups().length]).toEqual([['p', 'q', 'r'], 3]);
  });

  test('reorderable: each row has a handle that moves it with the keyboard, and the rows are reported in the new order', async () => {
    const got: string[][] = [];
    await render(<Phones reorderable defaultValue={['a', 'b', 'c']} onChange={(rows) => got.push(rows)} />);
    const handle = page.getByRole('button', { name: /Phone 1/ }).elements().find((b) => b.classList.length && !/^Remove/.test(b.getAttribute('aria-label') || b.textContent || '')) as HTMLElement;
    handle.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard(' ');
    expect([values(), got.at(-1)]).toEqual([['b', 'a', 'c'], ['b', 'a', 'c']]);
  });

  test('disabled: the fields, Remove and Add are all disabled', async () => {
    await render(<Phones disabled />);
    expect([(el('fl') as HTMLFieldSetElement).disabled, page.getByRole('button', { name: 'Add phone' }).element().matches(':disabled')]).toEqual([true, true]);
  });

  test('its words follow the provider\'s language', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><Phones max={2} /></SerupaProvider>);
    expect([page.getByRole('button', { name: 'Hapus Phone 2' }).elements().length, el('fl').textContent.includes('Batas tercapai: 2.')]).toEqual([1, true]);
  });

  test('its legend, hint, limit and errors read 4.5:1 on the surface in every theme', async () => {
    await render(<Phones max={2} hint="Mobile first" errors={['Add the area code']} error="Add a mobile number" />);
    const bg = css(document.body).backgroundColor;
    const parts = ['legend', '.dk-field-list__hint', '.dk-field-list__limit', '.dk-field-list__error'].map((s) => el('fl').querySelector(s) as HTMLElement);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const p of parts) expect(contrast(css(p).color, css(document.body).backgroundColor || bg), th + ' ' + p.className).toBeGreaterThanOrEqual(4.5);
    }
  });
});
