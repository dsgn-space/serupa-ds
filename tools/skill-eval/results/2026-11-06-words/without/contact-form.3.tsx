import { useState, type FormEvent } from "react";
// NOTE: I couldn't inspect the installed serupa-ds package in this session, so
// the component names and props below (Button, Input, Textarea, Alert) are
// assumed. Check them against the library's exports before use.
import { Alert, Button, Input, Textarea } from "serupa-ds";

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Enter a message.";
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const update = (field: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the person starts fixing it.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);

    const found = validate(values);
    setErrors(found);

    const firstInvalid = (Object.keys(found) as (keyof Values)[])[0];
    if (firstInvalid) {
      // Move focus to the first field with a problem.
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    // TODO: send `values` to your backend here.
    setSent(true);
    setValues({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact us">
      {sent && (
        <div role="status">
          <Alert variant="success">Thanks, your message has been sent.</Alert>
        </div>
      )}

      <Input
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={(e) => update("name")(e.target.value)}
        invalid={!!errors.name}
        errorMessage={errors.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={(e) => update("email")(e.target.value)}
        invalid={!!errors.email}
        errorMessage={errors.email}
      />

      <Textarea
        label="Message"
        name="message"
        rows={5}
        required
        value={values.message}
        onChange={(e) => update("message")(e.target.value)}
        invalid={!!errors.message}
        errorMessage={errors.message}
      />

      <Button type="submit">Send message</Button>
    </form>
  );
}
