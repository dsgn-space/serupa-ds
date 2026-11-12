"use client";

// src/components/Table/Table.tsx
import * as React from "react";
import { useScrolls } from "../../internal/useScrolls.js";
import { flushSync } from "react-dom";
import { announce } from "../../internal/announce.js";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { component } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { warnOnce } from "../../internal/warn.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { useVirtual } from "../../internal/virtual.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var ALIGN = ["start", "center", "end"];
var Table = /* @__PURE__ */ component("Table", function Table2(props, ref) {
  const restyle = useServerStyles();
  const sds = useSettings(words);
  const rest = omit(props, { size: 1, layout: 1, striped: 1, stickyHeader: 1, caption: 1, hideCaption: 1, containerProps: 1, pinStart: 1, pinEnd: 1, busy: 1, className: 1, children: 1 });
  const size = oneOf(["sm", "md"], props.size, "md");
  const frame = React.useRef(null);
  const scrolls = useScrolls(frame);
  const cid = domId("dk-tc", React.useId());
  const sticky = !!props.stickyHeader;
  React.useEffect(() => {
    const el = frame.current, head = el && el.querySelector(".dk-table__head");
    if (!el || !sticky || !head || typeof ResizeObserver === "undefined") return;
    const set = () => el.style.setProperty("--dk-table-head", head.getBoundingClientRect().height + "px");
    const ro = new ResizeObserver(set);
    ro.observe(head);
    set();
    let raf = 0;
    const onFocus = (e) => {
      const t = e.target;
      if (t === el || head.contains(t)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const covered = el.getBoundingClientRect().top + el.clientTop + head.getBoundingClientRect().height - t.getBoundingClientRect().top;
        if (covered > 0) el.scrollTop -= covered;
      });
    };
    el.addEventListener("focusin", onFocus);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("focusin", onFocus);
      el.style.removeProperty("--dk-table-head");
    };
  }, [sticky]);
  const { "aria-label": frameLabel, "aria-labelledby": frameLabelledBy, ...cp } = props.containerProps || {};
  const hasCaption = props.caption != null && props.caption !== false && props.caption !== "";
  const region = !scrolls ? {} : hasCaption ? { tabIndex: 0, role: "region", "aria-labelledby": cid } : { tabIndex: 0, role: "region", "aria-labelledby": frameLabelledBy, "aria-label": frameLabelledBy ? void 0 : frameLabel || sds.labels.table };
  return /* @__PURE__ */ React.createElement("div", { ...cp, ...region, ref: (n) => {
    frame.current = n;
    restyle(n);
  }, "data-component": "table", className: cn("dk-table", size === "sm" && "dk-table--sm", oneOf(["auto", "fixed"], props.layout, "auto") === "fixed" && "dk-table--fixed", props.striped && "dk-table--striped", props.stickyHeader && "dk-table--sticky", props.pinStart && "dk-table--pin-start", props.pinEnd && "dk-table--pin-end", cp.className) }, /* @__PURE__ */ React.createElement("table", { "aria-busy": props.busy || void 0, ...rest, ref, className: cn("dk-table__table", props.className) }, hasCaption ? /* @__PURE__ */ React.createElement("caption", { id: cid, className: cn("dk-table__caption", props.hideCaption && "dk-visually-hidden") }, props.caption) : null, props.children));
});
var TableHead = /* @__PURE__ */ component("TableHead", function TableHead2(props, ref) {
  return /* @__PURE__ */ React.createElement("thead", { ...props, ref, className: cn("dk-table__head", props.className) });
});
var TableBody = /* @__PURE__ */ component("TableBody", function TableBody2(props, ref) {
  return /* @__PURE__ */ React.createElement("tbody", { ...props, ref, className: cn("dk-table__body", props.className) });
});
var PRINT_ROWS = 5e3;
var TableVirtualBody = /* @__PURE__ */ component("TableVirtualBody", function TableVirtualBody2(props, ref) {
  const rest = omit(props, { count: 1, renderRow: 1, itemKey: 1, estimatedRowHeight: 1, overscan: 1, className: 1, onFocus: 1, onBlur: 1 });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const body = React.useRef(null);
  const [small, setSmall] = React.useState(false);
  const estimate = props.estimatedRowHeight && props.estimatedRowHeight > 0 ? props.estimatedRowHeight : small ? 36 : 41;
  const r = useVirtual({
    count,
    estimate,
    overscan: props.overscan != null && props.overscan >= 0 ? props.overscan : 6,
    rows: () => body.current,
    // The rows start under the caption and the header: where this body starts in the frame's scrolling content.
    origin: () => {
      const b = body.current, f = b && b.closest(".dk-table");
      return b && f ? b.getBoundingClientRect().top - f.getBoundingClientRect().top - f.clientTop + f.scrollTop : 0;
    }
  });
  const attach = r.ref;
  const [head, setHead] = React.useState(0);
  useIsoLayoutEffect(() => {
    const b = body.current, f = b && b.closest(".dk-table"), t = b && b.closest("table");
    attach(f);
    setSmall(!!f && f.classList.contains("dk-table--sm"));
    const rowsOf = (s) => s ? s.querySelectorAll(":scope > tr").length : 0;
    const h = t ? rowsOf(t.querySelector(":scope > thead")) : 0;
    setHead(h);
    if (!t) return;
    t.setAttribute("aria-rowcount", String(h + count + rowsOf(t.querySelector(":scope > tfoot"))));
    return () => t.removeAttribute("aria-rowcount");
  }, [attach, count]);
  const [focused, setFocused] = React.useState(null);
  const [printing, setPrinting] = React.useState(false);
  React.useEffect(() => {
    const on = () => flushSync(() => setPrinting(true)), off = () => setPrinting(false);
    window.addEventListener("beforeprint", on);
    window.addEventListener("afterprint", off);
    return () => {
      window.removeEventListener("beforeprint", on);
      window.removeEventListener("afterprint", off);
    };
  }, []);
  const { renderRow, itemKey } = props;
  const row = (i, out) => {
    const el = renderRow(i);
    const style = out ? { ...el.props.style, position: "absolute", insetInline: 0, top: r.offsetOf(i) } : el.props.style;
    return React.cloneElement(el, { key: itemKey ? itemKey(i) : i, "data-index": printing ? void 0 : i, "aria-rowindex": head + i + 1, style });
  };
  const rows = [];
  const keep = !printing && focused != null && focused < count && (focused < r.start || focused >= r.end) ? focused : null;
  const start = printing ? 0 : r.start, end = printing ? Math.min(count, PRINT_ROWS) : r.end;
  if (keep != null && keep < start) rows.push(row(keep, true));
  for (let i = start; i < end; i++) rows.push(row(i, false));
  if (keep != null && keep >= end) rows.push(row(keep, true));
  const lead = [];
  if (!printing && r.before > 0) lead.push(r.before);
  if ((lead.length + (keep != null && keep < start ? 1 : 0)) % 2 !== start % 2) lead.push(0);
  const indexOf = (t, tb) => {
    const tr = t instanceof HTMLElement ? t.closest("[data-index]") : null;
    return tr && tr.parentElement === tb ? Number(tr.dataset.index) : null;
  };
  const setNode = useMergedRef(ref, (n) => {
    body.current = n;
  });
  return /* @__PURE__ */ React.createElement(
    "tbody",
    {
      ...rest,
      ref: setNode,
      className: cn("dk-table__body", "dk-table__body--virtual", props.className),
      onFocus: (e) => {
        setFocused(indexOf(e.target, e.currentTarget));
        if (props.onFocus) props.onFocus(e);
      },
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(null);
        if (props.onBlur) props.onBlur(e);
      }
    },
    lead.map((h, n) => /* @__PURE__ */ React.createElement("tr", { key: "lead" + n, "aria-hidden": "true", className: "dk-table__spacer", style: { height: h } })),
    rows,
    !printing && r.after > 0 ? /* @__PURE__ */ React.createElement("tr", { "aria-hidden": "true", className: "dk-table__spacer", style: { height: r.after } }) : null
  );
});
var TableFoot = /* @__PURE__ */ component("TableFoot", function TableFoot2(props, ref) {
  return /* @__PURE__ */ React.createElement("tfoot", { ...props, ref, className: cn("dk-table__foot", props.className) });
});
var RowLinkContext = /* @__PURE__ */ React.createContext(null);
var TableRow = /* @__PURE__ */ component("TableRow", function TableRow2(props, ref) {
  const rest = omit(props, { selected: 1, className: 1, href: 1, target: 1, rel: 1, children: 1 });
  const isLink = props.href != null;
  if (process.env.NODE_ENV !== "production" && props.onClick && !isLink) warnOnce("table-row-click", "TableRow: onClick on a row reaches mouse users only: the keyboard and screen readers can't press a row. To open something, give the row an href (the whole row becomes a link); for an action, put a button in a cell.");
  const link = React.useMemo(function() {
    return isLink ? { href: props.href, target: props.target, rel: props.target === "_blank" && props.rel == null ? "noopener noreferrer" : props.rel } : null;
  }, [isLink, props.href, props.target, props.rel]);
  let children = props.children;
  if (isLink) {
    const kids = React.Children.toArray(children);
    const marked = kids.some(function(k) {
      return React.isValidElement(k) && k.type === TableCell && k.props.link;
    });
    if (!marked) {
      const first = kids.findIndex(function(k) {
        return React.isValidElement(k) && k.type === TableCell;
      });
      if (first >= 0) children = kids.map(function(k, i) {
        return i === first ? React.cloneElement(k, { link: true }) : k;
      });
    }
  }
  return /* @__PURE__ */ React.createElement("tr", { ...rest, ref, className: cn("dk-table__row", props.selected && "dk-table__row--selected", isLink && "dk-table__row--link", props.className) }, link ? /* @__PURE__ */ React.createElement(RowLinkContext.Provider, { value: link }, children) : children);
});
var TableSelectCell = /* @__PURE__ */ component("TableSelectCell", function TableSelectCell2(props, ref) {
  const { label, header, cellProps, ...rest } = props;
  const cp = cellProps || {};
  const box = /* @__PURE__ */ React.createElement(Checkbox, { ...rest, ref, "aria-label": label });
  const cls = cn("dk-table__cell dk-table__select", cp.className);
  return header ? /* @__PURE__ */ React.createElement("th", { scope: "col", ...cp, className: cn(cls, "dk-table__header") }, box) : /* @__PURE__ */ React.createElement("td", { ...cp, className: cls }, box);
});
var NEXT_ICON = { ascending: icons.ArrowUpward, descending: icons.ArrowDownward, none: icons.UnfoldMore };
var STEP = 16;
var TableHeaderCell = /* @__PURE__ */ component("TableHeaderCell", function TableHeaderCell2(props, ref) {
  const rest = omit(props, { align: 1, sort: 1, onSort: 1, width: 1, resizable: 1, minWidth: 1, maxWidth: 1, onWidthChange: 1, style: 1, className: 1, children: 1 });
  const resizable = !!props.resizable;
  const min = props.minWidth != null && props.minWidth > 0 ? props.minWidth : 48;
  const max = Math.max(min, props.maxWidth != null && props.maxWidth > 0 ? props.maxWidth : 800);
  const controlled = resizable && typeof props.width === "number" && !!props.onWidthChange;
  const [own, setOwn] = React.useState(() => typeof props.width === "number" ? props.width : null);
  const current = controlled ? props.width : resizable ? own : null;
  const width = current != null ? current : props.width;
  const style = width != null ? { ...props.style, width: typeof width === "number" ? width + "px" : width } : props.style;
  const align = oneOf(ALIGN, props.align, "start");
  const sort = props.sort !== void 0 ? oneOf(["ascending", "descending", "none"], props.sort, "none") : null;
  const labels = useSettings(words).labels;
  const button = React.useRef(null);
  const was = React.useRef(sort);
  React.useEffect(function() {
    if (sort === was.current) return;
    was.current = sort;
    if ((sort === "ascending" || sort === "descending") && button.current) announce(labels.tableSorted((button.current.textContent || "").trim(), sort));
  }, [sort, labels]);
  const th = React.useRef(null);
  const setTh = useMergedRef(ref, (n) => {
    th.current = n;
  });
  const handle = React.useRef(null);
  const live = React.useRef({ min, max, current, controlled, onWidthChange: props.onWidthChange });
  live.current = { min, max, current, controlled, onWidthChange: props.onWidthChange };
  const panel = React.useRef(null);
  const act = React.useRef(null);
  React.useEffect(() => {
    const h = handle.current, cell = th.current;
    if (!resizable || !h || !cell) return;
    const now = () => live.current.current != null ? live.current.current : Math.round(cell.getBoundingClientRect().width);
    const set = (n) => {
      const l = live.current, w = Math.round(Math.min(l.max, Math.max(l.min, n)));
      if (!l.controlled) setOwn(w);
      if (l.onWidthChange) l.onWidthChange(w);
    };
    const rtl = () => getComputedStyle(cell).direction === "rtl";
    const onKey = (e) => {
      const grow = rtl() ? "ArrowLeft" : "ArrowRight", shrink = rtl() ? "ArrowRight" : "ArrowLeft";
      if (e.key === grow) set(now() + STEP);
      else if (e.key === shrink) set(now() - STEP);
      else if (e.key === "Home") set(live.current.min);
      else if (e.key === "End") set(live.current.max);
      else if (e.key === "Enter" || e.key === " ") show();
      else return;
      e.preventDefault();
    };
    const p = panel.current;
    const isOpen = () => !!p && p.matches(":popover-open");
    const show = () => {
      if (!p || isOpen()) return;
      p.showPopover();
      const r = h.getBoundingClientRect(), b = p.getBoundingClientRect(), gap = 8;
      p.style.left = Math.round(Math.max(gap, Math.min(r.left + r.width / 2 - b.width / 2, innerWidth - b.width - gap))) + "px";
      p.style.top = Math.round(r.bottom + b.height + gap <= innerHeight ? r.bottom + gap : Math.max(gap, r.top - b.height - gap)) + "px";
      const first = p.querySelector("button:not(:disabled)");
      if (first) first.focus();
    };
    const onToggle = (e) => {
      if (e.newState !== "closed" || !p) return;
      const at = activeIn(h);
      if (!at || at === p.ownerDocument.body || p.contains(at)) h.focus({ preventScroll: true });
    };
    let moved = false, wasOpen = false;
    const onClick = () => {
      if (!moved && !wasOpen) show();
      moved = false;
      wasOpen = false;
    };
    let from = 0, start = 0, id = null;
    const onDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      from = e.clientX;
      start = now();
      id = e.pointerId;
      moved = false;
      wasOpen = isOpen();
      try {
        h.setPointerCapture(id);
      } catch {
      }
      h.focus({ preventScroll: true });
    };
    const onMove = (e) => {
      if (id !== e.pointerId) return;
      const d = rtl() ? from - e.clientX : e.clientX - from;
      if (Math.abs(d) > 2) moved = true;
      set(start + d);
    };
    const onUp = (e) => {
      if (id !== e.pointerId) return;
      id = null;
      if (h.hasPointerCapture(e.pointerId)) h.releasePointerCapture(e.pointerId);
    };
    const onFit = () => {
      const table = cell.closest("table"), at = cell.cellIndex;
      if (!table || at < 0) return;
      let widest = 0;
      for (const row of Array.from(table.rows)) {
        const c = row.cells[at];
        if (!c || c.colSpan > 1 || row.hidden) continue;
        const was2 = c.style.whiteSpace, cs = getComputedStyle(c), range = document.createRange();
        c.style.whiteSpace = "nowrap";
        range.selectNodeContents(c);
        if (p && p.parentNode === c) range.setEndBefore(p);
        const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        widest = Math.max(widest, Math.ceil(range.getBoundingClientRect().width + pad));
        c.style.whiteSpace = was2;
      }
      if (widest) set(widest + 1);
    };
    act.current = { set, now, fit: onFit };
    if (p) p.addEventListener("toggle", onToggle);
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
      if (p) p.removeEventListener("toggle", onToggle);
    };
  }, [resizable]);
  const [name, setName] = React.useState("");
  const [drawn, setDrawn] = React.useState(null);
  const hint = domId("dk-th-hint", React.useId());
  useIsoLayoutEffect(() => {
    const cell = th.current;
    if (!resizable || !cell) return;
    const text = Array.from(cell.childNodes).filter((n) => !(n instanceof HTMLElement && (n.hidden || n.classList.contains("dk-table__resize") || n.classList.contains("dk-popover")))).map((n) => n.textContent || "").join("").trim();
    if (text !== name) setName(text);
    const w = current == null ? Math.round(cell.getBoundingClientRect().width) : null;
    if (w !== drawn) setDrawn(w);
  });
  const value = current != null ? current : drawn;
  const separator = resizable ? {
    role: "separator",
    "aria-orientation": "vertical",
    "aria-label": labels.tableResizeColumn(name),
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value != null ? value : void 0,
    tabIndex: 0,
    "aria-describedby": hint
    // that Enter opens the width buttons: a separator can't carry aria-haspopup
  } : null;
  const step = (by) => {
    const a = act.current;
    if (a) a.set(a.now() + by);
  };
  return /* @__PURE__ */ React.createElement(
    "th",
    {
      scope: "col",
      ...rest,
      ref: setTh,
      style,
      "aria-sort": sort && sort !== "none" ? sort : void 0,
      className: cn("dk-table__cell dk-table__header", align !== "start" && "dk-table__cell--" + align, sort && "dk-table__header--sortable", resizable && "dk-table__header--resizable", props.className)
    },
    sort ? /* @__PURE__ */ React.createElement("button", { type: "button", ref: button, className: "dk-table__sort", onClick: props.onSort }, /* @__PURE__ */ React.createElement("span", null, props.children), /* @__PURE__ */ React.createElement(Icon, { icon: NEXT_ICON[sort], className: cn("dk-table__sort-icon", sort === "none" && "dk-table__sort-icon--idle") })) : props.children,
    separator ? /* @__PURE__ */ React.createElement("span", { ...separator, ref: handle, className: "dk-table__resize" }) : null,
    separator ? /* @__PURE__ */ React.createElement("span", { id: hint, hidden: true }, labels.tableResizeHint) : null,
    separator ? /* @__PURE__ */ React.createElement("div", { ref: panel, ...{ popover: "auto" }, role: "dialog", "aria-label": labels.tableResizeColumn(name), tabIndex: -1, className: "dk-popover dk-table-width" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", disabled: value != null && value <= min, onClick: () => step(-STEP) }, labels.tableNarrower), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", disabled: value != null && value >= max, onClick: () => step(STEP) }, labels.tableWider), /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: () => {
      if (act.current) act.current.fit();
    } }, labels.tableFitColumn)) : null
  );
});
var PLAIN = { useGrouping: false };
var TableCell = /* @__PURE__ */ component("TableCell", function TableCell2(props, ref) {
  const rest = omit(props, { align: 1, className: 1, children: 1, link: 1 });
  const align = oneOf(ALIGN, props.align, "start");
  const locale = useLocale();
  const row = React.useContext(RowLinkContext);
  const n = props.children;
  const content = typeof n === "number" && Number.isFinite(n) ? displayNumber(n, locale, PLAIN) : n;
  return /* @__PURE__ */ React.createElement("td", { ...rest, ref, className: cn("dk-table__cell", align !== "start" && "dk-table__cell--" + align, props.className) }, row && props.link ? /* @__PURE__ */ React.createElement("a", { className: "dk-table__row-link", href: row.href, target: row.target, rel: row.rel }, content) : content);
});
var TableActionBar = /* @__PURE__ */ component("TableActionBar", function TableActionBar2(props, ref) {
  const labels = useSettings(words).labels, locale = useLocale();
  const rest = omit(props, { count: 1, onClear: 1, clearLabel: 1, className: 1, children: 1 });
  const count = Math.max(0, Math.floor(props.count) || 0);
  const self = React.useRef(null);
  const setRefs = useMergedRef(ref, (e) => {
    self.current = e;
  });
  const id = domId("dk-tab", React.useId());
  const said = labels.tableSelected(count, new Intl.NumberFormat(locale).format(count));
  useIsoLayoutEffect(() => {
    const bar = self.current;
    if (count || !bar || !bar.contains(activeIn(bar))) return;
    const box = bar.nextElementSibling && bar.nextElementSibling.querySelector('input[type="checkbox"]:not(:disabled)');
    if (box) box.focus();
  }, [count]);
  const was = React.useRef(0);
  React.useEffect(() => {
    if (count === was.current) return;
    was.current = count;
    if (count) announce(said);
  }, [count, said]);
  return /* @__PURE__ */ React.createElement("div", { role: "group", "aria-labelledby": id, ...rest, ref: setRefs, hidden: !count || void 0, "data-component": "table-action-bar", className: cn("dk-table-action-bar", props.className) }, /* @__PURE__ */ React.createElement("span", { id, className: "dk-table-action-bar__count" }, said), /* @__PURE__ */ React.createElement("div", { className: "dk-table-action-bar__actions" }, props.children), props.onClear ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: props.onClear }, props.clearLabel || labels.clearSelection) : null);
});
function TableColumnsMenu(props) {
  const labels = useSettings(words).labels;
  const label = props.label || labels.tableColumns;
  const shown = props.columns.filter((c) => c.visible).length;
  return /* @__PURE__ */ React.createElement(
    Popover,
    {
      title: label,
      placement: "bottom-end",
      trigger: /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm" }, label)
    },
    /* @__PURE__ */ React.createElement("div", { className: "dk-table-columns" }, props.columns.map((c) => /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        key: c.id,
        checked: c.visible || !!c.required,
        disabled: !!c.required || c.visible && shown <= 1,
        onChange: (e) => {
          const v = e.currentTarget.checked;
          props.onColumnsChange(props.columns.map((x) => x.id === c.id ? { ...x, visible: v } : x), { id: c.id, visible: v });
        }
      },
      c.label
    )))
  );
}
var TableExpandCell = /* @__PURE__ */ component("TableExpandCell", function TableExpandCell2(props, ref) {
  const labels = useSettings(words).labels;
  const rest = omit(props, { expanded: 1, onExpandedChange: 1, label: 1, controls: 1, header: 1, className: 1, children: 1 });
  const cls = cn("dk-table__cell dk-table__expand", props.className);
  if (props.header) return /* @__PURE__ */ React.createElement("th", { scope: "col", ...rest, ref, className: cn(cls, "dk-table__header") }, /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, labels.tableDetails));
  const open = !!props.expanded;
  return /* @__PURE__ */ React.createElement("td", { ...rest, ref, className: cls }, /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, mirror: true }),
      label: props.label ? labels.tableRowDetails(props.label) : labels.tableDetails,
      variant: "ghost",
      size: "sm",
      className: cn("dk-table__expand-button", open && "dk-table__expand-button--open"),
      "aria-expanded": open,
      "aria-controls": props.controls,
      onClick: () => {
        if (props.onExpandedChange) props.onExpandedChange(!open);
      }
    }
  ));
});
var TableDetailRow = /* @__PURE__ */ component("TableDetailRow", function TableDetailRow2(props, ref) {
  const rest = omit(props, { open: 1, colSpan: 1, className: 1, children: 1 });
  return /* @__PURE__ */ React.createElement("tr", { ...rest, ref, hidden: !props.open, className: cn("dk-table__detail", props.className) }, /* @__PURE__ */ React.createElement("td", { colSpan: props.colSpan, className: "dk-table__cell dk-table__detail-cell" }, props.children));
});
var TableLoadingRows = /* @__PURE__ */ component("TableLoadingRows", function TableLoadingRows2(props, ref) {
  const rest = omit(props, { columns: 1, rows: 1, label: 1, className: 1, children: 1 });
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const columns = Math.min(100, Math.max(1, Math.floor(Number(props.columns)) || 1));
  const sds = useSettings(words);
  const waiting = !useSkeletonShown(props.label == null ? sds.labels.loading : props.label);
  const out = [];
  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < columns; c++)
      cells.push(/* @__PURE__ */ React.createElement("td", { key: c, className: "dk-table__cell" }, /* @__PURE__ */ React.createElement(SkeletonArt, { waiting })));
    out.push(/* @__PURE__ */ React.createElement("tr", { key: r, className: "dk-table__loading-row" }, cells));
  }
  return /* @__PURE__ */ React.createElement("tbody", { ...rest, ref, className: cn("dk-table__body dk-table__loading", props.className) }, out);
});
var TableMessageRow = /* @__PURE__ */ component("TableMessageRow", function TableMessageRow2(props, ref) {
  const rest = omit(props, { colSpan: 1, className: 1, children: 1 });
  return /* @__PURE__ */ React.createElement("tr", { ...rest, ref, className: cn("dk-table__message", props.className) }, /* @__PURE__ */ React.createElement("td", { colSpan: props.colSpan, className: "dk-table__cell dk-table__message-cell" }, props.children));
});
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
