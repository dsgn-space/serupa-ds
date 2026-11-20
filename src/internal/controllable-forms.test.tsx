import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { ColorPicker } from '../components/ColorPicker/ColorPicker';
import { InlineEdit } from '../components/InlineEdit/InlineEdit';
import { List, ListItem } from '../components/List/List';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { PinInput } from '../components/PinInput/PinInput';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { TagGroup } from '../components/TagGroup/TagGroup';

afterEach(() => { vi.restoreAllMocks(); });
const switches = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('controlled-switch'));

// The form controls' values, given a value and then undefined for one render (a form's state loading or reset), as a
// user's app would by mistake: the control warns once in development and keeps following the prop.
const CASES: Array<[string, unknown, (v: unknown) => React.ReactElement]> = [
  ['CheckboxGroup value', [], (v) => <CheckboxGroup aria-label="Days" value={v as string[] | undefined}><Checkbox value="mon">Monday</Checkbox></CheckboxGroup>],
  ['RadioGroup value', 's', (v) => <RadioGroup aria-label="Size" value={v as string | undefined}><Radio value="s">Small</Radio></RadioGroup>],
  ['NumberInput value', 3, (v) => <NumberInput aria-label="Quantity" value={v as number | undefined} />],
  ['SearchInput value', 'ab', (v) => <SearchInput aria-label="Search" value={v as string | undefined} />],
  ['PasswordInput revealed', false, (v) => <PasswordInput aria-label="Password" revealed={v as boolean | undefined} />],
  ['PinInput value', '12', (v) => <PinInput aria-label="Code" length={4} value={v as string | undefined} />],
  ['InlineEdit value', 'Atlas', (v) => <InlineEdit label="Project name" value={v as string | undefined} />],
  ['ColorPicker value', '#336699', (v) => <ColorPicker aria-label="Label color" swatches={['#336699', '#993366']} value={v as string | undefined} />],
  ['TagGroup selected', [], (v) => <TagGroup label="Labels" selectionMode="multiple" items={[{ id: 'a', label: 'Bug' }]} selected={v as string[] | undefined} />],
  ['List selected', [], (v) => <List aria-label="People" selectionMode="multiple" selected={v as string[] | undefined}><ListItem title="Ada" /></List>],
];

describe('a form control whose controlled value turns undefined', () => {
  for (const [name, v, ui] of CASES) {
    test(`${name}: controlled, then undefined, warns once naming the component and the prop; staying controlled warns nothing`, async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const r = await render(ui(v));
      await r.rerender(ui(v));
      expect(switches(warn)).toEqual([]);
      await r.rerender(ui(undefined));
      await r.rerender(ui(v));
      const [component, prop] = name.split(' ');
      expect(switches(warn)).toHaveLength(1);
      expect(switches(warn)[0]).toContain(`${component}: \`${prop}\` changed from controlled to uncontrolled`);
      await r.unmount();
    });
  }
});
