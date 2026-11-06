import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Container,
  ErrorSummary,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  announce,
} from 'serupa-ds';

type FieldName = 'name' | 'email' | 'message';
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = 'Enter your name.';
  }
  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }
  if (!values.message.trim()) {
    errors.message = 'Enter a message.';
  }
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const setValue = (field: FieldName) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSent(false);

    if (Object.keys(nextErrors).length > 0) {
      // Move focus to the error summary so keyboard and screen reader users land on it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    // Send the message to your API here.
    setValues({ name: '', email: '', message: '' });
    setSent(true);
    announce('Message sent');
  };

  const errorList = (Object.keys(errors) as FieldName[]).map((field) => ({
    id: field,
    message: errors[field] as string,
  }));

  return (
    <Container as="section" className="py-8">
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={1}>Contact us</Heading>
          <Text className="text-text-muted">
            Send us a message and we will reply by email. All fields are required.
          </Text>
        </Stack>

        {sent && (
          <Alert status="success" title="Message sent">
            Thanks for getting in touch. We will reply to you soon.
          </Alert>
        )}

        <form noValidate onSubmit={handleSubmit}>
          <Stack gap={4}>
            {errorList.length > 0 && (
              <ErrorSummary ref={summaryRef} errors={errorList} />
            )}

            <Field label="Name" error={errors.name} required>
              <Input
                name="name"
                autoComplete="name"
                value={values.name}
                invalid={Boolean(errors.name)}
                onChange={(e) => setValue('name')(e.target.value)}
              />
            </Field>

            <Field label="Email" error={errors.email} required>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                invalid={Boolean(errors.email)}
                onChange={(e) => setValue('email')(e.target.value)}
              />
            </Field>

            <Field label="Message" error={errors.message} required>
              <Textarea
                name="message"
                rows={5}
                value={values.message}
                invalid={Boolean(errors.message)}
                onChange={(e) => setValue('message')(e.target.value)}
              />
            </Field>

            <div>
              <Button type="submit">Send message</Button>
            </div>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
