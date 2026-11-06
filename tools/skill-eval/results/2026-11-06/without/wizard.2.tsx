import { useState, type FormEvent } from "react";

// NOTE: I couldn't inspect serupa-ds in this session (no file access), so I did not
// guess at its component names or props. This uses native, accessible elements.
// To adopt the design system, swap <input>, <button> and <select> for its
// TextField, Button and Select equivalents. The wizard logic stays the same.

type Step = { id: "account" | "profile" | "confirm"; label: string };

const STEPS: Step[] = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Profile" },
  { id: "confirm", label: "Confirm" },
];

type FormData = {
  email: string;
  password: string;
  fullName: string;
  role: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = { email: "", password: "", fullName: "", role: "" };

function validate(stepId: Step["id"], data: FormData): Errors {
  const errors: Errors = {};
  if (stepId === "account") {
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Enter a valid email address.";
    if (data.password.length < 8) errors.password = "Use at least 8 characters.";
  }
  if (stepId === "profile") {
    if (!data.fullName.trim()) errors.fullName = "Enter your full name.";
    if (!data.role) errors.role = "Choose a role.";
  }
  return errors;
}

export default function SignUpWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const update = (key: keyof FormData, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleBack = () => {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(step.id, data);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (isLast) {
      setDone(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  if (done) {
    return (
      <section aria-live="polite">
        <h2>Welcome, {data.fullName}!</h2>
        <p>Your account has been created for {data.email}.</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="wizard-title">
      <h2 id="wizard-title">Create your account</h2>

      <ol aria-label="Progress" style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}>
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === stepIndex ? "step" : undefined}
            style={{ fontWeight: i === stepIndex ? 700 : 400, opacity: i > stepIndex ? 0.6 : 1 }}
          >
            {i < stepIndex ? "✓ " : `${i + 1}. `}
            {s.label}
          </li>
        ))}
      </ol>

      <p aria-live="polite">
        Step {stepIndex + 1} of {STEPS.length}: {step.label}
      </p>

      {step.id === "account" && (
        <fieldset>
          <legend>Account details</legend>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <p id="email-error" role="alert">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => update("password", e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && <p id="password-error" role="alert">{errors.password}</p>}
          </div>
        </fieldset>
      )}

      {step.id === "profile" && (
        <fieldset>
          <legend>Your profile</legend>
          <div>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              autoComplete="name"
              value={data.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && <p id="fullName-error" role="alert">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={data.role}
              onChange={(e) => update("role", e.target.value)}
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? "role-error" : undefined}
            >
              <option value="">Select a role</option>
              <option value="designer">Designer</option>
              <option value="developer">Developer</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
            {errors.role && <p id="role-error" role="alert">{errors.role}</p>}
          </div>
        </fieldset>
      )}

      {step.id === "confirm" && (
        <section aria-label="Review your details">
          <h3>Review your details</h3>
          <dl>
            <dt>Email</dt>
            <dd>{data.email}</dd>
            <dt>Full name</dt>
            <dd>{data.fullName}</dd>
            <dt>Role</dt>
            <dd>{data.role}</dd>
          </dl>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={handleBack} disabled={isFirst}>
          Back
        </button>
        <button type="submit">{isLast ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
}
