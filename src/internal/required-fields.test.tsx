import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { CascadeSelect } from '../components/CascadeSelect/CascadeSelect';
import { DateField } from '../components/DateField/DateField';
import { Field } from '../components/Field/Field';
import { SignaturePad } from '../components/SignaturePad/SignaturePad';

// The fields with no native control of their own take required like Input, Select and ColorPicker do: a form isn't
// sent while they're empty, they're marked invalid and the first takes focus, and filling them clears it.
const regions = [{ value: 'jabar', label: 'Jawa Barat', children: [{ value: 'bandung', label: 'Kota Bandung' }] }];
const form = () => document.getElementById('rf') as HTMLFormElement;
const send = () => userEvent.click(document.getElementById('rs')!);
const Form = ({ children, onSent }: { children: React.ReactNode; onSent: () => void }) => (
  <form id="rf" onSubmit={(e) => { e.preventDefault(); onSent(); }}>{children}<button id="rs">Send</button></form>
);

describe('required on the fields without a native control', () => {
  test('DateField: empty boxes stop the form, all three are marked and the first takes focus; a date clears it', async () => {
    let sent = 0;
    await render(<Form onSent={() => sent++}><DateField aria-label="Date of birth" order="dmy" name="dob" required /></Form>);
    const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>('.dk-date-field__part input'));
    expect([form().checkValidity(), boxes().map((b) => b.getAttribute('aria-required'))]).toEqual([false, ['true', 'true', 'true']]);
    await send();
    await expect.poll(() => boxes().map((b) => b.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true']);
    expect([sent, document.activeElement === boxes()[0]]).toEqual([0, true]);
    await userEvent.keyboard('12');
    await userEvent.click(boxes()[1]!); await userEvent.keyboard('3');
    await userEvent.click(boxes()[2]!); await userEvent.keyboard('1990');
    expect([form().checkValidity(), boxes().map((b) => b.getAttribute('aria-invalid'))]).toEqual([true, [null, null, null]]);
    await send();
    expect(sent).toBe(1);
  });

  test('DateField: without required, empty boxes send; in a required Field without its own required, too', async () => {
    let sent = 0;
    await render(<Form onSent={() => sent++}><Field label="Date of birth" required><DateField name="dob" /></Field></Form>);
    expect(form().checkValidity()).toBe(true);
    await send();
    expect(sent).toBe(1);
  });

  test('CascadeSelect: no path stops the form, the button is marked and takes focus; a chosen path is valid', async () => {
    let sent = 0;
    const { rerender } = await render(<Form onSent={() => sent++}><CascadeSelect aria-label="Region" options={regions} name="region" required /></Form>);
    const button = () => document.querySelector<HTMLButtonElement>('.dk-cascade-select__button')!;
    expect([form().checkValidity(), button().getAttribute('aria-required')]).toEqual([false, 'true']);
    await send();
    await expect.poll(() => button().getAttribute('aria-invalid')).toBe('true');
    expect([sent, document.activeElement === button()]).toEqual([0, true]);
    await rerender(<Form onSent={() => sent++}><CascadeSelect aria-label="Region" options={regions} name="region" required value={['jabar', 'bandung']} /></Form>);
    expect([form().checkValidity(), button().getAttribute('aria-invalid')]).toEqual([true, null]);
  });

  test('CascadeSelect: readOnly or disabled doesn\'t stop the form', async () => {
    await render(<Form onSent={() => {}}><CascadeSelect aria-label="Region" options={regions} required readOnly /><CascadeSelect aria-label="Area" options={regions} required disabled /></Form>);
    expect(form().checkValidity()).toBe(true);
  });

  test('SignaturePad: no signature stops the form, the pad is marked and its method switch takes focus; a typed name clears it', async () => {
    let sent = 0;
    await render(<Form onSent={() => sent++}><SignaturePad aria-label="Signature" name="sig" required /></Form>);
    const pad = () => document.querySelector<HTMLElement>('[data-component=signature-pad]')!;
    expect(form().checkValidity()).toBe(false);
    await send();
    await expect.poll(() => pad().classList.contains('dk-signature-pad--invalid')).toBe(true);
    expect([sent, document.activeElement === page.getByRole('radio', { name: 'Draw' }).element()]).toEqual([0, true]);
    await userEvent.click(page.getByRole('radio', { name: 'Type' }));
    const name = page.getByRole('textbox', { name: 'Full name' });
    await expect.element(name).toHaveAttribute('aria-required', 'true');
    await userEvent.fill(name, 'Ada Lovelace');
    expect([form().checkValidity(), pad().classList.contains('dk-signature-pad--invalid')]).toEqual([true, false]);
  });
});
