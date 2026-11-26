"use client";

// src/components/PhoneInput/PhoneInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { pressFocuses } from "../../internal/affix.js";
import { useMergedRef, cn, domId, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
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
import { fold } from "../../internal/fold.js";
import { announce } from "../../internal/announce.js";
import { announcePause } from "../../internal/timing.js";
import { displayNumber } from "../../internal/numbers.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { en as listWords } from "../Combobox/labels.js";
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
  const $ = _c(95);
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
    const n_0 = text.slice(0, i).replace(/\D/g, "").length;
    commit(shown.slice(0, n_0) + shown.slice(n_0 + 1), country);
    caret.current = caretAfter(formatNational(shown.slice(0, n_0) + shown.slice(n_0 + 1), country), n_0);
  };
  const L = useSettings(listWords).labels;
  const label = props.countryLabel || sds.labels.country;
  const base = domId("srp-phone", React.useId());
  const listId = base + "-list";
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const locked = !!(rest.disabled || rest.readOnly);
  const shownList = useFiltered(list, open ? query : "");
  const here = list.find((x) => x.c.code === country.code);
  const trigger = React.useRef(null);
  const pop = React.useRef(null);
  const search = React.useRef(null);
  const boxRef = React.useRef(null);
  const show = (text_0) => {
    if (locked) {
      return;
    }
    setQuery(text_0);
    const at_0 = text_0 ? 0 : list.findIndex((x_0) => x_0.c.code === country.code);
    setActive(Math.max(0, at_0));
    setOpen(true);
  };
  const close = (back_0) => {
    setOpen(false);
    if (back_0 === "trigger" && trigger.current) {
      trigger.current.focus();
    }
    if (back_0 === "field" && input.current) {
      input.current.focus();
    }
  };
  const choose = (c_9) => {
    commit(typed, c_9, true);
    close("field");
  };
  let t7;
  let t8;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => setOpen(false);
    t8 = () => setOpen(false);
    $[12] = t7;
    $[13] = t8;
  } else {
    t7 = $[12];
    t8 = $[13];
  }
  let t9;
  if ($[14] !== shownList.length) {
    t9 = {
      placement: "bottom-start",
      offsetVar: "--srp-phone-input-offset",
      watch: shownList.length,
      inside: trigger,
      onOutside: t7,
      onFocusOutside: t8
    };
    $[14] = shownList.length;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  useAnchoredLayer(open, pop, boxRef, t9);
  useFocusOnOpen(open, search);
  let t10;
  let t11;
  if ($[16] !== active || $[17] !== base || $[18] !== open) {
    t10 = function() {
      if (!open) {
        return;
      }
      const o = document.getElementById(base + "-opt-" + active);
      if (o && typeof o.scrollIntoView === "function") {
        o.scrollIntoView({
          block: "nearest"
        });
      }
    };
    t11 = [open, active, base];
    $[16] = active;
    $[17] = base;
    $[18] = open;
    $[19] = t10;
    $[20] = t11;
  } else {
    t10 = $[19];
    t11 = $[20];
  }
  React.useLayoutEffect(t10, t11);
  let t12;
  if ($[21] !== L || $[22] !== locale || $[23] !== open || $[24] !== query || $[25] !== shownList.length) {
    t12 = !open || !query ? "" : shownList.length ? L.resultsCount(shownList.length, displayNumber(shownList.length, locale)) : L.noResults;
    $[21] = L;
    $[22] = locale;
    $[23] = open;
    $[24] = query;
    $[25] = shownList.length;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  const said = t12;
  let t13;
  let t14;
  if ($[27] !== said) {
    t13 = function() {
      if (!said) {
        return;
      }
      const t = setTimeout(() => announce(said), announcePause);
      return () => clearTimeout(t);
    };
    t14 = [said];
    $[27] = said;
    $[28] = t13;
    $[29] = t14;
  } else {
    t13 = $[28];
    t14 = $[29];
  }
  React.useEffect(t13, t14);
  let t15;
  if ($[30] !== locked || $[31] !== show) {
    t15 = function(e_1) {
      if (locked || e_1.altKey || e_1.ctrlKey || e_1.metaKey) {
        return;
      }
      if (e_1.key === "ArrowDown" || e_1.key === "ArrowUp") {
        e_1.preventDefault();
        show("");
      } else {
        if (e_1.key.length === 1 && e_1.key !== " " && !isComposing(e_1)) {
          e_1.preventDefault();
          show(e_1.key);
        }
      }
    };
    $[30] = locked;
    $[31] = show;
    $[32] = t15;
  } else {
    t15 = $[32];
  }
  const onTriggerKey = t15;
  const onSearchKey = function(e_2) {
    if (isComposing(e_2)) {
      return;
    }
    const n_1 = shownList.length;
    if (e_2.key === "ArrowDown" || e_2.key === "ArrowUp") {
      e_2.preventDefault();
      if (n_1) {
        setActive((active + (e_2.key === "ArrowDown" ? 1 : -1) + n_1) % n_1);
      }
    } else {
      if (e_2.key === "Enter") {
        e_2.preventDefault();
        const x_1 = shownList[active];
        if (x_1) {
          choose(x_1.c);
        }
      } else {
        if (e_2.key === "Escape") {
          e_2.preventDefault();
          e_2.stopPropagation();
          close("trigger");
        } else {
          if (e_2.key === "Tab") {
            setOpen(false);
          }
        }
      }
    }
  };
  const t16 = cn("srp-input srp-phone-input", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className);
  const t17 = invalid ? "" : void 0;
  const t18 = rest.disabled ? "" : void 0;
  const t19 = rest.readOnly ? "" : void 0;
  const t20 = open ? "open" : "closed";
  let t21;
  if ($[33] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t21 = (e_3) => pressFocuses(input)(e_3);
    $[33] = t21;
  } else {
    t21 = $[33];
  }
  const t22 = open ? listId : void 0;
  let t23;
  if ($[34] !== close || $[35] !== open || $[36] !== show) {
    t23 = () => open ? close(null) : show("");
    $[34] = close;
    $[35] = open;
    $[36] = show;
    $[37] = t23;
  } else {
    t23 = $[37];
  }
  const t24 = label + ": " + (here ? here.name : country.code) + " ";
  let t25;
  if ($[38] !== t24) {
    t25 = /* @__PURE__ */ React.createElement(VisuallyHidden, { suppressHydrationWarning: true }, t24);
    $[38] = t24;
    $[39] = t25;
  } else {
    t25 = $[39];
  }
  let t26;
  if ($[40] !== country.dial) {
    t26 = /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__dial" }, "+", country.dial);
    $[40] = country.dial;
    $[41] = t26;
  } else {
    t26 = $[41];
  }
  let t27;
  if ($[42] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t27 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-phone-input__chevron" });
    $[42] = t27;
  } else {
    t27 = $[42];
  }
  let t28;
  if ($[43] !== country.code || $[44] !== locked || $[45] !== onTriggerKey || $[46] !== open || $[47] !== t22 || $[48] !== t23 || $[49] !== t25 || $[50] !== t26) {
    t28 = /* @__PURE__ */ React.createElement("button", { ref: trigger, type: "button", className: "srp-phone-input__country", disabled: locked, "data-value": country.code, "aria-haspopup": "listbox", "aria-expanded": open, "aria-controls": t22, onClick: t23, onKeyDown: onTriggerKey }, t25, t26, t27);
    $[43] = country.code;
    $[44] = locked;
    $[45] = onTriggerKey;
    $[46] = open;
    $[47] = t22;
    $[48] = t23;
    $[49] = t25;
    $[50] = t26;
    $[51] = t28;
  } else {
    t28 = $[51];
  }
  const t29 = invalid || rest["aria-invalid"];
  let t30;
  if ($[52] !== onChange || $[53] !== onKeyDown || $[54] !== rest || $[55] !== setRef || $[56] !== t29 || $[57] !== text) {
    t30 = /* @__PURE__ */ React.createElement("input", { autoComplete: "tel", ...rest, "aria-invalid": t29, ref: setRef, type: "tel", inputMode: "tel", className: "srp-input__field", value: text, onChange, onKeyDown });
    $[52] = onChange;
    $[53] = onKeyDown;
    $[54] = rest;
    $[55] = setRef;
    $[56] = t29;
    $[57] = text;
    $[58] = t30;
  } else {
    t30 = $[58];
  }
  let t31;
  if ($[59] !== country || $[60] !== props.form || $[61] !== props.name || $[62] !== rest.disabled || $[63] !== shown) {
    t31 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: toE164(shown, country), disabled: rest.disabled }) : null;
    $[59] = country;
    $[60] = props.form;
    $[61] = props.name;
    $[62] = rest.disabled;
    $[63] = shown;
    $[64] = t31;
  } else {
    t31 = $[64];
  }
  let t32;
  if ($[65] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t32 = {
      popover: "manual"
    };
    $[65] = t32;
  } else {
    t32 = $[65];
  }
  const t33 = !open || void 0;
  let t34;
  if ($[66] !== L || $[67] !== active || $[68] !== base || $[69] !== choose || $[70] !== country.code || $[71] !== label || $[72] !== listId || $[73] !== onSearchKey || $[74] !== open || $[75] !== query || $[76] !== setActive || $[77] !== setQuery || $[78] !== shownList) {
    t34 = open ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__search-box" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Search, className: "srp-phone-input__search-icon" }), /* @__PURE__ */ React.createElement("input", { ref: search, className: "srp-phone-input__search", type: "text", role: "combobox", "aria-label": label, "aria-expanded": true, "aria-controls": listId, "aria-autocomplete": "list", "aria-activedescendant": shownList[active] ? base + "-opt-" + active : void 0, autoComplete: "off", spellCheck: false, value: query, onChange: (e_5) => {
      setQuery(e_5.target.value);
      setActive(0);
    }, onKeyDown: onSearchKey })), /* @__PURE__ */ React.createElement("div", { id: listId, role: "listbox", "aria-label": label, className: "srp-phone-input__listbox" }, shownList.map((x_2, i_0) => /* @__PURE__ */ React.createElement("div", { key: x_2.c.code, id: base + "-opt-" + i_0, role: "option", "aria-selected": x_2.c.code === country.code, "data-value": x_2.c.code, className: "srp-phone-input__option", "data-active": i_0 === active ? "" : void 0, onMouseDown: _temp7, onMouseMove: () => {
      if (i_0 !== active) {
        setActive(i_0);
      }
    }, onClick: () => choose(x_2.c) }, /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__name" }, x_2.name), /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__code" }, "+", x_2.c.dial), x_2.c.code === country.code ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-phone-input__check" }) : /* @__PURE__ */ React.createElement("span", { className: "srp-phone-input__check" })))), !shownList.length ? /* @__PURE__ */ React.createElement("div", { className: "srp-phone-input__message" }, L.noResults) : null) : null;
    $[66] = L;
    $[67] = active;
    $[68] = base;
    $[69] = choose;
    $[70] = country.code;
    $[71] = label;
    $[72] = listId;
    $[73] = onSearchKey;
    $[74] = open;
    $[75] = query;
    $[76] = setActive;
    $[77] = setQuery;
    $[78] = shownList;
    $[79] = t34;
  } else {
    t34 = $[79];
  }
  let t35;
  if ($[80] !== t33 || $[81] !== t34) {
    t35 = /* @__PURE__ */ React.createElement("div", { ref: pop, className: "srp-phone-input__popup", ...t32, hidden: t33, onMouseDown: _temp6 }, t34);
    $[80] = t33;
    $[81] = t34;
    $[82] = t35;
  } else {
    t35 = $[82];
  }
  let t36;
  if ($[83] !== props.style || $[84] !== size || $[85] !== t16 || $[86] !== t17 || $[87] !== t18 || $[88] !== t19 || $[89] !== t20 || $[90] !== t28 || $[91] !== t30 || $[92] !== t31 || $[93] !== t35) {
    t36 = /* @__PURE__ */ React.createElement("span", { ref: boxRef, className: t16, "data-invalid": t17, "data-disabled": t18, "data-readonly": t19, style: props.style, "data-component": "phone-input", "data-size": size, "data-state": t20, onMouseDown: t21 }, t28, t30, t31, t35);
    $[83] = props.style;
    $[84] = size;
    $[85] = t16;
    $[86] = t17;
    $[87] = t18;
    $[88] = t19;
    $[89] = t20;
    $[90] = t28;
    $[91] = t30;
    $[92] = t31;
    $[93] = t35;
    $[94] = t36;
  } else {
    t36 = $[94];
  }
  return t36;
}
function _temp7(e_6) {
  return e_6.preventDefault();
}
function _temp6(e_4) {
  return e_4.stopPropagation();
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
function useFiltered(list, query) {
  const $ = _c(6);
  let t0;
  if ($[0] !== list || $[1] !== query) {
    bb0: {
      const q = fold(query.trim());
      if (!q) {
        t0 = list;
        break bb0;
      }
      const digits = q.replace(/^\+/, "");
      const starts = [];
      const inside = [];
      for (const x of list) {
        const name = fold(x.name);
        if (name.startsWith(q) || x.c.code.toLowerCase() === q || /^\d+$/.test(digits) && x.c.dial.startsWith(digits)) {
          starts.push(x);
        } else {
          if (name.includes(q)) {
            inside.push(x);
          }
        }
      }
      let t1;
      if ($[3] !== inside || $[4] !== starts) {
        t1 = starts.concat(inside);
        $[3] = inside;
        $[4] = starts;
        $[5] = t1;
      } else {
        t1 = $[5];
      }
      t0 = t1;
    }
    $[0] = list;
    $[1] = query;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
function useFocusOnOpen(open, search) {
  const $ = _c(4);
  let t0;
  let t1;
  if ($[0] !== open || $[1] !== search) {
    t0 = function() {
      if (open && search.current) {
        search.current.focus();
      }
    };
    t1 = [open, search];
    $[0] = open;
    $[1] = search;
    $[2] = t0;
    $[3] = t1;
  } else {
    t0 = $[2];
    t1 = $[3];
  }
  React.useLayoutEffect(t0, t1);
}
var PhoneInput = /* @__PURE__ */ named("PhoneInput", PhoneInputRender);
export {
  PhoneInput
};
//# sourceMappingURL=PhoneInput.js.map
