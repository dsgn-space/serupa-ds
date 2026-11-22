import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { css, lowContrast, disabledLook } from '../../../tools/test/vitest/helpers';
import { page, userEvent } from 'vitest/browser';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Combobox } from '../Combobox/Combobox';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Slider } from '../Slider/Slider';
import { Input } from '../Input/Input';
import { Radio, RadioGroup } from '../Radio/Radio';
import { Tooltip } from '../Tooltip/Tooltip';
import { Textarea } from '../Textarea/Textarea';
import { Field, FormErrors } from './Field';
import { Checkbox } from '../Checkbox/Checkbox';
import { idLabels } from '../../internal/labels';
import { SerupaProvider } from '../../internal/provider';

const announcer = () => document.querySelector('[data-srp-announcer]') as HTMLElement;

const el = (id: string) => document.getElementById(id) as HTMLInputElement;
const described = (id: string) => (el(id).getAttribute('aria-describedby') || '').split(' ').filter(Boolean);

describe('Field', () => {
  test('the label names the control (Field\'s id becomes the control\'s id); the ref still reaches it; className and attributes go to the outer element; the label is font-medium', async () => {
    const ref = React.createRef<HTMLInputElement>();
    await render(<Field id="plain" label="Name" className="extra" data-x="y"><Input ref={ref} /></Field>);
    const f = el('plain').closest('[data-component="field"]') as HTMLElement;
    expect(ref.current).toBe(el('plain'));
    expect(el('plain').labels?.[0]!.textContent).toBe('Name');
    expect(f.className).toMatch(/srp-field extra/);
    expect([f.dataset.x, f.dataset.component]).toEqual(['y', 'field']);
    expect(css(f.querySelector('label')).fontWeight).toBe('500');
    expect(el('plain').getAttribute('aria-describedby')).toBeNull();
    expect(el('plain').getAttribute('aria-invalid')).toBeNull();
  });

  test('its own ref reaches the outer element in every layout, so an app can scroll to a field with an error', async () => {
    const v = React.createRef<HTMLElement>(), h = React.createRef<HTMLElement>(), g = React.createRef<HTMLElement>();
    await render(<>
      <Field ref={v} label="Name" error="Enter a name"><Input /></Field>
      <Field ref={h} label="City" orientation="horizontal"><Input /></Field>
      <Field ref={g} label="Size" group><Radio name="s" value="s">Small</Radio></Field>
    </>);
    expect([v.current?.tagName, h.current?.tagName, g.current?.tagName]).toEqual(['DIV', 'DIV', 'FIELDSET']);
    for (const r of [v, h, g]) expect(r.current?.getAttribute('data-component')).toBe('field');
    expect(v.current?.textContent).toContain('Enter a name');
  });

  test('hint and error join the control\'s own aria-describedby; the error makes an Input invalid; required adds aria-required and a hidden *', async () => {
    function App() {
      const [err, setErr] = React.useState<string | null>('Enter an email address.');
      return <>
        <Field label="Email" hint="For receipts." error={err} required><Input id="mail" aria-describedby="own" /></Field>
        <p id="own">own</p>
        <button type="button" onClick={() => setErr(null)}>Clear</button>
      </>;
    }
    const screen = await render(<App />);
    const f = el('mail').closest('[data-component="field"]') as HTMLElement;
    const ids = described('mail');
    expect(ids[0]).toBe('own');
    expect(document.getElementById(ids[1]!)?.textContent).toBe('For receipts.');
    expect(document.getElementById(ids[2]!)?.textContent).toBe('Enter an email address.');
    expect(el('mail').getAttribute('aria-invalid')).toBe('true');
    expect(el('mail').parentElement?.className).toMatch(/srp-input--invalid/);
    expect(el('mail').getAttribute('aria-required')).toBe('true');
    expect(f.querySelector('label > span[aria-hidden]')?.getAttribute('aria-hidden')).toBe('true');
    expect([...f.children].map((c) => c.className.split(' ')[0])).toEqual(['srp-field__label', 'srp-field__control', 'srp-field__hint', 'srp-field__error']);   // the hint under the box, then the error
    expect((f.querySelector<HTMLElement>('[data-icon] + span[id]')?.previousElementSibling as HTMLElement | null)?.dataset.icon).toBe('error');

    await screen.getByRole('button', { name: 'Clear' }).click();
    expect(described('mail')).toHaveLength(2);
    expect(el('mail').getAttribute('aria-invalid')).toBeNull();
    expect(f.querySelector('[data-icon="error"]')).toBeNull();
  });

  test('optional adds "(optional)" or your words; a plain DOM control gets aria-invalid, never an unknown invalid attribute', async () => {
    await render(<>
      <Field label="Notes" optional><Textarea id="notes" /></Field>
      <Field label="Code" optional="Leave blank if none"><input id="native" /></Field>
      <Field label="Native bad" error="Bad"><input id="native-bad" /></Field>
    </>);
    expect(el('notes').labels?.[0]!.textContent).toBe('Notes(optional)');
    expect(el('native').labels?.[0]!.textContent).toBe('CodeLeave blank if none');
    expect(el('native-bad').getAttribute('aria-invalid')).toBe('true');
    expect(el('native-bad').hasAttribute('invalid')).toBe(false);
  });

  test('right to left, a Latin label keeps its gap before "(optional)" instead of running into it', async () => {
    await render(<div dir="rtl"><Field label="Address line 2" optional><input id="rtl-opt" /></Field></div>);
    const label = el('rtl-opt').labels![0]!, marker = label.lastElementChild as HTMLElement;   // the "(optional)" after the words
    expect(marker.textContent).toBe('(optional)');
    const words = document.createRange();
    words.selectNodeContents(label.firstChild!);
    const w = words.getBoundingClientRect(), m = marker.getBoundingClientRect();
    // The marker sits on the label's start side, which in a right-to-left page is its left, a margin away.
    expect(Math.round(w.left - m.right), JSON.stringify([w.left, w.right, m.left, m.right])).toBeGreaterThanOrEqual(3);
  });

  test('the default "(optional)" comes from the labels: Indonesian under an id-ID provider', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><Field label="Catatan" optional><input id="opt-id" /></Field></SerupaProvider>);
    expect(el('opt-id').labels?.[0]!.textContent).toBe('Catatan(opsional)');
  });

  test('an error that appears or changes after mount is announced politely; one there from the start, or unchanged on a re-render, is not', async () => {
    function Form({ error }: { error?: string }) { return <Field label="Email" error={error}><input id="ann" /></Field>; }
    const r = await render(<Form error="Already there" />);
    await r.rerender(<Form error="Already there" />);
    await new Promise((ok) => setTimeout(ok, 700));
    expect(announcer().textContent).not.toContain('Already there');
    await r.rerender(<Form />);
    await r.rerender(<Form error="Enter an email address like name@example.com" />);
    await expect.poll(() => announcer().textContent).toBe('Enter an email address like name@example.com');
    await r.rerender(<Form error="Use a work address" />);
    await expect.poll(() => announcer().textContent).toBe('Use a work address');
  });

  test('the shared announcer is hidden without the utilities stylesheet (inline styles, not only the sr-only class)', async () => {
    await render(<Field label="X"><input id="hid" /></Field>);
    const a = announcer();
    expect([a.style.position, a.style.width, a.style.clipPath, a.style.overflow]).toEqual(['absolute', '1px', 'inset(50%)', 'hidden']);
  });

  test('a label whose control id is nowhere on the page warns once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Field label="Lost" id="nowhere-xyz">Just text</Field>);
    await expect.poll(() => warn.mock.calls.some((c) => String(c[0]).includes('nowhere-xyz'))).toBe(true);
    warn.mockRestore();
  });

  test('a native <select> as the direct child is the control, options and all: the label names it, the hint and error describe it, aria-invalid and aria-required', async () => {
    await render(<Field label="Size" hint="Pick one" error="Required" required><select><option value="">Choose</option><option>S</option></select></Field>);
    const s = document.querySelector('select')!;
    expect([s.labels?.[0]!.textContent?.replaceAll('*', ''), s.getAttribute('aria-invalid'), s.getAttribute('aria-required'), (s.getAttribute('aria-describedby') || '').split(' ').length]).toEqual(['Size', 'true', 'true', 2]);
  });

  test('disabled disables the control and dims the label, its required mark too', async () => {
    await render(<Field label="Locked" disabled required><Input id="locked" /></Field>);
    expect(el('locked').disabled).toBe(true);
    const label = el('locked').closest('[data-component="field"]')!.querySelector('label')!;
    expect(disabledLook(label)).toBe('neutral');
    // A disabled field asks for nothing, so its mark isn't the danger red beside a dimmed label.
    const mark = [...label.querySelectorAll('*')].find((n) => n.textContent === '*') as HTMLElement;
    expect(getComputedStyle(mark).color).toBe(getComputedStyle(label).color);
  });

  test('the hint and the message are a size under the label: 12px on a 16px line beside the 14px label, the message\'s icon 14px on its first line', async () => {
    await render(<>
      <Field id="sz" label="Email" hint="For receipts." error="Enter an email address."><Input /></Field>
      <Field id="sw" label="Name" warning="A project with this name was archived."><Input /></Field>
    </>);
    const box = (id: string) => el(id).closest('[data-component="field"]')!, at = (id: string, sel: string) => css(box(id).querySelector(sel));
    expect([at('sz', '.srp-field__label').fontSize, at('sz', '.srp-field__hint').fontSize, at('sz', '.srp-field__hint').lineHeight, at('sz', '.srp-field__error').fontSize, at('sw', '.srp-field__warning').fontSize])
      .toEqual(['14px', '12px', '16px', '12px', '12px']);
    const icon = box('sz').querySelector('.srp-field__error-icon')!.getBoundingClientRect(), line = box('sz').querySelector('.srp-field__error')!.getBoundingClientRect();
    expect([Math.round(icon.width), Math.round(icon.top + icon.height / 2 - line.top)]).toEqual([14, 8]);
  });

  test('group: a <fieldset> whose <legend> lays out like a label; the hint and error describe the fieldset; controls keep their ids; a disabled group disables every control', async () => {
    await render(<>
      <Field group label="Plan" hint="Pick one." error="Choose a plan." id="grp">
        <label><input type="radio" name="p" id="r1" />Free</label>
        <label><input type="radio" name="p" id="r2" />Pro</label>
      </Field>
      <Field group label="Off" disabled><input type="checkbox" id="c1" /></Field>
    </>);
    const fs = el('r1').closest('fieldset') as HTMLFieldSetElement, legend = fs.querySelector('legend')!;
    expect(fs.className).toMatch(/srp-field--group/);
    expect(legend.textContent).toBe('Plan');
    expect((fs.getAttribute('aria-describedby') || '').split(' ').map((i) => document.getElementById(i)?.textContent)).toEqual(['Pick one.', 'Choose a plan.']);
    expect(el('r1').id).toBe('r1');
    expect(css(fs).borderTopWidth).toBe('0px');
    // The hint is the first thing the fieldset's aria-describedby names, and it sits under the choices, above the error.
    const hint = document.getElementById(fs.getAttribute('aria-describedby')!.split(' ')[0]!)!;
    expect([...fs.children].map((c) => c.className.split(' ')[0])).toEqual(['srp-field__label', 'srp-field__control', 'srp-field__hint', 'srp-field__error']);
    expect(hint.getBoundingClientRect().top).toBeGreaterThanOrEqual(el('r2').getBoundingClientRect().bottom);
    expect(el('c1').matches(':disabled')).toBe(true);
  });

  test('group required: the * stays hidden and the legend says "Required" in words, so the group is read as required whatever it holds; in the provider\'s words; not shown (FR1)', async () => {
    await render(<>
      <Field group required label="Contact by"><RadioGroup><Radio value="e">Email</Radio><Radio value="p">Phone</Radio></RadioGroup></Field>
      <Field group required label="Extras"><label><input type="checkbox" id="x1" />Gift wrap</label></Field>
      <SerupaProvider labels={idLabels}><Field group required label="Kontak"><label><input type="checkbox" />Surel</label></Field></SerupaProvider>
      <Field group label="Optional set"><label><input type="checkbox" />Nothing</label></Field>
    </>);
    for (const name of ['Contact by Required', 'Extras Required', 'Kontak Wajib diisi']) await expect.element(page.getByRole('group', { name, exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('group', { name: 'Optional set', exact: true })).toBeInTheDocument();
    const legend = el('x1').closest('fieldset')!.querySelector('legend')!, said = legend.lastElementChild as HTMLElement;
    expect([css(said).position, Math.round(said.getBoundingClientRect().width) <= 1]).toEqual(['absolute', true]);
  });

  test('no React warnings', async () => {
    const error = vi.spyOn(console, 'error'), warn = vi.spyOn(console, 'warn');
    await render(<>
      <Field label="Email" hint="Hint" error="Error" required><Input /></Field>
      <Field label="Native" error="Bad"><input /></Field>
      <Field group label="Group" disabled><input type="checkbox" /></Field>
    </>);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore(); warn.mockRestore();
  });

  test('contrast in every theme: label, hint, error and * at 4.5:1 on surface (the error on surface-muted too)', () => {
    expect(lowContrast([
      ['label', 'var(--text)', 'var(--surface)', 4.5],
      ['hint', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['error', 'var(--danger-text)', 'var(--surface)', 4.5],
      ['error on muted', 'var(--danger-text)', 'var(--surface-muted)', 4.5],
      ['warning', 'var(--warning-text)', 'var(--surface)', 4.5],
      ['warning on muted', 'var(--warning-text)', 'var(--surface-muted)', 4.5],
      ['checking', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['required', 'var(--danger-text)', 'var(--surface)', 4.5],
    ])).toEqual([]);
  });

  test('warning: advice under the control in warning-text with its icon, in the control\'s description, but the control stays valid and the form can be sent', async () => {
    const sent = vi.fn((e: React.FormEvent) => e.preventDefault());
    await render(<form onSubmit={sent}><Field label="Project name" hint="Shown to the team" warning="A project with this name was archived last year"><Input id="warn" name="n" defaultValue="Atlas" required /></Field><button>Create</button></form>);
    const f = el('warn').closest('[data-component="field"]') as HTMLElement;
    const note = document.getElementById(described('warn')[1]!)!.parentElement!;
    expect(described('warn').map((i) => document.getElementById(i)?.textContent)).toEqual(['Shown to the team', 'A project with this name was archived last year']);
    expect([el('warn').getAttribute('aria-invalid'), el('warn').getAttribute('aria-errormessage'), f.classList.contains('srp-field--warning'), f.classList.contains('srp-field--invalid')]).toEqual([null, null, true, false]);
    const probe = document.createElement('span'); probe.style.color = 'var(--warning-text)'; document.body.append(probe);
    expect(css(note).color).toBe(css(probe).color);
    probe.remove();
    expect(note.querySelector('svg')).not.toBeNull();
    await userEvent.click(page.getByRole('button', { name: 'Create' }));
    expect(sent).toHaveBeenCalledOnce();
  });

  test('an error takes the warning\'s place, and "checking…" takes it while the answer is checked; one message at a time', async () => {
    function Form(p: { error?: string; checking?: string }) { return <Field label="Address" error={p.error} checking={p.checking} warning="This address is outside our usual area"><input id="one" /></Field>; }
    const r = await render(<Form />);
    const msgs = () => described('one').map((i) => document.getElementById(i)!.parentElement!).map((m) => m.className + ': ' + m.textContent);
    expect(msgs()).toEqual(['srp-field__warning: This address is outside our usual area']);
    await r.rerender(<Form checking="Checking the address…" />);
    expect(msgs()).toEqual(['srp-field__checking: Checking the address…']);
    await r.rerender(<Form checking="Checking the address…" error="We can't deliver to this address" />);
    expect(msgs()).toEqual(['srp-field__error: We can\'t deliver to this address']);
    expect(el('one').getAttribute('aria-invalid')).toBe('true');
  });

  test('checking: a small spinner and the words under the control, in its description and said politely; the field is aria-busy until it ends', async () => {
    function Form({ checking }: { checking?: string }) { return <Field label="Username" checking={checking}><Input id="chk" /></Field>; }
    const r = await render(<Form />);
    const f = el('chk').closest('[data-component="field"]') as HTMLElement;
    expect(f.getAttribute('aria-busy')).toBeNull();
    await r.rerender(<Form checking="Checking the name…" />);
    expect(f.getAttribute('aria-busy')).toBe('true');
    expect(f.classList.contains('srp-field--checking')).toBe(true);
    expect(described('chk').map((i) => document.getElementById(i)?.textContent)).toEqual(['Checking the name…']);
    expect(document.getElementById(described('chk')[0]!)!.parentElement!.querySelector('[data-component="loader"]')).not.toBeNull();
    expect(el('chk').getAttribute('aria-invalid')).toBeNull();
    await expect.poll(() => announcer().textContent).toBe('Checking the name…');
    await r.rerender(<Form />);
    expect([f.getAttribute('aria-busy'), described('chk')]).toEqual([null, []]);
  });

  test('warning and checking work on a group too: the fieldset is described and stays valid', async () => {
    await render(<Field group label="Plan" warning="The free plan has a 3-project limit" data-testid="g"><Radio name="p" value="free">Free</Radio></Field>);
    const fs = page.getByTestId('g').element() as HTMLElement;
    expect((fs.getAttribute('aria-describedby') || '').split(' ').map((i) => document.getElementById(i)?.textContent)).toEqual(['The free plan has a 3-project limit']);
    expect(fs.querySelector('input')!.getAttribute('aria-invalid')).toBeNull();
  });

  // The control can sit inside a Tooltip, your own wrapper or a form library's component: Field still wires it.
  test('a control at any depth gets the id, the hint and error, required and invalid, and its label names it', async () => {
    function EmailInput(p: React.ComponentProps<typeof Input>) { return <div className="wrap"><Input type="email" {...p} /></div>; }
    await render(<>
      <Field label="Email" hint="Work address" error="Required" required><Tooltip content="We never share it"><EmailInput /></Tooltip></Field>
      <Field id="deep" label="Phone" hint="Mobile"><div><span><Input /></span></div></Field>
    </>);
    const input = document.querySelector('.wrap input') as HTMLInputElement;
    expect([input.labels?.[0]?.textContent?.replace(/\*/g, ''), input.getAttribute('aria-required'), input.getAttribute('aria-invalid')]).toEqual(['Email', 'true', 'true']);
    const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    expect(ids.map((i) => document.getElementById(i)?.textContent)).toEqual(expect.arrayContaining(['Work address', 'Required']));
    expect([el('deep').labels?.[0]?.textContent, document.getElementById(described('deep')[0]!)?.textContent]).toEqual(['Phone', 'Mobile']);
  });

  test('a direct child component isn\'t described twice; a group Field inside a Field doesn\'t take its id', async () => {
    await render(<>
      <Field id="once" label="Name" hint="As on your ID"><Input /></Field>
      <Field id="outer" label="Outer" hint="Outer hint"><div><Field group label="Inner"><Input id="inner" /></Field></div></Field>
    </>);
    expect(described('once')).toHaveLength(1);
    expect([el('inner').id, el('inner').getAttribute('aria-describedby')]).toEqual(['inner', null]);
  });

  test('a Combobox\'s listbox is named by the Field label', async () => {
    await render(<Field label="Country"><Combobox options={['Indonesia', 'Japan']} /></Field>);
    const list = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(document.getElementById(list.getAttribute('aria-labelledby') || '')?.textContent).toBe('Country');
  });

  test('clicking the label of a Slider, SegmentedControl or ColorPicker focuses it (their root is a <div>, which a label can\'t focus by itself) (AK1)', async () => {
    await render(<>
      <Field label="Volume"><Slider defaultValue={30} /></Field>
      <Field label="View"><SegmentedControl options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} defaultValue="week" /></Field>
      <Field label="Tag color"><ColorPicker swatches={['#1d4ed8', '#16a34a']} defaultValue="#16a34a" /></Field>
    </>);
    const label = (t: string) => [...document.querySelectorAll('label')].find((l) => l.textContent === t)!;
    await userEvent.click(label('Volume'));
    expect((document.activeElement as HTMLInputElement | null)?.type).toBe('range');
    await userEvent.click(label('View'));
    expect([document.activeElement?.getAttribute('role'), document.activeElement?.textContent]).toEqual(['radio', 'Week']);
    await userEvent.click(label('Tag color'));
    expect(document.activeElement?.getAttribute('aria-checked')).toBe('true');
  });

  test('with an error, the control points at it with aria-errormessage too (the description keeps it, for screen readers that skip aria-errormessage), directly or at any depth (J12)', async () => {
    const r = await render(<>
      <Field label="Email" error="Enter an email address"><input id="em" /></Field>
      <Field label="Name" error="Required"><Tooltip content="Your full name"><Input id="nm" /></Tooltip></Field>
    </>);
    for (const id of ['em', 'nm']) {
      const c = document.getElementById(id)!;
      const msg = c.getAttribute('aria-errormessage');
      expect([!!msg && document.getElementById(msg)?.textContent, (c.getAttribute('aria-describedby') || '').split(' ').includes(msg || '-')]).toEqual([id === 'em' ? 'Enter an email address' : 'Required', true]);
    }
    await r.rerender(<Field label="Email"><input id="em" /></Field>);
    expect(document.getElementById('em')!.hasAttribute('aria-errormessage')).toBe(false);
  });

  test('orientation="horizontal" (D17): the label in a 192px column on the control\'s first line (baselines aligned), 16px from it; hint and error under the control; still named and described', async () => {
    await render(<div style={{ width: '560px' }}>
      <Field id="h-in" orientation="horizontal" label="Display name" hint="Shown on your profile." error="Too short.">
        <Input defaultValue="An" />
      </Field>
    </div>);
    const f = el('h-in').closest('[data-component="field"]') as HTMLElement;
    const [hintId, errorId] = described('h-in');
    const label = el('h-in').labels![0]!.getBoundingClientRect(), box = el('h-in').parentElement!.getBoundingClientRect();
    const hint = document.getElementById(hintId!)!.getBoundingClientRect(), error = document.getElementById(errorId!)!.getBoundingClientRect();
    expect([f.dataset.layout, Math.round(label.width), Math.round(box.left - label.right), Math.round(box.width)]).toEqual(['horizontal', 192, 16, 560 - 192 - 16]);
    // the label's text sits on the input's text line
    const text = document.createRange(); text.selectNodeContents(el('h-in').labels![0]!.firstChild!);
    const input = el('h-in').getBoundingClientRect();
    expect(Math.abs((text.getBoundingClientRect().top + text.getBoundingClientRect().bottom) / 2 - (input.top + input.bottom) / 2)).toBeLessThan(2);
    expect([hint.top >= box.bottom, error.top >= hint.bottom, Math.round(hint.left) === Math.round(box.left)]).toEqual([true, true, true]);
    expect([el('h-in').labels![0]!.textContent, described('h-in').length, el('h-in').getAttribute('aria-invalid')]).toEqual(['Display name', 2, 'true']);
  });

  test('orientation="horizontal" stacks again when the field is narrower than both columns, and is ignored with group', async () => {
    await render(<>
      <div style={{ width: '300px' }}><Field id="h-narrow" orientation="horizontal" label="Display name"><Input /></Field></div>
      <div style={{ width: '560px' }}><Field group orientation="horizontal" label="Plan" data-testid="h-group"><RadioGroup name="p"><Radio value="a">A</Radio></RadioGroup></Field></div>
    </>);
    const label = el('h-narrow').labels![0]!.getBoundingClientRect(), box = el('h-narrow').parentElement!.getBoundingClientRect();
    expect([box.top >= label.bottom, Math.round(box.left), Math.round(box.width)]).toEqual([true, Math.round(label.left), 300]);
    const g = document.querySelector('[data-testid="h-group"]') as HTMLElement;
    expect([g.tagName, g.classList.contains('srp-field--horizontal'), g.dataset.layout]).toEqual(['FIELDSET', false, undefined]);
  });
});

describe('Field inside a shadow root (GR60)', () => {
  test('clicking the label of a Slider focuses its thumb, and nothing warns that the label names nothing or the Slider has no name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const host = document.createElement('div');
    document.body.append(host);
    const inner = document.createElement('div');
    host.attachShadow({ mode: 'open' }).append(inner);
    try {
      await render(<Field label="Shadow volume"><Slider defaultValue={30} /></Field>, { container: inner });
      const root = host.shadowRoot!;
      await userEvent.click(root.querySelector<HTMLElement>('label')!);
      expect([(root.activeElement as HTMLInputElement | null)?.type, warn.mock.calls.map((c) => String(c[0])).filter((m) => /names nothing|no accessible name/.test(m))]).toEqual(['range', []]);
    } finally { host.remove(); warn.mockRestore(); }
  });
});

describe('FormErrors', () => {
  test('each Field shows the server message for its control\'s name: aria-invalid, and the message in its description; a field without one stays valid', async () => {
    await render(<FormErrors errors={{ email: 'That email is taken', other: 'Not on this page' }}>
      <Field id="fe-email" label="Email"><Input name="email" /></Field>
      <Field id="fe-name" label="Name"><Input name="name" /></Field>
    </FormErrors>);
    expect(el('fe-email').getAttribute('aria-invalid')).toBe('true');
    const msg = described('fe-email').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(msg).toContain('That email is taken');
    expect(el('fe-name').getAttribute('aria-invalid')).toBeNull();
  });

  test('editing a field takes its message away; the next errors object brings it back; its own error prop wins', async () => {
    function Form({ errors }: { errors: Record<string, string> }) {
      return <FormErrors errors={errors}>
        <Field id="fe2-email" label="Email"><Input name="email" /></Field>
        <Field id="fe2-code" label="Code" error="Enter the code"><Input name="code" /></Field>
        <Field label="Terms" name="terms"><Checkbox id="fe2-terms">I agree</Checkbox></Field>
      </FormErrors>;
    }
    const screen = await render(<Form errors={{ email: 'That email is taken', code: 'Server says no', terms: 'Agree to the terms' }} />);
    expect(document.getElementById('fe2-code')!.closest('[data-component="field"]')!.textContent).toContain('Enter the code');
    expect(document.body.textContent).not.toContain('Server says no');
    await userEvent.type(el('fe2-email'), 'x');
    expect(el('fe2-email').getAttribute('aria-invalid')).toBeNull();
    expect(document.body.textContent).not.toContain('That email is taken');
    await userEvent.click(el('fe2-terms'));
    expect(document.body.textContent).not.toContain('Agree to the terms');
    await screen.rerender(<Form errors={{ email: 'That email is taken' }} />);
    expect(el('fe2-email').getAttribute('aria-invalid')).toBe('true');
  });
});

// The error a control points to with aria-errormessage (null when it has none).
const errorOf = (input: Element) => { const id = input.getAttribute('aria-errormessage'); return id ? document.getElementById(id) : null; };

describe('Field and the browser\'s own checks', () => {
  describe('a constraint the browser checks is said in words, not only by the red border', () => {
    test('left empty after an edit: the error says so, and the control is invalid and described by it; typing takes it away', async () => {
      await render(<form><Field label="Name" id="nf-name"><Input required /></Field><button>Send</button></form>);
      const input = el('nf-name');
      expect(errorOf(input)).toBeNull();   // never on first paint
      await userEvent.type(input, 'a');
      await userEvent.clear(input);
      await userEvent.tab();
      await expect.poll(() => input.getAttribute('aria-invalid')).toBe('true');
      const error = errorOf(input)!;
      expect(error.textContent).toBe(input.validationMessage);
      expect(described('nf-name')).toContain(error.id);
      await userEvent.type(input, 'Ana');
      await expect.poll(() => errorOf(input)).toBeNull();
      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });
    test('a submit shows every failing field\'s message, in the provider\'s words', async () => {
      await render(<SerupaProvider labels={idLabels}><form onSubmit={(e) => e.preventDefault()}>
        <Field label="Email" id="nf-mail"><Input type="email" required /></Field><button id="nf-send">Send</button>
      </form></SerupaProvider>);
      await userEvent.click(el('nf-send'));
      await expect.poll(() => errorOf(el('nf-mail'))?.textContent).toBe('Isi kolom ini.');
      expect(el('nf-mail').getAttribute('aria-invalid')).toBe('true');
    });
    test('an error you pass wins over the browser\'s', async () => {
      await render(<form><Field label="Name" id="nf-own" error="Pick a name"><Input required /></Field></form>);
      await userEvent.type(el('nf-own'), 'a');
      await userEvent.clear(el('nf-own'));
      await userEvent.tab();
      await new Promise((r) => setTimeout(r, 30));
      expect(errorOf(el('nf-own'))!.textContent).toBe('Pick a name');
    });
  });
});
