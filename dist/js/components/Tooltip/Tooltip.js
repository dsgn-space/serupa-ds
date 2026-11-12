"use client";

// src/components/Tooltip/Tooltip.tsx
import * as React from "react";
import { cn, domId, elementRef, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { oneElement, useTriggerRef } from "../../internal/trigger.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { hoverIntent, hoverLeave, hoverWarm } from "../../internal/timing.js";
import { warnOnce } from "../../internal/warn.js";
var warm = { until: 0, owner: null, close: null };
function coolTooltips() {
  warm.until = 0;
}
var OWN = { content: 1, children: 1, placement: 1, openDelay: 1, delay: 1, role: 1, open: 1, defaultOpen: 1, onOpenChange: 1, disabled: 1, className: 1, style: 1, ref: 1 };
var Tooltip = /* @__PURE__ */ named("Tooltip", function Tooltip2(props) {
  const id = domId("dk-tip", React.useId());
  const [inner, setInner] = React.useState(!!props.defaultOpen);
  const controlled = props.open !== void 0;
  const open = !props.disabled && (controlled ? !!props.open : inner);
  const tipRef = React.useRef(null);
  const anchorRef = React.useRef(null);
  const timer = React.useRef(void 0);
  const onOpenChange = React.useRef(props.onOpenChange);
  onOpenChange.current = props.onOpenChange;
  const shown = React.useRef(open);
  shown.current = open;
  const off = React.useRef(props.disabled);
  off.current = props.disabled;
  const set = React.useCallback((v, reason) => {
    window.clearTimeout(timer.current);
    if (v === shown.current || v && off.current) return;
    if (!controlled) {
      shown.current = v;
      setInner(v);
    }
    if (onOpenChange.current) onOpenChange.current(v, { reason });
  }, [controlled]);
  const armed = React.useRef(null);
  const unarm = () => {
    if (armed.current) document.removeEventListener("keydown", armed.current, true);
    armed.current = null;
  };
  const later = (v, ms) => {
    window.clearTimeout(timer.current);
    unarm();
    timer.current = window.setTimeout(() => {
      unarm();
      set(v, "hover");
    }, ms);
    if (!v || shown.current) return;
    const esc = (e) => {
      if (e.key === "Escape" && !isComposing(e)) {
        window.clearTimeout(timer.current);
        unarm();
      }
    };
    armed.current = esc;
    document.addEventListener("keydown", esc, true);
  };
  React.useEffect(() => () => {
    window.clearTimeout(timer.current);
    unarm();
  }, []);
  const hovered = React.useRef(false), focused = React.useRef(false);
  const fromInterest = () => {
    if (!hovered.current && !focused.current) {
      setInstant(true);
      set(true, "hover");
    }
  };
  const interest = React.useRef(fromInterest);
  interest.current = fromInterest;
  React.useEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const on = (e) => {
      e.preventDefault();
      interest.current();
    };
    const lose = (e) => {
      e.preventDefault();
    };
    tip.addEventListener("interest", on);
    tip.addEventListener("loseinterest", lose);
    return () => {
      tip.removeEventListener("interest", on);
      tip.removeEventListener("loseinterest", lose);
    };
  }, []);
  const self = React.useRef({});
  const [instant, setInstant] = React.useState(open);
  const [handed, setHanded] = React.useState(false);
  if (open && handed) setHanded(false);
  React.useEffect(() => {
    if (!open) return;
    const me = self.current;
    if (warm.close && warm.owner !== me) warm.close();
    warm.owner = me;
    warm.close = () => {
      setHanded(true);
      set(false, "hover");
    };
    return () => {
      if (warm.owner === me) {
        warm.owner = null;
        warm.close = null;
      }
      warm.until = Date.now() + hoverWarm;
    };
  }, [open, set]);
  const [full, setFull] = React.useState("");
  useIsoLayoutEffect(() => {
    const a = anchorRef.current;
    if (!open || !a || props.role === "label") return;
    let cut = "";
    for (const n of [a].concat(Array.prototype.slice.call(a.querySelectorAll("*")))) {
      if (n.scrollWidth > n.clientWidth && getComputedStyle(n).textOverflow === "ellipsis") cut = n.textContent || "";
    }
    setFull(cut.trim());
  }, [open, props.role]);
  useAnchoredLayer(open, tipRef, anchorRef, { placement: props.placement, fallback: "top", offsetVar: "--dk-tooltip-offset", watch: full || props.content, onOutside: () => set(false, "outside") });
  React.useEffect(() => {
    const tip = tipRef.current;
    if (process.env.NODE_ENV !== "production" && tip && tip.querySelector("a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]")) warnOnce("tooltip-interactive", "Tooltip: its content holds a link, button or field, and nobody can use it: focus leaving the element hides the tooltip, so the keyboard can't reach it, and touch screens never show it. Keep content to plain text; for anything people press, use a Popover.");
  }, [props.content]);
  React.useEffect(() => {
    if (!open) return;
    const esc = (e) => {
      if (e.key === "Escape" && !isComposing(e)) {
        e.preventDefault();
        e.stopPropagation();
        set(false, "escape");
      }
    };
    document.addEventListener("keydown", esc, true);
    return () => document.removeEventListener("keydown", esc, true);
  }, [open, set]);
  const child = oneElement(props.children, "Tooltip", "child");
  useTriggerRef(anchorRef, "Tooltip");
  const passed = omit(props, OWN);
  const fwd = {};
  for (const k in passed) {
    const own = child.props[k], add = passed[k];
    fwd[k] = typeof own === "function" && typeof add === "function" ? (e) => {
      own(e);
      add(e);
    } : k === "id" && own ? own : (k === "aria-describedby" || k === "aria-labelledby") && typeof own === "string" && typeof add === "string" ? own + " " + add : add;
  }
  const cp = { ...child.props, ...fwd };
  const passedRef = props.ref;
  if (process.env.NODE_ENV !== "production" && props.delay != null) warnOnce("tooltip-delay", "Tooltip: delay is deprecated and removed in 15.0.0. Use openDelay, which does the same.");
  const delay = props.openDelay ?? props.delay ?? hoverIntent;
  const touch = (e) => "pointerType" in e && e.pointerType === "touch";
  const chain = (name, fn) => (e) => {
    const own = cp[name];
    if (typeof own === "function") own(e);
    fn(e);
  };
  const childRef = elementRef(child);
  const anchorRefs = useMergedRef(childRef, (n) => {
    anchorRef.current = n;
  }, passedRef);
  const aria = props.role === "label" ? "aria-labelledby" : "aria-describedby";
  const merged = [cp[aria], id].filter(Boolean).join(" ");
  const trigger = React.cloneElement(child, {
    ...fwd,
    ref: anchorRefs,
    [aria]: merged,
    ...{ interestfor: id },
    // not in React's types yet
    // Pointer events, not mouse events: a tap sends a mouseenter after its pointerdown and never a mouseleave, so the
    // tooltip opened 400ms after a tap and stayed. A touch pointer doesn't hover; focus still shows it from the keyboard.
    onPointerEnter: chain("onPointerEnter", (e) => {
      if (!touch(e)) {
        hovered.current = true;
        const w = !!warm.owner || Date.now() < warm.until;
        setInstant(w);
        if (w) set(true, "hover");
        else later(true, delay);
      }
    }),
    onPointerLeave: chain("onPointerLeave", (e) => {
      if (!touch(e)) {
        hovered.current = false;
        later(false, hoverLeave);
      }
    }),
    onFocus: chain("onFocus", (e) => {
      const t = e.target;
      if (!t.matches || t.matches(":focus-visible")) {
        focused.current = true;
        setInstant(!!warm.owner || Date.now() < warm.until);
        set(true, "focus");
      }
    }),
    onBlur: chain("onBlur", () => {
      focused.current = false;
      set(false, "blur");
    }),
    onPointerDown: chain("onPointerDown", () => set(false, "trigger"))
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, trigger, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: tipRef,
      id,
      role: "tooltip",
      ...{ popover: "manual" },
      hidden: !open || void 0,
      className: cn("dk-tooltip", props.className),
      style: props.style,
      "data-component": "tooltip",
      "data-state": open ? "open" : "closed",
      "data-warm": open && instant || !open && handed ? "" : void 0,
      onMouseEnter: () => window.clearTimeout(timer.current),
      onMouseLeave: () => later(false, hoverLeave)
    },
    full && props.role !== "label" ? /* @__PURE__ */ React.createElement("span", { "data-full": "", "aria-hidden": "true" }, full) : null,
    props.content
  ));
});
export {
  Tooltip,
  coolTooltips
};
//# sourceMappingURL=Tooltip.js.map
