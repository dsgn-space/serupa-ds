import { useEffect, useRef, useState } from 'react';
import { Button, Card, Checkbox, Container, Field, Heading, Input, Link, PasswordInput, SegmentedControl, SkipLink, Stack, Text, announce } from 'serupa-ds';
import type { ThemeMode } from 'serupa-ds';

// theme.js (first in <head>) follows the visitor's light or dark setting and remembers a choice made here.
function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>(() => window.Serupa?.theme?.get().mode ?? 'auto');
  useEffect(() => window.Serupa?.theme?.onChange((info) => setMode(info.mode)), []);
  return (
    <SegmentedControl
      aria-label="Theme"
      value={mode}
      onValueChange={(value) => window.Serupa?.theme?.set({ mode: value as ThemeMode })}
      options={[{ value: 'auto', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
    />
  );
}

export function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Enter your email');
      emailRef.current?.focus();
      return;
    }
    setEmailError('');
    announce('Signing in');
  }

  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Sign in</Heading>
          <Card>
            <form noValidate onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Field label="Email" error={emailError || undefined}>
                  <Input
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Checkbox checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)}>Keep me signed in</Checkbox>
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
                <Button type="submit" className="self-start">Sign in</Button>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
