"use client";

// src/components/Menubar/Menubar.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { typeahead } from "../../internal/typeahead.js";
import { Menu } from "../Menu/Menu.js";
var BarContext = /* @__PURE__ */ React.createContext(null);
var IndexContext = /* @__PURE__ */ React.createContext(0);
var OWN = { className: 1, children: 1, onKeyDown: 1 };
var TOP = ":scope > .dk-menubar__item";
var Menubar = /* @__PURE__ */ component("Menubar", function Menubar2(props, ref) {
  const menus = React.Children.toArray(props.children).filter(React.isValidElement);
  const [open, setOpen] = React.useState(() => {
    const first = menus.findIndex((m) => !!m.props.defaultOpen);
    return first < 0 ? null : first;
  });
  const [at, setAt] = React.useState(() => open ?? 0);
  const typed = React.useRef({ text: "", at: 0 });
  const bar = React.useMemo(() => ({ open, setOpen, at, setAt }), [open, at]);
  const onKeyDown = (e) => {
    if (props.onKeyDown) props.onKeyDown(e);
    if (e.defaultPrevented || isComposing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
    const tops = Array.from(e.currentTarget.querySelectorAll(TOP));
    if (!tops.length) return;
    const top = tops.indexOf(e.target);
    const i = top >= 0 ? top : open ?? at;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "ArrowRight" ? rtl ? -1 : 1 : e.key === "ArrowLeft" ? rtl ? 1 : -1 : 0;
    const go = (j) => {
      e.preventDefault();
      const n = (j + tops.length) % tops.length;
      setAt(n);
      if (open !== null && tops[n]?.getAttribute("aria-disabled") !== "true") setOpen(n);
      else {
        setOpen(null);
        tops[n]?.focus();
      }
    };
    if (step) go(i + step);
    else if (top < 0) return;
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(tops.length - 1);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const n = typeahead(typed.current, e.key, tops.map((t) => t.textContent || ""), top);
      if (n >= 0) {
        e.preventDefault();
        setAt(n);
        tops[n]?.focus();
      }
    }
  };
  return /* @__PURE__ */ React.createElement(BarContext.Provider, { value: bar }, /* @__PURE__ */ React.createElement("div", { ...omit(props, OWN), ref, role: "menubar", tabIndex: -1, className: cn("dk-menubar", props.className), "data-component": "menubar", onKeyDown }, menus.map((m, i) => /* @__PURE__ */ React.createElement(IndexContext.Provider, { key: m.key ?? i, value: i }, m))));
});
var MenubarMenu = /* @__PURE__ */ component("MenubarMenu", function MenubarMenu2(props, ref) {
  const bar = React.useContext(BarContext);
  const i = React.useContext(IndexContext);
  const { label, children, disabled, defaultOpen, className, onFocus, onPointerEnter, ...rest } = props;
  const [alone, setAlone] = React.useState(!!defaultOpen);
  const open = !disabled && (bar ? bar.open === i : alone);
  const onOpenChange = (next) => {
    if (next && disabled) return;
    if (!bar) setAlone(next);
    else if (next) {
      bar.setAt(i);
      bar.setOpen(i);
    } else bar.setOpen((o) => o === i ? null : o);
  };
  const trigger = /* @__PURE__ */ React.createElement(
    "button",
    {
      ...rest,
      ref,
      type: "button",
      role: "menuitem",
      className: cn("dk-menubar__item", className),
      tabIndex: bar ? bar.at === i ? 0 : -1 : 0,
      "aria-disabled": disabled || void 0,
      onFocus: (e) => {
        if (onFocus) onFocus(e);
        if (bar) bar.setAt(i);
      },
      onPointerEnter: (e) => {
        if (onPointerEnter) onPointerEnter(e);
        if (bar && e.pointerType === "mouse" && bar.open !== null && bar.open !== i && !disabled) {
          bar.setAt(i);
          bar.setOpen(i);
        }
      }
    },
    label
  );
  return /* @__PURE__ */ React.createElement(Menu, { trigger, open, onOpenChange, placement: "bottom-start" }, children);
});
export {
  Menubar,
  MenubarMenu
};
//# sourceMappingURL=Menubar.js.map
