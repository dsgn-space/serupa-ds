// src/blocks/StatsRow/StatsRow.tsx
import * as React from "react";
import { Card } from "../../components/Card/Card.js";
import { Badge } from "../../components/Badge/Badge.js";
import { Heading } from "../../components/Heading/Heading.js";
import { Sparkline } from "../../components/Sparkline/Sparkline.js";
import { Loader } from "../../components/Loader/Loader.js";
var EN = {
  up: (amount) => `Up ${amount}`,
  down: (amount) => `Down ${amount}`,
  flat: "No change",
  loading: (title) => `Loading: ${title}`,
  trend: (label, count) => `${label}, last ${count} periods`
};
var ARROW = { up: "arrow_upward", down: "arrow_downward", flat: "remove" };
function StatsRow({ title, headingLevel = 2, stats, period, loading = false, loadingCount = 4, labels }) {
  const id = React.useId();
  const w = { ...EN, ...labels };
  return /* @__PURE__ */ React.createElement("section", { "aria-labelledby": id, className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, size: "lg", id }, title), /* @__PURE__ */ React.createElement("ul", { "aria-busy": loading || void 0, className: "m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4" }, loading ? Array.from({ length: loadingCount }, (_, i) => /* @__PURE__ */ React.createElement(Card, { as: "li", key: i, padding: "md" }, /* @__PURE__ */ React.createElement(Loader, { variant: "skeleton", shape: "text", lines: 3, label: i === 0 ? w.loading(title) : "" }))) : stats.map((s) => {
    const c = s.change;
    const good = c ? c.good ?? c.direction === "up" : false;
    const tone = !c || c.direction === "flat" ? "neutral" : good ? "success" : "danger";
    return /* @__PURE__ */ React.createElement(Card, { as: "li", key: s.label, padding: "md", className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "m-0 text-sm text-text-muted" }, s.label), /* @__PURE__ */ React.createElement("p", { className: "m-0 text-2xl font-semibold tabular-nums" }, s.value), c ? /* @__PURE__ */ React.createElement("p", { className: "m-0 flex flex-wrap items-center gap-2 text-sm text-text-muted" }, /* @__PURE__ */ React.createElement(Badge, { tone, leftIcon: ARROW[c.direction] }, c.direction === "flat" ? w.flat : w[c.direction](c.amount)), period ? /* @__PURE__ */ React.createElement("span", null, period) : null) : null, s.trend && s.trend.length > 1 ? /* @__PURE__ */ React.createElement(Sparkline, { data: s.trend, label: w.trend(s.label, s.trend.length), className: "h-8 w-full" }) : null);
  })));
}
export {
  StatsRow
};
//# sourceMappingURL=StatsRow.js.map
