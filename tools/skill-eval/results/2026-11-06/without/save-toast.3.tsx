import { useEffect, useRef, useState, type FormEvent } from "react";

// NOTE: I couldn't inspect serupa-ds from this session, so I haven't guessed
// at its component names or props. This uses native elements. To adopt the
// design system, swap the <input>, <textarea>, <button> and status <div> for
// its Input, Textarea, Button and Toast/Alert equivalents.

const NOTICE_MS = 3000;
const BIO_MAX = 280;

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Persist the profile here (API call, etc.), then confirm.
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), NOTICE_MS);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <label style={{ display: "grid", gap: 4 }}>
        Display name
        <input
          type="text"
          name="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          required
          autoComplete="nickname"
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        Bio
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={BIO_MAX}
          rows={4}
        />
        <small>
          {bio.length}/{BIO_MAX}
        </small>
      </label>

      <div>
        <button type="submit">Save profile</button>
      </div>

      {/* Live region stays mounted so screen readers announce the message. */}
      <div role="status" aria-live="polite" style={{ minHeight: "1.5em" }}>
        {saved ? "Profile saved." : ""}
      </div>
    </form>
  );
}
