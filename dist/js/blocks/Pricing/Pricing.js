// src/blocks/Pricing/Pricing.tsx
import * as React from "react";
import { Badge } from "../../components/Badge/Badge.js";
import { Button } from "../../components/Button/Button.js";
import { Card } from "../../components/Card/Card.js";
import { Heading } from "../../components/Heading/Heading.js";
import { Icon } from "../../components/Icon/Icon.js";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl.js";
import { formatNumber } from "../../components/FormattedNumber/formatNumber.js";
import { useLocale } from "../../internal/provider.js";
var english = {
  period: "Billing period",
  monthly: "Monthly",
  yearly: (saving, upTo) => saving > 0 ? `Yearly, save ${upTo ? "up to " : ""}${saving}%` : "Yearly",
  perMonth: "per month",
  billedYearly: (total) => `${total} billed yearly`,
  current: "Your current plan",
  recommended: "Recommended",
  included: (plan) => `Included in ${plan}`,
  choose: (plan) => `Choose ${plan}`
};
function savings(plans) {
  return plans.filter((p) => p.monthly > 0).map((p) => Math.max(0, Math.floor(Number(((1 - p.yearly / (p.monthly * 12)) * 100).toFixed(6)))));
}
function Pricing({ plans, currency, period, defaultPeriod = "monthly", onPeriodChange, onChoose, headingLevel = 3, labels }) {
  const l = { ...english, ...labels };
  const locale = useLocale();
  const [own, setOwn] = React.useState(defaultPeriod);
  const shown = period ?? own;
  const money = (value) => formatNumber(value, locale, { format: "currency", currency, ...Number.isInteger(value) && { minimumFractionDigits: 0, maximumFractionDigits: 0 } });
  const saved = savings(plans), best = Math.max(0, ...saved);
  const change = (next) => {
    setOwn(next);
    onPeriodChange?.(next);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-6" }, /* @__PURE__ */ React.createElement(
    SegmentedControl,
    {
      "aria-label": l.period,
      value: shown,
      onValueChange: change,
      className: "self-center",
      options: [{ value: "monthly", label: l.monthly }, { value: "yearly", label: l.yearly(best, saved.some((x) => x !== best)) }]
    }
  ), /* @__PURE__ */ React.createElement("ul", { className: "m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3" }, plans.map((plan) => {
    const perMonth = shown === "yearly" ? plan.yearly / 12 : plan.monthly;
    return /* @__PURE__ */ React.createElement(
      Card,
      {
        as: "li",
        key: plan.id,
        padding: "lg",
        variant: plan.recommended ? "elevated" : "outline",
        "aria-labelledby": `${plan.id}-name`,
        className: plan.recommended ? "flex h-full min-w-0 flex-col gap-4 wrap-anywhere border-primary" : "flex h-full min-w-0 flex-col gap-4 wrap-anywhere"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, id: `${plan.id}-name` }, plan.name), plan.recommended && /* @__PURE__ */ React.createElement(Badge, { tone: "primary" }, l.recommended)),
      plan.description && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-text-muted" }, plan.description),
      /* @__PURE__ */ React.createElement("p", { className: "flex flex-wrap items-baseline gap-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl font-semibold" }, money(perMonth)), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-text-muted" }, l.perMonth), shown === "yearly" && plan.yearly > 0 && /* @__PURE__ */ React.createElement("span", { className: "w-full text-sm text-text-muted" }, l.billedYearly(money(plan.yearly)))),
      /* @__PURE__ */ React.createElement("ul", { "aria-label": l.included(plan.name), className: "m-0 flex list-none flex-col gap-2 p-0 text-sm" }, plan.features.map((f) => /* @__PURE__ */ React.createElement("li", { key: f, className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", className: "shrink-0 text-success" }), f))),
      /* @__PURE__ */ React.createElement("div", { className: "mt-auto" }, plan.current ? /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold" }, l.current) : /* @__PURE__ */ React.createElement(Button, { className: "w-full", variant: plan.recommended ? "primary" : "secondary", onClick: () => onChoose(plan.id, shown) }, l.choose(plan.name)))
    );
  })));
}
export {
  Pricing
};
//# sourceMappingURL=Pricing.js.map
