import { useState, type FormEvent } from 'react';
import { Button, DatePicker, Field, Heading, Input, Stack, toast } from 'serupa-ds';

export function TaskForm() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: { title?: string; dueDate?: string } = {};
    if (!title.trim()) next.title = 'Enter a title for the task.';
    if (!dueDate) next.dueDate = 'Pick a due date from the calendar.';
    setErrors(next);

    if (Object.keys(next).length > 0) {
      // Move focus to the first field with an error.
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    // Save the task here (API call, store update, etc.).
    toast('Task saved');
    setTitle('');
    setDueDate(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>New task</Heading>

        <Field label="Title" error={errors.title}>
          <Input
            value={title}
            invalid={Boolean(errors.title)}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Due date" error={errors.dueDate}>
          <DatePicker
            value={dueDate}
            invalid={Boolean(errors.dueDate)}
            onChange={setDueDate}
          />
        </Field>

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Stack>
    </form>
  );
}
