"use client";

// src/components/Accordion/Accordion.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, oneOf, omit, useLatest } from "../../internal/cn.js";
import { reducedMotion } from "../../internal/mediaList.js";
import { toMs } from "../../internal/cssTime.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { flattenChildren } from "../../internal/children.js";
import * as icons from "../../material/builtin.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { hideUntilFound, revealInvalid } from "../../internal/untilFound.js";
import { buttonClass } from "../Button/buttonClass.js";
import { en as words } from "./labels.js";
var AccordionContext = /* @__PURE__ */ React.createContext(null);
var swapTime = (panel, swapping) => {
  if (!swapping) return 0;
  const cs = getComputedStyle(panel);
  return toMs(cs.getPropertyValue("--accordion-duration") || cs.getPropertyValue("--motion-change-md"));
};
function AccordionRender(t0) {
  const $ = _c(10);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    selectionMode: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    collapsible: 1,
    variant: 1,
    headingLevel: 1,
    showExpandAll: 1,
    className: 1,
    children: 1
  });
  const labels = useSettings(words).labels;
  const single = props.selectionMode === "single";
  const [open, setInner, controlled] = useControllable(props.value, (props.defaultValue || []).slice(0, single ? 1 : void 0), "Accordion", "value");
  if (process.env.NODE_ENV !== "production" && single && controlled && open.length > 1) {
    warnOnce("accordion-single-value", `Accordion: value has ${open.length} items with selectionMode="single", so ${open.length} items show open; pass one value, or selectionMode="multiple".`);
  }
  const collapsible = props.collapsible !== false;
  const onChange = useLatest(props.onValueChange);
  let t1;
  if ($[0] !== controlled || $[1] !== onChange || $[2] !== setInner) {
    t1 = (next) => {
      if (!controlled) {
        setInner(next);
      }
      if (onChange.current) {
        onChange.current(next);
      }
    };
    $[0] = controlled;
    $[1] = onChange;
    $[2] = setInner;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const change = t1;
  let t2;
  if ($[4] !== change || $[5] !== collapsible || $[6] !== open || $[7] !== single) {
    t2 = (v) => {
      const isOpen = open.indexOf(v) >= 0;
      let next_0;
      if (single) {
        next_0 = isOpen ? collapsible ? [] : open : [v];
      } else {
        next_0 = isOpen ? open.filter((x) => x !== v) : open.concat(v);
      }
      if (next_0 !== open) {
        change(next_0);
      }
    };
    $[4] = change;
    $[5] = collapsible;
    $[6] = open;
    $[7] = single;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const toggle = t2;
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) >= 0 ? props.headingLevel : 3;
  const variant = oneOf(["plain", "card"], props.variant, "plain");
  const items = [];
  for (const c of flattenChildren(props.children)) {
    items.push(React.isValidElement(c) ? React.cloneElement(c, {
      "data-index": String(items.filter(React.isValidElement).length)
    }) : c);
  }
  const many = !single && items.filter(React.isValidElement).length > 6;
  let all = null;
  if (props.showExpandAll && !single) {
    const values = items.flatMap(_temp);
    const allOpen = values.length > 0 && values.every((v_0) => open.indexOf(v_0) >= 0);
    const onAll = () => change(allOpen ? open.filter((v_1) => values.indexOf(v_1) < 0) : open.concat(values.filter((v_2) => open.indexOf(v_2) < 0)));
    let t3;
    if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t3 = buttonClass({
        variant: "link",
        size: "sm",
        className: "srp-accordion__all"
      });
      $[9] = t3;
    } else {
      t3 = $[9];
    }
    all = /* @__PURE__ */ React.createElement("div", { className: "srp-accordion__toolbar" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: t3, onClick: onAll, disabled: !values.length, "aria-expanded": allOpen }, allOpen ? labels.collapseAll : labels.expandAll));
  }
  return /* @__PURE__ */ React.createElement(AccordionContext.Provider, { value: {
    open,
    toggle,
    level,
    collapsible,
    single,
    many
  } }, /* @__PURE__ */ React.createElement("div", { ...rest, ref, "data-component": "accordion", className: cn("srp-accordion", variant === "card" && "srp-accordion--card", props.className) }, all, items));
}
function _temp(c_0) {
  if (!React.isValidElement(c_0)) {
    return [];
  }
  const p = c_0.props;
  return p.disabled ? [] : [p.value != null ? p.value : String(p["data-index"])];
}
var Accordion = /* @__PURE__ */ named("Accordion", AccordionRender);
function AccordionItemRender(t0) {
  const $ = _c(48);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(AccordionContext);
  const rest = omit(props, {
    value: 1,
    title: 1,
    disabled: 1,
    keepMounted: 1,
    className: 1,
    children: 1
  });
  const index = String(rest["data-index"] || "0");
  delete rest["data-index"];
  const value = props.value != null ? props.value : index;
  const open = !!ctx && ctx.open.indexOf(value) >= 0;
  const id = domId("srp-acc", React.useId());
  const locked = !!ctx && open && ctx.single && !ctx.collapsible;
  const H = "h" + (ctx ? ctx.level : 3);
  const [startsClosed] = React.useState(!open);
  const content = React.useRef(null);
  const toggle = useLatest(ctx && !open && !props.disabled ? () => ctx.toggle(value) : null);
  const findable = !props.disabled;
  const keep = props.keepMounted !== false;
  const [mounted, setMounted] = React.useState(open || keep);
  if ((open || keep) && !mounted) {
    setMounted(true);
  }
  const swapping = useLatest(!!ctx && ctx.single && !open && ctx.open.length > 0);
  const growRef = React.useRef(null);
  let t1;
  let t2;
  if ($[0] !== findable || $[1] !== keep || $[2] !== open || $[3] !== swapping) {
    t1 = function() {
      const el = content.current;
      const panel = el && el.closest(".srp-accordion__panel");
      if (!el || !panel) {
        return;
      }
      if (open || !findable && keep) {
        el.removeAttribute("hidden");
        return;
      }
      const style = getComputedStyle(panel);
      const delays = style.transitionDelay.split(",");
      const fold = Math.max(0, ...style.transitionDuration.split(",").map((d, i) => toMs(d) + toMs(delays[i] || "0")));
      const ms = fold ? Math.max(fold, swapTime(panel, swapping.current)) : 0;
      const hold = (on) => {
        panel.style.contentVisibility = on ? "visible" : "";
      };
      const hide = () => {
        hold(false);
        if (growRef.current) {
          growRef.current.cancel();
          growRef.current = null;
        }
        if (findable) {
          hideUntilFound(el);
        }
        if (!keep) {
          setMounted(false);
        }
      };
      if (ms) {
        hold(true);
      }
      if (!ms || !el.isConnected || panel.getBoundingClientRect().height === 0) {
        hide();
        return;
      }
      const t = setTimeout(hide, ms);
      return () => {
        clearTimeout(t);
        hold(false);
      };
    };
    t2 = [open, findable, keep, swapping];
    $[0] = findable;
    $[1] = keep;
    $[2] = open;
    $[3] = swapping;
    $[4] = t1;
    $[5] = t2;
  } else {
    t1 = $[4];
    t2 = $[5];
  }
  React.useLayoutEffect(t1, t2);
  const was = React.useRef(open);
  let t3;
  let t4;
  if ($[6] !== open || $[7] !== swapping) {
    t3 = function() {
      const panel_0 = content.current && content.current.closest(".srp-accordion__panel");
      if (!panel_0 || was.current === open) {
        return;
      }
      was.current = open;
      const from = growRef.current ? panel_0.getBoundingClientRect().height : open ? 0 : panel_0.offsetHeight;
      if (growRef.current) {
        growRef.current.cancel();
        growRef.current = null;
      }
      const fade = typeof panel_0.getAnimations === "function" ? panel_0.getAnimations().find(_temp2) : null;
      const timing = fade && fade.effect ? fade.effect.getTiming() : null;
      if (!timing || !timing.duration || reducedMotion(panel_0)) {
        return;
      }
      const to = open ? panel_0.offsetHeight : 0;
      if (from === to) {
        return;
      }
      const swap = swapTime(panel_0, swapping.current);
      const easing = open ? timing.easing : getComputedStyle(panel_0).getPropertyValue(swap ? "--ease-enter" : "--ease-move").trim() || timing.easing;
      growRef.current = panel_0.animate({
        height: [from + "px", to + "px"]
      }, {
        duration: swap || timing.duration,
        easing,
        fill: open ? "none" : "forwards"
      });
      growRef.current.id = "srp-accordion-height";
      if (open) {
        growRef.current.onfinish = () => {
          growRef.current = null;
        };
      }
    };
    t4 = [open, swapping];
    $[6] = open;
    $[7] = swapping;
    $[8] = t3;
    $[9] = t4;
  } else {
    t3 = $[8];
    t4 = $[9];
  }
  React.useLayoutEffect(t3, t4);
  let t5;
  let t6;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => () => {
      if (growRef.current) {
        growRef.current.cancel();
      }
    };
    t6 = [];
    $[10] = t5;
    $[11] = t6;
  } else {
    t5 = $[10];
    t6 = $[11];
  }
  React.useEffect(t5, t6);
  let t7;
  let t8;
  if ($[12] !== toggle) {
    t7 = function() {
      const el_0 = content.current;
      if (!el_0) {
        return;
      }
      const onMatch = () => {
        if (toggle.current) {
          toggle.current();
        }
      };
      el_0.addEventListener("beforematch", onMatch);
      el_0.addEventListener("invalid", revealInvalid, true);
      return () => {
        el_0.removeEventListener("beforematch", onMatch);
        el_0.removeEventListener("invalid", revealInvalid, true);
      };
    };
    t8 = [toggle];
    $[12] = toggle;
    $[13] = t7;
    $[14] = t8;
  } else {
    t7 = $[13];
    t8 = $[14];
  }
  React.useEffect(t7, t8);
  const t9 = open ? "open" : "closed";
  const t10 = cn("srp-accordion__item", open && "srp-accordion__item--open", props.disabled && "srp-accordion__item--disabled", props.className);
  const t11 = id + "-t";
  const t12 = id + "-p";
  const t13 = locked ? true : void 0;
  let t14;
  if ($[15] !== ctx || $[16] !== locked || $[17] !== value) {
    t14 = () => {
      if (ctx && !locked) {
        ctx.toggle(value);
      }
    };
    $[15] = ctx;
    $[16] = locked;
    $[17] = value;
    $[18] = t14;
  } else {
    t14 = $[18];
  }
  let t15;
  if ($[19] !== props.title) {
    t15 = /* @__PURE__ */ React.createElement("span", { className: "srp-accordion__title" }, props.title);
    $[19] = props.title;
    $[20] = t15;
  } else {
    t15 = $[20];
  }
  let t16;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-accordion__icon" });
    $[21] = t16;
  } else {
    t16 = $[21];
  }
  let t17;
  if ($[22] !== open || $[23] !== props.disabled || $[24] !== t11 || $[25] !== t12 || $[26] !== t13 || $[27] !== t14 || $[28] !== t15) {
    t17 = /* @__PURE__ */ React.createElement("button", { type: "button", id: t11, className: "srp-accordion__trigger", "aria-expanded": open, "aria-controls": t12, disabled: props.disabled, "aria-disabled": t13, onClick: t14 }, t15, t16);
    $[22] = open;
    $[23] = props.disabled;
    $[24] = t11;
    $[25] = t12;
    $[26] = t13;
    $[27] = t14;
    $[28] = t15;
    $[29] = t17;
  } else {
    t17 = $[29];
  }
  let t18;
  if ($[30] !== H || $[31] !== t17) {
    t18 = /* @__PURE__ */ React.createElement(H, { className: "srp-accordion__heading" }, t17);
    $[30] = H;
    $[31] = t17;
    $[32] = t18;
  } else {
    t18 = $[32];
  }
  const t19 = id + "-p";
  const t20 = open && !(ctx && ctx.many) ? "region" : void 0;
  const t21 = id + "-t";
  const t22 = startsClosed || void 0;
  const t23 = mounted ? props.children : null;
  let t24;
  if ($[33] !== t22 || $[34] !== t23) {
    t24 = /* @__PURE__ */ React.createElement("div", { className: "srp-accordion__clip" }, /* @__PURE__ */ React.createElement("div", { ref: content, className: "srp-accordion__content", hidden: t22 }, t23));
    $[33] = t22;
    $[34] = t23;
    $[35] = t24;
  } else {
    t24 = $[35];
  }
  let t25;
  if ($[36] !== t19 || $[37] !== t20 || $[38] !== t21 || $[39] !== t24) {
    t25 = /* @__PURE__ */ React.createElement("div", { id: t19, role: t20, "aria-labelledby": t21, className: "srp-accordion__panel" }, t24);
    $[36] = t19;
    $[37] = t20;
    $[38] = t21;
    $[39] = t24;
    $[40] = t25;
  } else {
    t25 = $[40];
  }
  let t26;
  if ($[41] !== ref || $[42] !== rest || $[43] !== t10 || $[44] !== t18 || $[45] !== t25 || $[46] !== t9) {
    t26 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, "data-state": t9, className: t10 }, t18, t25);
    $[41] = ref;
    $[42] = rest;
    $[43] = t10;
    $[44] = t18;
    $[45] = t25;
    $[46] = t9;
    $[47] = t26;
  } else {
    t26 = $[47];
  }
  return t26;
}
function _temp2(a) {
  return a.transitionProperty === "opacity";
}
var AccordionItem = /* @__PURE__ */ named("AccordionItem", AccordionItemRender);
export {
  Accordion,
  AccordionItem
};
//# sourceMappingURL=Accordion.js.map
