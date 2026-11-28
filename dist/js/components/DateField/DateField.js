"use client";

// src/components/DateField/DateField.tsx
import { c as _c } from "../../internal/memoCache.js";
import { dateFormat } from "../../internal/intl.js";
import * as React from "react";
import { useControlledSwitch } from "../../internal/controllable.js";
import { cn, domId, isInvalid, omit, setRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { dateOrder, parseDate, isoDate, toDay } from "../../internal/dates.js";
import { latinDigits } from "../../internal/digits.js";
import { isComposing } from "../../internal/ime.js";
import { Input } from "../Input/Input.js";
import { Select } from "../Select/Select.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var OWN = {
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  min: 1,
  max: 1,
  order: 1,
  autoComplete: 1,
  name: 1,
  form: 1,
  required: 1,
  disabled: 1,
  readOnly: 1,
  invalid: 1,
  size: 1,
  "aria-invalid": 1,
  "aria-required": 1,
  "aria-errormessage": 1,
  autoFocus: 1,
  className: 1,
  monthInput: 1
};
var NONE = {
  day: "",
  month: "",
  year: ""
};
var ORDERS = {
  dmy: ["day", "month", "year"],
  mdy: ["month", "day", "year"],
  ymd: ["year", "month", "day"]
};
var ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
var SEPARATOR = /^[/.\-\s]$/;
var partsOf = (iso) => {
  const m = ISO.exec(iso || "");
  return m ? {
    day: String(Number(m[3])),
    month: String(Number(m[2])),
    year: m[1] ?? ""
  } : NONE;
};
function read(p, min, max) {
  const t = {
    day: latinDigits(p.day).trim(),
    month: latinDigits(p.month).trim(),
    year: latinDigits(p.year).trim()
  };
  if (!t.day && !t.month && !t.year) return {
    value: "",
    problem: "empty",
    parts: ["day", "month", "year"]
  };
  const missing = ["day", "month", "year"].filter((k) => !t[k] || k === "year" && /^\d{1,3}$/.test(t.year));
  let why, at = "day";
  for (const k of ["day", "month", "year"]) {
    const v = t[k], n = +v;
    why = !v ? `missing-${k}` : !/^\d+$/.test(v) || k === "day" && (n < 1 || n > 31) || k === "month" && (n < 1 || n > 12) || k === "year" && v.length < 4 ? k : void 0;
    if (why) {
      at = k;
      break;
    }
  }
  if (missing.length) return {
    value: "",
    problem: missing.length === 3 ? "empty" : `missing-${missing[0] ?? "day"}`,
    parts: missing,
    why,
    at: [at]
  };
  const bad = ["day", "month", "year"].filter((k) => !/^\d+$/.test(t[k]) || k === "month" && (+t.month < 1 || +t.month > 12) || k === "day" && (+t.day < 1 || +t.day > 31));
  if (bad.length) return {
    value: "",
    problem: "not-a-date",
    parts: bad,
    why,
    at: [at]
  };
  const d = new Date(2e3, 0, 1);
  d.setFullYear(+t.year, +t.month - 1, +t.day);
  if (d.getMonth() !== +t.month - 1) return {
    value: "",
    problem: "not-a-date",
    parts: ["day"],
    why: "not-real",
    at: ["day"]
  };
  const value = isoDate(d);
  if (min && ISO.test(min) && value < min) return {
    value,
    problem: "before-min",
    parts: ["day", "month", "year"],
    why: "before-min",
    at: ["day", "month", "year"]
  };
  if (max && ISO.test(max) && value > max) return {
    value,
    problem: "after-max",
    parts: ["day", "month", "year"],
    why: "after-max",
    at: ["day", "month", "year"]
  };
  return {
    value,
    problem: null,
    parts: []
  };
}
function DateFieldRender(t0) {
  const $ = _c(160);
  let given;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...given
    } = t0);
    $[0] = t0;
    $[1] = given;
    $[2] = ref;
  } else {
    given = $[1];
    ref = $[2];
  }
  const props = useFieldControl(given);
  const nameRef = useNameCheck("DateField", NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  let t1;
  if ($[3] !== props) {
    t1 = omit(props, OWN);
    $[3] = props;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const rest = t1;
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const base = domId("srp-df", React.useId());
  const root = React.useRef(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset;
  const t2 = props["aria-invalid"];
  let t3;
  if ($[5] !== props.invalid || $[6] !== t2) {
    t3 = isInvalid(props.invalid, t2);
    $[5] = props.invalid;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const invalid = t3;
  let t4;
  if ($[8] !== locale) {
    t4 = dateOrder(locale).filter(_temp);
    $[8] = locale;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const own = t4;
  const order = props.order && ORDERS[props.order] ? ORDERS[props.order] : own.length === 3 ? own : ORDERS.dmy;
  const controlled = props.value !== void 0;
  useControlledSwitch(controlled, "DateField", "value");
  let t5;
  if ($[10] !== controlled || $[11] !== props.defaultValue || $[12] !== props.value) {
    t5 = () => partsOf(controlled ? props.value : props.defaultValue);
    $[10] = controlled;
    $[11] = props.defaultValue;
    $[12] = props.value;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const [parts, setParts] = React.useState(t5);
  let t6;
  if ($[14] !== parts || $[15] !== props.max || $[16] !== props.min) {
    t6 = read(parts, props.min, props.max);
    $[14] = parts;
    $[15] = props.max;
    $[16] = props.min;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  const now = t6;
  const required = !!props.required;
  const [missing, setMissing] = React.useState(false);
  if (missing && now.problem !== "empty") {
    setMissing(false);
  }
  const ariaRequired = props["aria-required"] ?? (required || void 0);
  const [checked, setChecked] = React.useState(false);
  const outer = invalid;
  let t7;
  if ($[18] !== L || $[19] !== locale || $[20] !== now.why || $[21] !== parts.month || $[22] !== parts.year || $[23] !== props.max || $[24] !== props.min) {
    bb0: {
      const why = now.why;
      if (!why) {
        t7 = "";
        break bb0;
      }
      const g = {
        calendar: "gregory",
        numberingSystem: "latn"
      };
      if (why === "not-real") {
        const m = new Date(2e3, 0, 1);
        let t83;
        if ($[26] !== parts.year) {
          t83 = latinDigits(parts.year);
          $[26] = parts.year;
          $[27] = t83;
        } else {
          t83 = $[27];
        }
        let t92;
        if ($[28] !== parts.month) {
          t92 = latinDigits(parts.month);
          $[28] = parts.month;
          $[29] = t92;
        } else {
          t92 = $[29];
        }
        m.setFullYear(+t83, +t92 - 1, 1);
        t7 = L.dateFieldError(why, dateFormat(locale, {
          ...g,
          month: "long",
          year: "numeric"
        }).format(m), new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate());
        break bb0;
      }
      if (why === "before-min" || why === "after-max") {
        const at = toDay(why === "before-min" ? props.min : props.max);
        t7 = L.dateFieldError(why, at ? dateFormat(locale, {
          ...g,
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(at) : void 0);
        break bb0;
      }
      let t82;
      if ($[30] !== L || $[31] !== why) {
        t82 = L.dateFieldError(why);
        $[30] = L;
        $[31] = why;
        $[32] = t82;
      } else {
        t82 = $[32];
      }
      t7 = t82;
    }
    $[18] = L;
    $[19] = locale;
    $[20] = now.why;
    $[21] = parts.month;
    $[22] = parts.year;
    $[23] = props.max;
    $[24] = props.min;
    $[25] = t7;
  } else {
    t7 = $[25];
  }
  const message = t7;
  const said = checked && !outer && message ? message : "";
  const want = props.value;
  let t8;
  let t9;
  if ($[33] !== now.value || $[34] !== want) {
    t8 = () => {
      if (want === void 0 || want === now.value) {
        return;
      }
      if (want === "" && !now.value) {
        return;
      }
      setParts(partsOf(want));
    };
    t9 = [want, now.value];
    $[33] = now.value;
    $[34] = want;
    $[35] = t8;
    $[36] = t9;
  } else {
    t8 = $[35];
    t9 = $[36];
  }
  React.useLayoutEffect(t8, t9);
  let t10;
  if ($[37] !== props) {
    const tell = (p, reason) => {
      if (!props.onValueChange) {
        return;
      }
      const r = read(p, props.min, props.max);
      props.onValueChange(r.value, {
        day: p.day,
        month: p.month,
        year: p.year,
        problem: r.problem,
        parts: r.parts,
        reason
      });
    };
    t10 = (p_0, reason_0) => {
      setParts(p_0);
      tell(p_0, reason_0);
    };
    $[37] = props;
    $[38] = t10;
  } else {
    t10 = $[38];
  }
  const change = t10;
  let t11;
  if ($[39] !== change || $[40] !== controlled || $[41] !== props.defaultValue) {
    t11 = () => {
      if (controlled) {
        return;
      }
      change(partsOf(props.defaultValue), "reset");
    };
    $[39] = change;
    $[40] = controlled;
    $[41] = props.defaultValue;
    $[42] = t11;
  } else {
    t11 = $[42];
  }
  useFormReset(root, t11, props.form);
  let t12;
  if ($[43] !== base) {
    t12 = (k_0) => root.current && root.current.querySelector(`#${base}-${k_0}`);
    $[43] = base;
    $[44] = t12;
  } else {
    t12 = $[44];
  }
  const box = t12;
  let t13;
  if ($[45] !== box || $[46] !== order[0]) {
    t13 = () => box(order[0] ?? "day");
    $[45] = box;
    $[46] = order[0];
    $[47] = t13;
  } else {
    t13 = $[47];
  }
  const firstBox = t13;
  useAutoFocus(props.autoFocus, firstBox);
  let t14;
  if ($[48] !== box || $[49] !== order || $[50] !== parts) {
    t14 = (k_1) => (e) => {
      if (isComposing(e) || !SEPARATOR.test(e.key)) {
        return;
      }
      const i = order.indexOf(k_1);
      const next = order[i + 1];
      e.preventDefault();
      if (next && parts[k_1].trim()) {
        box(next)?.focus();
      }
    };
    $[48] = box;
    $[49] = order;
    $[50] = parts;
    $[51] = t14;
  } else {
    t14 = $[51];
  }
  const onKeyDown = t14;
  let t15;
  if ($[52] !== box || $[53] !== change || $[54] !== locale || $[55] !== order || $[56] !== props.readOnly) {
    t15 = (e_0) => {
      if (props.readOnly) {
        return;
      }
      const text = e_0.clipboardData.getData("text");
      if (!/\d\D+\d|^\s*\d{8}\s*$|\p{L}{3}/u.test(text)) {
        return;
      }
      const d = parseDate(text, locale);
      if (!d) {
        return;
      }
      e_0.preventDefault();
      change(partsOf(isoDate(d)), "paste");
      box(order[order.length - 1] ?? "year")?.focus();
    };
    $[52] = box;
    $[53] = change;
    $[54] = locale;
    $[55] = order;
    $[56] = props.readOnly;
    $[57] = t15;
  } else {
    t15 = $[57];
  }
  const onPaste = t15;
  let t16;
  if ($[58] !== invalid || $[59] !== missing || $[60] !== now.at || $[61] !== now.parts || $[62] !== order || $[63] !== said) {
    t16 = invalid || missing ? now.parts.length ? now.parts : order : said ? now.at ?? [] : [];
    $[58] = invalid;
    $[59] = missing;
    $[60] = now.at;
    $[61] = now.parts;
    $[62] = order;
    $[63] = said;
    $[64] = t16;
  } else {
    t16 = $[64];
  }
  const marked = t16;
  const digits = _temp2;
  const firstWrong = now.at && now.at[0] || null;
  let t17;
  if ($[65] !== firstBox || $[66] !== message) {
    t17 = () => {
      const b = firstBox();
      if (b && "setCustomValidity" in b) {
        b.setCustomValidity(message);
      }
    };
    $[65] = firstBox;
    $[66] = message;
    $[67] = t17;
  } else {
    t17 = $[67];
  }
  React.useEffect(t17);
  let t18;
  if ($[68] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t18 = () => {
      if (!pressed.current) {
        setChecked(true);
        return;
      }
      const later = () => {
        window.removeEventListener("click", later, true);
        window.removeEventListener("pointercancel", later, true);
        setTimeout(() => setChecked(true));
      };
      window.addEventListener("click", later, true);
      window.addEventListener("pointercancel", later, true);
    };
    $[68] = t18;
  } else {
    t18 = $[68];
  }
  const check = t18;
  const pressed = React.useRef(false);
  let t19;
  let t20;
  if ($[69] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t19 = () => {
      const down = () => {
        pressed.current = true;
      };
      const up = () => {
        pressed.current = false;
      };
      window.addEventListener("pointerdown", down, true);
      window.addEventListener("click", up, true);
      return () => {
        window.removeEventListener("pointerdown", down, true);
        window.removeEventListener("click", up, true);
      };
    };
    t20 = [];
    $[69] = t19;
    $[70] = t20;
  } else {
    t19 = $[69];
    t20 = $[70];
  }
  React.useEffect(t19, t20);
  let t21;
  if ($[71] !== box || $[72] !== firstBox || $[73] !== firstWrong || $[74] !== now.problem) {
    t21 = (e_1) => {
      e_1.preventDefault();
      setChecked(true);
      if (now.problem === "empty") {
        setMissing(true);
        firstBox()?.focus();
      } else {
        if (firstWrong) {
          box(firstWrong)?.focus();
        }
      }
    };
    $[71] = box;
    $[72] = firstBox;
    $[73] = firstWrong;
    $[74] = now.problem;
    $[75] = t21;
  } else {
    t21 = $[75];
  }
  const onInvalid = t21;
  const errorId = base + "-error";
  let t22;
  if ($[76] !== locale) {
    const f = dateFormat(locale, {
      month: "long"
    });
    t22 = Array.from({
      length: 12
    }, (_, i_0) => ({
      value: String(i_0 + 1),
      label: f.format(new Date(2e3, i_0, 1))
    }));
    $[76] = locale;
    $[77] = t22;
  } else {
    t22 = $[77];
  }
  const months = t22;
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  let t23;
  if ($[78] !== L.dateFieldDay || $[79] !== L.dateFieldMonth || $[80] !== L.dateFieldYear) {
    t23 = {
      day: L.dateFieldDay,
      month: L.dateFieldMonth,
      year: L.dateFieldYear
    };
    $[78] = L.dateFieldDay;
    $[79] = L.dateFieldMonth;
    $[80] = L.dateFieldYear;
    $[81] = t23;
  } else {
    t23 = $[81];
  }
  const label = t23;
  let t24;
  if ($[82] !== firstBox || $[83] !== nameRef || $[84] !== ref) {
    t24 = (n) => {
      root.current = n;
      delegateFocus(n, firstBox);
      setRef(ref, n);
      nameRef(n);
    };
    $[82] = firstBox;
    $[83] = nameRef;
    $[84] = ref;
    $[85] = t24;
  } else {
    t24 = $[85];
  }
  let t25;
  if ($[86] !== errorId || $[87] !== props || $[88] !== said) {
    t25 = cn(props["aria-describedby"], said && errorId) || void 0;
    $[86] = errorId;
    $[87] = props;
    $[88] = said;
    $[89] = t25;
  } else {
    t25 = $[89];
  }
  let t26;
  if ($[90] !== parts.day || $[91] !== parts.month || $[92] !== parts.year) {
    t26 = (e_2) => {
      if (!(e_2.relatedTarget instanceof Node && e_2.currentTarget.contains(e_2.relatedTarget)) && (parts.day || parts.month || parts.year)) {
        check();
      }
    };
    $[90] = parts.day;
    $[91] = parts.month;
    $[92] = parts.year;
    $[93] = t26;
  } else {
    t26 = $[93];
  }
  const t27 = disabled && "srp-date-field--disabled";
  let t28;
  if ($[94] !== props.className || $[95] !== t27) {
    t28 = cn("srp-date-field", t27, props.className);
    $[94] = props.className;
    $[95] = t27;
    $[96] = t28;
  } else {
    t28 = $[96];
  }
  const t29 = disabled ? "" : void 0;
  let t30;
  if ($[97] !== L.dateFieldMonth || $[98] !== ariaRequired || $[99] !== base || $[100] !== change || $[101] !== disabled || $[102] !== errorId || $[103] !== label || $[104] !== marked || $[105] !== months || $[106] !== onInvalid || $[107] !== onKeyDown || $[108] !== onPaste || $[109] !== order || $[110] !== parts || $[111] !== props.autoComplete || $[112] !== props.monthInput || $[113] !== props.readOnly || $[114] !== props.size || $[115] !== required || $[116] !== said) {
    let t312;
    if ($[118] !== L.dateFieldMonth || $[119] !== ariaRequired || $[120] !== base || $[121] !== change || $[122] !== disabled || $[123] !== errorId || $[124] !== label || $[125] !== marked || $[126] !== months || $[127] !== onInvalid || $[128] !== onKeyDown || $[129] !== onPaste || $[130] !== order[0] || $[131] !== parts || $[132] !== props.autoComplete || $[133] !== props.monthInput || $[134] !== props.readOnly || $[135] !== props.size || $[136] !== required || $[137] !== said) {
      t312 = (k_3) => /* @__PURE__ */ React.createElement("div", { key: k_3, className: cn("srp-date-field__part", "srp-date-field__part--" + k_3) }, /* @__PURE__ */ React.createElement("label", { className: "srp-date-field__label", htmlFor: `${base}-${k_3}` }, label[k_3]), k_3 === "month" && props.monthInput === "select" ? /* @__PURE__ */ React.createElement(Select, { id: `${base}-${k_3}`, className: "srp-date-field__input srp-date-field__input--select", size: props.size, options: months, placeholder: L.dateFieldMonth, autoComplete: props.autoComplete === "bday" ? "bday-month" : "off", value: parts.month, disabled, readOnly: props.readOnly, required: k_3 === order[0] && required, onInvalid: k_3 === order[0] ? onInvalid : void 0, invalid: marked.includes(k_3) || void 0, "aria-required": ariaRequired, "aria-describedby": marked.includes(k_3) && said ? errorId : void 0, onChange: (e_3) => change({
        ...parts,
        month: e_3.target.value
      }, "type") }) : /* @__PURE__ */ React.createElement(Input, { id: `${base}-${k_3}`, className: "srp-date-field__input", size: props.size, inputMode: "numeric", spellCheck: false, autoComplete: props.autoComplete === "bday" ? `bday-${k_3}` : "off", maxLength: k_3 === "year" ? 4 : 2, value: parts[k_3], disabled, readOnly: props.readOnly, invalid: marked.includes(k_3) || void 0, "aria-required": ariaRequired, "aria-describedby": marked.includes(k_3) && said ? errorId : void 0, required: k_3 === order[0] && required, onInvalid: k_3 === order[0] ? onInvalid : void 0, onChange: (e_4) => change({
        ...parts,
        [k_3]: digits(k_3, e_4.target.value)
      }, "type"), onKeyDown: onKeyDown(k_3), onPaste }));
      $[118] = L.dateFieldMonth;
      $[119] = ariaRequired;
      $[120] = base;
      $[121] = change;
      $[122] = disabled;
      $[123] = errorId;
      $[124] = label;
      $[125] = marked;
      $[126] = months;
      $[127] = onInvalid;
      $[128] = onKeyDown;
      $[129] = onPaste;
      $[130] = order[0];
      $[131] = parts;
      $[132] = props.autoComplete;
      $[133] = props.monthInput;
      $[134] = props.readOnly;
      $[135] = props.size;
      $[136] = required;
      $[137] = said;
      $[138] = t312;
    } else {
      t312 = $[138];
    }
    t30 = order.map(t312);
    $[97] = L.dateFieldMonth;
    $[98] = ariaRequired;
    $[99] = base;
    $[100] = change;
    $[101] = disabled;
    $[102] = errorId;
    $[103] = label;
    $[104] = marked;
    $[105] = months;
    $[106] = onInvalid;
    $[107] = onKeyDown;
    $[108] = onPaste;
    $[109] = order;
    $[110] = parts;
    $[111] = props.autoComplete;
    $[112] = props.monthInput;
    $[113] = props.readOnly;
    $[114] = props.size;
    $[115] = required;
    $[116] = said;
    $[117] = t30;
  } else {
    t30 = $[117];
  }
  let t31;
  if ($[139] !== t30) {
    t31 = /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, t30);
    $[139] = t30;
    $[140] = t31;
  } else {
    t31 = $[140];
  }
  let t32;
  if ($[141] !== errorId || $[142] !== said) {
    t32 = said ? /* @__PURE__ */ React.createElement("div", { className: "srp-date-field__error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-date-field__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: errorId }, said)) : null;
    $[141] = errorId;
    $[142] = said;
    $[143] = t32;
  } else {
    t32 = $[143];
  }
  let t33;
  if ($[144] !== disabled || $[145] !== now.value || $[146] !== props.form || $[147] !== props.name) {
    t33 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: now.value, disabled }) : null;
    $[144] = disabled;
    $[145] = now.value;
    $[146] = props.form;
    $[147] = props.name;
    $[148] = t33;
  } else {
    t33 = $[148];
  }
  let t34;
  if ($[149] !== labelledBy || $[150] !== rest || $[151] !== t24 || $[152] !== t25 || $[153] !== t26 || $[154] !== t28 || $[155] !== t29 || $[156] !== t31 || $[157] !== t32 || $[158] !== t33) {
    t34 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: t24, role: "group", "aria-labelledby": labelledBy, "aria-describedby": t25, onBlur: t26, className: t28, "data-disabled": t29, "data-component": "date-field" }, t31, t32, t33);
    $[149] = labelledBy;
    $[150] = rest;
    $[151] = t24;
    $[152] = t25;
    $[153] = t26;
    $[154] = t28;
    $[155] = t29;
    $[156] = t31;
    $[157] = t32;
    $[158] = t33;
    $[159] = t34;
  } else {
    t34 = $[159];
  }
  return t34;
}
function _temp2(k_2, v) {
  return latinDigits(v).replace(/\D/g, "").slice(0, k_2 === "year" ? 4 : 2);
}
function _temp(k) {
  return k === "day" || k === "month" || k === "year";
}
var DateField = /* @__PURE__ */ named("DateField", DateFieldRender);
export {
  DateField
};
//# sourceMappingURL=DateField.js.map
