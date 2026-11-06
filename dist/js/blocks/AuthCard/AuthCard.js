// src/blocks/AuthCard/AuthCard.tsx
import * as React from "react";
import { Heading } from "../../components/Heading/Heading.js";
import { Field } from "../../components/Field/Field.js";
import { Input } from "../../components/Input/Input.js";
import { PasswordInput } from "../../components/PasswordInput/PasswordInput.js";
import { PinInput } from "../../components/PinInput/PinInput.js";
import { Button } from "../../components/Button/Button.js";
import { Link } from "../../components/Link/Link.js";
import { ErrorSummary } from "../../components/ErrorSummary/ErrorSummary.js";
import { Alert } from "../../components/Alert/Alert.js";
var english = {
  title: "Sign in",
  email: "Email",
  password: "Password",
  forgot: "Forgot your password?",
  signIn: "Sign in",
  emailMissing: "Enter your email address",
  emailFormat: "Enter an email address in the right format, like name@example.com",
  passwordMissing: "Enter your password",
  wrong: "The email or password is not right. Check them, or reset your password",
  codeTitle: "Enter your sign-in code",
  codeSent: "We sent a 6-digit code to the phone number on your account. It works for 10 minutes.",
  code: "Code",
  verify: "Verify",
  codeShort: "Enter the 6-digit code",
  codeWrong: "That code is not right. Check the latest message, or send a new code",
  resend: "Send a new code",
  resent: "We sent a new code to your phone. It works for 10 minutes.",
  doneTitle: "You're signed in",
  doneMessage: "Welcome back. Taking you to your dashboard.",
  doneLink: "Go to your dashboard"
};
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var thenable = (v) => v != null && typeof v.then === "function";
function answer(out, then, busy) {
  if (!thenable(out)) {
    then(out);
    return;
  }
  busy(true);
  out.then((ok) => {
    busy(false);
    then(ok);
  }, () => busy(false));
}
function AuthCard({ check, verify, onResend, onSignedIn, forgotHref, doneHref, idPrefix, headingLevel = 1, start = "password", failed, defaultEmail = "", defaultPassword = "", labels }) {
  const l = { ...english, ...labels };
  const own = React.useId(), p = idPrefix ?? own;
  const ids = { title: `${p}-title`, email: `${p}-email`, password: `${p}-password`, code: `${p}-code` };
  const problems = (email2, password2) => {
    const out = [];
    if (!email2.trim()) out.push({ field: ids.email, message: l.emailMissing });
    else if (!EMAIL.test(email2.trim())) out.push({ field: ids.email, message: l.emailFormat });
    if (!password2) out.push({ field: ids.password, message: l.passwordMissing });
    return out;
  };
  const wrong = [{ field: ids.password, message: l.wrong }];
  const [step, setStep] = React.useState(start);
  const [email, setEmail] = React.useState(defaultEmail);
  const [password, setPassword] = React.useState(defaultPassword);
  const [errors, setErrors] = React.useState(() => failed === "empty" ? problems("", "") : failed === "wrong" ? wrong : []);
  const [code, setCode] = React.useState("");
  const [codeError, setCodeError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(0);
  const heading = React.useRef(null);
  const moved = React.useRef(false);
  React.useEffect(() => {
    if (moved.current && heading.current) heading.current.focus();
  }, [step]);
  const go = (next) => {
    moved.current = true;
    setStep(next);
    if (next === "done") onSignedIn?.();
  };
  const fieldError = (id) => errors.find((e) => e.field === id)?.message;
  const signIn = (e) => {
    e.preventDefault();
    if (busy) return;
    const found = problems(email, password);
    if (found.length) {
      setErrors(found);
      return;
    }
    answer(check(email.trim(), password), (ok) => {
      if (!ok) {
        setErrors(wrong);
        return;
      }
      setErrors([]);
      go(verify ? "code" : "done");
    }, setBusy);
  };
  const confirm = (e) => {
    e.preventDefault();
    if (busy || !verify) return;
    if (code.length < 6) {
      setCodeError(l.codeShort);
      return;
    }
    answer(verify(code), (ok) => {
      if (!ok) {
        setCodeError(l.codeWrong);
        return;
      }
      setCodeError(null);
      go("done");
    }, setBusy);
  };
  const title = (text) => /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, id: ids.title, ref: heading, tabIndex: -1, className: "outline-none" }, text);
  const card = "flex flex-col gap-6 rounded-lg border border-border bg-surface p-6";
  return step === "password" ? /* @__PURE__ */ React.createElement("section", { "aria-labelledby": ids.title, className: card }, title(l.title), errors.length ? /* @__PURE__ */ React.createElement(ErrorSummary, { errors, headingLevel: headingLevel + 1 }) : null, /* @__PURE__ */ React.createElement("form", { noValidate: true, onSubmit: signIn, className: "flex flex-col gap-4", "aria-labelledby": ids.title }, /* @__PURE__ */ React.createElement(Field, { label: l.email, error: fieldError(ids.email) }, /* @__PURE__ */ React.createElement(Input, { id: ids.email, name: "email", type: "email", autoComplete: "username", spellCheck: false, autoCapitalize: "none", value: email, onChange: (e) => setEmail(e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: l.password, error: fieldError(ids.password) }, /* @__PURE__ */ React.createElement(PasswordInput, { id: ids.password, name: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) })), /* @__PURE__ */ React.createElement(Link, { href: forgotHref, className: "self-start text-sm" }, l.forgot), /* @__PURE__ */ React.createElement(Button, { type: "submit", loading: busy }, l.signIn))) : step === "code" ? /* @__PURE__ */ React.createElement("section", { "aria-labelledby": ids.title, className: card }, title(l.codeTitle), /* @__PURE__ */ React.createElement("p", { className: "m-0 text-sm text-text-muted" }, l.codeSent), /* @__PURE__ */ React.createElement("form", { noValidate: true, onSubmit: confirm, className: "flex flex-col gap-4", "aria-labelledby": ids.title }, /* @__PURE__ */ React.createElement(Field, { label: l.code, error: codeError }, /* @__PURE__ */ React.createElement(PinInput, { id: ids.code, name: "code", length: 6, value: code, onValueChange: setCode })), /* @__PURE__ */ React.createElement(Button, { type: "submit", loading: busy }, l.verify), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement(Button, { type: "button", variant: "ghost", onClick: () => {
    setCode("");
    setCodeError(null);
    setSent((n) => n + 1);
    onResend?.();
  } }, l.resend), /* @__PURE__ */ React.createElement("div", { role: "status", className: "text-sm text-text-muted" }, sent ? /* @__PURE__ */ React.createElement("p", { key: sent, className: "m-0 mt-2" }, l.resent) : null)))) : /* @__PURE__ */ React.createElement("section", { "aria-labelledby": ids.title, className: "flex flex-col gap-4 rounded-lg border border-border bg-surface p-6" }, title(l.doneTitle), /* @__PURE__ */ React.createElement(Alert, { tone: "success" }, l.doneMessage), doneHref ? /* @__PURE__ */ React.createElement(Link, { href: doneHref, className: "self-start" }, l.doneLink) : null);
}
export {
  AuthCard
};
//# sourceMappingURL=AuthCard.js.map
