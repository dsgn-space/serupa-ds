"use client";

// src/components/SortableList/SortableList.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useMergedRef, cn, domId, omit, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useAutoFocus } from "../../internal/focus.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { reflow } from "../../internal/reflow.js";
import { useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { modified } from "../../internal/roving.js";
import { edgeScroll, useHandleDrag } from "../../internal/handleDrag.js";
function SortableListRender(t0) {
  const $ = _c(22);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    items: 1,
    getKey: 1,
    getLabel: 1,
    renderItem: 1,
    onReorder: 1,
    disabled: 1,
    reorderLabel: 1,
    orientation: 1,
    className: 1,
    autoFocus: 1
  });
  const sds = useSettings(words);
  const {
    getKey,
    getLabel
  } = props;
  const items = props.items || [];
  const [held, setDrag] = React.useState(null);
  const drag = held && held.to > items.length - 1 ? {
    ...held,
    to: Math.max(0, items.length - 1)
  } : held;
  const current = useLatest(drag);
  const hintId = domId("srp-sl", React.useId()) + "-hint";
  const list = React.useRef(null);
  const handles = React.useRef(/* @__PURE__ */ new Map());
  const {
    pointerRef,
    draggedRef,
    begin
  } = useHandleDrag();
  const row = props.orientation === "horizontal";
  let t1;
  if ($[0] !== row) {
    t1 = (b) => row ? b.left : b.top;
    $[0] = row;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const lead = t1;
  let t2;
  if ($[2] !== row) {
    t2 = (b_0) => row ? b_0.width : b_0.height;
    $[2] = row;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const span = t2;
  let t3;
  if ($[4] !== row) {
    t3 = (p) => row ? p.x : p.y;
    $[4] = row;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const along = t3;
  let t4;
  if ($[6] !== row) {
    t4 = (p_0) => row ? p_0.gx : p_0.gy;
    $[6] = row;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const grab = t4;
  const rtl = () => row && !!list.current && isRtl(list.current);
  useAutoFocus(props.autoFocus, () => list.current && list.current.querySelector(".srp-sortable-list__handle"));
  const total = items.length;
  const from = drag ? items.findIndex((it) => getKey(it) === drag.key) : -1;
  const shown = drag && from >= 0 ? move(items, from, drag.to) : items.slice();
  const label = (it_0) => getLabel(it_0);
  const finish = (d, drop) => {
    const at = items.findIndex((it_1) => getKey(it_1) === d.key);
    setDrag(null);
    if (at < 0) {
      return;
    }
    const name = label(items[at]);
    if (drop) {
      announce(sds.labels.reorderDropped(name, d.to + 1, total));
      if (d.to !== at) {
        props.onReorder(move(items, at, d.to), {
          from: at,
          to: d.to
        });
      }
    } else {
      announce(sds.labels.reorderCancelled(name, at + 1, total));
    }
  };
  const dropping = React.useRef(false);
  const onClick = (key, index) => () => {
    dropping.current = false;
    if (props.disabled) {
      return;
    }
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (drag && !drag.pointer) {
      finish(key === drag.key ? drag : {
        ...drag,
        to: index
      }, true);
    } else {
      setDrag({
        key,
        from: index,
        to: index,
        pointer: false
      });
      announce(sds.labels.reorderGrabbed(label(items[index]), index + 1, total));
    }
  };
  const onKeyDown = (e) => {
    if (!drag || drag.pointer || isComposing(e) || modified(e)) {
      return;
    }
    const k = e.key;
    let to = drag.to;
    const back = rtl() ? "ArrowRight" : "ArrowLeft";
    const on = rtl() ? "ArrowLeft" : "ArrowRight";
    if (k === "ArrowUp" || k === back) {
      to = Math.max(0, to - 1);
    } else {
      if (k === "ArrowDown" || k === on) {
        to = Math.min(total - 1, to + 1);
      } else {
        if (k === "Home") {
          to = 0;
        } else {
          if (k === "End") {
            to = total - 1;
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
                return;
              }
            }
          }
        }
      }
    }
    e.preventDefault();
    if (to !== drag.to) {
      setDrag({
        ...drag,
        to
      });
      announce(sds.labels.reorderMoved(label(items[from]), to + 1, total));
    }
  };
  const onBlur = () => requestAnimationFrame(() => {
    const d_0 = current.current;
    if (d_0 && !d_0.pointer && !dropping.current && handles.current.get(d_0.key) !== document.activeElement) {
      finish(d_0, false);
    }
  });
  const shownAt = React.useRef(-1);
  useIsoLayoutEffect(() => {
    if (!drag || drag.pointer) {
      shownAt.current = -1;
      return;
    }
    const h = handles.current.get(drag.key);
    if (h && document.activeElement !== h) {
      h.focus({
        preventScroll: true
      });
    }
    if (shownAt.current === -1) {
      shownAt.current = drag.to;
      return;
    }
    if (shownAt.current === drag.to) {
      return;
    }
    shownAt.current = drag.to;
    const row_0 = h && h.closest("li");
    if (row_0 && typeof row_0.scrollIntoView === "function") {
      row_0.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    }
  });
  const latest = useLatest({
    items,
    getKey,
    finish
  });
  const onPointerDown = (key_0) => (e_0) => {
    draggedRef.current = false;
    if (drag && !drag.pointer && e_0.button === 0 && !props.disabled) {
      dropping.current = true;
      window.addEventListener("pointerup", () => setTimeout(() => {
        if (dropping.current) {
          dropping.current = false;
          onBlur();
        }
      }), {
        once: true
      });
    }
    if (props.disabled || e_0.button !== 0 || drag && !drag.pointer) {
      return;
    }
    const flip = rtl();
    const placeAt = (p_1) => {
      const {
        items: all,
        getKey: keyOf
      } = latest.current;
      const at_0 = all.findIndex((it_2) => keyOf(it_2) === p_1.key);
      if (at_0 < 0) {
        return;
      }
      const rows = list.current ? [...list.current.children] : [];
      const self = rows.find((r) => r.dataset.key === String(p_1.key));
      const middle = along(p_1) - grab(p_1) + (self ? span(self.getBoundingClientRect()) / 2 : 0);
      let to_0 = 0;
      for (const r_0 of rows) {
        const b_1 = r_0.getBoundingClientRect();
        const mid = lead(b_1) + span(b_1) / 2;
        if (r_0 !== self && (flip ? mid > middle : mid < middle)) {
          to_0++;
        }
      }
      const next = {
        key: p_1.key,
        from: at_0,
        to: to_0,
        pointer: true
      };
      setDrag(next);
      return next;
    };
    const scroller = () => {
      for (let n = list.current; n && n !== document.body; n = n.parentElement) {
        const o = row ? getComputedStyle(n).overflowX : getComputedStyle(n).overflowY;
        if ((o === "auto" || o === "scroll") && (row ? n.scrollWidth > n.clientWidth : n.scrollHeight > n.clientHeight)) {
          return n;
        }
      }
      return document.scrollingElement || document.documentElement;
    };
    begin(key_0, e_0, e_0.currentTarget.closest("li"), {
      axis: row ? "x" : "y",
      place: placeAt,
      scroll: (p_2) => {
        const box = scroller();
        const page = box === document.scrollingElement || box === document.documentElement;
        const b_2 = box.getBoundingClientRect();
        return edgeScroll(box, row, along(p_2), page ? 0 : lead(b_2), page ? row ? window.innerWidth : window.innerHeight : lead(b_2) + span(b_2));
      },
      end: (p_3, cancel) => {
        const d_1 = placeAt(p_3) || current.current;
        if (d_1 && d_1.pointer) {
          latest.current.finish(d_1, !cancel);
        }
      }
    });
  };
  let t5;
  if ($[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ new Map();
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const tops = React.useRef(t5);
  useIsoLayoutEffect(() => {
    const rows_0 = list.current ? [...list.current.children] : [];
    const held_0 = pointerRef.current && drag && drag.pointer ? String(drag.key) : null;
    const next_0 = /* @__PURE__ */ new Map();
    const moved = [];
    for (const r_1 of rows_0) {
      const key_1 = r_1.dataset.key || "";
      const top = row ? r_1.offsetLeft : r_1.offsetTop;
      const was = tops.current.get(key_1);
      next_0.set(key_1, top);
      if (was === void 0 || was === top || key_1 === held_0) {
        continue;
      }
      const cs = getComputedStyle(r_1);
      const t = cs.transform === "none" ? null : new DOMMatrix(cs.transform);
      const shift = (t ? row ? t.m41 : t.m42 : 0) + (parseFloat(cs.translate.split(" ")[row ? 0 : 1] ?? "") || 0);
      const dy = Math.round(was + shift - top);
      if (dy) {
        moved.push([r_1, dy]);
      }
    }
    tops.current = next_0;
    if (!moved.length || !list.current) {
      return;
    }
    for (const [r_2, dy_0] of moved) {
      r_2.dataset.flip = "";
      r_2.style.translate = row ? dy_0 + "px 0" : "0 " + dy_0 + "px";
    }
    reflow(list.current);
    for (const [r_3] of moved) {
      delete r_3.dataset.flip;
      r_3.style.translate = "";
    }
  });
  useIsoLayoutEffect(() => {
    const p_4 = pointerRef.current;
    const rows_1 = list.current ? [...list.current.children] : [];
    for (const r_4 of rows_1) {
      if (p_4 && drag && drag.pointer && r_4.dataset.key === String(drag.key)) {
        r_4.style.transform = "";
        r_4.style.transform = (row ? "translateX(" : "translateY(") + Math.round(along(p_4) - grab(p_4) - lead(r_4.getBoundingClientRect())) + "px)";
      } else {
        if (r_4.style.transform) {
          r_4.style.transform = "";
        }
      }
    }
  });
  const name_0 = props.reorderLabel || sds.labels.reorder;
  const api = useLatest({
    click: (key_2, index_0) => onClick(key_2, index_0)(),
    keyDown: onKeyDown,
    blur: onBlur,
    pointerDown: (key_3, e_1) => onPointerDown(key_3)(e_1),
    handle: (key_4, n_0) => {
      if (n_0) {
        handles.current.set(key_4, n_0);
      } else {
        handles.current.delete(key_4);
      }
    }
  });
  const mergedRef = useMergedRef(ref, (n_1) => {
    list.current = n_1;
  });
  const t6 = "list";
  const t7 = cn("srp-sortable-list", drag && "srp-sortable-list--sorting", props.disabled && "srp-sortable-list--disabled", props.className);
  const t8 = "sortable-list";
  const t9 = row ? "horizontal" : void 0;
  const t10 = shown.map((it_3, index_1) => {
    const key_5 = getKey(it_3);
    const dragging = !!drag && drag.key === key_5;
    return /* @__PURE__ */ React.createElement(SortableRow, { key: key_5, item: it_3, itemKey: key_5, name: name_0 + " " + label(it_3), index: index_1, dragging, pressed: dragging && !drag.pointer, disabled: !!props.disabled, hint: hintId, renderItem: props.renderItem, api });
  });
  let t11;
  if ($[9] !== mergedRef || $[10] !== rest || $[11] !== t10 || $[12] !== t7 || $[13] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("ul", { role: t6, ...rest, ref: mergedRef, className: t7, "data-component": t8, "data-orientation": t9 }, t10);
    $[9] = mergedRef;
    $[10] = rest;
    $[11] = t10;
    $[12] = t7;
    $[13] = t9;
    $[14] = t11;
  } else {
    t11 = $[14];
  }
  let t12;
  if ($[15] !== hintId || $[16] !== props.disabled || $[17] !== sds) {
    t12 = props.disabled ? null : /* @__PURE__ */ React.createElement("span", { hidden: true, id: hintId }, sds.labels.reorderInstructions);
    $[15] = hintId;
    $[16] = props.disabled;
    $[17] = sds;
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  let t13;
  if ($[19] !== t11 || $[20] !== t12) {
    t13 = /* @__PURE__ */ React.createElement(React.Fragment, null, t11, t12);
    $[19] = t11;
    $[20] = t12;
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  return t13;
}
var SortableList = /* @__PURE__ */ named("SortableList", SortableListRender);
var SortableRow = /* @__PURE__ */ React.memo(function SortableRow2(props) {
  const $ = _c(23);
  const {
    itemKey: key,
    index,
    dragging,
    api
  } = props;
  const t0 = String(key);
  const t1 = dragging && "srp-sortable-list__item--dragging";
  let t2;
  if ($[0] !== t1) {
    t2 = cn("srp-sortable-list__item", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = dragging ? "dragging" : void 0;
  let t4;
  if ($[2] !== api || $[3] !== index || $[4] !== key || $[5] !== props.disabled || $[6] !== props.hint || $[7] !== props.name || $[8] !== props.pressed) {
    t4 = props.disabled ? null : /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-sortable-list__handle", "aria-label": props.name, "aria-describedby": props.hint, "aria-pressed": props.pressed, ref: (n) => api.current.handle(key, n), onClick: () => api.current.click(key, index), onKeyDown: (e) => api.current.keyDown(e), onBlur: () => api.current.blur(), onPointerDown: (e_0) => api.current.pointerDown(key, e_0) }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.DragIndicator }));
    $[2] = api;
    $[3] = index;
    $[4] = key;
    $[5] = props.disabled;
    $[6] = props.hint;
    $[7] = props.name;
    $[8] = props.pressed;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  let t5;
  if ($[10] !== dragging || $[11] !== index || $[12] !== props.item || $[13] !== props.renderItem) {
    t5 = props.renderItem(props.item, {
      index,
      dragging
    });
    $[10] = dragging;
    $[11] = index;
    $[12] = props.item;
    $[13] = props.renderItem;
    $[14] = t5;
  } else {
    t5 = $[14];
  }
  let t6;
  if ($[15] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("div", { className: "srp-sortable-list__content" }, t5);
    $[15] = t5;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  let t7;
  if ($[17] !== t0 || $[18] !== t2 || $[19] !== t3 || $[20] !== t4 || $[21] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("li", { "data-key": t0, className: t2, "data-state": t3 }, t4, t6);
    $[17] = t0;
    $[18] = t2;
    $[19] = t3;
    $[20] = t4;
    $[21] = t6;
    $[22] = t7;
  } else {
    t7 = $[22];
  }
  return t7;
});
function move(items, from, to) {
  const out = items.slice();
  const [it] = out.splice(from, 1);
  if (it !== void 0) out.splice(to, 0, it);
  return out;
}
export {
  SortableList
};
//# sourceMappingURL=SortableList.js.map
