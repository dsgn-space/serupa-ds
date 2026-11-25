"use client";

// src/components/Menu/Menu.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, elementRef, omit, useLatest, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { oneElement, useTriggerRef } from "../../internal/trigger.js";
import { config } from "../../internal/config.js";
import { typeahead, typing } from "../../internal/typeahead.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import * as icons from "../../material/builtin.js";
import { submenuIntent } from "../../internal/timing.js";
import { activeIn } from "../../internal/root.js";
import { shortcutShown, useApple } from "../../internal/keys.js";
import { isRtl } from "../../internal/position.js";
var Panel = "span";
var Box = "span";
var OWN_MENU = {
  trigger: 1,
  children: 1,
  "aria-label": 1,
  "aria-labelledby": 1,
  placement: 1,
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  className: 1,
  style: 1,
  onKeyDown: 1
};
var MenuContext = /* @__PURE__ */ React.createContext(null);
var ITEMS = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
var itemsOf = (panel) => {
  const all = panel ? Array.from(panel.querySelectorAll(ITEMS)).filter((it) => it.closest('[role="menu"]') === panel) : [];
  const shown = all.filter((it) => it.getClientRects().length > 0);
  return shown.length ? shown : all;
};
var MenuSwap = /* @__PURE__ */ React.createContext(false);
function menuKeys(menuRef, typed, close) {
  return (e) => {
    if (isComposing(e) || (e.altKey || e.ctrlKey || e.metaKey) && /^(Arr|Home|End)/.test(e.key)) return;
    const panel = e.target instanceof HTMLElement ? e.target.closest('[role="menu"]') : null;
    const list = itemsOf(panel || menuRef.current), i = list.indexOf(activeIn(e.currentTarget));
    const go = (n) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i < 0 ? list.length - 1 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close("escape", true);
    } else if (e.key === "Tab") close("blur", false);
    else if (e.key.length === 1 && (/\S/.test(e.key) || typing(typed.current)) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const n = typeahead(typed.current, e.key, list.map((it) => (it.querySelector(".srp-menu__label") || it).textContent || ""), i);
      list[n]?.focus();
    }
  };
}
function MenuRender(t0) {
  const $ = _c(34);
  const {
    ref,
    ...props
  } = t0;
  const own = domId("srp-menu", React.useId());
  const id = props.id || own;
  const [openIn, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "Menu", "open");
  const open = !!openIn;
  const menuRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const focusOn = React.useRef(null);
  const pressed = React.useRef(0);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      text: "",
      at: 0
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const typed = React.useRef(t1);
  const askRef = useLatest(props.onOpenChange);
  let t2;
  if ($[1] !== askRef || $[2] !== controlled || $[3] !== setInner) {
    t2 = (v, reason) => {
      if (!controlled) {
        setInner(v);
      }
      if (askRef.current) {
        askRef.current(v, {
          reason
        });
      }
    };
    $[1] = askRef;
    $[2] = controlled;
    $[3] = setInner;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const set = t2;
  let t3;
  if ($[5] !== set) {
    t3 = (reason_0, focusTrigger) => {
      set(false, reason_0);
      if (focusTrigger && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
    $[5] = set;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  const close = t3;
  let t4;
  if ($[7] !== close || $[8] !== open) {
    t4 = {
      close,
      open,
      typed
    };
    $[7] = close;
    $[8] = open;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const ctx = t4;
  let t5;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => itemsOf(menuRef.current);
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const items = t5;
  const exit = useExit(open, menuRef);
  const swap = React.useContext(MenuSwap);
  let t6;
  if ($[11] !== close) {
    t6 = () => close("outside", false);
    $[11] = close;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  useAnchoredLayer(open, menuRef, triggerRef, {
    placement: props.placement,
    fallback: "bottom-start",
    offsetVar: "--srp-menu-offset",
    onOutside: t6,
    inside: triggerRef
  });
  let t7;
  let t8;
  if ($[13] !== open) {
    t7 = () => {
      const menu = menuRef.current;
      if (!open || !menu) {
        return;
      }
      const list = items();
      const target = focusOn.current === "last" ? list[list.length - 1] : list[0];
      focusOn.current = null;
      if (target) {
        target.focus();
      } else {
        menu.focus();
      }
    };
    t8 = [open];
    $[13] = open;
    $[14] = t7;
    $[15] = t8;
  } else {
    t7 = $[14];
    t8 = $[15];
  }
  useIsoLayoutEffect(t7, t8);
  const keys = (e) => menuKeys(menuRef, typed, close)(e);
  const panelRef = useMergedRef(ref, void 0, menuRef);
  const onMenuKey = (e_0) => {
    if (props.onKeyDown) {
      props.onKeyDown(e_0);
    }
    if (!e_0.defaultPrevented) {
      keys(e_0);
    }
  };
  const child = oneElement(props.trigger, "Menu", "trigger");
  useTriggerRef(triggerRef, "Menu");
  const cp = child.props;
  const childRef = elementRef(child);
  const [triggerId, setTriggerId] = React.useState(void 0);
  let t9;
  if ($[16] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = (n) => {
      if (n) {
        setTriggerId(n.id || void 0);
      }
    };
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  const mergedRef = useMergedRef(childRef, t9, triggerRef);
  const Tag = child.type;
  const trigger = /* @__PURE__ */ React.createElement(Tag, { ...cp, key: child.key, ref: mergedRef, ...{
    id: cp.id || own + "-button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? id : void 0,
    onPointerDown: (e_1) => {
      if (cp.onPointerDown) {
        cp.onPointerDown(e_1);
      }
      if (e_1.defaultPrevented || cp.onClick || e_1.pointerType !== "mouse" || e_1.button !== 0 || e_1.currentTarget.matches(':disabled, [aria-disabled="true"]')) {
        return;
      }
      const at = pressed.current = e_1.timeStamp || 1;
      if (open) {
        close("trigger", true);
      } else {
        focusOn.current = "first";
        set(true, "trigger");
      }
      const up = (u) => {
        document.removeEventListener("pointerup", up, true);
        document.removeEventListener("pointercancel", up, true);
        setTimeout(() => {
          pressed.current = 0;
        });
        const item = !open && u.type === "pointerup" && u.timeStamp - at > 200 && u.target instanceof Element ? u.target.closest('[role^="menuitem"]') : null;
        if (item && menuRef.current && menuRef.current.contains(item)) {
          item.click();
        }
      };
      document.addEventListener("pointerup", up, true);
      document.addEventListener("pointercancel", up, true);
    },
    onMouseDown: (e_2) => {
      if (cp.onMouseDown) {
        cp.onMouseDown(e_2);
      }
      if (pressed.current) {
        e_2.preventDefault();
      }
    },
    onClick: (e_3) => {
      if (cp.onClick) {
        cp.onClick(e_3);
      }
      if (e_3.defaultPrevented || pressed.current) {
        return;
      }
      if (!open) {
        focusOn.current = "first";
      }
      set(!open, "trigger");
    },
    onKeyDown: (e_4) => {
      if (cp.onKeyDown) {
        cp.onKeyDown(e_4);
      }
      if (e_4.defaultPrevented || e_4.altKey || e_4.ctrlKey || e_4.metaKey) {
        return;
      }
      if (e_4.key === "ArrowDown" || e_4.key === "ArrowUp") {
        e_4.preventDefault();
        focusOn.current = e_4.key === "ArrowUp" ? "last" : "first";
        set(true, "trigger");
      }
    }
  } });
  const T0 = Panel;
  const t10 = omit(props, OWN_MENU);
  const t11 = "menu";
  const t12 = -1;
  let t13;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = {
      popover: "manual"
    };
    $[17] = t13;
  } else {
    t13 = $[17];
  }
  const t14 = !open || void 0;
  const t15 = props["aria-label"];
  const t16 = props["aria-label"] || props["aria-labelledby"] ? props["aria-labelledby"] : cp.id || triggerId || own + "-button";
  const t17 = cn("srp-menu", props.className);
  const t18 = open ? "open" : "closed";
  const t19 = exit.instant || swap ? "" : void 0;
  const t20 = !open || void 0;
  const t21 = open || exit.leaving ? props.children : null;
  let t22;
  if ($[18] !== T0 || $[19] !== id || $[20] !== onMenuKey || $[21] !== panelRef || $[22] !== props.style || $[23] !== t10 || $[24] !== t13 || $[25] !== t14 || $[26] !== t15 || $[27] !== t16 || $[28] !== t17 || $[29] !== t18 || $[30] !== t19 || $[31] !== t20 || $[32] !== t21) {
    t22 = /* @__PURE__ */ React.createElement(T0, { ...t10, ref: panelRef, id, role: t11, tabIndex: t12, ...t13, hidden: t14, "aria-label": t15, "aria-labelledby": t16, className: t17, style: props.style, "data-component": "menu", "data-state": t18, "data-instant": t19, inert: t20, onKeyDown: onMenuKey }, t21);
    $[18] = T0;
    $[19] = id;
    $[20] = onMenuKey;
    $[21] = panelRef;
    $[22] = props.style;
    $[23] = t10;
    $[24] = t13;
    $[25] = t14;
    $[26] = t15;
    $[27] = t16;
    $[28] = t17;
    $[29] = t18;
    $[30] = t19;
    $[31] = t20;
    $[32] = t21;
    $[33] = t22;
  } else {
    t22 = $[33];
  }
  return /* @__PURE__ */ React.createElement(MenuContext.Provider, { value: ctx }, trigger, t22);
}
var Menu = /* @__PURE__ */ named("Menu", MenuRender);
var OWN_CONTEXT = {
  target: 1,
  children: 1,
  "aria-label": 1,
  open: 1,
  onOpenChange: 1,
  disabled: 1,
  className: 1,
  style: 1,
  onKeyDown: 1
};
function ContextMenuRender({
  ref,
  ...props
}) {
  const own = domId("srp-ctxmenu", React.useId());
  const id = props.id || own;
  const [openIn, setInner, controlled] = useControllable(props.open, false, "ContextMenu", "open");
  const open = !!openIn;
  const [at, setAt] = React.useState(null);
  const menuRef = React.useRef(null);
  const point = React.useRef(null);
  const targetRef = React.useRef(null);
  const back = React.useRef(null);
  const typed = React.useRef({
    text: "",
    at: 0
  });
  const askRef = useLatest(props.onOpenChange);
  const set = React.useCallback((v, reason) => {
    if (!controlled) setInner(v);
    if (askRef.current) askRef.current(v, {
      reason
    });
  }, [controlled, setInner, askRef]);
  const close = React.useCallback((reason_0, focusBack) => {
    set(false, reason_0);
    const to = back.current || targetRef.current;
    if (focusBack && to) to.focus();
  }, [set]);
  const ctx = React.useMemo(() => ({
    close,
    open,
    typed
  }), [close, open, typed]);
  useIsoLayoutEffect(() => {
    if (open && !at && targetRef.current) {
      const r = targetRef.current.getBoundingClientRect();
      setAt({
        x: r.left,
        y: r.top
      });
    }
  }, [open, at]);
  const spot = at;
  const exit = useExit(open, menuRef);
  if (!open && !exit.leaving && at) setAt(null);
  useAnchoredLayer(open && !!spot, menuRef, point, {
    placement: "bottom-start",
    offsetVar: "--srp-menu-offset",
    onOutside: () => close("outside", false),
    watch: spot && spot.x + "," + spot.y
  });
  useIsoLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    const first = itemsOf(menu)[0];
    if (first) first.focus();
    else menu.focus();
  }, [open, at]);
  const show = (x, y) => {
    const was = activeIn(targetRef.current);
    if (!open) back.current = was instanceof HTMLElement && was !== document.body ? was : null;
    setAt({
      x,
      y
    });
    if (!open) set(true, "trigger");
  };
  const fromElement = (el) => {
    const r_0 = (el instanceof Element ? el : targetRef.current || document.body).getBoundingClientRect();
    show(r_0.left, r_0.bottom);
  };
  const keys = (e) => menuKeys(menuRef, typed, close)(e);
  const onMenuKey = (e_0) => {
    if (props.onKeyDown) props.onKeyDown(e_0);
    if (!e_0.defaultPrevented) keys(e_0);
  };
  const panelRef = useMergedRef(ref, void 0, menuRef);
  const child = oneElement(props.target, "ContextMenu", "target");
  useTriggerRef(targetRef, "ContextMenu");
  const cp = child.props;
  const childRef = elementRef(child);
  const mergedRef2 = useMergedRef(childRef, void 0, targetRef);
  const target = React.cloneElement(child, {
    ref: mergedRef2,
    onContextMenu: (e_1) => {
      if (cp.onContextMenu) cp.onContextMenu(e_1);
      if (e_1.defaultPrevented || props.disabled) return;
      e_1.preventDefault();
      if (e_1.clientX === 0 && e_1.clientY === 0) fromElement(e_1.target);
      else show(e_1.clientX, e_1.clientY);
    },
    onKeyDown: (e_2) => {
      if (cp.onKeyDown) cp.onKeyDown(e_2);
      if (e_2.defaultPrevented || props.disabled) return;
      if (e_2.key === "F10" && e_2.shiftKey || e_2.key === "ContextMenu") {
        e_2.preventDefault();
        fromElement(e_2.target);
      }
    }
  });
  return /* @__PURE__ */ React.createElement(MenuContext.Provider, { value: ctx }, target, /* @__PURE__ */ React.createElement("span", { ref: point, className: "srp-menu__point", "aria-hidden": true, style: spot ? {
    left: spot.x + "px",
    top: spot.y + "px"
  } : void 0 }), /* @__PURE__ */ React.createElement("div", { ...omit(props, OWN_CONTEXT), ref: panelRef, id, role: "menu", tabIndex: -1, ...{
    popover: "manual"
  }, hidden: !open || void 0, "aria-label": props["aria-label"], className: cn("srp-menu", props.className), style: props.style, "data-component": "menu", "data-state": open ? "open" : "closed", "data-instant": exit.instant ? "" : void 0, inert: !open || void 0, onKeyDown: onMenuKey }, open || exit.leaving ? props.children : null));
}
var ContextMenu = /* @__PURE__ */ named("ContextMenu", ContextMenuRender);
var KEY_NAMES = {
  "\u2318": "Meta",
  cmd: "Meta",
  command: "Meta",
  meta: "Meta",
  "\u2325": "Alt",
  opt: "Alt",
  option: "Alt",
  alt: "Alt",
  "\u21E7": "Shift",
  shift: "Shift",
  "\u2303": "Control",
  ctrl: "Control",
  control: "Control",
  "\u23CE": "Enter",
  "\u21B5": "Enter",
  enter: "Enter",
  return: "Enter",
  "\u232B": "Backspace",
  del: "Delete",
  delete: "Delete",
  esc: "Escape",
  "\u238B": "Escape",
  tab: "Tab",
  space: "Space",
  "\u2191": "ArrowUp",
  "\u2193": "ArrowDown",
  "\u2190": "ArrowLeft",
  "\u2192": "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  escape: "Escape",
  "+": "Plus",
  plus: "Plus"
};
function keyShortcuts(shortcut) {
  return shortcut.trim().split(/\s+then\s+/i).map(chord).filter(Boolean).join(" ");
}
function chord(text) {
  const parts = [];
  let last = "";
  const end = /(^|[+\-\s⌘⌥⇧⌃])([+-])$/.exec(text);
  if (end?.[2]) {
    last = end[2];
    text = text.slice(0, text.length - 1);
  }
  const tokens = text.split(/\s*[+-]\s*|\s+/).filter(Boolean);
  if (last) tokens.push(last);
  for (const token of tokens) {
    let rest = token;
    for (let mod = KEY_NAMES[rest.charAt(0)]; rest.length > 1 && mod && /[⌘⌥⇧⌃]/.test(rest.charAt(0)); mod = KEY_NAMES[rest.charAt(0)]) {
      parts.push(mod);
      rest = rest.slice(1);
    }
    const named2 = KEY_NAMES[rest] || KEY_NAMES[rest.toLowerCase()];
    parts.push(named2 || (rest.length === 1 ? rest.toUpperCase() : rest));
  }
  return parts.join("+");
}
function MenuItemBaseRender(t0) {
  const $ = _c(6);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(MenuContext);
  const rest = omit(props, {
    onSelect: 1,
    icon: 1,
    shortcut: 1,
    destructive: 1,
    disabled: 1,
    className: 1,
    children: 1,
    onClick: 1,
    onKeyDown: 1,
    onPointerMove: 1,
    as: 1
  });
  const own = {
    onClick: props.onClick,
    onKeyDown: props.onKeyDown,
    onPointerMove: props.onPointerMove
  };
  const linked = rest.href != null || props.as != null;
  const choose = (e) => {
    if (props.disabled) {
      e.preventDefault();
      return;
    }
    if (props.onSelect) {
      props.onSelect(e);
    }
    const a = activeIn(e.currentTarget);
    if (!e.defaultPrevented && ctx) {
      ctx.close("select", !a || a === document.body || !!a.closest('[role="menu"]'));
    }
  };
  const onClick = (e_0) => {
    if (own.onClick) {
      own.onClick(e_0);
    }
    if (linked && !props.disabled) {
      if (props.onSelect) {
        props.onSelect(e_0);
      }
      if (ctx) {
        ctx.close("select", false);
      }
      return;
    }
    choose(e_0);
  };
  const onKeyDown = (e_1) => {
    if (own.onKeyDown) {
      own.onKeyDown(e_1);
    }
    if (e_1.defaultPrevented) {
      return;
    }
    if (e_1.key === " " && ctx && typing(ctx.typed.current)) {
      return;
    }
    if (e_1.key === "Enter" || e_1.key === " ") {
      if (linked && !props.disabled) {
        if (e_1.key === " ") {
          e_1.preventDefault();
          e_1.currentTarget.click();
        }
        return;
      }
      choose(e_1);
      e_1.preventDefault();
    }
  };
  const isLink = linked && !props.disabled;
  if (!isLink) {
    delete rest.href;
  }
  const apple = useApple();
  const keys = props.shortcut;
  const list = typeof keys === "string" ? null : keys && keys.length ? keys : null;
  const shown = list ? shortcutShown(list, apple) : keys;
  if (shown && rest["aria-keyshortcuts"] == null) {
    rest["aria-keyshortcuts"] = keyShortcuts(list ? list.map((k) => k.toLowerCase() === "mod" ? apple ? "Meta" : "Control" : k).join("+") : shown);
  }
  if (isLink && rest.target === "_blank" && rest.rel == null) {
    rest.rel = "noopener noreferrer";
  }
  const checkable = !isLink && (rest.role === "menuitemcheckbox" || rest.role === "menuitemradio");
  const Tag = isLink ? props.as || config.link : Box;
  let t1;
  if ($[0] !== checkable) {
    t1 = checkable ? /* @__PURE__ */ React.createElement("span", { className: "srp-menu__check", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check })) : null;
    $[0] = checkable;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== props.children) {
    t2 = /* @__PURE__ */ React.createElement("span", { className: "srp-menu__label" }, props.children);
    $[2] = props.children;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== shown) {
    t3 = shown ? /* @__PURE__ */ React.createElement("kbd", { className: "srp-menu__shortcut", "aria-hidden": "true" }, shown) : null;
    $[4] = shown;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  return /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, ...{
    role: checkable ? rest.role : "menuitem",
    tabIndex: -1,
    "aria-disabled": props.disabled || void 0,
    className: cn("srp-menu__item", props.destructive && "srp-menu__item--destructive", props.className),
    onClick,
    onKeyDown,
    onPointerMove: (e_2) => {
      if (own.onPointerMove) {
        own.onPointerMove(e_2);
      }
      if (activeIn(e_2.currentTarget) !== e_2.currentTarget) {
        e_2.currentTarget.focus();
      }
    }
  } }, t1, props.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-menu__icon", "aria-hidden": "true" }, asIcon(props.icon)) : null, t2, t3);
}
var MenuItemBase = /* @__PURE__ */ named("MenuItem", MenuItemBaseRender);
var MenuItem = MenuItemBase;
var stayOnSpace = (e) => {
  if (e.key === " ") e.preventDefault();
};
function MenuCheckboxItemRender(t0) {
  const $ = _c(15);
  let props;
  let ref;
  let t1;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    t1 = omit(props, {
      checked: 1,
      onCheckedChange: 1,
      onSelect: 1,
      icon: 1,
      shortcut: 1
    });
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
    $[3] = t1;
  } else {
    props = $[1];
    ref = $[2];
    t1 = $[3];
  }
  const rest = t1;
  let t2;
  if ($[4] !== props) {
    t2 = (e) => {
      if (props.onCheckedChange) {
        props.onCheckedChange(!props.checked);
      }
      if (props.onSelect) {
        props.onSelect(e);
      }
      stayOnSpace(e);
    };
    $[4] = props;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const onSelect = t2;
  const t3 = !!props.checked;
  let t4;
  if ($[6] !== t3) {
    t4 = {
      role: "menuitemcheckbox",
      "aria-checked": t3
    };
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== onSelect || $[9] !== props.icon || $[10] !== props.shortcut || $[11] !== ref || $[12] !== rest || $[13] !== t4) {
    t5 = /* @__PURE__ */ React.createElement(MenuItem, { ...rest, ref, icon: props.icon, shortcut: props.shortcut, ...t4, onSelect });
    $[8] = onSelect;
    $[9] = props.icon;
    $[10] = props.shortcut;
    $[11] = ref;
    $[12] = rest;
    $[13] = t4;
    $[14] = t5;
  } else {
    t5 = $[14];
  }
  return t5;
}
var MenuCheckboxItem = /* @__PURE__ */ named("MenuCheckboxItem", MenuCheckboxItemRender);
var RadioContext = /* @__PURE__ */ React.createContext(null);
function MenuRadioGroupRender(t0) {
  const $ = _c(16);
  let props;
  let ref;
  let t1;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    t1 = omit(props, {
      value: 1,
      onValueChange: 1
    });
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
    $[3] = t1;
  } else {
    props = $[1];
    ref = $[2];
    t1 = $[3];
  }
  const rest = t1;
  const askRef = useLatest(props.onValueChange);
  const value = props.value;
  let t2;
  if ($[4] !== askRef || $[5] !== value) {
    t2 = (v) => {
      if (v !== value && askRef.current) {
        askRef.current(v);
      }
    };
    $[4] = askRef;
    $[5] = value;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] !== t2 || $[8] !== value) {
    t3 = {
      value,
      choose: t2
    };
    $[7] = t2;
    $[8] = value;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const ctx = t3;
  let t4;
  if ($[10] !== ref || $[11] !== rest) {
    t4 = /* @__PURE__ */ React.createElement(MenuGroup, { ...rest, ref });
    $[10] = ref;
    $[11] = rest;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  let t5;
  if ($[13] !== ctx || $[14] !== t4) {
    t5 = /* @__PURE__ */ React.createElement(RadioContext.Provider, { value: ctx }, t4);
    $[13] = ctx;
    $[14] = t4;
    $[15] = t5;
  } else {
    t5 = $[15];
  }
  return t5;
}
var MenuRadioGroup = /* @__PURE__ */ named("MenuRadioGroup", MenuRadioGroupRender);
function MenuRadioItemRender(t0) {
  const $ = _c(12);
  const {
    ref,
    ...props
  } = t0;
  const group = React.useContext(RadioContext);
  const rest = omit(props, {
    value: 1,
    onSelect: 1,
    icon: 1,
    shortcut: 1
  });
  let t1;
  if ($[0] !== group || $[1] !== props) {
    t1 = (e) => {
      if (group) {
        group.choose(props.value);
      }
      if (props.onSelect) {
        props.onSelect(e);
      }
      stayOnSpace(e);
    };
    $[0] = group;
    $[1] = props;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const onSelect = t1;
  const t2 = !!group && group.value === props.value;
  let t3;
  if ($[3] !== t2) {
    t3 = {
      role: "menuitemradio",
      "aria-checked": t2
    };
    $[3] = t2;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== onSelect || $[6] !== props.icon || $[7] !== props.shortcut || $[8] !== ref || $[9] !== rest || $[10] !== t3) {
    t4 = /* @__PURE__ */ React.createElement(MenuItem, { ...rest, ref, icon: props.icon, shortcut: props.shortcut, ...t3, onSelect });
    $[5] = onSelect;
    $[6] = props.icon;
    $[7] = props.shortcut;
    $[8] = ref;
    $[9] = rest;
    $[10] = t3;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  return t4;
}
var MenuRadioItem = /* @__PURE__ */ named("MenuRadioItem", MenuRadioItemRender);
var inTriangle = (p, a, b, c) => {
  const side = (u, v) => (v.x - u.x) * (p.y - u.y) - (v.y - u.y) * (p.x - u.x);
  const d1 = side(a, b), d2 = side(b, c), d3 = side(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
function MenuSubRender(t0) {
  const $ = _c(40);
  const {
    ref,
    ...props
  } = t0;
  const id = domId("srp-menu-sub", React.useId());
  const rest = omit(props, {
    label: 1,
    icon: 1,
    disabled: 1,
    className: 1,
    children: 1,
    onClick: 1,
    onKeyDown: 1,
    onPointerMove: 1,
    onPointerLeave: 1
  });
  const [own, setOpen] = React.useState(false);
  const [left, setLeft] = React.useState(false);
  const parent = React.useContext(MenuContext);
  const open = own && (!parent || parent.open);
  if (own && parent && !parent.open) {
    setOpen(false);
  }
  const itemRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const focusFirst = React.useRef(false);
  const timer = React.useRef(void 0);
  const hover = React.useRef(false);
  const stop = () => {
    clearTimeout(timer.current);
    hover.current = false;
  };
  const later = (fn) => {
    stop();
    timer.current = setTimeout(fn, submenuIntent);
  };
  const rtl = () => !!itemRef.current && isRtl(itemRef.current);
  const show = (focus) => {
    stop();
    if (props.disabled) {
      return;
    }
    if (open) {
      if (focus) {
        const first = itemsOf(panelRef.current)[0];
        if (first) {
          first.focus();
        }
      }
      return;
    }
    focusFirst.current = focus;
    setLeft(rtl());
    setOpen(true);
  };
  const hide = (focusItem) => {
    stop();
    setOpen(false);
    if (focusItem && itemRef.current) {
      itemRef.current.focus();
    }
  };
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(() => stop, t1);
  const exit = useExit(open, panelRef);
  const t2 = left ? "left-start" : "right-start";
  let t3;
  if ($[1] !== t2) {
    t3 = {
      placement: t2,
      fallback: "right-start",
      offsetVar: "--srp-menu-sub-offset"
    };
    $[1] = t2;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  useAnchoredLayer(open, panelRef, itemRef, t3);
  let t4;
  if ($[3] !== open) {
    t4 = [open];
    $[3] = open;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  useIsoLayoutEffect(() => {
    if (!open || !focusFirst.current) {
      return;
    }
    focusFirst.current = false;
    const first_0 = itemsOf(panelRef.current)[0];
    if (first_0) {
      first_0.focus();
    } else {
      if (panelRef.current) {
        panelRef.current.focus();
      }
    }
  }, t4);
  let t5;
  if ($[5] !== open) {
    t5 = [open];
    $[5] = open;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  React.useEffect(() => {
    const item = itemRef.current;
    const parent_0 = item && item.closest('[role="menu"]');
    if (!open || !item || !parent_0) {
      return;
    }
    let at = {
      x: 0,
      y: 0,
      t: 0
    };
    let from = at;
    const onMove = (e) => {
      if (e.pointerType === "mouse") {
        at = {
          x: e.clientX,
          y: e.clientY,
          t: e.timeStamp
        };
      }
    };
    const check = () => {
      const r = panelRef.current && panelRef.current.getBoundingClientRect();
      const x = r && (from.x <= r.left ? r.left : r.right);
      if (r && at !== from && performance.now() - at.t < submenuIntent && inTriangle(at, from, {
        x,
        y: r.top
      }, {
        x,
        y: r.bottom
      })) {
        from = at;
        timer.current = setTimeout(check, submenuIntent);
      } else {
        setOpen(false);
      }
    };
    const onFocus = (e_0) => {
      const t = e_0.target;
      if (!(t instanceof Node)) {
        return;
      }
      clearTimeout(timer.current);
      if (t !== item && !(panelRef.current && panelRef.current.contains(t)) && parent_0.contains(t)) {
        from = at;
        timer.current = setTimeout(check, submenuIntent);
      }
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointermove", onMove, true);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointermove", onMove, true);
    };
  }, t5);
  const opens = (key) => key === "Enter" || key === " " || key === (rtl() ? "ArrowLeft" : "ArrowRight");
  const onPanelKey = (e_1) => {
    if (isComposing(e_1) || !(e_1.target instanceof HTMLElement) || e_1.target.closest('[role="menu"]') !== panelRef.current) {
      return;
    }
    if (e_1.key === "Escape" || e_1.key === (rtl() ? "ArrowRight" : "ArrowLeft")) {
      e_1.preventDefault();
      e_1.stopPropagation();
      hide(true);
    }
  };
  const mergedRef3 = useMergedRef(ref, void 0, itemRef);
  const T0 = Box;
  const t6 = "menuitem";
  const t7 = -1;
  const t8 = "menu";
  const t9 = open ? id : void 0;
  const t10 = props.disabled || void 0;
  const t11 = open ? "open" : "closed";
  const t12 = cn("srp-menu__item", "srp-menu__item--sub", props.className);
  const t13 = (e_2) => {
    if (props.onClick) {
      props.onClick(e_2);
    }
    if (!e_2.defaultPrevented) {
      show(true);
    }
  };
  const t14 = (e_3) => {
    if (props.onKeyDown) {
      props.onKeyDown(e_3);
    }
    if (e_3.defaultPrevented || isComposing(e_3) || !opens(e_3.key) || e_3.key === " " && parent && typing(parent.typed.current)) {
      return;
    }
    e_3.preventDefault();
    e_3.stopPropagation();
    show(true);
  };
  const t15 = (e_4) => {
    if (props.onPointerMove) {
      props.onPointerMove(e_4);
    }
    if (activeIn(e_4.currentTarget) !== e_4.currentTarget) {
      e_4.currentTarget.focus();
    }
    if (!open && !props.disabled && !hover.current) {
      later(() => {
        show(false);
      });
      hover.current = true;
    }
  };
  const t16 = (e_5) => {
    if (props.onPointerLeave) {
      props.onPointerLeave(e_5);
    }
    if (hover.current) {
      stop();
    }
  };
  const t17 = props.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-menu__icon", "aria-hidden": "true" }, asIcon(props.icon)) : null;
  const t18 = id + "-label";
  let t19;
  if ($[7] !== props.label || $[8] !== t18) {
    t19 = /* @__PURE__ */ React.createElement("span", { className: "srp-menu__label", id: t18 }, props.label);
    $[7] = props.label;
    $[8] = t18;
    $[9] = t19;
  } else {
    t19 = $[9];
  }
  let t20;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = /* @__PURE__ */ React.createElement("span", { className: "srp-menu__chevron", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight }));
    $[10] = t20;
  } else {
    t20 = $[10];
  }
  let t21;
  if ($[11] !== T0 || $[12] !== mergedRef3 || $[13] !== open || $[14] !== rest || $[15] !== t10 || $[16] !== t11 || $[17] !== t12 || $[18] !== t13 || $[19] !== t14 || $[20] !== t15 || $[21] !== t16 || $[22] !== t17 || $[23] !== t19 || $[24] !== t9) {
    t21 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref: mergedRef3, role: t6, tabIndex: t7, "aria-haspopup": t8, "aria-expanded": open, "aria-controls": t9, "aria-disabled": t10, "data-state": t11, className: t12, onClick: t13, onKeyDown: t14, onPointerMove: t15, onPointerLeave: t16 }, t17, t19, t20);
    $[11] = T0;
    $[12] = mergedRef3;
    $[13] = open;
    $[14] = rest;
    $[15] = t10;
    $[16] = t11;
    $[17] = t12;
    $[18] = t13;
    $[19] = t14;
    $[20] = t15;
    $[21] = t16;
    $[22] = t17;
    $[23] = t19;
    $[24] = t9;
    $[25] = t21;
  } else {
    t21 = $[25];
  }
  let t22;
  if ($[26] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t22 = {
      popover: "manual"
    };
    $[26] = t22;
  } else {
    t22 = $[26];
  }
  const t23 = !open || void 0;
  const t24 = exit.instant ? "" : void 0;
  const t25 = id + "-label";
  const t26 = open ? "open" : "closed";
  const t27 = !open || void 0;
  const t28 = open || exit.leaving ? props.children : null;
  let t29;
  if ($[27] !== id || $[28] !== onPanelKey || $[29] !== panelRef || $[30] !== t23 || $[31] !== t24 || $[32] !== t25 || $[33] !== t26 || $[34] !== t27 || $[35] !== t28) {
    t29 = /* @__PURE__ */ React.createElement(Box, { ref: panelRef, id, role: "menu", tabIndex: -1, ...t22, hidden: t23, "data-instant": t24, "aria-labelledby": t25, className: "srp-menu srp-menu--sub", "data-component": "menu", "data-state": t26, inert: t27, onKeyDown: onPanelKey }, t28);
    $[27] = id;
    $[28] = onPanelKey;
    $[29] = panelRef;
    $[30] = t23;
    $[31] = t24;
    $[32] = t25;
    $[33] = t26;
    $[34] = t27;
    $[35] = t28;
    $[36] = t29;
  } else {
    t29 = $[36];
  }
  let t30;
  if ($[37] !== t21 || $[38] !== t29) {
    t30 = /* @__PURE__ */ React.createElement(React.Fragment, null, t21, t29);
    $[37] = t21;
    $[38] = t29;
    $[39] = t30;
  } else {
    t30 = $[39];
  }
  return t30;
}
var MenuSub = /* @__PURE__ */ named("MenuSub", MenuSubRender);
function MenuGroupRender(t0) {
  const $ = _c(13);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    label: 1,
    className: 1,
    children: 1
  });
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-mg", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  const T0 = Box;
  const t3 = "group";
  const t4 = props.label != null ? id : void 0;
  const t5 = cn("srp-menu__group", props.className);
  let t6;
  if ($[2] !== id || $[3] !== props.label) {
    t6 = props.label != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-menu__group-label", id, role: "presentation" }, props.label) : null;
    $[2] = id;
    $[3] = props.label;
    $[4] = t6;
  } else {
    t6 = $[4];
  }
  let t7;
  if ($[5] !== T0 || $[6] !== props.children || $[7] !== ref || $[8] !== rest || $[9] !== t4 || $[10] !== t5 || $[11] !== t6) {
    t7 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, role: t3, "aria-labelledby": t4, className: t5 }, t6, props.children);
    $[5] = T0;
    $[6] = props.children;
    $[7] = ref;
    $[8] = rest;
    $[9] = t4;
    $[10] = t5;
    $[11] = t6;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  return t7;
}
var MenuGroup = /* @__PURE__ */ named("MenuGroup", MenuGroupRender);
function MenuSeparatorRender(t0) {
  const $ = _c(12);
  let T0;
  let t1;
  let t2;
  let t3;
  let t4;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    T0 = Box;
    t1 = props;
    t2 = ref;
    t3 = "separator";
    t4 = cn("srp-menu__separator", props.className);
    $[0] = t0;
    $[1] = T0;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
    $[5] = t4;
  } else {
    T0 = $[1];
    t1 = $[2];
    t2 = $[3];
    t3 = $[4];
    t4 = $[5];
  }
  let t5;
  if ($[6] !== T0 || $[7] !== t1 || $[8] !== t2 || $[9] !== t3 || $[10] !== t4) {
    t5 = /* @__PURE__ */ React.createElement(T0, { ...t1, ref: t2, role: t3, className: t4 });
    $[6] = T0;
    $[7] = t1;
    $[8] = t2;
    $[9] = t3;
    $[10] = t4;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  return t5;
}
var MenuSeparator = /* @__PURE__ */ named("MenuSeparator", MenuSeparatorRender);
export {
  ContextMenu,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSwap,
  keyShortcuts
};
//# sourceMappingURL=Menu.js.map
