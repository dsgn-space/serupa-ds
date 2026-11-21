import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import * as z from 'zod';
import * as v from 'valibot';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Field } from '../Field/Field';
import { FieldList } from '../FieldList/FieldList';
import { Input } from '../Input/Input';
import { NumberInput } from '../NumberInput/NumberInput';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { Select } from '../Select/Select';
import { Form, useForm, useFormValue, type FormHandle } from './Form';
import { FormStep, FormSteps } from './FormSteps';

const el = (id: string) => document.getElementById(id) as HTMLInputElement;
const active = () => document.activeElement as HTMLElement;
// The message the control is described by as its error (aria-errormessage), as a screen reader finds it.
const errorOf = (id: string) => { const m = el(id).getAttribute('aria-errormessage'); return (m && document.getElementById(m)?.textContent) || null; };
const summary = () => document.querySelector<HTMLElement>('[data-component="error-summary"]');
const links = () => Array.from(document.querySelectorAll('[data-component="error-summary"] a'), (a) => [a.getAttribute('href'), a.textContent]);
const tick = () => new Promise((r) => { setTimeout(r, 0); });

const SignUp = z.object({
  name: z.string().min(1, 'Enter your full name'),
  email: z.email('Enter an email address like name@example.com'),
  age: z.string().min(1, 'Enter your age').transform(Number).pipe(z.number().int().min(18, 'You must be 18 or over')),
  terms: z.literal(true, 'Agree to the terms to go on'),
});

function SignUpForm(props: Partial<React.ComponentProps<typeof Form<typeof SignUp>>>) {
  return (
    <SerupaProvider locale="en">
      <Form id="f" schema={SignUp} {...props}>
        <Field label="Full name"><Input id="name" name="name" /></Field>
        <Field label="Email"><Input id="email" name="email" type="email" /></Field>
        <Field label="Age"><Input id="age" name="age" inputMode="numeric" /></Field>
        <Field><Checkbox id="terms" name="terms">I agree to the terms</Checkbox></Field>
        <Button id="send" type="submit">Create account</Button>
      </Form>
    </SerupaProvider>
  );
}
const fillAll = async () => {
  await userEvent.type(el('name'), 'Ani Wijaya');
  await userEvent.type(el('email'), 'ani@example.com');
  await userEvent.type(el('age'), '30');
  await userEvent.click(el('terms'));
};

afterEach(() => { document.title = ''; window.localStorage.clear(); });

describe('Form', () => {
  test('a <form> that leaves checking to the schema; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLFormElement>();
    await render(<Form id="x" ref={ref} className="extra" data-x="y" aria-label="Profile">Hello</Form>);
    const e = el('x') as unknown as HTMLFormElement;
    expect([e.tagName, e.noValidate, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.getAttribute('aria-label')]).toEqual(['FORM', true, true, 'srp-form extra', 'y', 'form', 'Profile']);
  });

  test('a field is checked when it is left, not while it is typed in; then again as it changes, until it is right', async () => {
    await render(<SignUpForm />);
    await userEvent.type(el('email'), 'ani@');
    await tick();
    expect(errorOf('email')).toBe(null);
    await userEvent.tab();
    await expect.poll(() => errorOf('email')).toBe('Enter an email address like name@example.com');
    expect(el('email').getAttribute('aria-invalid')).toBe('true');
    expect(errorOf('name')).toBe(null);   // fields not yet visited say nothing
    await userEvent.click(el('email'));
    await userEvent.type(el('email'), 'example.com');
    await expect.poll(() => errorOf('email')).toBe(null);
    expect(el('email').getAttribute('aria-invalid')).toBe(null);
  });

  test('submit: every problem on its field and in a summary at the top, in the fields’ order, which takes focus; the title says Error', async () => {
    const onSubmit = vi.fn();
    document.title = 'Sign up';
    await render(<SignUpForm onSubmit={onSubmit} />);
    await userEvent.type(el('age'), '12');
    await userEvent.click(el('send'));
    await expect.poll(() => links()).toEqual([
      ['#name', 'Enter your full name'], ['#email', 'Enter an email address like name@example.com'],
      ['#age', 'You must be 18 or over'], ['#terms', 'Agree to the terms to go on'],
    ]);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(active()).toBe(summary());
    expect(summary()!.querySelector('h2')!.textContent).toBe('There are 4 problems');
    expect(document.title).toBe('Error: Sign up');
    expect([errorOf('name'), errorOf('terms')]).toEqual(['Enter your full name', 'Agree to the terms to go on']);
    // A link moves focus to its field; fixing a field takes it off the list as it's typed.
    await userEvent.click(summary()!.querySelector('a')!);
    expect(active()).toBe(el('name'));
    await userEvent.type(el('name'), 'Ani');
    await expect.poll(() => links().length).toBe(3);
    expect(active()).toBe(el('name'));   // the summary doesn't take focus back while people fix things
  });

  test('a submit that passes gets the schema’s output, typed; the submit button is loading until onSubmit settles; the title goes back', async () => {
    let finish = () => {};
    const onSubmit = vi.fn((_values: z.output<typeof SignUp>) => new Promise<void>((r) => { finish = r; }));
    document.title = 'Sign up';
    await render(<SignUpForm onSubmit={onSubmit} />);
    await userEvent.click(el('send'));
    await expect.poll(() => document.title).toBe('Error: Sign up');
    await fillAll();
    await userEvent.click(el('send'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ani Wijaya', email: 'ani@example.com', age: 30, terms: true });
    expect(summary()).toBe(null);
    expect(document.title).toBe('Sign up');
    await expect.poll(() => el('send').getAttribute('aria-busy') === 'true' || el('send').className.includes('loading')).toBe(true);
    (el('f') as unknown as HTMLFormElement).requestSubmit();   // a second submit sends nothing twice
    await tick();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    finish();
    await expect.poll(() => (el('f') as unknown as HTMLFormElement).getAttribute('aria-busy')).toBe(null);
  });

  test('the server’s errors go on their fields and in the summary; a message for the whole form shows in an alert; editing a field takes its error away', async () => {
    const onSubmit = vi.fn(async () => ({ errors: { email: 'That email already has an account' }, message: 'Nothing was sent' }));
    await render(<SignUpForm onSubmit={onSubmit} />);
    await fillAll();
    await userEvent.click(el('send'));
    await expect.poll(() => errorOf('email')).toBe('That email already has an account');
    expect(links()).toEqual([['#email', 'That email already has an account']]);
    expect(document.querySelector('[role="alert"]')!.textContent).toContain('Nothing was sent');
    await userEvent.type(el('email'), 'x');
    await expect.poll(() => errorOf('email')).toBe(null);
  });

  test('errors from a form action, by name, with FieldList’s bracketed names', async () => {
    function Page() {
      const [errors, setErrors] = React.useState<Record<string, string> | null>(null);
      return <Form errors={errors}>
        <Field label="City"><Input id="c0" name="addresses[0].city" /></Field>
        <button id="go" type="button" onClick={() => { setErrors({ 'addresses.0.city': 'We don’t deliver there yet' }); }}>Answer</button>
      </Form>;
    }
    await render(<Page />);
    await userEvent.click(el('go'));
    await expect.poll(() => errorOf('c0')).toBe('We don’t deliver there yet');
    expect(active()).toBe(summary());
  });

  test('errors and a message it starts with show from the first render', async () => {
    await render(<Form errors={{ name: 'Enter a name' }} message="Nothing was sent"><Field label="Name"><Input id="n" name="name" /></Field></Form>);
    expect(errorOf('n')).toBe('Enter a name');
    expect(links()).toEqual([['#n', 'Enter a name']]);
    expect(document.querySelector('[role="alert"]')!.textContent).toContain('Nothing was sent');
  });

  test('checks: "Checking…" while one runs, its message once it answers, and a newer value cancels the older check', async () => {
    const seen: string[] = [];
    const checks = { username: (value: unknown, { signal }: { signal: AbortSignal }) => new Promise<string | null>((r) => {
      seen.push(String(value));
      setTimeout(() => { if (!signal.aborted) r(value === 'ani' ? 'That username is taken' : null); }, 50);
    }) };
    await render(<SerupaProvider locale="en"><Form schema={z.object({ username: z.string().min(3, 'Use 3 letters or more') })} checks={checks}>
      <Field label="Username"><Input id="u" name="username" /></Field>
      <Field label="Bio"><Input id="b" name="bio" /></Field>
    </Form></SerupaProvider>);
    await userEvent.type(el('u'), 'an');
    await userEvent.tab();
    await expect.poll(() => errorOf('u')).toBe('Use 3 letters or more');
    expect(seen).toEqual([]);   // no check until the schema passes
    await userEvent.click(el('u'));
    await userEvent.type(el('u'), 'i');
    await expect.poll(() => el('u').closest('[data-component="field"]')!.textContent).toContain('Checking…');
    await expect.poll(() => errorOf('u')).toBe('That username is taken');
    await userEvent.type(el('u'), 'ta');
    await expect.poll(() => errorOf('u')).toBe(null);
    await expect.poll(() => seen).toContain('anita');
    expect(seen).not.toContain('anit');   // typing waits for a pause before checking
  });

  test('defaultValues fill the fields; values come back nested, FieldList rows as an array; a row added later starts empty', async () => {
    const onSubmit = vi.fn();
    await render(<SerupaProvider locale="en"><Form onSubmit={onSubmit} defaultValues={{ name: 'Ani', news: true, plan: 'pro', addresses: [{ city: 'Bandung' }] }}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <Field><Checkbox id="news" name="news">Send me news</Checkbox></Field>
      <Field label="Plan"><Select id="plan" name="plan"><option value="free">Free</option><option value="pro">Pro</option></Select></Field>
      <FieldList label="Addresses" name="addresses" itemLabel={(i) => 'Address ' + (i + 1)} addLabel="Add another address" newItem={() => ({ city: '' })} defaultValue={[{ city: 'Bandung' }]}>
        {(_row, { name, index }) => <Field label="City"><Input id={'city' + index} name={name('city')} /></Field>}
      </FieldList>
      <Button id="send" type="submit">Save</Button>
    </Form></SerupaProvider>);
    expect([el('n').value, el('news').checked, el('plan').value, el('city0').value]).toEqual(['Ani', true, 'pro', 'Bandung']);
    await userEvent.click(Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Add another address')!);
    expect(el('city1').value).toBe('');
    await userEvent.type(el('city1'), 'Jakarta');
    await userEvent.click(el('send'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ani', news: true, plan: 'pro', addresses: [{ city: 'Bandung' }, { city: 'Jakarta' }] });
  });

  test('a control named after an object’s machinery sets nothing on any object', async () => {
    const onSubmit = vi.fn();
    await render(<Form onSubmit={onSubmit} defaultValues={{ ['__proto__']: { hacked: 'yes' } }}>
      <input name="__proto__.polluted" defaultValue="yes" aria-label="x" />
      <input name="constructor.prototype.polluted" defaultValue="yes" aria-label="y" />
      <input name="a.b" defaultValue="ok" aria-label="z" />
      <button id="send" type="submit">Send</button>
    </Form>);
    await userEvent.click(el('send'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ a: { b: 'ok' } });
    expect(({} as Record<string, unknown>).polluted).toBe(undefined);
    expect(({} as Record<string, unknown>).hacked).toBe(undefined);
  });

  test('useFormValue: a field that depends on another shows as that one changes; a hidden input a component sets counts too', async () => {
    function Region() {
      const country = useFormValue<string>('country');
      return country === 'ID' ? <Field label="Province"><Input id="prov" name="province" /></Field> : null;
    }
    function Seen() { return <output id="qty">{String(useFormValue('qty'))}</output>; }
    await render(<SerupaProvider locale="en"><Form>
      <Field label="Country"><Select id="country" name="country"><option value="">Choose</option><option value="ID">Indonesia</option></Select></Field>
      <Region />
      <Field label="Quantity"><NumberInput id="qty-in" name="qty" defaultValue={1} /></Field>
      <Seen />
    </Form></SerupaProvider>);
    expect(el('prov')).toBe(null);
    await userEvent.selectOptions(el('country'), 'ID');
    await expect.poll(() => el('prov')).not.toBe(null);
    await userEvent.click(el('qty-in'));
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(() => el('qty').textContent).toBe('2');
  });

  test('draft: the answers are kept in the browser as people type (never a password), come back with the form, and go once it is sent', async () => {
    const onSubmit = vi.fn();
    const Page = () => <SerupaProvider locale="en"><Form draft="signup" onSubmit={onSubmit}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <Field label="Password"><PasswordInput id="p" name="password" /></Field>
      <Button id="send" type="submit">Send</Button>
    </Form></SerupaProvider>;
    const first = await render(<Page />);
    await userEvent.type(el('n'), 'Ani');
    await userEvent.type(el('p'), 'secret');
    await expect.poll(() => window.localStorage.getItem('serupa-form-draft:signup')).toContain('Ani');
    expect(window.localStorage.getItem('serupa-form-draft:signup')).not.toContain('secret');
    await first.unmount();
    await render(<Page />);
    await expect.poll(() => el('n').value).toBe('Ani');
    expect(el('p').value).toBe('');
    await userEvent.click(el('send'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(window.localStorage.getItem('serupa-form-draft:signup')).toBe(null);
  });

  test('warnUnsaved: leaving the page asks first while there are changes, and not once they are sent', async () => {
    await render(<Form warnUnsaved onSubmit={() => {}}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <button id="send" type="submit">Send</button>
    </Form>);
    const leave = () => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; };
    await tick();
    expect(leave()).toBe(false);
    await userEvent.type(el('n'), 'Ani');
    await expect.poll(leave).toBe(true);
    await userEvent.click(el('send'));
    await expect.poll(leave).toBe(false);
  });

  test('onUnsavedChanges: told when the form gets changes and when it has none again', async () => {
    const onUnsavedChanges = vi.fn();
    await render(<Form onUnsavedChanges={onUnsavedChanges} defaultValues={{ name: 'Ani' }}><Field label="Name"><Input id="n" name="name" /></Field></Form>);
    await userEvent.type(el('n'), 'ta');
    await expect.poll(() => onUnsavedChanges.mock.calls).toEqual([[true]]);
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect.poll(() => onUnsavedChanges.mock.calls).toEqual([[true], [false]]);
  });

  test('onEdit: given the values, nested by name, as a field changes', async () => {
    const onEdit = vi.fn();
    await render(<Form onEdit={onEdit}><Field label="City"><Input id="c" name="address.city" /></Field></Form>);
    await userEvent.type(el('c'), 'Ubud');
    await expect.poll(() => onEdit.mock.lastCall).toEqual([{ address: { city: 'Ubud' } }]);
  });

  test('useForm: dirty, validate and setErrors from inside the form', async () => {
    let api: FormHandle | null = null;
    function Spy() { api = useForm(); return <output id="dirty">{String(api.dirty)}</output>; }
    await render(<SerupaProvider locale="en"><Form schema={z.object({ name: z.string().min(1, 'Enter a name') })}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <Spy />
    </Form></SerupaProvider>);
    await tick();
    expect(el('dirty').textContent).toBe('false');
    let ok = true;
    await React.act(async () => { ok = await api!.validate(['name']); });
    expect(ok).toBe(false);
    await expect.poll(() => errorOf('n')).toBe('Enter a name');
    await userEvent.type(el('n'), 'A');
    await expect.poll(() => el('dirty').textContent).toBe('true');
    await React.act(async () => { api!.setErrors({ name: 'Taken' }); });
    await expect.poll(() => errorOf('n')).toBe('Taken');
  });

  test('without a schema, the controls’ own constraints are checked; summary={false} moves focus to the first field with a problem', async () => {
    await render(<SerupaProvider locale="en"><Form summary={false}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <Field label="Email" required><Input id="e" name="email" type="email" required /></Field>
      <button id="send" type="submit">Send</button>
    </Form></SerupaProvider>);
    await userEvent.click(el('send'));
    await expect.poll(() => active()).toBe(el('e'));
    expect(summary()).toBe(null);
    expect(errorOf('e')).toBeTruthy();
  });

  test('a Valibot schema works the same way', async () => {
    const onSubmit = vi.fn((_values: { name: string }) => {});
    await render(<SerupaProvider locale="en"><Form schema={v.object({ name: v.pipe(v.string(), v.minLength(1, 'Enter a name')) })} onSubmit={onSubmit}>
      <Field label="Name"><Input id="n" name="name" /></Field>
      <button id="send" type="submit">Send</button>
    </Form></SerupaProvider>);
    await userEvent.click(el('send'));
    await expect.poll(() => errorOf('n')).toBe('Enter a name');
    await userEvent.type(el('n'), 'Ani');
    await userEvent.click(el('send'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ani' });
  });

  test('Indonesian from the provider: the page title', async () => {
    document.title = 'Daftar';
    await render(<SerupaProvider locale="id" labels={idLabels}><Form schema={z.object({ name: z.string().min(1, 'Isi nama') })}>
      <Field label="Nama"><Input id="n" name="name" /></Field>
      <button id="send" type="submit">Kirim</button>
    </Form></SerupaProvider>);
    await userEvent.click(el('send'));
    await expect.poll(() => document.title).toBe('Kesalahan: Daftar');
  });
});

describe('FormSteps', () => {
  const Steps = z.object({
    email: z.email('Enter your email'),
    city: z.string().min(1, 'Enter your city'),
    plan: z.enum(['free', 'pro'], 'Choose a plan'),
  });
  function Wizard({ onSubmit = () => {} }: { onSubmit?: (v: z.output<typeof Steps>) => void }) {
    return <SerupaProvider locale="en"><Form schema={Steps} onSubmit={onSubmit}>
      <FormSteps submitLabel="Create account">
        <FormStep title="Account"><Field label="Email"><Input id="email" name="email" /></Field></FormStep>
        <FormStep title="Address"><Field label="City"><Input id="city" name="city" /></Field></FormStep>
        <FormStep title="Plan"><Field label="Plan"><Select id="plan" name="plan"><option value="">Choose</option><option value="free">Free</option><option value="pro">Pro</option></Select></Field></FormStep>
      </FormSteps>
    </Form></SerupaProvider>;
  }
  const button = (name: string) => Array.from(document.querySelectorAll('button')).find((b) => b.textContent === name) as HTMLButtonElement;
  const panels = () => Array.from(document.querySelectorAll('[data-component="form-steps"] > section'), (p) => p.getAttribute('hidden'));

  test('a progress bar and the current step’s section; Next checks only that step, then moves on and focuses its heading; Back goes back', async () => {
    await render(<Wizard />);
    expect(panels()).toEqual([null, 'until-found', 'until-found']);
    expect(document.querySelector('[data-component="stepper"]')).not.toBe(null);
    await userEvent.click(button('Next'));
    await expect.poll(() => errorOf('email')).toBe('Enter your email');
    expect(links()).toEqual([['#email', 'Enter your email']]);   // nothing about the steps to come
    await userEvent.type(el('email'), 'ani@example.com');
    await userEvent.click(button('Next'));
    await expect.poll(() => panels()).toEqual(['until-found', null, 'until-found']);
    expect(active().textContent).toBe('Address');
    expect(active().tagName).toBe('H2');
    expect(button('Create account')).toBe(undefined);
    await userEvent.click(button('Back'));
    await expect.poll(() => panels()).toEqual([null, 'until-found', 'until-found']);
    expect(el('email').value).toBe('ani@example.com');   // kept
    // Enter in a text field goes on, as it submits a one-page form.
    await userEvent.click(el('email'));
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => panels()).toEqual(['until-found', null, 'until-found']);
  });

  test('the last step submits everything; a problem on an earlier step links back to it', async () => {
    const onSubmit = vi.fn();
    await render(<Wizard onSubmit={onSubmit} />);
    await userEvent.type(el('email'), 'ani@example.com');
    await userEvent.click(button('Next'));
    await expect.poll(() => panels()[1]).toBe(null);
    // People clear the email on the way back… then submit from the last step.
    await userEvent.click(button('Back'));
    await userEvent.clear(el('email'));
    await userEvent.click(button('Next'));
    await expect.poll(() => errorOf('email')).toBe('Enter your email');
    await userEvent.type(el('email'), 'ani@example.com');
    await userEvent.click(button('Next'));
    await userEvent.type(el('city'), 'Bandung');
    await userEvent.click(button('Next'));
    await expect.poll(() => panels()[2]).toBe(null);
    await userEvent.selectOptions(el('plan'), 'pro');
    await userEvent.click(button('Create account'));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ email: 'ani@example.com', city: 'Bandung', plan: 'pro' });
  });

  test('a summary link to a field on another step opens that step and focuses the field', async () => {
    await render(<SerupaProvider locale="en"><Form schema={Steps}>
      <FormSteps submitLabel="Create account" defaultStep={2}>
        <FormStep title="Account"><Field label="Email"><Input id="email" name="email" /></Field></FormStep>
        <FormStep title="Address"><Field label="City"><Input id="city" name="city" defaultValue="Bandung" /></Field></FormStep>
        <FormStep title="Plan"><Field label="Plan"><Select id="plan" name="plan" defaultValue="pro"><option value="free">Free</option><option value="pro">Pro</option></Select></Field></FormStep>
      </FormSteps>
    </Form></SerupaProvider>);
    await userEvent.click(button('Create account'));
    await expect.poll(() => links()).toEqual([['#email', 'Enter your email']]);
    await userEvent.click(summary()!.querySelector('a')!);
    await expect.poll(() => panels()).toEqual([null, 'until-found', 'until-found']);
    await expect.poll(() => active()).toBe(el('email'));
  });
});
