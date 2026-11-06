import { useState, type FormEvent } from 'react';
import {
  Button,
  Container,
  DatePicker,
  Field,
  Heading,
  Input,
  Stack,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

// Render one <Toaster /> near the app's root so toast() is shown and announced.

type Errors = { title?: string; due?: string };

export function TaskForm({ onSave }: { onSave?: (task: { title: string; due: Date }) => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task, such as "Send invoice".';
    if (!due) next.due = 'Pick a due date from the calendar.';
    setErrors(next);

    if (next.title || next.due) {
      // Move focus to the first field with an error.
      const firstId = next.title ? 'task-title' : 'task-due';
      document.getElementById(firstId)?.focus();
      return;
    }

    onSave?.({ title: title.trim(), due: due as Date });
    toast('Task saved');
    setTitle('');
    setDue(null);
  }

  return (
    <>
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>

      <Container as="main" id="main">
        <Stack gap={4}>
          <Heading level={1}>New task</Heading>

          <form onSubmit={handleSubmit} noValidate>
            <Stack gap={4}>
              <Field label="Title" error={errors.title}>
                <Input
                  id="task-title"
                  value={title}
                  invalid={!!errors.title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>

              <Field label="Due date" hint="Pick a day from the calendar." error={errors.due}>
                <DatePicker
                  id="task-due"
                  value={due}
                  invalid={!!errors.due}
                  onChange={setDue}
                />
              </Field>

              <div>
                <Button type="submit">Save</Button>
              </div>
            </Stack>
          </form>
        </Stack>
      </Container>
    </>
  );
}
