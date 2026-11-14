import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Carousel } from '../components/Carousel/Carousel';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';
import { Combobox } from '../components/Combobox/Combobox';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { Dialog } from '../components/Dialog/Dialog';
import { Drawer } from '../components/Drawer/Drawer';
import { Field } from '../components/Field/Field';
import { Input } from '../components/Input/Input';
import { Meter } from '../components/Meter/Meter';
import { Progress } from '../components/Progress/Progress';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Select } from '../components/Select/Select';
import { Slider } from '../components/Slider/Slider';
import { Switch } from '../components/Switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs/Tabs';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';
import { PinInput } from '../components/PinInput/PinInput';
import { Popover } from '../components/Popover/Popover';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { Textarea } from '../components/Textarea/Textarea';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { TreeView } from '../components/TreeView/TreeView';
import { hasName, NAME_HOW, useNameCheck } from './nameCheck';

// Each component that needs a name says so once in the console when it has none (a screen reader would announce only
// its role), and stays quiet when it's named the usual way: its label, a Field, aria-label or aria-labelledby.
const noop = () => {};
const TREE = [{ id: 'src', label: 'src' }];
const OPTIONS = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
const UNNAMED: Array<[string, () => React.ReactElement]> = [
  ['Dialog', () => <Dialog open={false} onOpenChange={noop}>Body</Dialog>],
  ['Drawer', () => <Drawer open={false} onOpenChange={noop}>Body</Drawer>],
  ['Slider', () => <Slider />],
  ['Switch', () => <Switch />],
  ['Checkbox', () => <Checkbox />],
  ['Combobox', () => <Combobox options={OPTIONS} />],
  ['Select', () => <Select><option>A</option></Select>],
  ['Input', () => <Input placeholder="Email" />],
  ['SegmentedControl', () => <SegmentedControl options={OPTIONS} />],
  ['Progress', () => <Progress value={40} />],
  ['Meter', () => <Meter value={40} />],
  ['RadioGroup', () => <RadioGroup><Radio value="a">A</Radio></RadioGroup>],
  ['Radio', () => <Radio value="a" />],
  ['DatePicker', () => <DatePicker />],
  ['ColorPicker', () => <ColorPicker swatches={['#ff0000']} />],
  ['Carousel', () => <Carousel label=""><div>One</div></Carousel>],
  ['Textarea', () => <Textarea placeholder="Notes" />],
  ['NumberInput', () => <NumberInput />],
  ['PasswordInput', () => <PasswordInput />],
  ['SearchInput', () => <SearchInput placeholder="Search" />],
  ['PhoneInput', () => <PhoneInput />],
  ['PinInput', () => <PinInput />],
  ['TimePicker', () => <TimePicker />],
  ['Popover', () => <Popover trigger={<button type="button">Filters</button>}>Body</Popover>],
  ['TreeView', () => <TreeView items={TREE} />],
];
const NAMED: Array<[string, () => React.ReactElement]> = [
  ['Dialog', () => <Dialog open={false} onOpenChange={noop} title="Delete file">Body</Dialog>],
  ['Drawer', () => <Drawer open={false} onOpenChange={noop} aria-label="Filters">Body</Drawer>],
  ['Slider', () => <Field label="Volume"><Slider /></Field>],
  ['Switch', () => <Switch>Wi-Fi</Switch>],
  ['Checkbox', () => <Checkbox aria-label="Select row" />],
  ['Combobox', () => <Field label="Fruit"><Combobox options={OPTIONS} /></Field>],
  ['Select', () => <><label htmlFor="nc-select">Size</label><Select id="nc-select"><option>A</option></Select></>],
  ['Input', () => <><span id="nc-email">Email</span><Input aria-labelledby="nc-email" /></>],
  ['SegmentedControl', () => <SegmentedControl options={OPTIONS} aria-label="View" />],
  ['Progress', () => <Progress value={40} label="Upload" />],
  ['Meter', () => <Meter value={40} label="Storage" />],
  ['RadioGroup', () => <Field group label="Plan"><RadioGroup><Radio value="a">A</Radio></RadioGroup></Field>],
  ['Radio', () => <Radio value="a" aria-label="Standard" />],
  ['DatePicker', () => <Field label="Start"><DatePicker /></Field>],
  ['ColorPicker', () => <ColorPicker swatches={['#ff0000']} aria-label="Color" />],
  ['Carousel', () => <Carousel label="Photos"><div>One</div></Carousel>],
  ['Textarea', () => <Field label="Notes"><Textarea /></Field>],
  ['NumberInput', () => <Field label="Quantity"><NumberInput /></Field>],
  ['PasswordInput', () => <Field label="Password"><PasswordInput /></Field>],
  ['SearchInput', () => <SearchInput aria-label="Search orders" />],
  ['PhoneInput', () => <Field label="Phone"><PhoneInput /></Field>],
  ['PinInput', () => <Field label="Code"><PinInput /></Field>],
  ['TimePicker', () => <Field label="Start"><TimePicker /></Field>],
  ['Popover', () => <Popover trigger={<button type="button">Filters</button>} title="Filters">Body</Popover>],
  ['TreeView', () => <TreeView items={TREE} aria-label="Files" />],
];

describe('accessible name warnings', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  test.each(UNNAMED)('%s with no name warns once', async (name, make) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<>{make()}{make()}</>);
    const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('accessible name'));
    expect(said).toEqual([expect.stringMatching(new RegExp('^' + name + ' has no accessible name'))]);
  });

  test.each(NAMED)('%s named the usual way says nothing', async (_name, make) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(make());
    expect(warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('accessible name'))).toEqual([]);
  });

  // label= is how other libraries name these controls; here it lands on the <input> and names nothing (GR18).
  test.each([
    ['Radio', () => <Radio value="a" {...{ label: 'Standard' }}>Standard</Radio>],
    ['Checkbox', () => <Checkbox {...{ label: 'Remember me' }}>Remember me</Checkbox>],
    ['Switch', () => <Switch {...{ label: 'Wi-Fi' }}>Wi-Fi</Switch>],
  ] as Array<[string, () => React.ReactElement]>)('%s given label= warns once to put the text in children', async (name, make) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<>{make()}{make()}</>);
    const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('label-prop'));
    expect(said).toEqual([expect.stringMatching(new RegExp('^' + name + ": label isn't one of its props.*Put the text in children"))]);
  });

  test('a range Slider names its thumbs itself, so it says nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Slider defaultValue={[20, 80]} />);
    expect(warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('accessible name'))).toEqual([]);
  });
});

describe('Tabs value warnings', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  const tabs = (props: { value?: string; defaultValue?: string }) => (
    <Tabs {...props} onValueChange={noop}>
      <TabList aria-label="Sections"><Tab value="one">One</Tab><Tab value="two">Two</Tab></TabList>
      <TabPanel value="one">First</TabPanel><TabPanel value="two">Second</TabPanel>
    </Tabs>
  );

  test('a controlled value that matches no Tab warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(tabs({ value: 'three' }));
    expect(warn.mock.calls.map((c) => String(c[0]))).toContainEqual(expect.stringContaining('Tabs: value "three" matches no Tab'));
  });

  test('a defaultValue that matches no Tab warns, and the first tab is selected', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await render(tabs({ defaultValue: 'three' }));
    expect(warn.mock.calls.map((c) => String(c[0]))).toContainEqual(expect.stringContaining('Tabs: defaultValue "three" matches no Tab'));
    await expect.element(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  });

  test('a value that matches a Tab says nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<>{tabs({ value: 'two' })}{tabs({ defaultValue: 'one' })}</>);
    expect(warn.mock.calls.map((c) => String(c[0])).filter((m) => m.startsWith('Tabs:'))).toEqual([]);
  });
});


// hasName on its own: each way an element gets its name, and what doesn't count.
describe('hasName', () => {
  const at = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; document.body.append(d); return d; };
  test("aria-labelledby counts when an element it names has text or an aria-label; a missing or empty one doesn't", () => {
    const d = at('<span id="nc-t">Volume</span><span id="nc-a" aria-label="Level"></span><span id="nc-e"> </span>'
      + '<div id="x1" aria-labelledby="nc-gone nc-t"></div><div id="x2" aria-labelledby="nc-a"></div><div id="x3" aria-labelledby="nc-e nc-gone"></div>');
    try { expect(['x1', 'x2', 'x3'].map((id) => hasName(document.getElementById(id)!))).toEqual([true, true, false]); } finally { d.remove(); }
  });
  test("aria-label or title with text counts; one of spaces doesn't; text inside the element doesn't", () => {
    const d = at('<div id="y1" aria-label="Rate"></div><div id="y2" title="Rate"></div><div id="y3" aria-label="  " title=" ">Rate</div>');
    try { expect(['y1', 'y2', 'y3'].map((id) => hasName(document.getElementById(id)!))).toEqual([true, true, false]); } finally { d.remove(); }
  });
  test("a <label> with text or an aria-label counts; an empty one doesn't", () => {
    const d = at('<label for="z1">Email</label><input id="z1"><label for="z2" aria-label="Phone"></label><input id="z2"><label for="z3"> </label><input id="z3">');
    try { expect(['z1', 'z2', 'z3'].map((id) => hasName(document.getElementById(id)!))).toEqual([true, true, false]); } finally { d.remove(); }
  });
  test("a group takes its fieldset's own legend, only when asked as a group, and only a legend with text", () => {
    const d = at('<fieldset><legend>Plan</legend><div id="g1"></div></fieldset><fieldset><legend> </legend><div id="g2"></div></fieldset>'
      + '<fieldset><div><legend>Inner</legend></div><div id="g3"></div></fieldset><div id="g4"></div>');
    try {
      const g = (id: string) => document.getElementById(id)!;
      expect([hasName(g('g1'), true), hasName(g('g1')), hasName(g('g2'), true), hasName(g('g3'), true), hasName(g('g4'), true)]).toEqual([true, false, false, false, false]);
    } finally { d.remove(); }
  });
  test('inside a shadow root, aria-labelledby finds its target there', () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<span id="s-t">Zoom</span><div id="s1" aria-labelledby="s-t"></div>';
    try { expect(hasName(root.getElementById('s1')!)).toBe(true); } finally { host.remove(); }
  });
});

function Unnamed({ how }: { how: (typeof NAME_HOW)[keyof typeof NAME_HOW] }) {
  const ref = useNameCheck<HTMLDivElement>('Probe', how);
  return <div ref={ref} role="slider" aria-valuenow={1} />;
}

describe('useNameCheck', () => {
  test('NAME_HOW carries only the kind, so a production build, where the warning is gone, leaves the advice text out', () => {
    expect(NAME_HOW).toEqual({ field: 'field', group: 'group', label: 'label', title: 'title' });
  });

  test('in development, an element with no accessible name still warns once with the advice for its kind', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await render(<><Unnamed how={NAME_HOW.label} /><Unnamed how={NAME_HOW.label} /></>);
      const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('Probe has no accessible name'));
      expect(said.length).toBe(1);
      expect(said[0]).toContain('so a screen reader announces only its role. Give it a label, or an aria-label.');
    } finally { warn.mockRestore(); }
  });
});
