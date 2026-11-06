import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, DatePicker, Field, Heading, Input, Stack, toast } from 'serupa-ds';

export function TaskForm() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      next.title = 'Enter a title for the task, for example "Send the invoice".';
    }
    if (!dueDate) {
      next.dueDate = 'Pick a due date from the calendar, or type it.';
    }
    setErrors(next);

    // Move focus to the first field with an error.
    if (next.title) {
      titleRef.current?.focus();
      return;
    }
    if (next.dueDate) {
      dateRef.current?.querySelector<HTMLElement>('input, button')?.focus();
      return;
    }

    // Save the task here (API call, store, etc.).
    toast('Task saved');
    setTitle('');
    setDueDate(null);
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap={4}>
          <Heading level={2}>New task</Heading>

          <Field label="Title" error={errors.title}>
            <Input
              ref={titleRef}
              value={title}
              invalid={!!errors.title}
              onChange={(event) => setTitle(event.target.value)}
              autoComplete="off"
            />
          </Field>

          <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.dueDate}>
            <div ref={dateRef}>
              <DatePicker
                value={dueDate}
                invalid={!!errors.dueDate}
                onChange={(value: Date | null) => setDueDate(value)}
              />
            </div>
          </Field>

          <div>
            <Button type="submit">Save</Button>
          </div>
        </Stack>
      </form>
    </Card>
  );
}
