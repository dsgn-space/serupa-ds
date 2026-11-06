import { useState } from "react";
// NOTE: I couldn't inspect the installed serupa-ds package in this session,
// so these export names are assumptions. Check them against its docs.
import { Button, Input } from "serupa-ds";

const STEPS = ["Account", "Profile", "Confirm"] as const;

type FormData = {
  email: string;
  password: string;
  name: string;
  bio: string;
};

export function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    bio: "",
  });
  const [done, setDone] = useState(false);

  const isLast = step === STEPS.length - 1;

  const update =
    (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  const canAdvance =
    step === 0
      ? data.email.includes("@") && data.password.length >= 8
      : step === 1
        ? data.name.trim().length > 0
        : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdvance) return;
    if (isLast) setDone(true);
    else setStep((s) => s + 1);
  };

  if (done) {
    return (
      <div role="status">
        <h2>Welcome, {data.name}!</h2>
        <p>Your account has been created.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="wizard-title" noValidate>
      <h2 id="wizard-title">Sign up</h2>

      <ol
        aria-label="Progress"
        style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}
      >
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            style={{
              fontWeight: i === step ? 700 : 400,
              opacity: i > step ? 0.6 : 1,
            }}
          >
            {i + 1}. {label}
            {i < step ? " ✓" : ""}
          </li>
        ))}
      </ol>

      <p aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <fieldset>
          <legend>Account</legend>
          <label>
            Email
            <Input
              type="email"
              value={data.email}
              onChange={update("email")}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password (8+ characters)
            <Input
              type="password"
              value={data.password}
              onChange={update("password")}
              autoComplete="new-password"
              required
            />
          </label>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Profile</legend>
          <label>
            Full name
            <Input
              value={data.name}
              onChange={update("name")}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Bio (optional)
            <Input value={data.bio} onChange={update("bio")} />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <section aria-label="Review your details">
          <h3>Confirm your details</h3>
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button type="submit" disabled={!canAdvance}>
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </form>
  );
}

export default SignUpWizard;
