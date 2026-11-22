"use client";

// src/components/DataGrid/DataGrid.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, setRef, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { en as words } from "./labels.js";
import { useStickyHead } from "../../internal/stickyHead.js";
import { useClipboardHandOn } from "../../internal/clipboardHandOn.js";
import { isRtl } from "../../internal/position.js";
var OWN = {
  columns: 1,
  rows: 1,
  rowKey: 1,
  onRowsChange: 1,
  size: 1,
  stickyHeader: 1,
  containerProps: 1,
  loading: 1,
  loadingRows: 1,
  loadingLabel: 1,
  message: 1,
  className: 1,
  onKeyDown: 1,
  onCopy: 1,
  onPaste: 1
};
var textOf = (col, row) => col.format ? col.format(row) : row[col.key] == null ? "" : String(row[col.key]);
var parseTsv = (text) => text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((l) => l.split("	"));
function DataGridRender(t0) {
  const $ = _c(28);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const locale = useLocale();
  const base = domId("srp-dg", React.useId());
  const {
    columns,
    rows
  } = props;
  const key = props.rowKey || "id";
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const canEdit = !!props.onRowsChange;
  const lastRow = rows.length;
  const lastCol = columns.length - 1;
  const t1 = rows.length ? 1 : 0;
  let t2;
  if ($[0] !== t1) {
    t2 = {
      r: t1,
      c: 0
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const [at, setAt] = React.useState(t2);
  const [anchor, setAnchor] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const table = React.useRef(null);
  const focusCell = React.useRef(false);
  const cur = {
    r: Math.min(at.r, lastRow),
    c: Math.min(at.c, Math.max(lastCol, 0))
  };
  const from = anchor && {
    r: Math.min(anchor.r, lastRow),
    c: Math.min(anchor.c, Math.max(lastCol, 0))
  };
  const range = from ? {
    r1: Math.max(1, Math.min(from.r, cur.r)),
    r2: Math.max(from.r, cur.r),
    c1: Math.min(from.c, cur.c),
    c2: Math.max(from.c, cur.c)
  } : cur.r > 0 ? {
    r1: cur.r,
    r2: cur.r,
    c1: cur.c,
    c2: cur.c
  } : null;
  const cellEl = (p) => table.current && table.current.querySelector(`[data-cell="${p.r}-${p.c}"]`);
  React.useEffect(() => {
    if (!focusCell.current || edit) {
      return;
    }
    focusCell.current = false;
    cellEl(cur)?.focus();
  });
  const move = (p_0, extend) => {
    const next = {
      r: Math.max(0, Math.min(lastRow, p_0.r)),
      c: Math.max(0, Math.min(lastCol, p_0.c))
    };
    setAnchor(extend ? anchor || cur : null);
    setAt(next);
    focusCell.current = true;
  };
  const editable = (p_1) => canEdit && p_1.r > 0 && !!columns[p_1.c]?.editable;
  const cellAt = (r, c) => {
    const row = rows[r - 1];
    const col = columns[c];
    return row && col ? {
      row,
      col
    } : null;
  };
  const cellText = (r_0, c_0) => {
    const at_0 = cellAt(r_0, c_0);
    return at_0 ? textOf(at_0.col, at_0.row) : "";
  };
  const change = (changes) => {
    if (!changes.length || !props.onRowsChange) {
      return;
    }
    const next_0 = rows.map((row_0) => {
      const mine = changes.filter((x) => x.rowId === String(row_0[key]));
      if (!mine.length) {
        return row_0;
      }
      const copy = {
        ...row_0
      };
      for (const x_0 of mine) {
        copy[x_0.column] = x_0.value;
      }
      return copy;
    });
    props.onRowsChange(next_0, {
      changes
    });
  };
  const save = (text, then) => {
    const row_1 = rows[cur.r - 1];
    const col_0 = columns[cur.c];
    if (row_1 && col_0 && text !== textOf(col_0, row_1)) {
      change([{
        rowId: String(row_1[key]),
        column: col_0.key,
        value: text
      }]);
    }
    setEdit(null);
    focusCell.current = true;
    if (then) {
      move(then, false);
    }
  };
  const rtl = () => !!table.current && isRtl(table.current);
  const onKeyDown = (e) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented || edit || isComposing(e)) {
      return;
    }
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const back = rtl() ? 1 : -1;
    const go = (p_2) => {
      e.preventDefault();
      move(p_2, shift);
    };
    switch (e.key) {
      case "ArrowDown": {
        return go({
          r: cur.r + 1,
          c: cur.c
        });
      }
      case "ArrowUp": {
        return go({
          r: cur.r - 1,
          c: cur.c
        });
      }
      case "ArrowRight": {
        return go({
          r: cur.r,
          c: ctrl ? back < 0 ? lastCol : 0 : cur.c - back
        });
      }
      case "ArrowLeft": {
        return go({
          r: cur.r,
          c: ctrl ? back < 0 ? 0 : lastCol : cur.c + back
        });
      }
      case "Home": {
        return go(ctrl ? {
          r: 1,
          c: 0
        } : {
          r: cur.r,
          c: 0
        });
      }
      case "End": {
        return go(ctrl ? {
          r: lastRow,
          c: lastCol
        } : {
          r: cur.r,
          c: lastCol
        });
      }
      case "PageDown": {
        return go({
          r: cur.r + 10,
          c: cur.c
        });
      }
      case "PageUp": {
        return go({
          r: Math.max(1, cur.r - 10),
          c: cur.c
        });
      }
    }
    if (ctrl && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setAnchor({
        r: 1,
        c: 0
      });
      setAt({
        r: lastRow,
        c: lastCol
      });
      return;
    }
    if (ctrl || e.altKey) {
      return;
    }
    if ((e.key === "Enter" || e.key === "F2") && editable(cur)) {
      e.preventDefault();
      setEdit({
        text: cellText(cur.r, cur.c)
      });
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && range) {
      e.preventDefault();
      const list = [];
      for (let r_1 = range.r1; r_1 <= range.r2; r_1++) {
        for (let c_1 = range.c1; c_1 <= range.c2; c_1++) {
          const at_1 = cellAt(r_1, c_1);
          if (at_1 && editable({
            r: r_1,
            c: c_1
          }) && textOf(at_1.col, at_1.row)) {
            list.push({
              rowId: String(at_1.row[key]),
              column: at_1.col.key,
              value: ""
            });
          }
        }
      }
      change(list);
      return;
    }
    if (e.key.length === 1 && e.key !== " " && editable(cur)) {
      e.preventDefault();
      setEdit({
        text: e.key
      });
    }
  };
  const onCopy = (e_0) => {
    props.onCopy?.(e_0);
    if (edit || !range || e_0.defaultPrevented) {
      return;
    }
    const lines = [];
    for (let r_2 = range.r1; r_2 <= range.r2; r_2++) {
      const row_2 = rows[r_2 - 1];
      if (row_2) {
        lines.push(columns.slice(range.c1, range.c2 + 1).map((col_1) => textOf(col_1, row_2)).join("	"));
      }
    }
    e_0.preventDefault();
    e_0.clipboardData.setData("text/plain", lines.join("\n"));
    const cells = (range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1);
    announce(L.dataGridCopied(cells, displayNumber(cells, locale)));
  };
  const onPaste = (e_1) => {
    props.onPaste?.(e_1);
    if (edit || e_1.defaultPrevented || cur.r < 1) {
      return;
    }
    e_1.preventDefault();
    const block = parseTsv(e_1.clipboardData.getData("text/plain"));
    const lone = block.length === 1 && block[0]?.length === 1 ? block[0][0] : void 0;
    const one = lone !== void 0 && range;
    const list_0 = [];
    const put = (r_3, c_2, v) => {
      const at_2 = cellAt(r_3, c_2);
      if (at_2 && editable({
        r: r_3,
        c: c_2
      })) {
        list_0.push({
          rowId: String(at_2.row[key]),
          column: at_2.col.key,
          value: v
        });
      }
    };
    if (one) {
      for (let r_4 = range.r1; r_4 <= range.r2; r_4++) {
        for (let c_3 = range.c1; c_3 <= range.c2; c_3++) {
          put(r_4, c_3, lone);
        }
      }
    } else {
      const r0 = range ? range.r1 : cur.r;
      const c0 = range ? range.c1 : cur.c;
      block.forEach((line, i) => line.forEach((v_0, j) => put(r0 + i, c0 + j, v_0)));
    }
    change(list_0);
    if (list_0.length) {
      announce(L.dataGridPasted(list_0.length, displayNumber(list_0.length, locale)));
    }
  };
  useClipboardHandOn(table);
  const pick = (p_3, e_2) => {
    if (edit) {
      return;
    }
    move(p_3, e_2.shiftKey && p_3.r > 0);
  };
  const tabStop = (r_5, c_4) => r_5 === cur.r && c_4 === cur.c ? 0 : -1;
  const frame = React.useRef(null);
  useStickyHead(frame, !!props.stickyHeader, "thead", "--srp-data-grid-head");
  const loading = !!props.loading;
  const placeholders = !rows.length && loading ? Math.min(50, Math.max(1, Math.floor(Number(props.loadingRows)) || 3)) : 0;
  const message = !rows.length && !placeholders && props.message != null && props.message !== false ? props.message : null;
  const latest = useLatest({
    pick,
    save,
    editable,
    lastRow,
    edit
  });
  let t3;
  let t4;
  let t5;
  let t6;
  if ($[2] !== latest) {
    t3 = (p_4, e_3) => latest.current.pick(p_4, e_3);
    t4 = (p_5, text_0) => {
      if (latest.current.editable(p_5)) {
        setEdit({
          text: text_0
        });
      }
    };
    t5 = (text_1, then_0) => latest.current.save(text_1, then_0 && {
      r: Math.min(then_0.r, latest.current.lastRow),
      c: Math.max(0, then_0.c)
    });
    t6 = (text_2) => {
      if (latest.current.edit) {
        latest.current.save(text_2, null);
      }
    };
    $[2] = latest;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
    $[6] = t6;
  } else {
    t3 = $[3];
    t4 = $[4];
    t5 = $[5];
    t6 = $[6];
  }
  let t7;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      setEdit(null);
      focusCell.current = true;
    };
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== t3 || $[9] !== t4 || $[10] !== t5 || $[11] !== t6) {
    t8 = {
      pick: t3,
      begin: t4,
      save: t5,
      blur: t6,
      cancel: t7
    };
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
    $[11] = t6;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  const api = t8;
  const cp = props.containerProps || {};
  const t9 = cn("srp-data-grid", size !== "md" && "srp-data-grid--" + size, props.stickyHeader && "srp-data-grid--sticky", props.className, cp.className);
  const t10 = columns.length;
  const t11 = rows.map((row_3, i_0) => {
    const r_6 = i_0 + 1;
    const inside = !!range && r_6 >= range.r1 && r_6 <= range.r2;
    return /* @__PURE__ */ React.createElement(GridRow, { key: String(row_3[key]), row: row_3, r: r_6, columns, api, active: r_6 === cur.r ? cur.c : -1, c1: inside ? range.c1 : -1, c2: inside ? range.c2 : -1, edit: r_6 === cur.r ? edit : null, canEdit, editLabel: L.dataGridEdit });
  });
  let t12;
  if ($[13] !== L.loading || $[14] !== columns || $[15] !== placeholders || $[16] !== props) {
    t12 = placeholders ? /* @__PURE__ */ React.createElement(LoadingRows, { rows: placeholders, columns, label: props.loadingLabel == null ? L.loading : props.loadingLabel }) : null;
    $[13] = L.loading;
    $[14] = columns;
    $[15] = placeholders;
    $[16] = props;
    $[17] = t12;
  } else {
    t12 = $[17];
  }
  let t13;
  if ($[18] !== columns || $[19] !== message) {
    t13 = message != null && /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": 2 }, /* @__PURE__ */ React.createElement("td", { role: "gridcell", colSpan: columns.length, "aria-colspan": columns.length, className: "srp-data-grid__cell srp-data-grid__message" }, message));
    $[18] = columns;
    $[19] = message;
    $[20] = t13;
  } else {
    t13 = $[20];
  }
  let t14;
  if ($[21] !== t11 || $[22] !== t12 || $[23] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("tbody", null, t11, t12, t13);
    $[21] = t11;
    $[22] = t12;
    $[23] = t13;
    $[24] = t14;
  } else {
    t14 = $[24];
  }
  const t15 = base + "-hint";
  let t16;
  if ($[25] !== L.dataGridHint || $[26] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("p", { hidden: true, id: t15 }, L.dataGridHint);
    $[25] = L.dataGridHint;
    $[26] = t15;
    $[27] = t16;
  } else {
    t16 = $[27];
  }
  return /* @__PURE__ */ React.createElement("div", { ...cp, ref: frame, className: t9, "data-component": "data-grid", "data-range": range && range.r1 === range.r2 && range.c1 === range.c2 ? "cell" : void 0 }, /* @__PURE__ */ React.createElement("table", { ...rest, ref: (n) => {
    table.current = n;
    setRef(ref, n);
  }, role: "grid", "aria-busy": loading || void 0, "aria-rowcount": placeholders ? -1 : rows.length + 1, "aria-colcount": t10, "aria-multiselectable": "true", "aria-describedby": cn(base + "-hint", props["aria-describedby"]) || void 0, className: "srp-data-grid__table", onKeyDown, onCopy, onPaste }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": 1 }, columns.map((col_2, c_5) => /* @__PURE__ */ React.createElement("th", { key: col_2.key, role: "columnheader", scope: "col", "aria-colindex": c_5 + 1, tabIndex: tabStop(0, c_5), "data-cell": `0-${c_5}`, className: cn("srp-data-grid__header", col_2.align && col_2.align !== "start" && "srp-data-grid__cell--" + col_2.align), style: col_2.width != null ? {
    width: col_2.width
  } : void 0, onClick: (e_4) => pick({
    r: 0,
    c: c_5
  }, e_4) }, col_2.header)))), t14), t16);
}
var DataGrid = /* @__PURE__ */ named("DataGrid", DataGridRender);
var GridRow = /* @__PURE__ */ React.memo(function GridRow2(p) {
  const $ = _c(8);
  const {
    row,
    r,
    api
  } = p;
  const t0 = r + 1;
  let t1;
  if ($[0] !== api || $[1] !== p || $[2] !== r || $[3] !== row) {
    t1 = p.columns.map((col, c) => {
      const active = c === p.active;
      const sel = c >= p.c1 && c <= p.c2 && p.c1 >= 0;
      const editing = active && p.edit;
      return /* @__PURE__ */ React.createElement("td", { key: col.key, role: "gridcell", "aria-colindex": c + 1, tabIndex: active && !editing ? 0 : -1, "data-cell": `${r}-${c}`, "aria-selected": sel, "aria-readonly": p.canEdit && !col.editable ? true : void 0, className: cn("srp-data-grid__cell", col.align && col.align !== "start" && "srp-data-grid__cell--" + col.align, sel && "srp-data-grid__cell--selected", editing && "srp-data-grid__cell--editing"), onClick: (e) => api.pick({
        r,
        c
      }, e), onDoubleClick: () => api.begin({
        r,
        c
      }, textOf(col, row)) }, editing ? /* @__PURE__ */ React.createElement("input", { className: "srp-data-grid__input", "aria-label": p.editLabel(col.header), ref: _temp, defaultValue: editing.text, onFocus: _temp2, onBlur: (e_1) => api.blur(e_1.currentTarget.value), onKeyDown: (e_2) => {
        if (isComposing(e_2)) {
          return;
        }
        if (e_2.key === "Escape") {
          e_2.preventDefault();
          e_2.stopPropagation();
          api.cancel();
        } else {
          if (e_2.key === "Enter") {
            e_2.preventDefault();
            api.save(e_2.currentTarget.value, {
              r: r + 1,
              c
            });
          } else {
            if (e_2.key === "Tab") {
              e_2.preventDefault();
              api.save(e_2.currentTarget.value, {
                r,
                c: Math.min(p.columns.length - 1, c + (e_2.shiftKey ? -1 : 1))
              });
            }
          }
        }
      } }) : textOf(col, row));
    });
    $[0] = api;
    $[1] = p;
    $[2] = r;
    $[3] = row;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== t0 || $[6] !== t1) {
    t2 = /* @__PURE__ */ React.createElement("tr", { role: "row", "aria-rowindex": t0 }, t1);
    $[5] = t0;
    $[6] = t1;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  return t2;
});
function LoadingRows(props) {
  const $ = _c(7);
  const waiting = !useSkeletonShown(props.label);
  let t0;
  if ($[0] !== props.columns || $[1] !== props.rows || $[2] !== waiting) {
    let t1;
    if ($[4] !== props.columns || $[5] !== waiting) {
      t1 = (_, r) => /* @__PURE__ */ React.createElement("tr", { key: "loading-" + r, role: "row", className: "srp-data-grid__loading" }, props.columns.map((col) => /* @__PURE__ */ React.createElement("td", { key: col.key, role: "gridcell", className: "srp-data-grid__cell" }, /* @__PURE__ */ React.createElement(SkeletonArt, { waiting }))));
      $[4] = props.columns;
      $[5] = waiting;
      $[6] = t1;
    } else {
      t1 = $[6];
    }
    t0 = Array.from({
      length: props.rows
    }, t1);
    $[0] = props.columns;
    $[1] = props.rows;
    $[2] = waiting;
    $[3] = t0;
  } else {
    t0 = $[3];
  }
  return t0;
}
function _temp(n) {
  if (n && document.activeElement !== n) {
    n.focus();
  }
}
function _temp2(e_0) {
  const n_0 = e_0.currentTarget.value.length;
  e_0.currentTarget.setSelectionRange(n_0, n_0);
}
export {
  DataGrid
};
//# sourceMappingURL=DataGrid.js.map
