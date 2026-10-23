import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { TimePicker } from './TimePicker';

const el = (id: string) => document.getElementById(id) as HTMLInputElement;
const listOf = (id: string) => document.getElementById(el(id).getAttribute('aria-controls')!) as HTMLUListElement;
const button = (id: string) => document.querySelector(`#${id} ~ button`) as HTMLButtonElement;
const time = (o: Element | undefined | null) => (o ? o.querySelector('.dk-time-picker__time')!.textContent : undefined);
const st = (id: string) => {
  const i = el(id), l = listOf(id), act = i.getAttribute('aria-activedescendant');
  return { v: i.value, open: !l.hidden, exp: i.getAttribute('aria-expanded'), active: act ? time(document.getElementById(act)) : null, n: l.children.length, first: time(l.children[0]), last: time(l.children[l.children.length - 1]),
    hidden: [...l.querySelectorAll('.dk-icon')].every((x) => x.closest('[aria-hidden=true]')), sel: [...l.querySelectorAll<HTMLElement>('[aria-selected=true]')].map((o) => o.dataset.value).join() };
};
const fill = async (id: string, text: string, key = '{Tab}') => { await userEvent.fill(el(id), text); await userEvent.keyboard(key); };

function Meeting(props: { tref?: React.Ref<HTMLInputElement> }) {
  return <div style={{ width: '240px' }}><Field label="Meeting"><TimePicker id="tp" locale="en-US" className="extra" ref={props.tref} /></Field></div>;
}
function Ctl(props: { changes: string[]; setRef?: { set?: (v: string | null) => void } }) {
  const [v, setV] = React.useState<string | null>('09:00');
  if (props.setRef) props.setRef.set = setV;
  return <TimePicker id="ctl" aria-label="Start" value={v} onValueChange={(n) => { props.changes.push(String(n)); setV(n); }} min="08:00" max="18:00" step={15} name="start" locale="en-US" />;
}
const openTp = async () => { el('tp').focus(); await userEvent.keyboard('{ArrowDown}'); };

describe('TimePicker', () => {
  test('a role="combobox" field (aria-haspopup="listbox", collapsed) in a dk-input box, labelled by Field; a "Choose time" clock button out of the tab order; ref and className', async () => {
    const ref = React.createRef<HTMLInputElement>();
    await render(<Meeting tref={ref} />);
    const i = el('tp'), l = listOf('tp'), b = button('tp');
    expect(ref.current).toBe(i);
    expect(i.parentElement!.className).toMatch(/dk-input.*extra/);
    expect([i.getAttribute('role'), i.getAttribute('aria-haspopup'), i.getAttribute('aria-expanded'), i.placeholder]).toEqual(['combobox', 'listbox', 'false', 'hh:mm am']);
    expect([l.getAttribute('role'), l.getAttribute('aria-label'), b.getAttribute('aria-label'), b.tabIndex]).toEqual(['listbox', 'Choose time', 'Choose time', -1]);
    expect(document.querySelector('label')!.htmlFor).toBe('tp');
  });

  test('ArrowDown opens a list of every 30 minutes in the locale\'s format (12:00 AM … 11:30 PM); arrows move one time, PageDown four; Ctrl+End and Ctrl+Home go to the last and first times', async () => {
    await render(<Meeting />);
    await openTp();
    const o = st('tp');
    expect([o.open, o.exp, o.n, o.first, o.last, o.active]).toEqual([true, 'true', 48, '12:00 AM', '11:30 PM', '12:00 AM']);
    await userEvent.keyboard('{ArrowDown}{PageDown}{ArrowUp}');
    expect(st('tp').active).toBe('2:00 AM');
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(st('tp').active).toBe('11:30 PM');
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    expect(st('tp').active).toBe('12:00 AM');
  });

  test('Enter picks the highlighted time, closes the list and keeps focus in the field; reopening highlights and checks it (the check hidden from screen readers); Escape closes the list', async () => {
    await render(<Meeting />);
    await openTp();
    await userEvent.keyboard('{PageDown}{PageDown}{Enter}');
    const p = st('tp');
    expect([p.v, p.open, document.activeElement!.id]).toEqual(['4:00 AM', false, 'tp']);
    await userEvent.keyboard('{ArrowDown}');
    const r = st('tp');
    expect([r.active, r.sel, r.hidden, document.querySelectorAll('#tp ~ ul .dk-time-picker__check').length]).toEqual(['4:00 AM', '04:00', true, 1]);
    await userEvent.keyboard('{Escape}');
    expect(st('tp').open).toBe(false);
  });

  test('the clock button opens it; a click picks a time', async () => {
    await render(<Meeting />);
    await userEvent.click(button('tp'));
    await userEvent.click(document.querySelector('#tp ~ ul [data-value="13:30"]')!);
    expect([st('tp').v, st('tp').open]).toEqual(['1:30 PM', false]);
  });

  test('typing is read on blur: "2:45 pm", "1430", "9p", "07:05", "18:20", "12am"; "25:00" and "nonsense" put back the last good time; opening after typing highlights the nearest time; Tab closes the list and reads the text; clearing clears the value', async () => {
    await render(<Meeting />);
    const seen: string[] = [];
    for (const s of ['2:45 pm', '1430', '9p', '07:05', '18:20', '12am', '25:00', 'nonsense']) { await fill('tp', s); seen.push(el('tp').value); }
    expect(seen).toEqual(['2:45 PM', '2:30 PM', '9:00 PM', '7:05 AM', '6:20 PM', '12:00 AM', '12:00 AM', '12:00 AM']);
    await fill('tp', '8:10', '{ArrowDown}');
    expect(st('tp').active).toBe('8:00 AM');
    await userEvent.keyboard('{Tab}');
    expect([st('tp').open, el('tp').value]).toEqual([false, '8:10 AM']);
    await fill('tp', '');
    expect(el('tp').value).toBe('');
  });

  test('min, max and step: 8:00 AM to 6:00 PM every 15 minutes, opening at the value; controlled: onValueChange gets "HH:mm" and the hidden input follows; a time after max puts back the value; one off the step is kept; a new value from outside rewrites the field', async () => {
    const changes: string[] = [], setRef: { set?: (v: string | null) => void } = {};
    await render(<Ctl changes={changes} setRef={setRef} />);
    expect(el('ctl').value).toBe('9:00 AM');
    el('ctl').focus();
    await userEvent.keyboard('{ArrowDown}');
    const c = st('ctl');
    expect([c.n, c.first, c.last, c.active]).toEqual([41, '8:00 AM', '6:00 PM', '9:00 AM']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    const hid = () => document.querySelector<HTMLInputElement>('input[type=hidden][name=start]')!.value;
    expect([changes.join(), hid()]).toEqual(['09:15', '09:15']);
    await fill('ctl', '7:30 pm');
    expect([el('ctl').value, changes.length]).toEqual(['9:15 AM', 1]);
    await fill('ctl', '10:07');
    expect(hid()).toBe('10:07');
    React.act(() => setRef.set!('17:45'));
    await expect.poll(() => el('ctl').value).toBe('5:45 PM');
  });

  test('de-DE: 24-hour times (00:00 … 23:30) and placeholder "hh:mm"', async () => {
    await render(<TimePicker id="de" aria-label="Beginn" locale="de-DE" defaultValue="14:30" />);
    el('de').focus();
    await userEvent.keyboard('{ArrowDown}');
    const d = st('de');
    expect([d.v, d.first, d.last, el('de').placeholder]).toEqual(['14:30', '00:00', '23:30', 'hh:mm']);
  });

  test('disabled: the field and button are disabled and faded', async () => {
    await render(<TimePicker id="dis" aria-label="Off" disabled defaultValue="10:00" />);
    expect([el('dis').disabled, el('dis').parentElement!.querySelector('button')!.disabled]).toEqual([true, true]);
    await expect.poll(() => getComputedStyle(el('dis').parentElement!).opacity).toBe('0.5');
  });

  test('contrast: times 4.5:1 (also highlighted), the check and clock icon 3:1, in all six themes', async () => {
    await render(<Ctl changes={[]} />);
    el('ctl').focus();
    await userEvent.keyboard('{ArrowDown}');
    const still = document.createElement('style'); still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
    const low: string[] = []; let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const l = listOf('ctl'), bg = getComputedStyle(l).backgroundColor, act = l.querySelector('.dk-time-picker__option--active')!, opt = l.querySelector('.dk-time-picker__option:not(.dk-time-picker__option--active)')!, chk = l.querySelector('.dk-time-picker__check')!, btn = button('ctl');
      const chkBg = getComputedStyle(chk.parentElement!).backgroundColor;
      const pairs: Array<[string, string, string, number]> = [['time', getComputedStyle(opt).color, bg, 4.5], ['highlighted time', getComputedStyle(act).color, getComputedStyle(act).backgroundColor, 4.5], ['check', getComputedStyle(chk).color, chkBg === 'rgba(0, 0, 0, 0)' ? bg : chkBg, 3], ['clock icon', getComputedStyle(btn).color, getComputedStyle(btn.parentElement!).backgroundColor, 3]];
      for (const [k, fg, on, min] of pairs) { const r = contrast(fg, on); n++; if (r < min) low.push(`${th} ${k} ${r.toFixed(2)}`); }
    }
    still.remove();
    expect(low).toEqual([]);
    expect(n).toBe(24);
  });

  test('--time-picker-option-bg-active overrides one picker', async () => {
    await render(<TimePicker id="tok" aria-label="Tok" style={{ '--time-picker-option-bg-active': 'rgb(1, 2, 3)' } as React.CSSProperties} />);
    el('tok').focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => getComputedStyle(document.querySelector('#tok ~ ul .dk-time-picker__option--active')!).backgroundColor).toBe('rgb(1, 2, 3)');
  });

  test('typing with the list open moves the highlight to the nearest time, and Enter keeps what was typed; after typing, moving with the arrows makes Enter pick the highlighted time again', async () => {
    await render(<Meeting />);
    await userEvent.click(el('tp'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await userEvent.keyboard('3:15 pm');
    const ty = st('tp');
    expect([ty.open, ty.active]).toEqual([true, '3:00 PM']);
    await userEvent.keyboard('{Enter}');
    expect([st('tp').v, st('tp').open]).toEqual(['3:15 PM', false]);
    await userEvent.fill(el('tp'), '');
    await userEvent.keyboard('9a{ArrowDown}{ArrowDown}{Enter}');
    expect(el('tp').value).toBe('9:30 AM');
  });

  test('the clock button keeps focus in the field (no blur, half-typed text left alone); the list counts steps from min, like <input type="time">: 8:10, 8:40 … 9:40 AM; it is at least as wide as the field', async () => {
    let blurs = 0;
    await render(<div style={{ width: '240px' }}><TimePicker id="mn" aria-label="From min" locale="en-US" min="08:10" max="10:00" onBlur={() => { blurs++; }} /></div>);
    await userEvent.click(el('mn'));
    await userEvent.keyboard('8:4');
    await userEvent.click(button('mn'));
    expect([blurs, document.activeElement!.id, el('mn').value]).toEqual([0, 'mn', '8:4']);
    const m = st('mn');
    expect([m.first, m.last, m.n]).toEqual(['8:10 AM', '9:40 AM', 4]);
    expect(Math.round(listOf('mn').getBoundingClientRect().width)).toBeGreaterThanOrEqual(Math.round(el('mn').parentElement!.getBoundingClientRect().width));
  });

  test('a step under one minute falls back to 30', async () => {
    await render(<TimePicker id="tiny" aria-label="Tiny step" locale="en-US" step={0.25} />);
    await userEvent.click(el('tiny'));
    await userEvent.keyboard('{ArrowDown}');
    expect([st('tiny').open, st('tiny').n]).toEqual([true, 48]);
  });

  test('a new locale rewrites the field in its format', async () => {
    let setLoc: (l: string) => void = () => {};
    function Loc() { const [l, set] = React.useState('en-US'); setLoc = set; return <TimePicker id="loc" aria-label="Locale" locale={l} defaultValue="14:30" />; }
    await render(<Loc />);
    expect(el('loc').value).toBe('2:30 PM');
    React.act(() => setLoc('de-DE'));
    await expect.poll(() => el('loc').value).toBe('14:30');
  });
});
