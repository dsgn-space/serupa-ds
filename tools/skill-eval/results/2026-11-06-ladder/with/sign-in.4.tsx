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
      emailRef.current?.focus();
      return;
    }

    setEmailError(undefined);
    // Submit { email, password, keepSignedIn } to your sign-in API here.
  }

  return (
    <Card>
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
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError(undefined);
              }}
            />
          </Field>

          <Field label="Password">
            <PasswordInput
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <Stack direction="row" justify="between" align="center" gap={2}>
            <Checkbox
              name="keepSignedIn"
              label="Keep me signed in"
              checked={keepSignedIn}
              onChange={(event) => setKeepSignedIn(event.target.checked)}
            />
            <Link href="/forgot-password">Forgot password?</Link>
          </Stack>

          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
