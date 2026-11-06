import { useEffect, useState, type FormEvent } from "react";

const BIO_MAX = 280;
const TOAST_MS = 3000;

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [saved]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Persist the profile here (API call, etc.), then confirm.
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          name="displayName"
          type="text"
          autoComplete="nickname"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={BIO_MAX}
          aria-describedby="bio-count"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <small id="bio-count">
          {bio.length}/{BIO_MAX}
        </small>
      </div>

      <button type="submit">Save</button>

      {/* Live region stays mounted so screen readers announce the message. */}
      <div role="status" aria-live="polite">
        {saved && <p>Profile saved.</p>}
      </div>
    </form>
  );
}
