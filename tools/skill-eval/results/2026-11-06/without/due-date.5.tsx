import { useState, type FormEvent } from "react";
import { Button, DatePicker, TextField } from "serupa-ds";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const titleError = submitted && !title.trim() ? "Enter a title" : undefined;
  const dateError = submitted && !dueDate ? "Pick a due date" : undefined;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim() || !dueDate) return;

    // Replace with your own save logic
    console.log("Saved task", { title: title.trim(), dueDate });
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
        onChange={(e) => setTitle(e.target.value)}
        error={titleError}
        required
      />

      <DatePicker
        label="Due date"
        value={dueDate}
        onChange={setDueDate}
        error={dateError}
        required
      />

      <Button type="submit">Save</Button>
    </form>
  );
}
