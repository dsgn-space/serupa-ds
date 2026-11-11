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

type Errors = { title?: string; dueDate?: string };

export function App() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);

  function save(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task';
    if (!dueDate) next.dueDate = 'Choose a due date';
    setErrors(next);
    if (next.title) return titleRef.current?.focus();
    if (next.dueDate) return dueRef.current?.focus();
    toast('Task saved');
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
                <Field label="Title" required error={errors.title}>
                  <Input
                    ref={titleRef}
                    value={title}
                    invalid={!!errors.title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((r) => ({ ...r, title: undefined })); }}
                  />
                </Field>
                <Field label="Due date" required error={errors.dueDate}>
                  <DatePicker
                    ref={dueRef}
                    value={dueDate}
                    invalid={!!errors.dueDate}
                    onValueChange={(_, iso) => { setDueDate(iso); setErrors((r) => ({ ...r, dueDate: undefined })); }}
                  />
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
