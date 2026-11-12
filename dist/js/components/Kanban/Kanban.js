"use client";

// src/components/Kanban/Kanban.tsx
import * as React from "react";
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var EDGE = 48;
var STEP = 16;
var SLOP = 4;
function moveCard(columns, from, to) {
  const out = columns.map((c) => ({ ...c, items: c.items.slice() }));
  const [it] = out[from.column].items.splice(from.index, 1);
  out[to.column].items.splice(Math.min(to.index, out[to.column].items.length), 0, it);
  return out;
}
var KanbanCard = /* @__PURE__ */ React.memo(function KanbanCard2(props) {
  const { itemKey: key, name, api, labels: L } = props;
  return /* @__PURE__ */ React.createElement("li", { "data-key": String(key), className: cn("dk-kanban__card", props.dragging && "dk-kanban__card--dragging"), "data-state": props.dragging ? "dragging" : void 0 }, props.disabled ? null : /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "dk-kanban__handle",
      "aria-label": L.kanbanMove + " " + name,
      "aria-describedby": props.hint,
      "aria-pressed": props.pressed,
      ref: (n) => api.current.handle(key, n),
      onClick: () => api.current.click(key),
      onKeyDown: (e) => api.current.keyDown(e),
      onBlur: () => api.current.blur(),
      onPointerDown: (e) => api.current.pointerDown(key, e)
    },
    /* @__PURE__ */ React.createElement(Icon, { icon: icons.DragIndicator })
  ), /* @__PURE__ */ React.createElement("div", { className: "dk-kanban__content" }, props.renderCard(props.item, { column: props.column, index: props.index, dragging: props.dragging })), props.disabled || props.targets.length < 2 ? null : /* @__PURE__ */ React.createElement(Menu, { placement: "bottom-end", trigger: /* @__PURE__ */ React.createElement(IconButton, { className: "dk-kanban__menu", icon: icons.MoreVert, label: L.kanbanMoveTo(name), size: "sm", variant: "ghost" }) }, props.targets.map((target, t) => t === props.c ? null : /* @__PURE__ */ React.createElement(MenuItem, { key: target.id, onSelect: () => api.current.moveTo(key, t) }, target.title))));
});
var Kanban = /* @__PURE__ */ component("Kanban", function Kanban2(props, ref) {
  const rest = omit(props, { columns: 1, getKey: 1, getLabel: 1, renderCard: 1, onMove: 1, headingLevel: 1, disabled: 1, className: 1 });
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const { getKey, getLabel } = props;
  const columns = props.columns || [];
  const base = domId("dk-kb", React.useId());
  const [drag, setDrag] = React.useState(null);
  const current = React.useRef(drag);
  current.current = drag;
  const board = React.useRef(null);
  const handles = React.useRef(/* @__PURE__ */ new Map());
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) < 0 ? 3 : props.headingLevel;
  const H = "h" + level;
  const rtl = () => !!board.current && getComputedStyle(board.current).direction === "rtl";
  const find = (key) => {
    for (let c = 0; c < columns.length; c++) {
      const i = columns[c].items.findIndex((it) => getKey(it) === key);
      if (i >= 0) return { column: c, index: i };
    }
    return null;
  };
  const from = drag ? find(drag.key) : null;
  const shown = drag && from ? moveCard(columns, from, drag.to) : columns;
  const sizeAt = (to, moving) => columns[to.column].items.length + (moving && from && from.column !== to.column ? 1 : 0);
  const commit = (key, to) => {
    const at = find(key);
    if (!at) return;
    const item = columns[at.column].items[at.index];
    const name = getLabel(item), col = columns[to.column];
    const total = col.items.length + (at.column === to.column ? 0 : 1);
    const index = Math.min(to.index, total - 1);
    announce(L.kanbanDropped(name, col.title, index + 1, total));
    if (at.column !== to.column || at.index !== index)
      props.onMove(moveCard(columns, at, { column: to.column, index }), { item, from: { column: columns[at.column].id, index: at.index }, to: { column: col.id, index } });
  };
  const finish = (d, drop) => {
    setDrag(null);
    const at = find(d.key);
    if (!at) return;
    if (drop) commit(d.key, d.to);
    else announce(L.kanbanCancelled(getLabel(columns[at.column].items[at.index]), columns[at.column].title, at.index + 1, columns[at.column].items.length));
  };
  const dragged = React.useRef(false);
  const onClick = (key) => {
    if (props.disabled) return;
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (drag && !drag.pointer) {
      finish(drag, true);
      return;
    }
    const at = find(key);
    if (!at) return;
    setDrag({ key, from: at, to: at, pointer: false });
    announce(L.kanbanGrabbed(getLabel(columns[at.column].items[at.index]), columns[at.column].title, at.index + 1, columns[at.column].items.length));
  };
  const onKeyDown = (e) => {
    if (!drag || drag.pointer || !from || isComposing(e)) return;
    const k = e.key, back = rtl() ? "ArrowRight" : "ArrowLeft", on = rtl() ? "ArrowLeft" : "ArrowRight";
    let to = drag.to;
    const last = (c) => sizeAt({ column: c, index: 0 }, true) - 1;
    if (k === "ArrowUp") to = { ...to, index: Math.max(0, to.index - 1) };
    else if (k === "ArrowDown") to = { ...to, index: Math.min(last(to.column), to.index + 1) };
    else if (k === back && to.column > 0) to = { column: to.column - 1, index: Math.min(to.index, last(to.column - 1)) };
    else if (k === on && to.column < columns.length - 1) to = { column: to.column + 1, index: Math.min(to.index, last(to.column + 1)) };
    else if (k === "Home") to = { ...to, index: 0 };
    else if (k === "End") to = { ...to, index: last(to.column) };
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
    if (to.column !== drag.to.column || to.index !== drag.to.index) {
      setDrag({ ...drag, to });
      announce(L.kanbanMoved(getLabel(columns[from.column].items[from.index]), columns[to.column].title, to.index + 1, sizeAt(to, true)));
    }
  };
  const onBlur = () => requestAnimationFrame(() => {
    const d = current.current;
    if (d && !d.pointer && handles.current.get(d.key) !== document.activeElement) finish(d, false);
  });
  const [refocus, setRefocus] = React.useState(null);
  useIsoLayoutEffect(() => {
    const key = drag && !drag.pointer ? drag.key : refocus;
    if (key == null) return;
    const h = handles.current.get(key);
    if (h && document.activeElement !== h) h.focus({ preventScroll: true });
    if (h && typeof h.scrollIntoView === "function" && (drag ? drag.to !== drag.from : true)) h.closest("li").scrollIntoView({ block: "nearest", inline: "nearest" });
    if (refocus != null && !drag) setRefocus(null);
  });
  const moveTo = (key, column) => {
    commit(key, { column, index: columns[column].items.length });
    setRefocus(key);
  };
  const pointer = React.useRef(null);
  const latest = React.useRef({ columns, find, finish });
  latest.current = { columns, find, finish };
  const stop = React.useRef(null);
  React.useEffect(() => () => {
    if (stop.current) stop.current();
  }, []);
  const onPointerDown = (key, e) => {
    dragged.current = false;
    if (props.disabled || e.button !== 0 || drag && !drag.pointer) return;
    const card = e.currentTarget.closest("li").getBoundingClientRect();
    pointer.current = { id: e.pointerId, key, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, gx: e.clientX - card.left, gy: e.clientY - card.top, moved: false };
    const lists = () => board.current ? [...board.current.querySelectorAll(".dk-kanban__cards")] : [];
    const placeAt = (p) => {
      const at = latest.current.find(p.key);
      if (!at) return void 0;
      const ls = lists();
      let column = 0, best = Infinity;
      ls.forEach((l, c) => {
        const b = l.getBoundingClientRect(), d2 = p.x < b.left ? b.left - p.x : p.x > b.right ? p.x - b.right : 0;
        if (d2 < best) {
          best = d2;
          column = c;
        }
      });
      const self = board.current && board.current.querySelector(`li[data-key="${CSS.escape(String(p.key))}"]`);
      const middle = p.y - p.gy + (self ? self.getBoundingClientRect().height / 2 : 0);
      let index = 0;
      if (ls[column]) for (const li of ls[column].children) {
        if (li === self || !li.dataset.key) continue;
        const b = li.getBoundingClientRect();
        if (b.top + b.height / 2 < middle) index++;
      }
      const d = current.current;
      if (d && d.pointer && d.key === p.key && d.to.column === column && d.to.index === index && d.from.column === at.column && d.from.index === at.index) return d;
      const next = { key: p.key, from: at, to: { column, index }, pointer: true };
      setDrag(next);
      return next;
    };
    let frame = 0;
    const tick = () => {
      frame = 0;
      const p = pointer.current, d = current.current;
      if (!p || !p.moved) return;
      let scrolled = false;
      const nudge = (box, horizontal) => {
        if (!box) return;
        const b = box.getBoundingClientRect(), lo = horizontal ? b.left : b.top, hi = horizontal ? b.right : b.bottom, at = horizontal ? p.x : p.y;
        const edge = Math.min(EDGE, (hi - lo) / 4);
        const by = at < lo + edge ? -Math.ceil((lo + edge - at) / edge * STEP) : at > hi - edge ? Math.ceil((at - hi + edge) / edge * STEP) : 0;
        if (!by) return;
        const before = horizontal ? box.scrollLeft : box.scrollTop;
        if (horizontal) box.scrollLeft = before + by;
        else box.scrollTop = before + by;
        if ((horizontal ? box.scrollLeft : box.scrollTop) !== before) scrolled = true;
      };
      nudge(board.current, true);
      nudge(d ? lists()[d.to.column] || null : null, false);
      if (scrolled) {
        placeAt(p);
        followRef.current();
      }
      frame = requestAnimationFrame(tick);
    };
    const move = (ev) => {
      const p = pointer.current;
      if (!p || p.id !== ev.pointerId) return;
      p.x = ev.clientX;
      p.y = ev.clientY;
      if (!p.moved && Math.hypot(p.x - p.sx, p.y - p.sy) < SLOP) return;
      p.moved = true;
      dragged.current = true;
      ev.preventDefault();
      placeAt(p);
      followRef.current();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const end = (cancel2) => (ev) => {
      const p = pointer.current;
      if (!p || p.id !== ev.pointerId) return;
      off();
      if (p.moved) setTimeout(() => {
        dragged.current = false;
      });
      let d = current.current;
      if (p.moved) {
        p.x = ev.clientX;
        p.y = ev.clientY;
        d = placeAt(p) || d;
      }
      if (p.moved && d && d.pointer) latest.current.finish(d, !cancel2);
    };
    const up = end(false), cancel = end(true);
    const off = () => {
      pointer.current = null;
      stop.current = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    if (stop.current) stop.current();
    stop.current = off;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };
  const moved = React.useRef(null);
  const follow = () => {
    const p = pointer.current, d = current.current;
    const li = p && p.moved && d && d.pointer && board.current ? board.current.querySelector(`li[data-key="${CSS.escape(String(d.key))}"]`) : null;
    if (moved.current && moved.current !== li) moved.current.style.transform = "";
    moved.current = li;
    if (li && p) {
      li.style.transform = "";
      const b = li.getBoundingClientRect();
      li.style.transform = "translate(" + Math.round(p.x - p.gx - b.left) + "px, " + Math.round(p.y - p.gy - b.top) + "px)";
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
    handle: (key, n) => {
      if (n) handles.current.set(key, n);
      else handles.current.delete(key);
    }
  };
  const kept = React.useRef([]);
  if (kept.current.length !== columns.length || columns.some((c, i) => c.id !== kept.current[i].id || c.title !== kept.current[i].title))
    kept.current = columns.map((c) => ({ id: c.id, title: c.title }));
  const targets = kept.current;
  const mergedRef = useMergedRef(ref, (n) => {
    board.current = n;
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      tabIndex: props.disabled ? 0 : void 0,
      ...rest,
      ref: mergedRef,
      role: rest.role ?? "group",
      className: cn("dk-kanban", drag && "dk-kanban--moving", props.disabled && "dk-kanban--disabled", props.className),
      "data-component": "kanban"
    },
    shown.map((col, c) => {
      const count = columns[c].items.length, over = col.limit != null && count > col.limit, titleId = base + "-col-" + c;
      return /* @__PURE__ */ React.createElement("section", { key: col.id, className: cn("dk-kanban__column", drag && drag.to.column === c && "dk-kanban__column--target", over && "dk-kanban__column--over"), "aria-labelledby": titleId, "data-column": col.id }, /* @__PURE__ */ React.createElement("div", { className: "dk-kanban__header" }, /* @__PURE__ */ React.createElement(H, { className: "dk-kanban__title", id: titleId }, col.title), /* @__PURE__ */ React.createElement("span", { className: cn("dk-kanban__count", over && "dk-kanban__count--over") }, over ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning }) : null, col.limit == null ? displayNumber(count, locale) : L.kanbanCount(displayNumber(count, locale), displayNumber(col.limit, locale)), over ? /* @__PURE__ */ React.createElement("span", { className: "dk-kanban__over" }, L.kanbanOverLimit) : null)), /* @__PURE__ */ React.createElement("ul", { role: "list", className: "dk-kanban__cards", "aria-labelledby": titleId }, col.items.map((it, index) => {
        const key = getKey(it), dragging = !!drag && drag.key === key;
        return /* @__PURE__ */ React.createElement(
          KanbanCard,
          {
            key,
            item: it,
            itemKey: key,
            name: getLabel(it),
            column: col.id,
            c,
            index,
            dragging,
            pressed: dragging && !drag.pointer,
            disabled: !!props.disabled,
            targets,
            renderCard: props.renderCard,
            labels: L,
            hint: base + "-hint",
            api
          }
        );
      }), col.items.length ? null : /* @__PURE__ */ React.createElement("li", { className: "dk-kanban__empty" }, L.kanbanEmpty)));
    })
  ), props.disabled ? null : /* @__PURE__ */ React.createElement("span", { hidden: true, id: base + "-hint" }, L.kanbanInstructions));
});
export {
  Kanban
};
//# sourceMappingURL=Kanban.js.map
