import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

// Render one <Toaster /> near the app's root so the "Message sent" toast shows.

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name';
  if (!email.trim()) errors.email = 'Enter your email';
  else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter an email like name@example.com';
  }
  if (!message.trim()) errors.message = 'Enter a message';
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const update = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as the person starts fixing it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the first field with an error.
      if (found.name) nameRef.current?.focus();
      else if (found.email) emailRef.current?.focus();
      else messageRef.current?.focus();
      return;
    }

    setSending(true);
    try {
      // Replace with the real request, e.g. await fetch('/api/contact', …)
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast('Message sent');
      setValues(EMPTY);
    } catch {
      toast("We couldn't send your message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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
          <Button type="submit" loading={sending}>
            Send message
          </Button>
        </div>
      </Stack>
    </form>
  );
}
