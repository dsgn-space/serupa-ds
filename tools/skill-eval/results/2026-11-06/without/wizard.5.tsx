import { useState, type FormEvent } from "react";

// NOTE: I couldn't inspect serupa-ds in this session (no file access), so I haven't
// guessed its component names or props. This uses semantic HTML with a few class
// hooks. To adopt the design system, swap the <input>, <button> and stepper
// elements for the matching serupa-ds components.

type FormData = {
  email: string;
  password: string;
  fullName: string;
  username: string;
};

const STEPS = ["Account", "Profile", "Confirm"] as const;

const EMPTY: FormData = { email: "", password: "", fullName: "", username: "" };

export default function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [done, setDone] = useState(false);

  const isLast = step === STEPS.length - 1;

  const update =
    (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // native validation has already run on the current step's fields
    if (isLast) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  if (done) {
    return (
      <section aria-live="polite">
        <h2>You're all set, {data.fullName}!</h2>
        <p>We've created your account for {data.email}.</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="wizard-title">
      <h2 id="wizard-title">Create your account</h2>

      <nav aria-label="Progress">
        <ol style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}>
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              style={{
                fontWeight: i === step ? 700 : 400,
                opacity: i > step ? 0.6 : 1,
              }}
            >
              <span aria-hidden="true">{i < step ? "✓" : i + 1}</span> {label}
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
            <input
              type="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={update("email")}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={data.password}
              onChange={update("password")}
            />
          </label>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Your profile</legend>
          <label>
            Full name
            <input
              type="text"
              required
              autoComplete="name"
              value={data.fullName}
              onChange={update("fullName")}
            />
          </label>
          <label>
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={data.username}
              onChange={update("username")}
            />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <section aria-labelledby="confirm-title">
          <h3 id="confirm-title">Review your details</h3>
          <dl>
            <dt>Email</dt>
            <dd>{data.email}</dd>
            <dt>Full name</dt>
            <dd>{data.fullName}</dd>
            <dt>Username</dt>
            <dd>{data.username}</dd>
          </dl>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </button>
        <button type="submit">{isLast ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
}
