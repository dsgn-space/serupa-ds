import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Textarea, Stack, Heading, ErrorSummary, toast } from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name';
  if (!values.email.trim()) errors.email = 'Enter your email';
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'Enter an email like name@example.com';
  if (!values.message.trim()) errors.message = 'Enter your message';
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSending(true);
    try {
      // Replace with the real request.
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast('Message sent. We will reply by email.');
      setValues({ name: '', email: '', message: '' });
    } catch {
      toast("We couldn't send your message. Try again.");
    } finally {
      setSending(false);
    }
  }

  const errorList = (Object.keys(errors) as (keyof Values)[])
    .filter((key) => errors[key])
    .map((key) => ({ id: key, message: errors[key] as string }));

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="contact-title">
      <Stack gap={4}>
        <Heading level={1} id="contact-title">Contact us</Heading>

        {errorList.length > 0 && (
          <ErrorSummary ref={summaryRef} errors={errorList} />
        )}

        <Field label="Name" error={errors.name} required>
          <Input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update('name')(e.target.value)}
            invalid={!!errors.name}
          />
        </Field>

        <Field label="Email" error={errors.email} required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update('email')(e.target.value)}
            invalid={!!errors.email}
          />
        </Field>

        <Field label="Message" error={errors.message} required>
          <Textarea
            name="message"
            rows={5}
            value={values.message}
            onChange={(e) => update('message')(e.target.value)}
            invalid={!!errors.message}
          />
        </Field>

        <div>
          <Button type="submit" loading={sending}>Send message</Button>
        </div>
      </Stack>
    </form>
  );
}
