import { useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, ErrorSummary, Field, Heading, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export interface TaskValues {
  title: string;
  due: Date;
}

export function TaskForm({ onSave }: { onSave?: (task: TaskValues) => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task.';
    if (!due) next.due = 'Pick a due date from the calendar, or type one.';
    setErrors(next);

    if (next.title || next.due) {
      // Move focus to the error summary so keyboard and screen reader users land on it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    onSave?.({ title: title.trim(), due: due as Date });
    toast('Task saved');
  }

  const errorList = [
    errors.title && { id: 'task-title', message: errors.title },
    errors.due && { id: 'task-due', message: errors.due },
  ].filter(Boolean) as { id: string; message: string }[];

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="task-form-heading">
      <Stack gap={4}>
        <Heading level={2} id="task-form-heading">
          New task
        </Heading>

        {errorList.length > 0 && (
          <ErrorSummary ref={summaryRef} errors={errorList} />
        )}

        <Field label="Title" error={errors.title}>
          <Input
            id="task-title"
            value={title}
            invalid={!!errors.title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
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

// Render one <Toaster /> near the app's root so the "Task saved" toast shows.
