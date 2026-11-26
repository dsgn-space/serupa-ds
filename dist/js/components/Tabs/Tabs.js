"use client";

// src/components/Tabs/Tabs.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { warnOnce } from "../../internal/warn.js";
import { hideUntilFound, revealInvalid } from "../../internal/untilFound.js";
import { lastInputKeyboard, listenForInput } from "../../internal/lastInput.js";
import { activeIn } from "../../internal/root.js";
import { useTabRow } from "./tabRow.js";
import { useControllable } from "../../internal/controllable.js";
import { useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
var TabsContext = /* @__PURE__ */ React.createContext(null);
var useTabs = (who) => {
  const c = React.useContext(TabsContext);
  if (!c) {
    throw new Error("Serupa: " + who + " must be inside <Tabs>.");
  }
  return c;
};
var safe = (v) => String(v).replace(/[^A-Za-z0-9_-]/g, "_");
function firstTab(children) {
  let found = null;
  React.Children.forEach(children, (c) => {
    if (found != null || !React.isValidElement(c)) return;
    const p = c.props;
    if (c.type === Tab) {
      if (!p.disabled && p.value != null) found = p.value;
      return;
    }
    found = firstTab(p.children);
  });
  return found;
}
function put(r, v) {
  r.current = v;
}
function TabsRender(t0) {
  const $ = _c(47);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    variant: 1,
    size: 1,
    activation: 1,
    orientation: 1,
    className: 1
  });
  const vertical = props.orientation === "vertical";
  const base = domId("srp-tabs", React.useId());
  const [value, setInner, controlled] = useControllable(props.value, props.defaultValue != null ? props.defaultValue : firstTab(props.children), "Tabs", "value");
  const onChange = useLatest(props.onValueChange);
  const before = React.useRef(null);
  const [keyed, setKeyed] = React.useState(false);
  const [shown, setShown] = React.useState(value);
  if (shown !== value) {
    setShown(value);
    setKeyed(lastInputKeyboard());
  }
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useIsoLayoutEffect(listenForInput, t1);
  const currentRef = useLatest(value);
  let t2;
  if ($[1] !== controlled || $[2] !== currentRef || $[3] !== onChange || $[4] !== setInner) {
    t2 = (v) => {
      if (v === currentRef.current) {
        return;
      }
      if (before.current) {
        before.current();
      }
      if (!controlled) {
        currentRef.current = v;
        setInner(v);
      }
      if (onChange.current) {
        onChange.current(v);
      }
    };
    $[1] = controlled;
    $[2] = currentRef;
    $[3] = onChange;
    $[4] = setInner;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const select = t2;
  const variant = oneOf(["line", "pill"], props.variant, "line");
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  let t3;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {};
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  const [panels, setPanels] = React.useState(t3);
  let t4;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = (v_0, d) => setPanels((p) => Object.assign({}, p, {
      [v_0]: (p[v_0] || 0) + d
    }));
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const register = t4;
  const [stop, setStop] = React.useState(null);
  const [hiddenStop, setHiddenStop] = React.useState(null);
  const tabStop = stop != null ? stop : hiddenStop;
  const closed = React.useRef(null);
  const t5 = props.activation === "manual";
  let t6;
  if ($[8] !== base || $[9] !== keyed || $[10] !== panels || $[11] !== select || $[12] !== size || $[13] !== t5 || $[14] !== tabStop || $[15] !== value || $[16] !== vertical) {
    t6 = {
      closed,
      size,
      base,
      value,
      select,
      manual: t5,
      vertical,
      panels,
      register,
      stop: tabStop,
      before,
      keyed
    };
    $[8] = base;
    $[9] = keyed;
    $[10] = panels;
    $[11] = select;
    $[12] = size;
    $[13] = t5;
    $[14] = tabStop;
    $[15] = value;
    $[16] = vertical;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  const ctx = t6;
  const self = React.useRef(null);
  let t7;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = [];
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  const order = React.useRef(t7);
  const focusedIn = React.useRef(false);
  let t8;
  if ($[19] !== base || $[20] !== controlled || $[21] !== select || $[22] !== setInner || $[23] !== value) {
    t8 = () => {
      if (!self.current) {
        return;
      }
      const tabs = Array.from(self.current.querySelectorAll('[role="tab"]')).filter((t) => t.id.startsWith(base + "-tab-"));
      const all = tabs.map(_temp);
      const enabled = tabs.filter(_temp2).map(_temp3);
      const before_0 = order.current;
      order.current = all;
      const gone = closed.current;
      if (gone != null && !all.includes(gone)) {
        closed.current = null;
        const at = before_0.indexOf(gone);
        const active = activeIn(self.current);
        const near = before_0.slice(at + 1).find((v_2) => enabled.includes(v_2)) ?? before_0.slice(0, at).reverse().find((v_1) => enabled.includes(v_1));
        const t_3 = near != null && near !== value ? tabs.find((x) => x.dataset.value === near) : void 0;
        if (t_3 && value != null && all.includes(value) && focusedIn.current && (!active || active === document.body || !active.isConnected)) {
          t_3.focus();
        }
      }
      const matched = value != null && all.includes(value);
      setStop(matched ? null : enabled[0] ?? null);
      const first = enabled[0];
      if (first === void 0 || matched) {
        return;
      }
      if (controlled) {
        if (process.env.NODE_ENV !== "production" && value != null && before_0.includes(value)) {
          warnOnce("tabs-removed", `Tabs: the selected tab "${value}" was removed, so no tab is selected. Set value to another tab when you remove it.`);
        } else {
          if (process.env.NODE_ENV !== "production" && value != null) {
            warnOnce("tabs-value", `Tabs: value "${value}" matches no Tab, so no tab is selected. Set it to one of the Tabs' values.`);
          }
        }
        return;
      }
      const at_0 = value != null ? before_0.indexOf(value) : -1;
      if (process.env.NODE_ENV !== "production" && at_0 < 0 && value != null && !before_0.length) {
        warnOnce("tabs-value", `Tabs: defaultValue "${value}" matches no Tab, so the first tab is selected. Set it to one of the Tabs' values.`);
      }
      if (at_0 < 0) {
        setInner(first);
        return;
      }
      const after = before_0.slice(at_0 + 1).find((v_3) => enabled.includes(v_3));
      const prev = before_0.slice(0, at_0).reverse().find((v_4) => enabled.includes(v_4));
      const next = after ?? prev ?? first;
      select(next);
      const active_0 = activeIn(self.current);
      if (focusedIn.current && (!active_0 || active_0 === document.body || !active_0.isConnected)) {
        const t_4 = tabs.find((x_0) => x_0.dataset.value === next);
        if (t_4) {
          t_4.focus();
        }
      }
    };
    $[19] = base;
    $[20] = controlled;
    $[21] = select;
    $[22] = setInner;
    $[23] = value;
    $[24] = t8;
  } else {
    t8 = $[24];
  }
  useIsoLayoutEffect(t8);
  let t9;
  if ($[25] !== base) {
    t9 = () => {
      const el = self.current;
      if (!el) {
        return;
      }
      const tabs_0 = Array.from(el.querySelectorAll('[role="tab"]')).filter((t_5) => t_5.id.startsWith(base + "-tab-"));
      const check = () => {
        const sel = tabs_0.find(_temp4);
        const next_0 = sel && !sel.getClientRects().length ? tabs_0.find(_temp5) : void 0;
        setHiddenStop(next_0 ? next_0.dataset.value : null);
      };
      check();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
      if (ro) {
        ro.observe(el);
        for (const t_8 of tabs_0) {
          ro.observe(t_8);
        }
      }
      return () => {
        if (ro) {
          ro.disconnect();
        }
      };
    };
    $[25] = base;
    $[26] = t9;
  } else {
    t9 = $[26];
  }
  React.useEffect(t9);
  let t10;
  if ($[27] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = (n) => {
      self.current = n;
    };
    $[27] = t10;
  } else {
    t10 = $[27];
  }
  const mergedRef = useMergedRef(ref, t10);
  let t11;
  let t12;
  if ($[28] !== rest) {
    t11 = (e) => {
      focusedIn.current = true;
      if (rest.onFocus) {
        rest.onFocus(e);
      }
    };
    t12 = (e_0) => {
      if (e_0.relatedTarget && !e_0.currentTarget.contains(e_0.relatedTarget)) {
        focusedIn.current = false;
      }
      if (rest.onBlur) {
        rest.onBlur(e_0);
      }
    };
    $[28] = rest;
    $[29] = t11;
    $[30] = t12;
  } else {
    t11 = $[29];
    t12 = $[30];
  }
  const t13 = "srp-tabs--" + variant;
  const t14 = size !== "md" && "srp-tabs--" + size;
  const t15 = vertical && "srp-tabs--vertical";
  let t16;
  if ($[31] !== props.className || $[32] !== t13 || $[33] !== t14 || $[34] !== t15) {
    t16 = cn("srp-tabs", t13, t14, t15, props.className);
    $[31] = props.className;
    $[32] = t13;
    $[33] = t14;
    $[34] = t15;
    $[35] = t16;
  } else {
    t16 = $[35];
  }
  const t17 = vertical ? "vertical" : "horizontal";
  let t18;
  if ($[36] !== mergedRef || $[37] !== rest || $[38] !== t11 || $[39] !== t12 || $[40] !== t16 || $[41] !== t17 || $[42] !== variant) {
    t18 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, onFocus: t11, onBlur: t12, className: t16, "data-component": "tabs", "data-variant": variant, "data-orientation": t17 });
    $[36] = mergedRef;
    $[37] = rest;
    $[38] = t11;
    $[39] = t12;
    $[40] = t16;
    $[41] = t17;
    $[42] = variant;
    $[43] = t18;
  } else {
    t18 = $[43];
  }
  let t19;
  if ($[44] !== ctx || $[45] !== t18) {
    t19 = /* @__PURE__ */ React.createElement(TabsContext.Provider, { value: ctx }, t18);
    $[44] = ctx;
    $[45] = t18;
    $[46] = t19;
  } else {
    t19 = $[46];
  }
  return t19;
}
function _temp5(t_7) {
  return !t_7.hasAttribute("disabled") && t_7.getClientRects().length > 0;
}
function _temp4(t_6) {
  return t_6.getAttribute("aria-selected") === "true";
}
function _temp3(t_2) {
  return t_2.dataset.value;
}
function _temp2(t_1) {
  return !t_1.hasAttribute("disabled");
}
function _temp(t_0) {
  return t_0.dataset.value;
}
var Tabs = /* @__PURE__ */ named("Tabs", TabsRender);
function TabListRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
  const ctx = useTabs("TabList");
  const {
    onAdd,
    addLabel,
    ...own
  } = props;
  const [list, fade, place] = useTabRow('[role="tab"]', '[role="tab"][aria-selected="true"]', ctx.vertical, ctx.value);
  const before = ctx.before;
  let t1;
  if ($[0] !== before || $[1] !== place) {
    t1 = () => {
      put(before, () => place(true));
      return () => put(before, null);
    };
    $[0] = before;
    $[1] = place;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  useIsoLayoutEffect(t1);
  const onKeyDown = (e) => {
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
    if (!e.defaultPrevented && e.key === "Delete" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const tab = activeIn(e.currentTarget);
      if (tab && tab.getAttribute("role") === "tab" && tab.hasAttribute("data-closable") && !tab.hasAttribute("disabled")) {
        e.preventDefault();
        tab.dispatchEvent(new CustomEvent("srp-tab-close"));
        return;
      }
    }
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const tabs = Array.from(e.currentTarget.querySelectorAll('[role="tab"]:not([disabled])')).filter(_temp6);
    const i = tabs.indexOf(activeIn(e.currentTarget));
    if (i < 0 || !tabs.length) {
      return;
    }
    const rtl = isRtl(e.currentTarget);
    const fwd = ctx.vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const back = ctx.vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (e.key === fwd) {
      next = (i + 1) % tabs.length;
    } else {
      if (e.key === back) {
        next = (i - 1 + tabs.length) % tabs.length;
      } else {
        if (e.key === "Home") {
          next = 0;
        } else {
          if (e.key === "End") {
            next = tabs.length - 1;
          }
        }
      }
    }
    const tab_0 = tabs[next];
    if (!tab_0) {
      return;
    }
    e.preventDefault();
    tab_0.focus();
    if (!ctx.manual && tab_0.dataset.value != null) {
      ctx.select(tab_0.dataset.value);
    }
  };
  const mergedRef2 = useMergedRef(ref, void 0, list);
  const t2 = "tablist";
  const t3 = ctx.vertical ? "vertical" : "horizontal";
  const t4 = cn("srp-tabs__list", props.className);
  const t5 = fade.before ? "" : void 0;
  const t6 = fade.after ? "" : void 0;
  let t7;
  if ($[3] !== mergedRef2 || $[4] !== onKeyDown || $[5] !== own || $[6] !== t3 || $[7] !== t4 || $[8] !== t5 || $[9] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { ...own, ref: mergedRef2, role: t2, "aria-orientation": t3, className: t4, "data-fade-before": t5, "data-fade-after": t6, onKeyDown });
    $[3] = mergedRef2;
    $[4] = onKeyDown;
    $[5] = own;
    $[6] = t3;
    $[7] = t4;
    $[8] = t5;
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const tablist = t7;
  let t8;
  if ($[11] !== addLabel || $[12] !== onAdd || $[13] !== tablist) {
    t8 = onAdd ? /* @__PURE__ */ React.createElement("div", { className: "srp-tabs__bar" }, tablist, /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-tabs__tab srp-tabs__add", onClick: onAdd }, /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__icon", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Add })), /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__label" }, addLabel))) : tablist;
    $[11] = addLabel;
    $[12] = onAdd;
    $[13] = tablist;
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  return t8;
}
function _temp6(t) {
  return t.getClientRects().length > 0;
}
var TabList = /* @__PURE__ */ named("TabList", TabListRender);
function TabRender(t0) {
  const $ = _c(28);
  const {
    ref,
    ...props
  } = t0;
  const ctx = useTabs("Tab");
  const rest = omit(props, {
    value: 1,
    icon: 1,
    className: 1,
    children: 1,
    onClose: 1
  });
  const L = useSettings(words).labels;
  const own = React.useRef(null);
  const close = useLatest(props.onClose);
  const closes = !!props.onClose;
  const closed = ctx.closed;
  const value = props.value;
  const shut = () => {
    put(closed, value);
    if (close.current) {
      close.current();
    }
  };
  React.useEffect(() => {
    const el = own.current;
    if (!el || !closes) {
      return;
    }
    const onClose = () => {
      put(closed, value);
      if (close.current) {
        close.current();
      }
    };
    el.addEventListener("srp-tab-close", onClose);
    return () => el.removeEventListener("srp-tab-close", onClose);
  }, [closes, closed, value, close]);
  const hintId = closes ? ctx.base + "-close-" + safe(props.value) : void 0;
  const refs = useMergedRef(ref, (n) => {
    own.current = n;
  });
  const selected = ctx.value === props.value;
  const id = ctx.base + "-tab-" + safe(props.value);
  const panel = ctx.base + "-panel-" + safe(props.value);
  const onClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
    if (!e.defaultPrevented) {
      ctx.select(props.value);
    }
  };
  const t1 = "button";
  const t2 = "tab";
  const t3 = closes ? "" : void 0;
  const t4 = closes ? "Delete" : void 0;
  const t5 = cn(hintId, props["aria-describedby"]) || void 0;
  const t6 = ctx.panels[props.value] ? panel : void 0;
  const t7 = selected && ctx.keyed ? "" : void 0;
  const t8 = selected || ctx.stop === props.value ? 0 : -1;
  const t9 = props.value;
  const t10 = selected ? "active" : "inactive";
  const t11 = cn("srp-tabs__tab", props.className);
  const t12 = props.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__icon", "aria-hidden": "true" }, asIcon(props.icon)) : null;
  let t13;
  if ($[0] !== props.children) {
    t13 = /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__label" }, props.children);
    $[0] = props.children;
    $[1] = t13;
  } else {
    t13 = $[1];
  }
  let t14;
  if ($[2] !== closes || $[3] !== shut) {
    t14 = closes ? /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__close", "aria-hidden": "true", "data-closes": "", onPointerDown: _temp7, onClick: (e_1) => {
      e_1.preventDefault();
      e_1.stopPropagation();
      shut();
    } }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Close })) : null;
    $[2] = closes;
    $[3] = shut;
    $[4] = t14;
  } else {
    t14 = $[4];
  }
  let t15;
  if ($[5] !== L || $[6] !== closes || $[7] !== hintId) {
    t15 = closes ? /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__close-hint", id: hintId, hidden: true }, L.tabCloseHint) : null;
    $[5] = L;
    $[6] = closes;
    $[7] = hintId;
    $[8] = t15;
  } else {
    t15 = $[8];
  }
  let t16;
  if ($[9] !== id || $[10] !== onClick || $[11] !== props.value || $[12] !== refs || $[13] !== rest || $[14] !== selected || $[15] !== t10 || $[16] !== t11 || $[17] !== t12 || $[18] !== t13 || $[19] !== t14 || $[20] !== t15 || $[21] !== t3 || $[22] !== t4 || $[23] !== t5 || $[24] !== t6 || $[25] !== t7 || $[26] !== t8) {
    t16 = /* @__PURE__ */ React.createElement("button", { ...rest, ref: refs, type: t1, role: t2, id, "data-closable": t3, "aria-keyshortcuts": t4, "aria-describedby": t5, "aria-controls": t6, "aria-selected": selected, "data-instant": t7, tabIndex: t8, "data-value": t9, "data-state": t10, className: t11, onClick }, t12, t13, t14, t15);
    $[9] = id;
    $[10] = onClick;
    $[11] = props.value;
    $[12] = refs;
    $[13] = rest;
    $[14] = selected;
    $[15] = t10;
    $[16] = t11;
    $[17] = t12;
    $[18] = t13;
    $[19] = t14;
    $[20] = t15;
    $[21] = t3;
    $[22] = t4;
    $[23] = t5;
    $[24] = t6;
    $[25] = t7;
    $[26] = t8;
    $[27] = t16;
  } else {
    t16 = $[27];
  }
  return t16;
}
function _temp7(e_0) {
  e_0.preventDefault();
}
var Tab = /* @__PURE__ */ named("Tab", TabRender);
var FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
function startsFocusable(el) {
  const first = el.querySelector(FOCUSABLE);
  if (!first) return false;
  const before = el.ownerDocument.createRange();
  before.setStart(el, 0);
  before.setEndBefore(first);
  return !before.toString().trim();
}
function TabPanelRender(t0) {
  const $ = _c(36);
  const {
    ref,
    ...props
  } = t0;
  const ctx = useTabs("TabPanel");
  const rest = omit(props, {
    value: 1,
    keepMounted: 1,
    className: 1,
    children: 1
  });
  const selected = ctx.value === props.value;
  const keep = props.keepMounted !== false;
  const register = ctx.register;
  let t1;
  let t2;
  if ($[0] !== props.value || $[1] !== register) {
    t1 = () => {
      register(props.value, 1);
      return () => register(props.value, -1);
    };
    t2 = [props.value, register];
    $[0] = props.value;
    $[1] = register;
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  useIsoLayoutEffect(t1, t2);
  const own = React.useRef(null);
  let t3;
  if ($[4] !== ctx.base || $[5] !== props.value) {
    t3 = () => own.current && own.current.getRootNode().getElementById(ctx.base + "-tab-" + safe(props.value));
    $[4] = ctx.base;
    $[5] = props.value;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  const tabOf = t3;
  let t4;
  if ($[7] !== ctx || $[8] !== props.value || $[9] !== selected || $[10] !== tabOf) {
    t4 = selected ? null : () => {
      const t = tabOf();
      if (t && !t.hasAttribute("disabled")) {
        ctx.select(props.value);
      }
    };
    $[7] = ctx;
    $[8] = props.value;
    $[9] = selected;
    $[10] = tabOf;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  const pick = useLatest(t4);
  let t5;
  if ($[12] !== keep || $[13] !== selected || $[14] !== tabOf) {
    t5 = () => {
      const el = own.current;
      const t_0 = tabOf();
      if (!el || selected || !keep || !t_0) {
        return;
      }
      if (!t_0.hasAttribute("disabled")) {
        hideUntilFound(el);
      } else {
        if (el.hasAttribute("data-findable")) {
          el.removeAttribute("data-findable");
          el.setAttribute("hidden", "");
        }
      }
    };
    $[12] = keep;
    $[13] = selected;
    $[14] = tabOf;
    $[15] = t5;
  } else {
    t5 = $[15];
  }
  useIsoLayoutEffect(t5);
  let t6;
  let t7;
  if ($[16] !== pick) {
    t6 = () => {
      const el_0 = own.current;
      if (!el_0) {
        return;
      }
      const onMatch = () => {
        if (pick.current) {
          pick.current();
        }
      };
      el_0.addEventListener("beforematch", onMatch);
      el_0.addEventListener("invalid", revealInvalid, true);
      return () => {
        el_0.removeEventListener("beforematch", onMatch);
        el_0.removeEventListener("invalid", revealInvalid, true);
      };
    };
    t7 = [pick];
    $[16] = pick;
    $[17] = t6;
    $[18] = t7;
  } else {
    t6 = $[17];
    t7 = $[18];
  }
  React.useEffect(t6, t7);
  let t8;
  let t9;
  if ($[19] !== props.tabIndex || $[20] !== selected) {
    t8 = () => {
      const el_1 = own.current;
      if (!el_1 || !selected || props.tabIndex !== void 0) {
        return;
      }
      const look = () => {
        const t_1 = startsFocusable(el_1) ? -1 : 0;
        if (el_1.tabIndex !== t_1) {
          el_1.tabIndex = t_1;
        }
      };
      look();
      const watch = new MutationObserver(look);
      watch.observe(el_1, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["disabled", "href", "tabindex", "hidden"]
      });
      return () => watch.disconnect();
    };
    t9 = [selected, props.tabIndex];
    $[19] = props.tabIndex;
    $[20] = selected;
    $[21] = t8;
    $[22] = t9;
  } else {
    t8 = $[21];
    t9 = $[22];
  }
  useIsoLayoutEffect(t8, t9);
  let t10;
  if ($[23] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = (n) => {
      own.current = n;
    };
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  const mergedRef3 = useMergedRef(ref, t10);
  const t11 = selected ? 0 : -1;
  const t12 = ctx.base + "-panel-" + safe(props.value);
  const t13 = ctx.base + "-tab-" + safe(props.value);
  const t14 = !selected;
  const t15 = selected ? "active" : "inactive";
  let t16;
  if ($[24] !== props.className) {
    t16 = cn("srp-tabs__panel", props.className);
    $[24] = props.className;
    $[25] = t16;
  } else {
    t16 = $[25];
  }
  const t17 = selected || keep ? props.children : null;
  let t18;
  if ($[26] !== mergedRef3 || $[27] !== rest || $[28] !== t11 || $[29] !== t12 || $[30] !== t13 || $[31] !== t14 || $[32] !== t15 || $[33] !== t16 || $[34] !== t17) {
    t18 = /* @__PURE__ */ React.createElement("div", { tabIndex: t11, ...rest, ref: mergedRef3, role: "tabpanel", id: t12, "aria-labelledby": t13, hidden: t14, "data-state": t15, className: t16 }, t17);
    $[26] = mergedRef3;
    $[27] = rest;
    $[28] = t11;
    $[29] = t12;
    $[30] = t13;
    $[31] = t14;
    $[32] = t15;
    $[33] = t16;
    $[34] = t17;
    $[35] = t18;
  } else {
    t18 = $[35];
  }
  return t18;
}
var TabPanel = /* @__PURE__ */ named("TabPanel", TabPanelRender);
export {
  Tab,
  TabList,
  TabPanel,
  Tabs
};
//# sourceMappingURL=Tabs.js.map
