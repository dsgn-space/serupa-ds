import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  ErrorSummary,
  Field,
  Heading,
  Input,
  Stack,
  Textarea,
  toast,
} from 'serupa-ds';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter your name.';
  if (!email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }
  if (!message.trim()) errors.message = 'Enter a message.';
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSent(false);

    if (Object.keys(found).length > 0) {
      // Move focus to the error summary so keyboard and screen reader users land on it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    // Send the message to your backend here.
    setValues({ name: '', email: '', message: '' });
    setSent(true);
    toast('Message sent. We will reply soon.');
  };

  const errorList = (Object.keys(errors) as (keyof Values)[])
    .filter((key) => errors[key])
    .map((key) => ({ id: key, message: errors[key] as string }));

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="contact-title">
      <Stack gap={4}>
        <Heading level={1} id="contact-title">
          Contact us
        </Heading>

        {sent && (
          <Alert variant="success" title="Message sent">
            Thanks for getting in touch. We will reply to you by email.
          </Alert>
        )}

        {errorList.length > 0 && (
          <ErrorSummary ref={summaryRef} errors={errorList} />
        )}

        <Field label="Name" error={errors.name} required>
          <Input
            name="name"
            autoComplete="name"
            value={values.name}
            invalid={!!errors.name}
            onChange={(e) => set('name')(e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email} required>
          <Input
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
  );
}
