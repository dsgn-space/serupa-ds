import * as React from 'react';
import { Button, Field, Input, PhoneInput, Stack } from 'serupa-ds';

export function ProfileForm({
  onSave,
}: {
  onSave: (p: { name: string; email: string; phone: string }) => void;
}) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, email, phone });
      }}
    >
      <Stack gap="4">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Phone number (optional)">
          <PhoneInput value={phone} onChange={setPhone} autoComplete="tel" />
        </Field>
        <Button type="submit">Save profile</Button>
      </Stack>
    </form>
  );
}
