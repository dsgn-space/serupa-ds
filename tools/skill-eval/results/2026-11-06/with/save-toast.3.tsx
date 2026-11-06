import { useState, type FormEvent } from 'react';
import { Button, Container, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

const BIO_MAX = 160;

export function ProfileForm() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!displayName.trim()) {
      setNameError('Enter a display name, for example "Sam Rivera".');
      return;
    }

    setNameError(undefined);
    // Save the profile here (API call), then confirm:
    toast('Profile saved');
  };

  return (
    <Container as="div">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap={4}>
          <Heading level={2}>Profile</Heading>

          <Field
            label="Display name"
            hint="Shown to other people on your posts and comments."
            error={nameError}
          >
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              invalid={Boolean(nameError)}
              autoComplete="nickname"
              required
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
    </Container>
  );
}
