import { useEffect, useState } from 'react';
import { Button, Card, Container, DatePicker, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Text, announce } from 'serupa-ds';
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
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<string | null>(null);
  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>New task</Heading>
          <Card>
            <form onSubmit={(e) => { e.preventDefault(); announce(`Saved task ${title}${due ? `, due ${due}` : ''}`); }}>
              <Stack gap={4}>
                <Field label="Title" required>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field label="Due date">
                  <DatePicker value={due} onValueChange={(_, iso) => setDue(iso)} />
                </Field>
                <Button type="submit" className="self-start">Save</Button>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
