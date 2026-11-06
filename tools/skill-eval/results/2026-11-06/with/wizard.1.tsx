import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Container,
  ErrorSummary,
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
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'confirm', label: 'Confirm' },
];

const ROLES = [
  { value: '', label: 'Choose a role' },
  { value: 'designer', label: 'Designer' },
  { value: 'developer', label: 'Developer' },
  { value: 'manager', label: 'Product manager' },
  { value: 'other', label: 'Other' },
];

function validate(step: number, data: FormData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!data.email.trim()) {
      errors.email = 'Enter your email address, for example name@example.com.';
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Enter a valid email address, for example name@example.com.';
    }
    if (data.password.length < 8) {
      errors.password = 'Use a password of at least 8 characters.';
    }
  }
  if (step === 1) {
    if (!data.name.trim()) errors.name = 'Enter your full name.';
    if (!data.role) errors.role = 'Choose the role that fits you best.';
  }
  if (step === 2 && !data.terms) {
    errors.terms = 'Accept the terms to create your account.';
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
    setErrors({});
    setStep(next);
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      announce(`${Object.keys(found).length} problem(s) to fix`);
      return;
    }
    if (!isLast) {
      goTo(step + 1);
      return;
    }
    setDone(true);
    toast('Account created');
  };

  if (done) {
    return (
      <Container as="main" className="py-8">
        <Card>
          <Stack gap={3}>
            <Heading level={1}>Welcome, {data.name}</Heading>
            <Text>We sent a confirmation link to {data.email}.</Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  const errorItems = (Object.keys(errors) as (keyof FormData)[])
    .filter((key) => errors[key])
    .map((key) => ({ id: key, message: errors[key] as string }));

  return (
    <Container as="main" className="py-8" style={{ maxWidth: '36rem' }}>
      <Stack gap={6}>
        <Heading level={1}>Create your account</Heading>

        <Stepper
          current={step}
          steps={STEPS.map((s) => ({ id: s.id, label: s.label }))}
          aria-label="Sign-up progress"
        />

        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <Stack gap={4}>
              <Heading level={2} ref={headingRef} tabIndex={-1}>
                {STEPS[step].label}
              </Heading>

              {errorItems.length > 0 && <ErrorSummary errors={errorItems} />}

              {step === 0 && (
                <>
                  <Field label="Email" error={errors.email} hint="We'll send a confirmation link here.">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={data.email}
                      invalid={!!errors.email}
                      onChange={(e) => update('email', e.target.value)}
                    />
                  </Field>
                  <Field label="Password" error={errors.password} hint="At least 8 characters.">
                    <PasswordInput
                      id="password"
                      autoComplete="new-password"
                      value={data.password}
                      invalid={!!errors.password}
                      onChange={(e) => update('password', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Full name" error={errors.name}>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={data.name}
                      invalid={!!errors.name}
                      onChange={(e) => update('name', e.target.value)}
                    />
                  </Field>
                  <Field label="Role" error={errors.role}>
                    <Select
                      id="role"
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
                  <Field label="Short bio (optional)">
                    <Textarea
                      id="bio"
                      rows={4}
                      value={data.bio}
                      onChange={(e) => update('bio', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Text>Check your details before you finish.</Text>
                  <dl className="grid gap-2">
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
                        <dt className="text-text-muted">Bio</dt>
                        <dd>{data.bio}</dd>
                      </div>
                    )}
                  </dl>
                  <Field error={errors.terms}>
                    <Checkbox
                      id="terms"
                      checked={data.terms}
                      onChange={(e) => update('terms', e.target.checked)}
                    >
                      I accept the terms of service
                    </Checkbox>
                  </Field>
                </>
              )}

              <Stack direction="row" gap={2} className="justify-between">
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
        </Card>
      </Stack>
    </Container>
  );
}
