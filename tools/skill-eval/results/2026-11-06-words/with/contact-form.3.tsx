import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, Stack, Textarea, Toaster, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name';
  if (!email.trim()) errors.email = 'Enter your email';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter an email like name@example.com';
  if (!message.trim()) errors.message = 'Enter your message';
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const set = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear the error as soon as the person starts fixing the field.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (found.name) return nameRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    if (found.message) return messageRef.current?.focus();

    // Send the values to your API here.
    toast('Message sent');
    setValues(EMPTY);
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate aria-labelledby="contact-title">
        <Stack gap={4}>
          <Heading level={1} id="contact-title">
            Contact us
          </Heading>

          <Field label="Name" error={errors.name} required>
            <Input
              ref={nameRef}
              name="name"
              autoComplete="name"
              value={values.name}
              invalid={!!errors.name}
              onChange={(e) => set('name')(e.target.value)}
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
              onChange={(e) => set('email')(e.target.value)}
            />
          </Field>

          <Field label="Message" error={errors.message} required>
            <Textarea
              ref={messageRef}
              name="message"
              rows={5}
              value={values.message}
              invalid={!!errors.message}
              onChange={(e) => set('message')(e.target.value)}
            />
          </Field>

          <div>
            <Button type="submit">Send message</Button>
          </div>
        </Stack>
      </form>
      <Toaster />
    </>
  );
}
