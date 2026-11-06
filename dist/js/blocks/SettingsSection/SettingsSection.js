// src/blocks/SettingsSection/SettingsSection.tsx
import * as React from "react";
import { Button } from "../../components/Button/Button.js";
import { ErrorSummary } from "../../components/ErrorSummary/ErrorSummary.js";
import { Heading } from "../../components/Heading/Heading.js";
import { SaveStatus } from "../../components/SaveStatus/SaveStatus.js";
function SettingsSection({ title, description, headingLevel = 2, onSave, errors = [], status = "idle", savedAt, onRetry, saveLabel = "Save", children }) {
  const id = React.useId();
  return /* @__PURE__ */ React.createElement("section", { "aria-labelledby": id, className: "grid grid-cols-1 gap-4 border-b border-border py-6 md:grid-cols-3 md:gap-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1" }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, size: "lg", id }, title), description ? /* @__PURE__ */ React.createElement("p", { className: "m-0 text-sm text-text-muted" }, description) : null), /* @__PURE__ */ React.createElement("form", { noValidate: true, onSubmit: (e) => {
    e.preventDefault();
    onSave();
  }, className: "flex min-w-0 flex-col gap-4 md:col-span-2" }, errors.length ? /* @__PURE__ */ React.createElement(ErrorSummary, { errors, headingLevel: headingLevel + 1 }) : null, children, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement(Button, { type: "submit", loading: status === "saving" }, saveLabel), /* @__PURE__ */ React.createElement(SaveStatus, { status, savedAt, onRetry }))));
}
export {
  SettingsSection
};
//# sourceMappingURL=SettingsSection.js.map
