import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Container, DatePicker, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Text, Toaster, toast } from 'serupa-ds';
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
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  function save(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Enter a title for the task');
      titleRef.current?.focus();
      return;
    }
    setError('');
    toast(dueDate ? `Task saved, due ${dueDate}` : 'Task saved');
    setTitle('');
    setDueDate(null);
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
          <Heading level={1}>New task</Heading>
          <Card>
            <form onSubmit={save} noValidate>
              <Stack gap={4}>
                <Field label="Title" required error={error || undefined}>
                  <Input
                    ref={titleRef}
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
                  />
                </Field>
                <Field label="Due date" hint="Type a date or choose one from the calendar.">
                  <DatePicker value={dueDate} onValueChange={(_, iso) => setDueDate(iso)} />
                </Field>
                <Button type="submit" className="self-start">Save task</Button>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
      <Toaster />
    </>
  );
}
