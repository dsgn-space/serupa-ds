"use client";

// src/components/Toolbar/Toolbar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { ControlSize } from "../../internal/controlSize.js";
import { useSettings } from "../../internal/provider.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, MenuCheckboxItem, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var ITEMS = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable="true"]';
var POPUP = '[popover], [role="menu"], [role="listbox"], [role="dialog"], [role="tooltip"], [role="toolbar"], [hidden], [inert]';
var itemsOf = (root, all) => Array.from(root.querySelectorAll(ITEMS)).filter(function(it) {
  if (!all && it.matches(":disabled")) return false;
  const p = it.parentElement && it.parentElement.closest(POPUP);
  return !p || p === root || !root.contains(p);
});
var shown = (e) => e.getClientRects().length > 0;
var OUT = "data-srp-overflow";
var isSep = (k) => k.getAttribute("role") === "separator" || k.tagName === "HR";
var movable = (k) => {
  if (isSep(k)) return false;
  const all = itemsOf(k, true).concat(k.matches(ITEMS) ? [k] : []);
  return all.length > 0 && all.every((c) => (c instanceof HTMLButtonElement || c.getAttribute("role") === "button") && !c.hasAttribute("aria-haspopup"));
};
var typing = (e) => e.isContentEditable || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement || e instanceof HTMLInputElement && !/^(button|checkbox|radio|submit|reset|image|color|file|range)$/.test(e.type);
function ToolbarRender(t0) {
  const $ = _c(31);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    orientation: 1,
    size: 1,
    className: 1,
    children: 1,
    overflow: 1,
    moreLabel: 1
  });
  const size = props.size === "sm" || props.size === "md" || props.size === "lg" ? props.size : void 0;
  const vertical = props.orientation === "vertical";
  const root = React.useRef(null);
  const active = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = function() {
      const r = root.current;
      if (!r) {
        return;
      }
      const items = itemsOf(r);
      const seen = items.filter(shown);
      const pick = seen.length ? seen : items;
      if (!active.current || pick.indexOf(active.current) < 0) {
        active.current = pick[0] || null;
      }
      for (const it of itemsOf(r, true)) {
        it.tabIndex = it === active.current ? 0 : -1;
      }
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const sync = t1;
  const more = React.useRef(null);
  const fold = !vertical && !!props.overflow;
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = function() {
      const r_0 = root.current;
      const m = more.current;
      if (!r_0 || !m) {
        return;
      }
      const kids = Array.from(r_0.children).filter((k) => k !== m && k instanceof HTMLElement && !k.matches(POPUP));
      for (const k_0 of kids) {
        k_0.removeAttribute(OUT);
      }
      m.removeAttribute(OUT);
      const cs = getComputedStyle(r_0);
      const gap = parseFloat(cs.columnGap) || 0;
      const room = r_0.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      const width = _temp;
      const used = (list) => list.reduce((a, k_2) => a + width(k_2), 0) + gap * Math.max(list.length - 1, 0);
      const shownKids = () => kids.filter(_temp2);
      if (used(kids) > room + 0.5) {
        const moreW = width(m) + gap;
        const order = kids.map(_temp3).filter(_temp4).sort(_temp5);
        for (const x_0 of order) {
          if (used(shownKids()) + moreW <= room + 0.5) {
            break;
          }
          x_0.k.setAttribute(OUT, "");
        }
        let prev = null;
        for (const k_5 of kids) {
          if (k_5.hasAttribute(OUT)) {
            continue;
          }
          if (isSep(k_5) && (!prev || isSep(prev))) {
            k_5.setAttribute(OUT, "");
            continue;
          }
          prev = k_5;
        }
        if (prev && isSep(prev)) {
          prev.setAttribute(OUT, "");
        }
      }
      if (!kids.some(_temp6)) {
        m.setAttribute(OUT, "");
      }
      sync();
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const layout = t2;
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = [];
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const [entries, setEntries] = React.useState(t3);
  let t4;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = function() {
      const r_1 = root.current;
      if (!r_1) {
        return [];
      }
      const out = [];
      for (const k_7 of Array.from(r_1.children)) {
        if (!(k_7 instanceof HTMLElement) || k_7 === more.current || !k_7.hasAttribute(OUT) || k_7.matches(POPUP)) {
          continue;
        }
        for (const el of itemsOf(k_7, true).concat(k_7.matches(ITEMS) ? [k_7] : [])) {
          const state = el.getAttribute("aria-pressed") || el.getAttribute("aria-checked");
          const label = (el.getAttribute("aria-label") || el.textContent || "").trim();
          if (label) {
            out.push({
              el,
              label,
              disabled: el.matches(":disabled") || el.getAttribute("aria-disabled") === "true",
              checked: state == null ? null : state === "true"
            });
          }
        }
      }
      return out;
    };
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const collect = t4;
  let t5;
  if ($[4] !== fold) {
    t5 = function() {
      sync();
      if (fold) {
        layout();
      }
    };
    $[4] = fold;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  useIsoLayoutEffect(t5);
  let t6;
  let t7;
  if ($[6] !== fold) {
    t6 = function() {
      const r_2 = root.current;
      if (!r_2) {
        return;
      }
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
      const watch = function() {
        if (ro) {
          ro.disconnect();
          for (const it_0 of itemsOf(r_2, true)) {
            ro.observe(it_0);
          }
        }
      };
      watch();
      const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(function(records) {
        watch();
        if (fold && records.some(_temp7)) {
          layout();
        } else {
          sync();
        }
      });
      const rr = fold && typeof ResizeObserver !== "undefined" ? new ResizeObserver(function() {
        layout();
      }) : null;
      if (rr) {
        rr.observe(r_2);
      }
      if (mo) {
        mo.observe(r_2, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["disabled", "hidden", "inert"]
        });
      }
      return function() {
        if (mo) {
          mo.disconnect();
        }
        if (ro) {
          ro.disconnect();
        }
        if (rr) {
          rr.disconnect();
        }
      };
    };
    t7 = [sync, fold, layout];
    $[6] = fold;
    $[7] = t6;
    $[8] = t7;
  } else {
    t6 = $[7];
    t7 = $[8];
  }
  React.useEffect(t6, t7);
  const onFocus = function(e) {
    if (rest.onFocus) {
      rest.onFocus(e);
    }
    const r_3 = root.current;
    if (r_3 && e.target instanceof HTMLElement && e.target !== active.current && itemsOf(r_3).indexOf(e.target) >= 0) {
      active.current = e.target;
      sync();
    }
  };
  const onKeyDown = function(e_0) {
    if (rest.onKeyDown) {
      rest.onKeyDown(e_0);
    }
    const r_4 = root.current;
    const t = e_0.target;
    if (e_0.defaultPrevented || !r_4 || !(t instanceof HTMLElement) || e_0.altKey || e_0.ctrlKey || e_0.metaKey) {
      return;
    }
    const items_0 = itemsOf(r_4).filter(shown);
    const i_0 = items_0.indexOf(t);
    if (i_0 < 0 || typing(t)) {
      return;
    }
    const rtl = getComputedStyle(r_4).direction === "rtl";
    let n;
    bb299: switch (e_0.key) {
      case "ArrowRight": {
        if (vertical) {
          return;
        }
        n = i_0 + (rtl ? -1 : 1);
        break bb299;
      }
      case "ArrowLeft": {
        if (vertical) {
          return;
        }
        n = i_0 + (rtl ? 1 : -1);
        break bb299;
      }
      case "ArrowDown": {
        if (!vertical) {
          return;
        }
        n = i_0 + 1;
        break bb299;
      }
      case "ArrowUp": {
        if (!vertical) {
          return;
        }
        n = i_0 - 1;
        break bb299;
      }
      case "Home": {
        n = 0;
        break bb299;
      }
      case "End": {
        n = items_0.length - 1;
        break bb299;
      }
      default: {
        return;
      }
    }
    e_0.preventDefault();
    const next = items_0[(n + items_0.length) % items_0.length];
    if (!next) {
      return;
    }
    active.current = next;
    sync();
    next.focus();
  };
  let t8;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = (n_0) => {
      root.current = n_0;
    };
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  const mergedRef = useMergedRef(ref, t8);
  const t9 = "toolbar";
  const t10 = vertical ? "vertical" : "horizontal";
  const t11 = cn("srp-toolbar", vertical && "srp-toolbar--vertical", fold && "srp-toolbar--overflow", props.className);
  const t12 = vertical ? "vertical" : "horizontal";
  let t13;
  if ($[10] !== props.children || $[11] !== size) {
    t13 = size ? /* @__PURE__ */ React.createElement(ControlSize.Provider, { value: size }, props.children) : props.children;
    $[10] = props.children;
    $[11] = size;
    $[12] = t13;
  } else {
    t13 = $[12];
  }
  let t14;
  if ($[13] !== L || $[14] !== collect || $[15] !== entries || $[16] !== fold || $[17] !== props.moreLabel || $[18] !== setEntries || $[19] !== size) {
    t14 = fold ? /* @__PURE__ */ React.createElement("span", { ref: more, className: "srp-toolbar__more", ...{
      [OUT]: ""
    } }, /* @__PURE__ */ React.createElement(Menu, { placement: "bottom-end", onOpenChange: (open) => {
      if (open) {
        setEntries(collect());
      }
    }, trigger: /* @__PURE__ */ React.createElement(IconButton, { icon: icons.MoreHoriz, label: props.moreLabel || L.toolbarMore, variant: "ghost", size }) }, entries.map(_temp8))) : null;
    $[13] = L;
    $[14] = collect;
    $[15] = entries;
    $[16] = fold;
    $[17] = props.moreLabel;
    $[18] = setEntries;
    $[19] = size;
    $[20] = t14;
  } else {
    t14 = $[20];
  }
  let t15;
  if ($[21] !== mergedRef || $[22] !== onFocus || $[23] !== onKeyDown || $[24] !== rest || $[25] !== t10 || $[26] !== t11 || $[27] !== t12 || $[28] !== t13 || $[29] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: t9, "aria-orientation": t10, className: t11, "data-component": "toolbar", "data-orientation": t12, onFocus, onKeyDown }, t13, t14);
    $[21] = mergedRef;
    $[22] = onFocus;
    $[23] = onKeyDown;
    $[24] = rest;
    $[25] = t10;
    $[26] = t11;
    $[27] = t12;
    $[28] = t13;
    $[29] = t14;
    $[30] = t15;
  } else {
    t15 = $[30];
  }
  return t15;
}
function _temp8(e_1, i_1) {
  return e_1.checked != null ? /* @__PURE__ */ React.createElement(MenuCheckboxItem, { key: i_1, checked: e_1.checked, disabled: e_1.disabled, onCheckedChange: () => e_1.el.click() }, e_1.label) : /* @__PURE__ */ React.createElement(MenuItem, { key: i_1, disabled: e_1.disabled, onSelect: () => e_1.el.click() }, e_1.label);
}
function _temp7(x_1) {
  return x_1.type === "childList";
}
function _temp6(k_6) {
  return k_6.hasAttribute(OUT) && !isSep(k_6);
}
function _temp5(a_0, b) {
  return a_0.p - b.p || b.i - a_0.i;
}
function _temp4(x) {
  return movable(x.k);
}
function _temp3(k_4, i) {
  return {
    k: k_4,
    i,
    p: Number(k_4.getAttribute("data-priority")) || 0
  };
}
function _temp2(k_3) {
  return !k_3.hasAttribute(OUT);
}
function _temp(k_1) {
  return k_1.getBoundingClientRect().width;
}
var Toolbar = /* @__PURE__ */ named("Toolbar", ToolbarRender);
export {
  Toolbar
};
//# sourceMappingURL=Toolbar.js.map
