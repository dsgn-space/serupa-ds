import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { idLabels } from '../../internal/labels';
import { SerupaProvider } from '../../internal/provider';
import { DataGrid, type DataGridCellChange, type DataGridColumn, type DataGridRow } from './DataGrid';

const COLS: DataGridColumn[] = [
  { key: 'name', header: 'Name', editable: true },
  { key: 'qty', header: 'Qty', editable: true, align: 'end' },
  { key: 'sku', header: 'SKU' },
];
const ROWS: DataGridRow[] = [
  { id: 'a', name: 'Kopi', qty: 4, sku: 'K1' },
  { id: 'b', name: 'Teh', qty: 9, sku: 'T1' },
  { id: 'c', name: 'Gula', qty: 1, sku: 'G1' },
];
const cell = (name: string) => page.getByRole('gridcell', { name, exact: true }).element() as HTMLElement;
const focused = () => (document.activeElement as HTMLElement).textContent;
function Live({ onChange }: { onChange?: (c: DataGridCellChange[]) => void }) {
  const [rows, setRows] = React.useState(ROWS);
  return <DataGrid aria-label="Stock" columns={COLS} rows={rows} onRowsChange={(next, { changes }) => { onChange?.(changes); setRows(next); }} />;
}

describe('DataGrid', () => {
  test('a table with role grid, named, with column headers, rows and gridcells; className goes to the frame', async () => {
    const ref = React.createRef<HTMLTableElement>();
    await render(<DataGrid ref={ref} className="extra" aria-label="Stock" columns={COLS} rows={ROWS} />);
    const grid = page.getByRole('grid', { name: 'Stock' }).element();
    expect([grid.tagName, ref.current === grid, grid.parentElement!.className, grid.parentElement!.dataset.component]).toEqual(['TABLE', true, 'dk-data-grid extra', 'data-grid']);
    expect(page.getByRole('columnheader').elements().map((e) => e.textContent)).toEqual(['Name', 'Qty', 'SKU']);
    expect(page.getByRole('gridcell').elements()).toHaveLength(9);
    expect(grid.getAttribute('aria-rowcount')).toBe('4');
  });

  test('one Tab stop, the first cell; the arrow keys, Home, End and Ctrl+Home/End move it', async () => {
    await render(<><button>Before</button><DataGrid aria-label="Stock" columns={COLS} rows={ROWS} /><button>After</button></>);
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(focused()).toBe('Kopi');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(focused()).toBe('9');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('T1');
    await userEvent.keyboard('{Home}{ArrowUp}{ArrowUp}');
    expect(focused()).toBe('Name');   // the header row is part of the grid
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(focused()).toBe('G1');
    await userEvent.tab();
    expect(focused()).toBe('After');
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('G1');   // the grid keeps the cell it was on
  });

  test('Enter edits, Enter saves and moves down; F2 edits, Escape cancels; typing starts an edit with that key', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Enter}');
    const input = page.getByRole('textbox', { name: 'Edit Name' });
    await expect.element(input).toHaveValue('Kopi');
    await userEvent.keyboard(' Toraja{Enter}');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'a', column: 'name', value: 'Kopi Toraja' }]);
    expect(focused()).toBe('Teh');
    await userEvent.keyboard('{F2}x{Escape}');
    expect([focused(), onChange.mock.calls.length]).toEqual(['Teh', 1]);
    await userEvent.keyboard('{ArrowRight}7{Tab}');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'b', column: 'qty', value: '7' }]);
    expect(focused()).toBe('T1');
  });

  test('a read-only column, or a grid without onRowsChange, does not edit', async () => {
    const { rerender } = await render(<Live />);
    await userEvent.click(cell('K1'));
    await userEvent.keyboard('{Enter}x');
    expect(page.getByRole('textbox').elements()).toHaveLength(0);
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={ROWS} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Enter}');
    expect(page.getByRole('textbox').elements()).toHaveLength(0);
  });

  test('Shift with the arrows selects a range (aria-selected); Delete clears its editable cells', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowRight}{/Shift}');
    expect(page.getByRole('gridcell', { selected: true }).elements().map((e) => e.textContent)).toEqual(['Kopi', '4', 'Teh', '9']);
    await userEvent.keyboard('{Delete}');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'a', column: 'name', value: '' }, { rowId: 'a', column: 'qty', value: '' }, { rowId: 'b', column: 'name', value: '' }, { rowId: 'b', column: 'qty', value: '' }]);
  });

  test('copy gives the range as tab-separated text; paste fills a block from the cell, skipping read-only cells', async () => {
    // Clipboard events with their own DataTransfer, not the system clipboard: the test files run side by side in one
    // browser, and another file's copy between this one's copy and paste pasted the wrong text (11 Nov 2026).
    const clip = (type: 'copy' | 'paste', text = '') => {
      const data = new DataTransfer();
      if (text) data.setData('text/plain', text);
      document.activeElement!.dispatchEvent(new ClipboardEvent(type, { clipboardData: data, bubbles: true, cancelable: true }));
      return data.getData('text/plain');
    };
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowRight}{/Shift}');
    expect(clip('copy')).toBe('Kopi\t4\nTeh\t9');
    await userEvent.click(cell('Teh'));
    clip('paste', 'Madu\t2\tX9\nAren\t5\tX8');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'b', column: 'name', value: 'Madu' }, { rowId: 'b', column: 'qty', value: '2' }, { rowId: 'c', column: 'name', value: 'Aren' }, { rowId: 'c', column: 'qty', value: '5' }]);
  });

  test('a click picks a cell, Shift+click extends, a double click edits', async () => {
    await render(<Live />);
    await userEvent.click(cell('Kopi'));
    await userEvent.click(cell('9'), { modifiers: ['Shift'] });
    expect(page.getByRole('gridcell', { selected: true }).elements()).toHaveLength(4);
    await userEvent.dblClick(cell('Gula'));
    await expect.element(page.getByRole('textbox', { name: 'Edit Name' })).toHaveValue('Gula');
  });

  test('a click on a header takes the focus there; Page Down and Page Up move ten rows; Ctrl+A selects every cell; leaving an edit saves it', async () => {
    const changes: DataGridCellChange[][] = [];
    await render(<><Live onChange={(c) => changes.push(c)} /><button type="button">After</button></>);
    await userEvent.click(page.getByRole('columnheader', { name: 'Qty' }));
    expect(focused()).toBe('Qty');
    await userEvent.keyboard('{PageDown}');
    expect(focused()).toBe('1');
    await userEvent.keyboard('{PageUp}');
    expect(focused()).toBe('4');
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(page.getByRole('gridcell', { selected: true }).elements()).toHaveLength(9);
    await userEvent.keyboard('{Control>}{Home}{/Control}{ArrowRight}{F2}5');
    await userEvent.click(page.getByRole('button', { name: 'After' }));
    expect(changes).toEqual([[{ rowId: 'a', column: 'qty', value: '45' }]]);
  });

  test('a column\'s format writes the text shown, copied and edited', async () => {
    const cols: DataGridColumn[] = [{ key: 'price', header: 'Price', editable: true, format: (r) => 'Rp ' + String(r.price) }];
    await render(<DataGrid aria-label="Prices" columns={cols} rows={[{ id: 'a', price: 5000 }]} onRowsChange={() => {}} />);
    await userEvent.click(cell('Rp 5000'));
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('textbox', { name: 'Edit Price' })).toHaveValue('Rp 5000');
  });

  test('in right-to-left text, ArrowLeft moves to the next column', async () => {
    await render(<div dir="rtl"><DataGrid aria-label="Stock" columns={COLS} rows={ROWS} /></div>);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('4');
  });

  test('describes how to edit, in the provider\'s language', async () => {
    await render(<SerupaProvider labels={idLabels}><DataGrid aria-label="Stok" columns={COLS} rows={ROWS} /></SerupaProvider>);
    await expect.element(page.getByRole('grid', { name: 'Stok' })).toHaveAccessibleDescription(idLabels.dataGridHint);
  });

  test('text reads 4.5:1 on the cells, the header and the selection, and the focus ring 3:1, in all six themes', async () => {
    await render(<Live />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    const head = page.getByRole('columnheader').elements()[0] as HTMLElement, plain = cell('G1'), sel = cell('Kopi');
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(plain).color, css(plain).backgroundColor === 'rgba(0, 0, 0, 0)' ? css(page.getByRole('grid').element().parentElement).backgroundColor : css(plain).backgroundColor), th + ' cell').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(head).color, css(head).backgroundColor), th + ' header').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(sel).color, css(sel).backgroundColor), th + ' selected').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(focus()).outlineColor, css(sel).backgroundColor), th + ' ring').toBeGreaterThanOrEqual(3);
    }
    document.documentElement.removeAttribute('data-theme');
  });

  test('busy with no rows: aria-busy and placeholder rows as tall as real ones, the first named once; then the rows', async () => {
    const { rerender } = await render(<DataGrid aria-label="Stock" columns={COLS} rows={[]} busy loadingRows={4} loadingLabel="Loading stock" />);
    const grid = page.getByRole('grid').element() as HTMLTableElement;
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(grid.getAttribute('aria-rowcount')).toBe('-1');
    const rows = grid.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(4);
    expect(rows[0].querySelectorAll('[role="gridcell"]')).toHaveLength(3);
    // Every placeholder is decorative; the label is said once, after the loader's delay.
    expect([...grid.querySelectorAll('[data-variant="skeleton"]')].every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(grid.querySelectorAll('[data-variant="skeleton"]')).toHaveLength(12);
    await expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain('Loading stock');
    const tall = rows[0].getBoundingClientRect().height;
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={ROWS} busy={false} />);
    expect(grid.hasAttribute('aria-busy')).toBe(false);
    expect(grid.getAttribute('aria-rowcount')).toBe('4');
    expect(Math.abs(grid.querySelector('tbody tr')!.getBoundingClientRect().height - tall)).toBeLessThan(2);
  });

  test('no rows and not busy: the message in one cell across every column; busy with rows keeps them', async () => {
    const { rerender } = await render(<DataGrid aria-label="Stock" columns={COLS} rows={[]} message={<p>No products yet</p>} />);
    const msg = cell('No products yet') as HTMLTableCellElement;
    expect(msg.colSpan).toBe(3);
    expect(msg.getAttribute('aria-colspan')).toBe('3');
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={ROWS} busy message={<p>No products yet</p>} />);
    expect(page.getByText('No products yet').query()).toBeNull();
    expect(cell('Kopi')).toBeTruthy();
    expect(page.getByRole('grid').element().getAttribute('aria-busy')).toBe('true');
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={[]} busy={false} />);
    expect(page.getByRole('grid').element().querySelectorAll('tbody tr')).toHaveLength(0);
  });
});
const focus = () => document.activeElement as HTMLElement;
