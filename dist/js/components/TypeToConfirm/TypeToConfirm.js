"use client";

// src/components/TypeToConfirm/TypeToConfirm.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { useAutoFocus } from "../../internal/focus.js";
import { useSettings } from "../../internal/provider.js";
import { en as words } from "./labels.js";
import { Field } from "../Field/Field.js";
import { Input } from "../Input/Input.js";
import { Button } from "../Button/Button.js";
function TypeToConfirmRender(t0) {
  const $ = _c(39);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const {
    phrase,
    confirmLabel,
    onConfirm,
    label,
    hint,
    caseSensitive,
    onMatch,
    disabled,
    className,
    autoFocus,
    ...rest
  } = props;
  const [text, setText] = React.useState("");
  const fold = _temp;
  const same = (a, b) => caseSensitive === false ? fold(a) === fold(b) : a === b;
  const norm = _temp2;
  const matched = !!phrase && same(norm(text), norm(phrase));
  const told = React.useRef(false);
  React.useEffect(() => {
    if (matched === told.current) {
      return;
    }
    told.current = matched;
    if (onMatch) {
      onMatch(matched);
    }
  }, [matched, onMatch]);
  const button = React.useRef(null);
  const field = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => field.current;
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useAutoFocus(autoFocus, t1);
  let t2;
  if ($[1] !== setText) {
    t2 = () => {
      const at = field.current;
      const box = at && (at.closest("dialog") || at.form);
      if (!box) {
        return;
      }
      const clear = () => setText("");
      const type = box.tagName === "DIALOG" ? "close" : "reset";
      box.addEventListener(type, clear);
      return () => box.removeEventListener(type, clear);
    };
    $[1] = setText;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = [];
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  React.useEffect(t2, t3);
  const t4 = cn("srp-type-to-confirm", className);
  let t5;
  if ($[4] !== label || $[5] !== phrase || $[6] !== sds) {
    t5 = label != null ? label : /* @__PURE__ */ React.createElement(React.Fragment, null, sds.labels.typeToConfirm, " ", /* @__PURE__ */ React.createElement("strong", { className: "srp-type-to-confirm__phrase" }, phrase));
    $[4] = label;
    $[5] = phrase;
    $[6] = sds;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== setText) {
    t6 = (e) => setText(e.currentTarget.value);
    $[8] = setText;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== matched) {
    t7 = (e_0) => {
      if (e_0.key === "Enter" && matched && !isComposing(e_0) && button.current) {
        e_0.preventDefault();
        button.current.click();
      }
    };
    $[10] = matched;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  let t8;
  if ($[12] !== disabled || $[13] !== t6 || $[14] !== t7 || $[15] !== text) {
    t8 = /* @__PURE__ */ React.createElement(Input, { value: text, onChange: t6, disabled, ref: field, autoComplete: "off", spellCheck: false, autoCapitalize: "off", autoCorrect: "off", onKeyDown: t7 });
    $[12] = disabled;
    $[13] = t6;
    $[14] = t7;
    $[15] = text;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== disabled || $[18] !== hint || $[19] !== t5 || $[20] !== t8) {
    t9 = /* @__PURE__ */ React.createElement(Field, { label: t5, hint, disabled }, t8);
    $[17] = disabled;
    $[18] = hint;
    $[19] = t5;
    $[20] = t8;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  const t10 = disabled || !matched;
  let t11;
  if ($[22] !== disabled || $[23] !== phrase || $[24] !== sds) {
    t11 = disabled ? void 0 : sds.labels.typePhraseFirst(phrase);
    $[22] = disabled;
    $[23] = phrase;
    $[24] = sds;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== onConfirm) {
    t12 = () => onConfirm();
    $[26] = onConfirm;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  let t13;
  if ($[28] !== confirmLabel || $[29] !== t10 || $[30] !== t11 || $[31] !== t12) {
    t13 = /* @__PURE__ */ React.createElement(Button, { ref: button, className: "srp-type-to-confirm__button", destructive: true, wrap: true, disabled: t10, disabledReason: t11, onClick: t12 }, confirmLabel);
    $[28] = confirmLabel;
    $[29] = t10;
    $[30] = t11;
    $[31] = t12;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  let t14;
  if ($[33] !== ref || $[34] !== rest || $[35] !== t13 || $[36] !== t4 || $[37] !== t9) {
    t14 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t4, "data-component": "type-to-confirm" }, t9, t13);
    $[33] = ref;
    $[34] = rest;
    $[35] = t13;
    $[36] = t4;
    $[37] = t9;
    $[38] = t14;
  } else {
    t14 = $[38];
  }
  return t14;
}
function _temp2(s) {
  return s.normalize("NFKC").trim().replace(/\s+/g, " ");
}
function _temp(x) {
  return x.toLowerCase().replace(/i\u0307|\u0131/g, "i");
}
var TypeToConfirm = /* @__PURE__ */ named("TypeToConfirm", TypeToConfirmRender);
export {
  TypeToConfirm
};
//# sourceMappingURL=TypeToConfirm.js.map
