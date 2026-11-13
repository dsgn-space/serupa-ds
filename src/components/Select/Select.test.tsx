import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, forcedColors, lowContrast, withMotion } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { Select } from './Select';
import { Combobox } from '../Combobox/Combobox';
import { DatePicker } from '../DatePicker/DatePicker';

const field = (id: string) => document.getElementById(id) as HTMLSelectElement;
const box = (id: string) => field(id).parentElement as HTMLElement;

let errors: MockInstance<typeof console.error>, warnings: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); warnings = vi.spyOn(console, 'warn'); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); warnings.mockRestore(); });

const Grid = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'grid', gap: '8px', width: '320px' }}>{children}</div>;
function Role({ changes, sref }: { changes: string[]; sref?: React.Ref<HTMLSelectElement> }) {
  const [v, setV] = React.useState('b');
  return <>
    <label htmlFor="md">Role</label>
    <Select id="md" ref={sref} value={v} onChange={(e) => { changes.push(e.target.value); setV(e.target.value); }}
      options={['a', { value: 'b', label: 'Bee' }, { value: 'c', label: 'Sea', disabled: true }]} className="extra" data-x="y" />
  </>;
}

describe('Select', () => {
  test('the chevron ends where Combobox\'s and DatePicker\'s icons end, at every size, so the icons of a column of fields line up (GR391)', async () => {
    await render(<div style={{ width: '240px' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => <div key={size} data-row={size}>
        <Select aria-label="A" size={size}><option>One</option></Select>
        <Combobox aria-label="B" size={size} options={['One']} />
        <DatePicker aria-label="C" size={size} />
      </div>)}
    </div>);
    for (const size of ['sm', 'md', 'lg']) {
      const ends = [...document.querySelectorAll(`[data-row=${size}] svg`)].filter((i) => i.getClientRects().length).map((i) => Math.round(i.getBoundingClientRect().right * 2) / 2);
      expect(ends.length).toBe(3);
      expect(new Set(ends).size, `${size}: ${ends.join(', ')}`).toBe(1);
      const sizes = [...document.querySelectorAll(`[data-row=${size}] svg`)].filter((i) => i.getClientRects().length).map((i) => Math.round(i.getBoundingClientRect().width));
      expect(new Set(sizes).size, `${size}: ${sizes.join(', ')}`).toBe(1);
    }
  });

  test('a native <select> (no system arrow) in a .dk-select box (data-component="select"); md 32px text-sm, 12px start padding and room for the chevron at the end, 1px border, 6px corners', async () => {
    await render(<Grid><Role changes={[]} /></Grid>);
    const b = css(box('md')), f = css(field('md'));
    expect([field('md').tagName, box('md').dataset.component, f.appearance]).toEqual(['SELECT', 'select', CSS.supports('appearance', 'base-select') ? 'base-select' : 'none']);
    expect(box('md').className).toMatch(/dk-select dk-select--size-md/);
    expect([b.height, f.fontSize, f.paddingLeft, f.paddingRight, b.borderTopWidth, b.borderRadius]).toEqual(['32px', '14px', '12px', '32px', '1px', '6px']);
  });

  test('keyboard table: Tab reaches the select; ArrowDown and ArrowUp pick the next and previous option, skipping a disabled one (where the list is styled, ArrowDown opens it instead, as on macOS); Space goes to the browser, which opens its list (FH1)', async () => {
    const changes: string[] = [];
    await render(<Grid><button id="kb-before">before</button><Select id="kb-s" aria-label="Pick" defaultValue="a" onChange={(e) => changes.push(e.target.value)} options={['a', { value: 'b', label: 'Bee', disabled: true }, 'c']} /></Grid>);
    document.getElementById('kb-before')!.focus();
    await userEvent.tab();
    const at = document.activeElement?.id;
    await userEvent.keyboard('{ArrowDown}{ArrowUp}');
    const styled = CSS.supports('appearance', 'base-select');
    if (styled) await userEvent.keyboard('{Escape}');
    let cancelled: boolean | null = null;
    const watch = (e: KeyboardEvent) => { if (e.key === ' ') cancelled = e.defaultPrevented; };
    window.addEventListener('keydown', watch);
    await userEvent.keyboard(' ');
    window.removeEventListener('keydown', watch);
    await userEvent.keyboard('{Escape}');
    expect([at, changes, cancelled]).toEqual(['kb-s', styled ? [] : ['c', 'a'], false]);
  });

  test('sizes: sm 24px text-xs, lg 44px text-base; an unknown size falls back to md; multiple is ignored with a warning', async () => {
    await render(<Grid>
      <Select id="sm" size="sm" options={['x']} aria-label="Small" />
      <Select id="lg" size="lg" options={['x']} aria-label="Large" />
      {/* @ts-expect-error: an unknown size and multiple, as plain JavaScript could pass */}
      <Select id="bad" size="xl" multiple options={['x']} aria-label="Bad" />
    </Grid>);
    const m = (id: string) => [css(box(id)).height, css(field(id)).fontSize, css(field(id)).paddingLeft];
    expect(m('sm')).toEqual(['24px', '12px', '8px']);
    expect(m('lg')).toEqual(['44px', '16px', '16px']);
    expect([box('bad').dataset.size, field('bad').multiple]).toEqual(['md', false]);
    expect(warnings.mock.calls.some((c: unknown[]) => /multiple/.test(String(c[0])))).toBe(true);
  });

  test('ref and attributes go to the <select>, className to the box; options from strings and { value, label, disabled }; picking an option updates a controlled value through onChange', async () => {
    const ref = React.createRef<HTMLSelectElement>(), changes: string[] = [];
    await render(<Grid><Role changes={changes} sref={ref} /></Grid>);
    const i = field('md');
    expect([ref.current === i, box('md').classList.contains('extra'), i.dataset.x, i.labels[0]!.textContent]).toEqual([true, true, 'y', 'Role']);
    expect([...i.options].map((o) => o.value + ':' + o.textContent + (o.disabled ? ':off' : '')).join()).toBe('a:a,b:Bee,c:Sea:off');
    await userEvent.selectOptions(i, 'a');
    await expect.poll(() => field('md').value).toBe('a');
    expect(changes.join()).toBe('a');
  });

  test('placeholder: a first empty option that can\'t be picked; an uncontrolled select starts on it in the placeholder color, then the text color once something is picked', async () => {
    await render(<Grid><Select id="ph" placeholder="Choose one" options={['One', 'Two']} aria-label="Placeholder" /></Grid>);
    const o = field('ph').options[0]!;
    expect([o.value, o.textContent, o.disabled, field('ph').value]).toEqual(['', 'Choose one', true, '']);
    expect(box('ph').className).toMatch(/dk-select--empty/);
    expect(css(field('ph')).color).toBe(color('var(--placeholder)'));
    await userEvent.selectOptions(field('ph'), 'Two');
    await expect.poll(() => box('ph').className).not.toMatch(/dk-select--empty/);
    expect([field('ph').value, css(field('ph')).color]).toEqual(['Two', color('var(--text)')]);
  });

  test('form reset: an uncontrolled select goes back to its placeholder (or its defaultValue) and looks it, and the form sends the default', async () => {
    await render(<form id="f">
      <Select id="ph" name="ph" aria-label="Size" placeholder="Choose a size" options={['S', 'M']} />
      <Select id="dv" name="dv" aria-label="Fruit" defaultValue="b" options={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }]} />
    </form>);
    await userEvent.selectOptions(field('ph'), 'M');
    await userEvent.selectOptions(field('dv'), 'a');
    expect([box('ph').classList.contains('dk-select--empty'), field('dv').value]).toEqual([false, 'a']);
    (document.getElementById('f') as HTMLFormElement).reset();
    await expect.poll(() => box('ph').classList.contains('dk-select--empty')).toBe(true);
    const data = new FormData(document.getElementById('f') as HTMLFormElement);
    expect([field('ph').value, field('dv').value, data.get('ph'), data.get('dv')]).toEqual(['', 'b', null, 'b']);
    await userEvent.selectOptions(field('ph'), 'S');
    expect(box('ph').classList.contains('dk-select--empty')).toBe(false);
  });

  test('groups, plain options and <option> children together; the left icon and chevron are decorative and don\'t take clicks; the text starts after the icon', async () => {
    await render(<Grid><Select id="grp" leftIcon="schedule" aria-label="Groups" options={[{ label: 'Europe', options: ['London', 'Paris'] }, 'Tokyo']}><option value="kid">Child</option></Select></Grid>);
    const i = field('grp');
    expect([...i.querySelectorAll('optgroup')].map((g) => g.label + '=' + [...g.children].map((o) => (o as HTMLOptionElement).value).join('/')).join()).toBe('Europe=London/Paris');
    expect([...i.options].map((o) => o.value).join()).toBe('London,Paris,Tokyo,kid');
    expect([...box('grp').querySelectorAll<HTMLElement>(':scope > [aria-hidden="true"]')].map((x) => x.getAttribute('aria-hidden') + ':' + css(x).pointerEvents + ':' + (x.querySelector<HTMLElement>('[data-icon]'))?.dataset.icon).join())
      .toBe('true:none:schedule,true:none:expand_more');
    expect(css(i).paddingLeft).toBe('36px');
  });

  test('a click on the chevron lands on the <select>, so it opens', async () => {
    await render(<Grid><Select id="lg" size="lg" options={['x']} aria-label="Large" /></Grid>);
    const r = field('lg').getBoundingClientRect(), c = box('lg').querySelector('[data-icon="expand_more"]')!.getBoundingClientRect();
    expect(document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2)).toBe(field('lg'));
    expect(c.right <= r.right && c.left >= r.left).toBe(true);
  });

  test('focus: the border and a 1px ring take the focus color; a transparent outline for forced-colors mode', async () => {
    await render(<Grid><Role changes={[]} /></Grid>);
    field('md').focus();
    const ring = color('var(--focus-ring)');
    // The border and ring ease in over 150ms.
    await expect.poll(() => css(box('md')).borderTopColor).toBe(ring);
    await expect.poll(() => css(box('md')).boxShadow).toContain(ring);
    const s = css(box('md'));
    expect(s.boxShadow).toMatch(/0px 0px 0px 1px/);
    expect([s.outlineWidth, s.outlineColor]).toEqual(['2px', 'rgba(0, 0, 0, 0)']);
  });

  test('hover: field-border-hover', async () => {
    await render(<Grid><Select id="sm" size="sm" options={['x']} aria-label="Small" /><Select id="lg" size="lg" options={['x']} aria-label="Large" /></Grid>);
    await userEvent.hover(field('sm'));
    await expect.poll(() => css(box('sm')).borderTopColor).not.toBe(css(box('lg')).borderTopColor);
  });

  test('invalid: aria-invalid and a danger border; disabled: native disabled, 50%, not-allowed', async () => {
    await render(<Grid><Select id="inv" invalid options={['x']} aria-label="Invalid" /><Select id="dis" disabled options={['x']} aria-label="Disabled" /></Grid>);
    expect(field('inv').getAttribute('aria-invalid')).toBe('true');
    await expect.poll(() => css(box('inv')).borderTopColor).toBe(color('var(--danger)'));
    expect([field('dis').disabled, css(box('dis')).opacity, css(field('dis')).cursor]).toEqual([true, '0.5', 'not-allowed']);
    expect(box('dis').className).toMatch(/disabled/);
  });

  test('readOnly: focusable and aria-readonly; keys, a press and a picked option (a phone\'s picker) leave the value and skip onChange; the form still sends it; field-readonly background, default cursor, no hover change', async () => {
    const changes: string[] = [];
    await render(<Grid><form id="ro-form"><button type="button" id="ro-before">before</button>
      <Select id="ro" name="role" readOnly defaultValue="b" onChange={(e) => changes.push(e.target.value)} options={['a', 'b', 'c']} aria-label="Role" />
      <Select id="ro-c" readOnly value="b" onChange={(e) => changes.push('c:' + e.target.value)} options={['a', 'b', 'c']} aria-label="Controlled" />
    </form><Select id="rw" options={['x']} aria-label="Editable" /></Grid>);
    document.getElementById('ro-before')!.focus();
    await userEvent.tab();
    const at = document.activeElement?.id;
    let pressed: boolean | null = null;
    const watch = (e: Event) => { pressed = e.defaultPrevented; };
    window.addEventListener('keydown', watch);
    await userEvent.keyboard('{ArrowDown}{ArrowUp}{End}c');
    const keyed = field('ro').value;
    await userEvent.keyboard(' ');
    const space = pressed;
    window.removeEventListener('keydown', watch);
    window.addEventListener('mousedown', watch);
    await userEvent.click(field('ro'));
    window.removeEventListener('mousedown', watch);
    const press = pressed;
    for (const id of ['ro', 'ro-c']) { field(id).value = 'c'; field(id).dispatchEvent(new Event('change', { bubbles: true })); }
    await expect.poll(() => [field('ro').value, field('ro-c').value]).toEqual(['b', 'b']);
    const sent = new FormData(document.getElementById('ro-form') as HTMLFormElement).get('role');
    // No hover change: the read-only box keeps the border it had before the pointer came (in light themes the hover
    // border and the focus ring share a color, so it's held to its own resting border, not compared with one).
    await userEvent.hover(field('rw'));
    const roBefore = css(box('ro')).borderTopColor;
    await userEvent.hover(field('ro'));
    expect([at, keyed, space, press, changes, sent, field('ro').getAttribute('aria-readonly'), field('ro').disabled]).toEqual(['ro', 'b', true, true, [], 'b', 'true', false]);
    expect([css(box('ro')).backgroundColor, css(field('ro')).cursor, box('ro').className]).toEqual([color('var(--field-readonly)'), 'default', expect.stringMatching(/dk-select--readonly/)]);
    expect(css(box('ro')).borderTopColor).toBe(roBefore);
  });

  test('GR161: a controlled value that matches no option warns once (the <select> shows the first option and a form sends it); one that matches, a placeholder\'s "" or a child <option> doesn\'t', async () => {
    const said = () => warnings.mock.calls.filter((c: unknown[]) => /select-value/.test(String(c[0]))).map((c: unknown[]) => String(c[0]));
    const screen = await render(<Select aria-label="Fruit" value="pear" onChange={() => {}} options={['apple', 'pear']}><option value="kiwi">Kiwi</option></Select>);
    await screen.rerender(<Select aria-label="Fruit" value="kiwi" onChange={() => {}} options={['apple', 'pear']}><option value="kiwi">Kiwi</option></Select>);
    await screen.rerender(<Select aria-label="Fruit" value="" placeholder="Pick one" onChange={() => {}} options={['apple', 'pear']} />);
    expect(said()).toEqual([]);
    await screen.rerender(<Select aria-label="Fruit" value="mango" onChange={() => {}} options={['apple', 'pear']} />);
    await expect.poll(said).toHaveLength(1);
    expect(said()[0]).toMatch(/value "mango" matches no option, so it shows "apple"/);
    expect((document.querySelector('select') as HTMLSelectElement).value).toBe('apple');
  });

  test('in a Field: labelled, described and invalid with the error', async () => {
    await render(<Grid><Field label="Country" error="Pick a country."><Select id="fld" placeholder="Choose" options={['DK']} /></Field></Grid>);
    const i = field('fld');
    expect([i.labels[0]!.textContent, i.getAttribute('aria-invalid'), !!i.getAttribute('aria-describedby')]).toEqual(['Country', 'true', true]);
    expect(box('fld').className).toMatch(/dk-select--invalid/);
  });

  test('contrast in all six themes: text and placeholder 4.5:1 on the field; chevron, focus ring and invalid border 3:1, the soft border 1.3:1', () => {
    expect(lowContrast([
      ['text', 'var(--text)', 'var(--field)', 4.5],
      ['placeholder', 'var(--placeholder)', 'var(--field)', 4.5],
      ['chevron', 'var(--text-muted)', 'var(--field)', 3],
      ['border, soft by design: under 3:1 on purpose, held to 1.3:1 (README, Accessibility)', 'var(--field-border)', 'var(--field)', 1.3],
      ['border on page, soft by design: under 3:1 on purpose, held to 1.3:1', 'var(--field-border)', 'var(--surface)', 1.3],
      ['focus', 'var(--focus-ring)', 'var(--surface)', 3],
      ['invalid', 'var(--field-border-invalid)', 'var(--field)', 3],
    ])).toEqual([]);
  });

  test('the focus ring shows at once (no transition in), so a field focused as a popup opens doesn\'t animate on its first frame; it still fades out on blur', () => withMotion(async () => {
    await render(<><Select id="ring" aria-label="Fruit" options={['Apple', 'Pear']} /><button id="away">Away</button></>);
    const f = document.getElementById('ring') as HTMLSelectElement, b = document.getElementById('ring')!.closest('[data-component=select]') as HTMLElement;
    const shadows = () => b.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === 'box-shadow').length;
    f.focus();
    expect([shadows(), css(b).boxShadow]).toEqual([0, expect.stringMatching(/0px 0px 0px 1px/)]);
    (document.getElementById('away') as HTMLElement).focus();
    expect(shadows()).toBe(1);
  }));
});

describe('Select: the styled list', () => {
  const FRUIT = ['Apple', 'Banana', { value: 'c', label: 'Cherry', disabled: true }, { label: 'Citrus', options: ['Lemon', 'Lime'] }];
  const styled = typeof CSS !== 'undefined' && CSS.supports('appearance', 'base-select');
  const radius = (v: string) => { const d = document.createElement('div'); d.style.borderRadius = v; document.body.appendChild(d); const r = css(d).borderTopLeftRadius; d.remove(); return r; };
  const opt = (label: string) => [...document.querySelectorAll('option')].find((o) => o.textContent === label)!;

  test('where the browser lets the page style it, the list is an overlay surface like Combobox\'s; elsewhere the browser draws its own', async () => {
    await render(<div style={{ width: '280px', height: '360px' }}><Select aria-label="Fruit" placeholder="Choose a fruit" options={FRUIT} /></div>);
    const s = document.querySelector('select')!;
    if (!styled) { expect(css(s).appearance).toBe('none'); return; }
    await userEvent.click(s);
    const pick = getComputedStyle(s, '::picker(select)');
    expect([s.matches(':open'), pick.backgroundColor, pick.borderTopLeftRadius, getComputedStyle(s, '::picker-icon').display])
      .toEqual([true, color('var(--surface-overlay)'), radius('var(--radius-surface)'), 'none']);
    await userEvent.keyboard('{Escape}');
  });

  test('keys: Down opens it and moves, Enter picks and says so through onChange, a disabled option is passed over, Escape closes it with nothing changed', async () => {
    const changes: string[] = [];
    await render(<Select aria-label="Fruit" options={FRUIT} defaultValue="Banana" onChange={(e) => changes.push(e.target.value)} />);
    const s = document.querySelector('select')!;
    s.focus();
    await userEvent.keyboard('{ArrowDown}');
    if (styled) {
      expect(s.matches(':open')).toBe(true);
      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect([s.matches(':open'), s.value, changes]).toEqual([false, 'Lemon', ['Lemon']]);
      await userEvent.keyboard('{ArrowDown}{ArrowUp}{Escape}');
      expect([s.matches(':open'), s.value, changes]).toEqual([false, 'Lemon', ['Lemon']]);
    } else {
      expect(changes.length).toBeLessThanOrEqual(1);
    }
  });

  test('the option under the keyboard has the grey highlight fill and no bar (a 2px bar with more contrast); text reads 4.5:1 on the list and on that fill, the tick 3:1, and the more-contrast bar 3:1 on the fill, in all six themes', async () => {
    await render(<div style={{ width: '280px', height: '360px' }}><Select aria-label="Fruit" options={FRUIT} defaultValue="Apple" /></div>);
    const s = document.querySelector('select')!;
    if (!styled) return expect(css(s).appearance).toBe('none');
    s.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const act = document.activeElement as HTMLOptionElement;
    expect([act.textContent, css(act).backgroundColor, css(act).boxShadow]).toEqual(['Banana', color('var(--highlight)'), `${color('var(--highlight)')} 2px 0px 0px 0px inset`]);
    const still = document.createElement('style'); still.textContent = '*, *::before, *::after, ::picker(select) { transition: none !important; }'; document.head.appendChild(still);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = getComputedStyle(s, '::picker(select)').backgroundColor, abg = css(act).backgroundColor;
      const pairs: Array<[string, string, string, number]> = [['option', css(opt('Apple')).color, bg, 4.5], ['active option', css(act).color, abg, 4.5], ['group', getComputedStyle(document.querySelector('optgroup legend') ?? document.querySelector('optgroup')!).color, bg, 4.5], ['tick', getComputedStyle(opt('Apple'), '::checkmark').color, bg, 3], ];
      document.documentElement.setAttribute('data-contrast', 'more');
      pairs.push(['more-contrast bar', css(act).boxShadow.match(/rgb\([^)]+\)/)![0], css(act).backgroundColor, 3]);
      document.documentElement.removeAttribute('data-contrast');
      for (const [k, fg, on, min] of pairs) { const r = contrast(fg, on); if (r < min) low.push(`${th} ${k} ${r.toFixed(2)}`); }
    }
    still.remove();
    await userEvent.keyboard('{Escape}');
    expect(low).toEqual([]);
  });

  test('forced colors: the option under the keyboard is outlined in Highlight, since the fill is gone', async () => {
    await render(<div style={{ width: '280px', height: '360px' }}><Select aria-label="Fruit" options={FRUIT} defaultValue="Apple" /></div>);
    const s = document.querySelector('select')!;
    if (!styled) return expect(css(s).appearance).toBe('none');
    await forcedColors(async () => {
      s.focus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      const act = document.activeElement as HTMLElement;
      expect([act.textContent, css(act).outlineStyle, css(act).outlineWidth]).toEqual(['Banana', 'solid', css(document.documentElement).getPropertyValue('--focus-ring-width').trim()]);
      await userEvent.keyboard('{Escape}');
    });
  });
});
