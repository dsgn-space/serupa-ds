"use client";

// src/components/Navbar/Navbar.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { useBreakpoint } from "../../internal/media.js";
import { config } from "../../internal/config.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { component } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { flattenChildren } from "../../internal/children.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { activeIn } from "../../internal/root.js";
var NavbarContext = /* @__PURE__ */ React.createContext(null);
var Navbar = /* @__PURE__ */ component("Navbar", function Navbar2(props, ref) {
  const sds = useSettings();
  const rest = omit(props, { brand: 1, children: 1, actions: 1, sticky: 1, condense: 1, size: 1, menuLabel: 1, className: 1, "aria-label": 1, onKeyDown: 1, onBlur: 1 });
  const [open, setOpen] = React.useState(false);
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
  const id = domId("dk-nav", React.useId());
  const size = oneOf(["prose", "md", "lg", "xl", "2xl", "full"], props.size, "xl");
  const links = flattenChildren(props.children);
  const hasLinks = links.length > 0;
  const close = React.useCallback(() => {
    setOpen(false);
    setMenu(null);
  }, []);
  const ctx = React.useMemo(() => ({ close, menu, setMenu, size }), [close, menu, size]);
  useIsoLayoutEffect(() => {
    const h = bar.current;
    if (!props.sticky || !h) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--dk-navbar-offset", h.getBoundingClientRect().height + "px");
    set();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(set) : null;
    if (ro) ro.observe(h);
    let raf = 0;
    const onFocus = (e) => {
      const t = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
      if (!(t instanceof Element) || h.contains(t) || t.closest("dialog, [popover]")) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (activeIn(t) !== t) return;
        const below = t.getBoundingClientRect().bottom - window.innerHeight;
        if (below > 0) window.scrollBy(0, below);
        const covered = h.getBoundingClientRect().bottom - t.getBoundingClientRect().top;
        if (covered > 0) window.scrollBy(0, -covered);
      });
    };
    document.addEventListener("focusin", onFocus);
    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("focusin", onFocus);
      root.style.removeProperty("--dk-navbar-offset");
    };
  }, [props.sticky]);
  const wide = useBreakpoint("md");
  React.useEffect(() => {
    if (wide) setOpen(false);
  }, [wide]);
  React.useEffect(() => {
    if (!open) return;
    const on = (e) => {
      if (bar.current && e.target instanceof Node && !bar.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", on, true);
    return () => document.removeEventListener("pointerdown", on, true);
  }, [open]);
  function onKeyDown(e) {
    if (props.onKeyDown) props.onKeyDown(e);
    if (!e.defaultPrevented && e.key === "Escape" && open && !isComposing(e)) {
      e.preventDefault();
      setOpen(false);
      if (toggle.current) toggle.current.focus();
    }
  }
  function onBlur(e) {
    if (props.onBlur) props.onBlur(e);
    if (open && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  }
  useIsoLayoutEffect(() => {
    if (!leaving) return;
    const n = panel.current, s = n ? getComputedStyle(n) : null;
    const ms = s && s.display !== "none" ? Math.max(...s.transitionDuration.split(",").map((d) => parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1e3))) : 0;
    if (!(ms > 0)) {
      setLeaving(false);
      return;
    }
    const t = window.setTimeout(() => setLeaving(false), ms + 50);
    return () => window.clearTimeout(t);
  }, [leaving]);
  const nav = hasLinks ? /* @__PURE__ */ React.createElement(
    "nav",
    {
      ref: panel,
      id,
      "aria-label": props["aria-label"] || sds.labels.mainNavigation,
      className: cn("dk-navbar__nav", leaving && "dk-navbar__nav--leaving"),
      inert: leaving || void 0,
      onTransitionEnd: (e) => {
        if (e.target === e.currentTarget && e.propertyName === "opacity" && !open) setLeaving(false);
      }
    },
    /* @__PURE__ */ React.createElement("ul", { className: "dk-navbar__links" }, links.map((c, i) => /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c)))
  ) : null;
  const mergedRef = useMergedRef(ref, (n) => {
    bar.current = n;
  });
  return /* @__PURE__ */ React.createElement(NavbarContext.Provider, { value: ctx }, /* @__PURE__ */ React.createElement("header", { ...rest, ref: mergedRef, onKeyDown, onBlur, "data-component": "navbar", "data-state": open ? "open" : "closed", className: cn("dk-navbar", props.sticky && "dk-navbar--sticky", props.sticky && props.condense && "dk-navbar--condense", props.className) }, /* @__PURE__ */ React.createElement("div", { className: cn("dk-navbar__inner dk-container dk-container--padded", "dk-container--" + size) }, props.brand != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-navbar__brand" }, typeof props.brand === "string" || typeof props.brand === "number" ? /* @__PURE__ */ React.createElement("span", null, props.brand) : props.brand) : null, open || leaving ? null : nav, props.actions != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-navbar__actions" }, props.actions) : null, hasLinks ? /* @__PURE__ */ React.createElement(
    IconButton,
    {
      ref: toggle,
      className: "dk-navbar__toggle",
      icon: open ? icons.Close : icons.Menu,
      label: props.menuLabel || sds.labels.menu,
      hideTitle: true,
      "aria-expanded": open,
      "aria-controls": id,
      onClick: () => setOpen(!open)
    }
  ) : null, open || leaving ? nav : null)));
});
var NavbarLinkBase = /* @__PURE__ */ component("NavbarLink", function NavbarLink(props, ref) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { active: 1, as: 1, className: 1, onClick: 1 });
  return React.createElement(props.as || config.link, Object.assign(rest, {
    ref,
    "aria-current": props.active ? "page" : void 0,
    className: cn("dk-navbar__link", props.active && "dk-navbar__link--active", props.className),
    onClick: (e) => {
      if (props.onClick) props.onClick(e);
      if (ctx) ctx.close();
    }
  }));
});
var NavbarLink2 = NavbarLinkBase;
var NavbarMenu = /* @__PURE__ */ component("NavbarMenu", function NavbarMenu2(props, ref) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { label: 1, children: 1, active: 1, className: 1 });
  const id = domId("dk-navbar-menu", React.useId());
  const [own, setOwn] = React.useState(false);
  const open = ctx ? ctx.menu === id : own;
  const set = React.useCallback((v) => {
    if (ctx) ctx.setMenu((was) => v ? id : was === id ? null : was);
    else setOwn(v);
  }, [ctx, id]);
  const root = React.useRef(null);
  const button = React.useRef(null);
  React.useEffect(() => {
    const el = root.current;
    if (!open || !el) return;
    const press = (e) => {
      if (e.target instanceof Node && !el.contains(e.target)) set(false);
    };
    const leave = (e) => {
      if (e.relatedTarget instanceof Node && !el.contains(e.relatedTarget)) set(false);
    };
    const key = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented && !isComposing(e)) {
        e.preventDefault();
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
  }, [open, set]);
  const parts = [];
  let loose = [];
  const flush = () => {
    if (loose.length) parts.push(/* @__PURE__ */ React.createElement("ul", { key: "list" + parts.length, role: "list", className: "dk-navbar__menu-list" }, loose.map((c, i) => /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c))));
    loose = [];
  };
  for (const c of flattenChildren(props.children)) {
    if (React.isValidElement(c) && c.type === NavbarMenuGroup) {
      flush();
      parts.push(c);
    } else loose.push(c);
  }
  flush();
  const mergedRef2 = useMergedRef(ref, (n) => {
    root.current = n;
  });
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef2, "data-state": open ? "open" : "closed", className: cn("dk-navbar__menu", props.className) }, /* @__PURE__ */ React.createElement(
    "button",
    {
      ref: button,
      type: "button",
      className: cn("dk-navbar__link dk-navbar__menu-button", props.active && "dk-navbar__link--active"),
      "aria-current": props.active ? "true" : void 0,
      "aria-expanded": open,
      "aria-controls": id,
      onClick: () => set(!open)
    },
    props.label,
    /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "dk-navbar__chevron" })
  ), /* @__PURE__ */ React.createElement("div", { id, className: "dk-navbar__menu-panel", hidden: !open }, /* @__PURE__ */ React.createElement("div", { className: cn("dk-navbar__menu-inner dk-container dk-container--padded", "dk-container--" + (ctx ? ctx.size : "xl")) }, parts)));
});
var NavbarMenuGroup = /* @__PURE__ */ component("NavbarMenuGroup", function NavbarMenuGroup2(props, ref) {
  const rest = omit(props, { title: 1, children: 1, className: 1 });
  const id = domId("dk-navbar-group", React.useId());
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, role: "group", "aria-labelledby": id, className: cn("dk-navbar__menu-group", props.className) }, /* @__PURE__ */ React.createElement("div", { id, className: "dk-navbar__menu-title" }, props.title), /* @__PURE__ */ React.createElement("ul", { role: "list", className: "dk-navbar__menu-list" }, flattenChildren(props.children).map((c, i) => /* @__PURE__ */ React.createElement("li", { key: React.isValidElement(c) && c.key != null ? c.key : i }, c))));
});
var NavbarMenuLinkBase = /* @__PURE__ */ component("NavbarMenuLink", function NavbarMenuLink(props, ref) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { active: 1, as: 1, className: 1, onClick: 1, description: 1, children: 1 });
  const id = domId("dk-navbar-link", React.useId());
  const has = props.description != null && props.description !== false && props.description !== "";
  return React.createElement(props.as || config.link, Object.assign(rest, {
    ref,
    "aria-current": props.active ? "page" : void 0,
    "aria-labelledby": has ? id + "-name" : void 0,
    "aria-describedby": has ? id + "-desc" : void 0,
    className: cn("dk-navbar__menu-link", props.active && "dk-navbar__menu-link--active", props.className),
    onClick: (e) => {
      if (props.onClick) props.onClick(e);
      if (ctx) ctx.close();
    }
  }), /* @__PURE__ */ React.createElement("span", { id: id + "-name", className: "dk-navbar__menu-name" }, props.children), has ? /* @__PURE__ */ React.createElement("span", { id: id + "-desc", className: "dk-navbar__menu-desc" }, props.description) : null);
});
var NavbarMenuLink2 = NavbarMenuLinkBase;
export {
  Navbar,
  NavbarLink2 as NavbarLink,
  NavbarMenu,
  NavbarMenuGroup,
  NavbarMenuLink2 as NavbarMenuLink
};
//# sourceMappingURL=Navbar.js.map
