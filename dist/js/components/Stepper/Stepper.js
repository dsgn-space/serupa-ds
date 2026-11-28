"use client";

// src/components/Stepper/Stepper.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { Icon } from "../Icon/Icon.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import { named } from "../../internal/component.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { activeIn } from "../../internal/root.js";
var OWN = {
  steps: 1,
  current: 1,
  orientation: 1,
  size: 1,
  onStepClick: 1,
  clickable: 1,
  labels: 1,
  className: 1
};
function StepperRender(t0) {
  const $ = _c(8);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, OWN);
  const steps = props.steps || [];
  const current = Math.max(0, Math.min(steps.length, Math.floor(Number(props.current)) || 0));
  const vertical = props.orientation === "vertical";
  const size = props.size === "sm" ? "sm" : "md";
  const L = {
    completed: sds.labels.completed,
    error: sds.labels.hasError,
    warning: sds.labels.hasWarning,
    optional: sds.labels.optional,
    stepOf: sds.labels.stepOf,
    ...props.labels || {}
  };
  const nav = React.useRef(null);
  const [compact, setCompact] = React.useState(false);
  const [tight, setTight] = React.useState(false);
  const text = _temp;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (s) => [text(s.title), text(s.description), String(!!s.optional), s.status || ""];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const parts = steps.map(t1);
  const shape = parts.every(_temp2) ? parts.map(_temp3).join("\0") : steps;
  let t2;
  if ($[1] !== size || $[2] !== vertical) {
    t2 = () => {
      const el = nav.current;
      if (!el || vertical) {
        setCompact(false);
        return;
      }
      el.setAttribute("data-fit", "");
      const fit = () => {
        const list = el.firstElementChild;
        const has = (c) => el.classList.contains(c);
        el.classList.add("srp-stepper--measure");
        const need = list.scrollWidth;
        el.classList.remove("srp-stepper--measure");
        const narrow = need > el.clientWidth;
        let small = false;
        if (narrow && size === "md") {
          const was = [has("srp-stepper--compact"), has("srp-stepper--tight")];
          el.classList.add("srp-stepper--compact");
          el.classList.remove("srp-stepper--tight");
          small = list.scrollWidth > el.clientWidth;
          el.classList.toggle("srp-stepper--compact", was[0]);
          el.classList.toggle("srp-stepper--tight", was[1]);
        }
        setCompact(narrow);
        setTight(small);
      };
      fit();
      const fonts = typeof document !== "undefined" ? document.fonts : void 0;
      let live = true;
      if (fonts && fonts.status !== "loaded") {
        fonts.ready.then(() => {
          if (live) {
            fit();
          }
        }, _temp4);
      }
      const off = onFontsLoaded(fit);
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
      if (ro) {
        ro.observe(el);
      }
      return () => {
        live = false;
        off();
        if (ro) {
          ro.disconnect();
        }
      };
    };
    $[1] = size;
    $[2] = vertical;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  useIsoLayoutEffect(t2, [vertical, shape, size]);
  const going = React.useRef(null);
  let t3;
  let t4;
  if ($[4] !== current) {
    t3 = () => {
      const el_0 = nav.current;
      const to = going.current;
      going.current = null;
      if (!el_0 || to !== current) {
        return;
      }
      const active = activeIn(el_0);
      if (active && active !== document.body) {
        return;
      }
      const head = el_0.querySelectorAll(".srp-stepper__head")[current];
      if (head) {
        head.focus();
      }
    };
    t4 = [current];
    $[4] = current;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  useIsoLayoutEffect(t3, t4);
  const shown = Math.min(current, steps.length - 1);
  let t5;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = (node) => {
      nav.current = node;
    };
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const mergedRef = useMergedRef(ref, t5);
  return /* @__PURE__ */ React.createElement("nav", { ...rest, ref: mergedRef, "aria-label": rest["aria-label"] || (rest["aria-labelledby"] ? void 0 : sds.labels.progress), className: cn("srp-stepper", vertical ? "srp-stepper--vertical" : "srp-stepper--horizontal", compact && "srp-stepper--compact", compact && tight && "srp-stepper--tight", "srp-stepper--size-" + size, props.className), "data-component": "stepper", "data-orientation": vertical ? "vertical" : "horizontal", "data-size": size }, /* @__PURE__ */ React.createElement("ol", { className: "srp-stepper__list" }, steps.map((s_0, i) => {
    const state = s_0.status === "error" || s_0.status === "warning" ? s_0.status : i < current ? "complete" : i === current ? "current" : "upcoming";
    const clickable = !!props.onStepClick && (props.clickable === "all" ? i !== current : i < current);
    const Head = clickable ? "button" : "div";
    const hasDesc = s_0.description != null && s_0.description !== "";
    return /* @__PURE__ */ React.createElement("li", { key: i, className: cn("srp-stepper__step", "srp-stepper__step--" + state, i < current && "srp-stepper__step--done"), "data-done": i < current ? "" : void 0, "data-state": state, "aria-current": i === current ? "step" : void 0 }, /* @__PURE__ */ React.createElement(Head, { className: "srp-stepper__head", ...clickable ? {
      type: "button",
      onClick: () => {
        going.current = i;
        props.onStepClick(i);
      }
    } : props.onStepClick && i === current ? {
      tabIndex: -1
    } : {} }, /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__indicator", "aria-hidden": true }, state === "complete" ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check }) : state === "error" ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.PriorityHigh }) : state === "warning" ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning }) : displayNumber(i + 1, locale)), /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__text" }, /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__title" }, s_0.title, state === "complete" ? /* @__PURE__ */ React.createElement(VisuallyHidden, null, ", " + L.completed) : state === "error" ? /* @__PURE__ */ React.createElement(VisuallyHidden, null, ", " + L.error) : state === "warning" ? /* @__PURE__ */ React.createElement(VisuallyHidden, null, ", " + L.warning) : null), hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__description" }, s_0.description) : null, s_0.optional ? /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__description srp-stepper__optional" }, L.optional) : null)), i < steps.length - 1 ? /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__connector", "aria-hidden": true }) : null);
  })), compact && shown >= 0 ? /* @__PURE__ */ React.createElement("p", { className: "srp-stepper__summary", "aria-hidden": true }, L.stepOf(shown + 1, steps.length, numberFormat(locale).format(shown + 1), numberFormat(locale).format(steps.length)) + ": ", /* @__PURE__ */ React.createElement("span", { className: "srp-stepper__title" }, steps[shown]?.title)) : null);
}
function _temp4() {
}
function _temp3(p) {
  return p.join("");
}
function _temp2(p_0) {
  return p_0[0] != null && p_0[1] != null;
}
function _temp(n) {
  return n == null || typeof n === "string" || typeof n === "number" || typeof n === "boolean" ? String(n) : null;
}
var Stepper = /* @__PURE__ */ named("Stepper", StepperRender);
export {
  Stepper
};
//# sourceMappingURL=Stepper.js.map
