"use client";

// src/components/Menubar/Menubar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { typeahead } from "../../internal/typeahead.js";
import { Menu, MenuSwap } from "../Menu/Menu.js";
import { isRtl } from "../../internal/position.js";
var BarContext = /* @__PURE__ */ React.createContext(null);
var IndexContext = /* @__PURE__ */ React.createContext(0);
var OWN = {
  className: 1,
  children: 1,
  onKeyDown: 1
};
var TOP = ":scope > .srp-menubar__item";
function MenubarRender(t0) {
  const $ = _c(21);
  const {
    ref,
    ...props
  } = t0;
  const menus = React.Children.toArray(props.children).filter(React.isValidElement);
  const [open, setOpen] = React.useState(() => {
    const first = menus.findIndex(_temp);
    return first < 0 ? null : first;
  });
  let t1;
  if ($[0] !== open) {
    t1 = () => open ?? 0;
    $[0] = open;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [at, setAt] = React.useState(t1);
  const typed = React.useRef({
    text: "",
    at: 0
  });
  let t2;
  if ($[2] !== at || $[3] !== open) {
    t2 = {
      open,
      setOpen,
      at,
      setAt
    };
    $[2] = at;
    $[3] = open;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const bar = t2;
  const [was, setWas] = React.useState(open);
  const [swap, setSwap] = React.useState(false);
  if (was !== open) {
    setWas(open);
    setSwap(was !== null && open !== null);
  }
  const onKeyDown = (e) => {
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
    if (e.defaultPrevented || isComposing(e) || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const tops = Array.from(e.currentTarget.querySelectorAll(TOP));
    if (!tops.length) {
      return;
    }
    const top = tops.indexOf(e.target);
    const i = top >= 0 ? top : open ?? at;
    const rtl = isRtl(e.currentTarget);
    const step = e.key === "ArrowRight" ? rtl ? -1 : 1 : e.key === "ArrowLeft" ? rtl ? 1 : -1 : 0;
    const go = (j) => {
      e.preventDefault();
      const n = (j + tops.length) % tops.length;
      setAt(n);
      if (open !== null && tops[n]?.getAttribute("aria-disabled") !== "true") {
        setOpen(n);
      } else {
        setOpen(null);
        tops[n]?.focus();
      }
    };
    if (step) {
      go(i + step);
    } else {
      if (top < 0) {
        return;
      } else {
        if (e.key === "Home") {
          go(0);
        } else {
          if (e.key === "End") {
            go(tops.length - 1);
          } else {
            if (e.key.length === 1 && /\S/.test(e.key)) {
              const n_0 = typeahead(typed.current, e.key, tops.map(_temp2), top);
              if (n_0 >= 0) {
                e.preventDefault();
                setAt(n_0);
                tops[n_0]?.focus();
              }
            }
          }
        }
      }
    }
  };
  const t3 = BarContext;
  const t4 = MenuSwap;
  const t5 = omit(props, OWN);
  const t6 = "menubar";
  const t7 = -1;
  const t8 = cn("srp-menubar", props.className);
  let t9;
  if ($[5] !== menus) {
    t9 = menus.map(_temp3);
    $[5] = menus;
    $[6] = t9;
  } else {
    t9 = $[6];
  }
  let t10;
  if ($[7] !== onKeyDown || $[8] !== ref || $[9] !== t5 || $[10] !== t8 || $[11] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("div", { ...t5, ref, role: t6, tabIndex: t7, className: t8, "data-component": "menubar", onKeyDown }, t9);
    $[7] = onKeyDown;
    $[8] = ref;
    $[9] = t5;
    $[10] = t8;
    $[11] = t9;
    $[12] = t10;
  } else {
    t10 = $[12];
  }
  let t11;
  if ($[13] !== swap || $[14] !== t10 || $[15] !== t4.Provider) {
    t11 = /* @__PURE__ */ React.createElement(t4.Provider, { value: swap }, t10);
    $[13] = swap;
    $[14] = t10;
    $[15] = t4.Provider;
    $[16] = t11;
  } else {
    t11 = $[16];
  }
  let t12;
  if ($[17] !== bar || $[18] !== t11 || $[19] !== t3.Provider) {
    t12 = /* @__PURE__ */ React.createElement(t3.Provider, { value: bar }, t11);
    $[17] = bar;
    $[18] = t11;
    $[19] = t3.Provider;
    $[20] = t12;
  } else {
    t12 = $[20];
  }
  return t12;
}
function _temp3(m_0, i_0) {
  return /* @__PURE__ */ React.createElement(IndexContext.Provider, { key: m_0.key ?? i_0, value: i_0 }, m_0);
}
function _temp2(t) {
  return t.textContent || "";
}
function _temp(m) {
  return !!m.props.defaultOpen;
}
var Menubar = /* @__PURE__ */ named("Menubar", MenubarRender);
function MenubarMenuRender(t0) {
  const $ = _c(23);
  const {
    ref,
    ...props
  } = t0;
  const bar = React.useContext(BarContext);
  const i = React.useContext(IndexContext);
  const {
    label,
    children,
    disabled,
    defaultOpen,
    className,
    onFocus,
    onPointerEnter,
    ...rest
  } = props;
  const [alone, setAlone] = React.useState(!!defaultOpen);
  const open = !disabled && (bar ? bar.open === i : alone);
  const onOpenChange = (next) => {
    if (next && disabled) {
      return;
    }
    if (!bar) {
      setAlone(next);
    } else {
      if (next) {
        bar.setAt(i);
        bar.setOpen(i);
      } else {
        bar.setOpen((o) => o === i ? null : o);
      }
    }
  };
  const t1 = "button";
  const t2 = "menuitem";
  const t3 = cn("srp-menubar__item", className);
  const t4 = bar ? bar.at === i ? 0 : -1 : 0;
  const t5 = disabled || void 0;
  let t6;
  if ($[0] !== bar || $[1] !== i || $[2] !== onFocus) {
    t6 = (e) => {
      if (onFocus) {
        onFocus(e);
      }
      if (bar) {
        bar.setAt(i);
      }
    };
    $[0] = bar;
    $[1] = i;
    $[2] = onFocus;
    $[3] = t6;
  } else {
    t6 = $[3];
  }
  let t7;
  if ($[4] !== bar || $[5] !== disabled || $[6] !== i || $[7] !== onPointerEnter) {
    t7 = (e_0) => {
      if (onPointerEnter) {
        onPointerEnter(e_0);
      }
      if (bar && e_0.pointerType === "mouse" && bar.open !== null && bar.open !== i && !disabled) {
        bar.setAt(i);
        bar.setOpen(i);
      }
    };
    $[4] = bar;
    $[5] = disabled;
    $[6] = i;
    $[7] = onPointerEnter;
    $[8] = t7;
  } else {
    t7 = $[8];
  }
  let t8;
  if ($[9] !== label || $[10] !== ref || $[11] !== rest || $[12] !== t3 || $[13] !== t4 || $[14] !== t5 || $[15] !== t6 || $[16] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("button", { ...rest, ref, type: t1, role: t2, className: t3, tabIndex: t4, "aria-disabled": t5, onFocus: t6, onPointerEnter: t7 }, label);
    $[9] = label;
    $[10] = ref;
    $[11] = rest;
    $[12] = t3;
    $[13] = t4;
    $[14] = t5;
    $[15] = t6;
    $[16] = t7;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  const trigger = t8;
  let t9;
  if ($[18] !== children || $[19] !== onOpenChange || $[20] !== open || $[21] !== trigger) {
    t9 = /* @__PURE__ */ React.createElement(Menu, { trigger, open, onOpenChange, placement: "bottom-start" }, children);
    $[18] = children;
    $[19] = onOpenChange;
    $[20] = open;
    $[21] = trigger;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  return t9;
}
var MenubarMenu = /* @__PURE__ */ named("MenubarMenu", MenubarMenuRender);
export {
  Menubar,
  MenubarMenu
};
//# sourceMappingURL=Menubar.js.map
