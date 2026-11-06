import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, Toaster, toast } from 'serupa-ds';

const BIO_MAX = 160;

export function ProfileForm() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!displayName.trim()) {
      setNameError('Enter a display name, for example "Sam Rivera".');
      nameRef.current?.focus(); // move focus to the first error
      return;
    }
    setNameError(undefined);

    setSaving(true);
    try {
      // Replace with your real save call.
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast('Profile saved'); // goes away on its own and is announced to screen readers
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>Profile</Heading>

        <Field
          label="Display name"
          hint="This is the name other people see."
          error={nameError}
        >
          <Input
            ref={nameRef}
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
            invalid={Boolean(nameError)}
            autoComplete="nickname"
            maxLength={50}
          />
        </Field>

        <Field label="Bio" hint={`A short introduction, up to ${BIO_MAX} characters.`}>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={BIO_MAX}
          />
        </Field>

        <div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </Stack>

      {/* Render one Toaster near the app root; remove this one if the app already has it. */}
      <Toaster />
    </form>
  );
}
