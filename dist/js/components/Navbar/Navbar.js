"use client";

// src/components/Navbar/Navbar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { useBreakpoint } from "../../internal/media.js";
import { config } from "../../internal/config.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { flattenChildren } from "../../internal/children.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { activeIn } from "../../internal/root.js";
import { useCloseWatcher } from "../../internal/closeWatcher.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
var WIDTHS = ["prose", "md", "lg", "xl", "2xl", "full"];
var NavbarContext = /* @__PURE__ */ React.createContext(null);
function NavbarRender(t0) {
  const $ = _c(55);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const rest = omit(props, {
    brand: 1,
    children: 1,
    actions: 1,
    sticky: 1,
    condense: 1,
    size: 1,
    menuLabel: 1,
    className: 1,
    "aria-label": 1,
    onKeyDown: 1,
    onBlur: 1
  });
  const [open, setOpen] = React.useState(false);
  const {
    onKeyDown: onKeyDownProp,
    onBlur: onBlurProp
  } = props;
  const [menu, setMenu] = React.useState(null);
  const [leaving, setLeaving] = React.useState(false);
  const panel = React.useRef(null);
  const [was, setWas] = React.useState(open);
  if (was !== open) {
    setWas(open);
    setLeaving(!open);
  }
  const toggle = React.useRef(null);
  const bar = React.useRef(null);
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-nav", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  const size = oneOf(WIDTHS, String(props.size), "xl");
  const links = flattenChildren(props.children);
  const hasLinks = links.length > 0;
  let t3;
  if ($[2] !== setOpen) {
    t3 = () => {
      setOpen(false);
      setMenu(null);
    };
    $[2] = setOpen;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const close = t3;
  let t4;
  if ($[4] !== close || $[5] !== menu || $[6] !== size) {
    t4 = {
      close,
      menu,
      setMenu,
      size
    };
    $[4] = close;
    $[5] = menu;
    $[6] = size;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const ctx = t4;
  useIsoLayoutEffect(() => {
    const h = bar.current;
    if (!props.sticky || !h) {
      return;
    }
    const root = document.documentElement;
    const set = () => root.style.setProperty("--srp-navbar-offset", h.getBoundingClientRect().height + "px");
    set();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(set) : null;
    if (ro) {
      ro.observe(h);
    }
    let raf = 0;
    const onFocus = (e) => {
      const t = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
      if (!(t instanceof Element) || h.contains(t) || t.closest("dialog, [popover]")) {
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (activeIn(t) !== t) {
          return;
        }
        const r = t.getBoundingClientRect();
        if (!(t.getRootNode() instanceof ShadowRoot) && (r.top >= window.innerHeight || r.bottom <= 0)) {
          return;
        }
        const below = t.getBoundingClientRect().bottom - window.innerHeight;
        if (below > 0) {
          window.scrollBy(0, below);
        }
        const covered = h.getBoundingClientRect().bottom - t.getBoundingClientRect().top;
        if (covered > 0) {
          window.scrollBy(0, -covered);
        }
      });
    };
    document.addEventListener("focusin", onFocus);
    return () => {
      if (ro) {
        ro.disconnect();
      }
      cancelAnimationFrame(raf);
      document.removeEventListener("focusin", onFocus);
      root.style.removeProperty("--srp-navbar-offset");
    };
  }, [props.sticky]);
  const wide = useBreakpoint("md");
  const [fold, setFold] = React.useState(false);
  const need = React.useRef(0);
  const linkCount = links.length;
  useIsoLayoutEffect(() => {
    const h_0 = bar.current;
    const inner = h_0 && h_0.firstElementChild;
    if (!wide || !linkCount || !inner) {
      setFold(false);
      return;
    }
    const nav = inner.querySelector(":scope > .srp-navbar__nav");
    let now = fold;
    const set_0 = (to) => {
      now = to;
      setFold(to);
    };
    const check = () => {
      const row = nav && nav.firstElementChild;
      const over = nav && row ? row.scrollWidth - nav.clientWidth : 0;
      if (!now) {
        if (over > 0.5) {
          need.current = inner.clientWidth + over;
          set_0(true);
        }
      } else {
        if (inner.clientWidth >= need.current) {
          set_0(false);
        }
      }
    };
    check();
    const ro_0 = typeof ResizeObserver === "function" ? new ResizeObserver(check) : null;
    if (ro_0) {
      ro_0.observe(inner);
      if (nav) {
        ro_0.observe(nav);
      }
    }
    const stop = onFontsLoaded(() => {
      if (now) {
        set_0(false);
      } else {
        check();
      }
    });
    return () => {
      if (ro_0) {
        ro_0.disconnect();
      }
      stop();
    };
  }, [wide, linkCount, fold, open || leaving]);
  const folded = !wide || fold;
  if (!folded && open) {
    setOpen(false);
  }
  let t5;
  if ($[8] !== setOpen) {
    t5 = () => {
      setOpen(false);
      const a = document.activeElement;
      if (toggle.current && (!a || a === document.body || bar.current && bar.current.contains(a))) {
        toggle.current.focus();
      }
    };
    $[8] = setOpen;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  useCloseWatcher(open, t5);
  let t6;
  if ($[10] !== open || $[11] !== setOpen) {
    t6 = () => {
      if (!open) {
        return;
      }
      const on = (e_0) => {
        if (bar.current && e_0.target instanceof Node && !bar.current.contains(e_0.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("pointerdown", on, true);
      return () => document.removeEventListener("pointerdown", on, true);
    };
    $[10] = open;
    $[11] = setOpen;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  let t7;
  if ($[13] !== open) {
    t7 = [open];
    $[13] = open;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  React.useEffect(t6, t7);
  const onKeyDown = function onKeyDown2(e_1) {
    if (onKeyDownProp) {
      onKeyDownProp(e_1);
    }
    if (!e_1.defaultPrevented && e_1.key === "Escape" && open && !isComposing(e_1)) {
      e_1.preventDefault();
      setOpen(false);
      if (toggle.current) {
        toggle.current.focus();
      }
    }
  };
  const onBlur = function onBlur2(e_2) {
    if (onBlurProp) {
      onBlurProp(e_2);
    }
    if (open && e_2.relatedTarget instanceof Node && !e_2.currentTarget.contains(e_2.relatedTarget)) {
      setOpen(false);
    }
  };
  let t8;
  let t9;
  if ($[15] !== leaving) {
    t8 = () => {
      if (!leaving) {
        return;
      }
      const n = panel.current;
      const s = n ? getComputedStyle(n) : null;
      const ms = s && s.display !== "none" ? Math.max(...s.transitionDuration.split(",").map(_temp)) : 0;
      if (!(ms > 0)) {
        setLeaving(false);
        return;
      }
      const t_0 = window.setTimeout(() => setLeaving(false), ms + 50);
      return () => window.clearTimeout(t_0);
    };
    t9 = [leaving];
    $[15] = leaving;
    $[16] = t8;
    $[17] = t9;
  } else {
    t8 = $[16];
    t9 = $[17];
  }
  useIsoLayoutEffect(t8, t9);
  const nav_0 = hasLinks ? /* @__PURE__ */ React.createElement("nav", { ref: panel, id, "aria-label": props["aria-label"] || sds.labels.mainNavigation, className: cn("srp-navbar__nav", leaving && "srp-navbar__nav--leaving"), inert: leaving || void 0, onTransitionEnd: (e_3) => {
    if (e_3.target === e_3.currentTarget && e_3.propertyName === "opacity" && !open) {
      setLeaving(false);
    }
  } }, /* @__PURE__ */ React.createElement("ul", { className: "srp-navbar__links" }, links.map(_temp2))) : null;
  let t10;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = (n_0) => {
      bar.current = n_0;
    };
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  const mergedRef = useMergedRef(ref, t10);
  const t11 = open ? "open" : "closed";
  const t12 = wide && fold ? "" : void 0;
  const t13 = props.sticky && "srp-navbar--sticky";
  const t14 = props.sticky && props.condense && "srp-navbar--condense";
  let t15;
  if ($[19] !== props.className || $[20] !== t13 || $[21] !== t14) {
    t15 = cn("srp-navbar", t13, t14, props.className);
    $[19] = props.className;
    $[20] = t13;
    $[21] = t14;
    $[22] = t15;
  } else {
    t15 = $[22];
  }
  const t16 = "srp-container--" + size;
  let t17;
  if ($[23] !== t16) {
    t17 = cn("srp-navbar__inner srp-container srp-container--padded", t16);
    $[23] = t16;
    $[24] = t17;
  } else {
    t17 = $[24];
  }
  let t18;
  if ($[25] !== props.brand) {
    t18 = props.brand != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-navbar__brand" }, typeof props.brand === "string" || typeof props.brand === "number" ? /* @__PURE__ */ React.createElement(TruncatedText, null, String(props.brand)) : props.brand) : null;
    $[25] = props.brand;
    $[26] = t18;
  } else {
    t18 = $[26];
  }
  const t19 = open || leaving ? null : nav_0;
  let t20;
  if ($[27] !== props.actions) {
    t20 = props.actions != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-navbar__actions" }, props.actions) : null;
    $[27] = props.actions;
    $[28] = t20;
  } else {
    t20 = $[28];
  }
  let t21;
  if ($[29] !== hasLinks || $[30] !== id || $[31] !== open || $[32] !== props.menuLabel || $[33] !== sds || $[34] !== setOpen) {
    t21 = hasLinks ? /* @__PURE__ */ React.createElement(IconButton, { ref: toggle, className: "srp-navbar__toggle", icon: open ? icons.Close : icons.Menu, label: props.menuLabel || sds.labels.menu, hideTitle: true, "aria-expanded": open, "aria-controls": id, onClick: () => setOpen(!open) }) : null;
    $[29] = hasLinks;
    $[30] = id;
    $[31] = open;
    $[32] = props.menuLabel;
    $[33] = sds;
    $[34] = setOpen;
    $[35] = t21;
  } else {
    t21 = $[35];
  }
  const t22 = open || leaving ? nav_0 : null;
  let t23;
  if ($[36] !== t17 || $[37] !== t18 || $[38] !== t19 || $[39] !== t20 || $[40] !== t21 || $[41] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("div", { className: t17 }, t18, t19, t20, t21, t22);
    $[36] = t17;
    $[37] = t18;
    $[38] = t19;
    $[39] = t20;
    $[40] = t21;
    $[41] = t22;
    $[42] = t23;
  } else {
    t23 = $[42];
  }
  let t24;
  if ($[43] !== mergedRef || $[44] !== onBlur || $[45] !== onKeyDown || $[46] !== rest || $[47] !== t11 || $[48] !== t12 || $[49] !== t15 || $[50] !== t23) {
    t24 = /* @__PURE__ */ React.createElement("header", { ...rest, ref: mergedRef, onKeyDown, onBlur, "data-component": "navbar", "data-state": t11, "data-fold": t12, className: t15 }, t23);
    $[43] = mergedRef;
    $[44] = onBlur;
    $[45] = onKeyDown;
    $[46] = rest;
    $[47] = t11;
    $[48] = t12;
    $[49] = t15;
    $[50] = t23;
    $[51] = t24;
  } else {
    t24 = $[51];
  }
  let t25;
  if ($[52] !== ctx || $[53] !== t24) {
    t25 = /* @__PURE__ */ React.createElement(NavbarContext.Provider, { value: ctx }, t24);
    $[52] = ctx;
    $[53] = t24;
    $[54] = t25;
  } else {
    t25 = $[54];
  }
  return t25;
}
function _temp2(c, i) {
  return /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c);
}
function _temp(d) {
  return parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1e3);
}
var Navbar = /* @__PURE__ */ named("Navbar", NavbarRender);
function NavbarLinkBaseRender(t0) {
  const $ = _c(10);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, {
    current: 1,
    as: 1,
    className: 1,
    onClick: 1
  });
  const Tag = props.as || config.link;
  const t1 = props.current ? "page" : void 0;
  const t2 = cn("srp-navbar__link", props.current && "srp-navbar__link--active", props.className);
  let t3;
  if ($[0] !== ctx || $[1] !== props) {
    t3 = (e) => {
      if (props.onClick) {
        props.onClick(e);
      }
      if (ctx) {
        ctx.close();
      }
    };
    $[0] = ctx;
    $[1] = props;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  let t4;
  if ($[3] !== Tag || $[4] !== ref || $[5] !== rest || $[6] !== t1 || $[7] !== t2 || $[8] !== t3) {
    t4 = /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, "aria-current": t1, className: t2, onClick: t3 });
    $[3] = Tag;
    $[4] = ref;
    $[5] = rest;
    $[6] = t1;
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  return t4;
}
var NavbarLinkBase = /* @__PURE__ */ named("NavbarLink", NavbarLinkBaseRender);
var NavbarLink = NavbarLinkBase;
function NavbarMenuRender(t0) {
  const $ = _c(25);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, {
    label: 1,
    children: 1,
    current: 1,
    className: 1
  });
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-navbar-menu", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  const [own, setOwn] = React.useState(false);
  const open = ctx ? ctx.menu === id : own;
  let t3;
  if ($[2] !== ctx || $[3] !== id) {
    t3 = (v) => {
      if (ctx) {
        ctx.setMenu((was) => v ? id : was === id ? null : was);
      } else {
        setOwn(v);
      }
    };
    $[2] = ctx;
    $[3] = id;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const set = t3;
  const root = React.useRef(null);
  const button = React.useRef(null);
  let t4;
  let t5;
  if ($[5] !== open || $[6] !== set) {
    t4 = () => {
      const el = root.current;
      if (!open || !el) {
        return;
      }
      const press = (e) => {
        if (e.target instanceof Node && !el.contains(e.target)) {
          set(false);
        }
      };
      const leave = (e_0) => {
        if (e_0.relatedTarget instanceof Node && !el.contains(e_0.relatedTarget)) {
          set(false);
        }
      };
      const key = (e_1) => {
        if (e_1.key === "Escape" && !e_1.defaultPrevented && !isComposing(e_1)) {
          e_1.preventDefault();
          set(false);
          button.current?.focus();
        }
      };
      document.addEventListener("pointerdown", press, true);
      el.addEventListener("focusout", leave);
      el.addEventListener("keydown", key);
      return () => {
        document.removeEventListener("pointerdown", press, true);
        el.removeEventListener("focusout", leave);
        el.removeEventListener("keydown", key);
      };
    };
    t5 = [open, set];
    $[5] = open;
    $[6] = set;
    $[7] = t4;
    $[8] = t5;
  } else {
    t4 = $[7];
    t5 = $[8];
  }
  React.useEffect(t4, t5);
  let t6;
  if ($[9] !== set) {
    t6 = () => {
      set(false);
      const a = document.activeElement;
      if (!a || a === document.body || root.current && root.current.contains(a)) {
        button.current?.focus();
      }
    };
    $[9] = set;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  useCloseWatcher(open, t6);
  const parts = [];
  let loose = [];
  const flush = () => {
    if (loose.length) {
      parts.push(/* @__PURE__ */ React.createElement("ul", { key: "list" + parts.length, role: "list", className: "srp-navbar__menu-list" }, loose.map(_temp3)));
    }
    loose = [];
  };
  for (const c_0 of flattenChildren(props.children)) {
    if (React.isValidElement(c_0) && c_0.type === NavbarMenuGroup) {
      flush();
      parts.push(c_0);
    } else {
      loose.push(c_0);
    }
  }
  flush();
  let t7;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = (n) => {
      root.current = n;
    };
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  const mergedRef2 = useMergedRef(ref, t7);
  const t8 = cn("srp-navbar__menu", props.className);
  const t9 = "button";
  const t10 = cn("srp-navbar__link srp-navbar__menu-button", props.current && "srp-navbar__link--active");
  const t11 = props.current ? "true" : void 0;
  let t12;
  if ($[12] !== open || $[13] !== set) {
    t12 = () => set(!open);
    $[12] = open;
    $[13] = set;
    $[14] = t12;
  } else {
    t12 = $[14];
  }
  let t13;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-navbar__chevron" });
    $[15] = t13;
  } else {
    t13 = $[15];
  }
  let t14;
  if ($[16] !== id || $[17] !== open || $[18] !== props.label || $[19] !== t10 || $[20] !== t11 || $[21] !== t12) {
    t14 = /* @__PURE__ */ React.createElement("button", { ref: button, type: t9, className: t10, "aria-current": t11, "aria-expanded": open, "aria-controls": id, onClick: t12 }, props.label, t13);
    $[16] = id;
    $[17] = open;
    $[18] = props.label;
    $[19] = t10;
    $[20] = t11;
    $[21] = t12;
    $[22] = t14;
  } else {
    t14 = $[22];
  }
  const t15 = "srp-container--" + (ctx ? ctx.size : "xl");
  let t16;
  if ($[23] !== t15) {
    t16 = cn("srp-navbar__menu-inner srp-container srp-container--padded", t15);
    $[23] = t15;
    $[24] = t16;
  } else {
    t16 = $[24];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef2, "data-state": open ? "open" : "closed", className: t8 }, t14, /* @__PURE__ */ React.createElement("div", { id, className: "srp-navbar__menu-panel", hidden: !open }, /* @__PURE__ */ React.createElement("div", { className: t16 }, parts)));
}
function _temp3(c, i) {
  return /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c);
}
var NavbarMenu = /* @__PURE__ */ named("NavbarMenu", NavbarMenuRender);
function NavbarMenuGroupRender(t0) {
  const $ = _c(4);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    title: 1,
    children: 1,
    className: 1
  });
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-navbar-group", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  const t3 = cn("srp-navbar__menu-group", props.className);
  const t4 = "list";
  const t5 = "srp-navbar__menu-list";
  const t6 = flattenChildren(props.children).map(_temp4);
  let t7;
  if ($[2] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("ul", { role: t4, className: t5 }, t6);
    $[2] = t6;
    $[3] = t7;
  } else {
    t7 = $[3];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, role: "group", "aria-labelledby": id, className: t3 }, /* @__PURE__ */ React.createElement("div", { id, className: "srp-navbar__menu-title" }, props.title), t7);
}
function _temp4(c, i) {
  return /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c);
}
var NavbarMenuGroup = /* @__PURE__ */ named("NavbarMenuGroup", NavbarMenuGroupRender);
function NavbarMenuLinkBaseRender(t0) {
  const $ = _c(21);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, {
    current: 1,
    as: 1,
    className: 1,
    onClick: 1,
    description: 1,
    children: 1
  });
  const id = domId("srp-navbar-link", React.useId());
  const has = props.description != null && props.description !== false && props.description !== "";
  const Tag = props.as || config.link;
  const t1 = props.current ? "page" : void 0;
  const t2 = has ? id + "-name" : void 0;
  const t3 = has ? id + "-desc" : void 0;
  const t4 = cn("srp-navbar__menu-link", props.current && "srp-navbar__menu-link--active", props.className);
  let t5;
  if ($[0] !== ctx || $[1] !== props) {
    t5 = (e) => {
      if (props.onClick) {
        props.onClick(e);
      }
      if (ctx) {
        ctx.close();
      }
    };
    $[0] = ctx;
    $[1] = props;
    $[2] = t5;
  } else {
    t5 = $[2];
  }
  const t6 = id + "-name";
  let t7;
  if ($[3] !== props.children || $[4] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("span", { id: t6, className: "srp-navbar__menu-name" }, props.children);
    $[3] = props.children;
    $[4] = t6;
    $[5] = t7;
  } else {
    t7 = $[5];
  }
  let t8;
  if ($[6] !== has || $[7] !== id || $[8] !== props.description) {
    t8 = has ? /* @__PURE__ */ React.createElement("span", { id: id + "-desc", className: "srp-navbar__menu-desc" }, props.description) : null;
    $[6] = has;
    $[7] = id;
    $[8] = props.description;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  let t9;
  if ($[10] !== Tag || $[11] !== ref || $[12] !== rest || $[13] !== t1 || $[14] !== t2 || $[15] !== t3 || $[16] !== t4 || $[17] !== t5 || $[18] !== t7 || $[19] !== t8) {
    t9 = /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, "aria-current": t1, "aria-labelledby": t2, "aria-describedby": t3, className: t4, onClick: t5 }, t7, t8);
    $[10] = Tag;
    $[11] = ref;
    $[12] = rest;
    $[13] = t1;
    $[14] = t2;
    $[15] = t3;
    $[16] = t4;
    $[17] = t5;
    $[18] = t7;
    $[19] = t8;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  return t9;
}
var NavbarMenuLinkBase = /* @__PURE__ */ named("NavbarMenuLink", NavbarMenuLinkBaseRender);
var NavbarMenuLink = NavbarMenuLinkBase;
export {
  Navbar,
  NavbarLink,
  NavbarMenu,
  NavbarMenuGroup,
  NavbarMenuLink
};
//# sourceMappingURL=Navbar.js.map
