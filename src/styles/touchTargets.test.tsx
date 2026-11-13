import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { coarsePointer } from '../../tools/test/vitest/helpers';
import { Breadcrumb, BreadcrumbItem } from '../components/Breadcrumb/Breadcrumb';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Slider } from '../components/Slider/Slider';
import { Splitter } from '../components/Splitter/Splitter';
import { Switch } from '../components/Switch/Switch';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { Combobox } from '../components/Combobox/Combobox';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { TimePicker } from '../components/TimePicker/TimePicker';

// Touch-sized targets (EQ1): on a touch screen ((pointer: coarse)) the small controls take a press 44px high (Apple
// and Material ask for 44 to 48px), the Splitter's 8px handle a 24px-wide one, with nothing moving and no two
// neighbours sharing a point; with a mouse they keep the 24px of WCAG 2.5.8, and the Splitter's handle a 16px one (GR270).
const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const box = (sel: string) => $(sel).getBoundingClientRect();
/** Which of `sel` takes a press at (x, y), by its hit-… class, or '' for none. */
const at = (x: number, y: number, sel: string) => (/\bhit-(\w+)/.exec(document.elementFromPoint(x, y)?.closest(sel)?.className || '') || ['', ''])[1];
/** What a press takes 20px above and below the middle of `target` (inside 44px, outside 24px). */
const around = (target: string, sel: string) => { $(target).scrollIntoView({ block: 'center' }); const r = box(target), x = r.left + r.width / 2, y = r.top + r.height / 2; return [at(x, y - 20, sel), at(x, y + 20, sel)]; };

function Page() {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '64px', width: '480px' }}>
    <div><Checkbox className="hit-alone">Alone</Checkbox></div>
    <CheckboxGroup aria-label="Days">
      {['mon', 'tue', 'wed'].map((d) => <Checkbox key={d} value={d} className={'hit-' + d}>{d}</Checkbox>)}
    </CheckboxGroup>
    <RadioGroup aria-label="Size" orientation="horizontal">
      <Radio value="s" className="hit-s">Small</Radio><Radio value="m" className="hit-m">Medium</Radio>
    </RadioGroup>
    <div><Switch className="hit-switch">Wi-Fi</Switch></div>
    <Slider aria-label="Volume" defaultValue={50} className="hit-slider" />
    <SegmentedControl aria-label="View" options={[{ value: 'l', label: 'List' }, { value: 'b', label: 'Board' }]} />
    <Breadcrumb><BreadcrumbItem href="#a" className="hit-crumb">Home</BreadcrumbItem><BreadcrumbItem>Page</BreadcrumbItem></Breadcrumb>
    <Splitter style={{ width: '408px', height: '100px' }}><p>One</p><p>Two</p></Splitter>
  </div>;
}

describe('touch-sized targets (EQ1)', () => {
  test('with a mouse: 24px, so a press 20px off the middle misses; the Splitter handle takes one 3px off its sides but not 6px', async () => {
    await render(<Page />);
    expect(around('.hit-alone', '.dk-checkbox')).toEqual(['', '']);
    expect(around('.dk-switch', '.dk-switch')).toEqual(['', '']);
    expect(around('.hit-slider', '.dk-slider')).toEqual(['', '']);
    $('[role="separator"]').scrollIntoView({ block: 'center' });
      const h = box('[role="separator"]'), y = h.top + h.height / 2;
    const sep = (x: number) => document.elementFromPoint(x, y)?.closest('[role="separator"]') ?? null;
    expect([sep(h.left - 3), sep(h.right + 3), sep(h.left - 6), sep(h.right + 6)]).toEqual([$('[role="separator"]'), $('[role="separator"]'), null, null]);
  });

  test('on a touch screen: 44px high, in a group only up to halfway into the gap, and a 24px Splitter grab zone', async () => {
    await render(<Page />);
    await coarsePointer(async (active) => {
      if (!active) return;
      expect(around('.hit-alone', '.dk-checkbox')).toEqual(['alone', 'alone']);
      expect(around('.dk-switch', '.dk-switch')).toEqual(['switch', 'switch']);
      expect(around('.hit-slider', '.dk-slider')).toEqual(['slider', 'slider']);
      $('.dk-segmented__item').classList.add('hit-seg');
      expect(around('.dk-segmented__item', '.dk-segmented__item')).toEqual(['seg', 'seg']);
      expect(around('.dk-breadcrumb__link', '.dk-breadcrumb__link')).toEqual(['crumb', 'crumb']);
      $('.hit-tue').scrollIntoView({ block: 'center' });
      // The group's rows: above the first and below the last they reach out; between two, each stops at the middle of the gap.
      const mon = box('.hit-mon'), tue = box('.hit-tue'), x = mon.left + 8, mid = (mon.bottom + tue.top) / 2;
      expect([at(x, mon.top - 6, '.dk-checkbox'), at(x, mid - 1, '.dk-checkbox'), at(x, mid + 1, '.dk-checkbox')]).toEqual(['mon', 'mon', 'tue']);
      $('.hit-s').scrollIntoView({ block: 'center' });
      const s = box('.hit-s'), m = box('.hit-m'), cy = s.top + s.height / 2;
      expect([at(s.left + 4, cy - 20, '.dk-radio'), at(m.right - 4, cy + 20, '.dk-radio'), at((s.right + m.left) / 2, cy, '.dk-radio')]).toEqual(['s', 'm', '']);
      $('[role="separator"]').scrollIntoView({ block: 'center' });
      const h = box('[role="separator"]'), y = h.top + h.height / 2;
      expect([document.elementFromPoint(h.left - 6, y)?.closest('[role="separator"]'), document.elementFromPoint(h.right + 6, y)?.closest('[role="separator"]')]).toEqual([$('[role="separator"]'), $('[role="separator"]')]);
    });
  });
});

// The 24px buttons inside a field: on a touch screen each takes a press anywhere up the field's height and
// 10px toward the text, so a finger a little off the eye or the calendar button doesn't land in the text and open the
// keyboard. Two steppers side by side stop halfway into the gap between them. With a mouse they keep their 24px.
function Fields() {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '64px', width: '320px' }}>
    <PasswordInput className="hit-password" aria-label="Password" />
    <NumberInput className="hit-number" aria-label="Guests" defaultValue={2} />
    <Combobox className="hit-combobox" aria-label="Fruit" options={['Apple', 'Banana']} />
    <DatePicker className="hit-date" aria-label="Due" />
    <TimePicker className="hit-time" aria-label="Start" />
  </div>;
}
/** The fields, by their hit-… class; the button checked is the field's first (the number field's minus stepper). */
const FIELDS = ['password', 'number', 'combobox', 'date', 'time'];
/** For each field's button: does a press 6px before its start edge, and one 1px inside the field's top edge, take it? */
const reach = () => FIELDS.map((name) => {
  const field = $('.hit-' + name), b = field.querySelector('button')!; b.scrollIntoView({ block: 'center' });
  const r = b.getBoundingClientRect(), f = field.getBoundingClientRect(), cy = r.top + r.height / 2, cx = r.left + r.width / 2;
  const hit = (x: number, y: number) => document.elementFromPoint(x, y)?.closest('button') === b;
  return [name, hit(r.left - 6, cy), hit(cx, f.top + 2)];
});

describe('touch-sized buttons inside fields', () => {
  test('with a mouse: a press beside the button or above it lands in the field, not on the button', async () => {
    await render(<Fields />);
    expect(reach()).toEqual(FIELDS.map((s) => [s, false, false]));
  });

  test('on a touch screen: the button takes a press 6px toward the text and up to the field\'s edge; the two steppers split the gap', async () => {
    await render(<Fields />);
    await coarsePointer(async (active) => {
      if (!active) return;
      expect(reach()).toEqual(FIELDS.map((s) => [s, true, true]));
      const [minus, plus] = [...$('.hit-number').querySelectorAll('button')], a = minus!.getBoundingClientRect(), b = plus!.getBoundingClientRect(), y = a.top + a.height / 2;
      expect([document.elementFromPoint(a.right - 1, y)?.closest('button'), document.elementFromPoint(b.left + 1, y)?.closest('button')]).toEqual([minus, plus]);
    });
  });
});
