import { useState, type FormEvent } from "react";
// Assumption: I couldn't inspect serupa-ds in this session, so these component
// names and props (Button, Checkbox, Link, TextField with `error`) are guesses.
// Check them against the package's exports.
import { Button, Checkbox, Link, TextField } from "serupa-ds";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    setEmailError(undefined);
    // TODO: call your sign-in API with { email, password, keepSignedIn }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Sign in">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(undefined);
        }}
        error={emailError}
        invalid={Boolean(emailError)}
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Checkbox
        name="keepSignedIn"
        checked={keepSignedIn}
        onChange={(e) => setKeepSignedIn(e.target.checked)}
      >
        Keep me signed in
      </Checkbox>

      <Button type="submit">Sign in</Button>

      <Link href="/forgot-password">Forgot password?</Link>
    </form>
  );
}
