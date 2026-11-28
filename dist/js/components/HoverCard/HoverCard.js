"use client";

// src/components/HoverCard/HoverCard.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, elementRef, omit, useMergedRef, useLatest } from "../../internal/cn.js";
import { oneElement, useTriggerRef } from "../../internal/trigger.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { cardIntent, cardLeave } from "../../internal/timing.js";
import { useControllable } from "../../internal/controllable.js";
var theirs = (f, e) => {
  if (typeof f === "function") f(e);
};
var Panel = "span";
function Trigger({
  element,
  add
}) {
  return React.cloneElement(element, add);
}
var OWN = {
  trigger: 1,
  children: 1,
  placement: 1,
  openDelay: 1,
  closeDelay: 1,
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  disabled: 1,
  className: 1,
  style: 1,
  onBlur: 1,
  onFocus: 1,
  onPointerEnter: 1,
  onPointerLeave: 1
};
function HoverCardRender(t0) {
  const $ = _c(103);
  let props;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
  } else {
    props = $[1];
    ref = $[2];
  }
  const t1 = React.useId();
  let t2;
  if ($[3] !== t1) {
    t2 = domId("srp-hcard", t1);
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const own = t2;
  const id = props.id || own;
  const [shown, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "HoverCard", "open");
  const open = !props.disabled && !!shown;
  const cardRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const timer = React.useRef(void 0);
  const ask = useLatest(props.onOpenChange);
  const openRef = useLatest(open);
  let t3;
  if ($[5] !== ask || $[6] !== controlled || $[7] !== openRef || $[8] !== setInner) {
    t3 = (v, reason) => {
      window.clearTimeout(timer.current);
      if (v === openRef.current) {
        return;
      }
      if (!controlled) {
        setInner(v);
      }
      if (ask.current) {
        ask.current(v, {
          reason
        });
      }
    };
    $[5] = ask;
    $[6] = controlled;
    $[7] = openRef;
    $[8] = setInner;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const set = t3;
  const muted = React.useRef(false);
  const armed = React.useRef(null);
  let t4;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => {
      if (armed.current) {
        document.removeEventListener("keydown", armed.current, true);
      }
      armed.current = null;
    };
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  const unarm = t4;
  let t5;
  if ($[11] !== openRef || $[12] !== set) {
    t5 = (v_0, ms, reason_0) => {
      window.clearTimeout(timer.current);
      unarm();
      if (v_0 && muted.current) {
        return;
      }
      timer.current = window.setTimeout(() => {
        unarm();
        set(v_0, reason_0);
      }, ms);
      if (!v_0 || openRef.current) {
        return;
      }
      const esc = (e) => {
        if (e.key !== "Escape" || isComposing(e)) {
          return;
        }
        window.clearTimeout(timer.current);
        unarm();
        muted.current = true;
      };
      armed.current = esc;
      document.addEventListener("keydown", esc, true);
    };
    $[11] = openRef;
    $[12] = set;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const later = t5;
  let t6;
  if ($[14] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => {
      muted.current = false;
    };
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  const unmute = t6;
  let t7;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => window.clearTimeout(timer.current);
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const stay = t7;
  let t8;
  let t9;
  if ($[16] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = () => () => {
      window.clearTimeout(timer.current);
      unarm();
    };
    t9 = [];
    $[16] = t8;
    $[17] = t9;
  } else {
    t8 = $[16];
    t9 = $[17];
  }
  React.useEffect(t8, t9);
  const openDelay = props.openDelay == null ? cardIntent : props.openDelay;
  const closeDelay = props.closeDelay == null ? cardLeave : props.closeDelay;
  const exit = useExit(open, cardRef);
  let t10;
  if ($[18] !== set) {
    t10 = () => set(false, "outside");
    $[18] = set;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] !== props.children || $[21] !== props.placement || $[22] !== t10) {
    t11 = {
      placement: props.placement,
      offsetVar: "--srp-hover-card-offset",
      watch: props.children,
      onOutside: t10,
      inside: triggerRef
    };
    $[20] = props.children;
    $[21] = props.placement;
    $[22] = t10;
    $[23] = t11;
  } else {
    t11 = $[23];
  }
  useAnchoredLayer(open, cardRef, triggerRef, t11);
  let t12;
  let t13;
  if ($[24] !== open || $[25] !== set) {
    t12 = () => {
      if (!open) {
        return;
      }
      const esc_0 = (e_0) => {
        if (e_0.key !== "Escape" || isComposing(e_0)) {
          return;
        }
        e_0.preventDefault();
        e_0.stopPropagation();
        const card = cardRef.current;
        const back = !!card && card.contains(e_0.target);
        set(false, "escape");
        if (back && triggerRef.current) {
          triggerRef.current.focus();
        }
      };
      document.addEventListener("keydown", esc_0, true);
      return () => document.removeEventListener("keydown", esc_0, true);
    };
    t13 = [open, set];
    $[24] = open;
    $[25] = set;
    $[26] = t12;
    $[27] = t13;
  } else {
    t12 = $[26];
    t13 = $[27];
  }
  React.useEffect(t12, t13);
  let t14;
  if ($[28] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = (to) => !!to && (!!cardRef.current && cardRef.current.contains(to) || !!triggerRef.current && triggerRef.current.contains(to));
    $[28] = t14;
  } else {
    t14 = $[28];
  }
  const within = t14;
  let t15;
  if ($[29] !== closeDelay || $[30] !== later) {
    t15 = (e_1) => {
      if (!within(e_1.relatedTarget)) {
        unmute();
        later(false, closeDelay, "blur");
      }
    };
    $[29] = closeDelay;
    $[30] = later;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  const blurred = t15;
  const touch = _temp;
  const hovered = React.useRef(false);
  const focused = React.useRef(false);
  let t16;
  if ($[32] !== props.disabled || $[33] !== set) {
    t16 = () => {
      if (!props.disabled && !hovered.current && !focused.current) {
        set(true, "hover");
      }
    };
    $[32] = props.disabled;
    $[33] = set;
    $[34] = t16;
  } else {
    t16 = $[34];
  }
  const fromInterest = t16;
  const interest = useLatest(fromInterest);
  let t17;
  let t18;
  if ($[35] !== interest) {
    t17 = () => {
      const card_0 = cardRef.current;
      if (!card_0) {
        return;
      }
      const on = (e_3) => {
        e_3.preventDefault();
        interest.current();
      };
      const lose = _temp2;
      card_0.addEventListener("interest", on);
      card_0.addEventListener("loseinterest", lose);
      return () => {
        card_0.removeEventListener("interest", on);
        card_0.removeEventListener("loseinterest", lose);
      };
    };
    t18 = [interest];
    $[35] = interest;
    $[36] = t17;
    $[37] = t18;
  } else {
    t17 = $[36];
    t18 = $[37];
  }
  React.useEffect(t17, t18);
  const child = oneElement(props.trigger, "HoverCard", "trigger");
  useTriggerRef(triggerRef, "HoverCard");
  const cp = child.props;
  const childRef = elementRef(child);
  let t19;
  if ($[38] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t19 = (n) => {
      triggerRef.current = n;
    };
    $[38] = t19;
  } else {
    t19 = $[38];
  }
  const triggerRefs = useMergedRef(childRef, t19);
  let t20;
  if ($[39] !== id) {
    t20 = {
      interestfor: id
    };
    $[39] = id;
    $[40] = t20;
  } else {
    t20 = $[40];
  }
  const t21 = t20;
  let t22;
  if ($[41] !== cp || $[42] !== later || $[43] !== openDelay || $[44] !== openRef) {
    t22 = (e_5) => {
      theirs(cp.onPointerEnter, e_5);
      if (touch(e_5)) {
        return;
      }
      hovered.current = true;
      if (openRef.current) {
        stay();
      } else {
        later(true, openDelay, "hover");
      }
    };
    $[41] = cp;
    $[42] = later;
    $[43] = openDelay;
    $[44] = openRef;
    $[45] = t22;
  } else {
    t22 = $[45];
  }
  let t23;
  if ($[46] !== closeDelay || $[47] !== cp || $[48] !== later) {
    t23 = (e_6) => {
      theirs(cp.onPointerLeave, e_6);
      if (!touch(e_6)) {
        hovered.current = false;
        unmute();
        later(false, closeDelay, "hover");
      }
    };
    $[46] = closeDelay;
    $[47] = cp;
    $[48] = later;
    $[49] = t23;
  } else {
    t23 = $[49];
  }
  let t24;
  if ($[50] !== cp || $[51] !== later || $[52] !== openDelay || $[53] !== openRef) {
    t24 = (e_7) => {
      theirs(cp.onFocus, e_7);
      const t = e_7.target;
      if (openRef.current) {
        stay();
      } else {
        if (!t.matches || t.matches(":focus-visible")) {
          focused.current = true;
          later(true, openDelay, "focus");
        }
      }
    };
    $[50] = cp;
    $[51] = later;
    $[52] = openDelay;
    $[53] = openRef;
    $[54] = t24;
  } else {
    t24 = $[54];
  }
  let t25;
  if ($[55] !== blurred || $[56] !== cp) {
    t25 = (e_8) => {
      theirs(cp.onBlur, e_8);
      focused.current = false;
      blurred(e_8);
    };
    $[55] = blurred;
    $[56] = cp;
    $[57] = t25;
  } else {
    t25 = $[57];
  }
  let t26;
  if ($[58] !== t21 || $[59] !== t22 || $[60] !== t23 || $[61] !== t24 || $[62] !== t25 || $[63] !== triggerRefs) {
    t26 = {
      ref: triggerRefs,
      ...t21,
      onPointerEnter: t22,
      onPointerLeave: t23,
      onFocus: t24,
      onBlur: t25
    };
    $[58] = t21;
    $[59] = t22;
    $[60] = t23;
    $[61] = t24;
    $[62] = t25;
    $[63] = triggerRefs;
    $[64] = t26;
  } else {
    t26 = $[64];
  }
  let t27;
  if ($[65] !== child || $[66] !== t26) {
    t27 = /* @__PURE__ */ React.createElement(Trigger, { element: child, add: t26 });
    $[65] = child;
    $[66] = t26;
    $[67] = t27;
  } else {
    t27 = $[67];
  }
  const trigger = t27;
  let t28;
  if ($[68] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t28 = (n_0) => {
      cardRef.current = n_0;
    };
    $[68] = t28;
  } else {
    t28 = $[68];
  }
  const mergedRef = useMergedRef(ref, t28);
  let t29;
  if ($[69] !== props) {
    t29 = omit(props, OWN);
    $[69] = props;
    $[70] = t29;
  } else {
    t29 = $[70];
  }
  let t30;
  if ($[71] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t30 = {
      popover: "manual"
    };
    $[71] = t30;
  } else {
    t30 = $[71];
  }
  const t31 = !open || void 0;
  let t32;
  if ($[72] !== props.className) {
    t32 = cn("srp-hover-card", props.className);
    $[72] = props.className;
    $[73] = t32;
  } else {
    t32 = $[73];
  }
  const t33 = open ? "open" : "closed";
  const t34 = exit.instant ? "" : void 0;
  const t35 = !open || void 0;
  let t36;
  if ($[74] !== props) {
    t36 = (e_9) => {
      if (props.onPointerEnter) {
        props.onPointerEnter(e_9);
      }
      stay();
    };
    $[74] = props;
    $[75] = t36;
  } else {
    t36 = $[75];
  }
  let t37;
  if ($[76] !== closeDelay || $[77] !== later || $[78] !== props) {
    t37 = (e_10) => {
      if (props.onPointerLeave) {
        props.onPointerLeave(e_10);
      }
      if (!touch(e_10)) {
        later(false, closeDelay, "hover");
      }
    };
    $[76] = closeDelay;
    $[77] = later;
    $[78] = props;
    $[79] = t37;
  } else {
    t37 = $[79];
  }
  let t38;
  if ($[80] !== props) {
    t38 = (e_11) => {
      if (props.onFocus) {
        props.onFocus(e_11);
      }
      stay();
    };
    $[80] = props;
    $[81] = t38;
  } else {
    t38 = $[81];
  }
  let t39;
  if ($[82] !== blurred || $[83] !== props) {
    t39 = (e_12) => {
      if (props.onBlur) {
        props.onBlur(e_12);
      }
      blurred(e_12);
    };
    $[82] = blurred;
    $[83] = props;
    $[84] = t39;
  } else {
    t39 = $[84];
  }
  const t40 = open || exit.leaving ? props.children : null;
  let t41;
  if ($[85] !== id || $[86] !== mergedRef || $[87] !== props.style || $[88] !== t29 || $[89] !== t31 || $[90] !== t32 || $[91] !== t33 || $[92] !== t34 || $[93] !== t35 || $[94] !== t36 || $[95] !== t37 || $[96] !== t38 || $[97] !== t39 || $[98] !== t40) {
    t41 = /* @__PURE__ */ React.createElement(Panel, { ...t29, ref: mergedRef, id, ...t30, hidden: t31, className: t32, style: props.style, "data-component": "hover-card", "data-state": t33, "data-instant": t34, inert: t35, onPointerEnter: t36, onPointerLeave: t37, onFocus: t38, onBlur: t39 }, t40);
    $[85] = id;
    $[86] = mergedRef;
    $[87] = props.style;
    $[88] = t29;
    $[89] = t31;
    $[90] = t32;
    $[91] = t33;
    $[92] = t34;
    $[93] = t35;
    $[94] = t36;
    $[95] = t37;
    $[96] = t38;
    $[97] = t39;
    $[98] = t40;
    $[99] = t41;
  } else {
    t41 = $[99];
  }
  let t42;
  if ($[100] !== t41 || $[101] !== trigger) {
    t42 = /* @__PURE__ */ React.createElement(React.Fragment, null, trigger, t41);
    $[100] = t41;
    $[101] = trigger;
    $[102] = t42;
  } else {
    t42 = $[102];
  }
  return t42;
}
function _temp2(e_4) {
  e_4.preventDefault();
}
function _temp(e_2) {
  return "pointerType" in e_2 && e_2.pointerType === "touch";
}
var HoverCard = /* @__PURE__ */ named("HoverCard", HoverCardRender);
export {
  HoverCard
};
//# sourceMappingURL=HoverCard.js.map
