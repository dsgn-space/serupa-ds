import { useEffect, useRef, useState, type FormEvent } from "react";

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Persist the profile here (API call, etc.)
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="nickname"
          required
        />
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <button type="submit">Save</button>

      {/* Live region stays mounted so screen readers announce the message */}
      <div role="status" aria-live="polite">
        {saved ? "Profile saved." : ""}
      </div>
    </form>
  );
}
