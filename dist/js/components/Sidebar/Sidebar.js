"use client";

// src/components/Sidebar/Sidebar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { useExit } from "../../internal/useExit.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { config } from "../../internal/config.js";
import { Menu, MenuItem, MenuSub } from "../Menu/Menu.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { flattenChildren } from "../../internal/children.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { useControllable } from "../../internal/controllable.js";
import { hideUntilFound } from "../../internal/untilFound.js";
var SidebarContext = /* @__PURE__ */ React.createContext({
  collapsed: false,
  depth: 0
});
function isSection(c) {
  return React.isValidElement(c) && c.type === SidebarSection;
}
function SidebarRender(t0) {
  const $ = _c(20);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const rest = omit(props, {
    header: 1,
    footer: 1,
    collapsed: 1,
    className: 1,
    children: 1,
    "aria-label": 1
  });
  const collapsed = !!props.collapsed;
  const [shown, setShownNow] = React.useState(collapsed);
  const [slide, setSlide] = React.useState("");
  const nav = React.useRef(null);
  const keep = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (v) => {
      const n = nav.current;
      const a = activeIn(n);
      let li = n && a && n.contains(a) ? a.closest(".srp-sidebar__li") : null;
      for (let up = li && li.parentElement ? li.parentElement.closest(".srp-sidebar__li") : null; up && n && n.contains(up); up = up.parentElement ? up.parentElement.closest(".srp-sidebar__li") : null) {
        li = up;
      }
      keep.current = li;
      setShownNow(v);
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const setShown = t1;
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      const li_0 = keep.current;
      const n_0 = nav.current;
      keep.current = null;
      if (li_0 && li_0.isConnected && n_0 && !n_0.contains(activeIn(n_0))) {
        const to = li_0.querySelector("a[href], button");
        if (to) {
          to.focus();
        }
      }
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== shown) {
    t3 = [shown];
    $[2] = shown;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  useIsoLayoutEffect(t2, t3);
  const want = React.useRef(collapsed);
  let t4;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = {};
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const timer = React.useRef(t4);
  let t5;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => {
      clearTimeout(timer.current.end);
      if (want.current) {
        setShown(true);
      }
      setSlide("");
    };
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const settle = t5;
  let t6;
  if ($[6] !== collapsed || $[7] !== slide) {
    t6 = () => {
      if (want.current === collapsed) {
        return;
      }
      want.current = collapsed;
      const n_1 = nav.current;
      const t = timer.current;
      cancelAnimationFrame(t.raf);
      clearTimeout(t.end);
      const ms = n_1 ? Math.max(...getComputedStyle(n_1).transitionDuration.split(",").map(_temp)) : 0;
      if (!ms) {
        setShown(collapsed);
        setSlide("");
        return;
      }
      const from = slide === "" ? collapsed ? "full" : "rail" : null;
      if (!collapsed) {
        setShown(false);
      }
      const go = () => {
        setSlide(collapsed ? "rail" : "full");
        t.end = setTimeout(settle, ms + 100);
      };
      if (from) {
        setSlide(from);
        t.raf = requestAnimationFrame(() => {
          t.raf = requestAnimationFrame(go);
        });
      } else {
        go();
      }
    };
    $[6] = collapsed;
    $[7] = slide;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  let t7;
  if ($[9] !== collapsed) {
    t7 = [collapsed];
    $[9] = collapsed;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  useIsoLayoutEffect(t6, t7);
  let t8;
  let t9;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = () => () => {
      cancelAnimationFrame(timer.current.raf);
      clearTimeout(timer.current.end);
    };
    t9 = [];
    $[11] = t8;
    $[12] = t9;
  } else {
    t8 = $[11];
    t9 = $[12];
  }
  React.useEffect(t8, t9);
  const onEnd = (e) => {
    if (e.target === e.currentTarget && e.propertyName === "clip-path" && slide === "rail" === want.current) {
      settle();
    }
  };
  const body = [];
  let run = [];
  const flush = () => {
    if (run.length) {
      body.push(/* @__PURE__ */ React.createElement("ul", { key: "l" + body.length, className: "srp-sidebar__list" }, run));
      run = [];
    }
  };
  flattenChildren(props.children).forEach((c) => {
    if (isSection(c)) {
      flush();
      body.push(c);
    } else {
      run.push(c);
    }
  });
  flush();
  let t10;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = (n_2) => {
      nav.current = n_2;
    };
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  const mergedRef = useMergedRef(ref, t10);
  let t11;
  if ($[14] !== shown) {
    t11 = {
      collapsed: shown,
      depth: 0
    };
    $[14] = shown;
    $[15] = t11;
  } else {
    t11 = $[15];
  }
  let t12;
  if ($[16] !== props.header) {
    t12 = props.header != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-sidebar__header" }, props.header) : null;
    $[16] = props.header;
    $[17] = t12;
  } else {
    t12 = $[17];
  }
  let t13;
  if ($[18] !== props.footer) {
    t13 = props.footer != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-sidebar__footer" }, props.footer) : null;
    $[18] = props.footer;
    $[19] = t13;
  } else {
    t13 = $[19];
  }
  return /* @__PURE__ */ React.createElement(SidebarContext.Provider, { value: t11 }, /* @__PURE__ */ React.createElement("nav", { ...rest, "aria-label": props["aria-label"] || sds.labels.mainNavigation, ref: mergedRef, "data-component": "sidebar", "data-collapsed": shown ? "" : void 0, "data-slide": slide || void 0, onTransitionEnd: (e_0) => {
    onEnd(e_0);
    if (props.onTransitionEnd) {
      props.onTransitionEnd(e_0);
    }
  }, className: cn("srp-sidebar", shown && "srp-sidebar--collapsed", props.className) }, t12, /* @__PURE__ */ React.createElement("div", { className: "srp-sidebar__body" }, body), t13));
}
function _temp(d) {
  return parseFloat(d) * (/ms/.test(d) ? 1 : 1e3);
}
var Sidebar = /* @__PURE__ */ named("Sidebar", SidebarRender);
function SidebarSectionRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    title: 1,
    className: 1,
    children: 1
  });
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-sbs", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  const titled = props.title != null && props.title !== false && props.title !== "";
  const t3 = cn("srp-sidebar__section", props.className);
  let t4;
  if ($[2] !== id || $[3] !== props.title || $[4] !== titled) {
    t4 = titled ? /* @__PURE__ */ React.createElement("div", { id, className: "srp-sidebar__section-title" }, props.title) : null;
    $[2] = id;
    $[3] = props.title;
    $[4] = titled;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const t5 = titled ? id : void 0;
  let t6;
  if ($[6] !== props.children || $[7] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("ul", { className: "srp-sidebar__list", "aria-labelledby": t5 }, props.children);
    $[6] = props.children;
    $[7] = t5;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  let t7;
  if ($[9] !== ref || $[10] !== rest || $[11] !== t3 || $[12] !== t4 || $[13] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t3 }, t4, t6);
    $[9] = ref;
    $[10] = rest;
    $[11] = t3;
    $[12] = t4;
    $[13] = t6;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  return t7;
}
var SidebarSection = /* @__PURE__ */ named("SidebarSection", SidebarSectionRender);
var ITEM_OWN = {
  label: 1,
  icon: 1,
  current: 1,
  badge: 1,
  children: 1,
  defaultOpen: 1,
  open: 1,
  onOpenChange: 1,
  as: 1,
  className: 1
};
var itemsOf = (children) => flattenChildren(children).filter(React.isValidElement);
var activeWithin = (k) => !!k.props.current || itemsOf(k.props.children).some(activeWithin);
function railItems(kids) {
  return kids.map((k, i) => {
    const key = k.key != null ? k.key : i, inner = itemsOf(k.props.children);
    const common = {
      icon: k.props.icon,
      "aria-current": activeWithin(k) ? "page" : void 0,
      className: cn("srp-sidebar__menu-item", k.props.className)
    };
    if (inner.length) return /* @__PURE__ */ React.createElement(MenuSub, { key, ...common, label: k.props.label }, railItems(inner));
    return /* @__PURE__ */ React.createElement(MenuItem, { key, ...omit(k.props, ITEM_OWN), onClick: void 0, as: k.props.as, ...common, onSelect: k.props.onClick }, k.props.label);
  });
}
function SidebarItemBaseRender(t0) {
  const $ = _c(48);
  const {
    ref,
    ...props
  } = t0;
  const ctx = React.useContext(SidebarContext);
  const rest = omit(props, ITEM_OWN);
  const kids = itemsOf(props.children);
  const group = kids.length > 0;
  const childActive = kids.some(activeWithin);
  const [held, setOwn, controlled] = useControllable(props.open, props.defaultOpen != null ? !!props.defaultOpen : childActive, "SidebarItem", "open");
  const [wasActive, setWasActive] = React.useState(childActive);
  if (wasActive !== childActive) {
    setWasActive(childActive);
    if (childActive && !held && props.defaultOpen == null && !controlled) {
      setOwn(true);
    }
  }
  const open = !!held;
  const toggle = () => {
    if (!controlled) {
      setOwn(!open);
    }
    if (props.onOpenChange) {
      props.onOpenChange(!open, {
        reason: "trigger"
      });
    }
  };
  const listId = domId("srp-sbi", React.useId());
  const nested = React.useRef(null);
  const exit = useExit(open, nested);
  const toggleRef = React.useRef(toggle);
  React.useInsertionEffect(function() {
    toggleRef.current = toggle;
  });
  const shut = !open && !exit.leaving;
  let t1;
  if ($[0] !== shut) {
    t1 = [shut];
    $[0] = shut;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  React.useEffect(function() {
    const el = nested.current;
    if (!el || !shut) {
      return;
    }
    hideUntilFound(el);
    const onMatch = function() {
      toggleRef.current();
    };
    el.addEventListener("beforematch", onMatch);
    return function() {
      el.removeEventListener("beforematch", onMatch);
    };
  }, t1);
  const rail = ctx.collapsed && ctx.depth === 0;
  const dot = rail && props.badge != null && props.badge !== false;
  const badgeId = listId + "-badge";
  const described = !!rest["aria-describedby"];
  if (dot) {
    rest["aria-describedby"] = cn(rest["aria-describedby"], badgeId);
  }
  const text = typeof props.label === "string" || typeof props.label === "number" ? String(props.label) : "";
  const tipOk = !!text && !rail && rest.title == null && !described;
  const inner = (chevron) => /* @__PURE__ */ React.createElement(React.Fragment, null, props.icon ? /* @__PURE__ */ React.createElement("span", { className: "srp-sidebar__icon" }, asIcon(props.icon), dot ? /* @__PURE__ */ React.createElement("span", { className: "srp-sidebar__dot", "aria-hidden": "true" }) : null) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-sidebar__label" }, tipOk ? /* @__PURE__ */ React.createElement(TruncatedText, null, text) : props.label), props.badge != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-sidebar__badge", id: dot ? badgeId : void 0 }, props.badge) : null, chevron && !rail ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-sidebar__chevron" }) : null);
  const btnProps = omit(rest, {
    href: 1,
    target: 1,
    rel: 1,
    download: 1,
    hrefLang: 1,
    ping: 1,
    referrerPolicy: 1,
    type: 1,
    onClick: 1
  });
  const t2 = ctx.depth > 0 && "srp-sidebar__item--nested";
  const t3 = (props.current || group && childActive) && "srp-sidebar__item--active";
  let t4;
  if ($[2] !== props || $[3] !== t2 || $[4] !== t3) {
    t4 = cn("srp-sidebar__item", t2, t3, props.className);
    $[2] = props;
    $[3] = t2;
    $[4] = t3;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const cls = t4;
  if (group && rail) {
    return /* @__PURE__ */ React.createElement("li", { className: "srp-sidebar__li" }, /* @__PURE__ */ React.createElement(Menu, { placement: "right-start", trigger: props.label != null && props.label !== false && props.label !== "" ? /* @__PURE__ */ React.createElement(Tooltip, { content: props.label, placement: "right", role: "label" }, /* @__PURE__ */ React.createElement("button", { type: "button", ...btnProps, ref, className: cls }, inner(false))) : /* @__PURE__ */ React.createElement("button", { type: "button", ...btnProps, ref, className: cls }, inner(false)) }, railItems(kids)));
  }
  if (group) {
    const t52 = open ? "open" : "closed";
    const t62 = ref;
    let t72;
    if ($[6] !== props || $[7] !== toggle) {
      t72 = (e) => {
        if (props.onClick) {
          props.onClick(e);
        }
        toggle();
      };
      $[6] = props;
      $[7] = toggle;
      $[8] = t72;
    } else {
      t72 = $[8];
    }
    let t82;
    if ($[9] !== inner) {
      t82 = inner(true);
      $[9] = inner;
      $[10] = t82;
    } else {
      t82 = $[10];
    }
    let t9;
    if ($[11] !== btnProps || $[12] !== cls || $[13] !== listId || $[14] !== open || $[15] !== t62 || $[16] !== t72 || $[17] !== t82) {
      t9 = /* @__PURE__ */ React.createElement("button", { type: "button", ...btnProps, ref: t62, className: cls, "aria-expanded": open, "aria-controls": listId, onClick: t72 }, t82);
      $[11] = btnProps;
      $[12] = cls;
      $[13] = listId;
      $[14] = open;
      $[15] = t62;
      $[16] = t72;
      $[17] = t82;
      $[18] = t9;
    } else {
      t9 = $[18];
    }
    const t10 = ctx.depth + 1;
    let t11;
    if ($[19] !== ctx.collapsed || $[20] !== t10) {
      t11 = {
        collapsed: ctx.collapsed,
        depth: t10
      };
      $[19] = ctx.collapsed;
      $[20] = t10;
      $[21] = t11;
    } else {
      t11 = $[21];
    }
    const t12 = !open && exit.leaving || void 0;
    const t13 = exit.instant || void 0;
    let t14;
    if ($[22] !== kids || $[23] !== listId || $[24] !== shut || $[25] !== t12 || $[26] !== t13) {
      t14 = /* @__PURE__ */ React.createElement("ul", { ref: nested, id: listId, className: "srp-sidebar__list srp-sidebar__list--nested", hidden: shut, inert: t12, "data-instant": t13 }, kids);
      $[22] = kids;
      $[23] = listId;
      $[24] = shut;
      $[25] = t12;
      $[26] = t13;
      $[27] = t14;
    } else {
      t14 = $[27];
    }
    let t15;
    if ($[28] !== t11 || $[29] !== t14) {
      t15 = /* @__PURE__ */ React.createElement(SidebarContext.Provider, { value: t11 }, t14);
      $[28] = t11;
      $[29] = t14;
      $[30] = t15;
    } else {
      t15 = $[30];
    }
    let t16;
    if ($[31] !== t15 || $[32] !== t52 || $[33] !== t9) {
      t16 = /* @__PURE__ */ React.createElement("li", { className: "srp-sidebar__li", "data-state": t52 }, t9, t15);
      $[31] = t15;
      $[32] = t52;
      $[33] = t9;
      $[34] = t16;
    } else {
      t16 = $[34];
    }
    return t16;
  }
  const Tag = props.as || config.link;
  const t5 = props.current ? "page" : void 0;
  let t6;
  if ($[35] !== inner) {
    t6 = inner(false);
    $[35] = inner;
    $[36] = t6;
  } else {
    t6 = $[36];
  }
  let t7;
  if ($[37] !== Tag || $[38] !== cls || $[39] !== ref || $[40] !== rest || $[41] !== t5 || $[42] !== t6) {
    t7 = /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, className: cls, "aria-current": t5 }, t6);
    $[37] = Tag;
    $[38] = cls;
    $[39] = ref;
    $[40] = rest;
    $[41] = t5;
    $[42] = t6;
    $[43] = t7;
  } else {
    t7 = $[43];
  }
  const link = t7;
  let t8;
  if ($[44] !== link || $[45] !== props.label || $[46] !== rail) {
    t8 = /* @__PURE__ */ React.createElement("li", { className: "srp-sidebar__li" }, rail && props.label != null && props.label !== false && props.label !== "" ? /* @__PURE__ */ React.createElement(Tooltip, { content: props.label, placement: "right", role: "label" }, link) : link);
    $[44] = link;
    $[45] = props.label;
    $[46] = rail;
    $[47] = t8;
  } else {
    t8 = $[47];
  }
  return t8;
}
var SidebarItemBase = /* @__PURE__ */ named("SidebarItem", SidebarItemBaseRender);
var SidebarItem = SidebarItemBase;
export {
  Sidebar,
  SidebarItem,
  SidebarSection
};
//# sourceMappingURL=Sidebar.js.map
