import * as React from 'react';
import { Button, Field, Input, Stack, Text } from 'serupa-ds';

export function ProfileForm({ onSave }: { onSave: (name: string, email: string) => Promise<void> }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Invalid input'); return; }
    await onSave(name, email);
  }

  return (
    <form onSubmit={save}>
      <Stack gap={4}>
        <Field label="Display Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ outline: 'none' }} />
        <Text className="text-blue-600">We only use your email to sign you in.</Text>
        <Button type="submit">Submit</Button>
        {error && <Text className="text-danger-text">{error}</Text>}
      </Stack>
    </form>
  );
}
