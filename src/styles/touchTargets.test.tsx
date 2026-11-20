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
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/ButtonGroup/ButtonGroup';
import { IconButton } from '../components/IconButton/IconButton';
import { Pagination } from '../components/Pagination/Pagination';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { Calendar } from '../components/Calendar/Calendar';
import { Carousel } from '../components/Carousel/Carousel';

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
    <SearchInput className="hit-search" aria-label="Search" defaultValue="maps" />
  </div>;
}
/** The fields, by their hit-… class; the button checked is the field's first (the number field's minus stepper). */
const FIELDS = ['password', 'number', 'combobox', 'date', 'time', 'search'];
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

// Buttons on a touch screen: an IconButton or a small Button takes a press up to 44px across, as the Design principles
// promise, with nothing moving. Beside another button it stops halfway into the gap, so a press always goes to the
// nearer one and never to a neighbour's own face; in an attached group, each keeps exactly its own face. Above and
// below, a button in a row keeps its full 44px, as one on its own does.
function Buttons() {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '64px', padding: '64px', width: '480px' }}>
    <div><IconButton icon="close" label="Close" className="hit-close" /></div>
    <div><Button size="sm" className="hit-small">Edit</Button></div>
    <Toolbar aria-label="Format"><IconButton icon="format_bold" label="Bold" className="hit-bold" /><IconButton icon="format_italic" label="Italic" className="hit-italic" /></Toolbar>
    <ButtonGroup attached aria-label="View"><Button className="hit-day">Day</Button><Button className="hit-week">Week</Button></ButtonGroup>
    <div style={{ display: 'flex', gap: '8px' }}><Button variant="secondary" className="hit-cancel">Cancel</Button><Button className="hit-save">Save</Button></div>
    <Pagination count={5} className="hit-pages" />
  </div>;
}
/** Which button (by hit-… class) or page takes a press at (x, y): '' for none. */
const btn = (x: number, y: number) => { const b = document.elementFromPoint(x, y)?.closest('button, a'); return b ? (/\bhit-(\w+)/.exec(b.className) || ['', b.textContent || '?'])[1] : ''; };
/** What a press `d` px outside each edge of `sel` takes: above, below, before, after. */
const outside = (sel: string, d: number) => { $(sel).scrollIntoView({ block: 'center' }); const r = box(sel), cx = r.left + r.width / 2, cy = r.top + r.height / 2; return [btn(cx, r.top - d), btn(cx, r.bottom + d), btn(r.left - d, cy), btn(r.right + d, cy)]; };

describe('touch-sized buttons', () => {
  test('with a mouse: a press just outside a button misses it', async () => {
    await render(<Buttons />);
    expect(outside('.hit-close', 4)).toEqual(['', '', '', '']);
    expect(outside('.hit-small', 4).slice(0, 2)).toEqual(['', '']);
  });

  test('on a touch screen: 44px across, split at the middle of the gap between neighbours, and an attached group keeps its own faces', async () => {
    await render(<Buttons />);
    await coarsePointer(async (active) => {
      if (!active) return;
      // A 32px IconButton reaches 6px out on every side; a 24px small Button 10px up and down.
      expect(outside('.hit-close', 5)).toEqual(['close', 'close', 'close', 'close']);
      expect(outside('.hit-close', 7)).toEqual(['', '', '', '']);
      expect(outside('.hit-small', 9).slice(0, 2)).toEqual(['small', 'small']);
      // Two buttons side by side, as in a dialog's footer, and an attached group: each takes a press 5px above and
      // below it (44px high), as a button on its own does; beside each other they split the gap.
      expect([...outside('.hit-save', 5).slice(0, 2), ...outside('.hit-cancel', 5).slice(0, 2)]).toEqual(['save', 'save', 'cancel', 'cancel']);
      expect([...outside('.hit-day', 5).slice(0, 2), ...outside('.hit-week', 5).slice(0, 2)]).toEqual(['day', 'day', 'week', 'week']);
      // Two IconButtons in a Toolbar, 4px apart: each takes its half of the gap between them, and its own face to the
      // edge.
      // Measured left to right, so it holds in a right-to-left page too.
      $('.hit-bold').scrollIntoView({ block: 'center' });
      const [l, r] = ['.hit-bold', '.hit-italic'].map(box).sort((m, n) => m.left - n.left) as [DOMRect, DOMRect];
      const ln = btn(l.left + 1, l.top + 1), rn = btn(r.right - 1, r.top + 1), y = l.top + l.height / 2, mid = (l.right + r.left) / 2;
      expect([ln, rn].sort()).toEqual(['bold', 'italic']);
      expect([btn(mid - 1, y), btn(mid + 1, y), btn(l.right - 1, y), btn(r.left + 1, y), btn(l.left + l.width / 2, l.top - 1.5)]).toEqual([ln, rn, ln, rn, ln]);
      // Attached (one shared border line): no reach into the neighbour's face, from either side.
      $('.hit-day').scrollIntoView({ block: 'center' });
      const [dl, dr] = ['.hit-day', '.hit-week'].map(box).sort((m, n) => m.left - n.left) as [DOMRect, DOMRect], dy = dl.top + dl.height / 2;
      expect([btn(dl.right - 2, dy), btn(dr.left + 2, dy)]).toEqual([btn(dl.left + 2, dy), btn(dr.right - 2, dy)]);
      expect([btn(dl.left + 2, dy), btn(dr.right - 2, dy)].sort()).toEqual(['day', 'week']);
      // Pagination: a page takes a press 5px above and below it, and the gap between two pages splits at its middle.
      // Pages by their digits in any script (ar-EG writes Arabic-Indic ones).
      const pages = [...$('.hit-pages').querySelectorAll<HTMLElement>('button, a')].filter((e) => /^\p{Nd}+$/u.test(e.textContent || ''));
      pages[1]!.scrollIntoView({ block: 'center' });
      const [pl, pr] = [pages[0]!, pages[1]!].sort((m, n) => m.getBoundingClientRect().left - n.getBoundingClientRect().left) as [HTMLElement, HTMLElement];
      const a = pl.getBoundingClientRect(), c = pr.getBoundingClientRect(), py = a.top + a.height / 2, pm = (a.right + c.left) / 2, two = pages[1]!.getBoundingClientRect();
      expect([btn(two.left + two.width / 2, two.top - 5), btn(two.left + two.width / 2, two.bottom + 5), btn(pm - 1, py), btn(pm + 1, py)])
        .toEqual([pages[1]!.textContent, pages[1]!.textContent, pl.textContent, pr.textContent]);
    });
  });
});

// Rows of small targets a phone user taps (EQ1): a month's days and the slide dots. On a touch screen a day is 44px
// square, and a dot takes a press 20px above or below its middle, 44px high, its width kept so neighbours never
// overlap; with a mouse a day is 32px and a press 20px off a dot misses.
function Rows() {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', padding: '64px', width: '480px' }}>
    <Calendar locale="en-US" defaultMonth={new Date(2025, 2, 10)} />
    <Carousel label="Photos">{[1, 2, 3].map((n) => <div key={n}>Slide {n}</div>)}</Carousel>
  </div>;
}
const rows = () => {
  const day = box('.dk-calendar__day');
  $('.dk-carousel__dot:not([aria-current="true"])').classList.add('hit-dot');
  return { day: [Math.round(day.width), Math.round(day.height)], dot: around('.hit-dot', '.hit-dot') };
};

describe('touch-sized days and dots', () => {
  test('with a mouse: 32px days, and a press 20px off a dot misses', async () => {
    await render(<Rows />);
    expect(rows()).toEqual({ day: [32, 32], dot: ['', ''] });
  });

  test('on a touch screen: 44px days, and a dot takes a press 20px above or below its middle', async () => {
    await render(<Rows />);
    await coarsePointer(async (active) => {
      if (!active) return;
      expect(rows()).toEqual({ day: [44, 44], dot: ['dot', 'dot'] });
    });
  });
});
