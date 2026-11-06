import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Field,
  Heading,
  Input,
  PasswordInput,
  Select,
  Stack,
  Stepper,
  Text,
  Textarea,
  ErrorSummary,
  announce,
  toast,
} from 'serupa-ds';

type Values = {
  email: string;
  password: string;
  name: string;
  role: string;
  bio: string;
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

function validate(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.email.trim()) e.email = 'Enter your email address, for example name@example.com.';
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address, for example name@example.com.';
    if (!v.password) e.password = 'Enter a password of at least 8 characters.';
    else if (v.password.length < 8) e.password = 'Use at least 8 characters for your password.';
  }
  if (step === 1) {
    if (!v.name.trim()) e.name = 'Enter your full name.';
    if (!v.role) e.role = 'Choose the role that fits you best.';
  }
  return e;
}

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ email: '', password: '', name: '', role: '', bio: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isLast = step === STEPS.length - 1;
  const set = (key: keyof Values) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      announce('There are errors to fix before you continue.');
      return;
    }
    if (!isLast) {
      goTo(step + 1);
      return;
    }
    setDone(true);
    toast('Account created');
  };

  const errorList = Object.entries(errors).map(([id, message]) => ({ id, message: message as string }));

  if (done) {
    return (
      <Card className="p-6">
        <Stack gap={3}>
          <Heading level={1}>You're all set, {values.name}</Heading>
          <Text className="text-text-muted">We've sent a confirmation link to {values.email}.</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap={6}>
          <Stepper steps={STEPS} current={step} />

          <Heading level={1} size="lg" ref={headingRef} tabIndex={-1}>
            {STEPS[step].label}
          </Heading>

          {errorList.length > 0 && <ErrorSummary errors={errorList} />}

          {step === 0 && (
            <Stack gap={4}>
              <Field label="Email" error={errors.email} id="email">
                <Input type="email" autoComplete="email" value={values.email} onChange={set('email')} />
              </Field>
              <Field label="Password" hint="At least 8 characters." error={errors.password} id="password">
                <PasswordInput autoComplete="new-password" value={values.password} onChange={set('password')} />
              </Field>
            </Stack>
          )}

          {step === 1 && (
            <Stack gap={4}>
              <Field label="Full name" error={errors.name} id="name">
                <Input autoComplete="name" value={values.name} onChange={set('name')} />
              </Field>
              <Field label="Role" error={errors.role} id="role">
                <Select value={values.role} onChange={set('role')}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Short bio (optional)" id="bio">
                <Textarea rows={3} value={values.bio} onChange={set('bio')} />
              </Field>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={3}>
              <Text className="text-text-muted">Check your details, then finish to create your account.</Text>
              <dl className="m-0">
                {[
                  ['Email', values.email],
                  ['Name', values.name],
                  ['Role', ROLES.find((r) => r.value === values.role)?.label ?? ''],
                  ['Bio', values.bio || 'Not provided'],
                ].map(([term, desc]) => (
                  <div key={term} className="py-2 border-b border-border">
                    <dt className="text-text-muted">{term}</dt>
                    <dd className="m-0 text-text">{desc}</dd>
                  </div>
                ))}
              </dl>
            </Stack>
          )}

          <Stack direction="row" gap={2} className="justify-between">
            <Button type="button" variant="secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>
              Back
            </Button>
            <Button type="submit">{isLast ? 'Finish' : 'Next'}</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
