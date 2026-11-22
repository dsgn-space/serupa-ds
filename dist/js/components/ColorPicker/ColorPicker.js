"use client";

// src/components/ColorPicker/ColorPicker.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, omit, useLatest } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { named } from "../../internal/component.js";
import { colorName, contrastRatio, normalizeHex } from "../../internal/color.js";
import { delegateFocus, useAutoFocus, windowBlur } from "../../internal/focus.js";
import { FieldContext } from "../../internal/field.js";
import { isComposing } from "../../internal/ime.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { useFieldControl } from "../../internal/field.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import { Input } from "../Input/Input.js";
import * as icons from "../../material/builtin.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { en as words } from "./labels.js";
var OWN = {
  "aria-label": 1,
  "aria-labelledby": 1,
  swatches: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  onValueCommit: 1,
  custom: 1,
  contrastWith: 1,
  minContrast: 1,
  size: 1,
  disabled: 1,
  readOnly: 1,
  name: 1,
  className: 1,
  form: 1,
  required: 1,
  invalid: 1,
  "aria-describedby": 1,
  "aria-errormessage": 1,
  "aria-required": 1,
  "aria-invalid": 1,
  autoFocus: 1
};
var ink = (hex) => (contrastRatio(hex, "#ffffff") || 0) >= (contrastRatio(hex, "#000000") || 0) ? "#ffffff" : "#000000";
function ColorPickerRender(t0) {
  const $ = _c(80);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("ColorPicker", NAME_HOW.group);
  props = useFieldControl(props);
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const sds = useSettings(words);
  const locale = useLocale();
  let t2;
  if ($[0] !== sds) {
    t2 = (s) => {
      const sw = typeof s === "string" ? {
        value: s,
        label: ""
      } : s;
      const value = normalizeHex(sw.value) || sw.value;
      if (sw.label) {
        return {
          value,
          label: sw.label,
          named: true
        };
      }
      const c = colorName(value);
      return {
        value,
        label: c ? sds.labels.colorName(c.hue, c.tone) : value,
        named: false
      };
    };
    $[0] = sds;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const swatches = (props.swatches || []).map(t2);
  const base = domId("srp-cp", React.useId());
  const root = React.useRef(null);
  const [held, setOwn, controlled] = useControllable(props.value, normalizeHex(props.defaultValue || ""), "ColorPicker", "value");
  let t3;
  if ($[2] !== controlled || $[3] !== held) {
    t3 = controlled ? normalizeHex(held || "") : held;
    $[2] = controlled;
    $[3] = held;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const value_0 = t3;
  const disabled = !!props.disabled;
  const readOnly = !!props.readOnly;
  const custom = props.custom !== false;
  const truthy = _temp;
  const required = !!props.required || truthy(props["aria-required"]);
  const [missing, setMissing] = React.useState(false);
  if (missing && value_0) {
    setMissing(false);
  }
  const invalid = !!props.invalid || truthy(props["aria-invalid"]) || missing;
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const t4 = value_0 || "";
  let t5;
  if ($[5] !== t4) {
    t5 = t4.replace("#", "");
    $[5] = t4;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const [text, setText] = React.useState(t5);
  const typing = React.useRef(false);
  const [tried, setTried] = React.useState(false);
  let t6;
  if ($[7] !== text || $[8] !== tried) {
    t6 = text !== "" && !(text.length > 6 && normalizeHex(text)) && (/[^0-9a-f]/i.test(text) || text.length > 6 || tried && !normalizeHex(text));
    $[7] = text;
    $[8] = tried;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  const bad = t6;
  let t7;
  let t8;
  if ($[10] !== value_0) {
    t7 = () => {
      if (!typing.current) {
        setText((value_0 || "").replace("#", ""));
      }
    };
    t8 = [value_0];
    $[10] = value_0;
    $[11] = t7;
    $[12] = t8;
  } else {
    t7 = $[11];
    t8 = $[12];
  }
  React.useEffect(t7, t8);
  const fieldLabel = useFieldLabel(props.id);
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? void 0 : fieldLabel);
  const committed = React.useRef(value_0);
  const commit = (v_0) => {
    if (v_0 === committed.current) {
      return;
    }
    committed.current = v_0;
    if (props.onValueCommit) {
      props.onValueCommit(v_0);
    }
  };
  const commitRef = useLatest(commit);
  const hidden = React.useRef(null);
  useFormReset(props.name ? hidden : root, () => {
    if (!controlled) {
      const d = normalizeHex(props.defaultValue || "");
      setOwn(d);
      committed.current = d;
    }
  }, props.form);
  const choose = (hex, focus, t9) => {
    const final = t9 === void 0 ? true : t9;
    if (disabled || readOnly) {
      return;
    }
    const v_1 = normalizeHex(hex);
    if (!v_1) {
      return;
    }
    if (!controlled) {
      setOwn(v_1);
    }
    if (v_1 !== value_0 && props.onValueChange) {
      props.onValueChange(v_1);
    }
    if (final) {
      commit(v_1);
    }
    if (focus && root.current) {
      const b = root.current.querySelector(`.srp-color-picker__swatch[data-value="${v_1}"]`);
      if (b) {
        b.focus();
      }
    }
  };
  const chooseRef = useLatest(choose);
  const valueRef = useLatest(value_0);
  const native = React.useRef(null);
  let t10;
  if ($[13] !== chooseRef || $[14] !== commitRef || $[15] !== valueRef) {
    t10 = () => {
      const el = native.current;
      if (!el) {
        return;
      }
      let moved = false;
      const on = () => {
        moved = false;
        const v_2 = normalizeHex(el.value);
        if (v_2) {
          commitRef.current(v_2);
        }
      };
      const input = () => {
        moved = true;
        if (valueRef.current === null && el.value === "#000000") {
          chooseRef.current(el.value, false, false);
        }
      };
      const blur = () => {
        if (moved) {
          on();
        }
      };
      el.addEventListener("change", on);
      el.addEventListener("input", input);
      el.addEventListener("blur", blur);
      return () => {
        el.removeEventListener("change", on);
        el.removeEventListener("input", input);
        el.removeEventListener("blur", blur);
      };
    };
    $[13] = chooseRef;
    $[14] = commitRef;
    $[15] = valueRef;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  let t11;
  if ($[17] !== chooseRef || $[18] !== commitRef || $[19] !== custom || $[20] !== valueRef) {
    t11 = [custom, chooseRef, commitRef, valueRef];
    $[17] = chooseRef;
    $[18] = commitRef;
    $[19] = custom;
    $[20] = valueRef;
    $[21] = t11;
  } else {
    t11 = $[21];
  }
  React.useEffect(t10, t11);
  let t12;
  if ($[22] !== value_0) {
    t12 = (s_0) => s_0.value === value_0;
    $[22] = value_0;
    $[23] = t12;
  } else {
    t12 = $[23];
  }
  const picked = swatches.findIndex(t12);
  const tabStop = picked >= 0 ? picked : 0;
  const onKeyDown = (e) => {
    if (e.defaultPrevented || readOnly || !swatches.length || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const i = swatches.findIndex((s_1) => s_1.value === e.currentTarget.dataset.value);
    let n;
    bb210: switch (e.key) {
      case "ArrowRight": {
        n = i + (rtl ? -1 : 1);
        break bb210;
      }
      case "ArrowDown": {
        n = i + 1;
        break bb210;
      }
      case "ArrowLeft": {
        n = i + (rtl ? 1 : -1);
        break bb210;
      }
      case "ArrowUp": {
        n = i - 1;
        break bb210;
      }
      case "Home": {
        n = 0;
        break bb210;
      }
      case "End": {
        n = swatches.length - 1;
        break bb210;
      }
      default: {
        return;
      }
    }
    e.preventDefault();
    const s_2 = swatches[(n + swatches.length) % swatches.length];
    if (s_2) {
      choose(s_2.value, true);
    }
  };
  let t13;
  if ($[24] !== tabStop) {
    t13 = (e_0) => {
      e_0.preventDefault();
      setMissing(true);
      const form = e_0.currentTarget.form;
      const first = form ? Array.from(form.elements).find(_temp2) : e_0.currentTarget;
      const b_0 = root.current?.querySelectorAll(".srp-color-picker__swatch")[tabStop];
      if (first === e_0.currentTarget && b_0) {
        b_0.focus();
      }
    };
    $[24] = tabStop;
    $[25] = t13;
  } else {
    t13 = $[25];
  }
  const onInvalid = t13;
  const ratio = props.contrastWith && value_0 ? contrastRatio(value_0, props.contrastWith) : null;
  const min = props.minContrast && props.minContrast > 1 ? props.minContrast : 4.5;
  let t14;
  if ($[26] !== locale) {
    t14 = (n_0) => numberFormat(locale, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(Math.floor(n_0 * 10) / 10);
    $[26] = locale;
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  const fmt = t14;
  const low = ratio != null && ratio < min;
  let t15;
  if ($[28] !== tabStop) {
    t15 = () => root.current && root.current.querySelectorAll(".srp-color-picker__swatch")[tabStop];
    $[28] = tabStop;
    $[29] = t15;
  } else {
    t15 = $[29];
  }
  useAutoFocus(props.autoFocus, t15);
  let t16;
  if ($[30] !== restyle || $[31] !== tabStop) {
    t16 = (n_1) => {
      root.current = n_1;
      delegateFocus(n_1, () => n_1 && n_1.querySelectorAll(".srp-color-picker__swatch")[tabStop]);
      restyle(n_1);
    };
    $[30] = restyle;
    $[31] = tabStop;
    $[32] = t16;
  } else {
    t16 = $[32];
  }
  const t17 = "srp-color-picker--size-" + size;
  const t18 = disabled && "srp-color-picker--disabled";
  const t19 = readOnly && "srp-color-picker--readonly";
  const t20 = props;
  let t21;
  if ($[33] !== t17 || $[34] !== t18 || $[35] !== t19 || $[36] !== t20.className) {
    t21 = cn("srp-color-picker", t17, t18, t19, t20.className);
    $[33] = t17;
    $[34] = t18;
    $[35] = t19;
    $[36] = t20.className;
    $[37] = t21;
  } else {
    t21 = $[37];
  }
  const t22 = "color-picker";
  const t23 = props["aria-label"];
  const t24 = disabled || void 0;
  const t25 = readOnly || void 0;
  const t26 = props["aria-describedby"];
  const t27 = required || void 0;
  const t28 = invalid || void 0;
  const t29 = invalid ? props["aria-errormessage"] : void 0;
  const t30 = swatches.map((s_3, i_0) => {
    const on_0 = s_3.value === value_0;
    const r = props.contrastWith ? contrastRatio(s_3.value, props.contrastWith) : null;
    const weak = r != null && r < min;
    const why = r != null ? sds.labels.contrast(fmt(r)) + (weak ? ", " + sds.labels.lowContrast(fmt(min)) : "") : "";
    return /* @__PURE__ */ React.createElement("button", { key: s_3.value + i_0, type: "button", role: "radio", "aria-checked": on_0, "aria-label": s_3.label, title: s_3.named ? s_3.label : s_3.value, "data-value": s_3.value, "aria-describedby": why ? base + "-" + i_0 : void 0, "data-low-contrast": weak ? "" : void 0, className: cn("srp-color-picker__swatch", on_0 && "srp-color-picker__swatch--checked", weak && "srp-color-picker__swatch--low"), style: {
      "--srp-swatch": s_3.value,
      "--srp-swatch-ink": ink(s_3.value)
    }, tabIndex: i_0 === tabStop ? 0 : -1, disabled, onClick: () => choose(s_3.value), onKeyDown }, on_0 ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-color-picker__check" }) : null, why ? /* @__PURE__ */ React.createElement("span", { hidden: true, id: base + "-" + i_0 }, why) : null);
  });
  let t31;
  if ($[38] !== labelledBy || $[39] !== nameRef || $[40] !== t23 || $[41] !== t24 || $[42] !== t25 || $[43] !== t26 || $[44] !== t27 || $[45] !== t28 || $[46] !== t29 || $[47] !== t30) {
    t31 = /* @__PURE__ */ React.createElement("div", { ref: nameRef, role: "radiogroup", className: "srp-color-picker__swatches", "aria-label": t23, "aria-labelledby": labelledBy, "aria-disabled": t24, "aria-readonly": t25, "aria-describedby": t26, "aria-required": t27, "aria-invalid": t28, "aria-errormessage": t29 }, t30);
    $[38] = labelledBy;
    $[39] = nameRef;
    $[40] = t23;
    $[41] = t24;
    $[42] = t25;
    $[43] = t26;
    $[44] = t27;
    $[45] = t28;
    $[46] = t29;
    $[47] = t30;
    $[48] = t31;
  } else {
    t31 = $[48];
  }
  let t32;
  if ($[49] !== bad || $[50] !== choose || $[51] !== custom || $[52] !== disabled || $[53] !== readOnly || $[54] !== sds || $[55] !== size || $[56] !== text || $[57] !== value_0) {
    t32 = custom ? /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, /* @__PURE__ */ React.createElement("div", { className: "srp-color-picker__custom" }, /* @__PURE__ */ React.createElement("input", { ref: native, type: "color", className: "srp-color-picker__native", "aria-label": sds.labels.customColor, value: value_0 || "#000000", disabled, "data-empty": value_0 ? void 0 : "", onClick: readOnly ? _temp3 : void 0, onKeyDown: readOnly ? _temp4 : void 0, onChange: (e_3) => choose(e_3.target.value, false, false) }), /* @__PURE__ */ React.createElement(Input, { size: size === "lg" ? "lg" : "sm", className: "srp-color-picker__hex", "aria-label": sds.labels.hexCode, value: text, disabled, readOnly, maxLength: 7, spellCheck: false, autoCorrect: "off", autoCapitalize: "off", autoComplete: "off", startIcon: /* @__PURE__ */ React.createElement("span", { className: "srp-color-picker__hash" }, "#"), "aria-invalid": bad || void 0, onFocus: () => {
      typing.current = true;
    }, onChange: (e_4) => {
      const t = e_4.target.value.replace(/^#/, "");
      setText(t);
      setTried(false);
      const v_3 = normalizeHex(t);
      if (v_3 && t.length === 6) {
        choose(v_3, false, false);
      }
    }, onPaste: (e_5) => {
      const t_0 = e_5.clipboardData.getData("text").trim().replace(/^#/, "");
      const v_4 = normalizeHex(t_0);
      if (!v_4) {
        return;
      }
      e_5.preventDefault();
      setTried(false);
      const plain = /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(t_0);
      setText(plain ? t_0 : v_4.slice(1));
      if (t_0.length !== 3) {
        choose(v_4, false, false);
      }
    }, onBlur: (e_6) => {
      if (windowBlur(e_6)) {
        return;
      }
      typing.current = false;
      setTried(false);
      const v_5 = normalizeHex(text);
      if (v_5) {
        choose(v_5);
      }
      setText((value_0 || "").replace("#", ""));
    }, onKeyDown: (e_7) => {
      if (e_7.key === "Enter" && !isComposing(e_7)) {
        const v_6 = normalizeHex(text);
        if (v_6) {
          choose(v_6);
          setText(v_6.slice(1));
        } else {
          setTried(true);
        }
      }
    } }))) : null;
    $[49] = bad;
    $[50] = choose;
    $[51] = custom;
    $[52] = disabled;
    $[53] = readOnly;
    $[54] = sds;
    $[55] = size;
    $[56] = text;
    $[57] = value_0;
    $[58] = t32;
  } else {
    t32 = $[58];
  }
  const t33 = props.contrastWith ? /* @__PURE__ */ React.createElement("div", { className: cn("srp-color-picker__contrast", low && "srp-color-picker__contrast--low"), "aria-live": "polite" }, ratio != null ? /* @__PURE__ */ React.createElement(React.Fragment, null, low ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning, className: "srp-color-picker__warning" }) : null, /* @__PURE__ */ React.createElement("span", null, sds.labels.contrast(fmt(ratio)), low ? ", " + sds.labels.lowContrast(fmt(min)) : "")) : null) : null;
  let t34;
  if ($[59] !== disabled || $[60] !== onInvalid || $[61] !== props.form || $[62] !== required || $[63] !== value_0) {
    t34 = required ? /* @__PURE__ */ React.createElement("input", { className: "srp-color-picker__validity", tabIndex: -1, "aria-hidden": true, required: true, value: value_0 || "", onChange: _temp5, disabled, form: props.form, onInvalid }) : null;
    $[59] = disabled;
    $[60] = onInvalid;
    $[61] = props.form;
    $[62] = required;
    $[63] = value_0;
    $[64] = t34;
  } else {
    t34 = $[64];
  }
  let t35;
  if ($[65] !== disabled || $[66] !== props.form || $[67] !== props.name || $[68] !== value_0) {
    t35 = props.name ? /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", name: props.name, form: props.form, value: value_0 || "", disabled }) : null;
    $[65] = disabled;
    $[66] = props.form;
    $[67] = props.name;
    $[68] = value_0;
    $[69] = t35;
  } else {
    t35 = $[69];
  }
  let t36;
  if ($[70] !== rest || $[71] !== size || $[72] !== t16 || $[73] !== t21 || $[74] !== t31 || $[75] !== t32 || $[76] !== t33 || $[77] !== t34 || $[78] !== t35) {
    t36 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: t16, className: t21, "data-component": t22, "data-size": size }, t31, t32, t33, t34, t35);
    $[70] = rest;
    $[71] = size;
    $[72] = t16;
    $[73] = t21;
    $[74] = t31;
    $[75] = t32;
    $[76] = t33;
    $[77] = t34;
    $[78] = t35;
    $[79] = t36;
  } else {
    t36 = $[79];
  }
  return t36;
}
function _temp5() {
}
function _temp4(e_2) {
  if (e_2.key === "Enter" || e_2.key === " ") {
    e_2.preventDefault();
  }
}
function _temp3(e_1) {
  return e_1.preventDefault();
}
function _temp2(x) {
  return x.willValidate && !x.validity.valid;
}
function _temp(v) {
  return v === true || v === "true";
}
var ColorPicker = /* @__PURE__ */ named("ColorPicker", ColorPickerRender);
export {
  ColorPicker
};
//# sourceMappingURL=ColorPicker.js.map
