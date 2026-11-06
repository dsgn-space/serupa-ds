import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, Toaster, toast } from 'serupa-ds';

const BIO_MAX = 160;

export function ProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Enter a display name, for example "Sam Rivera".');
      nameRef.current?.focus(); // move focus to the first error
      return;
    }

    setNameError(undefined);
    // ...save the profile here (API call)...
    toast('Profile saved'); // goes away on its own, announced to screen readers
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>Profile</Heading>

        <Field label="Display name" hint="Shown next to your comments." error={nameError}>
          <Input
            ref={nameRef}
            value={name}
            invalid={!!nameError}
            autoComplete="nickname"
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
          />
        </Field>

        <Field label="Bio" hint={`Optional. ${bio.length} of ${BIO_MAX} characters.`}>
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

      {/* One Toaster per app; drop this if your app root already renders one. */}
      <Toaster />
    </form>
  );
}
