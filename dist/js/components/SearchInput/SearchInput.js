"use client";

// src/components/SearchInput/SearchInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { useMergedRef, cn, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { Icon } from "../Icon/Icon.js";
import { Loader } from "../Loader/Loader.js";
import { InputAction } from "../Input/Input.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { isComposing } from "../../internal/ime.js";
import { pressFocuses } from "../../internal/affix.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
function SearchInputRender(t0) {
  const $ = _c(30);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("SearchInput", NAME_HOW.field);
  props = useFieldControl(props);
  const sds = useSettings(words);
  const rest = omit(props, {
    size: 1,
    invalid: 1,
    className: 1,
    style: 1,
    onSearch: 1,
    onClear: 1,
    clearLabel: 1,
    loading: 1,
    loadingLabel: 1
  });
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) {
    rest["aria-invalid"] = true;
  }
  const el = React.useRef(null);
  const [held, setTyped, controlled] = useControllable(props.value, String(props.defaultValue ?? ""), "SearchInput", "value");
  const text = String(held ?? "");
  const locked = !!rest.disabled || !!rest.readOnly;
  useFormReset(el, () => {
    if (!controlled) {
      setTyped(String(props.defaultValue ?? ""));
    }
  });
  const clear = () => {
    const i = el.current;
    if (!i) {
      return;
    }
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (setValue && setValue.set) {
      setValue.set.call(i, "");
    } else {
      i.value = "";
    }
    i.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    if (!controlled) {
      setTyped("");
    }
    i.focus();
    if (props.onClear) {
      props.onClear();
    }
  };
  const onChange = (e) => {
    if (!controlled) {
      setTyped(e.target.value);
    }
    if (rest.onChange) {
      rest.onChange(e);
    }
  };
  const onKeyDown = (e_0) => {
    if (rest.onKeyDown) {
      rest.onKeyDown(e_0);
    }
    if (e_0.defaultPrevented || isComposing(e_0)) {
      return;
    }
    if (e_0.key === "Escape" && e_0.currentTarget.value !== "" && !locked) {
      e_0.preventDefault();
      e_0.stopPropagation();
      clear();
    } else {
      if (e_0.key === "Enter" && props.onSearch) {
        props.onSearch(e_0.currentTarget.value);
      }
    }
  };
  let t2;
  if ($[0] !== nameRef) {
    t2 = (n) => {
      el.current = n;
      nameRef(n);
    };
    $[0] = nameRef;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const mergedRef = useMergedRef(ref, t2);
  const t3 = cn("srp-input srp-search-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className);
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = (e_1) => pressFocuses(el)(e_1);
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const t5 = props.loading ? void 0 : true;
  let t6;
  if ($[3] !== props.loading || $[4] !== props.loadingLabel || $[5] !== sds) {
    t6 = props.loading ? /* @__PURE__ */ React.createElement(Loader, { size: "sm", delay: 0, label: props.loadingLabel ?? sds.labels.searching }) : /* @__PURE__ */ React.createElement(Icon, { icon: icons.Search });
    $[3] = props.loading;
    $[4] = props.loadingLabel;
    $[5] = sds;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  let t7;
  if ($[7] !== t5 || $[8] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start srp-search-input__icon", "aria-hidden": t5 }, t6);
    $[7] = t5;
    $[8] = t6;
    $[9] = t7;
  } else {
    t7 = $[9];
  }
  const t8 = rest.enterKeyHint || "search";
  let t9;
  if ($[10] !== mergedRef || $[11] !== onChange || $[12] !== onKeyDown || $[13] !== rest || $[14] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: mergedRef, type: "search", enterKeyHint: t8, className: "srp-input__field", onChange, onKeyDown });
    $[10] = mergedRef;
    $[11] = onChange;
    $[12] = onKeyDown;
    $[13] = rest;
    $[14] = t8;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  let t10;
  if ($[16] !== clear || $[17] !== locked || $[18] !== props.clearLabel || $[19] !== rest.id || $[20] !== sds || $[21] !== text) {
    t10 = text !== "" && !locked ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, /* @__PURE__ */ React.createElement(InputAction, { className: "srp-search-input__clear", icon: icons.Close, label: props.clearLabel || sds.labels.clearSearch, "aria-controls": rest.id, onClick: clear, onMouseDown: _temp })) : null;
    $[16] = clear;
    $[17] = locked;
    $[18] = props.clearLabel;
    $[19] = rest.id;
    $[20] = sds;
    $[21] = text;
    $[22] = t10;
  } else {
    t10 = $[22];
  }
  let t11;
  if ($[23] !== props.style || $[24] !== size || $[25] !== t10 || $[26] !== t3 || $[27] !== t7 || $[28] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("span", { className: t3, style: props.style, "data-component": "search-input", "data-size": size, onMouseDown: t4 }, t7, t9, t10);
    $[23] = props.style;
    $[24] = size;
    $[25] = t10;
    $[26] = t3;
    $[27] = t7;
    $[28] = t9;
    $[29] = t11;
  } else {
    t11 = $[29];
  }
  return t11;
}
function _temp(e_2) {
  return e_2.preventDefault();
}
var SearchInput = /* @__PURE__ */ named("SearchInput", SearchInputRender);
export {
  SearchInput
};
//# sourceMappingURL=SearchInput.js.map
