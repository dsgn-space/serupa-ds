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
  finalFocus: 1,
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
  const $ = _c(46);
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
  const finalRef = useLatest(props.finalFocus);
  let t4;
  if ($[7] !== finalRef || $[8] !== set) {
    t4 = (reason_0, focusTrigger) => {
      set(false, reason_0);
      if (!focusTrigger) {
        return;
      }
      const back = finalRef.current && finalRef.current.current;
      const to = back && back.isConnected ? back : triggerRef.current;
      if (to) {
        to.focus();
      }
    };
    $[7] = finalRef;
    $[8] = set;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const close = t4;
  let t5;
  if ($[10] !== close) {
    t5 = () => close("close", true);
    $[10] = close;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const closeFromContent = t5;
  const focusFirst = props.initialFocus !== "panel";
  const initialRef = useLatest(typeof props.initialFocus === "object" ? props.initialFocus : void 0);
  const exit = useExit(open, panelRef);
  const mobile = props.sheet === "mobile";
  const narrow = React.useSyncExternalStore(mobile ? subscribeNarrow : noSubscribe, mobile ? isNarrow : notNarrow, notNarrow);
  const sheet = props.sheet === true || narrow;
  let t6;
  if ($[12] !== close) {
    t6 = () => close("outside", false);
    $[12] = close;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  useAnchoredLayer(open, panelRef, triggerRef, {
    placement: props.placement,
    offsetVar: "--srp-popover-offset",
    onOutside: t6,
    inside: triggerRef,
    docked: sheet
  });
  let t7;
  if ($[14] !== focusFirst || $[15] !== initialRef || $[16] !== open) {
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
      const pick = initialRef.current && initialRef.current.current;
      if (pick && panel.contains(pick)) {
        pick.focus(how);
        if (activeIn(pick) === pick) {
          return;
        }
      }
      const took = focusFirst && Array.from(panel.querySelectorAll(FOCUSABLE)).some((el) => el.tabIndex >= 0 && (el.focus(how), activeIn(el) === el));
      if (!took) {
        panel.focus(how);
      }
    };
    $[14] = focusFirst;
    $[15] = initialRef;
    $[16] = open;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  let t8;
  if ($[18] !== open) {
    t8 = [open];
    $[18] = open;
    $[19] = t8;
  } else {
    t8 = $[19];
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
    const to_0 = e_0.relatedTarget;
    if (!to_0) {
      return;
    }
    if (panelRef.current && panelRef.current.contains(to_0)) {
      return;
    }
    if (triggerRef.current && triggerRef.current.contains(to_0)) {
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
  if ($[20] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = {
      popover: "manual"
    };
    $[20] = t12;
  } else {
    t12 = $[20];
  }
  const t13 = !open || void 0;
  const t14 = titled ? id + "-title" : props["aria-labelledby"];
  const t15 = titled ? void 0 : props["aria-label"];
  const t16 = cn("srp-popover", sheet && "srp-popover--sheet", props.className);
  const t17 = open ? "open" : "closed";
  const t18 = exit.instant ? "" : void 0;
  const t19 = !open || void 0;
  let t20;
  if ($[21] !== H || $[22] !== content || $[23] !== exit.leaving || $[24] !== id || $[25] !== open || $[26] !== props.title || $[27] !== titled) {
    t20 = open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, titled ? /* @__PURE__ */ React.createElement(H, { id: id + "-title", className: "srp-popover__title" }, props.title) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-popover__body" }, content)) : null;
    $[21] = H;
    $[22] = content;
    $[23] = exit.leaving;
    $[24] = id;
    $[25] = open;
    $[26] = props.title;
    $[27] = titled;
    $[28] = t20;
  } else {
    t20 = $[28];
  }
  let t21;
  if ($[29] !== T0 || $[30] !== id || $[31] !== mergedRef || $[32] !== onBlur || $[33] !== onKeyDown || $[34] !== props.style || $[35] !== t12 || $[36] !== t13 || $[37] !== t14 || $[38] !== t15 || $[39] !== t16 || $[40] !== t17 || $[41] !== t18 || $[42] !== t19 || $[43] !== t20 || $[44] !== t9) {
    t21 = /* @__PURE__ */ React.createElement(T0, { ...t9, ref: mergedRef, id, role: t10, tabIndex: t11, ...t12, hidden: t13, "aria-labelledby": t14, "aria-label": t15, className: t16, style: props.style, "data-component": "popover", "data-state": t17, "data-instant": t18, inert: t19, onKeyDown, onBlur }, t20);
    $[29] = T0;
    $[30] = id;
    $[31] = mergedRef;
    $[32] = onBlur;
    $[33] = onKeyDown;
    $[34] = props.style;
    $[35] = t12;
    $[36] = t13;
    $[37] = t14;
    $[38] = t15;
    $[39] = t16;
    $[40] = t17;
    $[41] = t18;
    $[42] = t19;
    $[43] = t20;
    $[44] = t9;
    $[45] = t21;
  } else {
    t21 = $[45];
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
