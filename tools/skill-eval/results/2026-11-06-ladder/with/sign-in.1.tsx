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
  announce,
} from 'serupa-ds';

type Errors = { email?: string; password?: string };

export function SignInForm({
  onSubmit,
}: {
  onSubmit?: (values: { email: string; password: string; keepSignedIn: boolean }) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!email.trim()) {
      next.email = 'Enter your email address, for example name@example.com.';
    }
    if (!password) {
      next.password = 'Enter your password.';
    }
    setErrors(next);

    if (next.email) {
      emailRef.current?.focus();
      announce(next.email);
      return;
    }
    if (next.password) {
      passwordRef.current?.focus();
      announce(next.password);
      return;
    }

    onSubmit?.({ email: email.trim(), password, keepSignedIn });
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate aria-labelledby="signin-title">
        <Stack gap={4}>
          <Heading level={1} id="signin-title">
            Sign in
          </Heading>

          <Field label="Email" error={errors.email}>
            <Input
              ref={emailRef}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              invalid={Boolean(errors.email)}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <PasswordInput
              ref={passwordRef}
              name="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(errors.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
          </Field>

          <Stack direction="row" justify="between" align="center" gap={2}>
            <Checkbox
              name="keepSignedIn"
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
