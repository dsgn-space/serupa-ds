import { useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, Field, Heading, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm({ onSave }: { onSave?: (task: { title: string; due: Date }) => void }) {
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

    if (next.title) {
      titleRef.current?.focus(); // move focus to the first error
      return;
    }
    if (next.due || !due) {
      document.getElementById('task-due')?.focus();
      return;
    }

    onSave?.({ title: title.trim(), due });
    toast('Task saved'); // render one <Toaster /> near the app root
    setTitle('');
    setDue(null);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="task-form-heading">
      <Stack gap={4}>
        <Heading level={2} id="task-form-heading">
          New task
        </Heading>

        <Field label="Title" error={errors.title}>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            invalid={!!errors.title}
            autoComplete="off"
          />
        </Field>

        <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.due}>
          <DatePicker id="task-due" value={due} onChange={setDue} invalid={!!errors.due} />
        </Field>

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Stack>
    </form>
  );
}
