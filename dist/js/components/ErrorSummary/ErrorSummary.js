"use client";

// src/components/ErrorSummary/ErrorSummary.tsx
import * as React from "react";
import { cn, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { summaryTookFocus } from "../../internal/summaryFocus.js";
import { en as words } from "./labels.js";
import { FormErrorsContext } from "../../internal/formErrors.js";
var ErrorSummary = /* @__PURE__ */ component("ErrorSummary", function ErrorSummary2(props, ref) {
  const sds = useSettings(words);
  const locale = useLocale();
  const { errors, title, headingLevel, description, autoFocus, className, ...rest } = props;
  const box = React.useRef(null);
  const heading = React.useId();
  const form = React.useContext(FormErrorsContext);
  const fromForm = errors == null && form != null;
  const list = errors || (form ? form.list() : []);
  const said = React.useRef("");
  React.useEffect(() => {
    const n = box.current, links = n && n.querySelector("ul");
    const now = !n ? "" : fromForm && form ? "v" + form.version : list.map((e) => e.field).join("\n") + "\n" + (links ? links.textContent : "");
    if (now === said.current) return;
    said.current = now;
    if (now && autoFocus !== false && n) {
      n.focus();
      summaryTookFocus(n);
    }
  });
  const mergedRef = useMergedRef(ref, (n) => {
    box.current = n;
  });
  if (!list.length) return null;
  const level = [2, 3, 4, 5, 6].indexOf(headingLevel) < 0 ? 2 : headingLevel;
  return /* @__PURE__ */ React.createElement("div", { tabIndex: -1, "aria-labelledby": heading, ...rest, ref: mergedRef, className: cn("dk-error-summary", className), "data-component": "error-summary" }, React.createElement("h" + level, { id: heading, className: "dk-error-summary__title" }, title != null ? title : sds.labels.errorSummaryTitle(list.length, new Intl.NumberFormat(locale).format(list.length))), description != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-error-summary__description" }, description) : null, /* @__PURE__ */ React.createElement("ul", { className: "dk-error-summary__list", role: "list" }, list.map((e, k) => /* @__PURE__ */ React.createElement("li", { key: e.field + k, className: "dk-error-summary__item" }, /* @__PURE__ */ React.createElement("a", { className: "dk-error-summary__link", href: "#" + e.field, onClick: (ev) => go(ev, e.field) }, e.message)))));
});
function go(ev, field) {
  const doc = ev.currentTarget.ownerDocument, to = doc.getElementById(field);
  if (!to || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  ev.preventDefault();
  let hid = 0;
  for (let h; h = to.closest("[hidden=until-found]"); hid = 1) {
    h.dispatchEvent(new Event("beforematch"));
    h.removeAttribute("hidden");
  }
  if (hid) setTimeout(() => land(to));
  else land(to);
}
function land(to) {
  const target = inner(to), input = target, set = target.closest("fieldset");
  const legend = set && (input.type === "radio" || input.type === "checkbox") ? set.querySelector("legend") : null;
  const shown = legend || target === to && input.labels && input.labels[0] || to;
  if (typeof shown.scrollIntoView === "function") shown.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}
var FOCUSABLE = "input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])";
function inner(to) {
  if (to.matches(FOCUSABLE) || to.isContentEditable) return to;
  return to.querySelector("input:checked:not(:disabled), [aria-checked=true]:not([aria-disabled=true])") || to.querySelector(FOCUSABLE) || to;
}
export {
  ErrorSummary
};
//# sourceMappingURL=ErrorSummary.js.map
