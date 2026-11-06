import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, Field, Heading, Input, Link, PasswordInput, Stack } from 'serupa-ds';

export function SignInForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();

    if (!email) {
      setEmailError('Enter your email address, for example name@example.com.');
      emailRef.current?.focus(); // move focus to the first error
      return;
    }

    setEmailError(undefined);
    // Submit email, password and "keep me signed in" to your API here.
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap={4}>
          <Heading level={1}>Sign in</Heading>

          <Field label="Email" error={emailError}>
            <Input
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              invalid={Boolean(emailError)}
              onChange={() => emailError && setEmailError(undefined)}
            />
          </Field>

          <Field label="Password">
            <PasswordInput name="password" autoComplete="current-password" />
          </Field>

          <Checkbox name="remember" label="Keep me signed in" />

          <Button type="submit">Sign in</Button>

          <Link href="/forgot-password">Forgot password?</Link>
        </Stack>
      </form>
    </Card>
  );
}
