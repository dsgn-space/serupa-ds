"use client";

// src/components/FormattedNumber/FormattedNumber.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { localeDir } from "../../internal/locale.js";
import { useLocale, useOwnLang } from "../../internal/provider.js";
import { formatNumber } from "./formatNumber.js";
import { formatNumber as formatNumber2 } from "./formatNumber.js";
function changedChars(prev, next) {
  const offset = prev.length - next.length;
  return Array.from(next, (c, i) => prev[i + offset] !== c);
}
function segments(text, mask, change) {
  const out = [];
  for (let i = 0; i < text.length; ) {
    let j = i;
    while (j < text.length && mask[j] === mask[i]) j++;
    out.push(mask[i] ? /* @__PURE__ */ React.createElement("span", { key: `${change}-${i}`, className: "srp-formatted-number__changed", "data-changed": "" }, text.slice(i, j)) : text.slice(i, j));
    i = j;
  }
  return out;
}
function FormattedNumberRender(t0) {
  const $ = _c(14);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    value: 1,
    format: 1,
    currency: 1,
    unit: 1,
    options: 1,
    locale: 1,
    className: 1,
    animate: 1
  });
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const format = props.format || "decimal";
  const text = formatNumber(props.value, locale, {
    format,
    currency: props.currency,
    unit: props.unit,
    ...props.options
  });
  const title = format === "compact" && text ? formatNumber(props.value, locale) : void 0;
  const [seen, setSeen] = React.useState(() => ({
    text,
    mask: null,
    change: 0
  }));
  if (seen.text !== text) {
    setSeen({
      text,
      mask: props.animate ? changedChars(seen.text, text) : null,
      change: seen.change + 1
    });
  }
  const now = !props.animate ? {
    text,
    mask: null,
    change: 0
  } : seen.text === text ? seen : {
    text,
    mask: changedChars(seen.text, text),
    change: seen.change + 1
  };
  const t1 = props.locale ? localeDir(props.locale) : void 0;
  const t2 = String(props.value);
  const t3 = rest.title ?? title;
  const t4 = cn("srp-formatted-number", props.className);
  let t5;
  if ($[0] !== now.change || $[1] !== now.mask || $[2] !== text) {
    t5 = now.mask ? segments(text, now.mask, now.change) : text;
    $[0] = now.change;
    $[1] = now.mask;
    $[2] = text;
    $[3] = t5;
  } else {
    t5 = $[3];
  }
  let t6;
  if ($[4] !== format || $[5] !== lang || $[6] !== ref || $[7] !== rest || $[8] !== t1 || $[9] !== t2 || $[10] !== t3 || $[11] !== t4 || $[12] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("data", { lang, dir: t1, ...rest, ref, value: t2, title: t3, className: t4, "data-component": "formatted-number", "data-format": format }, t5);
    $[4] = format;
    $[5] = lang;
    $[6] = ref;
    $[7] = rest;
    $[8] = t1;
    $[9] = t2;
    $[10] = t3;
    $[11] = t4;
    $[12] = t5;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  return t6;
}
var FormattedNumber = /* @__PURE__ */ named("FormattedNumber", FormattedNumberRender);
export {
  FormattedNumber,
  formatNumber2 as formatNumber
};
//# sourceMappingURL=FormattedNumber.js.map
