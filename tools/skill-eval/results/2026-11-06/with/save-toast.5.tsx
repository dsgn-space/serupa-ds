import { useState, type FormEvent } from 'react';
import { Button, Card, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

const NAME_MAX = 50;
const BIO_MAX = 280;

export function ProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Enter a display name, for example "Dina Putri".');
      document.getElementById('profile-name')?.focus();
      return;
    }
    setNameError(undefined);
    // Persist the profile here (API call), then confirm:
    toast('Profile saved');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap={4}>
          <Heading level={2}>Profile</Heading>

          <Field
            label="Display name"
            hint="Shown on your posts and comments."
            error={nameError}
          >
            <Input
              id="profile-name"
              value={name}
              maxLength={NAME_MAX}
              invalid={!!nameError}
              autoComplete="nickname"
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
            />
          </Field>

          <Field
            label="Bio"
            hint={`A short introduction, up to ${BIO_MAX} characters.`}
          >
            <Textarea
              value={bio}
              rows={4}
              maxLength={BIO_MAX}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>

          <div>
            <Button type="submit">Save profile</Button>
          </div>
        </Stack>
      </form>
    </Card>
  );
}
