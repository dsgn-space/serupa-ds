import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
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
import { announce } from 'serupa-ds';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim() === '') {
      const message = 'Enter your email address, for example name@example.com.';
      setEmailError(message);
      announce(message);
      emailRef.current?.focus();
      return;
    }

    setEmailError(undefined);
    setSubmitting(true);
    try {
      // Replace with the real sign-in request.
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast('Signed in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6" style={{ maxWidth: 'var(--spacing-96, 24rem)', width: '100%' }}>
      <form onSubmit={handleSubmit} noValidate aria-labelledby="sign-in-title">
        <Stack gap={4}>
          <Heading level={1} id="sign-in-title">
            Sign in
          </Heading>

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

          <Stack direction="row" gap={2} className="items-center justify-between">
            <Checkbox
              name="keepSignedIn"
              label="Keep me signed in"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            <Link href="/forgot-password">Forgot password?</Link>
          </Stack>

          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
