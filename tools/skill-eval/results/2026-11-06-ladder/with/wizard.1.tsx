import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  ErrorSummary,
  Field,
  Heading,
  Input,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  announce,
  toast,
} from 'serupa-ds';

type Values = {
  email: string;
  password: string;
  name: string;
  role: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const STEPS = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Confirm' }];
const TITLES = ['Create your account', 'Tell us about you', 'Check and confirm'];
const ROLES = ['Designer', 'Developer', 'Product manager', 'Other'];

function validate(step: number, v: Values): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) errors.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.email = 'Email must look like name@example.com.';
    if (v.password.length < 8) errors.password = 'Use a password of at least 8 characters.';
  }
  if (step === 1) {
    if (!v.name.trim()) errors.name = 'Enter your full name.';
    if (!v.role) errors.role = 'Choose the role that fits you best.';
  }
  return errors;
}

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ email: '', password: '', name: '', role: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const isLast = step === STEPS.length - 1;

  // Move focus to the step heading whenever the step changes.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  // Move focus to the error summary when validation fails.
  const errorCount = Object.keys(errors).length;
  useEffect(() => {
    if (errorCount > 0) summaryRef.current?.focus();
  }, [errors, errorCount]);

  const set = (key: keyof Values) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    announce(`Step ${step} of ${STEPS.length}: ${STEPS[step - 1].label}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (isLast) {
      setDone(true);
      toast('Account created');
      return;
    }
    setStep(step + 1);
    announce(`Step ${step + 2} of ${STEPS.length}: ${STEPS[step + 1].label}`);
  };

  const summaryItems = (Object.entries(errors) as [keyof Values, string][])
    .filter(([, message]) => Boolean(message))
    .map(([key, message]) => ({ id: key, message }));

  if (done) {
    return (
      <Card>
        <Stack gap={4}>
          <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
            Welcome, {values.name}
          </Heading>
          <Text>We sent a confirmation link to {values.email}.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={6}>
          <Stepper steps={STEPS} current={step} />

          <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
            {TITLES[step]}
          </Heading>

          {summaryItems.length > 0 && <ErrorSummary ref={summaryRef} errors={summaryItems} />}

          {step === 0 && (
            <Stack gap={4}>
              <Field label="Email" error={errors.email} id="email">
                <Input
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  invalid={!!errors.email}
                  onChange={(e) => set('email')(e.target.value)}
                />
              </Field>
              <Field label="Password" hint="At least 8 characters." error={errors.password} id="password">
                <PasswordInput
                  autoComplete="new-password"
                  value={values.password}
                  invalid={!!errors.password}
                  onChange={(e) => set('password')(e.target.value)}
                />
              </Field>
            </Stack>
          )}

          {step === 1 && (
            <Stack gap={4}>
              <Field label="Full name" error={errors.name} id="name">
                <Input
                  autoComplete="name"
                  value={values.name}
                  invalid={!!errors.name}
                  onChange={(e) => set('name')(e.target.value)}
                />
              </Field>
              <Field label="Role" error={errors.role} id="role">
                <Select
                  value={values.role}
                  invalid={!!errors.role}
                  onChange={(e) => set('role')(e.target.value)}
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
            <dl className="m-0">
              <Stack gap={3}>
                {[
                  ['Email', values.email],
                  ['Name', values.name],
                  ['Role', values.role],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="text-text-muted">{term}</dt>
                    <dd className="m-0">{value}</dd>
                  </div>
                ))}
              </Stack>
            </dl>
          )}

          <Stack direction="row" gap={2} justify="between">
            <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            <Button type="submit">{isLast ? 'Finish' : 'Next'}</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
