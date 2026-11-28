"use client";

// src/components/Field/Field.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { FieldContext } from "../../internal/field.js";
import * as icons from "../../material/builtin.js";
import { FieldLabel } from "../../internal/fieldLabel.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { problemText } from "../../internal/validity.js";
import { en as inputWords } from "../Input/labels.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { summarySaysIt } from "../../internal/summaryFocus.js";
import { warnOnce } from "../../internal/warn.js";
import { LoaderRing } from "../../internal/loaderRing.js";
import { en as words } from "./labels.js";
import { byId } from "../../internal/root.js";
import { FormErrorsContext, useFormErrors } from "../../internal/formErrors.js";
var LABELABLE = /* @__PURE__ */ new Set(["select", "button", "meter", "output", "progress", "textarea"]);
var OWN = {
  label: 1,
  hint: 1,
  error: 1,
  warning: 1,
  checking: 1,
  name: 1,
  required: 1,
  optional: 1,
  disabled: 1,
  group: 1,
  orientation: 1,
  id: 1,
  children: 1,
  className: 1
};
function FieldRender(t0) {
  const $ = _c(18);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const base = domId("srp-f", React.useId());
  const child = React.Children.count(props.children) === 1 && React.isValidElement(props.children) ? props.children : null;
  const controlId = props.id || child && child.props.id || base + "-control";
  const form = React.useContext(FormErrorsContext);
  const name = props.name ?? (child ? child.props.name : void 0);
  const given = props.error != null && props.error !== false && props.error !== "";
  const fromForm = !given && form && name ? form.message(name) : null;
  const native = useNativeError(!given && fromForm == null);
  const errorText = given ? props.error : fromForm != null ? fromForm : native.text || null;
  const hasError = errorText != null && errorText !== false && errorText !== "";
  const place = form ? form.place : null;
  React.useEffect(() => place && name ? place(name, controlId) : void 0, [place, name, controlId]);
  const edited = form && name && fromForm != null ? () => form.clear(name) : void 0;
  const shows = _temp;
  const checking = shows(props.checking) ? props.checking : form && form.checking && name ? form.checking(name) : null;
  const kind = hasError ? "error" : shows(checking) ? "checking" : shows(props.warning) ? "warning" : null;
  const hintId = props.hint ? base + "-hint" : null;
  const errorId = hasError ? base + "-error" : null;
  const noteId = kind === "checking" || kind === "warning" ? base + "-" + kind : null;
  const group = !!props.group;
  const sds = useSettings(words);
  const errorRef = React.useRef(null);
  const labelRef = React.useRef(null);
  const said = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(_temp2, t1);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = function() {
      const text = errorRef.current ? errorRef.current.textContent || "" : "";
      if (said.current !== null && text && text !== said.current && !summarySaysIt(errorRef.current)) {
        announce(text);
      }
      said.current = text;
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  React.useEffect(t2);
  React.useEffect(function() {
    if (process.env.NODE_ENV !== "production" && !group && props.label != null && labelRef.current && !byId(labelRef.current, controlId)) {
      warnOnce("field-control", 'Field: no element has the id "' + controlId + '", so the label names nothing. Put the control inside the Field, or pass its id.');
    }
  });
  const focusControl = function(e) {
    if (e.currentTarget.control) {
      return;
    }
    const el = byId(e.currentTarget, controlId);
    if (el) {
      el.focus();
    }
  };
  const t3 = props.required ? /* @__PURE__ */ React.createElement("span", { className: "srp-field__required", "aria-hidden": true }, "*") : null;
  const t4 = props.required && group ? /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, " " + sds.labels.required) : null;
  const t5 = !props.required && props.optional ? /* @__PURE__ */ React.createElement("span", { className: "srp-field__optional" }, typeof props.optional === "string" ? props.optional : sds.labels.fieldOptional) : null;
  let t6;
  if ($[2] !== props || $[3] !== t3 || $[4] !== t4 || $[5] !== t5) {
    t6 = /* @__PURE__ */ React.createElement(React.Fragment, null, props.label, t3, t4, t5);
    $[2] = props;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  const labelKids = t6;
  const label = props.label == null ? null : group ? React.createElement("legend", {
    className: "srp-field__label",
    key: "label"
  }, labelKids) : /* @__PURE__ */ React.createElement("label", { className: "srp-field__label", htmlFor: controlId, id: base + "-label", key: "label", onClick: focusControl, ref: labelRef }, labelKids);
  const hint = props.hint ? /* @__PURE__ */ React.createElement("div", { className: "srp-field__hint", id: hintId, key: "hint" }, props.hint) : null;
  const error = hasError ? /* @__PURE__ */ React.createElement("div", { className: "srp-field__error", key: "error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-field__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: errorId, ref: errorRef }, errorText)) : kind === "warning" ? /* @__PURE__ */ React.createElement("div", { className: "srp-field__warning", key: "warning" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning, className: "srp-field__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: noteId, ref: errorRef }, props.warning)) : kind === "checking" ? /* @__PURE__ */ React.createElement("div", { className: "srp-field__checking", key: "checking" }, /* @__PURE__ */ React.createElement(LoaderRing, { size: "sm", className: "srp-field__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: noteId, ref: errorRef }, checking)) : null;
  const described = cn(hintId, errorId, noteId);
  const pass = function(el_0, isControl) {
    if (!React.isValidElement(el_0)) {
      return el_0;
    }
    const p = el_0.props;
    const add = {};
    const dom = typeof el_0.type === "string";
    if (isControl && dom && !LABELABLE.has(el_0.type) && React.Children.toArray(p.children).some(React.isValidElement)) {
      return el_0;
    }
    if (isControl) {
      if (!p.id) {
        add.id = controlId;
      }
      if (described) {
        add["aria-describedby"] = cn(p["aria-describedby"], described);
      }
      if (errorId && p["aria-errormessage"] == null) {
        add["aria-errormessage"] = errorId;
      }
      if (props.required && p["aria-required"] == null) {
        add["aria-required"] = true;
      }
    }
    if (hasError) {
      if (dom) {
        add["aria-invalid"] = true;
      } else {
        add.invalid = true;
      }
    }
    const start = form && form.defaultValue && p.name ? form.defaultValue(p.name) : void 0;
    if (start !== void 0 && !("value" in p) && !("defaultValue" in p) && !("checked" in p) && !("defaultChecked" in p)) {
      if (typeof start === "boolean") {
        add.defaultChecked = start;
      } else {
        add.defaultValue = start;
      }
    }
    if (props.disabled && !group) {
      add.disabled = true;
    }
    return React.cloneElement(el_0, add);
  };
  const rootRef = useRoot(ref, native.root);
  const horizontal = !group && props.orientation === "horizontal";
  const t7 = group && "srp-field--group";
  const t8 = horizontal && "srp-field--horizontal";
  const t9 = hasError && "srp-field--invalid";
  const t10 = kind === "warning" && "srp-field--warning";
  const t11 = kind === "checking" && "srp-field--checking";
  const t12 = props.disabled && "srp-field--disabled";
  let t13;
  if ($[7] !== props || $[8] !== t10 || $[9] !== t11 || $[10] !== t12 || $[11] !== t7 || $[12] !== t8 || $[13] !== t9) {
    t13 = cn("srp-field", t7, t8, t9, t10, t11, t12, props.className);
    $[7] = props;
    $[8] = t10;
    $[9] = t11;
    $[10] = t12;
    $[11] = t7;
    $[12] = t8;
    $[13] = t9;
    $[14] = t13;
  } else {
    t13 = $[14];
  }
  const cls = t13;
  const busy = kind === "checking" || void 0;
  if (group) {
    return /* @__PURE__ */ React.createElement("fieldset", { ...rest, ...listen(rest, edited), ref: rootRef, className: cls, "data-disabled": props.disabled ? "" : void 0, disabled: props.disabled || void 0, "aria-describedby": described || void 0, "aria-busy": busy, "data-component": "field" }, label, /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, /* @__PURE__ */ React.createElement("div", { className: "srp-field__control", key: "control" }, React.Children.map(props.children, function(c) {
      return pass(c, false);
    }))), hint, error);
  }
  const control = {
    id: controlId,
    labelId: props.label == null ? void 0 : base + "-label",
    describedBy: described || void 0,
    errorMessage: errorId || void 0,
    required: props.required || void 0,
    invalid: hasError || void 0,
    disabled: props.disabled || void 0
  };
  const t14 = label ? {
    control: controlId,
    label: base + "-label"
  } : null;
  const t15 = child ? pass(child, true) : props.children;
  let t16;
  if ($[15] !== t14 || $[16] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("div", { className: "srp-field__control", key: "control" }, /* @__PURE__ */ React.createElement(FieldLabel, { value: t14 }, t15));
    $[15] = t14;
    $[16] = t15;
    $[17] = t16;
  } else {
    t16 = $[17];
  }
  const body = /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: control, key: "body" }, t16);
  if (horizontal) {
    return /* @__PURE__ */ React.createElement("div", { ...rest, ...listen(rest, edited), ref: rootRef, className: cls, "data-disabled": props.disabled ? "" : void 0, "aria-busy": busy, "data-component": "field", "data-layout": "horizontal" }, label, /* @__PURE__ */ React.createElement("div", { className: "srp-field__body" }, body, hint, error));
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ...listen(rest, edited), ref: rootRef, className: cls, "data-disabled": props.disabled ? "" : void 0, "aria-busy": busy, "data-component": "field" }, label, body, hint, error);
}
function _temp2() {
  ensureAnnouncer();
}
function _temp(v) {
  return v != null && v !== false && v !== "";
}
var Field = /* @__PURE__ */ named("Field", FieldRender);
function useNativeError(on) {
  const $ = _c(11);
  const say = useSettings(inputWords).labels.invalidValue;
  const locale = useLocale();
  const [text, setText] = React.useState("");
  const root = React.useRef(null);
  let t0;
  if ($[0] !== locale || $[1] !== say) {
    t0 = {
      say,
      locale
    };
    $[0] = locale;
    $[1] = say;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const words2 = React.useRef(t0);
  let t1;
  if ($[3] !== locale || $[4] !== say) {
    t1 = function() {
      words2.current = {
        say,
        locale
      };
    };
    $[3] = locale;
    $[4] = say;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  React.useInsertionEffect(t1);
  let t2;
  let t3;
  if ($[6] !== on) {
    t2 = function() {
      const el = root.current;
      if (!on || !el) {
        return;
      }
      let timer = 0;
      const read = function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
          const bad = el.querySelector(":user-invalid");
          const msg = !bad ? "" : !bad.validity.customError && problemText(bad, words2.current.say, words2.current.locale) || bad.validationMessage;
          setText(msg);
        });
      };
      const form = el.closest("form");
      const types = ["focusout", "change", "input"];
      types.forEach(function(t) {
        el.addEventListener(t, read);
      });
      el.addEventListener("invalid", read, true);
      if (form) {
        form.addEventListener("reset", read);
      }
      return function() {
        window.clearTimeout(timer);
        types.forEach(function(t_0) {
          el.removeEventListener(t_0, read);
        });
        el.removeEventListener("invalid", read, true);
        if (form) {
          form.removeEventListener("reset", read);
        }
      };
    };
    t3 = [on];
    $[6] = on;
    $[7] = t2;
    $[8] = t3;
  } else {
    t2 = $[7];
    t3 = $[8];
  }
  React.useEffect(t2, t3);
  const t4 = on ? text : "";
  let t5;
  if ($[9] !== t4) {
    t5 = {
      text: t4,
      root
    };
    $[9] = t4;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}
function useRoot(ref, ownRef) {
  const $ = _c(2);
  let t0;
  if ($[0] !== ownRef) {
    t0 = function(node) {
      ownRef.current = node;
    };
    $[0] = ownRef;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return useMergedRef(ref, t0);
}
function listen(rest, edited) {
  if (!edited) return {};
  return {
    onInput: (e) => {
      if (rest.onInput) rest.onInput(e);
      edited();
    },
    onChange: (e) => {
      if (rest.onChange) rest.onChange(e);
      edited();
    }
  };
}
function FormErrors(props) {
  const $ = _c(3);
  const value = useFormErrors(props.errors);
  let t0;
  if ($[0] !== props.children || $[1] !== value) {
    t0 = /* @__PURE__ */ React.createElement(FormErrorsContext.Provider, { value }, props.children);
    $[0] = props.children;
    $[1] = value;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
export {
  Field,
  FormErrors
};
//# sourceMappingURL=Field.js.map
