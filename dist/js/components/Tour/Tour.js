"use client";

// src/components/Tour/Tour.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { showLayer } from "../../internal/position.js";
import { deepActive, rootOf } from "../../internal/root.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { en as stepper } from "../Stepper/labels.js";
import { en as tour } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
var words = /* @__PURE__ */ Object.assign({}, stepper, tour);
var OWN = {
  steps: 1,
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  step: 1,
  defaultStep: 1,
  onStepChange: 1,
  onFinish: 1,
  headingLevel: 1,
  className: 1,
  id: 1
};
function find(t, near) {
  const el = typeof t === "string" ? rootOf(near).querySelector(t) : t && "current" in t ? t.current : t;
  return el instanceof Element ? el : null;
}
var TABBABLE = 'a[href], button:not(:disabled), input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable="true"]';
function TourRender(t0) {
  const $ = _c(32);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const locale = useLocale();
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-tour", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const own = t2;
  const id = props.id || own;
  const steps = props.steps || [];
  const [isOpen, setOwnOpen] = useControllable(props.open, !!props.defaultOpen, "Tour", "open");
  const open = steps.length > 0 && !!isOpen;
  const [stepAt, setOwnStep] = useControllable(props.step, props.defaultStep || 0, "Tour", "step");
  const at = Math.max(0, Math.min(steps.length - 1, stepAt));
  const step = steps[at];
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && props.step === void 0) {
      setOwnStep(props.defaultStep || 0);
    }
  }
  const panel = React.useRef(null);
  const anchor = React.useRef(null);
  const opener = React.useRef(null);
  const [target, setTarget] = React.useState(null);
  const close = (reason) => {
    if (props.open === void 0) {
      setOwnOpen(false);
    }
    if (props.onOpenChange) {
      props.onOpenChange(false, {
        reason
      });
    }
  };
  const go = (to) => {
    if (props.step === void 0) {
      setOwnStep(to);
    }
    if (props.onStepChange) {
      props.onStepChange(to);
    }
  };
  const last = at === steps.length - 1;
  const next = () => {
    if (!last) {
      go(at + 1);
      return;
    }
    if (props.onFinish) {
      props.onFinish();
    }
    close("close");
  };
  useIsoLayoutEffect(() => {
    const el = open && step ? find(step.target, panel.current) : null;
    anchor.current = el;
    setTarget(el);
    if (!el) {
      return;
    }
    el.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
    el.setAttribute("data-tour-target", "");
    return () => el.removeAttribute("data-tour-target");
  }, [open, step]);
  const exit = useExit(open, panel);
  const t3 = step && step.placement;
  let t4;
  if ($[2] !== t3 || $[3] !== target) {
    t4 = {
      placement: t3,
      offsetVar: "--srp-tour-offset",
      watch: target
    };
    $[2] = t3;
    $[3] = target;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  useAnchoredLayer(open && !!target, panel, anchor, t4);
  let t5;
  if ($[5] !== open || $[6] !== target) {
    t5 = [open, target];
    $[5] = open;
    $[6] = target;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || target || !p) {
      return;
    }
    p.style.top = p.style.left = "";
    showLayer(p);
  }, t5);
  let t6;
  if ($[8] !== at || $[9] !== open) {
    t6 = [open, at];
    $[8] = at;
    $[9] = open;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  useIsoLayoutEffect(() => {
    const p_0 = panel.current;
    if (!open || !p_0) {
      return;
    }
    if (!opener.current) {
      opener.current = deepActive();
    }
    p_0.focus({
      preventScroll: true
    });
  }, t6);
  let t7;
  if ($[11] !== open) {
    t7 = [open];
    $[11] = open;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  useIsoLayoutEffect(() => {
    if (open) {
      return;
    }
    const back = opener.current;
    const p_1 = panel.current;
    const now = deepActive();
    opener.current = null;
    if (back && back.isConnected && typeof back.focus === "function" && (!now || now === document.body || !!p_1 && p_1.contains(now))) {
      back.focus({
        preventScroll: true
      });
    }
  }, t7);
  useIsoLayoutEffect(() => {
    const p_2 = panel.current;
    if (!open || !p_2) {
      return;
    }
    const esc = (e) => {
      if (e.defaultPrevented || e.isComposing) {
        return;
      }
      if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const stops = Array.prototype.filter.call(p_2.querySelectorAll(TABBABLE), _temp);
        if (!stops.length) {
          return;
        }
        const now_0 = deepActive();
        const first = stops[0];
        const end = stops[stops.length - 1];
        const to_0 = e.shiftKey ? now_0 === first || now_0 === p_2 ? end : null : now_0 === end ? first : null;
        if (to_0) {
          e.preventDefault();
          to_0.focus();
        }
        return;
      }
      if (e.key !== "Escape") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      close("escape");
    };
    p_2.addEventListener("keydown", esc);
    return () => p_2.removeEventListener("keydown", esc);
  }, [open, close]);
  const mergedRef = useMergedRef(ref, (n_0) => {
    panel.current = n_0;
  });
  if (!step) {
    return null;
  }
  const H = "h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel) >= 0 ? props.headingLevel : 2);
  let t8;
  if ($[13] !== props) {
    t8 = omit(props, OWN);
    $[13] = props;
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  const t9 = "dialog";
  const t10 = -1;
  let t11;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = {
      popover: "manual"
    };
    $[15] = t11;
  } else {
    t11 = $[15];
  }
  const t12 = !open || void 0;
  const t13 = !open || void 0;
  const t14 = id + "-title";
  const t15 = step.content != null ? id + "-text" : void 0;
  const t16 = !target && "srp-tour--center";
  let t17;
  if ($[16] !== props || $[17] !== t16) {
    t17 = cn("srp-tour", t16, props.className);
    $[16] = props;
    $[17] = t16;
    $[18] = t17;
  } else {
    t17 = $[18];
  }
  const t18 = "tour";
  const t19 = open ? "open" : "closed";
  const t20 = exit.instant ? "" : void 0;
  const t21 = open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-tour__head" }, /* @__PURE__ */ React.createElement(H, { id: id + "-title", className: "srp-tour__title" }, step.title), /* @__PURE__ */ React.createElement(IconButton, { className: "srp-tour__close", icon: icons.Close, label: sds.labels.close, size: "sm", hideTitle: true, onClick: () => close("close") })), step.content != null ? /* @__PURE__ */ React.createElement("div", { id: id + "-text", className: "srp-tour__text" }, step.content) : null, /* @__PURE__ */ React.createElement("div", { className: "srp-tour__foot" }, steps.length > 1 ? /* @__PURE__ */ React.createElement("span", { className: "srp-tour__count" }, sds.labels.stepOf(at + 1, steps.length, numberFormat(locale).format(at + 1), numberFormat(locale).format(steps.length))) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-tour__actions" }, at > 0 ? /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "secondary", onClick: () => go(at - 1) }, sds.labels.tourBack) : null, /* @__PURE__ */ React.createElement(Button, { size: "sm", onClick: next }, last ? sds.labels.tourDone : sds.labels.tourNext)))) : null;
  let t22;
  if ($[19] !== id || $[20] !== mergedRef || $[21] !== t11 || $[22] !== t12 || $[23] !== t13 || $[24] !== t14 || $[25] !== t15 || $[26] !== t17 || $[27] !== t19 || $[28] !== t20 || $[29] !== t21 || $[30] !== t8) {
    t22 = /* @__PURE__ */ React.createElement("div", { ...t8, ref: mergedRef, id, role: t9, tabIndex: t10, ...t11, hidden: t12, inert: t13, "aria-labelledby": t14, "aria-describedby": t15, className: t17, "data-component": t18, "data-state": t19, "data-instant": t20 }, t21);
    $[19] = id;
    $[20] = mergedRef;
    $[21] = t11;
    $[22] = t12;
    $[23] = t13;
    $[24] = t14;
    $[25] = t15;
    $[26] = t17;
    $[27] = t19;
    $[28] = t20;
    $[29] = t21;
    $[30] = t8;
    $[31] = t22;
  } else {
    t22 = $[31];
  }
  return t22;
}
function _temp(n) {
  return n.tabIndex >= 0 && n.getClientRects().length > 0;
}
var Tour = /* @__PURE__ */ named("Tour", TourRender);
export {
  Tour
};
//# sourceMappingURL=Tour.js.map
