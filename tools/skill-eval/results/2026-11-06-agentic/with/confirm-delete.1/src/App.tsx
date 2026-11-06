import { useEffect, useRef, useState } from 'react';
import { Button, Card, Container, Dialog, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Text, Toaster, announce, toast } from 'serupa-ds';
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Eval app</Heading>
          <Text>Edit src/App.tsx to start. The components and what each is for are in node_modules/serupa-ds/README.md.</Text>
          <Card>
            <form onSubmit={(e) => { e.preventDefault(); announce(`Signed up ${email}`); }}>
              <Stack gap={4}>
                <Field label="Email" required>
                  <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Button type="submit" className="self-start">Sign up</Button>
              </Stack>
            </form>
          </Card>
          <Card>
            <Stack gap={4}>
              <Heading level={2}>Delete project</Heading>
              {deleted ? (
                <Text>This project was deleted.</Text>
              ) : (
                <>
                  <Text>Permanently remove this project and everything in it.</Text>
                  <Button destructive variant="outline" className="self-start" onClick={() => setConfirmingDelete(true)}>
                    Delete project
                  </Button>
                </>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>
      <Dialog
        alert
        size="sm"
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        initialFocus={cancelRef}
        title="Delete project?"
        description="This can't be undone. You will lose the project's files, settings and activity history, and everyone with access will lose it too."
        footer={
          <>
            <Button ref={cancelRef} variant="outline" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            <Button
              destructive
              onClick={() => {
                setConfirmingDelete(false);
                setDeleted(true);
                toast('Project deleted');
              }}
            >
              Delete
            </Button>
          </>
        }
      />
      <Toaster />
    </>
  );
}
