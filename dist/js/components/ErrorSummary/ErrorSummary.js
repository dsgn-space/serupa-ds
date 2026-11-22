"use client";

// src/components/ErrorSummary/ErrorSummary.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { summaryTookFocus } from "../../internal/summaryFocus.js";
import { en as words } from "./labels.js";
import { FormErrorsContext } from "../../internal/formErrors.js";
function ErrorSummaryRender(t0) {
  const $ = _c(29);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const locale = useLocale();
  const {
    errors,
    title,
    headingLevel,
    description,
    autoFocus,
    className,
    ...rest
  } = props;
  const box = React.useRef(null);
  const heading = React.useId();
  const form = React.useContext(FormErrorsContext);
  const fromForm = errors == null && form != null;
  const list = errors || (form ? form.list() : []);
  const said = React.useRef("");
  React.useEffect(() => {
    const n = box.current;
    const links = n && n.querySelector("ul");
    const now = !n ? "" : fromForm && form ? "v" + form.version : list.map(_temp).join("\n") + "\n" + (links ? links.textContent : "");
    if (now === said.current) {
      return;
    }
    said.current = now;
    if (now && autoFocus !== false && n) {
      n.focus();
      summaryTookFocus(n);
    }
  });
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n_0) => {
      box.current = n_0;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const mergedRef = useMergedRef(ref, t1);
  if (!list.length) {
    return null;
  }
  const level = [2, 3, 4, 5, 6].indexOf(headingLevel) < 0 ? 2 : headingLevel;
  const t2 = -1;
  const t3 = cn("srp-error-summary", className);
  let t4;
  if ($[1] !== heading || $[2] !== level || $[3] !== list.length || $[4] !== locale || $[5] !== sds || $[6] !== title) {
    let t52;
    if ($[8] !== heading) {
      t52 = {
        id: heading,
        className: "srp-error-summary__title"
      };
      $[8] = heading;
      $[9] = t52;
    } else {
      t52 = $[9];
    }
    let t62;
    if ($[10] !== list.length || $[11] !== locale || $[12] !== sds || $[13] !== title) {
      t62 = title != null ? title : sds.labels.errorSummaryTitle(list.length, numberFormat(locale).format(list.length));
      $[10] = list.length;
      $[11] = locale;
      $[12] = sds;
      $[13] = title;
      $[14] = t62;
    } else {
      t62 = $[14];
    }
    t4 = React.createElement("h" + level, t52, t62);
    $[1] = heading;
    $[2] = level;
    $[3] = list.length;
    $[4] = locale;
    $[5] = sds;
    $[6] = title;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[15] !== description) {
    t5 = description != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-error-summary__description" }, description) : null;
    $[15] = description;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  let t6;
  if ($[17] !== list) {
    t6 = list.map(_temp2);
    $[17] = list;
    $[18] = t6;
  } else {
    t6 = $[18];
  }
  let t7;
  if ($[19] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("ul", { className: "srp-error-summary__list", role: "list" }, t6);
    $[19] = t6;
    $[20] = t7;
  } else {
    t7 = $[20];
  }
  let t8;
  if ($[21] !== heading || $[22] !== mergedRef || $[23] !== rest || $[24] !== t3 || $[25] !== t4 || $[26] !== t5 || $[27] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { tabIndex: t2, "aria-labelledby": heading, ...rest, ref: mergedRef, className: t3, "data-component": "error-summary" }, t4, t5, t7);
    $[21] = heading;
    $[22] = mergedRef;
    $[23] = rest;
    $[24] = t3;
    $[25] = t4;
    $[26] = t5;
    $[27] = t7;
    $[28] = t8;
  } else {
    t8 = $[28];
  }
  return t8;
}
function _temp2(e_0, k) {
  return /* @__PURE__ */ React.createElement("li", { key: e_0.field + k, className: "srp-error-summary__item" }, /* @__PURE__ */ React.createElement("a", { className: "srp-error-summary__link", href: "#" + e_0.field, onClick: (ev) => go(ev, e_0.field) }, e_0.message));
}
function _temp(e) {
  return e.field;
}
var ErrorSummary = /* @__PURE__ */ named("ErrorSummary", ErrorSummaryRender);
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
  if (typeof shown.scrollIntoView === "function") shown.scrollIntoView({
    block: "start"
  });
  target.focus({
    preventScroll: true
  });
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
