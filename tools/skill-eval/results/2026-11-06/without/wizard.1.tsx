// NOTE: I couldn't inspect the installed serupa-ds package in this session (no file access).
// The imports below (Button, Input) assume common export names. Check them against the
// package's actual exports before using this.
import { useState, type FormEvent } from "react";
import { Button, Input } from "serupa-ds";

const STEPS = ["Account", "Profile", "Confirm"] as const;

interface FormData {
  email: string;
  password: string;
  name: string;
  bio: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

export default function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({ email: "", password: "", name: "", bio: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const isLast = step === STEPS.length - 1;

  const update =
    (key: keyof FormData) => (e: { target: { value: string } }) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (step === 0) {
      if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Enter a valid email address.";
      if (data.password.length < 8) next.password = "Use at least 8 characters.";
    }
    if (step === 1 && !data.name.trim()) next.name = "Enter your name.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isLast) setDone(true);
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  if (done) {
    return (
      <div role="status">
        <h2>You're all set, {data.name}!</h2>
        <p>We've created your account for {data.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="wizard-title">
      <h2 id="wizard-title">Create your account</h2>

      <nav aria-label="Progress">
        <ol style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}>
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              style={{ fontWeight: i === step ? 700 : 400, opacity: i > step ? 0.6 : 1 }}
            >
              {i + 1}. {label}
              {i < step && <span className="sr-only"> (completed)</span>}
            </li>
          ))}
        </ol>
        <p aria-live="polite">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </nav>

      {step === 0 && (
        <fieldset>
          <legend>Account details</legend>
          <label>
            Email
            <Input
              type="email"
              value={data.email}
              onChange={update("email")}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </label>
          {errors.email && <p role="alert">{errors.email}</p>}
          <label>
            Password
            <Input
              type="password"
              value={data.password}
              onChange={update("password")}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
            />
          </label>
          {errors.password && <p role="alert">{errors.password}</p>}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Your profile</legend>
          <label>
            Full name
            <Input
              value={data.name}
              onChange={update("name")}
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
          </label>
          {errors.name && <p role="alert">{errors.name}</p>}
          <label>
            Short bio (optional)
            <Input value={data.bio} onChange={update("bio")} />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <section aria-label="Review your details">
          <h3>Review your details</h3>
          <dl>
            <dt>Email</dt>
            <dd>{data.email}</dd>
            <dt>Name</dt>
            <dd>{data.name}</dd>
            {data.bio && (
              <>
                <dt>Bio</dt>
                <dd>{data.bio}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Button type="button" variant="secondary" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button type="submit">{isLast ? "Finish" : "Next"}</Button>
      </div>
    </form>
  );
}
