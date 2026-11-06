import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
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

type Values = {
  email: string;
  password: string;
  name: string;
  role: string;
  bio: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

const STEPS = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Confirm' }];

const ROLE_LABELS: Record<string, string> = {
  designer: 'Designer',
  developer: 'Developer',
  manager: 'Manager',
  other: 'Other',
};

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email))
      e.email = 'Enter a valid email address, for example name@example.com.';
    if (v.password.length < 8) e.password = 'Use a password of at least 8 characters.';
  }
  if (step === 1) {
    if (!v.name.trim()) e.name = 'Enter your full name.';
    if (!v.role) e.role = 'Choose the role that fits you best.';
  }
  if (step === 2 && !v.terms) e.terms = 'Accept the terms to create your account.';
  return e;
}

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
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
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
    // Move focus to the new step's heading once it has rendered.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(step, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }
    setDone(true);
    toast('Account created');
    announce('Account created');
  };

  const errorList = Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([field, message]) => ({ href: `#signup-${field}`, message: message as string }));

  if (done) {
    return (
      <Card className="p-6">
        <Stack gap={4}>
          <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
            Welcome, {values.name}
          </Heading>
          <Alert variant="success" title="Your account is ready">
            We sent a confirmation link to {values.email}.
          </Alert>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} noValidate aria-labelledby="signup-title">
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading level={1} size="xl" id="signup-title">
              Create your account
            </Heading>
            <Text className="text-text-muted">
              Step {step + 1} of {STEPS.length}
            </Text>
          </Stack>

          <Stepper steps={STEPS} current={step} aria-label="Sign-up progress" />

          {errorList.length > 0 && (
            <ErrorSummary
              ref={summaryRef}
              title="Fix these to continue"
              errors={errorList}
            />
          )}

          <Heading level={2} size="md" ref={headingRef} tabIndex={-1}>
            {STEPS[step].label}
          </Heading>

          {step === 0 && (
            <Stack gap={4}>
              <Field label="Email" error={errors.email} required>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
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
                  value={values.password}
                  onChange={(e) => set('password', e.target.value)}
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
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label="Role" error={errors.role} required>
                <Select
                  id="signup-role"
                  value={values.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Choose a role</option>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Short bio" hint="Optional. A sentence or two about you.">
                <Textarea
                  id="signup-bio"
                  rows={3}
                  value={values.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </Field>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={4}>
              <Text>Check your details before you finish.</Text>
              <dl className="grid gap-2 p-4 rounded-md bg-surface-muted">
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd>{values.email}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Name</dt>
                  <dd>{values.name}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Role</dt>
                  <dd>{ROLE_LABELS[values.role] ?? values.role}</dd>
                </div>
                {values.bio && (
                  <div>
                    <dt className="text-text-muted">Bio</dt>
                    <dd>{values.bio}</dd>
                  </div>
                )}
              </dl>
              <Field error={errors.terms}>
                <Checkbox
                  id="signup-terms"
                  checked={values.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                  label="I agree to the terms of service and privacy policy"
                />
              </Field>
            </Stack>
          )}

          <Stack direction="row" gap={2} justify="between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button type="submit" variant="primary">
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
