import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, Toaster, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) {
    errors.name = 'Enter your name.';
  }
  if (!email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }
  if (!message.trim()) {
    errors.message = 'Enter a message.';
  }
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const update = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear the error for a field once the person edits it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (found.name) return nameRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    if (found.message) return messageRef.current?.focus();

    setSending(true);
    try {
      // Replace with the real request, e.g. await fetch('/api/contact', { ... })
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast('Message sent. We will reply by email.');
      setValues({ name: '', email: '', message: '' });
    } catch {
      toast('Could not send your message. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate aria-label="Contact us">
        <Stack gap={4}>
          <Heading level={2}>Contact us</Heading>

          <Field label="Name" error={errors.name} required>
            <Input
              ref={nameRef}
              name="name"
              autoComplete="name"
              value={values.name}
              invalid={!!errors.name}
              onChange={(e) => update('name')(e.target.value)}
            />
          </Field>

          <Field label="Email" error={errors.email} required>
            <Input
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              invalid={!!errors.email}
              onChange={(e) => update('email')(e.target.value)}
            />
          </Field>

          <Field label="Message" error={errors.message} required>
            <Textarea
              ref={messageRef}
              name="message"
              rows={5}
              value={values.message}
              invalid={!!errors.message}
              onChange={(e) => update('message')(e.target.value)}
            />
          </Field>

          <div>
            <Button type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </Stack>
      </form>
      {/* Render once near the app root; kept here so this component works on its own. */}
      <Toaster />
    </>
  );
}
