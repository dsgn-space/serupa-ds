import { useState, type FormEvent } from "react";
import { Button, Checkbox, Input, Link, Stack } from "serupa-ds";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Enter your email address.");
      return;
    }
    setEmailError(undefined);
    // Call your sign-in API here.
    console.log({ email, password, keepSignedIn });
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Sign in">
      <Stack gap="md">
        <Input
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
          invalid={!!emailError}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Checkbox
          label="Keep me signed in"
          checked={keepSignedIn}
          onChange={(e) => setKeepSignedIn(e.target.checked)}
        />

        <Button type="submit">Sign in</Button>

        <Link href="/forgot-password">Forgot password?</Link>
      </Stack>
    </form>
  );
}
