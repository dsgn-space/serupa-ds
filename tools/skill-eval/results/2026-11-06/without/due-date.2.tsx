import { useState, type FormEvent } from "react";
// Assumed API: I couldn't inspect serupa-ds in this session, so these
// component names and props are unverified. Check them against the package types.
import { Button, DatePicker, TextField } from "serupa-ds";

export function TaskForm({
  onSave,
}: {
  onSave?: (task: { title: string; dueDate: Date }) => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const canSave = title.trim().length > 0 && dueDate !== null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave || !dueDate) return;
    onSave?.({ title: title.trim(), dueDate });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <DatePicker
        label="Due date"
        value={dueDate}
        onChange={(date: Date | null) => setDueDate(date)}
        required
      />
      <Button type="submit" disabled={!canSave}>
        Save
      </Button>
    </form>
  );
}
