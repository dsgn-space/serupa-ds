import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name';
  if (!email.trim()) errors.email = 'Enter your email';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter an email like name@example.com';
  if (!message.trim()) errors.message = 'Enter a message';
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed send, move focus to the first field with an error.
  useEffect(() => {
    if (attempt === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  const update =
    (key: keyof Values) =>
    (event: { target: { value: string } }) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempt((count) => count + 1);
      return;
    }
    // Send the message to your API here.
    setValues(EMPTY);
    toast('Message sent. We will reply by email.');
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>Contact us</Heading>

        <Field label="Name" error={errors.name} required>
          <Input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="Email" error={errors.email} required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field label="Message" error={errors.message} required>
          <Textarea
            name="message"
            rows={5}
            value={values.message}
            onChange={update('message')}
            invalid={Boolean(errors.message)}
          />
        </Field>

        <div>
          <Button type="submit">Send message</Button>
        </div>
      </Stack>
    </form>
  );
}
