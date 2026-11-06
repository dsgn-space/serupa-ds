import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Container,
  Field,
  Heading,
  Input,
  Link,
  PasswordInput,
  Stack,
  Text,
} from 'serupa-ds';

export interface SignInValues {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

export function SignInForm({ onSubmit }: { onSubmit?: (values: SignInValues) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Sign in';
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email.trim() === '') {
      setEmailError('Enter your email address, for example name@example.com.');
      emailRef.current?.focus(); // move focus to the first error
      return;
    }

    setEmailError(undefined);
    onSubmit?.({ email: email.trim(), password, keepSignedIn });
  }

  return (
    <Container as="main" id="main" className="py-8">
      <Card className="mx-auto p-6" style={{ maxWidth: '24rem' }}>
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={4}>
            <Heading level={1} size="xl">
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

            <Checkbox
              label="Keep me signed in"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />

            <Button type="submit" variant="primary">
              Sign in
            </Button>

            <Text className="text-center">
              <Link href="/forgot-password">Forgot password?</Link>
            </Text>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
