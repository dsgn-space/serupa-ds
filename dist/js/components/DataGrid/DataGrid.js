"use client";

// src/components/DataGrid/DataGrid.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { announce } from "../../internal/announce.js";
import { warnOnce } from "../../internal/warn.js";
import { isComposing } from "../../internal/ime.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { en as words } from "./labels.js";
import { useStickyHead } from "../../internal/stickyHead.js";
var OWN = { columns: 1, rows: 1, rowKey: 1, onRowsChange: 1, size: 1, stickyHeader: 1, containerProps: 1, loading: 1, busy: 1, loadingRows: 1, loadingLabel: 1, message: 1, className: 1, onKeyDown: 1, onCopy: 1, onPaste: 1 };
var textOf = (col, row) => col.format ? col.format(row) : row[col.key] == null ? "" : String(row[col.key]);
var parseTsv = (text) => text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((l) => l.split("	"));
var DataGrid = /* @__PURE__ */ component("DataGrid", function DataGrid2(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels, locale = useLocale();
  const base = domId("dk-dg", React.useId());
  const { columns, rows } = props;
  const key = props.rowKey || "id";
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const canEdit = !!props.onRowsChange;
  const lastRow = rows.length;
  const lastCol = columns.length - 1;
  const [at, setAt] = React.useState({ r: rows.length ? 1 : 0, c: 0 });
  const [anchor, setAnchor] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const table = React.useRef(null);
  const focusCell = React.useRef(false);
  const cur = { r: Math.min(at.r, lastRow), c: Math.min(at.c, Math.max(lastCol, 0)) };
  const from = anchor && { r: Math.min(anchor.r, lastRow), c: Math.min(anchor.c, Math.max(lastCol, 0)) };
  const range = from ? { r1: Math.max(1, Math.min(from.r, cur.r)), r2: Math.max(from.r, cur.r), c1: Math.min(from.c, cur.c), c2: Math.max(from.c, cur.c) } : cur.r > 0 ? { r1: cur.r, r2: cur.r, c1: cur.c, c2: cur.c } : null;
  const cellEl = (p) => table.current && table.current.querySelector(`[data-cell="${p.r}-${p.c}"]`);
  React.useEffect(() => {
    if (!focusCell.current || edit) return;
    focusCell.current = false;
    cellEl(cur)?.focus();
  });
  const move = (p, extend) => {
    const next = { r: Math.max(0, Math.min(lastRow, p.r)), c: Math.max(0, Math.min(lastCol, p.c)) };
    setAnchor(extend ? anchor || cur : null);
    setAt(next);
    focusCell.current = true;
  };
  const editable = (p) => canEdit && p.r > 0 && !!columns[p.c]?.editable;
  const cellAt = (r, c) => {
    const row = rows[r - 1], col = columns[c];
    return row && col ? { row, col } : null;
  };
  const cellText = (r, c) => {
    const at2 = cellAt(r, c);
    return at2 ? textOf(at2.col, at2.row) : "";
  };
  const change = (changes) => {
    if (!changes.length || !props.onRowsChange) return;
    const next = rows.map((row) => {
      const mine = changes.filter((x) => x.rowId === String(row[key]));
      if (!mine.length) return row;
      const copy = { ...row };
      for (const x of mine) copy[x.column] = x.value;
      return copy;
    });
    props.onRowsChange(next, { changes });
  };
  const save = (text, then) => {
    const row = rows[cur.r - 1], col = columns[cur.c];
    if (row && col && text !== textOf(col, row)) change([{ rowId: String(row[key]), column: col.key, value: text }]);
    setEdit(null);
    focusCell.current = true;
    if (then) move(then, false);
  };
  const rtl = () => !!table.current && getComputedStyle(table.current).direction === "rtl";
  const onKeyDown = (e) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented || edit || isComposing(e)) return;
    const ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey, back = rtl() ? 1 : -1;
    const go = (p) => {
      e.preventDefault();
      move(p, shift);
    };
    switch (e.key) {
      case "ArrowDown":
        return go({ r: cur.r + 1, c: cur.c });
      case "ArrowUp":
        return go({ r: cur.r - 1, c: cur.c });
      case "ArrowRight":
        return go({ r: cur.r, c: ctrl ? back < 0 ? lastCol : 0 : cur.c - back });
      case "ArrowLeft":
        return go({ r: cur.r, c: ctrl ? back < 0 ? 0 : lastCol : cur.c + back });
      case "Home":
        return go(ctrl ? { r: 1, c: 0 } : { r: cur.r, c: 0 });
      case "End":
        return go(ctrl ? { r: lastRow, c: lastCol } : { r: cur.r, c: lastCol });
      case "PageDown":
        return go({ r: cur.r + 10, c: cur.c });
      case "PageUp":
        return go({ r: Math.max(1, cur.r - 10), c: cur.c });
    }
    if (ctrl && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setAnchor({ r: 1, c: 0 });
      setAt({ r: lastRow, c: lastCol });
      return;
    }
    if (ctrl || e.altKey) return;
    if ((e.key === "Enter" || e.key === "F2") && editable(cur)) {
      e.preventDefault();
      setEdit({ text: cellText(cur.r, cur.c) });
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && range) {
      e.preventDefault();
      const list = [];
      for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) {
        const at2 = cellAt(r, c);
        if (at2 && editable({ r, c }) && textOf(at2.col, at2.row)) list.push({ rowId: String(at2.row[key]), column: at2.col.key, value: "" });
      }
      change(list);
      return;
    }
    if (e.key.length === 1 && e.key !== " " && editable(cur)) {
      e.preventDefault();
      setEdit({ text: e.key });
    }
  };
  const onCopy = (e) => {
    props.onCopy?.(e);
    if (edit || !range || e.defaultPrevented) return;
    const lines = [];
    for (let r = range.r1; r <= range.r2; r++) {
      const row = rows[r - 1];
      if (row) lines.push(columns.slice(range.c1, range.c2 + 1).map((col) => textOf(col, row)).join("	"));
    }
    e.preventDefault();
    e.clipboardData.setData("text/plain", lines.join("\n"));
    const cells = (range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1);
    announce(L.dataGridCopied(cells, displayNumber(cells, locale)));
  };
  const onPaste = (e) => {
    props.onPaste?.(e);
    if (edit || e.defaultPrevented || cur.r < 1) return;
    e.preventDefault();
    const block = parseTsv(e.clipboardData.getData("text/plain"));
    const lone = block.length === 1 && block[0]?.length === 1 ? block[0][0] : void 0, one = lone !== void 0 && range;
    const list = [];
    const put = (r, c, v) => {
      const at2 = cellAt(r, c);
      if (at2 && editable({ r, c })) list.push({ rowId: String(at2.row[key]), column: at2.col.key, value: v });
    };
    if (one) {
      for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) put(r, c, lone);
    } else {
      const r0 = range ? range.r1 : cur.r, c0 = range ? range.c1 : cur.c;
      block.forEach((line, i) => line.forEach((v, j) => put(r0 + i, c0 + j, v)));
    }
    change(list);
    if (list.length) announce(L.dataGridPasted(list.length, displayNumber(list.length, locale)));
  };
  const pick = (p, e) => {
    if (edit) return;
    move(p, e.shiftKey && p.r > 0);
  };
  const tabStop = (r, c) => r === cur.r && c === cur.c ? 0 : -1;
  const frame = React.useRef(null);
  useStickyHead(frame, !!props.stickyHeader, "thead", "--dk-data-grid-head");
  if (process.env.NODE_ENV !== "production" && props.busy != null) warnOnce("data-grid-busy", "DataGrid: busy is deprecated and removed in 15.0.0. Use loading, which does the same.");
  const loading = !!(props.loading ?? props.busy);
  const placeholders = !rows.length && loading ? Math.min(50, Math.max(1, Math.floor(Number(props.loadingRows)) || 3)) : 0;
  const message = !rows.length && !placeholders && props.message != null && props.message !== false ? props.message : null;
  const latest = React.useRef({ pick, save, editable, lastRow, edit });
  latest.current = { pick, save, editable, lastRow, edit };
  const api = React.useMemo(() => ({
    pick: (p, e) => latest.current.pick(p, e),
    begin: (p, text) => {
      if (latest.current.editable(p)) setEdit({ text });
    },
    save: (text, then) => latest.current.save(text, then && { r: Math.min(then.r, latest.current.lastRow), c: Math.max(0, then.c) }),
    blur: (text) => {
      if (latest.current.edit) latest.current.save(text, null);
    },
    cancel: () => {
      setEdit(null);
      focusCell.current = true;
    }
  }), []);
  const cp = props.containerProps || {};
  return /* @__PURE__ */ React.createElement("div", { ...cp, ref: frame, className: cn("dk-data-grid", size !== "md" && "dk-data-grid--" + size, props.stickyHeader && "dk-data-grid--sticky", props.className, cp.className), "data-component": "data-grid" }, /* @__PURE__ */ React.createElement(
    "table",
    {
      ...rest,
      ref: (n) => {
        table.current = n;
        setRef(ref, n);
      },
      role: "grid",
      "aria-busy": loading || void 0,
      "aria-rowcount": placeholders ? -1 : rows.length + 1,
      "aria-colcount": columns.length,
      "aria-multiselectable": "true",
      "aria-describedby": cn(base + "-hint", props["aria-describedby"]) || void 0,
      className: "dk-data-grid__table",
      onKeyDown,
      onCopy,
      onPaste
    },
    /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": 1 }, columns.map((col, c) => /* @__PURE__ */ React.createElement(
      "th",
      {
        key: col.key,
        role: "columnheader",
        scope: "col",
        "aria-colindex": c + 1,
        tabIndex: tabStop(0, c),
        "data-cell": `0-${c}`,
        className: cn("dk-data-grid__header", col.align && col.align !== "start" && "dk-data-grid__cell--" + col.align),
        style: col.width != null ? { width: col.width } : void 0,
        onClick: (e) => pick({ r: 0, c }, e)
      },
      col.header
    )))),
    /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, i) => {
      const r = i + 1, inside = !!range && r >= range.r1 && r <= range.r2;
      return /* @__PURE__ */ React.createElement(
        GridRow,
        {
          key: String(row[key]),
          row,
          r,
          columns,
          api,
          active: r === cur.r ? cur.c : -1,
          c1: inside ? range.c1 : -1,
          c2: inside ? range.c2 : -1,
          edit: r === cur.r ? edit : null,
          canEdit,
          editLabel: L.dataGridEdit
        }
      );
    }), placeholders ? /* @__PURE__ */ React.createElement(LoadingRows, { rows: placeholders, columns, label: props.loadingLabel == null ? L.loading : props.loadingLabel }) : null, message != null && /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": 2 }, /* @__PURE__ */ React.createElement("td", { role: "gridcell", colSpan: columns.length, "aria-colspan": columns.length, className: "dk-data-grid__cell dk-data-grid__message" }, message)))
  ), /* @__PURE__ */ React.createElement("p", { hidden: true, id: base + "-hint" }, L.dataGridHint));
});
var GridRow = /* @__PURE__ */ React.memo(function GridRow2(p) {
  const { row, r, api } = p;
  return /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": r + 1 }, p.columns.map((col, c) => {
    const active = c === p.active, sel = c >= p.c1 && c <= p.c2 && p.c1 >= 0;
    const editing = active && p.edit;
    return /* @__PURE__ */ React.createElement(
      "td",
      {
        key: col.key,
        role: "gridcell",
        "aria-colindex": c + 1,
        tabIndex: active && !editing ? 0 : -1,
        "data-cell": `${r}-${c}`,
        "aria-selected": sel,
        "aria-readonly": p.canEdit && !col.editable ? true : void 0,
        className: cn("dk-data-grid__cell", col.align && col.align !== "start" && "dk-data-grid__cell--" + col.align, sel && "dk-data-grid__cell--selected", editing && "dk-data-grid__cell--editing"),
        onClick: (e) => api.pick({ r, c }, e),
        onDoubleClick: () => api.begin({ r, c }, textOf(col, row))
      },
      editing ? /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "dk-data-grid__input",
          "aria-label": p.editLabel(col.header),
          ref: (n) => {
            if (n && document.activeElement !== n) n.focus();
          },
          defaultValue: editing.text,
          onFocus: (e) => {
            const n = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(n, n);
          },
          onBlur: (e) => api.blur(e.currentTarget.value),
          onKeyDown: (e) => {
            if (isComposing(e)) return;
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              api.cancel();
            } else if (e.key === "Enter") {
              e.preventDefault();
              api.save(e.currentTarget.value, { r: r + 1, c });
            } else if (e.key === "Tab") {
              e.preventDefault();
              api.save(e.currentTarget.value, { r, c: Math.min(p.columns.length - 1, c + (e.shiftKey ? -1 : 1)) });
            }
          }
        }
      ) : textOf(col, row)
    );
  }));
});
function LoadingRows(props) {
  const waiting = !useSkeletonShown(props.label);
  return Array.from({ length: props.rows }, (_, r) => /* @__PURE__ */ React.createElement("tr", { key: "loading-" + r, role: "row", className: "dk-data-grid__loading" }, props.columns.map((col) => /* @__PURE__ */ React.createElement("td", { key: col.key, role: "gridcell", className: "dk-data-grid__cell" }, /* @__PURE__ */ React.createElement(SkeletonArt, { waiting })))));
}
export {
  DataGrid
};
//# sourceMappingURL=DataGrid.js.map
