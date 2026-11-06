import { useState, type FormEvent } from 'react';
import { Button, Card, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

const NAME_MAX = 50;
const BIO_MAX = 280;

export function ProfileForm() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (displayName.trim() === '') {
      setNameError('Enter a display name, for example "Sam Rivera".');
      return;
    }

    setNameError(undefined);
    // Save the profile here (API call), then confirm:
    toast('Profile saved');
  }

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
              value={displayName}
              maxLength={NAME_MAX}
              autoComplete="nickname"
              invalid={Boolean(nameError)}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
            />
          </Field>

          <Field label="Bio" hint={`Up to ${BIO_MAX} characters.`}>
            <Textarea
              value={bio}
              maxLength={BIO_MAX}
              rows={4}
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
