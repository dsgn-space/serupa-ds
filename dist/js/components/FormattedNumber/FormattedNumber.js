"use client";

// src/components/FormattedNumber/FormattedNumber.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
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
    out.push(mask[i] ? /* @__PURE__ */ React.createElement("span", { key: `${change}-${i}`, className: "dk-formatted-number__changed", "data-changed": "" }, text.slice(i, j)) : text.slice(i, j));
    i = j;
  }
  return out;
}
var FormattedNumber = /* @__PURE__ */ component("FormattedNumber", function FormattedNumber2(props, ref) {
  const rest = omit(props, { value: 1, format: 1, currency: 1, unit: 1, options: 1, locale: 1, className: 1, animate: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const format = props.format || "decimal";
  const text = formatNumber(props.value, locale, { format, currency: props.currency, unit: props.unit, ...props.options });
  const title = format === "compact" && text ? formatNumber(props.value, locale) : void 0;
  const last = React.useRef(null);
  const seen = last.current;
  const now = !props.animate || !seen ? { text, mask: null, change: 0 } : seen.text === text ? seen : { text, mask: changedChars(seen.text, text), change: seen.change + 1 };
  React.useEffect(() => {
    last.current = now;
  });
  return /* @__PURE__ */ React.createElement(
    "data",
    {
      lang,
      ...rest,
      ref,
      value: String(props.value),
      title: rest.title ?? title,
      className: cn("dk-formatted-number", props.className),
      "data-component": "formatted-number",
      "data-format": format
    },
    now.mask ? segments(text, now.mask, now.change) : text
  );
});
export {
  FormattedNumber,
  formatNumber2 as formatNumber
};
//# sourceMappingURL=FormattedNumber.js.map
