import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Container,
  Field,
  Heading,
  Input,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  Textarea,
  announce,
  toast,
} from 'serupa-ds';

type FormData = {
  email: string;
  password: string;
  name: string;
  role: string;
  bio: string;
  terms: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

const STEPS = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Confirm' },
];

const ROLES = [
  { value: '', label: 'Choose a role' },
  { value: 'designer', label: 'Designer' },
  { value: 'developer', label: 'Developer' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

function validate(step: number, data: FormData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!data.email.trim()) {
      errors.email = 'Enter your email address, for example name@example.com.';
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Enter an email address like name@example.com.';
    }
    if (data.password.length < 8) {
      errors.password = 'Use at least 8 characters for your password.';
    }
  }
  if (step === 1) {
    if (!data.name.trim()) errors.name = 'Enter your full name.';
    if (!data.role) errors.role = 'Choose the role that fits you best.';
  }
  if (step === 2 && !data.terms) {
    errors.terms = 'Agree to the terms to create your account.';
  }
  return errors;
}

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    role: '',
    bio: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isLast = step === STEPS.length - 1;

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const focusFirstError = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(`signup-${first}`)?.focus();
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    if (isLast) {
      setDone(true);
      toast('Account created');
      return;
    }
    goTo(step + 1);
  };

  if (done) {
    return (
      <Container as="div" className="py-8">
        <Alert status="success" title="You're all set">
          Your account for {data.email} has been created.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Stack gap={6}>
        <Heading level={1} size="xl">
          Create your account
        </Heading>

        <Stepper steps={STEPS} current={step} aria-label="Sign-up progress" />

        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={6}>
            <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
              {`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].label}`}
            </Heading>

            {step === 0 && (
              <Stack gap={4}>
                <Field label="Email" error={errors.email} required>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    invalid={!!errors.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </Field>
                <Field
                  label="Password"
                  hint="At least 8 characters."
                  error={errors.password}
                  required
                >
                  <PasswordInput
                    id="signup-password"
                    autoComplete="new-password"
                    value={data.password}
                    invalid={!!errors.password}
                    onChange={(e) => update('password', e.target.value)}
                  />
                </Field>
              </Stack>
            )}

            {step === 1 && (
              <Stack gap={4}>
                <Field label="Full name" error={errors.name} required>
                  <Input
                    id="signup-name"
                    autoComplete="name"
                    value={data.name}
                    invalid={!!errors.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </Field>
                <Field label="Role" error={errors.role} required>
                  <Select
                    id="signup-role"
                    value={data.role}
                    invalid={!!errors.role}
                    onChange={(e) => update('role', e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="About you" hint="Optional. A sentence or two.">
                  <Textarea
                    id="signup-bio"
                    rows={3}
                    value={data.bio}
                    onChange={(e) => update('bio', e.target.value)}
                  />
                </Field>
              </Stack>
            )}

            {step === 2 && (
              <Stack gap={4}>
                <Text>Check your details, then finish to create your account.</Text>
                <dl className="grid gap-2 p-4 rounded-md bg-surface-muted">
                  <div>
                    <dt className="text-text-muted">Email</dt>
                    <dd>{data.email}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Name</dt>
                    <dd>{data.name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Role</dt>
                    <dd>{ROLES.find((r) => r.value === data.role)?.label}</dd>
                  </div>
                  {data.bio && (
                    <div>
                      <dt className="text-text-muted">About you</dt>
                      <dd>{data.bio}</dd>
                    </div>
                  )}
                </dl>
                <Field error={errors.terms}>
                  <Checkbox
                    id="signup-terms"
                    checked={data.terms}
                    invalid={!!errors.terms}
                    onChange={(e) => update('terms', e.target.checked)}
                  >
                    I agree to the terms of service
                  </Checkbox>
                </Field>
              </Stack>
            )}

            <Stack direction="row" gap={2} justify="between">
              <Button
                type="button"
                variant="secondary"
                disabled={step === 0}
                onClick={() => goTo(step - 1)}
              >
                Back
              </Button>
              <Button type="submit">{isLast ? 'Finish' : 'Next'}</Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

export default SignUpWizard;
