"use client";

// src/components/Kanban/Kanban.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/skeletonArt.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
import { edgeScroll, useHandleDrag } from "../../internal/handleDrag.js";
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
  const $ = _c(34);
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
  const t3 = props.dragging ? "" : void 0;
  const t4 = props.dragging ? "dragging" : void 0;
  let t5;
  if ($[2] !== L || $[3] !== api || $[4] !== key || $[5] !== name || $[6] !== props.disabled || $[7] !== props.hint || $[8] !== props.pressed) {
    t5 = props.disabled ? null : /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-kanban__handle", "aria-label": L.kanbanMove + " " + name, "aria-describedby": props.hint, "aria-pressed": props.pressed, ref: (n) => api.current.handle(key, n), onClick: () => api.current.click(key), onKeyDown: (e) => api.current.keyDown(e), onBlur: () => api.current.blur(), onPointerDown: (e_0) => api.current.pointerDown(key, e_0) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.DragIndicator }));
    $[2] = L;
    $[3] = api;
    $[4] = key;
    $[5] = name;
    $[6] = props.disabled;
    $[7] = props.hint;
    $[8] = props.pressed;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== props.column || $[11] !== props.dragging || $[12] !== props.index || $[13] !== props.item || $[14] !== props.renderCard) {
    t6 = props.renderCard(props.item, {
      column: props.column,
      index: props.index,
      dragging: props.dragging
    });
    $[10] = props.column;
    $[11] = props.dragging;
    $[12] = props.index;
    $[13] = props.item;
    $[14] = props.renderCard;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  let t7;
  if ($[16] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { className: "srp-kanban__content" }, t6);
    $[16] = t6;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  let t8;
  if ($[18] !== L || $[19] !== api || $[20] !== key || $[21] !== name || $[22] !== props.c || $[23] !== props.disabled || $[24] !== props.targets) {
    t8 = props.disabled || props.targets.length < 2 ? null : /* @__PURE__ */ React.createElement(Menu, { placement: "bottom-end", trigger: /* @__PURE__ */ React.createElement(IconButton, { className: "srp-kanban__menu", icon: icons.MoreVert, label: L.kanbanMoveTo(name), size: "sm", variant: "ghost" }) }, props.targets.map((target, t) => t === props.c ? null : /* @__PURE__ */ React.createElement(MenuItem, { key: target.id, onSelect: () => api.current.moveTo(key, t) }, target.title)));
    $[18] = L;
    $[19] = api;
    $[20] = key;
    $[21] = name;
    $[22] = props.c;
    $[23] = props.disabled;
    $[24] = props.targets;
    $[25] = t8;
  } else {
    t8 = $[25];
  }
  let t9;
  if ($[26] !== t0 || $[27] !== t2 || $[28] !== t3 || $[29] !== t4 || $[30] !== t5 || $[31] !== t7 || $[32] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("li", { "data-key": t0, className: t2, "data-dragging": t3, "data-state": t4 }, t5, t7, t8);
    $[26] = t0;
    $[27] = t2;
    $[28] = t3;
    $[29] = t4;
    $[30] = t5;
    $[31] = t7;
    $[32] = t8;
    $[33] = t9;
  } else {
    t9 = $[33];
  }
  return t9;
});
function KanbanRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
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
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const {
    getKey,
    getLabel
  } = props;
  const columns = props.columns || [];
  const base = domId("srp-kb", React.useId());
  const [drag, setDrag] = React.useState(null);
  const current = useLatest(drag);
  const board = React.useRef(null);
  const {
    pointerRef,
    draggedRef,
    begin
  } = useHandleDrag();
  const handles = React.useRef(/* @__PURE__ */ new Map());
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) < 0 ? 3 : props.headingLevel;
  const H = "h" + level;
  const rtl = () => !!board.current && isRtl(board.current);
  const find = (key) => {
    for (const [c, col] of columns.entries()) {
      const i = col.items.findIndex((it) => getKey(it) === key);
      if (i >= 0) {
        return {
          column: c,
          index: i
        };
      }
    }
    return null;
  };
  const from = drag ? find(drag.key) : null;
  const shown = drag && from ? moveCard(columns, from, drag.to) : columns;
  const sizeAt = (to, moving) => (columns[to.column]?.items.length ?? 0) + (moving && from && from.column !== to.column ? 1 : 0);
  const commit = (key_0, to_0) => {
    const at = find(key_0);
    const from_0 = at && columns[at.column];
    const item = at && from_0?.items[at.index];
    const col_0 = columns[to_0.column];
    if (!at || !from_0 || item === void 0 || !col_0) {
      return;
    }
    const name = getLabel(item);
    const total = col_0.items.length + (at.column === to_0.column ? 0 : 1);
    const index = Math.min(to_0.index, total - 1);
    announce(L.kanbanDropped(name, col_0.title, index + 1, total));
    if (at.column !== to_0.column || at.index !== index) {
      props.onMove(moveCard(columns, at, {
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
    }
  };
  const finish = (d, drop) => {
    setDrag(null);
    const at_0 = find(d.key);
    const col_1 = at_0 && columns[at_0.column];
    const item_0 = at_0 && col_1?.items[at_0.index];
    if (!at_0 || !col_1 || item_0 === void 0) {
      return;
    }
    if (drop) {
      commit(d.key, d.to);
    } else {
      announce(L.kanbanCancelled(getLabel(item_0), col_1.title, at_0.index + 1, col_1.items.length));
    }
  };
  const onClick = (key_1) => {
    if (props.disabled) {
      return;
    }
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (drag && !drag.pointer) {
      finish(drag, true);
      return;
    }
    const at_1 = find(key_1);
    const col_2 = at_1 && columns[at_1.column];
    const item_1 = at_1 && col_2?.items[at_1.index];
    if (!at_1 || !col_2 || item_1 === void 0) {
      return;
    }
    setDrag({
      key: key_1,
      from: at_1,
      to: at_1,
      pointer: false
    });
    announce(L.kanbanGrabbed(getLabel(item_1), col_2.title, at_1.index + 1, col_2.items.length));
  };
  const onKeyDown = (e) => {
    if (!drag || drag.pointer || !from || isComposing(e) || modified(e)) {
      return;
    }
    const k = e.key;
    const back = rtl() ? "ArrowRight" : "ArrowLeft";
    const on = rtl() ? "ArrowLeft" : "ArrowRight";
    let to_1 = drag.to;
    const last = (c_0) => sizeAt({
      column: c_0,
      index: 0
    }, true) - 1;
    if (k === "ArrowUp") {
      to_1 = {
        ...to_1,
        index: Math.max(0, to_1.index - 1)
      };
    } else {
      if (k === "ArrowDown") {
        to_1 = {
          ...to_1,
          index: Math.min(last(to_1.column), to_1.index + 1)
        };
      } else {
        if (k === back && to_1.column > 0) {
          to_1 = {
            column: to_1.column - 1,
            index: Math.min(to_1.index, last(to_1.column - 1))
          };
        } else {
          if (k === on && to_1.column < columns.length - 1) {
            to_1 = {
              column: to_1.column + 1,
              index: Math.min(to_1.index, last(to_1.column + 1))
            };
          } else {
            if (k === "Home") {
              to_1 = {
                ...to_1,
                index: 0
              };
            } else {
              if (k === "End") {
                to_1 = {
                  ...to_1,
                  index: last(to_1.column)
                };
              } else {
                if (k === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  finish(drag, false);
                  return;
                } else {
                  if (k === "Tab") {
                    finish(drag, false);
                    return;
                  } else {
                    if (k !== back && k !== on) {
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    e.preventDefault();
    const item_2 = columns[from.column]?.items[from.index];
    const col_3 = columns[to_1.column];
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
    if (d_0 && !d_0.pointer && handles.current.get(d_0.key) !== document.activeElement) {
      finish(d_0, false);
    }
  });
  const [refocus, setRefocus] = React.useState(null);
  useIsoLayoutEffect(() => {
    const key_2 = drag && !drag.pointer ? drag.key : refocus;
    if (key_2 == null) {
      return;
    }
    const h = handles.current.get(key_2);
    if (h && document.activeElement !== h) {
      h.focus({
        preventScroll: true
      });
    }
    if (h && typeof h.scrollIntoView === "function" && (drag ? drag.to !== drag.from : true)) {
      h.closest("li").scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    }
    if (refocus != null && !drag) {
      setRefocus(null);
    }
  });
  const moveTo = (key_3, column) => {
    commit(key_3, {
      column,
      index: columns[column]?.items.length ?? 0
    });
    setRefocus(key_3);
  };
  const latest = useLatest({
    columns,
    find,
    finish
  });
  const onPointerDown = (key_4, e_0) => {
    draggedRef.current = false;
    if (props.disabled || e_0.button !== 0 || drag && !drag.pointer) {
      return;
    }
    const lists = () => board.current ? [...board.current.querySelectorAll(".srp-kanban__cards")] : [];
    const placeAt = (p) => {
      const at_2 = latest.current.find(p.key);
      if (!at_2) {
        return;
      }
      const ls = lists();
      let column_0 = 0;
      let best = Infinity;
      ls.forEach((l, c_1) => {
        const b = l.getBoundingClientRect();
        const d_1 = p.x < b.left ? b.left - p.x : p.x > b.right ? p.x - b.right : 0;
        if (d_1 < best) {
          best = d_1;
          column_0 = c_1;
        }
      });
      const self = board.current && board.current.querySelector(`li[data-key="${CSS.escape(String(p.key))}"]`);
      const middle = p.y - p.gy + (self ? self.getBoundingClientRect().height / 2 : 0);
      let index_0 = 0;
      const list = ls[column_0];
      if (list) {
        for (const li of list.children) {
          if (li === self || !li.dataset.key) {
            continue;
          }
          const b_0 = li.getBoundingClientRect();
          if (b_0.top + b_0.height / 2 < middle) {
            index_0++;
          }
        }
      }
      const d_2 = current.current;
      if (d_2 && d_2.pointer && d_2.key === p.key && d_2.to.column === column_0 && d_2.to.index === index_0 && d_2.from.column === at_2.column && d_2.from.index === at_2.index) {
        return d_2;
      }
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
    begin(key_4, e_0, e_0.currentTarget.closest("li"), {
      axis: "both",
      place: (p_0) => {
        placeAt(p_0);
        followRef.current();
      },
      scroll: (p_1) => {
        const d_3 = current.current;
        const col_4 = d_3 ? lists()[d_3.to.column] : void 0;
        let scrolled = false;
        if (board.current) {
          const b_1 = board.current.getBoundingClientRect();
          scrolled = edgeScroll(board.current, true, p_1.x, b_1.left, b_1.right);
        }
        if (col_4) {
          const b_2 = col_4.getBoundingClientRect();
          scrolled = edgeScroll(col_4, false, p_1.y, b_2.top, b_2.bottom) || scrolled;
        }
        return scrolled;
      },
      end: (p_2, cancel) => {
        const d_4 = placeAt(p_2) || current.current;
        if (d_4 && d_4.pointer) {
          latest.current.finish(d_4, !cancel);
        }
      }
    });
  };
  const moved = React.useRef(null);
  const follow = () => {
    const p_3 = pointerRef.current;
    const d_5 = current.current;
    const li_0 = p_3 && p_3.moved && d_5 && d_5.pointer && board.current ? board.current.querySelector(`li[data-key="${CSS.escape(String(d_5.key))}"]`) : null;
    if (moved.current && moved.current !== li_0) {
      moved.current.style.transform = "";
    }
    moved.current = li_0;
    if (li_0 && p_3) {
      li_0.style.transform = "";
      const b_3 = li_0.getBoundingClientRect();
      li_0.style.transform = "translate(" + Math.round(p_3.x - p_3.gx - b_3.left) + "px, " + Math.round(p_3.y - p_3.gy - b_3.top) + "px)";
    }
  };
  const followRef = useLatest(follow);
  useIsoLayoutEffect(() => {
    follow();
  });
  const api = useLatest({
    click: onClick,
    keyDown: onKeyDown,
    blur: onBlur,
    pointerDown: onPointerDown,
    moveTo,
    handle: (key_5, n) => {
      if (n) {
        handles.current.set(key_5, n);
      } else {
        handles.current.delete(key_5);
      }
    }
  });
  const [kept, setKept] = React.useState(() => columns.map(_temp));
  let targets = kept;
  if (kept.length !== columns.length || columns.some((c_4, i_0) => c_4.id !== kept[i_0]?.id || c_4.title !== kept[i_0]?.title)) {
    targets = columns.map(_temp2);
    setKept(targets);
  }
  const mergedRef = useMergedRef(ref, (n_0) => {
    board.current = n_0;
  });
  const loading = props.loading && columns.every(_temp3) ? props.loadingLabel || L.loading : null;
  const off = props.disabled || loading != null;
  const t1 = off ? 0 : void 0;
  const t2 = props.loading || void 0;
  const t3 = rest.role ?? "group";
  const t4 = cn("srp-kanban", drag && "srp-kanban--moving", props.disabled && "srp-kanban--disabled", props.className);
  const t5 = "kanban";
  const t6 = shown.map((col_5, c_6) => {
    const count = columns[c_6]?.items.length ?? 0;
    const over = col_5.limit != null && count > col_5.limit;
    const titleId = base + "-col-" + c_6;
    return /* @__PURE__ */ React.createElement("section", { key: col_5.id, className: cn("srp-kanban__column", drag && drag.to.column === c_6 && "srp-kanban__column--target", over && "srp-kanban__column--over"), "aria-labelledby": titleId, "data-column": col_5.id }, /* @__PURE__ */ React.createElement("div", { className: "srp-kanban__header" }, /* @__PURE__ */ React.createElement(H, { className: "srp-kanban__title", id: titleId }, col_5.title), /* @__PURE__ */ React.createElement("span", { className: cn("srp-kanban__count", over && "srp-kanban__count--over"), "data-over": over ? "" : void 0 }, over ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Warning }) : null, loading != null ? null : col_5.limit == null ? displayNumber(count, locale) : L.kanbanCount(displayNumber(count, locale), displayNumber(col_5.limit, locale)), over ? /* @__PURE__ */ React.createElement("span", { className: "srp-kanban__over" }, L.kanbanOverLimit) : null)), /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-kanban__cards", "aria-labelledby": titleId }, loading != null ? /* @__PURE__ */ React.createElement(KanbanLoadingCards, { label: c_6 === 0 ? loading : "" }) : col_5.items.map((it_0, index_1) => {
      const key_6 = getKey(it_0);
      const dragging = !!drag && drag.key === key_6;
      return /* @__PURE__ */ React.createElement(KanbanCard, { key: key_6, item: it_0, itemKey: key_6, name: getLabel(it_0), column: col_5.id, c: c_6, index: index_1, dragging, pressed: dragging && !drag.pointer, disabled: !!props.disabled, targets, renderCard: props.renderCard, labels: L, hint: base + "-hint", api });
    }), loading != null || col_5.items.length ? null : /* @__PURE__ */ React.createElement("li", { className: "srp-kanban__empty" }, L.kanbanEmpty)));
  });
  let t7;
  if ($[0] !== mergedRef || $[1] !== rest || $[2] !== t1 || $[3] !== t2 || $[4] !== t3 || $[5] !== t4 || $[6] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { tabIndex: t1, "aria-busy": t2, ...rest, ref: mergedRef, role: t3, className: t4, "data-component": t5 }, t6);
    $[0] = mergedRef;
    $[1] = rest;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
    $[5] = t4;
    $[6] = t6;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== L || $[9] !== base || $[10] !== off) {
    t8 = off ? null : /* @__PURE__ */ React.createElement("span", { hidden: true, id: base + "-hint" }, L.kanbanInstructions);
    $[8] = L;
    $[9] = base;
    $[10] = off;
    $[11] = t8;
  } else {
    t8 = $[11];
  }
  let t9;
  if ($[12] !== t7 || $[13] !== t8) {
    t9 = /* @__PURE__ */ React.createElement(React.Fragment, null, t7, t8);
    $[12] = t7;
    $[13] = t8;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  return t9;
}
function _temp3(c_5) {
  return !c_5.items.length;
}
function _temp2(c_3) {
  return {
    id: c_3.id,
    title: c_3.title
  };
}
function _temp(c_2) {
  return {
    id: c_2.id,
    title: c_2.title
  };
}
var Kanban = /* @__PURE__ */ named("Kanban", KanbanRender);
export {
  Kanban
};
//# sourceMappingURL=Kanban.js.map
