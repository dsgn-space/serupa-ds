"use client";

// src/components/StatusTracker/StatusTracker.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat, dateFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, omit, setRef, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
var STATES = ["up", "degraded", "down", "none"];
var toDate = (d) => {
  if (d instanceof Date) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d);
};
var wordOf = (L, s) => s === "up" ? L.statusUp : s === "degraded" ? L.statusDegraded : s === "down" ? L.statusDown : L.statusNone;
var Bars = /* @__PURE__ */ React.memo(function Bars2(p) {
  return p.days.map((d, i) => /* @__PURE__ */ React.createElement("li", { key: i, className: "srp-status-tracker__day", "data-state": d.state, "aria-label": p.say(d), ...{
    tabIndex: i === p.current ? 0 : -1
  }, onFocus: () => p.on(i, true), onMouseEnter: () => p.on(i, false) }));
});
function StatusTrackerRender(t0) {
  const $ = _c(38);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const rest = omit(props, {
    days: 1,
    label: 1,
    summary: 1,
    legend: 1,
    className: 1
  });
  const days = props.days || [];
  const [at, setAtIndex] = React.useState(null);
  const setAt = (i) => setAtIndex(i === days.length - 1 ? null : i);
  const [shown, setShown] = React.useState(null);
  const list = React.useRef(null);
  let t1;
  if ($[0] !== locale) {
    t1 = dateFormat(locale, {
      dateStyle: "medium"
    });
    $[0] = locale;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const dateFmt = t1;
  let t2;
  if ($[2] !== L || $[3] !== dateFmt) {
    t2 = (d) => L.statusDay(dateFmt.format(toDate(d.date)), wordOf(L, d.state)) + (d.note ? ". " + d.note : "");
    $[2] = L;
    $[3] = dateFmt;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const say = t2;
  const known = days.filter(_temp);
  const upShare = known.length ? known.filter(_temp2).length / known.length : 1;
  const incidents = known.filter(_temp3).length;
  const percent = numberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1
  }).format(upShare);
  const summary = props.summary === void 0 ? L.statusSummary(percent, days.length, incidents) : props.summary;
  const current = Math.min(Math.max(at ?? days.length - 1, 0), days.length - 1);
  const move = (i_0) => {
    const n = Math.min(Math.max(i_0, 0), days.length - 1);
    setAt(n);
    setShown(n);
    const el = list.current && list.current.children[n];
    if (el instanceof HTMLElement) {
      el.focus();
    }
  };
  const onKeyDown = (e) => {
    if (modified(e)) {
      return;
    }
    const rtl = isRtl(e.currentTarget);
    const k = e.key;
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    if (k === next) {
      move(current + 1);
    } else {
      if (k === prev) {
        move(current - 1);
      } else {
        if (k === "Home") {
          move(0);
        } else {
          if (k === "End") {
            move(days.length - 1);
          } else {
            if (k === "Escape") {
              setShown(null);
              return;
            } else {
              return;
            }
          }
        }
      }
    }
    e.preventDefault();
  };
  let t3;
  let t4;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => setShown(null);
    t4 = (e_0) => {
      if (!e_0.currentTarget.contains(e_0.relatedTarget)) {
        setShown(null);
      }
    };
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  let t5;
  if ($[7] !== onKeyDown) {
    t5 = {
      onKeyDown,
      onMouseLeave: t3,
      onBlur: t4
    };
    $[7] = onKeyDown;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const listEvents = t5;
  let t6;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => {
      const el_0 = list.current;
      if (el_0 && el_0.scrollWidth > el_0.clientWidth) {
        el_0.scrollLeft = isRtl(el_0) ? -el_0.scrollWidth : el_0.scrollWidth;
      }
    };
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  React.useEffect(t6, [days.length]);
  const live = useLatest(setAt);
  let t7;
  if ($[10] !== live) {
    t7 = (i_1, focus) => {
      if (focus) {
        live.current(i_1);
      }
      setShown(i_1);
    };
    $[10] = live;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  const on = t7;
  const caption = shown != null && days[shown] ? say(days[shown]) : null;
  let t8;
  if ($[12] !== ref) {
    t8 = (n_0) => setRef(ref, n_0);
    $[12] = ref;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  const t9 = cn("srp-status-tracker", props.className);
  let t10;
  if ($[14] !== current || $[15] !== days || $[16] !== on || $[17] !== say) {
    t10 = /* @__PURE__ */ React.createElement(Bars, { days, current, say, on });
    $[14] = current;
    $[15] = days;
    $[16] = on;
    $[17] = say;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  let t11;
  if ($[19] !== listEvents || $[20] !== props.label || $[21] !== t10) {
    t11 = /* @__PURE__ */ React.createElement("ol", { className: "srp-status-tracker__days", role: "list", ref: list, "aria-label": props.label, ...listEvents }, t10);
    $[19] = listEvents;
    $[20] = props.label;
    $[21] = t10;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  const t12 = caption || "\xA0";
  let t13;
  if ($[23] !== t12) {
    t13 = /* @__PURE__ */ React.createElement("div", { className: "srp-status-tracker__caption", "aria-hidden": true }, t12);
    $[23] = t12;
    $[24] = t13;
  } else {
    t13 = $[24];
  }
  let t14;
  if ($[25] !== summary) {
    t14 = summary != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-status-tracker__summary" }, summary) : null;
    $[25] = summary;
    $[26] = t14;
  } else {
    t14 = $[26];
  }
  let t15;
  if ($[27] !== L || $[28] !== props.legend) {
    t15 = props.legend !== false ? /* @__PURE__ */ React.createElement("ul", { className: "srp-status-tracker__legend", role: "list" }, STATES.map((s) => /* @__PURE__ */ React.createElement("li", { key: s, className: "srp-status-tracker__key", "data-state": s }, /* @__PURE__ */ React.createElement("span", { className: "srp-status-tracker__swatch", "aria-hidden": true }), wordOf(L, s)))) : null;
    $[27] = L;
    $[28] = props.legend;
    $[29] = t15;
  } else {
    t15 = $[29];
  }
  let t16;
  if ($[30] !== rest || $[31] !== t11 || $[32] !== t13 || $[33] !== t14 || $[34] !== t15 || $[35] !== t8 || $[36] !== t9) {
    t16 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: t8, className: t9, "data-component": "status-tracker" }, t11, t13, t14, t15);
    $[30] = rest;
    $[31] = t11;
    $[32] = t13;
    $[33] = t14;
    $[34] = t15;
    $[35] = t8;
    $[36] = t9;
    $[37] = t16;
  } else {
    t16 = $[37];
  }
  return t16;
}
function _temp3(d_2) {
  return d_2.state !== "up";
}
function _temp2(d_1) {
  return d_1.state === "up";
}
function _temp(d_0) {
  return d_0.state !== "none";
}
var StatusTracker = /* @__PURE__ */ named("StatusTracker", StatusTrackerRender);
export {
  StatusTracker
};
//# sourceMappingURL=StatusTracker.js.map
