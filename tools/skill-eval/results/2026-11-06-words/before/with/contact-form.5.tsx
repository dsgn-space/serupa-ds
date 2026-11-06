import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Stack, Textarea, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: '', email: '', message: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name.';
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL.test(email.trim()))
    errors.email = 'Enter a valid email address, like name@example.com.';
  if (!message.trim()) errors.message = 'Enter a message.';
  return errors;
}

// Render one <Toaster /> near the root of the app so the success toast shows.
export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [sending, setSending] = useState(false);

  // After a failed submit, move focus to the first field with an error.
  useEffect(() => {
    if (attempt === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [attempt]);

  const set = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    setSending(true);
    try {
      // Replace with the real request, e.g. await fetch('/api/contact', …)
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast('Message sent. We’ll reply by email soon.');
      setValues(EMPTY);
    } catch {
      setErrors({ message: 'Couldn’t send your message. Try again.' });
      setAttempt((n) => n + 1);
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="max-w-md">
      <Stack gap={4}>
        <Field label="Name" error={errors.name}>
          <Input
            name="name"
            autoComplete="name"
            required
            invalid={!!errors.name}
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            invalid={!!errors.email}
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
          />
        </Field>

        <Field label="Message" error={errors.message}>
          <Textarea
            name="message"
            rows={5}
            required
            invalid={!!errors.message}
            value={values.message}
            onChange={(e) => set('message')(e.target.value)}
          />
        </Field>

        <div>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
