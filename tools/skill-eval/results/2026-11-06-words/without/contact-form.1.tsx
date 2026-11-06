import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

// Note: I couldn't inspect serupa-ds in this session, so this uses native
// elements to avoid guessing its component API. Swap in the matching serupa-ds
// field and button components if you want its styling.

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
  const [submitted, setSubmitted] = useState(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const handleChange =
    (field: Field) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear a field's error as soon as the person starts fixing it.
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = (["name", "email", "message"] as const).find((f) => found[f]);
      if (first) refs[first].current?.focus();
      return;
    }
    // Send the values to your backend here.
    setSubmitted(true);
  };

  const reset = () => {
    setValues({ name: "", email: "", message: "" });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div role="status">
        <h2>Message sent</h2>
        <p>Thanks, {values.name.trim()}. We'll reply to {values.email.trim()} soon.</p>
        <button type="button" onClick={reset}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact us">
      <div>
        <label htmlFor="contact-name">Name</label>
        <input
          ref={refs.name}
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={handleChange("name")}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email">Email</label>
        <input
          ref={refs.email}
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange("email")}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email && (
          <p id="contact-email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message">Message</label>
        <textarea
          ref={refs.message}
          id="contact-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={handleChange("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <button type="submit">Send message</button>
    </form>
  );
}
