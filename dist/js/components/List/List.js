"use client";

// src/components/List/List.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, oneOf, omit, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
var PickContext = /* @__PURE__ */ React.createContext(null);
var ROWS = ":scope > [data-list-value]";
var INSIDE = "a[href], button, input, select, textarea, [tabindex]";
var val = (r) => r.dataset.listValue;
var usable = (r) => r.getAttribute("aria-disabled") !== "true";
function ListRender(t0) {
  const $ = _c(19);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    variant: 1,
    divided: 1,
    as: 1,
    loading: 1,
    className: 1,
    selectionMode: 1,
    selected: 1,
    defaultSelected: 1,
    onSelectedChange: 1
  });
  const variant = oneOf(["plain", "card"], props.variant, "plain");
  const mode = props.selectionMode === "single" || props.selectionMode === "multiple" ? props.selectionMode : null;
  const [picked, setOwn] = useControllable(props.selected, props.defaultSelected || [], "List", "selected");
  const ul = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n) => {
      ul.current = n;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const merged = useMergedRef(ref, t1);
  const focused = React.useRef(null);
  const anchor = React.useRef(null);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => ul.current ? Array.from(ul.current.querySelectorAll(ROWS)) : [];
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const rows = t2;
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      const all = rows();
      const cur = all.find((r) => val(r) === focused.current) || all[0];
      for (const r_0 of all) {
        r_0.tabIndex = r_0 === cur ? 0 : -1;
        r_0.querySelectorAll(INSIDE).forEach(_temp);
      }
    };
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const rove = t3;
  useIsoLayoutEffect(() => {
    if (mode) {
      rove();
    }
  });
  const emit = (next) => {
    if (props.selected === void 0) {
      setOwn(next);
    }
    if (props.onSelectedChange) {
      props.onSelectedChange(next);
    }
  };
  const pick = (row, run) => {
    if (!usable(row)) {
      return;
    }
    const v = val(row);
    if (mode === "single") {
      emit(picked.includes(v) ? [] : [v]);
      return;
    }
    const all_0 = rows();
    const from = run && anchor.current != null ? all_0.findIndex((r_1) => val(r_1) === anchor.current) : -1;
    if (from >= 0) {
      const to = all_0.indexOf(row);
      const span = all_0.slice(Math.min(from, to), Math.max(from, to) + 1).filter(usable).map(val);
      emit(picked.concat(span.filter((x) => !picked.includes(x))));
      return;
    }
    anchor.current = v;
    emit(picked.includes(v) ? picked.filter((x_0) => x_0 !== v) : [...picked, v]);
  };
  const onKeyDown = (e) => {
    const t = e.target;
    const row_0 = t.closest("[data-list-value]");
    if (!row_0 || row_0.parentElement !== ul.current || modified(e) && e.key.indexOf("Arrow") === 0) {
      return;
    }
    const all_1 = rows();
    const i = all_1.indexOf(row_0);
    const onRow = t === row_0;
    const inside = Array.from(row_0.querySelectorAll(INSIDE)).filter(_temp2);
    const rtl = isRtl(row_0);
    const go = (j) => {
      const r_2 = all_1[Math.max(0, Math.min(j, all_1.length - 1))];
      if (!r_2) {
        return;
      }
      if (e.shiftKey && mode === "multiple") {
        if (anchor.current == null) {
          anchor.current = val(row_0);
        }
        pick(r_2, true);
      }
      r_2.focus();
    };
    const across = (d) => {
      const j_0 = onRow ? d > 0 ? 0 : -1 : inside.indexOf(t) + d;
      (j_0 >= 0 && inside[j_0] ? inside[j_0] : row_0).focus();
    };
    if (e.key === "ArrowDown") {
      go(i + 1);
    } else {
      if (e.key === "ArrowUp") {
        go(i - 1);
      } else {
        if (e.key === "Home" && onRow) {
          go(0);
        } else {
          if (e.key === "End" && onRow) {
            go(all_1.length - 1);
          } else {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              across(e.key === "ArrowRight" !== rtl ? 1 : -1);
            } else {
              if (onRow && e.key === " ") {
                pick(row_0, e.shiftKey);
              } else {
                if (onRow && e.key === "Enter") {
                  const main = row_0.querySelector("a.srp-list__main, button.srp-list__main");
                  if (main) {
                    main.click();
                  } else {
                    pick(row_0, false);
                  }
                } else {
                  if (onRow && mode === "multiple" && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                    emit(all_1.filter(usable).map(val));
                  } else {
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
    e.preventDefault();
  };
  const onClick = (e_0) => {
    const t_0 = e_0.target;
    const row_1 = t_0.closest("[data-list-value]");
    if (!row_1 || row_1.parentElement !== ul.current) {
      return;
    }
    const control = t_0.closest('a, button, input, select, textarea, label, [role="button"], [role="menuitem"]');
    if (control && !(control.matches("input") && control.closest(".srp-list__select"))) {
      return;
    }
    pick(row_1, e_0.shiftKey);
  };
  const onFocus = (e_1) => {
    const row_2 = e_1.target.closest("[data-list-value]");
    if (row_2 && row_2.parentElement === ul.current) {
      focused.current = val(row_2);
      rove();
    }
  };
  const theirs = {
    key: rest.onKeyDown,
    click: rest.onClick,
    focus: rest.onFocus
  };
  const ctx = mode ? {
    mode,
    has: (v_0) => picked.includes(v_0)
  } : null;
  const Tag = props.as === "ol" ? "ol" : "ul";
  const t4 = "list";
  const t5 = rest.role ?? (mode ? "grid" : "list");
  const t6 = rest["aria-busy"] ?? (props.loading || void 0);
  const t7 = mode === "multiple" || void 0;
  const t8 = mode ? (e_2) => {
    if (theirs.key) {
      theirs.key(e_2);
    }
    if (!e_2.defaultPrevented) {
      onKeyDown(e_2);
    }
  } : theirs.key;
  const t9 = mode ? (e_3) => {
    if (theirs.click) {
      theirs.click(e_3);
    }
    onClick(e_3);
  } : theirs.click;
  const t10 = mode ? (e_4) => {
    if (theirs.focus) {
      theirs.focus(e_4);
    }
    onFocus(e_4);
  } : theirs.focus;
  const t11 = cn("srp-list", variant === "card" && "srp-list--card", props.divided === "inset" ? "srp-list--inset" : props.divided !== false && "srp-list--divided", mode && "srp-list--selectable", props.className);
  let t12;
  if ($[3] !== rest || $[4] !== t10 || $[5] !== t11 || $[6] !== t5 || $[7] !== t6 || $[8] !== t7 || $[9] !== t8 || $[10] !== t9) {
    t12 = {
      ...rest,
      "data-component": t4,
      role: t5,
      "aria-busy": t6,
      "aria-multiselectable": t7,
      onKeyDown: t8,
      onClick: t9,
      onFocus: t10,
      className: t11
    };
    $[3] = rest;
    $[4] = t10;
    $[5] = t11;
    $[6] = t5;
    $[7] = t6;
    $[8] = t7;
    $[9] = t8;
    $[10] = t9;
    $[11] = t12;
  } else {
    t12 = $[11];
  }
  const attrs = t12;
  let t13;
  if ($[12] !== Tag || $[13] !== attrs || $[14] !== merged) {
    t13 = /* @__PURE__ */ React.createElement(Tag, { ...attrs, ref: merged });
    $[12] = Tag;
    $[13] = attrs;
    $[14] = merged;
    $[15] = t13;
  } else {
    t13 = $[15];
  }
  let t14;
  if ($[16] !== ctx || $[17] !== t13) {
    t14 = /* @__PURE__ */ React.createElement(PickContext.Provider, { value: ctx }, t13);
    $[16] = ctx;
    $[17] = t13;
    $[18] = t14;
  } else {
    t14 = $[18];
  }
  return t14;
}
function _temp2(c_0) {
  return !c_0.disabled;
}
function _temp(c) {
  c.tabIndex = -1;
}
var List = /* @__PURE__ */ named("List", ListRender);
function ListItemBaseRender(t0) {
  const $ = _c(20);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    title: 1,
    description: 1,
    leading: 1,
    trailing: 1,
    href: 1,
    onClick: 1,
    as: 1,
    linkProps: 1,
    selected: 1,
    disabled: 1,
    className: 1,
    value: 1
  });
  const pick = React.useContext(PickContext);
  const titleId = React.useId();
  if (process.env.NODE_ENV !== "production" && pick && props.value == null) {
    warnOnce("list-value", "ListItem: in a List with selectionMode, give each ListItem a value, which onSelectedChange reports.");
  }
  const value = props.value != null ? props.value : titleId;
  const on = pick ? pick.has(value) : false;
  const lead = asIcon(props.leading);
  const body = /* @__PURE__ */ React.createElement(React.Fragment, null, lead != null && lead !== false ? /* @__PURE__ */ React.createElement("span", { className: cn("srp-list__leading", typeof props.leading === "string" && "srp-list__leading--icon") }, lead) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-list__text" }, /* @__PURE__ */ React.createElement("span", { className: "srp-list__title", id: pick ? titleId : void 0 }, props.title), props.description != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-list__description" }, props.description) : null));
  const lp = Object.assign({}, props.linkProps);
  let main;
  if (props.href != null || props.as) {
    const attrs = Object.assign(lp, {
      className: cn("srp-list__main", lp.className),
      "aria-current": lp["aria-current"] !== void 0 ? lp["aria-current"] : props.selected ? "true" : void 0
    });
    const keep = _temp3;
    if (props.disabled) {
      for (const k_0 of Object.keys(attrs)) {
        if (!keep(k_0)) {
          delete attrs[k_0];
        }
      }
      Object.assign(attrs, {
        "aria-disabled": true,
        tabIndex: -1,
        onClick: _temp4
      });
    } else {
      attrs.href = props.href;
      if (props.onClick) {
        attrs.onClick = props.onClick;
      }
    }
    main = React.createElement(props.disabled ? "a" : props.as || config.link, attrs, body);
  } else {
    if (props.onClick) {
      main = /* @__PURE__ */ React.createElement("button", { type: "button", ...lp, className: cn("srp-list__main", lp.className), onClick: props.onClick, disabled: props.disabled, "aria-pressed": props.selected === void 0 ? void 0 : !!props.selected }, body);
    } else {
      main = /* @__PURE__ */ React.createElement("div", { className: "srp-list__main srp-list__main--static", role: pick ? "gridcell" : void 0 }, body);
    }
  }
  const interactive = props.href != null || !!props.as || !!props.onClick;
  const row = pick ? {
    role: "row",
    "data-list-value": value,
    "aria-selected": on,
    "aria-disabled": props.disabled || void 0,
    "aria-labelledby": titleId
  } : null;
  const t1 = cn("srp-list__item", interactive && "srp-list__item--interactive", pick && !interactive && "srp-list__item--pickable", (props.selected || on) && "srp-list__item--selected", props.disabled && "srp-list__item--disabled", props.className);
  let t2;
  if ($[0] !== on || $[1] !== pick || $[2] !== props.disabled || $[3] !== titleId) {
    t2 = pick && pick.mode === "multiple" ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "srp-list__select" }, /* @__PURE__ */ React.createElement(Checkbox, { tabIndex: -1, "aria-labelledby": titleId, checked: on, disabled: props.disabled, onChange: noop })) : null;
    $[0] = on;
    $[1] = pick;
    $[2] = props.disabled;
    $[3] = titleId;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] !== interactive || $[6] !== main || $[7] !== pick) {
    t3 = pick && interactive ? /* @__PURE__ */ React.createElement("span", { role: "gridcell", className: "srp-list__cell" }, main) : main;
    $[5] = interactive;
    $[6] = main;
    $[7] = pick;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  let t4;
  if ($[9] !== pick || $[10] !== props.trailing) {
    t4 = props.trailing != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-list__trailing", role: pick ? "gridcell" : void 0 }, props.trailing) : null;
    $[9] = pick;
    $[10] = props.trailing;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  let t5;
  if ($[12] !== ref || $[13] !== rest || $[14] !== row || $[15] !== t1 || $[16] !== t2 || $[17] !== t3 || $[18] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("li", { ...rest, ...row, ref, className: t1 }, t2, t3, t4);
    $[12] = ref;
    $[13] = rest;
    $[14] = row;
    $[15] = t1;
    $[16] = t2;
    $[17] = t3;
    $[18] = t4;
    $[19] = t5;
  } else {
    t5 = $[19];
  }
  return t5;
}
function _temp4(e) {
  return e.preventDefault();
}
function _temp3(k) {
  return /^(aria-|data-)/.test(k) || k === "id" || k === "title" || k === "style" || k === "className" || k === "lang" || k === "dir";
}
var ListItemBase = /* @__PURE__ */ named("ListItem", ListItemBaseRender);
var ListItem = ListItemBase;
var noop = () => {
};
function ListSelectAllRender(t0) {
  const $ = _c(10);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    values: 1,
    selected: 1,
    onSelectedChange: 1,
    children: 1
  });
  const some = props.values.filter((v) => props.selected.includes(v)).length;
  const all = props.values.length > 0 && some === props.values.length;
  let t1;
  if ($[0] !== props) {
    t1 = (checked) => props.onSelectedChange(checked ? props.selected.concat(props.values.filter((v_0) => !props.selected.includes(v_0))) : props.selected.filter((v_1) => !props.values.includes(v_1)));
    $[0] = props;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const change = t1;
  const t2 = some > 0 && !all;
  const t3 = props.disabled || props.values.length === 0;
  const t4 = props.children != null ? props.children : L.listSelectAll;
  let t5;
  if ($[2] !== all || $[3] !== change || $[4] !== ref || $[5] !== rest || $[6] !== t2 || $[7] !== t3 || $[8] !== t4) {
    t5 = /* @__PURE__ */ React.createElement(Checkbox, { ...rest, ref, checked: all, indeterminate: t2, disabled: t3, onCheckedChange: change }, t4);
    $[2] = all;
    $[3] = change;
    $[4] = ref;
    $[5] = rest;
    $[6] = t2;
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  return t5;
}
var ListSelectAll = /* @__PURE__ */ named("ListSelectAll", ListSelectAllRender);
var LEADS = ["icon", "xs", "sm", "md", "lg", "xl"];
function ListLoadingItems(props) {
  const $ = _c(7);
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  let t0;
  if ($[0] !== props.leading) {
    t0 = props.leading == null ? null : oneOf(LEADS, props.leading, "md");
    $[0] = props.leading;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const lead = t0;
  const sds = useSettings();
  const label = props.label == null ? sds.labels.loading : props.label;
  const waiting = !useSkeletonShown(label);
  let t1;
  if ($[2] !== lead || $[3] !== props.showDescription || $[4] !== rows || $[5] !== waiting) {
    const out = [];
    for (let r = 0; r < rows; r++) {
      out.push(/* @__PURE__ */ React.createElement("li", { key: r, className: "srp-list__item srp-list__loading" }, /* @__PURE__ */ React.createElement("div", { className: "srp-list__main srp-list__main--static" }, lead ? /* @__PURE__ */ React.createElement("span", { className: "srp-list__leading srp-list__leading--" + lead }, /* @__PURE__ */ React.createElement(SkeletonArt, { shape: "circle", waiting })) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-list__text" }, /* @__PURE__ */ React.createElement(SkeletonArt, { lines: props.showDescription ? 2 : 1, waiting })))));
    }
    t1 = /* @__PURE__ */ React.createElement(React.Fragment, null, out);
    $[2] = lead;
    $[3] = props.showDescription;
    $[4] = rows;
    $[5] = waiting;
    $[6] = t1;
  } else {
    t1 = $[6];
  }
  return t1;
}
export {
  List,
  ListItem,
  ListLoadingItems,
  ListSelectAll
};
//# sourceMappingURL=List.js.map
