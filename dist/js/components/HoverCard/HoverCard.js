"use client";

// src/components/HoverCard/HoverCard.tsx
import * as React from "react";
import { cn, domId, elementRef, omit, useMergedRef, useLatest } from "../../internal/cn.js";
import { oneElement, useTriggerRef } from "../../internal/trigger.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { cardIntent, cardLeave } from "../../internal/timing.js";
import { useControllable } from "../../internal/controllable.js";
var Panel = "span";
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
function HoverCardRender({
  ref,
  ...props
}) {
  const own = domId("srp-hcard", React.useId());
  const id = props.id || own;
  const [shown, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "HoverCard", "open");
  const open = !props.disabled && !!shown;
  const cardRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const timer = React.useRef(void 0);
  const ask = useLatest(props.onOpenChange);
  const openRef = useLatest(open);
  const set = React.useCallback((v, reason) => {
    window.clearTimeout(timer.current);
    if (v === openRef.current) return;
    if (!controlled) setInner(v);
    if (ask.current) ask.current(v, {
      reason
    });
  }, [controlled, setInner, ask, openRef]);
  const muted = React.useRef(false);
  const armed = React.useRef(null);
  const unarm = () => {
    if (armed.current) document.removeEventListener("keydown", armed.current, true);
    armed.current = null;
  };
  const later = (v_0, ms, reason_0) => {
    window.clearTimeout(timer.current);
    unarm();
    if (v_0 && muted.current) return;
    timer.current = window.setTimeout(() => {
      unarm();
      set(v_0, reason_0);
    }, ms);
    if (!v_0 || openRef.current) return;
    const esc = (e) => {
      if (e.key !== "Escape" || isComposing(e)) return;
      window.clearTimeout(timer.current);
      unarm();
      muted.current = true;
    };
    armed.current = esc;
    document.addEventListener("keydown", esc, true);
  };
  const unmute = () => {
    muted.current = false;
  };
  const stay = () => window.clearTimeout(timer.current);
  React.useEffect(() => () => {
    window.clearTimeout(timer.current);
    unarm();
  }, []);
  const openDelay = props.openDelay == null ? cardIntent : props.openDelay;
  const closeDelay = props.closeDelay == null ? cardLeave : props.closeDelay;
  const exit = useExit(open, cardRef);
  useAnchoredLayer(open, cardRef, triggerRef, {
    placement: props.placement,
    offsetVar: "--srp-hover-card-offset",
    watch: props.children,
    onOutside: () => set(false, "outside"),
    inside: triggerRef
  });
  React.useEffect(() => {
    if (!open) return;
    const esc_0 = (e_0) => {
      if (e_0.key !== "Escape" || isComposing(e_0)) return;
      e_0.preventDefault();
      e_0.stopPropagation();
      const card = cardRef.current, back = !!card && card.contains(e_0.target);
      set(false, "escape");
      if (back && triggerRef.current) triggerRef.current.focus();
    };
    document.addEventListener("keydown", esc_0, true);
    return () => document.removeEventListener("keydown", esc_0, true);
  }, [open, set]);
  const within = (to) => !!to && (!!cardRef.current && cardRef.current.contains(to) || !!triggerRef.current && triggerRef.current.contains(to));
  const blurred = (e_1) => {
    if (!within(e_1.relatedTarget)) {
      unmute();
      later(false, closeDelay, "blur");
    }
  };
  const touch = (e_2) => "pointerType" in e_2 && e_2.pointerType === "touch";
  const hovered = React.useRef(false), focused = React.useRef(false);
  const fromInterest = () => {
    if (!props.disabled && !hovered.current && !focused.current) set(true, "hover");
  };
  const interest = useLatest(fromInterest);
  React.useEffect(() => {
    const card_0 = cardRef.current;
    if (!card_0) return;
    const on = (e_3) => {
      e_3.preventDefault();
      interest.current();
    };
    const lose = (e_4) => {
      e_4.preventDefault();
    };
    card_0.addEventListener("interest", on);
    card_0.addEventListener("loseinterest", lose);
    return () => {
      card_0.removeEventListener("interest", on);
      card_0.removeEventListener("loseinterest", lose);
    };
  }, [interest]);
  const child = oneElement(props.trigger, "HoverCard", "trigger");
  useTriggerRef(triggerRef, "HoverCard");
  const cp = child.props;
  const childRef = elementRef(child);
  const triggerRefs = useMergedRef(childRef, (n) => {
    triggerRef.current = n;
  });
  const chain = (name, fn) => (e_5) => {
    const f = cp[name];
    if (typeof f === "function") f(e_5);
    fn(e_5);
  };
  const trigger = React.cloneElement(child, {
    ref: triggerRefs,
    ...{
      interestfor: id
    },
    // not in React's types yet
    // Pointer events, not mouse events: a tap sends a mouseenter and never a mouseleave. A touch pointer doesn't hover.
    onPointerEnter: chain("onPointerEnter", (e_6) => {
      if (touch(e_6)) return;
      hovered.current = true;
      if (openRef.current) stay();
      else later(true, openDelay, "hover");
    }),
    onPointerLeave: chain("onPointerLeave", (e_7) => {
      if (!touch(e_7)) {
        hovered.current = false;
        unmute();
        later(false, closeDelay, "hover");
      }
    }),
    // Keyboard focus only (focus-visible): a click on the link is on its way to the page it opens.
    onFocus: chain("onFocus", (e_8) => {
      const t = e_8.target;
      if (openRef.current) stay();
      else if (!t.matches || t.matches(":focus-visible")) {
        focused.current = true;
        later(true, openDelay, "focus");
      }
    }),
    onBlur: chain("onBlur", (e_9) => {
      focused.current = false;
      blurred(e_9);
    })
  });
  const mergedRef = useMergedRef(ref, (n_0) => {
    cardRef.current = n_0;
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, trigger, /* @__PURE__ */ React.createElement(Panel, { ...omit(props, OWN), ref: mergedRef, id, ...{
    popover: "manual"
  }, hidden: !open || void 0, className: cn("srp-hover-card", props.className), style: props.style, "data-component": "hover-card", "data-state": open ? "open" : "closed", "data-instant": exit.instant ? "" : void 0, inert: !open || void 0, onPointerEnter: (e_10) => {
    if (props.onPointerEnter) props.onPointerEnter(e_10);
    stay();
  }, onPointerLeave: (e_11) => {
    if (props.onPointerLeave) props.onPointerLeave(e_11);
    if (!touch(e_11)) later(false, closeDelay, "hover");
  }, onFocus: (e_12) => {
    if (props.onFocus) props.onFocus(e_12);
    stay();
  }, onBlur: (e_13) => {
    if (props.onBlur) props.onBlur(e_13);
    blurred(e_13);
  } }, open || exit.leaving ? props.children : null));
}
var HoverCard = /* @__PURE__ */ named("HoverCard", HoverCardRender);
export {
  HoverCard
};
//# sourceMappingURL=HoverCard.js.map
