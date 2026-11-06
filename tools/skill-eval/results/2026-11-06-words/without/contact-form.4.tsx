import { useState, type ChangeEvent, type FormEvent } from "react";
// NOTE: I couldn't inspect serupa-ds from this session, so these component
// names and props (Button, Input, Textarea, FormField, Alert) are assumed.
// Check them against the package's exports before using this.
import { Alert, Button, FormField, Input, Textarea } from "serupa-ds";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }
  if (!values.message.trim()) errors.message = "Enter a message.";
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const handleChange =
    (field: Field) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      // Clear the field's error once the person starts fixing it.
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSent(false);

    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    // Replace with a real request to your backend.
    setSent(true);
    setValues({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {sent && (
        <Alert variant="success" role="status">
          Thanks, your message was sent. We'll get back to you soon.
        </Alert>
      )}

      <FormField label="Name" error={errors.name} required>
        <Input
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
          aria-invalid={!!errors.name}
        />
      </FormField>

      <FormField label="Email" error={errors.email} required>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField label="Message" error={errors.message} required>
        <Textarea
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange("message")}
          aria-invalid={!!errors.message}
        />
      </FormField>

      <Button type="submit">Send message</Button>
    </form>
  );
}
