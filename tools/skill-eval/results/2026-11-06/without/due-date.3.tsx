import { FormEvent, useState } from "react";
import { Button, DatePicker, TextField } from "serupa-ds";

// NOTE: I couldn't inspect the installed serupa-ds package in this session.
// The component names and props below (Button, DatePicker, TextField) are
// assumed. Check them against the package's exports before using this.

export interface TaskFormValues {
  title: string;
  dueDate: Date;
}

interface TaskFormProps {
  onSave?: (values: TaskFormValues) => void;
}

export default function TaskForm({ onSave }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const titleError =
    submitted && !title.trim() ? "Enter a title for the task." : undefined;
  const dateError =
    submitted && !dueDate ? "Pick a due date from the calendar." : undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim() || !dueDate) return;
    onSave?.({ title: title.trim(), dueDate });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}
    >
      <TextField
        label="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        error={titleError}
        required
      />

      <DatePicker
        label="Due date"
        value={dueDate}
        onChange={(date: Date | null) => setDueDate(date)}
        error={dateError}
        required
      />

      <div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
