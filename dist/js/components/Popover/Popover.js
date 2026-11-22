"use client";

// src/components/Popover/Popover.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, elementRef, omit, useLatest, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { mediaList } from "../../internal/mediaList.js";
import { oneElement, useTriggerRef } from "../../internal/trigger.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { lastInputKeyboard } from "../../internal/lastInput.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { warnOnce } from "../../internal/warn.js";
import { activeIn } from "../../internal/root.js";
import { useControllable } from "../../internal/controllable.js";
var Panel = "span";
var OWN = {
  trigger: 1,
  children: 1,
  title: 1,
  "aria-label": 1,
  "aria-labelledby": 1,
  headingLevel: 1,
  placement: 1,
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  sheet: 1,
  initialFocus: 1,
  className: 1,
  style: 1,
  onKeyDown: 1,
  onBlur: 1
};
var NARROW = "(max-width: 639.98px)";
var noSubscribe = () => () => {
};
var narrowMedia = () => mediaList(NARROW);
var subscribeNarrow = (on) => {
  const m = narrowMedia();
  m.addEventListener("change", on);
  return () => m.removeEventListener("change", on);
};
var isNarrow = () => narrowMedia().matches;
var notNarrow = () => false;
var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function PopoverRender(t0) {
  const $ = _c(44);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Popover", NAME_HOW.title);
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-pop", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const own = t2;
  const id = props.id || own;
  const [isOpen, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "Popover", "open");
  const open = !!isOpen;
  const panelRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const askRef = useLatest(props.onOpenChange);
  const shownRef = useLatest(open);
  let t3;
  if ($[2] !== askRef || $[3] !== controlled || $[4] !== setInner || $[5] !== shownRef) {
    t3 = (v, reason) => {
      if (v === shownRef.current) {
        return;
      }
      if (!controlled) {
        shownRef.current = v;
        setInner(v);
      }
      if (askRef.current) {
        askRef.current(v, {
          reason
        });
      }
    };
    $[2] = askRef;
    $[3] = controlled;
    $[4] = setInner;
    $[5] = shownRef;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  const set = t3;
  let t4;
  if ($[7] !== set) {
    t4 = (reason_0, focusTrigger) => {
      set(false, reason_0);
      if (focusTrigger && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
    $[7] = set;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const close = t4;
  let t5;
  if ($[9] !== close) {
    t5 = () => close("close", true);
    $[9] = close;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const closeFromContent = t5;
  const focusFirst = props.initialFocus !== "panel";
  const exit = useExit(open, panelRef);
  const mobile = props.sheet === "mobile";
  const narrow = React.useSyncExternalStore(mobile ? subscribeNarrow : noSubscribe, mobile ? isNarrow : notNarrow, notNarrow);
  const sheet = props.sheet === true || narrow;
  let t6;
  if ($[11] !== close) {
    t6 = () => close("outside", false);
    $[11] = close;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  useAnchoredLayer(open, panelRef, triggerRef, {
    placement: props.placement,
    offsetVar: "--srp-popover-offset",
    onOutside: t6,
    inside: triggerRef,
    docked: sheet
  });
  let t7;
  if ($[13] !== focusFirst || $[14] !== open) {
    t7 = () => {
      const panel = panelRef.current;
      if (!open || !panel) {
        return;
      }
      if (process.env.NODE_ENV !== "production" && panel.parentElement?.closest("form") && panel.querySelector("form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])")) {
        warnOnce("overlay-in-form", "Popover: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Popover after the form.");
      }
      const how = lastInputKeyboard() ? {
        focusVisible: true
      } : void 0;
      const took = focusFirst && Array.from(panel.querySelectorAll(FOCUSABLE)).some((el) => el.tabIndex >= 0 && (el.focus(how), activeIn(el) === el));
      if (!took) {
        panel.focus(how);
      }
    };
    $[13] = focusFirst;
    $[14] = open;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  let t8;
  if ($[16] !== open) {
    t8 = [open];
    $[16] = open;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  useIsoLayoutEffect(t7, t8);
  const onKeyDown = (e) => {
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
    if (e.defaultPrevented) {
      return;
    }
    if (e.key === "Escape" && !isComposing(e)) {
      e.preventDefault();
      e.stopPropagation();
      close("escape", true);
    }
  };
  const onBlur = (e_0) => {
    if (props.onBlur) {
      props.onBlur(e_0);
    }
    const to = e_0.relatedTarget;
    if (!to) {
      return;
    }
    if (panelRef.current && panelRef.current.contains(to)) {
      return;
    }
    if (triggerRef.current && triggerRef.current.contains(to)) {
      return;
    }
    close("blur", false);
  };
  const child = oneElement(props.trigger, "Popover", "trigger");
  useTriggerRef(triggerRef, "Popover");
  const cp = child.props;
  const childRef = elementRef(child);
  const triggerRefs = useMergedRef(childRef, void 0, triggerRef);
  const Trigger = child.type;
  const trigger = /* @__PURE__ */ React.createElement(Trigger, { ...cp, key: child.key, ref: triggerRefs, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? id : void 0, onClick: (e_1) => {
    if (cp.onClick) {
      cp.onClick(e_1);
    }
    if (e_1.defaultPrevented) {
      return;
    }
    set(!open, "trigger");
  } });
  const titled = props.title != null && props.title !== false && props.title !== "";
  const H = "h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel) >= 0 ? props.headingLevel : 2);
  const content = typeof props.children === "function" ? /* @__PURE__ */ React.createElement(WithClose, { render: props.children, close: closeFromContent }) : props.children;
  const mergedRef = useMergedRef(ref, titled ? void 0 : nameRef, panelRef);
  const T0 = Panel;
  const t9 = omit(props, OWN);
  const t10 = "dialog";
  const t11 = -1;
  let t12;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = {
      popover: "manual"
    };
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  const t13 = !open || void 0;
  const t14 = titled ? id + "-title" : props["aria-labelledby"];
  const t15 = titled ? void 0 : props["aria-label"];
  const t16 = cn("srp-popover", sheet && "srp-popover--sheet", props.className);
  const t17 = open ? "open" : "closed";
  const t18 = exit.instant ? "" : void 0;
  const t19 = !open || void 0;
  let t20;
  if ($[19] !== H || $[20] !== content || $[21] !== exit.leaving || $[22] !== id || $[23] !== open || $[24] !== props.title || $[25] !== titled) {
    t20 = open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, titled ? /* @__PURE__ */ React.createElement(H, { id: id + "-title", className: "srp-popover__title" }, props.title) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-popover__body" }, content)) : null;
    $[19] = H;
    $[20] = content;
    $[21] = exit.leaving;
    $[22] = id;
    $[23] = open;
    $[24] = props.title;
    $[25] = titled;
    $[26] = t20;
  } else {
    t20 = $[26];
  }
  let t21;
  if ($[27] !== T0 || $[28] !== id || $[29] !== mergedRef || $[30] !== onBlur || $[31] !== onKeyDown || $[32] !== props.style || $[33] !== t12 || $[34] !== t13 || $[35] !== t14 || $[36] !== t15 || $[37] !== t16 || $[38] !== t17 || $[39] !== t18 || $[40] !== t19 || $[41] !== t20 || $[42] !== t9) {
    t21 = /* @__PURE__ */ React.createElement(T0, { ...t9, ref: mergedRef, id, role: t10, tabIndex: t11, ...t12, hidden: t13, "aria-labelledby": t14, "aria-label": t15, className: t16, style: props.style, "data-component": "popover", "data-state": t17, "data-instant": t18, inert: t19, onKeyDown, onBlur }, t20);
    $[27] = T0;
    $[28] = id;
    $[29] = mergedRef;
    $[30] = onBlur;
    $[31] = onKeyDown;
    $[32] = props.style;
    $[33] = t12;
    $[34] = t13;
    $[35] = t14;
    $[36] = t15;
    $[37] = t16;
    $[38] = t17;
    $[39] = t18;
    $[40] = t19;
    $[41] = t20;
    $[42] = t9;
    $[43] = t21;
  } else {
    t21 = $[43];
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, trigger, t21);
}
function WithClose({
  render,
  close
}) {
  return render(close);
}
var Popover = /* @__PURE__ */ named("Popover", PopoverRender);
export {
  Popover
};
//# sourceMappingURL=Popover.js.map
