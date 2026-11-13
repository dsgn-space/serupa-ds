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
    // The event carries a clipboard of the test's own: Firefox drops the clipboardData a script passes to
    // new ClipboardEvent and gives it an empty one of its own, so what the handler set never came back there.
    const clip = (type: 'copy' | 'paste', text = '') => {
      const held: Record<string, string> = text ? { 'text/plain': text } : {};
      const ev = new ClipboardEvent(type, { bubbles: true, cancelable: true });
      Object.defineProperty(ev, 'clipboardData', { value: { setData: (f: string, v: string) => { held[f] = v; }, getData: (f: string) => held[f] ?? '' } });
      document.activeElement!.dispatchEvent(ev);
      return held['text/plain'] ?? '';
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

  test('rows taken away while a range reaches past them (a filter, another user): copy and Delete use the rows that are left', async () => {
    const clip = () => {
      const held: Record<string, string> = {};
      const ev = new ClipboardEvent('copy', { bubbles: true, cancelable: true });
      Object.defineProperty(ev, 'clipboardData', { value: { setData: (f: string, v: string) => { held[f] = v; }, getData: (f: string) => held[f] ?? '' } });
      document.activeElement!.dispatchEvent(ev);
      return held['text/plain'] ?? '';
    };
    const onChange = vi.fn();
    const grid = (rows: DataGridRow[]) => <DataGrid aria-label="Stock" columns={COLS} rows={rows} onRowsChange={(_, { changes }) => { onChange(changes); }} />;
    const { rerender } = await render(grid(ROWS));
    await userEvent.click(cell('Gula'));
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await rerender(grid(ROWS.slice(0, 2)));
    expect(clip()).toBe('Teh');
    await userEvent.keyboard('{Delete}');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'b', column: 'name', value: '' }]);
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

  test('sizes: sm, md and lg rows grow in that order; lg has 16px text and rows at least 44px tall, editing included, and its placeholders match', async () => {
    await render(<>{(['sm', 'md', 'lg'] as const).map((z) => <DataGrid key={z} id={z} aria-label={z} size={z} columns={COLS} rows={ROWS} onRowsChange={() => {}} />)}
      <DataGrid id="lgl" aria-label="lg loading" size="lg" columns={COLS} rows={[]} loading /></>);
    const row = (id: string) => document.querySelector(`#${id} tbody tr`)!.getBoundingClientRect().height;
    expect(row('sm')).toBeLessThan(row('md'));
    expect(row('lg')).toBeGreaterThanOrEqual(44);
    expect([css(document.querySelector('#lg td')).fontSize, document.getElementById('lg')!.closest('[data-component="data-grid"]')!.className]).toEqual(['16px', 'dk-data-grid dk-data-grid--lg']);
    expect(Math.abs(row('lgl') - row('lg'))).toBeLessThan(2);
    const lgCell = document.querySelector('#lg td') as HTMLElement;
    const before = lgCell.getBoundingClientRect().height;
    await userEvent.dblClick(lgCell);
    expect(Math.abs((document.querySelector('#lg td') as HTMLElement).getBoundingClientRect().height - before)).toBeLessThan(2);
  });

  test('busy with no rows: aria-busy and placeholder rows as tall as real ones, the first named once; then the rows', async () => {
    const { rerender } = await render(<DataGrid aria-label="Stock" columns={COLS} rows={[]} loading loadingRows={4} loadingLabel="Loading stock" />);
    const grid = page.getByRole('grid').element() as HTMLTableElement;
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(grid.getAttribute('aria-rowcount')).toBe('-1');
    const rows = grid.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(4);
    expect(rows[0]!.querySelectorAll('[role="gridcell"]')).toHaveLength(3);
    // Every placeholder is decorative; the label is said once, after the loader's delay.
    expect([...grid.querySelectorAll('[data-variant="skeleton"]')].every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(grid.querySelectorAll('[data-variant="skeleton"]')).toHaveLength(12);
    await expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain('Loading stock');
    const tall = rows[0]!.getBoundingClientRect().height;
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={ROWS} loading={false} />);
    expect(grid.hasAttribute('aria-busy')).toBe(false);
    expect(grid.getAttribute('aria-rowcount')).toBe('4');
    expect(Math.abs(grid.querySelector('tbody tr')!.getBoundingClientRect().height - tall)).toBeLessThan(2);
  });

  test('no rows and not loading: the message in one cell across every column; loading with rows keeps them', async () => {
    const { rerender } = await render(<DataGrid aria-label="Stock" columns={COLS} rows={[]} message={<p>No products yet</p>} />);
    const msg = cell('No products yet') as HTMLTableCellElement;
    expect(msg.colSpan).toBe(3);
    expect(msg.getAttribute('aria-colspan')).toBe('3');
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={ROWS} loading message={<p>No products yet</p>} />);
    expect(page.getByText('No products yet').query()).toBeNull();
    expect(cell('Kopi')).toBeTruthy();
    expect(page.getByRole('grid').element().getAttribute('aria-busy')).toBe('true');
    await rerender(<DataGrid aria-label="Stock" columns={COLS} rows={[]} loading={false} />);
    expect(page.getByRole('grid').element().querySelectorAll('tbody tr')).toHaveLength(0);
  });
});
const focus = () => document.activeElement as HTMLElement;

describe('DataGrid stickyHeader', () => {
  const MANY: DataGridRow[] = Array.from({ length: 60 }, (_, i) => ({ id: 'r' + i, name: 'Item ' + (i + 1), qty: i, sku: 'S' + i }));
  test('in a frame with a height, the header stays in view as the keyboard moves down 60 rows, and the active cell is never under it', async () => {
    await render(<DataGrid aria-label="Stock" stickyHeader containerProps={{ style: { maxHeight: 240 }, id: 'frame' }} columns={COLS} rows={MANY} />);
    const frame = document.getElementById('frame') as HTMLElement, head = frame.querySelector('th') as HTMLElement;
    expect(frame.className).toContain('dk-data-grid');
    await userEvent.click(cell('Item 1'));
    const hidden: string[] = [];
    for (let i = 1; i < 60; i++) {
      await userEvent.keyboard('{ArrowDown}');
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const f = frame.getBoundingClientRect(), h = head.getBoundingClientRect(), c = (document.activeElement as HTMLElement).getBoundingClientRect();
      if (Math.abs(h.top - f.top - frame.clientTop) > 1 || c.top < h.bottom - 1 || c.bottom > f.bottom + 1) hidden.push(`${focused()}: head ${Math.round(h.top - f.top)}, cell ${Math.round(c.top - h.bottom)} below it`);
    }
    expect(focused()).toBe('Item 60');
    expect(frame.scrollTop).toBeGreaterThan(0);
    expect(hidden).toEqual([]);
    // Back up to the top, the cell scrolls in below the header, not under it.
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect((document.activeElement as HTMLElement).getBoundingClientRect().top).toBeGreaterThanOrEqual(head.getBoundingClientRect().bottom - 1);
  });
});


describe('DataGrid labels', () => {
  test('copied and pasted say the count as given, in the locale\'s digits ("٤ sel disalin")', () => {
    expect([idLabels.dataGridCopied(4, '٤'), idLabels.dataGridPasted(2, '٢')]).toEqual(['٤ sel disalin', '٢ sel ditempel']);
  });
});

describe('DataGrid: busy, the old name of loading', () => {
  test('still sets aria-busy and draws placeholders as loading does, and warns once that it is deprecated', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await render(<DataGrid id="old-busy" aria-label="Stock" columns={COLS} rows={[]} {...{ busy: true }} />);
      const grid = document.querySelector('[role="grid"]')!;
      expect(grid.getAttribute('aria-busy')).toBe('true');
      expect(grid.getAttribute('aria-rowcount')).toBe('-1');
      expect(warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('data-grid-busy'))).toHaveLength(1);
    } finally { warn.mockRestore(); }
  });
});

describe('DataGrid token names', () => {
  test('a selected cell reads --data-grid-bg-selected (the state last); the old --data-grid-selected-bg still works until 15.0.0', async () => {
    await render(<>
      <div id="tk-new" style={{ '--data-grid-bg-selected': 'rgb(1, 2, 3)' } as React.CSSProperties}><Live /></div>
    </>);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await expect.poll(() => css(cell('Kopi')).backgroundColor).toBe('rgb(1, 2, 3)');
    (document.getElementById('tk-new') as HTMLElement).style.cssText = '--data-grid-selected-bg: rgb(4, 5, 6)';
    await expect.poll(() => css(cell('Kopi')).backgroundColor).toBe('rgb(4, 5, 6)');
  });
});

// An arrow key used to redraw every cell (GR397): 300 rows of 8 columns took 80 to 140 ms a key in a development
// build, so holding an arrow lagged behind. Now only the row left and the row entered draw again. format is called
// once per cell drawn, so its count says how many were.
describe('DataGrid with many rows', () => {
  test('moving the active cell, or growing the selection by a row, redraws only the rows that change', async () => {
    let drawn = 0;
    const cols: DataGridColumn[] = [{ key: 'name', header: 'Name', format: (r) => { drawn++; return String(r.name); } }, { key: 'hours', header: 'Hours' }];
    const rows: DataGridRow[] = Array.from({ length: 200 }, (_, i) => ({ id: 'r' + i, name: 'Row ' + i, hours: i }));
    await render(<DataGrid aria-label="Hours" columns={cols} rows={rows} />);
    cell('Row 0').focus();
    drawn = 0;
    await userEvent.keyboard('{ArrowDown}');
    expect([focused(), drawn]).toEqual(['Row 1', 2]);
    drawn = 0;
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect([cell('Row 1').getAttribute('aria-selected'), cell('Row 2').getAttribute('aria-selected'), cell('Row 3').getAttribute('aria-selected')]).toEqual(['true', 'true', 'false']);
    expect(drawn).toBeLessThanOrEqual(2);
    drawn = 0;
    await userEvent.keyboard('{ArrowRight}');
    expect(drawn).toBeLessThanOrEqual(2);
  });
});

// What a mutation run on DataGrid.tsx found no test for (65% of its mutants were caught, run 269): each test here
// names the rule a changed operator would have broken without anything failing.
describe('DataGrid: the edges of copy, paste, Delete and editing', () => {
  const clip = (type: 'copy' | 'paste', text = '', prevent = false) => {
    const held: Record<string, string> = text ? { 'text/plain': text } : {};
    const ev = new ClipboardEvent(type, { bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'clipboardData', { value: { setData: (f: string, v: string) => { held[f] = v; }, getData: (f: string) => held[f] ?? '' } });
    if (prevent) ev.preventDefault();
    document.activeElement!.dispatchEvent(ev);
    return { text: held['text/plain'] ?? '', prevented: ev.defaultPrevented };
  };
  const status = () => [...document.querySelectorAll('[aria-live]')].map((n) => n.textContent).join('|');

  test('one value pasted over a range fills every editable cell of the range, and says how many', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowRight}{ArrowRight}{/Shift}');
    clip('paste', '7');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'a', column: 'name', value: '7' }, { rowId: 'a', column: 'qty', value: '7' }, { rowId: 'b', column: 'name', value: '7' }, { rowId: 'b', column: 'qty', value: '7' }]);
    await expect.poll(status).toContain('4 cells pasted');
  });

  test('a row of two values is a block, not one value: it fills from the range\'s first cell and no further', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Teh'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    clip('paste', 'Madu\t2');
    expect(onChange).toHaveBeenLastCalledWith([{ rowId: 'b', column: 'name', value: 'Madu' }, { rowId: 'b', column: 'qty', value: '2' }]);
  });

  test('copy says how many cells; a paste into read-only cells changes nothing and says nothing', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{ArrowRight}{/Shift}');
    expect(clip('copy')).toEqual({ text: 'Kopi\t4\nTeh\t9\nGula\t1', prevented: true });
    await expect.poll(status).toContain('6 cells copied');
    await userEvent.click(cell('K1'));
    clip('paste', 'X');
    expect(onChange).not.toHaveBeenCalled();
    expect(status()).not.toContain('pasted');
  });

  test('on a header, or when the app already handled the event, copy and paste are left alone', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(page.getByRole('columnheader', { name: 'Name' }));
    expect(clip('copy')).toEqual({ text: '', prevented: false });
    expect(clip('paste', 'X').prevented).toBe(false);
    await userEvent.click(cell('Kopi'));
    expect(clip('copy', '', true).text).toBe('');
    clip('paste', 'X', true);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('Delete clears only cells that are editable and hold text; with nothing to clear the app isn\'t called', async () => {
    const onChange = vi.fn();
    function Sparse() {
      const [rows, setRows] = React.useState<DataGridRow[]>([{ id: 'a', name: '', qty: 4, sku: 'K1' }, { id: 'b', name: 'Teh', qty: null, sku: 'T1' }]);
      return <DataGrid aria-label="Stock" columns={COLS} rows={rows} onRowsChange={(next, { changes }) => { onChange(changes); setRows(next); }} />;
    }
    await render(<Sparse />);
    await userEvent.click(cell('K1'));
    await userEvent.keyboard('{Delete}');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
    expect(onChange.mock.calls).toEqual([[[{ rowId: 'a', column: 'qty', value: '' }, { rowId: 'b', column: 'name', value: '' }]]]);
    await userEvent.keyboard('{Delete}');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('saving the text a cell already has calls nothing; Ctrl or Alt with a letter, and Space, start no edit', async () => {
    const onChange = vi.fn();
    await render(<Live onChange={onChange} />);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Enter}{Enter}');
    expect([onChange.mock.calls.length, focused()]).toEqual([0, 'Teh']);
    await userEvent.keyboard('{Control>}b{/Control}{Alt>}b{/Alt} ');
    expect([document.activeElement!.tagName, focused()]).toEqual(['TD', 'Teh']);
    await userEvent.keyboard('{F2}{Tab}');
    expect([onChange.mock.calls.length, focused()]).toEqual([0, '9']);
  });

  test('Ctrl+A selects the body, not the header; Shift+click on a header selects nothing; Shift+ArrowUp from the first row keeps the range in the body', async () => {
    await render(<Live />);
    await userEvent.click(cell('Teh'));
    await userEvent.keyboard('{Control>}a{/Control}');
    const selected = () => page.getByRole('gridcell', { selected: true }).elements().length;
    expect([selected(), page.getByRole('columnheader', { selected: true }).elements().length]).toEqual([9, 0]);
    await userEvent.click(cell('Kopi'));
    await userEvent.click(page.getByRole('columnheader', { name: 'Qty' }), { modifiers: ['Shift'] });
    expect([focused(), selected()]).toEqual(['Qty', 0]);
    await userEvent.click(cell('Kopi'));
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect([focused(), selected()]).toEqual(['Name', 1]);
  });
});
