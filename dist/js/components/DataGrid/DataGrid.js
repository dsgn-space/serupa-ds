"use client";

// src/components/DataGrid/DataGrid.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { en as words } from "./labels.js";
import { useStickyHead } from "../../internal/stickyHead.js";
var OWN = { columns: 1, rows: 1, rowKey: 1, onRowsChange: 1, size: 1, stickyHeader: 1, containerProps: 1, busy: 1, loadingRows: 1, loadingLabel: 1, message: 1, className: 1, onKeyDown: 1, onCopy: 1, onPaste: 1 };
var textOf = (col, row) => col.format ? col.format(row) : row[col.key] == null ? "" : String(row[col.key]);
var parseTsv = (text) => text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((l) => l.split("	"));
var DataGrid = /* @__PURE__ */ component("DataGrid", function DataGrid2(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
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
  const range = anchor ? { r1: Math.max(1, Math.min(anchor.r, cur.r)), r2: Math.max(anchor.r, cur.r), c1: Math.min(anchor.c, cur.c), c2: Math.max(anchor.c, cur.c) } : cur.r > 0 ? { r1: cur.r, r2: cur.r, c1: cur.c, c2: cur.c } : null;
  const inRange = (r, c) => !!range && r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2;
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
  const editable = (p) => canEdit && p.r > 0 && !!columns[p.c] && !!columns[p.c].editable;
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
      setEdit({ text: textOf(columns[cur.c], rows[cur.r - 1]) });
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && range) {
      e.preventDefault();
      const list = [];
      for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) if (editable({ r, c }) && textOf(columns[c], rows[r - 1])) list.push({ rowId: String(rows[r - 1][key]), column: columns[c].key, value: "" });
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
    for (let r = range.r1; r <= range.r2; r++) lines.push(columns.slice(range.c1, range.c2 + 1).map((col) => textOf(col, rows[r - 1])).join("	"));
    e.preventDefault();
    e.clipboardData.setData("text/plain", lines.join("\n"));
    announce(L.dataGridCopied((range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1)));
  };
  const onPaste = (e) => {
    props.onPaste?.(e);
    if (edit || e.defaultPrevented || cur.r < 1) return;
    e.preventDefault();
    const block = parseTsv(e.clipboardData.getData("text/plain"));
    const one = block.length === 1 && block[0].length === 1 && range;
    const list = [];
    const put = (r, c, v) => {
      if (r <= lastRow && c <= lastCol && editable({ r, c })) list.push({ rowId: String(rows[r - 1][key]), column: columns[c].key, value: v });
    };
    if (one) {
      for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) put(r, c, block[0][0]);
    } else {
      const r0 = range ? range.r1 : cur.r, c0 = range ? range.c1 : cur.c;
      block.forEach((line, i) => line.forEach((v, j) => put(r0 + i, c0 + j, v)));
    }
    change(list);
    if (list.length) announce(L.dataGridPasted(list.length));
  };
  const pick = (p, e) => {
    if (edit) return;
    move(p, e.shiftKey && p.r > 0);
  };
  const tabStop = (r, c) => r === cur.r && c === cur.c ? 0 : -1;
  const frame = React.useRef(null);
  useStickyHead(frame, !!props.stickyHeader, "thead", "--dk-data-grid-head");
  const placeholders = !rows.length && props.busy ? Math.min(50, Math.max(1, Math.floor(Number(props.loadingRows)) || 3)) : 0;
  const message = !rows.length && !placeholders && props.message != null && props.message !== false ? props.message : null;
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
      "aria-busy": props.busy || void 0,
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
      const r = i + 1;
      return /* @__PURE__ */ React.createElement("tr", { key: String(row[key]), role: "row", "aria-rowindex": r + 1 }, columns.map((col, c) => {
        const active = r === cur.r && c === cur.c, sel = inRange(r, c);
        const editing = active && edit;
        return /* @__PURE__ */ React.createElement(
          "td",
          {
            key: col.key,
            role: "gridcell",
            "aria-colindex": c + 1,
            tabIndex: editing ? -1 : tabStop(r, c),
            "data-cell": `${r}-${c}`,
            "aria-selected": sel,
            "aria-readonly": canEdit && !col.editable ? true : void 0,
            className: cn("dk-data-grid__cell", col.align && col.align !== "start" && "dk-data-grid__cell--" + col.align, sel && "dk-data-grid__cell--selected", editing && "dk-data-grid__cell--editing"),
            onClick: (e) => pick({ r, c }, e),
            onDoubleClick: () => {
              if (editable({ r, c })) setEdit({ text: textOf(col, row) });
            }
          },
          editing ? /* @__PURE__ */ React.createElement(
            "input",
            {
              className: "dk-data-grid__input",
              "aria-label": L.dataGridEdit(col.header),
              ref: (n) => {
                if (n && document.activeElement !== n) n.focus();
              },
              defaultValue: edit.text,
              onFocus: (e) => {
                const n = e.currentTarget.value.length;
                e.currentTarget.setSelectionRange(n, n);
              },
              onBlur: (e) => {
                if (edit) save(e.currentTarget.value, null);
              },
              onKeyDown: (e) => {
                if (isComposing(e)) return;
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setEdit(null);
                  focusCell.current = true;
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  save(e.currentTarget.value, { r: Math.min(r + 1, lastRow), c });
                } else if (e.key === "Tab") {
                  e.preventDefault();
                  save(e.currentTarget.value, { r, c: Math.max(0, Math.min(lastCol, c + (e.shiftKey ? -1 : 1))) });
                }
              }
            }
          ) : textOf(col, row)
        );
      }));
    }), placeholders ? /* @__PURE__ */ React.createElement(LoadingRows, { rows: placeholders, columns, label: props.loadingLabel == null ? L.loading : props.loadingLabel }) : null, message != null && /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": 2 }, /* @__PURE__ */ React.createElement("td", { role: "gridcell", colSpan: columns.length, "aria-colspan": columns.length, className: "dk-data-grid__cell dk-data-grid__message" }, message)))
  ), /* @__PURE__ */ React.createElement("p", { hidden: true, id: base + "-hint" }, L.dataGridHint));
});
function LoadingRows(props) {
  const waiting = !useSkeletonShown(props.label);
  return Array.from({ length: props.rows }, (_, r) => /* @__PURE__ */ React.createElement("tr", { key: "loading-" + r, role: "row", className: "dk-data-grid__loading" }, props.columns.map((col) => /* @__PURE__ */ React.createElement("td", { key: col.key, role: "gridcell", className: "dk-data-grid__cell" }, /* @__PURE__ */ React.createElement(SkeletonArt, { waiting })))));
}
export {
  DataGrid
};
//# sourceMappingURL=DataGrid.js.map
