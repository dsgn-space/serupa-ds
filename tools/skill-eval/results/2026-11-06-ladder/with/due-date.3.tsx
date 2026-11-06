import { useState, type FormEvent } from 'react';
import {
  Button,
  Container,
  DatePicker,
  Field,
  Heading,
  Input,
  SkipLink,
  Stack,
  Toaster,
  toast,
} from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm() {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task, for example "Send the invoice".';
    if (!due) next.due = 'Pick a due date from the calendar.';
    setErrors(next);

    if (next.title || next.due) {
      // Move focus to the first field with an error.
      document.getElementById(next.title ? 'task-title' : 'task-due')?.focus();
      return;
    }

    // Save the task here (API call, store, etc.).
    toast('Task saved');
    setTitle('');
    setDue(null);
  }

  return (
    <>
      <SkipLink href="#main">Skip to content</SkipLink>
      <Container as="main" id="main">
        <Stack gap={4} className="py-8">
          <Heading level={1}>New task</Heading>

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap={4}>
              <Field label="Title" error={errors.title}>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  invalid={Boolean(errors.title)}
                  autoComplete="off"
                />
              </Field>

              <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.due}>
                <DatePicker
                  id="task-due"
                  value={due}
                  onChange={setDue}
                  invalid={Boolean(errors.due)}
                />
              </Field>

              <div>
                <Button type="submit">Save</Button>
              </div>
            </Stack>
          </form>
        </Stack>
      </Container>
      <Toaster />
    </>
  );
}
