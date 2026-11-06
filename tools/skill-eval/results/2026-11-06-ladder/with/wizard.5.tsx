import { useEffect, useRef, useState, type FormEvent } from 'react';
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
  Toaster,
  announce,
  toast,
} from 'serupa-ds';

type Values = {
  email: string;
  password: string;
  name: string;
  role: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

const STEPS = ['Account', 'Profile', 'Confirm'];
const ROLES = ['Designer', 'Developer', 'Product manager', 'Other'];

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter an email address in the format name@example.com.';
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
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState<Values>({
    email: '',
    password: '',
    name: '',
    role: '',
    terms: false,
  });

  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // After a step change, move focus to the step heading and announce it.
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
    announce(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`);
  }, [step]);

  // After a failed Next, move focus to the error summary.
  const errorCount = Object.values(errors).filter(Boolean).length;
  const [submitTick, setSubmitTick] = useState(0);
  useEffect(() => {
    if (submitTick > 0 && errorCount > 0) summaryRef.current?.focus();
  }, [submitTick, errorCount]);

  const next = () => {
    const found = validate(step, values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setSubmitTick((t) => t + 1);
      return;
    }
    moved.current = true;
    setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    moved.current = true;
    setStep((s) => s - 1);
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (step < STEPS.length - 1) return next();
    const found = validate(step, values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setSubmitTick((t) => t + 1);
      return;
    }
    setDone(true);
    toast('Account created');
  };

  const errorItems = (Object.entries(errors) as [keyof Values, string | undefined][])
    .filter(([, msg]) => msg)
    .map(([field, message]) => ({ id: `su-${field}`, message: message as string }));

  if (done) {
    return (
      <Card>
        <Stack gap={4}>
          <Heading level={1}>You're all set</Heading>
          <Alert variant="success" title="Account created">
            Welcome, {values.name}. We sent a confirmation link to {values.email}.
          </Alert>
        </Stack>
        <Toaster />
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={6}>
          <Heading level={1}>Create your account</Heading>

          <Stepper
            steps={STEPS.map((label) => ({ label }))}
            current={step}
            aria-label="Sign-up progress"
          />

          <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </Heading>

          {errorItems.length > 0 && <ErrorSummary ref={summaryRef} errors={errorItems} />}

          {step === 0 && (
            <Stack gap={4}>
              <Field label="Email" error={errors.email} id="su-email">
                <Input
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  invalid={!!errors.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field
                label="Password"
                hint="At least 8 characters."
                error={errors.password}
                id="su-password"
              >
                <PasswordInput
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
              <Field label="Full name" error={errors.name} id="su-name">
                <Input
                  autoComplete="name"
                  value={values.name}
                  invalid={!!errors.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label="Role" error={errors.role} id="su-role">
                <Select
                  value={values.role}
                  invalid={!!errors.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Choose a role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
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
                  <dd>{values.role}</dd>
                </div>
              </dl>
              <Field error={errors.terms} id="su-terms">
                <Checkbox
                  label="I accept the terms of service and privacy policy"
                  checked={values.terms}
                  invalid={!!errors.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                />
              </Field>
            </Stack>
          )}

          <Stack direction="row" gap={2} justify="between">
            <Button type="button" variant="secondary" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Next
              </Button>
            ) : (
              <Button type="submit">Finish</Button>
            )}
          </Stack>
        </Stack>
      </form>
      <Toaster />
    </Card>
  );
}
