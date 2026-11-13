import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { ErrorSummary } from './ErrorSummary';
import { Field, FormErrors } from '../Field/Field';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

const ERRORS = [
  { field: 'es-name', message: 'Enter your full name' },
  { field: 'es-email', message: 'Enter an email address in the right format, like name@example.com' },
  { field: 'es-date', message: 'Start date must be today or in the future' },
];

const meta = {
  title: 'Components/Forms/ErrorSummary',
  component: ErrorSummary,
  args: { errors: ERRORS, autoFocus: false },
} satisfies Meta<typeof ErrorSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
export const OneError: Story = { args: { errors: [ERRORS[1]!] } };
export const WithDescription: Story = { args: { title: 'Check your booking', description: 'Fix these before you send the form again.' } };
// In a form: each link moves focus to its field and shows the field's label.
export const InAForm: Story = {
  render: (args) => (
    <form noValidate style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <ErrorSummary {...args} />
      <Field label="Full name" error="Enter your full name"><Input id="es-name" /></Field>
      <Field label="Email" error="Enter an email address in the right format, like name@example.com"><Input id="es-email" type="email" defaultValue="name@" /></Field>
      <Field label="Start date" error="Start date must be today or in the future"><Input id="es-date" type="date" /></Field>
    </form>
  ),
};
// Errors from the server by field name: the summary and each Field read them from FormErrors. Typing in a field takes its
// message away; sending again brings back the ones still wrong.
export const FromTheServer: Story = {
  args: { errors: undefined },
  render: function Render(args) {
    const [errors, setErrors] = React.useState<Record<string, string> | null>({ email: 'That email is already registered', username: 'Choose a username with no spaces' });
    return (
      <form noValidate style={{ display: 'grid', gap: 16, maxWidth: 480 }} onSubmit={(e) => { e.preventDefault(); setErrors({ email: 'That email is already registered', username: 'Choose a username with no spaces' }); }}>
        <FormErrors errors={errors}>
          <ErrorSummary {...args} />
          <Field label="Email"><Input id="es-srv-email" name="email" type="email" defaultValue="sam@example.com" /></Field>
          <Field label="Username"><Input id="es-srv-username" name="username" defaultValue="sam lee" /></Field>
        </FormErrors>
        <div><Button type="submit">Create account</Button></div>
      </form>
    );
  },
};
// The stress story (G14): long words, long messages and many errors; the visual baselines show how it wraps.
export const LongText: Story = {
  args: {
    title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung needs a few more answers',
    errors: Array.from({ length: 8 }, (_, k) => ({ field: 'long-' + k, message: k % 2 ? 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherungsnummer is missing' : 'Enter a description long enough to wrap onto a second line in a narrow column, so the list shows how it wraps' })),
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: each error says what's wrong and how to fix it. */
export const DoSayHowToFix: Story = { name: 'Do: say how to fix it' };
/** Don't: "Invalid", which says something is wrong but not what to do. */
export const DontJustInvalid: Story = {
  name: "Don't: just say invalid",
  args: { errors: [{ field: 'es-name', message: 'Invalid' }, { field: 'es-email', message: 'Invalid' }, { field: 'es-date', message: 'Error' }] },
};
