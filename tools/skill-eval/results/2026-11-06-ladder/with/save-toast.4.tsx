import { useState, type FormEvent } from 'react';
import { Button, Card, Field, Heading, Input, Stack, Textarea, toast, Toaster } from 'serupa-ds';

const BIO_MAX = 160;

export function ProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Enter a display name, for example "Sam Rivera".');
      return;
    }
    setNameError('');
    // Save the profile here (API call), then confirm:
    toast('Profile saved');
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap={4}>
          <Heading level={2}>Profile</Heading>

          <Field
            label="Display name"
            hint="Shown on your posts and comments."
            error={nameError || undefined}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={Boolean(nameError)}
              autoComplete="nickname"
            />
          </Field>

          <Field label="Bio" hint={`Up to ${BIO_MAX} characters.`}>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={BIO_MAX}
              rows={4}
            />
          </Field>

          <div>
            <Button type="submit">Save profile</Button>
          </div>
        </Stack>
      </form>
      <Toaster />
    </Card>
  );
}
