import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Field,
  Input,
  Textarea,
  Stack,
  Heading,
  ErrorSummary,
  Alert,
  announce,
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
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const set = (key: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (['name', 'email', 'message'] as const).find((k) => found[k]);
    if (first) {
      setSent(false);
      refs[first].current?.focus();
      return;
    }
    // Send `values` to your API here.
    setSent(true);
    setValues({ name: '', email: '', message: '' });
    announce('Message sent');
  };

  const list = (['name', 'email', 'message'] as const)
    .filter((k) => errors[k])
    .map((k) => ({ id: k, message: errors[k] as string }));

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="contact-title">
      <Stack gap={4}>
        <Heading level={2} id="contact-title">
          Contact us
        </Heading>

        {sent && (
          <Alert status="success" title="Message sent">
            Thanks for getting in touch. We'll reply by email soon.
          </Alert>
        )}

        {list.length > 0 && <ErrorSummary errors={list} />}

        <Field label="Name" error={errors.name} required>
          <Input
            ref={refs.name}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email} required>
          <Input
            ref={refs.email}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
          />
        </Field>

        <Field label="Message" error={errors.message} required>
          <Textarea
            ref={refs.message}
            name="message"
            rows={5}
            value={values.message}
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
