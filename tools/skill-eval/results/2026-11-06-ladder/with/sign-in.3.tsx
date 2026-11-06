import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Field,
  Heading,
  Input,
  Link,
  PasswordInput,
  Stack,
  toast,
} from 'serupa-ds';

export function SignInForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim() === '') {
      setEmailError('Enter your email address, for example name@example.com.');
      emailRef.current?.focus(); // move focus to the first error
      return;
    }

    setEmailError(undefined);
    // Call your sign-in API here, using { email, password, keepSignedIn }.
    toast('Signed in');
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate>
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

          <Stack direction="row" gap={2} align="center" justify="space-between">
            <Checkbox
              label="Keep me signed in"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            <Link href="/forgot-password">Forgot password?</Link>
          </Stack>

          <Button type="submit" variant="primary" size="lg">
            Sign in
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
