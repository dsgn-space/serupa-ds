import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Field,
  Heading,
  Input,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  announce,
} from 'serupa-ds';

const STEPS = ['Account', 'Profile', 'Confirm'] as const;

interface FormData {
  email: string;
  password: string;
  name: string;
  country: string;
  terms: boolean;
}

type Errors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = { email: '', password: '', name: '', country: '', terms: false };

function validate(step: number, d: FormData): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter an email address like name@example.com.';
    if (!d.password) e.password = 'Enter a password of at least 8 characters.';
    else if (d.password.length < 8) e.password = 'Use at least 8 characters. Yours is too short.';
  }
  if (step === 1) {
    if (!d.name.trim()) e.name = 'Enter your full name.';
    if (!d.country) e.country = 'Choose your country.';
  }
  if (step === 2 && !d.terms) e.terms = 'Agree to the terms to create your account.';
  return e;
}

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusError = useRef(false);
  const moved = useRef(false);

  const isLast = step === STEPS.length - 1;

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // After a failed submit, move focus to the first invalid control.
  useEffect(() => {
    if (focusError.current) {
      focusError.current = false;
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [errors]);

  // After a step change, move focus to the step heading and say where we are.
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
    announce(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`);
  }, [step]);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusError.current = true;
      return;
    }
    if (isLast) {
      setDone(true);
      announce('Account created');
      return;
    }
    moved.current = true;
    setStep((s) => s + 1);
  };

  const back = () => {
    moved.current = true;
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  if (done) {
    return (
      <Card>
        <Stack gap={4}>
          <Heading level={1}>You're all set</Heading>
          <Alert variant="success" title="Account created">
            We sent a confirmation link to {data.email}.
          </Alert>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Stack gap={6}>
        <Heading level={1}>Create your account</Heading>

        <Stepper
          steps={STEPS.map((label) => ({ label }))}
          current={step}
          aria-label="Sign-up progress"
        />

        <form ref={formRef} onSubmit={onSubmit} noValidate>
          <Stack gap={4}>
            <Heading level={2} size="lg" ref={headingRef} tabIndex={-1}>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </Heading>

            {step === 0 && (
              <>
                <Field label="Email" error={errors.email}>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    invalid={!!errors.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </Field>
                <Field label="Password" hint="At least 8 characters." error={errors.password}>
                  <PasswordInput
                    autoComplete="new-password"
                    value={data.password}
                    invalid={!!errors.password}
                    onChange={(e) => set('password', e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Full name" error={errors.name}>
                  <Input
                    autoComplete="name"
                    value={data.name}
                    invalid={!!errors.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </Field>
                <Field label="Country" error={errors.country}>
                  <Select
                    value={data.country}
                    invalid={!!errors.country}
                    onChange={(e) => set('country', e.target.value)}
                  >
                    <option value="">Choose a country</option>
                    <option value="id">Indonesia</option>
                    <option value="my">Malaysia</option>
                    <option value="sg">Singapore</option>
                    <option value="us">United States</option>
                  </Select>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Text>Check your details, then finish.</Text>
                <dl className="p-4 rounded-md bg-surface-muted">
                  <dt className="text-text-muted">Email</dt>
                  <dd className="mb-2">{data.email}</dd>
                  <dt className="text-text-muted">Name</dt>
                  <dd className="mb-2">{data.name}</dd>
                  <dt className="text-text-muted">Country</dt>
                  <dd>{data.country.toUpperCase()}</dd>
                </dl>
                <Field error={errors.terms}>
                  <Checkbox
                    label="I agree to the terms of service"
                    checked={data.terms}
                    invalid={!!errors.terms}
                    onChange={(e) => set('terms', e.target.checked)}
                  />
                </Field>
              </>
            )}

            <Stack direction="row" gap={2} justify="between">
              <Button type="button" variant="secondary" onClick={back} disabled={step === 0}>
                Back
              </Button>
              <Button type="submit">{isLast ? 'Finish' : 'Next'}</Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}

export default SignUpWizard;
