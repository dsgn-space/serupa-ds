"use client";

// src/components/Kanban/Kanban.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
var EDGE = 48;
var STEP = 16;
var SLOP = 4;
function KanbanLoadingCards(props) {
  const $ = _c(3);
  const waiting = !useSkeletonShown(props.label);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = [0, 1];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] !== waiting) {
    t1 = /* @__PURE__ */ React.createElement(React.Fragment, null, t0.map((i) => /* @__PURE__ */ React.createElement("li", { key: i, className: "srp-kanban__card srp-kanban__loading" }, /* @__PURE__ */ React.createElement(SkeletonArt, { lines: 2, waiting }))));
    $[1] = waiting;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  return t1;
}
function moveCard(columns, from, to) {
  const out = columns.map((c) => ({
    ...c,
    items: c.items.slice()
  }));
  const src = out[from.column], dst = out[to.column];
  if (!src || !dst) return out;
  const [it] = src.items.splice(from.index, 1);
  if (it !== void 0) dst.items.splice(Math.min(to.index, dst.items.length), 0, it);
  return out;
}
var KanbanCard = /* @__PURE__ */ React.memo(function KanbanCard2(props) {
  const $ = _c(33);
  const {
    itemKey: key,
    name,
    api,
    labels: L
  } = props;
  const t0 = String(key);
  const t1 = props.dragging && "srp-kanban__card--dragging";
  let t2;
  if ($[0] !== t1) {
    t2 = cn("srp-kanban__card", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = props.dragging ? "dragging" : void 0;
  let t4;
  if ($[2] !== L || $[3] !== api || $[4] !== key || $[5] !== name || $[6] !== props.disabled || $[7] !== props.hint || $[8] !== props.pressed) {
    t4 = props.disabled ? null : /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-kanban__handle", "aria-label": L.kanbanMove + " " + name, "aria-describedby": props.hint, "aria-pressed": props.pressed, ref: (n) => api.current.handle(key, n), onClick: () => api.current.click(key), onKeyDown: (e) => api.current.keyDown(e), onBlur: () => api.current.blur(), onPointerDown: (e_0) => api.current.pointerDown(key, e_0) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.DragIndicator }));
    $[2] = L;
    $[3] = api;
    $[4] = key;
    $[5] = name;
    $[6] = props.disabled;
    $[7] = props.hint;
    $[8] = props.pressed;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  let t5;
  if ($[10] !== props.column || $[11] !== props.dragging || $[12] !== props.index || $[13] !== props.item || $[14] !== props.renderCard) {
    t5 = props.renderCard(props.item, {
      column: props.column,
      index: props.index,
      dragging: props.dragging
    });
    $[10] = props.column;
    $[11] = props.dragging;
    $[12] = props.index;
    $[13] = props.item;
    $[14] = props.renderCard;
    $[15] = t5;
  } else {
    t5 = $[15];
  }
  let t6;
  if ($[16] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("div", { className: "srp-kanban__content" }, t5);
    $[16] = t5;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  let t7;
  if ($[18] !== L || $[19] !== api || $[20] !== key || $[21] !== name || $[22] !== props.c || $[23] !== props.disabled || $[24] !== props.targets) {
    t7 = props.disabled || props.targets.length < 2 ? null : /* @__PURE__ */ React.createElement(Menu, { placement: "bottom-end", trigger: /* @__PURE__ */ React.createElement(IconButton, { className: "srp-kanban__menu", icon: icons.MoreVert, label: L.kanbanMoveTo(name), size: "sm", variant: "ghost" }) }, props.targets.map((target, t) => t === props.c ? null : /* @__PURE__ */ React.createElement(MenuItem, { key: target.id, onSelect: () => api.current.moveTo(key, t) }, target.title)));
    $[18] = L;
    $[19] = api;
    $[20] = key;
    $[21] = name;
    $[22] = props.c;
    $[23] = props.disabled;
    $[24] = props.targets;
    $[25] = t7;
  } else {
    t7 = $[25];
  }
  let t8;
  if ($[26] !== t0 || $[27] !== t2 || $[28] !== t3 || $[29] !== t4 || $[30] !== t6 || $[31] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("li", { "data-key": t0, className: t2, "data-state": t3 }, t4, t6, t7);
    $[26] = t0;
    $[27] = t2;
    $[28] = t3;
    $[29] = t4;
    $[30] = t6;
    $[31] = t7;
    $[32] = t8;
  } else {
    t8 = $[32];
  }
  return t8;
});
function KanbanRender({
  ref,
  ...props
}) {
  const rest = omit(props, {
    columns: 1,
    getKey: 1,
    getLabel: 1,
    renderCard: 1,
    onMove: 1,
    headingLevel: 1,
    disabled: 1,
    loading: 1,
    loadingLabel: 1,
    className: 1
  });
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const {
    getKey,
    getLabel
  } = props;
  const columns = props.columns || [];
  const base = domId("srp-kb", React.useId());
  const [drag, setDrag] = React.useState(null);
  const current = React.useRef(drag);
  current.current = drag;
  const board = React.useRef(null);
  const handles = React.useRef(/* @__PURE__ */ new Map());
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) < 0 ? 3 : props.headingLevel;
  const H = "h" + level;
  const rtl = () => !!board.current && isRtl(board.current);
  const find = (key) => {
    for (const [c, col] of columns.entries()) {
      const i = col.items.findIndex((it) => getKey(it) === key);
      if (i >= 0) return {
        column: c,
        index: i
      };
    }
    return null;
  };
  const from = drag ? find(drag.key) : null;
  const shown = drag && from ? moveCard(columns, from, drag.to) : columns;
  const sizeAt = (to, moving) => (columns[to.column]?.items.length ?? 0) + (moving && from && from.column !== to.column ? 1 : 0);
  const commit = (key_0, to_0) => {
    const at = find(key_0), from_0 = at && columns[at.column], item = at && from_0?.items[at.index], col_0 = columns[to_0.column];
    if (!at || !from_0 || item === void 0 || !col_0) return;
    const name = getLabel(item);
    const total = col_0.items.length + (at.column === to_0.column ? 0 : 1);
    const index = Math.min(to_0.index, total - 1);
    announce(L.kanbanDropped(name, col_0.title, index + 1, total));
    if (at.column !== to_0.column || at.index !== index) props.onMove(moveCard(columns, at, {
      column: to_0.column,
      index
    }), {
      item,
      from: {
        column: from_0.id,
        index: at.index
      },
      to: {
        column: col_0.id,
        index
      }
    });
  };
  const finish = (d, drop) => {
    setDrag(null);
    const at_0 = find(d.key), col_1 = at_0 && columns[at_0.column], item_0 = at_0 && col_1?.items[at_0.index];
    if (!at_0 || !col_1 || item_0 === void 0) return;
    if (drop) commit(d.key, d.to);
    else announce(L.kanbanCancelled(getLabel(item_0), col_1.title, at_0.index + 1, col_1.items.length));
  };
  const dragged = React.useRef(false);
  const onClick = (key_1) => {
    if (props.disabled) return;
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (drag && !drag.pointer) {
      finish(drag, true);
      return;
    }
    const at_1 = find(key_1), col_2 = at_1 && columns[at_1.column], item_1 = at_1 && col_2?.items[at_1.index];
    if (!at_1 || !col_2 || item_1 === void 0) return;
    setDrag({
      key: key_1,
      from: at_1,
      to: at_1,
      pointer: false
    });
    announce(L.kanbanGrabbed(getLabel(item_1), col_2.title, at_1.index + 1, col_2.items.length));
  };
  const onKeyDown = (e) => {
    if (!drag || drag.pointer || !from || isComposing(e) || modified(e)) return;
    const k = e.key, back = rtl() ? "ArrowRight" : "ArrowLeft", on = rtl() ? "ArrowLeft" : "ArrowRight";
    let to_1 = drag.to;
    const last = (c_0) => sizeAt({
      column: c_0,
      index: 0
    }, true) - 1;
    if (k === "ArrowUp") to_1 = {
      ...to_1,
      index: Math.max(0, to_1.index - 1)
    };
    else if (k === "ArrowDown") to_1 = {
      ...to_1,
      index: Math.min(last(to_1.column), to_1.index + 1)
    };
    else if (k === back && to_1.column > 0) to_1 = {
      column: to_1.column - 1,
      index: Math.min(to_1.index, last(to_1.column - 1))
    };
    else if (k === on && to_1.column < columns.length - 1) to_1 = {
      column: to_1.column + 1,
      index: Math.min(to_1.index, last(to_1.column + 1))
    };
    else if (k === "Home") to_1 = {
      ...to_1,
      index: 0
    };
    else if (k === "End") to_1 = {
      ...to_1,
      index: last(to_1.column)
    };
    else if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      finish(drag, false);
      return;
    } else if (k === "Tab") {
      finish(drag, false);
      return;
    } else if (k !== back && k !== on) return;
    e.preventDefault();
    const item_2 = columns[from.column]?.items[from.index], col_3 = columns[to_1.column];
    if ((to_1.column !== drag.to.column || to_1.index !== drag.to.index) && item_2 !== void 0 && col_3) {
      setDrag({
        ...drag,
        to: to_1
      });
      announce(L.kanbanMoved(getLabel(item_2), col_3.title, to_1.index + 1, sizeAt(to_1, true)));
    }
  };
  const onBlur = () => requestAnimationFrame(() => {
    const d_0 = current.current;
    if (d_0 && !d_0.pointer && handles.current.get(d_0.key) !== document.activeElement) finish(d_0, false);
  });
  const [refocus, setRefocus] = React.useState(null);
  useIsoLayoutEffect(() => {
    const key_2 = drag && !drag.pointer ? drag.key : refocus;
    if (key_2 == null) return;
    const h = handles.current.get(key_2);
    if (h && document.activeElement !== h) h.focus({
      preventScroll: true
    });
    if (h && typeof h.scrollIntoView === "function" && (drag ? drag.to !== drag.from : true)) h.closest("li").scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
    if (refocus != null && !drag) setRefocus(null);
  });
  const moveTo = (key_3, column) => {
    commit(key_3, {
      column,
      index: columns[column]?.items.length ?? 0
    });
    setRefocus(key_3);
  };
  const pointer = React.useRef(null);
  const latest = React.useRef({
    columns,
    find,
    finish
  });
  latest.current = {
    columns,
    find,
    finish
  };
  const stop = React.useRef(null);
  React.useEffect(() => () => {
    if (stop.current) stop.current();
  }, []);
  const onPointerDown = (key_4, e_0) => {
    dragged.current = false;
    if (props.disabled || e_0.button !== 0 || drag && !drag.pointer) return;
    const card = e_0.currentTarget.closest("li").getBoundingClientRect();
    pointer.current = {
      id: e_0.pointerId,
      key: key_4,
      sx: e_0.clientX,
      sy: e_0.clientY,
      x: e_0.clientX,
      y: e_0.clientY,
      gx: e_0.clientX - card.left,
      gy: e_0.clientY - card.top,
      moved: false
    };
    const lists = () => board.current ? [...board.current.querySelectorAll(".srp-kanban__cards")] : [];
    const placeAt = (p) => {
      const at_2 = latest.current.find(p.key);
      if (!at_2) return void 0;
      const ls = lists();
      let column_0 = 0, best = Infinity;
      ls.forEach((l, c_1) => {
        const b = l.getBoundingClientRect(), d_1 = p.x < b.left ? b.left - p.x : p.x > b.right ? p.x - b.right : 0;
        if (d_1 < best) {
          best = d_1;
          column_0 = c_1;
        }
      });
      const self = board.current && board.current.querySelector(`li[data-key="${CSS.escape(String(p.key))}"]`);
      const middle = p.y - p.gy + (self ? self.getBoundingClientRect().height / 2 : 0);
      let index_0 = 0;
      const list = ls[column_0];
      if (list) for (const li of list.children) {
        if (li === self || !li.dataset.key) continue;
        const b_0 = li.getBoundingClientRect();
        if (b_0.top + b_0.height / 2 < middle) index_0++;
      }
      const d_2 = current.current;
      if (d_2 && d_2.pointer && d_2.key === p.key && d_2.to.column === column_0 && d_2.to.index === index_0 && d_2.from.column === at_2.column && d_2.from.index === at_2.index) return d_2;
      const next = {
        key: p.key,
        from: at_2,
        to: {
          column: column_0,
          index: index_0
        },
        pointer: true
      };
      setDrag(next);
      return next;
    };
    let frame = 0;
    const tick = () => {
      frame = 0;
      const p_0 = pointer.current, d_3 = current.current;
      if (!p_0 || !p_0.moved) return;
      let scrolled = false;
      const nudge = (box, horizontal) => {
        if (!box) return;
        const b_1 = box.getBoundingClientRect(), lo = horizontal ? b_1.left : b_1.top, hi = horizontal ? b_1.right : b_1.bottom, at_3 = horizontal ? p_0.x : p_0.y;
        const edge = Math.min(EDGE, (hi - lo) / 4);
        const by = at_3 < lo + edge ? -Math.ceil((lo + edge - at_3) / edge * STEP) : at_3 > hi - edge ? Math.ceil((at_3 - hi + edge) / edge * STEP) : 0;
        if (!by) return;
        const before = horizontal ? box.scrollLeft : box.scrollTop;
        if (horizontal) box.scrollLeft = before + by;
        else box.scrollTop = before + by;
        if ((horizontal ? box.scrollLeft : box.scrollTop) !== before) scrolled = true;
      };
      nudge(board.current, true);
      nudge(d_3 ? lists()[d_3.to.column] || null : null, false);
      if (scrolled) {
        placeAt(p_0);
        followRef.current();
      }
      frame = requestAnimationFrame(tick);
    };
    const move = (ev) => {
      const p_1 = pointer.current;
      if (!p_1 || p_1.id !== ev.pointerId) return;
      p_1.x = ev.clientX;
      p_1.y = ev.clientY;
      if (!p_1.moved && Math.hypot(p_1.x - p_1.sx, p_1.y - p_1.sy) < SLOP) return;
      p_1.moved = true;
      dragged.current = true;
      ev.preventDefault();
      placeAt(p_1);
      followRef.current();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const end = (cancel) => (ev_0) => {
      const p_2 = pointer.current;
      if (!p_2 || p_2.id !== ev_0.pointerId) return;
      off();
      if (p_2.moved) setTimeout(() => {
        dragged.current = false;
      });
      let d_4 = current.current;
      if (p_2.moved) {
        p_2.x = ev_0.clientX;
        p_2.y = ev_0.clientY;
        d_4 = placeAt(p_2) || d_4;
      }
      if (p_2.moved && d_4 && d_4.pointer) latest.current.finish(d_4, !cancel);
    };
    const up = end(false), cancel_0 = end(true);
    const off = () => {
      pointer.current = null;
      stop.current = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel_0);
    };
    if (stop.current) stop.current();
    stop.current = off;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel_0);
  };
  const moved = React.useRef(null);
  const follow = () => {
    const p_3 = pointer.current, d_5 = current.current;
    const li_0 = p_3 && p_3.moved && d_5 && d_5.pointer && board.current ? board.current.querySelector(`li[data-key="${CSS.escape(String(d_5.key))}"]`) : null;
    if (moved.current && moved.current !== li_0) moved.current.style.transform = "";
    moved.current = li_0;
    if (li_0 && p_3) {
      li_0.style.transform = "";
      const b_2 = li_0.getBoundingClientRect();
      li_0.style.transform = "translate(" + Math.round(p_3.x - p_3.gx - b_2.left) + "px, " + Math.round(p_3.y - p_3.gy - b_2.top) + "px)";
    }
  };
  const followRef = React.useRef(follow);
  followRef.current = follow;
  useIsoLayoutEffect(() => {
    follow();
  });
  const api = React.useRef(null);
  api.current = {
    click: onClick,
    keyDown: onKeyDown,
    blur: onBlur,
    pointerDown: onPointerDown,
    moveTo,
    handle: (key_5, n) => {
      if (n) handles.current.set(key_5, n);
      else handles.current.delete(key_5);
    }
  };
  const kept = React.useRef([]);
  if (kept.current.length !== columns.length || columns.some((c_3, i_0) => c_3.id !== kept.current[i_0]?.id || c_3.title !== kept.current[i_0]?.title)) kept.current = columns.map((c_2) => ({
    id: c_2.id,
    title: c_2.title
  }));
  const targets = kept.current;
  const mergedRef = useMergedRef(ref, (n_0) => {
    board.current = n_0;
  });
  const loading = props.loading && columns.every((c_4) => !c_4.items.length) ? props.loadingLabel || L.loading : null;
  const off_0 = props.disabled || loading != null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { tabIndex: off_0 ? 0 : void 0, "aria-busy": props.loading || void 0, ...rest, ref: mergedRef, role: rest.role ?? "group", className: cn("srp-kanban", drag && "srp-kanban--moving", props.disabled && "srp-kanban--disabled", props.className), "data-component": "kanban" }, shown.map((col_4, c_5) => {
    const count = columns[c_5]?.items.length ?? 0, over = col_4.limit != null && count > col_4.limit, titleId = base + "-col-" + c_5;
    return /* @__PURE__ */ React.createElement("section", { key: col_4.id, className: cn("srp-kanban__column", drag && drag.to.column === c_5 && "srp-kanban__column--target", over && "srp-kanban__column--over"), "aria-labelledby": titleId, "data-column": col_4.id }, /* @__PURE__ */ React.createElement("div", { className: "srp-kanban__header" }, /* @__PURE__ */ React.createElement(H, { className: "srp-kanban__title", id: titleId }, col_4.title), /* @__PURE__ */ React.createElement("span", { className: cn("srp-kanban__count", over && "srp-kanban__count--over") }, over ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning }) : null, loading != null ? null : col_4.limit == null ? displayNumber(count, locale) : L.kanbanCount(displayNumber(count, locale), displayNumber(col_4.limit, locale)), over ? /* @__PURE__ */ React.createElement("span", { className: "srp-kanban__over" }, L.kanbanOverLimit) : null)), /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-kanban__cards", "aria-labelledby": titleId }, loading != null ? /* @__PURE__ */ React.createElement(KanbanLoadingCards, { label: c_5 === 0 ? loading : "" }) : col_4.items.map((it_0, index_1) => {
      const key_6 = getKey(it_0), dragging = !!drag && drag.key === key_6;
      return /* @__PURE__ */ React.createElement(KanbanCard, { key: key_6, item: it_0, itemKey: key_6, name: getLabel(it_0), column: col_4.id, c: c_5, index: index_1, dragging, pressed: dragging && !drag.pointer, disabled: !!props.disabled, targets, renderCard: props.renderCard, labels: L, hint: base + "-hint", api });
    }), loading != null || col_4.items.length ? null : /* @__PURE__ */ React.createElement("li", { className: "srp-kanban__empty" }, L.kanbanEmpty)));
  })), off_0 ? null : /* @__PURE__ */ React.createElement("span", { hidden: true, id: base + "-hint" }, L.kanbanInstructions));
}
var Kanban = /* @__PURE__ */ named("Kanban", KanbanRender);
export {
  Kanban
};
//# sourceMappingURL=Kanban.js.map
