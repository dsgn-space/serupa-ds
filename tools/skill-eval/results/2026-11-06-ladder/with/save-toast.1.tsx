import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Container,
  Field,
  Heading,
  Input,
  SkipLink,
  Stack,
  Textarea,
  Toaster,
  toast,
} from 'serupa-ds';

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
      nameRef.current?.focus();
      return;
    }

    setNameError(undefined);
    setSaving(true);
    try {
      // Replace with your real save call.
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast('Profile saved');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SkipLink href="#main">Skip to content</SkipLink>
      <Container as="main" id="main">
        <Stack gap={6} className="py-8">
          <Heading level={1}>Edit profile</Heading>

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap={4}>
              <Field
                label="Display name"
                hint="This is how other people see you."
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
                  required
                />
              </Field>

              <Field
                label="Bio"
                hint={`Optional. ${bio.length} of ${BIO_MAX} characters used.`}
              >
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX}
                  rows={4}
                />
              </Field>

              <div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </div>
            </Stack>
          </form>
        </Stack>
      </Container>
      <Toaster />
    </>
  );
}
