import { useState, type FormEvent } from "react";
import { Button, DatePicker, TextField } from "serupa-ds";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Saved task:", { title: title.trim(), dueDate });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}
    >
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
      />

      <Button type="submit" disabled={!title.trim()}>
        Save
      </Button>
    </form>
  );
}
