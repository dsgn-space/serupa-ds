// src/patterns/SignIn/SignIn.tsx
import * as React from "react";
import { SkipLink } from "../../components/SkipLink/SkipLink.js";
import { AuthCard } from "../../blocks/AuthCard/AuthCard.js";
var demoCheck = (email, password) => email === "ada@example.com" && password === "correct horse";
var demoVerify = (code) => code === "123456";
function SignIn({ start = "password", failed, check = demoCheck, verify = demoVerify }) {
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-surface-muted text-text" }, /* @__PURE__ */ React.createElement(SkipLink, null), /* @__PURE__ */ React.createElement("main", { id: "main", className: "mx-auto flex max-w-sm flex-col gap-6 px-4 py-12 outline-none" }, /* @__PURE__ */ React.createElement("p", { className: "text-base font-semibold" }, "Acme"), /* @__PURE__ */ React.createElement(
    AuthCard,
    {
      idPrefix: "sign-in",
      start,
      failed,
      check,
      verify,
      forgotHref: "#forgot",
      doneHref: "#dashboard",
      defaultEmail: failed === "wrong" ? "ada@example.com" : "",
      defaultPassword: failed === "wrong" ? "correct hose" : "",
      labels: { title: "Sign in to Acme" }
    }
  )));
}
export {
  SignIn
};
//# sourceMappingURL=SignIn.js.map
