// NOTE: I couldn't inspect serupa-ds in this session (no file or shell access),
// so the component names and props below are assumed. Check the imports and
// the invalid/error props against the package's types before merging.
import { useRef, useState, type FormEvent } from "react";
import { Button, Input, Textarea } from "serupa-ds";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim()))
    e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Enter a message.";
  return e;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const update = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the person starts fixing it.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSent(false);

    const firstInvalid = (["name", "email", "message"] as Field[]).find((f) => found[f]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your real request, e.g. await fetch("/api/contact", {...})
      await new Promise((r) => setTimeout(r, 400));
      setSent(true);
      setValues({ name: "", email: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="contact-title">
      <h2 id="contact-title">Contact us</h2>

      {sent && (
        <p role="status">Thanks, your message was sent. We'll get back to you soon.</p>
      )}

      <div>
        <label htmlFor="contact-name">Name</label>
        <Input
          id="contact-name"
          ref={refs.name}
          name="name"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          invalid={!!errors.name}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email">Email</label>
        <Input
          id="contact-email"
          ref={refs.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          invalid={!!errors.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email && (
          <p id="contact-email-error" role="alert">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message">Message</label>
        <Textarea
          id="contact-message"
          ref={refs.message}
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          invalid={!!errors.message}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert">{errors.message}</p>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

export default ContactForm;
