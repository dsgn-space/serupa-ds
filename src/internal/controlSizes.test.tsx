// One scale for every one-line control (165): at each size, in the default and the compact density, a Button, every input-like field and SegmentedControl
// are the same height (control-height-sm, -md, -lg: 24, 32 and 44px), with the same corner radius and text size, so a
// Button beside an Input in a toolbar or a form row lines up. A component that drifts by a pixel fails here, not in a
// screenshot someone has to notice.
import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from '../components/Button/Button';
import { Combobox } from '../components/Combobox/Combobox';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker/DateRangePicker';
import { InlineEdit } from '../components/InlineEdit/InlineEdit';
import { Input } from '../components/Input/Input';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { MenuItem } from '../components/Menu/Menu';
import { Pagination } from '../components/Pagination/Pagination';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Select } from '../components/Select/Select';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { CascadeSelect } from '../components/CascadeSelect/CascadeSelect';
import { CopyButton } from '../components/CopyButton/CopyButton';
import { DateField } from '../components/DateField/DateField';
import { IconButton } from '../components/IconButton/IconButton';
import { SplitButton } from '../components/SplitButton/SplitButton';
import { TimeZonePicker } from '../components/TimeZonePicker/TimeZonePicker';
import { ToggleButton } from '../components/ToggleButton/ToggleButton';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Switch } from '../components/Switch/Switch';
import { Textarea } from '../components/Textarea/Textarea';
import { SerupaProvider } from './provider';

type Size = 'sm' | 'md' | 'lg';
const OPTIONS = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
// Each control at a size, without a label, so the first element is its drawn box.
const CONTROLS: [string, (size: Size) => React.ReactElement][] = [
  ['Button', (size) => <Button size={size}>Save</Button>],
  ['Input', (size) => <Input size={size} aria-label="Name" />],
  ['Select', (size) => <Select size={size} aria-label="Name" options={OPTIONS} />],
  ['Combobox', (size) => <Combobox size={size} aria-label="Name" options={OPTIONS} />],
  ['DatePicker', (size) => <DatePicker size={size} aria-label="Name" />],
  ['DateRangePicker', (size) => <DateRangePicker size={size} aria-label="Name" />],
  ['TimePicker', (size) => <TimePicker size={size} aria-label="Name" />],
  ['NumberInput', (size) => <NumberInput size={size} aria-label="Name" />],
  ['PasswordInput', (size) => <PasswordInput size={size} aria-label="Name" />],
  ['PhoneInput', (size) => <PhoneInput size={size} aria-label="Name" />],
  ['SearchInput', (size) => <SearchInput size={size} aria-label="Name" />],
  ['InlineEdit (editing)', (size) => <InlineEdit size={size} label="Name" defaultValue="Ada" defaultEditing />],
  ['SegmentedControl', (size) => <SegmentedControl size={size} aria-label="View" options={OPTIONS} />],
  ['IconButton', (size) => <IconButton size={size} icon="settings" label="Settings" />],
  ['ToggleButton', (size) => <ToggleButton size={size}>Bold</ToggleButton>],
  ['CopyButton', (size) => <CopyButton size={size} value="sk_live_51H8xQ2" />],
  ['SplitButton', (size) => <SplitButton size={size} menuLabel="More" menu={<MenuItem>Save as draft</MenuItem>}>Publish</SplitButton>],
  ['CascadeSelect', (size) => <CascadeSelect size={size} aria-label="Region" options={[{ value: 'a', label: 'A', children: [{ value: 'b', label: 'B' }] }]} />],
  ['DateField', (size) => <DateField size={size} aria-label="Date" />],
  ['TimeZonePicker', (size) => <TimeZonePicker size={size} aria-label="Time zone" />],
];

const token = (name: string, within: Element) => {
  const probe = within.appendChild(document.createElement('div'));
  probe.style.height = `var(--${name})`;
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
};
// The drawn box: the first element with a border or a fill, from the outside in.
const box = (root: Element) => [root, ...root.querySelectorAll('*')].find((e) => {
  const c = getComputedStyle(e);
  return parseFloat(c.borderTopWidth) > 0 || c.backgroundColor !== 'rgba(0, 0, 0, 0)';
}) as HTMLElement;
const textOf = (root: Element) => [root, ...root.querySelectorAll('input, button, [role="combobox"], [role="radio"]')].at(-1) as HTMLElement;

// The default density, and data-density="compact" (md 28px and lg 36px, sm stays 24px).
const HEIGHTS = { comfortable: { sm: 24, md: 32, lg: 44 }, compact: { sm: 24, md: 28, lg: 36 } } as const;
describe.each((['comfortable', 'compact'] as const).flatMap((density) => (['sm', 'md', 'lg'] as Size[]).map((size) => ({ density, size }))))('$density, size $size', ({ density, size }) => {
  test('every one-line control is control-height tall, with one corner radius and one text size', async () => {
    const { container } = await render(<div data-density={density}>{CONTROLS.map(([n, el]) => <div key={n} data-name={n}>{el(size)}</div>)}</div>);
    await document.fonts.ready;
    const height = token('control-height-' + size, container.firstElementChild!);
    expect(height).toBe(HEIGHTS[density][size]);
    const rows = [...container.querySelectorAll<HTMLElement>('[data-name]')].map((cell) => {
      const b = box(cell.firstElementChild!), c = getComputedStyle(b);
      return { name: cell.dataset.name, height: Math.round(b.getBoundingClientRect().height * 10) / 10, radius: c.borderTopLeftRadius, text: getComputedStyle(textOf(b)).fontSize };
    });
    expect(rows.map((r) => [r.name, r.height]), 'heights').toEqual(rows.map((r) => [r.name, height]));
    expect(rows.map((r) => [r.name, r.radius]), 'radii').toEqual(rows.map((r) => [r.name, rows[0]!.radius]));
    expect(rows.map((r) => [r.name, r.text]), 'text sizes').toEqual(rows.map((r) => [r.name, rows[0]!.text]));
  });
});

// size on a SerupaProvider: every control inside that sets none takes it, as a dense admin screen or one form wants,
// without size="sm" on each. A control's own size still wins.
describe('size from a SerupaProvider', () => {
  test('every one-line control inside <SerupaProvider size="sm"> is 24px; one with its own size keeps it', async () => {
    const screen = await render(<SerupaProvider size="sm"><div id="small">{CONTROLS.map(([name, make]) => <div key={name} data-name={name}>{make(undefined as unknown as Size)}</div>)}</div><Input id="own" size="lg" aria-label="Own" /></SerupaProvider>);
    const off = [...screen.container.querySelectorAll<HTMLElement>('#small > div')].filter((d) => Math.round(box(d).getBoundingClientRect().height) !== 24).map((d) => d.dataset.name);
    expect(off).toEqual([]);
    // Pagination's page buttons are control-height too, so a dense screen's pager matches its fields.
    const pager = await render(<SerupaProvider size="sm"><Pagination count={5} aria-label="Pages" /></SerupaProvider>);
    expect(Math.round(pager.getByRole('button', { name: /^Page 1/ }).element().getBoundingClientRect().height)).toBe(24);
    expect(Math.round(box(document.getElementById('own')!.parentElement!).getBoundingClientRect().height)).toBe(44);
  });

  test('Checkbox, Radio, Switch and Textarea take it too, alone and in a group; with none, md', async () => {
    await render(<>
      <SerupaProvider size="lg"><div id="lg">
        <Checkbox>Alone</Checkbox>
        <CheckboxGroup name="g" aria-label="Group"><Checkbox value="a">A</Checkbox></CheckboxGroup>
        <RadioGroup name="plan" aria-label="Plan"><Radio value="a">A</Radio></RadioGroup>
        <Switch>On</Switch>
        <Textarea aria-label="Note" />
      </div></SerupaProvider>
      <div id="none"><Checkbox>Plain</Checkbox></div>
    </>);
    const sizes = [...document.querySelectorAll('#lg [class*="--size-"]')].map((e) => (e.className.match(/--size-(\w+)/) || [])[1]);
    expect(sizes.length).toBeGreaterThanOrEqual(5);
    expect(new Set(sizes)).toEqual(new Set(['lg']));
    expect(document.querySelector('#none [class*="--size-"]')!.className).toContain('--size-md');
  });
});

