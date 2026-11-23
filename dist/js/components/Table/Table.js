"use client";

// src/components/Table/Table.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { useScrolls } from "../../internal/useScrolls.js";
import { useStickyHead } from "../../internal/stickyHead.js";
import { flushSync } from "react-dom";
import { announce } from "../../internal/announce.js";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { warnOnce } from "../../internal/warn.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { useVirtual } from "../../internal/virtual.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/skeletonArt.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
var ALIGN = ["start", "center", "end"];
function TableRender(t0) {
  const $ = _c(17);
  const {
    ref,
    ...props
  } = t0;
  const restyle = useServerStyles();
  const sds = useSettings(words);
  const rest = omit(props, {
    size: 1,
    layout: 1,
    striped: 1,
    stickyHeader: 1,
    caption: 1,
    hideCaption: 1,
    containerProps: 1,
    pinStart: 1,
    pinEnd: 1,
    loading: 1,
    className: 1,
    children: 1
  });
  const size = oneOf(["sm", "md"], props.size, "md");
  const loading = !!props.loading;
  const frame = React.useRef(null);
  const scrolls = useScrolls(frame);
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-tc", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const cid = t2;
  useStickyHead(frame, !!props.stickyHeader, ".srp-table__head", "--srp-table-head");
  const {
    "aria-label": frameLabel,
    "aria-labelledby": frameLabelledBy,
    ...cp
  } = props.containerProps || {};
  const hasCaption = props.caption != null && props.caption !== false && props.caption !== "";
  const region = !scrolls ? {} : hasCaption ? {
    tabIndex: 0,
    role: "region",
    "aria-labelledby": cid
  } : {
    tabIndex: 0,
    role: "region",
    "aria-labelledby": frameLabelledBy,
    "aria-label": frameLabelledBy ? void 0 : frameLabel || sds.labels.table
  };
  let t3;
  if ($[2] !== restyle) {
    t3 = (n) => {
      frame.current = n;
      restyle(n);
    };
    $[2] = restyle;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const t4 = "table";
  const t5 = cn("srp-table", size === "sm" && "srp-table--sm", oneOf(["auto", "fixed"], props.layout, "auto") === "fixed" && "srp-table--fixed", props.striped && "srp-table--striped", props.stickyHeader && "srp-table--sticky", props.pinStart && "srp-table--pin-start", props.pinEnd && "srp-table--pin-end", cp.className);
  const t6 = loading || void 0;
  const t7 = cn("srp-table__table", props.className);
  const t8 = hasCaption ? /* @__PURE__ */ React.createElement("caption", { id: cid, className: cn("srp-table__caption", props.hideCaption && "srp-visually-hidden") }, props.caption) : null;
  let t9;
  if ($[4] !== props.children || $[5] !== ref || $[6] !== rest || $[7] !== t6 || $[8] !== t7 || $[9] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("table", { "aria-busy": t6, ...rest, ref, className: t7 }, t8, props.children);
    $[4] = props.children;
    $[5] = ref;
    $[6] = rest;
    $[7] = t6;
    $[8] = t7;
    $[9] = t8;
    $[10] = t9;
  } else {
    t9 = $[10];
  }
  let t10;
  if ($[11] !== cp || $[12] !== region || $[13] !== t3 || $[14] !== t5 || $[15] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("div", { ...cp, ...region, ref: t3, "data-component": t4, className: t5 }, t9);
    $[11] = cp;
    $[12] = region;
    $[13] = t3;
    $[14] = t5;
    $[15] = t9;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  return t10;
}
var Table = /* @__PURE__ */ named("Table", TableRender);
function TableHeadRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    t1 = props;
    t2 = ref;
    t3 = cn("srp-table__head", props.className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("thead", { ...t1, ref: t2, className: t3 });
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
var TableHead = /* @__PURE__ */ named("TableHead", TableHeadRender);
function TableBodyRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    t1 = props;
    t2 = ref;
    t3 = cn("srp-table__body", props.className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("tbody", { ...t1, ref: t2, className: t3 });
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
var TableBody = /* @__PURE__ */ named("TableBody", TableBodyRender);
var PRINT_ROWS = 5e3;
function TableVirtualBodyRender(t0) {
  const $ = _c(22);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    count: 1,
    renderRow: 1,
    itemKey: 1,
    estimatedRowHeight: 1,
    overscan: 1,
    className: 1,
    onFocus: 1,
    onBlur: 1
  });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const body = React.useRef(null);
  const [small, setSmall] = React.useState(false);
  const estimate = props.estimatedRowHeight && props.estimatedRowHeight > 0 ? props.estimatedRowHeight : small ? 36 : 41;
  const r = useVirtual({
    count,
    estimate,
    overscan: props.overscan != null && props.overscan >= 0 ? props.overscan : 6,
    rows: () => body.current,
    origin: () => {
      const b = body.current;
      const f = b && b.closest(".srp-table");
      return b && f ? b.getBoundingClientRect().top - f.getBoundingClientRect().top - f.clientTop + f.scrollTop : 0;
    }
  });
  const attach = r.ref;
  const [head, setHead] = React.useState(0);
  let t1;
  if ($[0] !== attach || $[1] !== count) {
    t1 = [attach, count];
    $[0] = attach;
    $[1] = count;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  useIsoLayoutEffect(() => {
    const b_0 = body.current;
    const f_0 = b_0 && b_0.closest(".srp-table");
    const t = b_0 && b_0.closest("table");
    attach(f_0);
    setSmall(!!f_0 && f_0.classList.contains("srp-table--sm"));
    const rowsOf = _temp;
    const h = t ? rowsOf(t.querySelector(":scope > thead")) : 0;
    setHead(h);
    if (!t) {
      return;
    }
    t.setAttribute("aria-rowcount", String(h + count + rowsOf(t.querySelector(":scope > tfoot"))));
    return () => t.removeAttribute("aria-rowcount");
  }, t1);
  const [focused, setFocused] = React.useState(null);
  const [printing, setPrinting] = React.useState(false);
  let t2;
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      const on = () => flushSync(() => setPrinting(true));
      const off = () => setPrinting(false);
      window.addEventListener("beforeprint", on);
      window.addEventListener("afterprint", off);
      return () => {
        window.removeEventListener("beforeprint", on);
        window.removeEventListener("afterprint", off);
      };
    };
    t3 = [];
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  React.useEffect(t2, t3);
  const {
    renderRow,
    itemKey
  } = props;
  const row = (i, out) => {
    const el = renderRow(i);
    const style = out ? {
      ...el.props.style,
      position: "absolute",
      insetInline: 0,
      top: r.offsetOf(i)
    } : el.props.style;
    return React.cloneElement(el, {
      key: itemKey ? itemKey(i) : i,
      "data-index": printing ? void 0 : i,
      "aria-rowindex": head + i + 1,
      style
    });
  };
  const rows = [];
  const keep = !printing && focused != null && focused < count && (focused < r.start || focused >= r.end) ? focused : null;
  const start = printing ? 0 : r.start;
  const end = printing ? Math.min(count, PRINT_ROWS) : r.end;
  if (keep != null && keep < start) {
    rows.push(row(keep, true));
  }
  for (let i_0 = start; i_0 < end; i_0++) {
    rows.push(row(i_0, false));
  }
  if (keep != null && keep >= end) {
    rows.push(row(keep, true));
  }
  let lead;
  if ($[5] !== keep || $[6] !== printing || $[7] !== r || $[8] !== start) {
    lead = [];
    if (!printing && r.before > 0) {
      lead.push(r.before);
    }
    if ((lead.length + (keep != null && keep < start ? 1 : 0)) % 2 !== start % 2) {
      lead.push(0);
    }
    $[5] = keep;
    $[6] = printing;
    $[7] = r;
    $[8] = start;
    $[9] = lead;
  } else {
    lead = $[9];
  }
  const indexOf = _temp2;
  const setNode = useMergedRef(ref, (n) => {
    body.current = n;
  });
  const t4 = cn("srp-table__body", "srp-table__body--virtual", props.className);
  let t5;
  if ($[10] !== indexOf || $[11] !== props || $[12] !== setFocused) {
    t5 = (e) => {
      setFocused(indexOf(e.target, e.currentTarget));
      if (props.onFocus) {
        props.onFocus(e);
      }
    };
    $[10] = indexOf;
    $[11] = props;
    $[12] = setFocused;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  let t6;
  if ($[14] !== props || $[15] !== setFocused) {
    t6 = (e_0) => {
      if (!e_0.currentTarget.contains(e_0.relatedTarget)) {
        setFocused(null);
      }
      if (props.onBlur) {
        props.onBlur(e_0);
      }
    };
    $[14] = props;
    $[15] = setFocused;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  let t7;
  if ($[17] !== lead) {
    t7 = lead.map(_temp3);
    $[17] = lead;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  let t8;
  if ($[19] !== printing || $[20] !== r) {
    t8 = !printing && r.after > 0 ? /* @__PURE__ */ React.createElement("tr", { "aria-hidden": "true", className: "srp-table__spacer", style: {
      height: r.after
    } }) : null;
    $[19] = printing;
    $[20] = r;
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  return /* @__PURE__ */ React.createElement("tbody", { ...rest, ref: setNode, className: t4, onFocus: t5, onBlur: t6 }, t7, rows, t8);
}
function _temp3(h_0, n_0) {
  return /* @__PURE__ */ React.createElement("tr", { key: "lead" + n_0, "aria-hidden": "true", className: "srp-table__spacer", style: {
    height: h_0
  } });
}
function _temp2(t_0, tb) {
  const tr = t_0 instanceof HTMLElement ? t_0.closest("[data-index]") : null;
  return tr && tr.parentElement === tb ? Number(tr.dataset.index) : null;
}
function _temp(s) {
  return s ? s.querySelectorAll(":scope > tr").length : 0;
}
var TableVirtualBody = /* @__PURE__ */ named("TableVirtualBody", TableVirtualBodyRender);
function TableFootRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    t1 = props;
    t2 = ref;
    t3 = cn("srp-table__foot", props.className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("tfoot", { ...t1, ref: t2, className: t3 });
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
var TableFoot = /* @__PURE__ */ named("TableFoot", TableFootRender);
var RowLinkContext = /* @__PURE__ */ React.createContext(null);
function TableRowRender(t0) {
  const $ = _c(25);
  let props;
  let ref;
  let t1;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    t1 = omit(props, {
      selected: 1,
      className: 1,
      href: 1,
      target: 1,
      rel: 1,
      children: 1
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
  const isLink = props.href != null;
  if (process.env.NODE_ENV !== "production" && props.onClick && !isLink) {
    warnOnce("table-row-click", "TableRow: onClick on a row reaches mouse users only: the keyboard and screen readers can't press a row. To open something, give the row an href (the whole row becomes a link); for an action, put a button in a cell.");
  }
  let t2;
  if ($[4] !== isLink || $[5] !== props.href || $[6] !== props.rel || $[7] !== props.target) {
    t2 = isLink ? {
      href: props.href,
      target: props.target,
      rel: props.target === "_blank" && props.rel == null ? "noopener noreferrer" : props.rel
    } : null;
    $[4] = isLink;
    $[5] = props.href;
    $[6] = props.rel;
    $[7] = props.target;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const link = t2;
  let children = props.children;
  if (isLink) {
    if ($[9] !== children) {
      const kids = React.Children.toArray(children);
      const marked = kids.some(_temp4);
      if (!marked) {
        const first = kids.findIndex(_temp5);
        if (first >= 0) {
          let t32;
          if ($[11] !== first) {
            t32 = function(k_1, i) {
              return i === first ? React.cloneElement(k_1, {
                link: true
              }) : k_1;
            };
            $[11] = first;
            $[12] = t32;
          } else {
            t32 = $[12];
          }
          children = kids.map(t32);
        }
      }
      $[9] = children;
      $[10] = children;
    } else {
      children = $[10];
    }
  }
  const t3 = props.selected && "srp-table__row--selected";
  const t4 = isLink && "srp-table__row--link";
  let t5;
  if ($[13] !== props.className || $[14] !== t3 || $[15] !== t4) {
    t5 = cn("srp-table__row", t3, t4, props.className);
    $[13] = props.className;
    $[14] = t3;
    $[15] = t4;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  let t6;
  if ($[17] !== children || $[18] !== link) {
    t6 = link ? /* @__PURE__ */ React.createElement(RowLinkContext.Provider, { value: link }, children) : children;
    $[17] = children;
    $[18] = link;
    $[19] = t6;
  } else {
    t6 = $[19];
  }
  let t7;
  if ($[20] !== ref || $[21] !== rest || $[22] !== t5 || $[23] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("tr", { ...rest, ref, className: t5 }, t6);
    $[20] = ref;
    $[21] = rest;
    $[22] = t5;
    $[23] = t6;
    $[24] = t7;
  } else {
    t7 = $[24];
  }
  return t7;
}
function _temp5(k_0) {
  return React.isValidElement(k_0) && k_0.type === TableCell;
}
function _temp4(k) {
  return React.isValidElement(k) && k.type === TableCell && k.props.link;
}
var TableRow = /* @__PURE__ */ named("TableRow", TableRowRender);
function TableSelectCellRender(t0) {
  const $ = _c(2);
  let t1;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      label,
      inHeader,
      cellProps,
      ...rest
    } = props;
    const cp = cellProps || {};
    const box = /* @__PURE__ */ React.createElement(Checkbox, { ...rest, ref, "aria-label": label });
    const cls = cn("srp-table__cell srp-table__select", cp.className);
    t1 = inHeader ? /* @__PURE__ */ React.createElement("th", { scope: "col", ...cp, className: cn(cls, "srp-table__header") }, box) : /* @__PURE__ */ React.createElement("td", { ...cp, className: cls }, box);
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
var TableSelectCell = /* @__PURE__ */ named("TableSelectCell", TableSelectCellRender);
var NEXT_ICON = {
  ascending: icons.ArrowUpward,
  descending: icons.ArrowDownward,
  none: icons.UnfoldMore
};
var STEP = 16;
function TableHeaderCellRender(t0) {
  const $ = _c(74);
  let props;
  let ref;
  let t1;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    t1 = omit(props, {
      align: 1,
      sort: 1,
      onSort: 1,
      width: 1,
      resizable: 1,
      minWidth: 1,
      maxWidth: 1,
      onWidthChange: 1,
      style: 1,
      className: 1,
      children: 1
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
  const resizable = !!props.resizable;
  const min = props.minWidth != null && props.minWidth > 0 ? props.minWidth : 48;
  const max = Math.max(min, props.maxWidth != null && props.maxWidth > 0 ? props.maxWidth : 800);
  const controlled = resizable && typeof props.width === "number" && !!props.onWidthChange;
  let t2;
  if ($[4] !== props.width) {
    t2 = () => typeof props.width === "number" ? props.width : null;
    $[4] = props.width;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const [own, setOwn] = React.useState(t2);
  const current = controlled ? props.width : resizable ? own : null;
  const width = current != null ? current : props.width;
  let t3;
  if ($[6] !== props.style || $[7] !== width) {
    t3 = width != null ? {
      ...props.style,
      width: typeof width === "number" ? width + "px" : width
    } : props.style;
    $[6] = props.style;
    $[7] = width;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  const style = t3;
  const align = oneOf(ALIGN, props.align, "start");
  let t4;
  if ($[9] !== props.sort) {
    t4 = props.sort !== void 0 ? oneOf(["ascending", "descending", "none"], props.sort, "none") : null;
    $[9] = props.sort;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  const sort = t4;
  if (process.env.NODE_ENV !== "production" && sort && !props.onSort) {
    warnOnce("table-sort", "TableHeaderCell: sort without onSort draws a sort button that does nothing. Pass onSort to change the order, or leave sort out of a column that can't be sorted.");
  }
  const labels = useSettings(words).labels;
  const button = React.useRef(null);
  const was = React.useRef(sort);
  let t5;
  let t6;
  if ($[11] !== labels || $[12] !== sort) {
    t5 = function() {
      if (sort === was.current) {
        return;
      }
      was.current = sort;
      if ((sort === "ascending" || sort === "descending") && button.current) {
        announce(labels.tableSorted((button.current.textContent || "").trim(), sort));
      }
    };
    t6 = [sort, labels];
    $[11] = labels;
    $[12] = sort;
    $[13] = t5;
    $[14] = t6;
  } else {
    t5 = $[13];
    t6 = $[14];
  }
  React.useEffect(t5, t6);
  const th = React.useRef(null);
  let t7;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = (n) => {
      th.current = n;
    };
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const setTh = useMergedRef(ref, t7);
  const handle = React.useRef(null);
  let t8;
  if ($[16] !== controlled || $[17] !== current || $[18] !== max || $[19] !== min || $[20] !== props.onWidthChange) {
    t8 = {
      min,
      max,
      current,
      controlled,
      onWidthChange: props.onWidthChange
    };
    $[16] = controlled;
    $[17] = current;
    $[18] = max;
    $[19] = min;
    $[20] = props.onWidthChange;
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  const live = useLatest(t8);
  const panel = React.useRef(null);
  const act = React.useRef(null);
  let t10;
  let t9;
  if ($[22] !== live || $[23] !== resizable) {
    t9 = () => {
      const h = handle.current;
      const cell = th.current;
      if (!resizable || !h || !cell) {
        return;
      }
      const now = () => live.current.current != null ? live.current.current : Math.round(cell.getBoundingClientRect().width);
      const set = (n_0) => {
        const l = live.current;
        const w = Math.round(Math.min(l.max, Math.max(l.min, n_0)));
        if (!l.controlled) {
          setOwn(w);
        }
        if (l.onWidthChange) {
          l.onWidthChange(w);
        }
      };
      const rtl = () => isRtl(cell);
      const onKey = (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) {
          return;
        }
        const grow = rtl() ? "ArrowLeft" : "ArrowRight";
        const shrink = rtl() ? "ArrowRight" : "ArrowLeft";
        if (e.key === grow) {
          set(now() + STEP);
        } else {
          if (e.key === shrink) {
            set(now() - STEP);
          } else {
            if (e.key === "Home") {
              set(live.current.min);
            } else {
              if (e.key === "End") {
                set(live.current.max);
              } else {
                if (e.key === "Enter" || e.key === " ") {
                  show();
                } else {
                  return;
                }
              }
            }
          }
        }
        e.preventDefault();
      };
      const p = panel.current;
      const isOpen = () => !!p && p.matches(":popover-open");
      let follow = null;
      const show = () => {
        if (!p || isOpen()) {
          return;
        }
        p.showPopover();
        const place = () => {
          const r = h.getBoundingClientRect();
          const b = p.getBoundingClientRect();
          p.style.left = Math.round(Math.max(8, Math.min(r.left + r.width / 2 - b.width / 2, innerWidth - b.width - 8))) + "px";
          p.style.top = Math.round(r.bottom + b.height + 8 <= innerHeight ? r.bottom + 8 : Math.max(8, r.top - b.height - 8)) + "px";
        };
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        follow = () => {
          window.removeEventListener("scroll", place, true);
          window.removeEventListener("resize", place);
          follow = null;
        };
        const first = p.querySelector("button:not(:disabled)");
        if (first) {
          first.focus();
        }
      };
      const onToggle = (e_0) => {
        if (e_0.newState !== "closed" || !p) {
          return;
        }
        if (follow) {
          follow();
        }
        const at = activeIn(h);
        if (!at || at === p.ownerDocument.body || p.contains(at)) {
          h.focus({
            preventScroll: true
          });
        }
      };
      let moved = false;
      let wasOpen = false;
      const onClick = () => {
        if (!moved && !wasOpen) {
          show();
        }
        moved = false;
        wasOpen = false;
      };
      let from = 0;
      let start = 0;
      let id = null;
      const onDown = (e_1) => {
        if (e_1.button !== 0) {
          return;
        }
        e_1.preventDefault();
        from = e_1.clientX;
        start = now();
        id = e_1.pointerId;
        moved = false;
        wasOpen = isOpen();
        try {
          h.setPointerCapture(id);
        } catch {
        }
        h.focus({
          preventScroll: true
        });
      };
      const onMove = (e_2) => {
        if (id !== e_2.pointerId) {
          return;
        }
        const d = rtl() ? from - e_2.clientX : e_2.clientX - from;
        if (Math.abs(d) > 2) {
          moved = true;
        }
        set(start + d);
      };
      const onUp = (e_3) => {
        if (id !== e_3.pointerId) {
          return;
        }
        id = null;
        if (h.hasPointerCapture(e_3.pointerId)) {
          h.releasePointerCapture(e_3.pointerId);
        }
      };
      const onFit = () => {
        const table = cell.closest("table");
        const at_0 = cell.cellIndex;
        if (!table || at_0 < 0) {
          return;
        }
        let widest = 0;
        for (const row of Array.from(table.rows)) {
          const c = row.cells[at_0];
          if (!c || c.colSpan > 1 || row.hidden) {
            continue;
          }
          const was_0 = c.style.whiteSpace;
          const cs = getComputedStyle(c);
          const range = document.createRange();
          c.style.whiteSpace = "nowrap";
          range.selectNodeContents(c);
          if (p && p.parentNode === c) {
            range.setEndBefore(p);
          }
          const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
          widest = Math.max(widest, Math.ceil(range.getBoundingClientRect().width + pad));
          c.style.whiteSpace = was_0;
        }
        if (widest) {
          set(widest + 1);
        }
      };
      act.current = {
        set,
        now,
        fit: onFit
      };
      if (p) {
        p.addEventListener("toggle", onToggle);
      }
      h.addEventListener("click", onClick);
      h.addEventListener("keydown", onKey);
      h.addEventListener("pointerdown", onDown);
      h.addEventListener("pointermove", onMove);
      h.addEventListener("pointerup", onUp);
      h.addEventListener("pointercancel", onUp);
      h.addEventListener("dblclick", onFit);
      return () => {
        h.removeEventListener("keydown", onKey);
        h.removeEventListener("pointerdown", onDown);
        h.removeEventListener("pointermove", onMove);
        h.removeEventListener("pointerup", onUp);
        h.removeEventListener("pointercancel", onUp);
        h.removeEventListener("dblclick", onFit);
        h.removeEventListener("click", onClick);
        if (p) {
          p.removeEventListener("toggle", onToggle);
        }
        if (follow) {
          follow();
        }
      };
    };
    t10 = [resizable, live];
    $[22] = live;
    $[23] = resizable;
    $[24] = t10;
    $[25] = t9;
  } else {
    t10 = $[24];
    t9 = $[25];
  }
  React.useEffect(t9, t10);
  const [name, setName] = React.useState("");
  const [drawn, setDrawn] = React.useState(null);
  const t11 = React.useId();
  let t12;
  if ($[26] !== t11) {
    t12 = domId("srp-th-hint", t11);
    $[26] = t11;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  const hint = t12;
  let t13;
  if ($[28] !== current || $[29] !== drawn || $[30] !== name || $[31] !== resizable) {
    t13 = () => {
      const cell_0 = th.current;
      if (!resizable || !cell_0) {
        return;
      }
      const text = Array.from(cell_0.childNodes).filter(_temp6).map(_temp7).join("").trim();
      if (text !== name) {
        setName(text);
      }
      const w_0 = current == null ? Math.round(cell_0.getBoundingClientRect().width) : null;
      if (w_0 !== drawn) {
        setDrawn(w_0);
      }
    };
    $[28] = current;
    $[29] = drawn;
    $[30] = name;
    $[31] = resizable;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  useIsoLayoutEffect(t13);
  const value = current != null ? current : drawn;
  let t14;
  if ($[33] !== hint || $[34] !== labels || $[35] !== max || $[36] !== min || $[37] !== name || $[38] !== resizable || $[39] !== value) {
    t14 = resizable ? {
      role: "separator",
      "aria-orientation": "vertical",
      "aria-label": labels.tableResizeColumn(name),
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": value != null ? value : void 0,
      tabIndex: 0,
      "aria-describedby": hint
    } : null;
    $[33] = hint;
    $[34] = labels;
    $[35] = max;
    $[36] = min;
    $[37] = name;
    $[38] = resizable;
    $[39] = value;
    $[40] = t14;
  } else {
    t14 = $[40];
  }
  const separator = t14;
  let t15;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t15 = (by) => {
      const a = act.current;
      if (a) {
        a.set(a.now() + by);
      }
    };
    $[41] = t15;
  } else {
    t15 = $[41];
  }
  const step = t15;
  const t16 = sort && sort !== "none" ? sort : void 0;
  const t17 = align !== "start" && "srp-table__cell--" + align;
  const t18 = sort && "srp-table__header--sortable";
  const t19 = resizable && "srp-table__header--resizable";
  let t20;
  if ($[42] !== props.className || $[43] !== t17 || $[44] !== t18 || $[45] !== t19) {
    t20 = cn("srp-table__cell srp-table__header", t17, t18, t19, props.className);
    $[42] = props.className;
    $[43] = t17;
    $[44] = t18;
    $[45] = t19;
    $[46] = t20;
  } else {
    t20 = $[46];
  }
  let t21;
  if ($[47] !== props.children || $[48] !== props.onSort || $[49] !== sort) {
    t21 = sort ? /* @__PURE__ */ React.createElement("button", { type: "button", ref: button, className: "srp-table__sort", onClick: props.onSort }, /* @__PURE__ */ React.createElement("span", null, props.children), /* @__PURE__ */ React.createElement(Icon, { icon: NEXT_ICON[sort], className: cn("srp-table__sort-icon", sort === "none" && "srp-table__sort-icon--idle") })) : props.children;
    $[47] = props.children;
    $[48] = props.onSort;
    $[49] = sort;
    $[50] = t21;
  } else {
    t21 = $[50];
  }
  let t22;
  if ($[51] !== separator) {
    t22 = separator ? /* @__PURE__ */ React.createElement("span", { ...separator, ref: handle, className: "srp-table__resize" }) : null;
    $[51] = separator;
    $[52] = t22;
  } else {
    t22 = $[52];
  }
  let t23;
  if ($[53] !== hint || $[54] !== labels || $[55] !== separator) {
    t23 = separator ? /* @__PURE__ */ React.createElement("span", { id: hint, hidden: true }, labels.tableResizeHint) : null;
    $[53] = hint;
    $[54] = labels;
    $[55] = separator;
    $[56] = t23;
  } else {
    t23 = $[56];
  }
  let t24;
  if ($[57] !== labels || $[58] !== max || $[59] !== min || $[60] !== name || $[61] !== separator || $[62] !== value) {
    t24 = separator ? /* @__PURE__ */ React.createElement("div", { ref: panel, ...{
      popover: "auto"
    }, role: "dialog", "aria-label": labels.tableResizeColumn(name), tabIndex: -1, className: "srp-popover srp-table-width" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", disabled: value != null && value <= min, onClick: () => step(-STEP) }, labels.tableNarrower), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", disabled: value != null && value >= max, onClick: () => step(STEP) }, labels.tableWider), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: () => {
      if (act.current) {
        act.current.fit();
      }
    } }, labels.tableFitColumn)) : null;
    $[57] = labels;
    $[58] = max;
    $[59] = min;
    $[60] = name;
    $[61] = separator;
    $[62] = value;
    $[63] = t24;
  } else {
    t24 = $[63];
  }
  let t25;
  if ($[64] !== rest || $[65] !== setTh || $[66] !== style || $[67] !== t16 || $[68] !== t20 || $[69] !== t21 || $[70] !== t22 || $[71] !== t23 || $[72] !== t24) {
    t25 = /* @__PURE__ */ React.createElement("th", { scope: "col", ...rest, ref: setTh, style, "aria-sort": t16, className: t20 }, t21, t22, t23, t24);
    $[64] = rest;
    $[65] = setTh;
    $[66] = style;
    $[67] = t16;
    $[68] = t20;
    $[69] = t21;
    $[70] = t22;
    $[71] = t23;
    $[72] = t24;
    $[73] = t25;
  } else {
    t25 = $[73];
  }
  return t25;
}
function _temp7(n_2) {
  return n_2.textContent || "";
}
function _temp6(n_1) {
  return !(n_1 instanceof HTMLElement && (n_1.hidden || n_1.classList.contains("srp-table__resize") || n_1.classList.contains("srp-popover")));
}
var TableHeaderCell = /* @__PURE__ */ named("TableHeaderCell", TableHeaderCellRender);
var PLAIN = {
  useGrouping: false
};
function TableCellRender(t0) {
  const $ = _c(9);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    align: 1,
    className: 1,
    children: 1,
    link: 1
  });
  const align = oneOf(ALIGN, props.align, "start");
  const locale = useLocale();
  const row = React.useContext(RowLinkContext);
  const n = props.children;
  const content = typeof n === "number" && Number.isFinite(n) ? displayNumber(n, locale, PLAIN) : n;
  const t1 = cn("srp-table__cell", align !== "start" && "srp-table__cell--" + align, props.className);
  let t2;
  if ($[0] !== content || $[1] !== props || $[2] !== row) {
    t2 = row && props.link ? /* @__PURE__ */ React.createElement("a", { className: "srp-table__row-link", href: row.href, target: row.target, rel: row.rel }, content) : content;
    $[0] = content;
    $[1] = props;
    $[2] = row;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== ref || $[5] !== rest || $[6] !== t1 || $[7] !== t2) {
    t3 = /* @__PURE__ */ React.createElement("td", { ...rest, ref, className: t1 }, t2);
    $[4] = ref;
    $[5] = rest;
    $[6] = t1;
    $[7] = t2;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  return t3;
}
var TableCell = /* @__PURE__ */ named("TableCell", TableCellRender);
function TableActionBarRender(t0) {
  const $ = _c(46);
  const {
    ref,
    ...props
  } = t0;
  const labels = useSettings(words).labels;
  const locale = useLocale();
  const rest = omit(props, {
    count: 1,
    onClear: 1,
    clearLabel: 1,
    total: 1,
    onSelectAll: 1,
    sticky: 1,
    className: 1,
    children: 1
  });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const total = Math.max(0, Math.floor(props.total || 0) || 0);
  const all = total > 0 && count >= total;
  const offer = props.onSelectAll && total > count;
  let t1;
  if ($[0] !== locale) {
    t1 = (x) => numberFormat(locale).format(x);
    $[0] = locale;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const format = t1;
  const self = React.useRef(null);
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = (e) => {
      self.current = e;
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const setRefs = useMergedRef(ref, t2);
  const t3 = React.useId();
  let t4;
  if ($[3] !== t3) {
    t4 = domId("srp-tab", t3);
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const id = t4;
  let t5;
  if ($[5] !== all || $[6] !== count || $[7] !== format || $[8] !== labels || $[9] !== total) {
    t5 = all ? labels.tableAllSelected(total, format(total)) : labels.tableSelected(count, format(count));
    $[5] = all;
    $[6] = count;
    $[7] = format;
    $[8] = labels;
    $[9] = total;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const said = t5;
  const moveOn = React.useRef(false);
  let t6;
  let t7;
  if ($[11] !== all) {
    t6 = () => {
      if (!all || !moveOn.current) {
        return;
      }
      moveOn.current = false;
      const next = self.current && self.current.querySelector(".srp-table-action-bar__clear, .srp-table-action-bar__actions button:not(:disabled)");
      if (next) {
        next.focus();
      }
    };
    t7 = [all];
    $[11] = all;
    $[12] = t6;
    $[13] = t7;
  } else {
    t6 = $[12];
    t7 = $[13];
  }
  useIsoLayoutEffect(t6, t7);
  let t8;
  let t9;
  if ($[14] !== count) {
    t8 = () => {
      const bar = self.current;
      if (count || !bar || !bar.contains(activeIn(bar))) {
        return;
      }
      const box = bar.nextElementSibling && bar.nextElementSibling.querySelector('input[type="checkbox"]:not(:disabled)');
      if (box) {
        box.focus();
      }
    };
    t9 = [count];
    $[14] = count;
    $[15] = t8;
    $[16] = t9;
  } else {
    t8 = $[15];
    t9 = $[16];
  }
  useIsoLayoutEffect(t8, t9);
  const was = React.useRef(0);
  let t10;
  let t11;
  if ($[17] !== count || $[18] !== said) {
    t10 = () => {
      if (count === was.current) {
        return;
      }
      was.current = count;
      if (count) {
        announce(said);
      }
    };
    t11 = [count, said];
    $[17] = count;
    $[18] = said;
    $[19] = t10;
    $[20] = t11;
  } else {
    t10 = $[19];
    t11 = $[20];
  }
  React.useEffect(t10, t11);
  const t12 = "group";
  const t13 = !count || void 0;
  const t14 = "table-action-bar";
  const t15 = cn("srp-table-action-bar", props.sticky && "srp-table-action-bar--sticky", props.className);
  let t16;
  if ($[21] !== id || $[22] !== said) {
    t16 = /* @__PURE__ */ React.createElement("span", { id, className: "srp-table-action-bar__count" }, said);
    $[21] = id;
    $[22] = said;
    $[23] = t16;
  } else {
    t16 = $[23];
  }
  let t17;
  if ($[24] !== format || $[25] !== labels || $[26] !== offer || $[27] !== props.onSelectAll || $[28] !== total) {
    t17 = offer ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", className: "srp-table-action-bar__all", onClick: () => {
      moveOn.current = !!self.current && self.current.contains(activeIn(self.current));
      props.onSelectAll();
    } }, labels.tableSelectAll(total, format(total))) : null;
    $[24] = format;
    $[25] = labels;
    $[26] = offer;
    $[27] = props.onSelectAll;
    $[28] = total;
    $[29] = t17;
  } else {
    t17 = $[29];
  }
  let t18;
  if ($[30] !== props.children) {
    t18 = /* @__PURE__ */ React.createElement("div", { className: "srp-table-action-bar__actions" }, props.children);
    $[30] = props.children;
    $[31] = t18;
  } else {
    t18 = $[31];
  }
  let t19;
  if ($[32] !== labels.clearSelection || $[33] !== props.clearLabel || $[34] !== props.onClear) {
    t19 = props.onClear ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", className: "srp-table-action-bar__clear", onClick: props.onClear }, props.clearLabel || labels.clearSelection) : null;
    $[32] = labels.clearSelection;
    $[33] = props.clearLabel;
    $[34] = props.onClear;
    $[35] = t19;
  } else {
    t19 = $[35];
  }
  let t20;
  if ($[36] !== id || $[37] !== rest || $[38] !== setRefs || $[39] !== t13 || $[40] !== t15 || $[41] !== t16 || $[42] !== t17 || $[43] !== t18 || $[44] !== t19) {
    t20 = /* @__PURE__ */ React.createElement("div", { role: t12, "aria-labelledby": id, ...rest, ref: setRefs, hidden: t13, "data-component": t14, className: t15 }, t16, t17, t18, t19);
    $[36] = id;
    $[37] = rest;
    $[38] = setRefs;
    $[39] = t13;
    $[40] = t15;
    $[41] = t16;
    $[42] = t17;
    $[43] = t18;
    $[44] = t19;
    $[45] = t20;
  } else {
    t20 = $[45];
  }
  return t20;
}
var TableActionBar = /* @__PURE__ */ named("TableActionBar", TableActionBarRender);
function TableColumnsMenuRender(t0) {
  const $ = _c(2);
  const {
    ref,
    ...props
  } = t0;
  const labels = useSettings(words).labels;
  const rest = omit(props, {
    columns: 1,
    onColumnsChange: 1,
    label: 1,
    children: 1
  });
  const label = props.label || labels.tableColumns;
  const shown = props.columns.filter(_temp8).length;
  const t1 = "srp-table-columns";
  const t2 = props.columns.map((c_0) => /* @__PURE__ */ React.createElement(Checkbox, { key: c_0.id, checked: c_0.visible || !!c_0.required, disabled: !!c_0.required || c_0.visible && shown <= 1, onChange: (e) => {
    const v = e.currentTarget.checked;
    props.onColumnsChange(props.columns.map((x) => x.id === c_0.id ? {
      ...x,
      visible: v
    } : x), {
      id: c_0.id,
      visible: v
    });
  } }, c_0.label));
  let t3;
  if ($[0] !== t2) {
    t3 = /* @__PURE__ */ React.createElement("div", { className: t1 }, t2);
    $[0] = t2;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  return /* @__PURE__ */ React.createElement(Popover, { title: label, placement: "bottom-end", trigger: /* @__PURE__ */ React.createElement(Button, { ...rest, ref, variant: "outline", size: "sm" }, label) }, t3);
}
function _temp8(c) {
  return c.visible;
}
var TableColumnsMenu = /* @__PURE__ */ named("TableColumnsMenu", TableColumnsMenuRender);
function TableExpandCellRender(t0) {
  const $ = _c(21);
  const {
    ref,
    ...props
  } = t0;
  const labels = useSettings(words).labels;
  const rest = omit(props, {
    expanded: 1,
    onExpandedChange: 1,
    label: 1,
    controls: 1,
    inHeader: 1,
    className: 1,
    children: 1
  });
  const cls = cn("srp-table__cell srp-table__expand", props.className);
  if (props.inHeader) {
    let t12;
    if ($[0] !== labels.tableDetails) {
      t12 = /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, labels.tableDetails);
      $[0] = labels.tableDetails;
      $[1] = t12;
    } else {
      t12 = $[1];
    }
    return /* @__PURE__ */ React.createElement("th", { scope: "col", ...rest, ref, className: cn(cls, "srp-table__header") }, t12);
  }
  const open = !!props.expanded;
  const T0 = IconButton;
  let t1;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, mirror: true });
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const t2 = props.label ? labels.tableRowDetails(props.label) : labels.tableDetails;
  const t3 = open && "srp-table__expand-button--open";
  let t4;
  if ($[3] !== t3) {
    t4 = cn("srp-table__expand-button", t3);
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== open || $[6] !== props) {
    t5 = () => {
      if (props.onExpandedChange) {
        props.onExpandedChange(!open);
      }
    };
    $[5] = open;
    $[6] = props;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== T0 || $[9] !== open || $[10] !== props.controls || $[11] !== t1 || $[12] !== t2 || $[13] !== t4 || $[14] !== t5) {
    t6 = /* @__PURE__ */ React.createElement(T0, { icon: t1, label: t2, variant: "ghost", size: "sm", className: t4, "aria-expanded": open, "aria-controls": props.controls, onClick: t5 });
    $[8] = T0;
    $[9] = open;
    $[10] = props.controls;
    $[11] = t1;
    $[12] = t2;
    $[13] = t4;
    $[14] = t5;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  let t7;
  if ($[16] !== cls || $[17] !== ref || $[18] !== rest || $[19] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("td", { ...rest, ref, className: cls }, t6);
    $[16] = cls;
    $[17] = ref;
    $[18] = rest;
    $[19] = t6;
    $[20] = t7;
  } else {
    t7 = $[20];
  }
  return t7;
}
var TableExpandCell = /* @__PURE__ */ named("TableExpandCell", TableExpandCellRender);
function TableDetailRowRender(t0) {
  const $ = _c(15);
  let props;
  let t1;
  let t2;
  let t3;
  let t4;
  if ($[0] !== t0) {
    const {
      ref,
      ...t52
    } = t0;
    props = t52;
    const rest = omit(props, {
      open: 1,
      colSpan: 1,
      className: 1,
      children: 1
    });
    t1 = rest;
    t2 = ref;
    t3 = !props.open;
    t4 = cn("srp-table__detail", props.className);
    $[0] = t0;
    $[1] = props;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
    $[5] = t4;
  } else {
    props = $[1];
    t1 = $[2];
    t2 = $[3];
    t3 = $[4];
    t4 = $[5];
  }
  let t5;
  if ($[6] !== props.children || $[7] !== props.colSpan) {
    t5 = /* @__PURE__ */ React.createElement("td", { colSpan: props.colSpan, className: "srp-table__cell srp-table__detail-cell" }, props.children);
    $[6] = props.children;
    $[7] = props.colSpan;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== t1 || $[10] !== t2 || $[11] !== t3 || $[12] !== t4 || $[13] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("tr", { ...t1, ref: t2, hidden: t3, className: t4 }, t5);
    $[9] = t1;
    $[10] = t2;
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  return t6;
}
var TableDetailRow = /* @__PURE__ */ named("TableDetailRow", TableDetailRowRender);
function TableLoadingRowsRender(t0) {
  const $ = _c(9);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    columns: 1,
    rows: 1,
    label: 1,
    className: 1,
    children: 1
  });
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const columns = Math.min(100, Math.max(1, Math.floor(Number(props.columns)) || 1));
  const sds = useSettings(words);
  const waiting = !useSkeletonShown(props.label == null ? sds.labels.loading : props.label);
  let out;
  if ($[0] !== columns || $[1] !== rows || $[2] !== waiting) {
    out = [];
    for (let r = 0; r < rows; r++) {
      const cells = [];
      for (let c = 0; c < columns; c++) {
        cells.push(/* @__PURE__ */ React.createElement("td", { key: c, className: "srp-table__cell" }, /* @__PURE__ */ React.createElement(SkeletonArt, { waiting })));
      }
      out.push(/* @__PURE__ */ React.createElement("tr", { key: r, className: "srp-table__loading-row" }, cells));
    }
    $[0] = columns;
    $[1] = rows;
    $[2] = waiting;
    $[3] = out;
  } else {
    out = $[3];
  }
  const t1 = cn("srp-table__body srp-table__loading", props.className);
  let t2;
  if ($[4] !== out || $[5] !== ref || $[6] !== rest || $[7] !== t1) {
    t2 = /* @__PURE__ */ React.createElement("tbody", { ...rest, ref, className: t1 }, out);
    $[4] = out;
    $[5] = ref;
    $[6] = rest;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  return t2;
}
var TableLoadingRows = /* @__PURE__ */ named("TableLoadingRows", TableLoadingRowsRender);
function TableMessageRowRender(t0) {
  const $ = _c(13);
  let props;
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...t42
    } = t0;
    props = t42;
    const rest = omit(props, {
      colSpan: 1,
      className: 1,
      children: 1
    });
    t1 = rest;
    t2 = ref;
    t3 = cn("srp-table__message", props.className);
    $[0] = t0;
    $[1] = props;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
  } else {
    props = $[1];
    t1 = $[2];
    t2 = $[3];
    t3 = $[4];
  }
  let t4;
  if ($[5] !== props.children || $[6] !== props.colSpan) {
    t4 = /* @__PURE__ */ React.createElement("td", { colSpan: props.colSpan, className: "srp-table__cell srp-table__message-cell" }, props.children);
    $[5] = props.children;
    $[6] = props.colSpan;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== t1 || $[9] !== t2 || $[10] !== t3 || $[11] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("tr", { ...t1, ref: t2, className: t3 }, t4);
    $[8] = t1;
    $[9] = t2;
    $[10] = t3;
    $[11] = t4;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  return t5;
}
var TableMessageRow = /* @__PURE__ */ named("TableMessageRow", TableMessageRowRender);
export {
  Table,
  TableActionBar,
  TableBody,
  TableCell,
  TableColumnsMenu,
  TableDetailRow,
  TableExpandCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableLoadingRows,
  TableMessageRow,
  TableRow,
  TableSelectCell,
  TableVirtualBody
};
//# sourceMappingURL=Table.js.map
