import { useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, ErrorSummary, Field, Heading, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm() {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const titleRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task.';
    if (!due) next.due = 'Pick a due date from the calendar.';
    setErrors(next);

    if (next.title || next.due) {
      // Move focus to the first problem
      if (next.title) titleRef.current?.focus();
      return;
    }

    // Save the task here (API call, store, etc.)
    toast('Task saved');
    setTitle('');
    setDue(null);
  }

  const errorList = [
    errors.title && { id: 'task-title', message: errors.title },
    errors.due && { id: 'task-due', message: errors.due },
  ].filter(Boolean) as { id: string; message: string }[];

  return (
    <form onSubmit={handleSubmit} noValidate className="p-4">
      <Stack gap={4}>
        <Heading level={2}>New task</Heading>

        {errorList.length > 0 && <ErrorSummary errors={errorList} />}

        <Field label="Title" error={errors.title}>
          <Input
            id="task-title"
            ref={titleRef}
            value={title}
            invalid={!!errors.title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.due}>
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
  );
}
