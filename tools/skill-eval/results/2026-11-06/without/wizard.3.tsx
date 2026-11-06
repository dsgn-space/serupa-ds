import { useState, type FormEvent } from "react";

// NOTE: I couldn't inspect the installed serupa-ds package from this session, so I
// didn't guess at its component names or props. This uses semantic HTML only, and
// the control elements are marked up so they can be swapped for serupa-ds
// equivalents (Button, TextField, Stepper) without touching the logic.

const STEPS = ["Account", "Profile", "Confirm"] as const;

type FormData = {
  email: string;
  password: string;
  fullName: string;
  bio: string;
};

export default function SignUpWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<FormData>({
    email: "",
    password: "",
    fullName: "",
    bio: "",
  });

  const isLast = step === STEPS.length - 1;

  const update =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLast) setDone(true);
    else setStep((s) => s + 1);
  }

  if (done) {
    return (
      <div role="status">
        <h2>You're all set, {data.fullName || "friend"}!</h2>
        <p>Your account for {data.email} has been created.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby="wizard-title">
      <h2 id="wizard-title">Create your account</h2>

      <ol aria-label="Progress" style={{ display: "flex", gap: 16, padding: 0, listStyle: "none" }}>
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

      {step === 0 && (
        <fieldset>
          <legend>Account</legend>
          <p>
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
          </p>
          <p>
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
          </p>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Profile</legend>
          <p>
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
          </p>
          <p>
            <label>
              Bio (optional)
              <textarea rows={3} value={data.bio} onChange={update("bio")} />
            </label>
          </p>
        </fieldset>
      )}

      {step === 2 && (
        <section aria-label="Review your details">
          <h3>Confirm your details</h3>
          <dl>
            <dt>Email</dt>
            <dd>{data.email}</dd>
            <dt>Full name</dt>
            <dd>{data.fullName}</dd>
            <dt>Bio</dt>
            <dd>{data.bio || "—"}</dd>
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
