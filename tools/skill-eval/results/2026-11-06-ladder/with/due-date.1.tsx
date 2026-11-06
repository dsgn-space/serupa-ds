import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, DatePicker, Field, Heading, Input, Stack, toast } from 'serupa-ds';

type Errors = { title?: string; due?: string };

export function TaskForm({ onSave }: { onSave?: (task: { title: string; due: Date }) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitCount, setSubmitCount] = useState(0);

  // After a failed submit, move focus to the first field with an error.
  useEffect(() => {
    if (submitCount === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitCount]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = 'Enter a title for the task, for example "Send invoice".';
    if (!due) next.due = 'Pick a due date from the calendar, or type it.';
    setErrors(next);

    if (next.title || next.due) {
      setSubmitCount((n) => n + 1);
      return;
    }

    onSave?.({ title: title.trim(), due: due as Date });
    toast('Task saved');
    setTitle('');
    setDue(null);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby="task-form-heading">
      <Stack gap={4}>
        <Heading level={1} id="task-form-heading">
          New task
        </Heading>

        <Field label="Title" error={errors.title}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            invalid={Boolean(errors.title)}
            autoComplete="off"
          />
        </Field>

        <Field label="Due date" hint="Type a date or pick one from the calendar." error={errors.due}>
          <DatePicker value={due} onChange={setDue} invalid={Boolean(errors.due)} />
        </Field>

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Stack>
    </form>
  );
}
