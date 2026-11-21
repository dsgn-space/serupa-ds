import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as z from 'zod';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Dialog } from '../Dialog/Dialog';
import { Field } from '../Field/Field';
import { FieldList } from '../FieldList/FieldList';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { SaveStatus } from '../SaveStatus/SaveStatus';
import { Select } from '../Select/Select';
import { Form, useForm, useFormValue } from './Form';
import { FormStep, FormSteps } from './FormSteps';

const wait = (ms: number) => new Promise<void>((r) => { setTimeout(r, ms); });

// One schema: the fields' rules, their messages and onSubmit's types.
const SignUp = z.object({
  name: z.string().trim().min(1, 'Enter your full name'),
  email: z.email('Enter an email address like name@example.com'),
  password: z.string().min(12, 'Use 12 characters or more'),
  confirm: z.string().min(1, 'Type the password again'),
  terms: z.literal(true, 'Agree to the terms to create an account'),
}).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' });

function SignUpFields() {
  return <>
    <Field label="Full name"><Input name="name" autoComplete="name" /></Field>
    <Field label="Email" hint="Like name@example.com"><Input name="email" type="email" autoComplete="email" /></Field>
    <Field label="Password" hint="12 characters or more"><PasswordInput name="password" autoComplete="new-password" /></Field>
    <Field label="Confirm password"><PasswordInput name="confirm" autoComplete="new-password" /></Field>
    <Field><Checkbox name="terms">I agree to the terms</Checkbox></Field>
    <div><Button type="submit">Create account</Button></div>
  </>;
}

const meta = {
  title: 'Components/Forms/Form',
  component: Form,
  parameters: { layout: 'padded' },
  args: { 'aria-label': 'Create an account', schema: SignUp, onSubmit: () => wait(1200), style: { maxWidth: 420 }, children: <SignUpFields /> },
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sign-up checked against one Zod schema: each field when it's left, then again as it changes; everything on submit,
 *  with a summary at the top that takes focus. The submit button is loading while onSubmit runs. */
export const Playground: Story = {};

/** The form as it starts: nothing said until people have answered. */
export const Default: Story = {};

/** A submit that failed: a summary at the top, each problem on its field, and the page's title starting "Error:". */
export const SubmitFailed: Story = {
  args: { errors: { name: 'Enter your full name', email: 'Enter an email address like name@example.com', terms: 'Agree to the terms to create an account' } },
};

/** The server turned the values down: its message for the whole form in an alert, and its errors on their fields. */
export const ServerErrors: Story = {
  args: { defaultValues: { name: 'Ani Wijaya', email: 'ani@example.com' }, errors: { email: 'That email already has an account. Sign in instead' }, message: 'Nothing was sent. Check the problems below.' },
};

/** A check after the schema: "Checking…" under the field, then its answer. Any username with "taken" in it is taken. */
export const AsyncCheck: Story = {
  args: {
    schema: z.object({ username: z.string().min(3, 'Use 3 characters or more').regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and _ only') }),
    checks: { username: async (value, { signal }) => { await wait(900); return !signal.aborted && String(value).includes('taken') ? 'That username is taken. Try another' : null; } },
    children: <>
      <Field label="Username" hint="Lowercase letters, numbers and _"><Input name="username" autoComplete="username" spellCheck={false} /></Field>
      <div><Button type="submit">Save</Button></div>
    </>,
  },
};

const Address = z.object({
  country: z.string().min(1, 'Choose a country'),
  province: z.string().optional(),
  postcode: z.string().optional(),
}).refine((v) => v.country !== 'ID' || !!v.province, { path: ['province'], message: 'Choose a province' });
function AddressFields() {
  const country = useFormValue<string>('country');
  return <>
    <Field label="Country"><Select name="country" placeholder="Choose a country" options={[{ value: 'ID', label: 'Indonesia' }, { value: 'SG', label: 'Singapore' }]} /></Field>
    {country === 'ID' ? <Field label="Province"><Select name="province" placeholder="Choose a province" options={['Bali', 'Jawa Barat', 'Jawa Tengah', 'DKI Jakarta']} /></Field> : null}
    {country === 'ID' ? <Field label="Postal code" optional><Input name="postcode" inputMode="numeric" autoComplete="postal-code" /></Field> : null}
    <div><Button type="submit">Save address</Button></div>
  </>;
}
/** A field that depends on another: Province shows once the country is Indonesia (useFormValue). */
export const DependentFields: Story = { args: { schema: Address, defaultValues: { country: 'ID' }, children: <AddressFields /> } };

const People = z.object({
  team: z.string().min(1, 'Name the team'),
  people: z.array(z.object({ email: z.email('Enter an email address like name@example.com') })).min(1),
});
/** "Add another": a FieldList inside the form. Its rows' names (people[1].email) come back as an array, and each row's
 *  message shows on its own field. */
export const RepeatableGroups: Story = {
  args: {
    schema: People,
    defaultValues: { team: 'Design', people: [{ email: 'ani@example.com' }] },
    children: <>
      <Field label="Team name"><Input name="team" /></Field>
      <FieldList label="People to invite" hint="Up to 5" name="people" itemLabel={(i) => 'Person ' + (i + 1)} addLabel="Add another person"
        newItem={() => ({ email: '' })} defaultValue={[{ email: 'ani@example.com' }]} min={1} max={5}>
        {(_row, { name, label }) => <Field label={'Email of ' + label.toLowerCase()}><Input name={name('email')} type="email" autoComplete="off" /></Field>}
      </FieldList>
      <div><Button type="submit">Send invitations</Button></div>
    </>,
  },
};

const Business = z.object({
  business: z.string().min(1, 'Enter the business name'),
  email: z.email('Enter an email address like name@example.com'),
  city: z.string().min(1, 'Enter the city'),
  plan: z.enum(['basic', 'pro'], 'Choose a plan'),
});
/** Steps with a progress bar: Next checks only the step's own fields; the last step submits everything. */
export const MultiStep: Story = {
  args: {
    schema: Business,
    children: <FormSteps submitLabel="Open the account">
      <FormStep title="Business">
        <Field label="Business name"><Input name="business" autoComplete="organization" /></Field>
        <Field label="Work email"><Input name="email" type="email" autoComplete="email" /></Field>
      </FormStep>
      <FormStep title="Address"><Field label="City"><Input name="city" autoComplete="address-level2" /></Field></FormStep>
      <FormStep title="Plan" description="You can change it later">
        <Field label="Plan"><Select name="plan" placeholder="Choose a plan" options={[{ value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' }]} /></Field>
      </FormStep>
    </FormSteps>,
  },
};

function DraftStatus() {
  const form = useForm();
  return <div className="flex items-center gap-3">
    <Button type="submit">Send application</Button>
    <SaveStatus status={form.draftSavedAt ? 'saved' : 'idle'} savedAt={form.draftSavedAt ?? undefined} />
    {form.draftRestored ? <Button type="button" variant="ghost" onClick={form.discardDraft}>Start again</Button> : null}
  </div>;
}
/** Saved as a draft in the browser as people type, and filled back in when they come back. "Start again" forgets it. */
export const Draft: Story = {
  args: {
    draft: 'storybook-application', schema: undefined,
    children: <>
      <Field label="Full name"><Input name="name" autoComplete="name" /></Field>
      <Field label="Why do you want to join?"><Input name="why" /></Field>
      <DraftStatus />
    </>,
  },
};

function EditInDialog() {
  const [open, setOpen] = React.useState(false);
  const [unsaved, setUnsaved] = React.useState(false);
  return <>
    <Button onClick={() => { setOpen(true); }}>Edit profile</Button>
    <Dialog open={open} onOpenChange={setOpen} title="Edit profile" unsaved={unsaved}>
      <Form aria-label="Profile" defaultValues={{ name: 'Ani Wijaya' }} onSubmit={() => { setOpen(false); }} onDirtyChange={setUnsaved} warnUnsaved>
        <Field label="Display name"><Input name="name" autoComplete="nickname" /></Field>
        <div><Button type="submit">Save</Button></div>
      </Form>
    </Dialog>
  </>;
}
/** Unsaved changes: warnUnsaved asks before the page is closed or reloaded while there are changes, and the Dialog
 *  takes onDirtyChange as its unsaved prop, so closing it asks "Discard changes?" first. */
export const UnsavedChanges: Story = { render: () => <EditInDialog /> };

// The stress story (G14): long words in the labels, the messages and the summary.
export const LongText: Story = {
  args: {
    schema: undefined,
    errors: { name: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung needs a value long enough to wrap twice in a narrow column' },
    children: <>
      <Field label="Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherungsnummer"><Input name="name" /></Field>
      <div><Button type="submit">Save</Button></div>
    </>,
  },
};
