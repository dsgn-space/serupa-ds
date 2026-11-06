import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name';
  if (!email.trim()) errors.email = 'Enter your email';
  else if (!EMAIL.test(email.trim())) errors.email = 'Enter an email like name@example.com';
  if (!message.trim()) errors.message = 'Enter your message';
  return errors;
}

// Render one <Toaster /> near the app's root so the confirmation shows.
export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const update = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear a field's error as soon as the person edits it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (found.name) return nameRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    if (found.message) return messageRef.current?.focus();

    // Send the values to your API here.
    toast('Message sent. We will reply by email.');
    setValues({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap={4}>
        <Heading level={2}>Contact us</Heading>

        <Field label="Name" required error={errors.name}>
          <Input
            ref={nameRef}
            name="name"
            autoComplete="name"
            value={values.name}
            invalid={!!errors.name}
            onChange={(e) => update('name')(e.target.value)}
          />
        </Field>

        <Field label="Email" required error={errors.email}>
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

        <Field label="Message" required error={errors.message}>
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
          <Button type="submit">Send message</Button>
        </div>
      </Stack>
    </form>
  );
}
