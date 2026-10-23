import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { css, lowContrast } from '../../../tools/test/vitest/helpers';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { Field } from './Field';

const el = (id: string) => document.getElementById(id) as HTMLInputElement;
const described = (id: string) => (el(id).getAttribute('aria-describedby') || '').split(' ').filter(Boolean);

describe('Field', () => {
  test('the label names the control (Field\'s id becomes the control\'s id); the ref still reaches it; className and attributes go to the outer element; the label is font-medium', async () => {
    const ref = React.createRef<HTMLInputElement>();
    await render(<Field id="plain" label="Name" className="extra" data-x="y"><Input ref={ref} /></Field>);
    const f = el('plain').closest('.dk-field') as HTMLElement;
    expect(ref.current).toBe(el('plain'));
    expect(el('plain').labels?.[0].textContent).toBe('Name');
    expect(f.className).toMatch(/dk-field extra/);
    expect([f.dataset.x, f.dataset.component]).toEqual(['y', 'field']);
    expect(css(f.querySelector('label')).fontWeight).toBe('500');
    expect(el('plain').getAttribute('aria-describedby')).toBeNull();
    expect(el('plain').getAttribute('aria-invalid')).toBeNull();
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
    const f = el('mail').closest('.dk-field') as HTMLElement;
    const ids = described('mail');
    expect(ids[0]).toBe('own');
    expect(document.getElementById(ids[1])?.textContent).toBe('For receipts.');
    expect(document.getElementById(ids[2])?.textContent).toBe('Enter an email address.');
    expect(el('mail').getAttribute('aria-invalid')).toBe('true');
    expect(el('mail').parentElement?.className).toMatch(/dk-input--invalid/);
    expect(el('mail').getAttribute('aria-required')).toBe('true');
    expect(f.querySelector('.dk-field__required')?.getAttribute('aria-hidden')).toBe('true');
    expect([...f.children].map((c) => c.className.split(' ')[0])).toEqual(['dk-field__label', 'dk-field__hint', 'dk-field__control', 'dk-field__error']);
    expect((f.querySelector('.dk-field__error .dk-icon') as HTMLElement | null)?.dataset.icon).toBe('error');

    await screen.getByRole('button', { name: 'Clear' }).click();
    expect(described('mail')).toHaveLength(2);
    expect(el('mail').getAttribute('aria-invalid')).toBeNull();
    expect(f.querySelector('.dk-field__error')).toBeNull();
  });

  test('optional adds "(optional)" or your words; a plain DOM control gets aria-invalid, never an unknown invalid attribute', async () => {
    await render(<>
      <Field label="Notes" optional><Textarea id="notes" /></Field>
      <Field label="Code" optional="Leave blank if none"><input id="native" /></Field>
      <Field label="Native bad" error="Bad"><input id="native-bad" /></Field>
    </>);
    expect(el('notes').labels?.[0].textContent).toBe('Notes(optional)');
    expect(el('native').labels?.[0].textContent).toBe('CodeLeave blank if none');
    expect(el('native-bad').getAttribute('aria-invalid')).toBe('true');
    expect(el('native-bad').hasAttribute('invalid')).toBe(false);
  });

  test('disabled disables the control and dims the label', async () => {
    await render(<Field label="Locked" disabled><Input id="locked" /></Field>);
    expect(el('locked').disabled).toBe(true);
    expect(css(el('locked').closest('.dk-field')!.querySelector('.dk-field__label')).opacity).toBe('0.5');
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
    expect(fs.className).toMatch(/dk-field--group/);
    expect(legend.textContent).toBe('Plan');
    expect((fs.getAttribute('aria-describedby') || '').split(' ').map((i) => document.getElementById(i)?.textContent)).toEqual(['Pick one.', 'Choose a plan.']);
    expect(el('r1').id).toBe('r1');
    expect(css(fs).borderTopWidth).toBe('0px');
    expect(fs.querySelector('.dk-field__hint')!.getBoundingClientRect().top).toBeGreaterThanOrEqual(legend.getBoundingClientRect().bottom);
    expect(el('c1').matches(':disabled')).toBe(true);
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

  test('contrast in all six themes: label, hint, error and * at 4.5:1 on surface (the error on surface-muted too)', () => {
    expect(lowContrast([
      ['label', 'var(--text)', 'var(--surface)', 4.5],
      ['hint', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['error', 'var(--danger-text)', 'var(--surface)', 4.5],
      ['error on muted', 'var(--danger-text)', 'var(--surface-muted)', 4.5],
      ['required', 'var(--danger-text)', 'var(--surface)', 4.5],
    ])).toEqual([]);
  });
});
