"use client";

// src/components/VirtualList/VirtualList.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useVirtual } from "../../internal/virtual.js";
function VirtualListRender(t0) {
  const $ = _c(2);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    count: 1,
    renderItem: 1,
    itemKey: 1,
    estimatedItemHeight: 1,
    overscan: 1,
    variant: 1,
    divided: 1,
    as: 1,
    className: 1,
    style: 1,
    onFocus: 1,
    onBlur: 1
  });
  const count = Number.isFinite(props.count) ? Math.max(0, Math.floor(props.count)) : 0;
  const estimate = props.estimatedItemHeight && props.estimatedItemHeight > 0 ? props.estimatedItemHeight : 56;
  const r = useVirtual({
    count,
    estimate,
    overscan: props.overscan != null && props.overscan >= 0 ? props.overscan : 4
  });
  const [focused, setFocused] = React.useState(null);
  const variant = oneOf(["plain", "card"], props.variant, "plain");
  const {
    renderItem,
    itemKey
  } = props;
  const row = (i, out) => {
    const el = renderItem(i);
    const style = out ? {
      ...el.props.style,
      position: "absolute",
      insetInline: 0,
      top: r.offsetOf(i)
    } : el.props.style;
    return React.cloneElement(el, {
      key: itemKey ? itemKey(i) : i,
      "data-index": i,
      "aria-posinset": i + 1,
      "aria-setsize": count,
      style
    });
  };
  const rows = [];
  const keep = focused != null && focused < count && (focused < r.start || focused >= r.end) ? focused : null;
  if (keep != null && keep < r.start) {
    rows.push(row(keep, true));
  }
  for (let i_0 = r.start; i_0 < r.end; i_0++) {
    rows.push(row(i_0, false));
  }
  if (keep != null && keep >= r.end) {
    rows.push(row(keep, true));
  }
  const indexOf = _temp;
  const attach = r.ref;
  let t1;
  if ($[0] !== attach) {
    t1 = (n) => {
      attach(n);
    };
    $[0] = attach;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const setNode = useMergedRef(ref, t1);
  return React.createElement(oneOf(["ul", "ol"], props.as, "ul"), Object.assign(rest, {
    ref: setNode,
    "data-component": "virtual-list",
    role: rest.role ?? "list",
    tabIndex: rest.tabIndex ?? (count ? 0 : void 0),
    className: cn("srp-list", "srp-virtual-list", variant === "card" && "srp-list--card", props.divided !== false && "srp-list--divided", props.className),
    style: {
      ...props.style,
      "--srp-vl-before": r.before + "px",
      "--srp-vl-after": r.after + "px"
    },
    onFocus: (e) => {
      const i_1 = indexOf(e.target, e.currentTarget);
      setFocused(i_1);
      if (i_1 != null) {
        r.scrollToIndex(i_1);
      }
      if (props.onFocus) {
        props.onFocus(e);
      }
    },
    onBlur: (e_0) => {
      if (!e_0.currentTarget.contains(e_0.relatedTarget)) {
        setFocused(null);
      }
      if (props.onBlur) {
        props.onBlur(e_0);
      }
    }
  }), rows);
}
function _temp(t, list) {
  const li = t instanceof HTMLElement ? t.closest("[data-index]") : null;
  return li && li.parentElement === list ? Number(li.dataset.index) : null;
}
var VirtualList = /* @__PURE__ */ named("VirtualList", VirtualListRender);
export {
  VirtualList
};
//# sourceMappingURL=VirtualList.js.map
