import { useRef, useState, type FormEvent } from 'react';
import { Button, Checkbox, Field, Heading, Input, Link, PasswordInput, Stack, announce } from 'serupa-ds';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim() === '') {
      const message = 'Enter your email address, for example name@example.com.';
      setEmailError(message);
      announce(message);
      emailRef.current?.focus(); // move focus to the first error
      return;
    }

    setEmailError(undefined);
    // Call your sign-in API here with { email, password, keepSignedIn }.
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 rounded-md bg-surface border">
      <Stack gap={4}>
        <Heading level={1}>Sign in</Heading>

        <Field label="Email" error={emailError}>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            invalid={Boolean(emailError)}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
            }}
          />
        </Field>

        <Field label="Password">
          <PasswordInput
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

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
