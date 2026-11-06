import { useState, type FormEvent } from 'react';
import { Button, Card, Field, Heading, Input, Stack, Textarea, toast, Toaster } from 'serupa-ds';

const NAME_MAX = 50;
const BIO_MAX = 280;

export function ProfileForm() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!displayName.trim()) {
      setNameError('Enter a display name, for example "Ayu Lestari".');
      document.getElementById('profile-display-name')?.focus();
      return;
    }

    setNameError(undefined);
    toast('Profile saved');
  };

  return (
    <>
      <Card className="p-6">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={4}>
            <Heading level={2}>Edit profile</Heading>

            <Field
              label="Display name"
              hint={`Shown on your posts and comments. Up to ${NAME_MAX} characters.`}
              error={nameError}
            >
              <Input
                id="profile-display-name"
                value={displayName}
                maxLength={NAME_MAX}
                invalid={!!nameError}
                autoComplete="nickname"
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
              />
            </Field>

            <Field label="Bio" hint={`A short introduction. Up to ${BIO_MAX} characters.`}>
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
      <Toaster />
    </>
  );
}
