"use client";

// src/components/PhoneInput/PhoneInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { pressFocuses } from "../../internal/affix.js";
import { useMergedRef, cn, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { useFieldControl } from "../../internal/field.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { collatorFor } from "../../internal/collator.js";
import * as icons from "../../material/builtin.js";
import { warnOnce } from "../../internal/warn.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { latinDigits } from "../../internal/digits.js";
import { PHONE_COUNTRIES, formatNational, isPhoneComplete, parsePhone, phoneCountry, phoneOnly, stripTrunk, toE164 } from "./phone.js";
import { en as words } from "./labels.js";
import { isComposing } from "../../internal/ime.js";
var own = {
  size: 1,
  invalid: 1,
  className: 1,
  style: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  country: 1,
  defaultCountry: 1,
  onCountryChange: 1,
  countries: 1,
  countryLabel: 1,
  name: 1,
  onKeyDown: 1
};
var never = () => () => {
};
var yes = () => true;
var no = () => false;
var regionOf = (locale) => {
  try {
    return new Intl.Locale(locale).maximize().region;
  } catch {
    return void 0;
  }
};
var caretAfter = (text, n) => {
  if (n <= 0) return 0;
  for (let i = 0, seen = 0; i < text.length; i++) if (/\d/.test(text.charAt(i)) && ++seen === n) return i + 1;
  return text.length;
};
var keyedCountries = (key) => key ? JSON.parse(key) : void 0;
function PhoneInputRender(t0) {
  const $ = _c(51);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  props = useFieldControl(props);
  const nameRef = useNameCheck("PhoneInput", NAME_HOW.field);
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, own);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const {
    onCountryChange,
    onValueChange,
    onKeyDown: onKeyDownProp
  } = props;
  const countriesKey = String(props.countries ? JSON.stringify(props.countries) : "");
  let t2;
  if ($[0] !== countriesKey) {
    bb0: {
      const mine = (keyedCountries(countriesKey) || []).filter(_temp);
      if (!mine.length) {
        t2 = PHONE_COUNTRIES;
        break bb0;
      }
      const codes = new Set(mine.map(_temp2));
      t2 = mine.map(_temp3).concat(PHONE_COUNTRIES.filter((c_2) => !codes.has(c_2.code)));
    }
    $[0] = countriesKey;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const table = t2;
  let t3;
  if ($[2] !== table) {
    t3 = (code) => code ? table.find((c_3) => c_3.code === code.toUpperCase()) : void 0;
    $[2] = table;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const find = t3;
  const hydrated = React.useSyncExternalStore(never, yes, no);
  let t4;
  if ($[4] !== table) {
    t4 = (code_0) => code_0 ? table.find((c_4) => c_4.code === code_0.toUpperCase()) : void 0;
    $[4] = table;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const pick = t4;
  let t5;
  if ($[6] !== countriesKey || $[7] !== locale || $[8] !== pick || $[9] !== table) {
    const countries = keyedCountries(countriesKey);
    const picked = countries ? countries.map((c_5) => pick(typeof c_5 === "string" ? c_5 : c_5 && c_5.code)).filter(_temp4) : table.slice();
    const order = collatorFor(locale);
    let names;
    try {
      names = new Intl.DisplayNames([locale], {
        type: "region"
      });
    } catch {
      names = void 0;
    }
    t5 = picked.map((c_7) => ({
      c: c_7,
      name: names && names.of(c_7.code) || c_7.code
    })).sort((a, b) => order.compare(a.name, b.name));
    $[6] = countriesKey;
    $[7] = locale;
    $[8] = pick;
    $[9] = table;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const list = t5;
  const fallback = find(props.defaultCountry) || find(regionOf(locale)) || find("US") || phoneCountry("US");
  const start = parsePhone(props.value ?? props.defaultValue ?? "", props.country ?? props.defaultCountry, table);
  const [ownCountry, setOwnCountry] = React.useState(() => start ? start.country.code : fallback.code);
  const country = find(props.country) || find(ownCountry) || fallback;
  const [national, setNational] = React.useState(() => start ? start.national : "");
  const [lead, setLead] = React.useState(null);
  const [typed, setTyped] = React.useState(national);
  const [reported, setReported] = React.useState(() => start ? toE164(start.national, start.country) : "");
  let shown = national;
  if (props.value !== void 0 && props.value !== reported) {
    const p = parsePhone(props.value, country.code, table);
    shown = p ? p.national : "";
    setReported(props.value);
    if (shown !== national) {
      setNational(shown);
      setTyped(shown);
    }
    if (p && p.country.code !== country.code && props.country === void 0) {
      setOwnCountry(p.country.code);
    }
  }
  const input = React.useRef(null);
  const setRef = useMergedRef(ref, nameRef, input);
  const [, rerender] = React.useState(0);
  useFormReset(input, () => {
    setLead(null);
    if (props.value === void 0) {
      const d = parsePhone(props.defaultValue ?? "", props.defaultCountry, table);
      setNational(d ? d.national : "");
      setTyped(d ? d.national : "");
      if (props.country === void 0) {
        setOwnCountry(d ? d.country.code : fallback.code);
      }
      setReported(d ? toE164(d.national, d.country) : "");
    }
    rerender(_temp5);
    setTimeout(() => rerender(_temp6), 0);
  });
  const select = React.useRef(null);
  React.useLayoutEffect(function() {
    if (select.current && select.current.value !== country.code) {
      select.current.value = country.code;
    }
  });
  const caret = React.useRef(null);
  const text = lead != null && !shown ? lead : formatNational(shown, country);
  let t6;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = function() {
      if (caret.current == null || !input.current || activeIn(input.current) !== input.current) {
        return;
      }
      input.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    };
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  React.useLayoutEffect(t6);
  const commit = function(digits, c_8, picked_0) {
    digits = digits.slice(0, c_8.max);
    setLead(null);
    if (!picked_0) {
      setTyped(digits);
    }
    setNational(digits);
    if (c_8.code !== country.code) {
      if (props.country === void 0) {
        setOwnCountry(c_8.code);
      }
      onCountryChange?.(c_8.code);
    }
    const e164 = toE164(digits, c_8);
    if (e164 !== reported || c_8.code !== country.code) {
      setReported(e164);
      onValueChange?.(e164, {
        country: c_8.code,
        national: digits,
        complete: isPhoneComplete(digits, c_8)
      });
    }
    return digits;
  };
  const onChange = function(e) {
    const raw = phoneOnly(latinDigits(e.target.value.normalize("NFKC")));
    const at = Math.min(e.target.selectionStart ?? raw.length, raw.length);
    let before = raw.slice(0, at).replace(/\D/g, "").length;
    if (raw.trim() === "0") {
      commit("", country);
      setLead("0");
      caret.current = 1;
      return;
    }
    if (/^\s*(\+|00)/.test(raw)) {
      const p_0 = parsePhone(raw, country.code, table);
      if (p_0) {
        const d_0 = commit(p_0.national, p_0.country);
        caret.current = formatNational(d_0, p_0.country).length;
        return;
      }
      const code_1 = raw.trim();
      if (/^(\+|00)\d{0,3}$/.test(code_1)) {
        commit("", country);
        setLead(code_1);
        caret.current = code_1.length;
        return;
      }
      if (process.env.NODE_ENV !== "production" && raw.replace(/\D/g, "").length > 3) {
        warnOnce("phone-code", `PhoneInput: "${raw.trim()}" starts with a calling code PhoneInput doesn't know, so its digits are read as a number in ${country.code}. Pass the country's row in countries.`);
      }
    }
    const all = raw.replace(/\D/g, "");
    let digits_0 = stripTrunk(all, country);
    if (digits_0.length > country.max && all.startsWith(country.dial)) {
      digits_0 = stripTrunk(all.slice(country.dial.length), country);
    }
    if (digits_0.length < all.length) {
      before = Math.max(0, before - (all.length - digits_0.length));
    }
    const d_1 = commit(digits_0, country);
    caret.current = caretAfter(formatNational(d_1, country), Math.min(before, d_1.length));
  };
  const onKeyDown = function(e_0) {
    onKeyDownProp?.(e_0);
    const el = e_0.currentTarget;
    const s = el.selectionStart;
    const end = el.selectionEnd;
    if (e_0.defaultPrevented || el.readOnly || isComposing(e_0) || e_0.altKey || e_0.ctrlKey || e_0.metaKey || s == null || s !== end || e_0.key !== "Backspace" && e_0.key !== "Delete") {
      return;
    }
    const back = e_0.key === "Backspace";
    let i = back ? s - 1 : s;
    if (i < 0 || i >= text.length || /\d/.test(text.charAt(i))) {
      return;
    }
    while (i >= 0 && i < text.length && !/\d/.test(text.charAt(i))) {
      i = i + (back ? -1 : 1);
    }
    if (i < 0 || i >= text.length) {
      return;
    }
    e_0.preventDefault();
    const n_1 = text.slice(0, i).replace(/\D/g, "").length;
    commit(shown.slice(0, n_1) + shown.slice(n_1 + 1), country);
    caret.current = caretAfter(formatNational(shown.slice(0, n_1) + shown.slice(n_1 + 1), country), n_1);
  };
  const onCountry = function(e_1) {
    const c_9 = find(e_1.target.value);
    if (c_9) {
      commit(typed, c_9, true);
    }
  };
  let t7;
  if ($[12] !== hydrated || $[13] !== list) {
    let t82;
    if ($[15] !== hydrated) {
      t82 = (t92) => {
        const {
          c: c_10,
          name
        } = t92;
        return /* @__PURE__ */ React.createElement("option", { key: (hydrated ? "" : "server-") + c_10.code, value: c_10.code, suppressHydrationWarning: true }, name + " (\u2066+" + c_10.dial + "\u2069)");
      };
      $[15] = hydrated;
      $[16] = t82;
    } else {
      t82 = $[16];
    }
    t7 = list.map(t82);
    $[12] = hydrated;
    $[13] = list;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  const options = t7;
  const t8 = cn("srp-input srp-phone-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className);
  let t9;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = (e_2) => pressFocuses(input)(e_2);
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  let t10;
  if ($[18] !== country.dial) {
    t10 = /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__dial", "aria-hidden": true }, "+", country.dial);
    $[18] = country.dial;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-phone-input__chevron" });
    $[20] = t11;
  } else {
    t11 = $[20];
  }
  const t12 = rest.disabled || rest.readOnly;
  const t13 = props.countryLabel || sds.labels.country;
  let t14;
  if ($[21] !== country.code || $[22] !== onCountry || $[23] !== options || $[24] !== select || $[25] !== t12 || $[26] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("select", { ref: select, className: "srp-phone-input__select", value: country.code, onChange: onCountry, disabled: t12, "aria-label": t13 }, options);
    $[21] = country.code;
    $[22] = onCountry;
    $[23] = options;
    $[24] = select;
    $[25] = t12;
    $[26] = t13;
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  let t15;
  if ($[28] !== t10 || $[29] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__country" }, t10, t11, t14);
    $[28] = t10;
    $[29] = t14;
    $[30] = t15;
  } else {
    t15 = $[30];
  }
  const t16 = invalid || rest["aria-invalid"];
  let t17;
  if ($[31] !== onChange || $[32] !== onKeyDown || $[33] !== rest || $[34] !== setRef || $[35] !== t16 || $[36] !== text) {
    t17 = /* @__PURE__ */ React.createElement("input", { autoComplete: "tel", ...rest, "aria-invalid": t16, ref: setRef, type: "tel", inputMode: "tel", className: "srp-input__field", value: text, onChange, onKeyDown });
    $[31] = onChange;
    $[32] = onKeyDown;
    $[33] = rest;
    $[34] = setRef;
    $[35] = t16;
    $[36] = text;
    $[37] = t17;
  } else {
    t17 = $[37];
  }
  let t18;
  if ($[38] !== country || $[39] !== props.form || $[40] !== props.name || $[41] !== rest.disabled || $[42] !== shown) {
    t18 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: toE164(shown, country), disabled: rest.disabled }) : null;
    $[38] = country;
    $[39] = props.form;
    $[40] = props.name;
    $[41] = rest.disabled;
    $[42] = shown;
    $[43] = t18;
  } else {
    t18 = $[43];
  }
  let t19;
  if ($[44] !== props.style || $[45] !== size || $[46] !== t15 || $[47] !== t17 || $[48] !== t18 || $[49] !== t8) {
    t19 = /* @__PURE__ */ React.createElement("span", { className: t8, style: props.style, "data-component": "phone-input", "data-size": size, onMouseDown: t9 }, t15, t17, t18);
    $[44] = props.style;
    $[45] = size;
    $[46] = t15;
    $[47] = t17;
    $[48] = t18;
    $[49] = t8;
    $[50] = t19;
  } else {
    t19 = $[50];
  }
  return t19;
}
function _temp6(n_0) {
  return n_0 + 1;
}
function _temp5(n) {
  return n + 1;
}
function _temp4(c_6) {
  return !!c_6;
}
function _temp3(c_1) {
  return {
    ...c_1,
    code: c_1.code.toUpperCase()
  };
}
function _temp2(c_0) {
  return c_0.code.toUpperCase();
}
function _temp(c) {
  return typeof c === "object" && !!c && !!c.code;
}
var PhoneInput = /* @__PURE__ */ named("PhoneInput", PhoneInputRender);
export {
  PhoneInput
};
//# sourceMappingURL=PhoneInput.js.map
