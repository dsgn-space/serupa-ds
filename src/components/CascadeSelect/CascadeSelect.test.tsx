import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { color, css, lowContrast, settle } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { CascadeSelect, type CascadeOption } from './CascadeSelect';

/** A few of Indonesia's provinces, regencies and districts, for the stories and tests. */
const regions: CascadeOption[] = [
  { value: 'jabar', label: 'Jawa Barat', children: [
    { value: 'bandung', label: 'Kota Bandung', children: [
      { value: 'coblong', label: 'Coblong' }, { value: 'sukajadi', label: 'Sukajadi' }, { value: 'cicendo', label: 'Cicendo' }, { value: 'lengkong', label: 'Lengkong', disabled: true }] },
    { value: 'bogor', label: 'Kabupaten Bogor', children: [{ value: 'cibinong', label: 'Cibinong' }, { value: 'citeureup', label: 'Citeureup' }] },
    { value: 'bekasi', label: 'Kota Bekasi', children: [{ value: 'bekasi-barat', label: 'Bekasi Barat' }, { value: 'bekasi-timur', label: 'Bekasi Timur' }] }] },
  { value: 'jateng', label: 'Jawa Tengah', children: [
    { value: 'semarang', label: 'Kota Semarang', children: [{ value: 'tembalang', label: 'Tembalang' }, { value: 'banyumanik', label: 'Banyumanik' }] },
    { value: 'solo', label: 'Kota Surakarta', children: [{ value: 'laweyan', label: 'Laweyan' }] }] },
  { value: 'jatim', label: 'Jawa Timur', children: [
    { value: 'surabaya', label: 'Kota Surabaya', children: [{ value: 'gubeng', label: 'Gubeng' }, { value: 'wonokromo', label: 'Wonokromo' }] }] },
  { value: 'bali', label: 'Bali', children: [{ value: 'denpasar', label: 'Kota Denpasar', children: [{ value: 'denpasar-selatan', label: 'Denpasar Selatan' }] }] },
  { value: 'papua', label: 'Papua', disabled: true, children: [] },
];

const levels = ['Provinsi', 'Kabupaten/Kota', 'Kecamatan'];
const button = () => document.querySelector<HTMLButtonElement>('[role=combobox]')!;
const panel = () => document.querySelector<HTMLElement>('[role=dialog]')!;
const lists = () => [...panel().querySelectorAll<HTMLElement>('[role=listbox]')];
const texts = (list: HTMLElement) => [...list.querySelectorAll('[role=option]')].map((o) => o.textContent);
const focused = () => document.activeElement?.textContent;
const until = async (ok: () => boolean, ms = 2000) => { const end = Date.now() + ms; while (!ok() && Date.now() < end) await settle(20); expect(ok()).toBe(true); };

let errors: MockInstance<typeof console.error>;
// Wide enough for the columns side by side (narrower than 640px shows one at a time).
beforeEach(async () => { errors = vi.spyOn(console, 'error'); await page.viewport(900, 700); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); document.documentElement.removeAttribute('data-theme'); });

describe('CascadeSelect', () => {
  test('a combobox button (aria-haspopup dialog, collapsed) showing the placeholder, md 32px with a 1px field border and 6px corners; ref, className, data and aria props reach it', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(<CascadeSelect ref={ref} aria-label="Wilayah" className="extra" data-x="y" options={regions} />);
    const b = button(), root = b.parentElement!;
    expect([b.tagName, b.getAttribute('role'), b.getAttribute('aria-haspopup'), b.getAttribute('aria-expanded'), b.getAttribute('aria-label'), b.dataset.x, ref.current === b]).toEqual(['BUTTON', 'combobox', 'dialog', 'false', 'Wilayah', 'y', true]);
    expect([root.dataset.component, root.className]).toEqual(['cascade-select', 'dk-cascade-select dk-cascade-select--size-md extra']);
    expect(b.textContent).toBe('Choose…');
    expect([css(b).height, css(b).borderTopWidth, css(b).borderRadius]).toEqual(['32px', '1px', '6px']);
  });

  test('a chosen path reads as words, joined with ›; sizes sm and lg are 24 and 44px', async () => {
    await render(<>
      <CascadeSelect aria-label="A" options={regions} defaultValue={['jabar', 'bandung', 'coblong']} />
      <CascadeSelect aria-label="B" size="sm" options={regions} />
      <CascadeSelect aria-label="C" size="lg" options={regions} />
    </>);
    const bs = [...document.querySelectorAll<HTMLButtonElement>('[role=combobox]')];
    expect(bs[0].textContent).toBe('Jawa Barat › Kota Bandung › Coblong');
    expect([css(bs[1]).height, css(bs[2]).height]).toEqual(['24px', '44px']);
  });

  test('a click opens a dialog named like the field, with a listbox per level of the chosen path, named by levels; the chosen options are highlighted and the last one has focus', async () => {
    await render(<CascadeSelect aria-label="Wilayah" options={regions} levels={levels} defaultValue={['jabar', 'bandung', 'coblong']} />);
    await userEvent.click(button());
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect([panel().getAttribute('role'), panel().getAttribute('aria-label'), button().getAttribute('aria-controls')]).toEqual(['dialog', 'Wilayah', panel().id]);
    expect(lists().map((l) => document.getElementById(l.getAttribute('aria-labelledby')!)!.textContent)).toEqual(levels);
    expect(texts(lists()[0])).toEqual(['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Papua']);
    expect([...panel().querySelectorAll('[aria-selected=true]')].map((o) => o.textContent)).toEqual(['Jawa Barat', 'Kota Bandung', 'Coblong']);
    await until(() => focused() === 'Coblong');
    expect([...panel().querySelectorAll('[role=option]:has([data-icon=check])')].map((o) => o.textContent)).toEqual(['Coblong']);
  });

  test('keyboard: ArrowDown on the button opens it; Down/Up move in a column (skipping disabled), Right goes into the children, Left back, Enter on a last step chooses and closes, focus returns to the button', async () => {
    const changes: string[][] = [];
    await render(<CascadeSelect aria-label="Wilayah" options={regions} levels={levels} onValueChange={(v) => changes.push(v)} />);
    button().focus();
    await userEvent.keyboard('{ArrowDown}');
    await until(() => document.activeElement === lists()[0]);
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Jawa Barat');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('Bali');   // Papua is disabled
    await userEvent.keyboard('{Home}{ArrowRight}');
    await until(() => focused() === 'Kota Bandung');
    expect(lists().length).toBe(3);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Jawa Barat');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowRight}');
    await until(() => focused() === 'Cibinong');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(changes).toEqual([['jabar', 'bogor', 'citeureup']]);
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button());
    expect(button().textContent).toBe('Jawa Barat › Kabupaten Bogor › Citeureup');
  });

  test('keyboard: Space or ArrowUp on the button opens it; ArrowUp moves to the previous option; Space on a last step chooses it', async () => {
    const changes: string[][] = [];
    await render(<CascadeSelect aria-label="Wilayah" options={regions} onValueChange={(v) => changes.push(v)} />);
    button().focus();
    await userEvent.keyboard('{ArrowUp}');
    await until(() => document.activeElement === lists()[0]);
    await userEvent.keyboard('{Escape}');
    await until(() => document.activeElement === button());
    await userEvent.keyboard('{Space}');
    await until(() => document.activeElement === lists()[0]);
    await userEvent.keyboard('{End}{ArrowUp}');
    expect(focused()).toBe('Jawa Timur');   // up from Bali
    await userEvent.keyboard('{ArrowRight}');
    await until(() => focused() === 'Kota Surabaya');
    await userEvent.keyboard('{ArrowRight}');
    await until(() => focused() === 'Gubeng');
    await userEvent.keyboard('{Space}');
    expect(changes).toEqual([['jatim', 'surabaya', 'gubeng']]);
    expect([button().getAttribute('aria-expanded'), document.activeElement === button()]).toEqual(['false', true]);
  });

  test('Enter on an option with children goes into them; letters jump to a matching option; Escape closes without a change', async () => {
    const changes: string[][] = [];
    await render(<CascadeSelect aria-label="Wilayah" options={regions} defaultValue={['jabar', 'bandung', 'coblong']} onValueChange={(v) => changes.push(v)} />);
    await userEvent.click(button());
    await until(() => focused() === 'Coblong');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused()).toBe('Jawa Barat');
    await userEvent.keyboard('b');
    expect(focused()).toBe('Bali');
    await userEvent.keyboard('{Enter}');
    await until(() => focused() === 'Kota Denpasar');
    await userEvent.keyboard('{Escape}');
    expect([changes, button().getAttribute('aria-expanded'), document.activeElement === button()]).toEqual([[], 'false', true]);
    expect(button().textContent).toBe('Jawa Barat › Kota Bandung › Coblong');
  });

  test('a click on a parent shows its children in the next column; a click on a last step chooses it; a disabled option does nothing', async () => {
    const changes: string[][] = [];
    await render(<CascadeSelect aria-label="Wilayah" options={regions} onValueChange={(v) => changes.push(v)} />);
    await userEvent.click(button());
    const option = (label: string) => [...panel().querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent === label)!;
    await userEvent.click(option('Papua'), { force: true });
    expect(lists().length).toBe(1);
    await userEvent.click(option('Jawa Timur'));
    expect(texts(lists()[1])).toEqual(['Kota Surabaya']);
    await userEvent.click(option('Kota Surabaya'));
    await userEvent.click(option('Gubeng'));
    expect(changes).toEqual([['jatim', 'surabaya', 'gubeng']]);
    expect(panel().hidden).toBe(true);
  });

  test('with selectParents, Enter (or a second click) on a parent chooses it', async () => {
    const changes: string[][] = [];
    await render(<CascadeSelect aria-label="Wilayah" options={regions} selectParents onValueChange={(v) => changes.push(v)} />);
    await userEvent.click(button());
    const option = (label: string) => [...panel().querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent === label)!;
    await userEvent.click(option('Bali'));
    expect(changes).toEqual([]);
    await userEvent.click(option('Bali'));
    expect(changes).toEqual([['bali']]);
  });

  test('loadOptions: children of an option without any load when it is opened, "Loading…" (aria-busy) meanwhile; a failed load says so and tries again next time', async () => {
    // Each load ends when the test says so (settle), not on a timer: a click is a round trip through the driver, and on
    // a slow CI machine a 50ms load had already failed before "Loading…" was read.
    let fail = true, settle = () => {};
    const load = vi.fn((path: CascadeOption[]) => new Promise<CascadeOption[]>((ok, no) => { settle = () => (fail ? no(new Error('x')) : ok([{ value: path[0].value + '1', label: path[0].label + ' 1' }])); }));
    await render(<CascadeSelect aria-label="Area" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B', isLeaf: true }]} loadOptions={load} />);
    await userEvent.click(button());
    const option = (label: string) => [...panel().querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent === label)!;
    expect(option('A').querySelector('[data-icon]')).not.toBeNull();
    expect(option('B').querySelector('[data-icon]')).toBeNull();
    await userEvent.click(option('A'));
    const note = () => panel().querySelector<HTMLElement>('[role=status]');
    expect([note()?.textContent, note()?.getAttribute('aria-busy')]).toEqual(['Loading…', 'true']);
    settle();
    await until(() => note()?.textContent === 'Couldn’t load the options');
    fail = false;
    await userEvent.click(option('A'));
    await userEvent.click(option('A'));
    settle();
    await until(() => !!option('A 1'));
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[0][0].map((o) => o.value)).toEqual(['a']);
  });

  test('loadOptions: a saved value three levels deep reads in words without opening, its levels loaded one at a time', async () => {
    const tree: Record<string, CascadeOption[]> = {
      '32': [{ value: '3273', label: 'Kota Bandung' }],
      '3273': [{ value: '327301', label: 'Coblong', isLeaf: true }],
    };
    const load = vi.fn((path: CascadeOption[]) => new Promise<CascadeOption[]>((ok) => setTimeout(() => ok(tree[path[path.length - 1].value] || []), 30)));
    await render(<CascadeSelect aria-label="Alamat" options={[{ value: '32', label: 'Jawa Barat' }]} loadOptions={load} defaultValue={['32', '3273', '327301']} />);
    await until(() => button().textContent === 'Jawa Barat › Kota Bandung › Coblong');
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(load.mock.calls.map((c) => c[0].map((o) => o.value))).toEqual([['32'], ['32', '3273']]);
  });

  test('options with children get "More options: press Right arrow" as their description', async () => {
    await render(<CascadeSelect aria-label="Wilayah" options={regions} />);
    await userEvent.click(button());
    const o = panel().querySelector<HTMLElement>('[role=option]')!;
    expect(document.getElementById(o.getAttribute('aria-describedby')!)!.textContent).toBe('More options: press Right arrow');
  });

  test('right to left: Left goes into the children, Right goes back, and the hint says Left', async () => {
    await render(<div dir="rtl"><CascadeSelect aria-label="Wilayah" options={regions} defaultValue={['jabar']} /></div>);
    await userEvent.click(button());
    await until(() => focused() === 'Jawa Barat');
    await userEvent.keyboard('{ArrowLeft}');
    await until(() => focused() === 'Kota Bandung');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('Jawa Barat');
    const o = panel().querySelector<HTMLElement>('[role=option]')!;
    expect(document.getElementById(o.getAttribute('aria-describedby')!)!.textContent).toBe('More options: press Left arrow');
  });

  test('in a Field: the label names the button and the dialog, the error makes it invalid and is its description, required reaches it', async () => {
    await render(<Field label="Alamat" error="Pilih kecamatan." required><CascadeSelect options={regions} /></Field>);
    const b = button();
    expect([b.labels?.[0]?.textContent?.includes('Alamat'), b.getAttribute('aria-invalid'), b.getAttribute('aria-required')]).toEqual([true, 'true', 'true']);
    expect(document.getElementById(b.getAttribute('aria-describedby')!.split(' ')[0])!.textContent).toContain('Pilih kecamatan.');
    expect(b.parentElement!.className).toContain('dk-cascade-select--invalid');
    await userEvent.click(b);
    expect(panel().getAttribute('aria-label')).toContain('Alamat');
  });

  test('controlled value and open; onOpenChange says why', async () => {
    const calls: Array<[boolean, string]> = [];
    function C() {
      const [v, setV] = React.useState<string[]>(['jatim', 'surabaya', 'gubeng']);
      const [open, setOpen] = React.useState(false);
      return <CascadeSelect aria-label="Wilayah" options={regions} value={v} onValueChange={setV} open={open} onOpenChange={(o, d) => { calls.push([o, d.reason]); setOpen(o); }} />;
    }
    await render(<C />);
    await userEvent.click(button());
    await until(() => focused() === 'Gubeng');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(button().textContent).toBe('Jawa Timur › Kota Surabaya › Wonokromo');
    await userEvent.click(button());
    await userEvent.keyboard('{Escape}');
    expect(calls).toEqual([[true, 'trigger'], [false, 'select'], [true, 'trigger'], [false, 'escape']]);
  });

  test('a click outside closes it; a disabled one can\'t open', async () => {
    await render(<><button>outside</button><CascadeSelect aria-label="Wilayah" options={regions} /><CascadeSelect aria-label="Off" disabled options={regions} /></>);
    await userEvent.click(button());
    expect(panel().hidden).toBe(false);
    await userEvent.click(document.querySelector('button')!);
    expect(panel().hidden).toBe(true);
    const off = document.querySelectorAll<HTMLButtonElement>('[role=combobox]')[1];
    expect(off.disabled).toBe(true);
  });

  test('readOnly: focusable, aria-readonly, shows its path; a click, ArrowDown or Space doesn\'t open it; the form still sends the value; field-readonly background, default cursor', async () => {
    const opened: boolean[] = [];
    await render(<form id="f"><CascadeSelect aria-label="Wilayah" name="area" readOnly options={regions} defaultValue={['bali', 'denpasar', 'denpasar-selatan']} onOpenChange={(o) => opened.push(o)} /></form>);
    await userEvent.click(button());
    await userEvent.keyboard('{ArrowDown}{ArrowUp} ');
    expect([document.activeElement === button(), button().disabled, button().getAttribute('aria-readonly'), button().getAttribute('aria-expanded'), panel().hidden, opened,
      new FormData(document.getElementById('f') as HTMLFormElement).get('area'), button().textContent]).toEqual([true, false, 'true', 'false', true, [], 'denpasar-selatan', expect.stringContaining('Denpasar Selatan')]);
    expect([css(button()).backgroundColor, css(button()).cursor]).toEqual([color('var(--field-readonly)'), 'default']);
  });

  test('a form gets the last value under name, and a reset brings back defaultValue', async () => {
    await render(<form id="f"><CascadeSelect aria-label="Wilayah" name="area" options={regions} defaultValue={['bali', 'denpasar', 'denpasar-selatan']} /></form>);
    const form = document.getElementById('f') as HTMLFormElement;
    expect(new FormData(form).get('area')).toBe('denpasar-selatan');
    await userEvent.click(button());
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{Home}{ArrowRight}{ArrowRight}');
    await until(() => focused() === 'Coblong');
    await userEvent.keyboard('{Enter}');
    expect(new FormData(form).get('area')).toBe('coblong');
    form.reset();
    await until(() => new FormData(form).get('area') === 'denpasar-selatan');
  });

  test('in Indonesian: Pilih…, Tingkat 1', async () => {
    await render(<SerupaProvider labels={idLabels}><CascadeSelect aria-label="Wilayah" options={regions} /></SerupaProvider>);
    expect(button().textContent).toBe('Pilih…');
    await userEvent.click(button());
    expect(document.getElementById(lists()[0].getAttribute('aria-labelledby')!)!.textContent).toBe('Tingkat 1');
  });

  test('narrow: one column at a time, with a Back button to the one before', async () => {
    await render(<div style={{ width: 300 }}><CascadeSelect aria-label="Wilayah" options={regions} defaultValue={['jabar', 'bandung']} /></div>);
    await userEvent.click(button());
    await page.viewport(375, 700);
    const shown = () => lists().map((l) => l.parentElement!).filter((c) => css(c).display !== 'none');
    await until(() => shown().length === 1);
    expect(shown()[0].textContent).toContain('Kota Bandung');
    const back = shown()[0].querySelector<HTMLButtonElement>('button')!;
    expect([css(back).display, back.getAttribute('aria-label')]).toEqual(['flex', 'Back']);
    await userEvent.click(back);
    await until(() => shown()[0].textContent.includes('Jawa Tengah'));
  });

  test('contrast in all six themes: text and placeholder 4.5:1 on the field, chevron and border 3:1; option text, level names and notes 4.5:1 on the panel and on the highlight; the check 3:1', () => {
    expect(lowContrast([
      ['text', 'var(--text)', 'var(--field)', 4.5],
      ['placeholder', 'var(--placeholder)', 'var(--field)', 4.5],
      ['chevron', 'var(--text-muted)', 'var(--field)', 3],
      ['border', 'var(--field-border)', 'var(--field)', 3],
      ['border on page', 'var(--field-border)', 'var(--surface)', 3],
      ['option', 'var(--text)', 'var(--surface-overlay)', 4.5],
      ['level', 'var(--text-muted)', 'var(--surface-overlay)', 4.5],
      ['highlighted', 'var(--text)', 'var(--primary-subtle)', 4.5],
      ['hovered', 'var(--text)', 'var(--surface-muted)', 4.5],
      ['check', 'var(--primary)', 'var(--surface-overlay)', 3],
      ['focus', 'var(--focus-ring)', 'var(--surface-overlay)', 3],
    ])).toEqual([]);
  });
});
