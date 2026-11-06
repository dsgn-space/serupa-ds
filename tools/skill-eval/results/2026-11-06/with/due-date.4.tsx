import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, Field, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm({ onSave }: { onSave?: (task: { title: string; due: Date }) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(0);

  // After a failed submit, move focus to the first invalid control.
  useEffect(() => {
    if (!submitted) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitted]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task.';
    if (!due) next.due = 'Pick a due date from the calendar.';
    setErrors(next);

    if (next.title || next.due || !due) {
      setSubmitted((n) => n + 1);
      return;
    }

    onSave?.({ title: title.trim(), due });
    toast('Task saved'); // needs one <Toaster /> near the app root
    setTitle('');
    setDue(null);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="max-w-md">
      <Stack gap={4}>
        <Field label="Title" error={errors.title}>
          <Input
            value={title}
            invalid={!!errors.title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field label="Due date" hint="Choose a day from the calendar." error={errors.due}>
          <DatePicker value={due} invalid={!!errors.due} onChange={setDue} />
        </Field>

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Stack>
    </form>
  );
}
