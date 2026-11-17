// src/internal/datePresets.tsx
import * as React from "react";
import { addDays, day, sameDay } from "./dates.js";
var dayPresets = (w) => {
  const t = day(/* @__PURE__ */ new Date());
  return [{ label: w.today, start: t, end: null }, { label: w.tomorrow, start: addDays(t, 1), end: null }, { label: w.inAWeek, start: addDays(t, 7), end: null }];
};
var rangePresets = (w, max) => {
  const t = day(/* @__PURE__ */ new Date()), y = t.getFullYear(), m = t.getMonth(), first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
  return [
    { label: w.today, start: t, end: t },
    { label: w.yesterday, start: addDays(t, -1), end: addDays(t, -1) },
    { label: w.last7Days, start: addDays(t, -6), end: t },
    { label: w.last30Days, start: addDays(t, -29), end: t },
    { label: w.thisMonth, start: first, end: max && max >= first && max < last ? day(max) : last },
    { label: w.lastMonth, start: new Date(y, m - 1, 1), end: new Date(y, m, 0) }
  ];
};
var never = () => () => {
};
var yes = () => true;
var no = () => false;
function PresetList(p) {
  const hydrated = React.useSyncExternalStore(never, yes, no);
  return /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": p.label, className: "dk-calendar__presets" }, p.items.map((it, i) => {
    const off = !it.start || hydrated && (!p.allowed(it.start) || !!it.end && !p.allowed(it.end));
    const on = hydrated && sameDay(it.start, p.current.start) && (it.end ? sameDay(it.end, p.current.end) : true);
    return /* @__PURE__ */ React.createElement("button", { key: i, type: "button", className: "dk-calendar__preset", "aria-pressed": on, "aria-disabled": off || void 0, onClick: () => {
      if (!off) p.onPick(it);
    } }, it.label);
  }));
}
export {
  PresetList,
  dayPresets,
  rangePresets
};
//# sourceMappingURL=datePresets.js.map
