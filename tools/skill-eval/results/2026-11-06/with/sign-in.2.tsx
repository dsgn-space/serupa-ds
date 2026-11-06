import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, Field, Heading, Input, Link, PasswordInput, Stack } from 'serupa-ds';

export function SignInForm({ onSubmit }: { onSubmit?: (v: { email: string; password: string; keep: boolean }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Enter your email address, for example name@example.com.');
      emailRef.current?.focus();
      return;
    }
    setEmailError(undefined);
    onSubmit?.({ email: email.trim(), password, keep });
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
              invalid={!!emailError}
              onChange={(e) => setEmail(e.target.value)}
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
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
          />

          <Button type="submit">Sign in</Button>

          <Link href="/forgot-password">Forgot password?</Link>
        </Stack>
      </form>
    </Card>
  );
}
