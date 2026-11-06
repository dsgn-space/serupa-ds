import { useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, ErrorSummary, Field, Heading, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm({ onSave }: { onSave?: (task: { title: string; due: Date }) => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task.';
    if (!due) next.due = 'Pick a due date from the calendar.';
    setErrors(next);

    if (next.title || next.due) {
      // Move focus to the error summary so keyboard and screen reader users land on it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    onSave?.({ title: title.trim(), due: due as Date });
    toast('Task saved');
  }

  const errorItems = [
    errors.title && { id: 'task-title', message: errors.title },
    errors.due && { id: 'task-due', message: errors.due },
  ].filter(Boolean) as { id: string; message: string }[];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>New task</Heading>

        {errorItems.length > 0 && <ErrorSummary ref={summaryRef} errors={errorItems} />}

        <Field label="Title" error={errors.title} required>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            invalid={!!errors.title}
          />
        </Field>

        <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.due} required>
          <DatePicker id="task-due" value={due} onChange={setDue} invalid={!!errors.due} />
        </Field>

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Stack>
    </form>
  );
}
