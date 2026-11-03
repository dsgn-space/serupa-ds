// src/patterns/SignIn/SignIn.tsx
import * as React from "react";
import { SkipLink } from "../../components/SkipLink/SkipLink.js";
import { Heading } from "../../components/Heading/Heading.js";
import { Field } from "../../components/Field/Field.js";
import { Input } from "../../components/Input/Input.js";
import { PasswordInput } from "../../components/PasswordInput/PasswordInput.js";
import { PinInput } from "../../components/PinInput/PinInput.js";
import { Button } from "../../components/Button/Button.js";
import { Link } from "../../components/Link/Link.js";
import { ErrorSummary } from "../../components/ErrorSummary/ErrorSummary.js";
import { Alert } from "../../components/Alert/Alert.js";
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var demoCheck = (email, password) => email === "ada@example.com" && password === "correct horse";
var demoVerify = (code) => code === "123456";
function problems(email, password) {
  const out = [];
  if (!email.trim()) out.push({ field: "sign-in-email", message: "Enter your email address" });
  else if (!EMAIL.test(email.trim())) out.push({ field: "sign-in-email", message: "Enter an email address in the right format, like name@example.com" });
  if (!password) out.push({ field: "sign-in-password", message: "Enter your password" });
  return out;
}
var WRONG = [{ field: "sign-in-password", message: "The email or password is not right. Check them, or reset your password" }];
function SignIn({ start = "password", failed, check = demoCheck, verify = demoVerify }) {
  const [step, setStep] = React.useState(start);
  const [email, setEmail] = React.useState(failed === "wrong" ? "ada@example.com" : "");
  const [password, setPassword] = React.useState(failed === "wrong" ? "correct hose" : "");
  const [errors, setErrors] = React.useState(failed === "empty" ? problems("", "") : failed === "wrong" ? WRONG : []);
  const [code, setCode] = React.useState("");
  const [codeError, setCodeError] = React.useState(null);
  const [sent, setSent] = React.useState(0);
  const heading = React.useRef(null);
  const moved = React.useRef(false);
  React.useEffect(() => {
    if (moved.current && heading.current) heading.current.focus();
  }, [step]);
  const go = (next) => {
    moved.current = true;
    setStep(next);
  };
  const fieldError = (id) => errors.find((e) => e.field === id)?.message;
  const signIn = (e) => {
    e.preventDefault();
    const found = problems(email, password);
    if (found.length) {
      setErrors(found);
      return;
    }
    if (!check(email.trim(), password)) {
      setErrors(WRONG);
      return;
    }
    setErrors([]);
    go("code");
  };
  const confirm = (e) => {
    if (e) e.preventDefault();
    if (code.length < 6) {
      setCodeError("Enter the 6-digit code");
      return;
    }
    if (!verify(code)) {
      setCodeError("That code is not right. Check the latest message, or send a new code");
      return;
    }
    setCodeError(null);
    go("done");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-surface-muted text-text" }, /* @__PURE__ */ React.createElement(SkipLink, null), /* @__PURE__ */ React.createElement("main", { id: "main", className: "mx-auto flex max-w-sm flex-col gap-6 px-4 py-12 outline-none" }, /* @__PURE__ */ React.createElement("p", { className: "text-base font-semibold" }, "Acme"), step === "password" ? /* @__PURE__ */ React.createElement("section", { "aria-labelledby": "sign-in-title", className: "flex flex-col gap-6 rounded-lg border border-border bg-surface p-6" }, /* @__PURE__ */ React.createElement(Heading, { level: 1, id: "sign-in-title", ref: heading, tabIndex: -1, className: "outline-none" }, "Sign in to Acme"), errors.length ? /* @__PURE__ */ React.createElement(ErrorSummary, { errors }) : null, /* @__PURE__ */ React.createElement("form", { noValidate: true, onSubmit: signIn, className: "flex flex-col gap-4", "aria-labelledby": "sign-in-title" }, /* @__PURE__ */ React.createElement(Field, { label: "Email", error: fieldError("sign-in-email") }, /* @__PURE__ */ React.createElement(Input, { id: "sign-in-email", name: "email", type: "email", autoComplete: "username", spellCheck: false, autoCapitalize: "none", value: email, onChange: (e) => setEmail(e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Password", error: fieldError("sign-in-password") }, /* @__PURE__ */ React.createElement(PasswordInput, { id: "sign-in-password", name: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) })), /* @__PURE__ */ React.createElement(Link, { href: "#forgot", className: "self-start text-sm" }, "Forgot your password?"), /* @__PURE__ */ React.createElement(Button, { type: "submit" }, "Sign in"))) : step === "code" ? /* @__PURE__ */ React.createElement("section", { "aria-labelledby": "sign-in-title", className: "flex flex-col gap-6 rounded-lg border border-border bg-surface p-6" }, /* @__PURE__ */ React.createElement(Heading, { level: 1, id: "sign-in-title", ref: heading, tabIndex: -1, className: "outline-none" }, "Enter your sign-in code"), /* @__PURE__ */ React.createElement("p", { className: "m-0 text-sm text-text-muted" }, "We sent a 6-digit code to the phone number on your account. It works for 10 minutes."), /* @__PURE__ */ React.createElement("form", { noValidate: true, onSubmit: confirm, className: "flex flex-col gap-4", "aria-labelledby": "sign-in-title" }, /* @__PURE__ */ React.createElement(Field, { label: "Code", error: codeError }, /* @__PURE__ */ React.createElement(PinInput, { id: "sign-in-code", name: "code", length: 6, value: code, onValueChange: setCode })), /* @__PURE__ */ React.createElement(Button, { type: "submit" }, "Verify"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement(Button, { type: "button", variant: "ghost", onClick: () => {
    setCode("");
    setCodeError(null);
    setSent((n) => n + 1);
  } }, "Send a new code"), /* @__PURE__ */ React.createElement("div", { role: "status", className: "text-sm text-text-muted" }, sent ? /* @__PURE__ */ React.createElement("p", { key: sent, className: "m-0 mt-2" }, "We sent a new code to your phone. It works for 10 minutes.") : null)))) : /* @__PURE__ */ React.createElement("section", { "aria-labelledby": "sign-in-title", className: "flex flex-col gap-4 rounded-lg border border-border bg-surface p-6" }, /* @__PURE__ */ React.createElement(Heading, { level: 1, id: "sign-in-title", ref: heading, tabIndex: -1, className: "outline-none" }, "You're signed in"), /* @__PURE__ */ React.createElement(Alert, { tone: "success" }, "Welcome back. Taking you to your dashboard."), /* @__PURE__ */ React.createElement(Link, { href: "#dashboard", className: "self-start" }, "Go to your dashboard"))));
}
export {
  SignIn
};
//# sourceMappingURL=SignIn.js.map
