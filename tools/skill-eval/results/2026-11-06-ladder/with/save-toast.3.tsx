import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, Toaster, toast } from 'serupa-ds';

const BIO_MAX = 160;

export interface ProfileFormProps {
  initialName?: string;
  initialBio?: string;
  onSave?: (profile: { displayName: string; bio: string }) => Promise<void> | void;
}

export function ProfileForm({ initialName = '', initialBio = '', onSave }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
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
      await onSave?.({ displayName: displayName.trim(), bio: bio.trim() });
      toast('Profile saved'); // goes away on its own and is announced to screen readers
    } catch {
      toast('Couldn’t save your profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate aria-labelledby="profile-heading">
        <Stack gap={4}>
          <Heading level={2} id="profile-heading">
            Profile
          </Heading>

          <Field label="Display name" hint="Shown on your posts and comments." error={nameError}>
            <Input
              ref={nameRef}
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              invalid={Boolean(nameError)}
              autoComplete="nickname"
              required
            />
          </Field>

          <Field label="Bio" hint={`A short line about you. Up to ${BIO_MAX} characters.`}>
            <Textarea
              name="bio"
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

      {/* Render one Toaster near the app root; it is here so this component works on its own. */}
      <Toaster />
    </>
  );
}
