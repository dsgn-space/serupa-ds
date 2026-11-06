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

const ROLES: Record<string, string> = {
  designer: 'Designer',
  developer: 'Developer',
  manager: 'Manager',
  other: 'Other',
};

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter an email address in the form name@example.com.';
    if (!v.password) e.password = 'Enter a password of at least 8 characters.';
    else if (v.password.length < 8) e.password = 'Use at least 8 characters. Yours is too short.';
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
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState<Values>({
    email: '',
    password: '',
    name: '',
    role: '',
    bio: '',
    terms: false,
  });
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setErrors({});
    setStep(next);
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(step, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Move focus to the summary so keyboard and screen reader users land on the problems.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }
    setDone(true);
    toast('Account created');
  };

  const errorItems = (Object.entries(errors) as [keyof Values, string][])
    .filter(([, message]) => Boolean(message))
    .map(([field, message]) => ({ id: field, message }));

  if (done) {
    return (
      <Card>
        <Stack gap={4}>
          <Heading level={2}>You’re all set, {values.name}</Heading>
          <Alert variant="success" title="Account created">
            We sent a confirmation link to {values.email}.
          </Alert>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate aria-labelledby="wizard-title">
        <Stack gap={6}>
          <Heading level={2} id="wizard-title">
            Create your account
          </Heading>

          <Stepper steps={STEPS} current={step} />

          {errorItems.length > 0 && (
            <div ref={summaryRef} tabIndex={-1}>
              <ErrorSummary errors={errorItems} />
            </div>
          )}

          {step === 0 && (
            <Stack gap={4}>
              <Field label="Email" error={errors.email} hint="We’ll send a confirmation link here.">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  invalid={!!errors.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field label="Password" error={errors.password} hint="At least 8 characters.">
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  value={values.password}
                  invalid={!!errors.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </Field>
            </Stack>
          )}

          {step === 1 && (
            <Stack gap={4}>
              <Field label="Full name" error={errors.name}>
                <Input
                  id="name"
                  autoComplete="name"
                  value={values.name}
                  invalid={!!errors.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label="Role" error={errors.role}>
                <Select
                  id="role"
                  value={values.role}
                  invalid={!!errors.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Choose a role</option>
                  {Object.entries(ROLES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Short bio (optional)" hint="One or two sentences about you.">
                <Textarea
                  id="bio"
                  value={values.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </Field>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={4}>
              <Text>Check your details before you finish.</Text>
              <dl className="grid gap-2">
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd>{values.email}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Full name</dt>
                  <dd>{values.name}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Role</dt>
                  <dd>{ROLES[values.role]}</dd>
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
                  id="terms"
                  checked={values.terms}
                  invalid={!!errors.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                >
                  I accept the terms of service
                </Checkbox>
              </Field>
            </Stack>
          )}

          <Stack direction="row" gap={2} justify="between">
            <Button type="button" variant="secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>
              Back
            </Button>
            <Button type="submit">{step === STEPS.length - 1 ? 'Finish' : 'Next'}</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
