// NOTE: I couldn't inspect serupa-ds in this session (no file access), so the
// component names and props below are assumed. Check them against the package's exports.
import { useState, type FormEvent } from "react";
import { Button, Checkbox, Link, TextField } from "serupa-ds";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim() === "") {
      setEmailError("Enter your email address.");
      return;
    }
    setEmailError(undefined);
    // TODO: call your sign-in API with { email, password, keepSignedIn }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="signin-title">
      <h1 id="signin-title">Sign in</h1>

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
        invalid={Boolean(emailError)}
        errorMessage={emailError}
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
