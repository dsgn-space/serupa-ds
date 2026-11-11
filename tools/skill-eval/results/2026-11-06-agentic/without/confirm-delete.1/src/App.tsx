import { useEffect, useRef, useState } from 'react';
import { Button, Card, Container, Dialog, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Text, announce } from 'serupa-ds';
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

function DeleteProject({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (deleted) return <Text>{name} was deleted.</Text>;
  return (
    <>
      <Button destructive variant="outline" className="self-start" onClick={() => setOpen(true)}>Delete project</Button>
      <Dialog
        alert
        size="sm"
        open={open}
        onOpenChange={setOpen}
        initialFocus={cancelRef}
        title="Delete project?"
        description={`This permanently deletes ${name}. You can't undo this.`}
        footer={
          <>
            <Button ref={cancelRef} variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button destructive onClick={() => { setOpen(false); setDeleted(true); announce(`${name} deleted`); }}>Delete project</Button>
          </>
        }
      >
        <Text>You will lose the project's settings, its data and its history. Other people on the project lose access.</Text>
      </Dialog>
    </>
  );
}

export function App() {
  const [email, setEmail] = useState('');
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
              <Heading level={2}>Danger zone</Heading>
              <DeleteProject name="Eval app" />
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
