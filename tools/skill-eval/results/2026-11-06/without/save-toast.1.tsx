import { useEffect, useRef, useState, type FormEvent } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so this uses native
// elements and doesn't import any serupa-ds components, to avoid guessing at
// export names. To use the design system, swap <input>, <textarea>, <button>
// and the status <div> for its equivalents. The logic stays the same.

const BIO_MAX = 160;
const TOAST_MS = 3000;

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [nameError, setNameError] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setNameError("Enter a display name.");
      return;
    }
    setNameError("");

    // Persist the profile here (API call, etc.), then confirm.
    setShowSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowSaved(false), TOAST_MS);
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 420 }}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          name="displayName"
          type="text"
          autoComplete="nickname"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            if (nameError) setNameError("");
          }}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "display-name-error" : undefined}
          style={{ display: "block", width: "100%" }}
        />
        {nameError && (
          <p id="display-name-error" role="alert">
            {nameError}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          aria-describedby="bio-count"
          style={{ display: "block", width: "100%" }}
        />
        <small id="bio-count">
          {bio.length}/{BIO_MAX}
        </small>
      </div>

      <button type="submit">Save</button>

      {/* Live region stays mounted so screen readers announce the message. */}
      <div role="status" aria-live="polite" style={{ marginTop: 16, minHeight: 24 }}>
        {showSaved ? "Profile saved." : ""}
      </div>
    </form>
  );
}
