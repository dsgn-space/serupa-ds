import { useEffect, useRef, useState, type FormEvent } from "react";
// Assumes serupa-ds exports these components; adjust names if your version differs.
import { Button, Input, Textarea, Alert } from "serupa-ds";

const TOAST_MS = 3000;

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Persist { displayName, bio } here (API call, etc.)
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), TOAST_MS);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 480 }}>
      <label style={{ display: "grid", gap: 4 }}>
        Display name
        <Input
          name="displayName"
          value={displayName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
          required
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        Bio
        <Textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
        />
      </label>

      <Button type="submit">Save</Button>

      <div role="status" aria-live="polite">
        {saved && <Alert variant="success">Profile saved.</Alert>}
      </div>
    </form>
  );
}
