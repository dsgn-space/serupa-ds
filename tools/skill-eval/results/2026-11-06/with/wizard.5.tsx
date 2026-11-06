import { useRef, useState, type FormEvent } from 'react';
import {
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
  toast,
} from 'serupa-ds';

type Data = {
  email: string;
  password: string;
  name: string;
  role: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof Data, string>>;

const STEPS = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Confirm' }];

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.email.trim()) e.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter an email like name@example.com.';
    if (d.password.length < 8) e.password = 'Use at least 8 characters.';
  }
  if (step === 1) {
    if (!d.name.trim()) e.name = 'Enter your full name.';
    if (!d.role) e.role = 'Choose the role that fits you best.';
  }
  if (step === 2 && !d.terms) e.terms = 'Agree to the terms to create your account.';
  return e;
}

export default function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({
    email: '',
    password: '',
    name: '',
    role: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const last = step === STEPS.length - 1;

  const set = <K extends keyof Data>(key: K, value: Data[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const go = (next: number) => {
    setStep(next);
    setErrors({});
    announce(`Step ${next + 1} of ${STEPS.length}: ${STEPS[next].label}`);
    requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>('input, select')?.focus(),
    );
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      announce('Fix the errors in the form to continue.');
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    if (last) {
      setDone(true);
      toast('Account created');
      announce('Account created');
    } else {
      go(step + 1);
    }
  };

  if (done) {
    return (
      <Card className="p-6">
        <Stack gap={3}>
          <Heading level={2}>You're all set, {data.name.split(' ')[0]}</Heading>
          <Text className="text-text-muted">
            We sent a confirmation link to {data.email}. Open it to finish setting up.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Stack gap={6}>
          <Stepper steps={STEPS} current={step} />

          <Heading level={2}>
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </Heading>

          {step === 0 && (
            <Stack gap={4}>
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
            </Stack>
          )}

          {step === 1 && (
            <Stack gap={4}>
              <Field label="Full name" error={errors.name}>
                <Input
                  autoComplete="name"
                  value={data.name}
                  invalid={!!errors.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label="Role" error={errors.role}>
                <Select
                  value={data.role}
                  invalid={!!errors.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Choose a role</option>
                  <option value="designer">Designer</option>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={4}>
              <Text className="text-text-muted">Check your details, then create your account.</Text>
              <dl className="m-0">
                <Stack gap={2}>
                  <div>
                    <dt className="text-text-muted">Email</dt>
                    <dd className="m-0">{data.email}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Name</dt>
                    <dd className="m-0">{data.name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Role</dt>
                    <dd className="m-0">{data.role}</dd>
                  </div>
                </Stack>
              </dl>
              <Field error={errors.terms}>
                <Checkbox
                  checked={data.terms}
                  invalid={!!errors.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                >
                  I agree to the terms of service
                </Checkbox>
              </Field>
            </Stack>
          )}

          <Stack direction="row" gap={2} className="justify-between">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0}
              onClick={() => go(step - 1)}
            >
              Back
            </Button>
            <Button type="submit">{last ? 'Finish' : 'Next'}</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
