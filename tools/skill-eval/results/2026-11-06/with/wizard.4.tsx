import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  ButtonGroup,
  Checkbox,
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

const ROLES = [
  { value: '', label: 'Choose a role' },
  { value: 'designer', label: 'Designer' },
  { value: 'developer', label: 'Developer' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

const INITIAL: Values = { email: '', password: '', name: '', role: '', bio: '', terms: false };

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter an email address like name@example.com.';
    if (!v.password) e.password = 'Enter a password of at least 8 characters.';
    else if (v.password.length < 8) e.password = 'Use at least 8 characters. Yours has ' + v.password.length + '.';
  }
  if (step === 1) {
    if (!v.name.trim()) e.name = 'Enter your full name.';
    if (!v.role) e.role = 'Choose the role that fits you best.';
  }
  if (step === 2 && !v.terms) e.terms = 'Accept the terms to create your account.';
  return e;
}

export default function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusError = useRef(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Move focus to the first invalid control after a failed Next/Finish.
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  // Move focus to the step heading when the step changes.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  const next = () => {
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusError.current = true;
      announce('Please fix the errors on this step.');
      return;
    }
    setStep((s) => s + 1);
    announce(`Step ${step + 2} of ${STEPS.length}: ${STEPS[step + 1].label}`);
  };

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
    announce(`Step ${step} of ${STEPS.length}: ${STEPS[step - 1].label}`);
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (step < STEPS.length - 1) return next();
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusError.current = true;
      announce('Please fix the errors on this step.');
      return;
    }
    setDone(true);
    toast('Account created');
  };

  if (done) {
    return (
      <Stack gap={3}>
        <Heading level={2} ref={headingRef} tabIndex={-1}>
          Welcome, {values.name}
        </Heading>
        <Text>We sent a confirmation link to {values.email}. Open it to finish setting up your account.</Text>
      </Stack>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <Stack gap={6}>
        <Stepper steps={STEPS} current={step} aria-label="Sign-up progress" />

        <Heading level={2} ref={headingRef} tabIndex={-1}>
          {STEPS[step].label}
        </Heading>

        {step === 0 && (
          <Stack gap={4}>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                autoComplete="email"
                value={values.email}
                invalid={!!errors.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>
            <Field label="Password" hint="At least 8 characters." error={errors.password}>
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
            <Field label="Full name" error={errors.name}>
              <Input
                autoComplete="name"
                value={values.name}
                invalid={!!errors.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>
            <Field label="Role" error={errors.role}>
              <Select
                value={values.role}
                invalid={!!errors.role}
                onChange={(e) => set('role', e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Short bio (optional)" hint="A sentence or two about what you do.">
              <Textarea value={values.bio} onChange={(e) => set('bio', e.target.value)} />
            </Field>
          </Stack>
        )}

        {step === 2 && (
          <Stack gap={4}>
            <Text>Check your details, then finish to create your account.</Text>
            <dl className="p-4 rounded-md bg-surface-muted">
              <Stack gap={2}>
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
                  <dd>{ROLES.find((r) => r.value === values.role)?.label}</dd>
                </div>
                {values.bio && (
                  <div>
                    <dt className="text-text-muted">Bio</dt>
                    <dd>{values.bio}</dd>
                  </div>
                )}
              </Stack>
            </dl>
            <Field error={errors.terms}>
              <Checkbox
                label="I accept the terms of service"
                checked={values.terms}
                invalid={!!errors.terms}
                onChange={(e) => set('terms', e.target.checked)}
              />
            </Field>
          </Stack>
        )}

        <ButtonGroup spacing="separate">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={back}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="submit">Next</Button>
          ) : (
            <Button type="submit">Finish</Button>
          )}
        </ButtonGroup>
      </Stack>
    </form>
  );
}
