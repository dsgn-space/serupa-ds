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
  SkipLink,
  Stack,
  Text,
  announce,
} from 'serupa-ds';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Sign in';
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = email.trim()
      ? undefined
      : 'Enter your email address, for example name@example.com.';
    const nextPasswordError = password
      ? undefined
      : 'Enter your password.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError) {
      announce(nextEmailError);
      emailRef.current?.focus();
      return;
    }
    if (nextPasswordError) {
      announce(nextPasswordError);
      passwordRef.current?.focus();
      return;
    }

    // Call your sign-in API here, using { email, password, keepSignedIn }.
  }

  return (
    <>
      <SkipLink href="#main">Skip to content</SkipLink>
      <Container as="main" id="main" className="py-8">
        <Card className="mx-auto" style={{ maxWidth: '24rem' }}>
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
                  invalid={!!emailError}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field label="Password" error={passwordError}>
                <PasswordInput
                  ref={passwordRef}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  invalid={!!passwordError}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Checkbox
                label="Keep me signed in"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />

              <Button type="submit" size="lg">
                Sign in
              </Button>

              <Text className="text-center">
                <Link href="/forgot-password">Forgot password?</Link>
              </Text>
            </Stack>
          </form>
        </Card>
      </Container>
    </>
  );
}

export default SignInForm;
