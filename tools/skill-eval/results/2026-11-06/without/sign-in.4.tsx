import { useState, useId, type FormEvent } from "react";

// NOTE: I couldn't inspect serupa-ds in this environment (no file access), so I
// haven't guessed its component names or props. This uses native, accessible
// elements. Swap them for the matching serupa-ds components (TextField, Checkbox,
// Button, Link) once you've confirmed their props.

export function SignInForm({
  onSubmit,
}: {
  onSubmit?: (values: { email: string; password: string; keepSignedIn: boolean }) => void;
}) {
  const id = useId();
  const emailId = `${id}-email`;
  const emailErrorId = `${id}-email-error`;
  const passwordId = `${id}-password`;
  const keepId = `${id}-keep`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim() === "") {
      setEmailError("Enter your email address.");
      return;
    }
    setEmailError(null);
    onSubmit?.({ email: email.trim(), password, keepSignedIn });
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-title`}>
      <h1 id={`${id}-title`}>Sign in</h1>

      <div>
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? emailErrorId : undefined}
        />
        {emailError && (
          <p id={emailErrorId} role="alert">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <input
          id={keepId}
          type="checkbox"
          name="keepSignedIn"
          checked={keepSignedIn}
          onChange={(e) => setKeepSignedIn(e.target.checked)}
        />
        <label htmlFor={keepId}>Keep me signed in</label>
      </div>

      <button type="submit">Sign in</button>

      <p>
        <a href="/forgot-password">Forgot password?</a>
      </p>
    </form>
  );
}

export default SignInForm;
