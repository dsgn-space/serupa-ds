"use client";

// src/components/TreeView/TreeView.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { named } from "../../internal/component.js";
import { isComposing } from "../../internal/ime.js";
import { lastInputKeyboard, listenForInput } from "../../internal/lastInput.js";
import { typeahead, typing } from "../../internal/typeahead.js";
import { Icon } from "../Icon/Icon.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { asIcon } from "../Icon/asIcon.js";
import * as icons from "../../material/builtin.js";
import { useControllable } from "../../internal/controllable.js";
import { isRtl } from "../../internal/position.js";
function publish(st, next) {
  const before = {
    open: st.open,
    value: st.value,
    mixed: st.mixed,
    tab: st.tab,
    mode: st.mode
  };
  st.open = next.open;
  st.value = next.value;
  st.mixed = next.mixed;
  st.tab = next.tab;
  st.mode = next.mode;
  const tell = (id) => {
    const l = id == null ? void 0 : st.listeners.get(id);
    if (l) l();
  };
  if (before.mode !== next.mode) {
    st.listeners.forEach((l) => l());
    return;
  }
  const diff = (a, b) => {
    if (a !== b) {
      a.forEach((id) => {
        if (!b.has(id)) tell(id);
      });
      b.forEach((id) => {
        if (!a.has(id)) tell(id);
      });
    }
  };
  diff(before.open, next.open);
  diff(before.value, next.value);
  diff(before.mixed, next.mixed);
  if (before.tab !== next.tab) {
    tell(before.tab);
    tell(next.tab);
  }
}
var TreeContext = /* @__PURE__ */ React.createContext(null);
var textOf = (it) => it.textValue ?? (typeof it.label === "string" || typeof it.label === "number" ? String(it.label) : "");
var opens = (it) => it.children !== void 0;
var within = (item, id) => !!item.children && item.children.some((c) => c.id === id || within(c, id));
var NO_MIXED = /* @__PURE__ */ new Set();
function leavesOf(items) {
  const all = /* @__PURE__ */ new Map(), usable = /* @__PURE__ */ new Map(), order = [];
  const walk = (it, off) => {
    order.push(it);
    const dead = off || !!it.disabled;
    let a = [], u = [];
    if (it.children && it.children.length) for (const c of it.children) {
      const [ca, cu] = walk(c, dead);
      a = a.concat(ca);
      u = u.concat(cu);
    }
    else {
      a = [it.id];
      u = dead ? [] : [it.id];
    }
    all.set(it.id, a);
    usable.set(it.id, u);
    return [a, u];
  };
  for (const it of items) walk(it, false);
  return {
    all,
    usable,
    order
  };
}
function TreeViewRender(t0) {
  const $ = _c(146);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("TreeView", NAME_HOW.label);
  const rest = omit(props, {
    cascade: 1,
    cascadeValue: 1,
    items: 1,
    selectionMode: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    expanded: 1,
    defaultExpanded: 1,
    onExpandedChange: 1,
    className: 1,
    onKeyDown: 1
  });
  const mode = props.selectionMode || "single";
  const multi = mode === "multiple";
  const cascade = multi && !!props.cascade;
  let t1;
  if ($[0] !== props.defaultValue) {
    t1 = props.defaultValue || [];
    $[0] = props.defaultValue;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [value, setOwnValue, valueControlled] = useControllable(props.value, t1, "TreeView", "value");
  let t2;
  if ($[2] !== props.defaultExpanded) {
    t2 = props.defaultExpanded || [];
    $[2] = props.defaultExpanded;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const [open, setOwnOpen, openControlled] = useControllable(props.expanded, t2, "TreeView", "expanded");
  const root = React.useRef(null);
  const styled = useServerStyles();
  let t3;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      text: "",
      at: 0
    };
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const typed = React.useRef(t3);
  const anchor = React.useRef(null);
  const [focusId, setFocusId] = React.useState(null);
  const moveFocus = React.useRef(false);
  let out;
  if ($[5] !== open || $[6] !== props.items) {
    out = [];
    let t42;
    if ($[8] !== open) {
      t42 = new Set(open);
      $[8] = open;
      $[9] = t42;
    } else {
      t42 = $[9];
    }
    const isOpen = t42;
    const walk = (list, level, parent) => list.forEach((item) => {
      out.push({
        item,
        level,
        parent
      });
      if (item.children && isOpen.has(item.id)) {
        walk(item.children, level + 1, item.id);
      }
    });
    walk(props.items, 1, null);
    $[5] = open;
    $[6] = props.items;
    $[7] = out;
  } else {
    out = $[7];
  }
  const rows = out;
  let t4;
  if ($[10] !== rows) {
    t4 = new Map(rows.map(_temp));
    $[10] = rows;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  const at = t4;
  let t5;
  if ($[12] !== at) {
    t5 = (id) => {
      const n_0 = id == null ? void 0 : at.get(id);
      return n_0 === void 0 ? -1 : n_0;
    };
    $[12] = at;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const index = t5;
  let t6;
  if ($[14] !== open) {
    t6 = new Set(open);
    $[14] = open;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  const openSet = t6;
  let t7;
  if ($[16] !== cascade || $[17] !== props.items) {
    t7 = cascade ? leavesOf(props.items) : null;
    $[16] = cascade;
    $[17] = props.items;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  const leaves = t7;
  let out_0;
  if ($[19] !== leaves || $[20] !== value) {
    out_0 = /* @__PURE__ */ new Set();
    if (leaves) {
      for (const id_0 of value) {
        for (const l of leaves.all.get(id_0) || []) {
          out_0.add(l);
        }
      }
    }
    $[19] = leaves;
    $[20] = value;
    $[21] = out_0;
  } else {
    out_0 = $[21];
  }
  const leafSet = out_0;
  let t8;
  bb0: {
    if (!leaves) {
      let t93;
      if ($[22] !== value) {
        t93 = new Set(value);
        $[22] = value;
        $[23] = t93;
      } else {
        t93 = $[23];
      }
      let t102;
      if ($[24] !== t93) {
        t102 = [t93, NO_MIXED];
        $[24] = t93;
        $[25] = t102;
      } else {
        t102 = $[25];
      }
      t8 = t102;
      break bb0;
    }
    let on;
    let some;
    if ($[26] !== leafSet || $[27] !== leaves.all) {
      on = /* @__PURE__ */ new Set();
      some = /* @__PURE__ */ new Set();
      leaves.all.forEach((ls, id_1) => {
        const n_1 = ls.filter((l_0) => leafSet.has(l_0)).length;
        if (n_1 && n_1 === ls.length) {
          on.add(id_1);
        } else {
          if (n_1) {
            some.add(id_1);
          }
        }
      });
      $[26] = leafSet;
      $[27] = leaves.all;
      $[28] = on;
      $[29] = some;
    } else {
      on = $[28];
      some = $[29];
    }
    let t92;
    if ($[30] !== on || $[31] !== some) {
      t92 = [on, some];
      $[30] = on;
      $[31] = some;
      $[32] = t92;
    } else {
      t92 = $[32];
    }
    t8 = t92;
  }
  const [valueSet, mixedSet] = t8;
  let t9;
  if ($[33] !== leaves || $[34] !== props.cascadeValue) {
    t9 = (set) => {
      if (!leaves) {
        return [];
      }
      const kids = props.cascadeValue === "leaves";
      return leaves.order.filter((it) => {
        const ls_0 = leaves.all.get(it.id) || [];
        return (!kids || ls_0.length === 1 && ls_0[0] === it.id) && ls_0.every((l_1) => set.has(l_1));
      }).map(_temp2);
    };
    $[33] = leaves;
    $[34] = props.cascadeValue;
    $[35] = t9;
  } else {
    t9 = $[35];
  }
  const report = t9;
  const flip = (items, on_0) => {
    if (!leaves) {
      return;
    }
    const use = items.flatMap((it_1) => leaves.usable.get(it_1.id) || []);
    if (!use.length) {
      return;
    }
    const add = on_0 ?? !use.every((l_2) => leafSet.has(l_2));
    const next = new Set(leafSet);
    for (const l_3 of use) {
      if (add) {
        next.add(l_3);
      } else {
        next.delete(l_3);
      }
    }
    pick(report(next));
  };
  let t10;
  if ($[36] !== focusId || $[37] !== index || $[38] !== rows || $[39] !== value || $[40] !== valueSet) {
    t10 = index(focusId) >= 0 ? focusId : (value.length && rows.find((r_0) => valueSet.has(r_0.item.id)) || rows[0])?.item.id ?? null;
    $[36] = focusId;
    $[37] = index;
    $[38] = rows;
    $[39] = value;
    $[40] = valueSet;
    $[41] = t10;
  } else {
    t10 = $[41];
  }
  const tabStop = t10;
  let t11;
  if ($[42] !== focusId) {
    t11 = function() {
      if (!moveFocus.current || !root.current) {
        return;
      }
      moveFocus.current = false;
      const el = focusId == null ? null : root.current.querySelector('[role=treeitem][data-id="' + CSS.escape(focusId) + '"]');
      if (el) {
        el.focus();
      }
    };
    $[42] = focusId;
    $[43] = t11;
  } else {
    t11 = $[43];
  }
  let t12;
  if ($[44] !== focusId || $[45] !== rows) {
    t12 = [focusId, rows];
    $[44] = focusId;
    $[45] = rows;
    $[46] = t12;
  } else {
    t12 = $[46];
  }
  useIsoLayoutEffect(t11, t12);
  let t13;
  if ($[47] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = (id_2) => {
      moveFocus.current = true;
      setFocusId(id_2);
    };
    $[47] = t13;
  } else {
    t13 = $[47];
  }
  const go = t13;
  const focusedIn = React.useRef(false);
  const lastAt = React.useRef(-1);
  let t14;
  if ($[48] !== focusId || $[49] !== go || $[50] !== index || $[51] !== props.items || $[52] !== rows) {
    t14 = function() {
      const at_0 = index(focusId);
      if (at_0 >= 0) {
        lastAt.current = at_0;
        return;
      }
      const active = document.activeElement;
      const r_1 = root.current;
      if (focusId == null || !rows.length || !r_1 || !focusedIn.current || active && active !== document.body && active.isConnected && !r_1.contains(active)) {
        return;
      }
      const up = (list_0) => {
        for (const x of list_0) {
          if (x.id === focusId) {
            return [];
          }
          const p = x.children ? up(x.children) : null;
          if (p) {
            return [x.id].concat(p);
          }
        }
        return null;
      };
      const parents = up(props.items) || [];
      const parent_0 = parents.reverse().find((p_0) => index(p_0) >= 0);
      const near = rows[Math.min(Math.max(lastAt.current, 0), rows.length - 1)];
      if (parent_0 != null) {
        go(parent_0);
      } else {
        if (near) {
          go(near.item.id);
        }
      }
    };
    $[48] = focusId;
    $[49] = go;
    $[50] = index;
    $[51] = props.items;
    $[52] = rows;
    $[53] = t14;
  } else {
    t14 = $[53];
  }
  let t15;
  if ($[54] !== focusId || $[55] !== rows) {
    t15 = [rows, focusId];
    $[54] = focusId;
    $[55] = rows;
    $[56] = t15;
  } else {
    t15 = $[56];
  }
  useIsoLayoutEffect(t14, t15);
  const pick = (next_0) => {
    if (next_0.length === value.length && next_0.every((v, n_2) => cascade ? value[n_2] === v : valueSet.has(v))) {
      return;
    }
    if (!valueControlled) {
      setOwnValue(next_0);
    }
    if (props.onValueChange) {
      props.onValueChange(next_0);
    }
  };
  const [keyed, setKeyed] = React.useState(false);
  let t16;
  if ($[57] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = [];
    $[57] = t16;
  } else {
    t16 = $[57];
  }
  useIsoLayoutEffect(listenForInput, t16);
  let t17;
  if ($[58] !== openControlled || $[59] !== props || $[60] !== setOwnOpen) {
    t17 = (next_1) => {
      setKeyed(lastInputKeyboard());
      if (!openControlled) {
        setOwnOpen(next_1);
      }
      if (props.onExpandedChange) {
        props.onExpandedChange(next_1);
      }
    };
    $[58] = openControlled;
    $[59] = props;
    $[60] = setOwnOpen;
    $[61] = t17;
  } else {
    t17 = $[61];
  }
  const setOpen = t17;
  let t18;
  if ($[62] !== focusId || $[63] !== go || $[64] !== open || $[65] !== openSet || $[66] !== setOpen) {
    t18 = (item_0) => {
      if (item_0.disabled || !opens(item_0)) {
        return;
      }
      const was = openSet.has(item_0.id);
      setOpen(was ? open.filter((x_0) => x_0 !== item_0.id) : open.concat(item_0.id));
      if (was && focusId && within(item_0, focusId)) {
        go(item_0.id);
      }
    };
    $[62] = focusId;
    $[63] = go;
    $[64] = open;
    $[65] = openSet;
    $[66] = setOpen;
    $[67] = t18;
  } else {
    t18 = $[67];
  }
  const toggleOpen = t18;
  let t19;
  if ($[68] !== cascade || $[69] !== flip || $[70] !== index || $[71] !== mode || $[72] !== multi || $[73] !== pick || $[74] !== rows || $[75] !== value || $[76] !== valueSet) {
    t19 = (item_1, t202) => {
      const range = t202 === void 0 ? false : t202;
      if (item_1.disabled || mode === "none") {
        return;
      }
      const id_3 = item_1.id;
      if (!multi) {
        if (value.length !== 1 || value[0] !== id_3) {
          pick([id_3]);
        }
        anchor.current = id_3;
        return;
      }
      const a = index(anchor.current);
      if (cascade && range && a >= 0) {
        flip(rows.slice(Math.min(a, index(id_3)), Math.max(a, index(id_3)) + 1).map(_temp3), true);
        return;
      }
      if (cascade) {
        flip([item_1]);
        anchor.current = id_3;
        return;
      }
      if (range && a >= 0) {
        const b = index(id_3);
        const span = rows.slice(Math.min(a, b), Math.max(a, b) + 1).filter(_temp4).map(_temp5);
        const inSpan = new Set(span);
        pick(value.filter((v_0) => !inSpan.has(v_0)).concat(span));
        return;
      }
      pick(valueSet.has(id_3) ? value.filter((v_1) => v_1 !== id_3) : value.concat(id_3));
      anchor.current = id_3;
    };
    $[68] = cascade;
    $[69] = flip;
    $[70] = index;
    $[71] = mode;
    $[72] = multi;
    $[73] = pick;
    $[74] = rows;
    $[75] = value;
    $[76] = valueSet;
    $[77] = t19;
  } else {
    t19 = $[77];
  }
  const choose = t19;
  let t20;
  if ($[78] !== cascade || $[79] !== choose || $[80] !== flip || $[81] !== go || $[82] !== index || $[83] !== mode || $[84] !== multi || $[85] !== open || $[86] !== openSet || $[87] !== pick || $[88] !== props || $[89] !== rows || $[90] !== setOpen || $[91] !== toggleOpen) {
    t20 = function(e) {
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
      const t = e.target instanceof HTMLElement ? e.target.closest("[role=treeitem]") : null;
      if (e.defaultPrevented || !t || !root.current || e.altKey || isComposing(e)) {
        return;
      }
      const i = index(t.dataset.id || null);
      const r_2 = rows[i];
      if (!r_2) {
        return;
      }
      const item_2 = r_2.item;
      const rtl = (e.key === "ArrowLeft" || e.key === "ArrowRight") && isRtl(root.current);
      const isOpen_0 = openSet.has(item_2.id);
      let to = -1;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        to = Math.min(rows.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)));
        const row = rows[to];
        if (multi && e.shiftKey && to !== i && row) {
          if (cascade) {
            flip([row.item], true);
          } else {
            choose(row.item);
          }
        }
      } else {
        if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
          if (opens(item_2) && !isOpen_0) {
            toggleOpen(item_2);
          } else {
            if (isOpen_0 && item_2.children && item_2.children.length) {
              to = i + 1;
            }
          }
        } else {
          if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
            if (isOpen_0 && !item_2.disabled) {
              toggleOpen(item_2);
            } else {
              if (r_2.parent != null) {
                to = index(r_2.parent);
              }
            }
          } else {
            if (e.key === "Home") {
              to = 0;
            } else {
              if (e.key === "End") {
                to = rows.length - 1;
              } else {
                if (e.key === "Enter" || e.key === " " && !typing(typed.current)) {
                  if (mode === "none") {
                    toggleOpen(item_2);
                  } else {
                    choose(item_2, multi && e.shiftKey);
                  }
                } else {
                  if (e.key === "*") {
                    const shut = rows.filter((x_4) => x_4.parent === r_2.parent && opens(x_4.item) && !x_4.item.disabled && !openSet.has(x_4.item.id));
                    if (shut.length) {
                      setOpen(open.concat(shut.map(_temp6)));
                    }
                  } else {
                    if (multi && (e.ctrlKey || e.metaKey) && (/^[\x20-\x7e]$/.test(e.key) ? e.key.toLowerCase() === "a" : e.code === "KeyA")) {
                      if (cascade) {
                        flip(props.items, true);
                      } else {
                        pick(rows.filter(_temp7).map(_temp8));
                      }
                    } else {
                      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        to = typeahead(typed.current, e.key, rows.map(_temp9), i);
                      } else {
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
      const dest = rows[to];
      if (dest && to !== i) {
        go(dest.item.id);
      }
    };
    $[78] = cascade;
    $[79] = choose;
    $[80] = flip;
    $[81] = go;
    $[82] = index;
    $[83] = mode;
    $[84] = multi;
    $[85] = open;
    $[86] = openSet;
    $[87] = pick;
    $[88] = props;
    $[89] = rows;
    $[90] = setOpen;
    $[91] = toggleOpen;
    $[92] = t20;
  } else {
    t20 = $[92];
  }
  const onKeyDown = t20;
  const shown = cascade ? "cascade" : mode;
  let t21;
  if ($[93] !== mixedSet || $[94] !== openSet || $[95] !== shown || $[96] !== tabStop || $[97] !== valueSet) {
    t21 = () => ({
      open: openSet,
      value: valueSet,
      mixed: mixedSet,
      tab: tabStop,
      mode: shown,
      listeners: /* @__PURE__ */ new Map()
    });
    $[93] = mixedSet;
    $[94] = openSet;
    $[95] = shown;
    $[96] = tabStop;
    $[97] = valueSet;
    $[98] = t21;
  } else {
    t21 = $[98];
  }
  const [st] = React.useState(t21);
  let t22;
  let t23;
  if ($[99] !== mixedSet || $[100] !== openSet || $[101] !== shown || $[102] !== st || $[103] !== tabStop || $[104] !== valueSet) {
    t22 = function() {
      publish(st, {
        open: openSet,
        value: valueSet,
        mixed: mixedSet,
        tab: tabStop,
        mode: shown
      });
    };
    t23 = [st, openSet, valueSet, mixedSet, tabStop, shown];
    $[99] = mixedSet;
    $[100] = openSet;
    $[101] = shown;
    $[102] = st;
    $[103] = tabStop;
    $[104] = valueSet;
    $[105] = t22;
    $[106] = t23;
  } else {
    t22 = $[105];
    t23 = $[106];
  }
  useIsoLayoutEffect(t22, t23);
  let t24;
  if ($[107] !== focusId) {
    t24 = (id_4) => {
      if (focusId !== id_4) {
        setFocusId(id_4);
      }
    };
    $[107] = focusId;
    $[108] = t24;
  } else {
    t24 = $[108];
  }
  let t25;
  if ($[109] !== choose || $[110] !== mode || $[111] !== multi || $[112] !== toggleOpen) {
    t25 = (item_3, e_0) => {
      setFocusId(item_3.id);
      if (mode === "none") {
        toggleOpen(item_3);
      } else {
        choose(item_3, multi && e_0.shiftKey);
      }
    };
    $[109] = choose;
    $[110] = mode;
    $[111] = multi;
    $[112] = toggleOpen;
    $[113] = t25;
  } else {
    t25 = $[113];
  }
  let t26;
  if ($[114] !== toggleOpen) {
    t26 = (item_4) => {
      setFocusId(item_4.id);
      toggleOpen(item_4);
    };
    $[114] = toggleOpen;
    $[115] = t26;
  } else {
    t26 = $[115];
  }
  let t27;
  if ($[116] !== t24 || $[117] !== t25 || $[118] !== t26) {
    t27 = {
      focus: t24,
      press: t25,
      toggle: t26
    };
    $[116] = t24;
    $[117] = t25;
    $[118] = t26;
    $[119] = t27;
  } else {
    t27 = $[119];
  }
  const api = useLatest(t27);
  let t28;
  if ($[120] !== api || $[121] !== st) {
    t28 = {
      store: st,
      api
    };
    $[120] = api;
    $[121] = st;
    $[122] = t28;
  } else {
    t28 = $[122];
  }
  const ctx = t28;
  let t29;
  if ($[123] !== nameRef || $[124] !== styled) {
    t29 = (n_3) => {
      root.current = n_3;
      nameRef(n_3);
      styled(n_3);
    };
    $[123] = nameRef;
    $[124] = styled;
    $[125] = t29;
  } else {
    t29 = $[125];
  }
  const mergedRef = useMergedRef(ref, t29);
  const t30 = multi && !cascade || void 0;
  let t31;
  if ($[126] !== props.className) {
    t31 = cn("srp-tree-view", props.className);
    $[126] = props.className;
    $[127] = t31;
  } else {
    t31 = $[127];
  }
  const t32 = keyed ? "" : void 0;
  let t33;
  let t34;
  if ($[128] !== rest) {
    t33 = (e_1) => {
      focusedIn.current = true;
      if (rest.onFocus) {
        rest.onFocus(e_1);
      }
    };
    t34 = (e_2) => {
      if (e_2.relatedTarget && !e_2.currentTarget.contains(e_2.relatedTarget)) {
        focusedIn.current = false;
      }
      if (rest.onBlur) {
        rest.onBlur(e_2);
      }
    };
    $[128] = rest;
    $[129] = t33;
    $[130] = t34;
  } else {
    t33 = $[129];
    t34 = $[130];
  }
  let t35;
  if ($[131] !== props.items) {
    t35 = /* @__PURE__ */ React.createElement(Rows, { list: props.items, level: 1 });
    $[131] = props.items;
    $[132] = t35;
  } else {
    t35 = $[132];
  }
  let t36;
  if ($[133] !== ctx || $[134] !== t35) {
    t36 = /* @__PURE__ */ React.createElement(TreeContext.Provider, { value: ctx }, t35);
    $[133] = ctx;
    $[134] = t35;
    $[135] = t36;
  } else {
    t36 = $[135];
  }
  let t37;
  if ($[136] !== mergedRef || $[137] !== onKeyDown || $[138] !== rest || $[139] !== t30 || $[140] !== t31 || $[141] !== t32 || $[142] !== t33 || $[143] !== t34 || $[144] !== t36) {
    t37 = /* @__PURE__ */ React.createElement("ul", { ...rest, ref: mergedRef, role: "tree", "aria-multiselectable": t30, className: t31, "data-component": "tree-view", "data-instant": t32, onKeyDown, onFocus: t33, onBlur: t34 }, t36);
    $[136] = mergedRef;
    $[137] = onKeyDown;
    $[138] = rest;
    $[139] = t30;
    $[140] = t31;
    $[141] = t32;
    $[142] = t33;
    $[143] = t34;
    $[144] = t36;
    $[145] = t37;
  } else {
    t37 = $[145];
  }
  return t37;
}
function _temp9(x_8) {
  return textOf(x_8.item);
}
function _temp8(x_7) {
  return x_7.item.id;
}
function _temp7(x_6) {
  return !x_6.item.disabled;
}
function _temp6(x_5) {
  return x_5.item.id;
}
function _temp5(x_3) {
  return x_3.item.id;
}
function _temp4(x_2) {
  return !x_2.item.disabled;
}
function _temp3(x_1) {
  return x_1.item;
}
function _temp2(it_0) {
  return it_0.id;
}
function _temp(r, n) {
  return [r.item.id, n];
}
var TreeView = /* @__PURE__ */ named("TreeView", TreeViewRender);
var Rows = /* @__PURE__ */ React.memo(function Rows2(props) {
  const $ = _c(8);
  let t0;
  if ($[0] !== props.level || $[1] !== props.list) {
    let t12;
    if ($[3] !== props.level || $[4] !== props.list.length) {
      t12 = (item, n) => /* @__PURE__ */ React.createElement(TreeRow, { key: item.id, item, level: props.level, pos: n + 1, size: props.list.length });
      $[3] = props.level;
      $[4] = props.list.length;
      $[5] = t12;
    } else {
      t12 = $[5];
    }
    t0 = props.list.map(t12);
    $[0] = props.level;
    $[1] = props.list;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  let t1;
  if ($[6] !== t0) {
    t1 = /* @__PURE__ */ React.createElement(React.Fragment, null, t0);
    $[6] = t0;
    $[7] = t1;
  } else {
    t1 = $[7];
  }
  return t1;
});
var TreeRow = /* @__PURE__ */ React.memo(function TreeRow2(props) {
  const $ = _c(65);
  const {
    store,
    api
  } = React.useContext(TreeContext);
  const {
    item,
    level
  } = props;
  const id = item.id;
  let t0;
  if ($[0] !== id || $[1] !== store) {
    t0 = (l) => {
      store.listeners.set(id, l);
      return () => {
        if (store.listeners.get(id) === l) {
          store.listeners.delete(id);
        }
      };
    };
    $[0] = id;
    $[1] = store;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const subscribe = t0;
  let t1;
  if ($[3] !== id || $[4] !== store) {
    t1 = () => (store.open.has(id) ? "o" : "-") + (store.value.has(id) ? "p" : store.mixed.has(id) ? "m" : "-") + (store.tab === id ? "t" : "-") + store.mode;
    $[3] = id;
    $[4] = store;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  const snap = t1;
  const key = React.useSyncExternalStore(subscribe, snap, snap);
  let t2;
  if ($[6] !== item) {
    t2 = opens(item);
    $[6] = item;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  const canOpen = t2;
  const isOpen = canOpen && key[0] === "o";
  const picked = key[1] === "p";
  let t3;
  if ($[8] !== key) {
    t3 = key.slice(3);
    $[8] = key;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const mode = t3;
  const checks = mode === "cascade";
  const checked = picked ? true : key[1] === "m" ? "mixed" : false;
  let t4;
  if ($[10] !== item.icon) {
    t4 = item.icon != null ? asIcon(item.icon) : null;
    $[10] = item.icon;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  const icon = t4;
  const t5 = key[2] === "t" ? 0 : -1;
  const t6 = props.pos;
  const t7 = props.size;
  const t8 = canOpen ? isOpen : void 0;
  const t9 = canOpen ? isOpen ? "open" : "closed" : void 0;
  const t10 = mode === "none" || checks ? void 0 : mode === "multiple" ? picked : picked || void 0;
  const t11 = checks ? checked : void 0;
  const t12 = item.disabled || void 0;
  const t13 = picked && !checks && "srp-tree-view__item--selected";
  const t14 = item.disabled && "srp-tree-view__item--disabled";
  let t15;
  if ($[12] !== t13 || $[13] !== t14) {
    t15 = cn("srp-tree-view__item", t13, t14);
    $[12] = t13;
    $[13] = t14;
    $[14] = t15;
  } else {
    t15 = $[14];
  }
  let t16;
  if ($[15] !== api.current || $[16] !== id) {
    t16 = (e) => {
      if (e.target === e.currentTarget) {
        api.current.focus(id);
      }
    };
    $[15] = api.current;
    $[16] = id;
    $[17] = t16;
  } else {
    t16 = $[17];
  }
  const t17 = level - 1;
  let t18;
  if ($[18] !== t17) {
    t18 = {
      "--srp-tree-level": t17
    };
    $[18] = t17;
    $[19] = t18;
  } else {
    t18 = $[19];
  }
  const t19 = t18;
  let t20;
  if ($[20] !== api.current || $[21] !== item) {
    t20 = (e_0) => api.current.press(item, e_0);
    $[20] = api.current;
    $[21] = item;
    $[22] = t20;
  } else {
    t20 = $[22];
  }
  let t21;
  if ($[23] !== api.current || $[24] !== canOpen || $[25] !== item) {
    t21 = canOpen ? (e_1) => {
      e_1.stopPropagation();
      api.current.toggle(item);
    } : void 0;
    $[23] = api.current;
    $[24] = canOpen;
    $[25] = item;
    $[26] = t21;
  } else {
    t21 = $[26];
  }
  let t22;
  if ($[27] !== canOpen) {
    t22 = canOpen ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, mirror: false }) : null;
    $[27] = canOpen;
    $[28] = t22;
  } else {
    t22 = $[28];
  }
  let t23;
  if ($[29] !== t21 || $[30] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("span", { className: "srp-tree-view__toggle", "aria-hidden": "true", onClick: t21 }, t22);
    $[29] = t21;
    $[30] = t22;
    $[31] = t23;
  } else {
    t23 = $[31];
  }
  let t24;
  if ($[32] !== checked || $[33] !== checks) {
    t24 = checks ? /* @__PURE__ */ React.createElement("span", { className: "srp-tree-view__check", "aria-hidden": "true", "data-state": checked === true ? "checked" : checked === "mixed" ? "mixed" : "unchecked" }, checked === true ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check }) : checked === "mixed" ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Remove }) : null) : null;
    $[32] = checked;
    $[33] = checks;
    $[34] = t24;
  } else {
    t24 = $[34];
  }
  let t25;
  if ($[35] !== icon) {
    t25 = icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-tree-view__icon", "aria-hidden": "true" }, icon) : null;
    $[35] = icon;
    $[36] = t25;
  } else {
    t25 = $[36];
  }
  let t26;
  if ($[37] !== item.label) {
    t26 = /* @__PURE__ */ React.createElement("span", { className: "srp-tree-view__label" }, item.label);
    $[37] = item.label;
    $[38] = t26;
  } else {
    t26 = $[38];
  }
  let t27;
  if ($[39] !== t19 || $[40] !== t20 || $[41] !== t23 || $[42] !== t24 || $[43] !== t25 || $[44] !== t26) {
    t27 = /* @__PURE__ */ React.createElement("div", { className: "srp-tree-view__row", style: t19, onClick: t20 }, t23, t24, t25, t26);
    $[39] = t19;
    $[40] = t20;
    $[41] = t23;
    $[42] = t24;
    $[43] = t25;
    $[44] = t26;
    $[45] = t27;
  } else {
    t27 = $[45];
  }
  let t28;
  if ($[46] !== isOpen || $[47] !== item.children || $[48] !== level) {
    t28 = isOpen && item.children && item.children.length ? /* @__PURE__ */ React.createElement("ul", { role: "group", className: "srp-tree-view__group" }, /* @__PURE__ */ React.createElement(Rows, { list: item.children, level: level + 1 })) : null;
    $[46] = isOpen;
    $[47] = item.children;
    $[48] = level;
    $[49] = t28;
  } else {
    t28 = $[49];
  }
  let t29;
  if ($[50] !== id || $[51] !== level || $[52] !== props.pos || $[53] !== props.size || $[54] !== t10 || $[55] !== t11 || $[56] !== t12 || $[57] !== t15 || $[58] !== t16 || $[59] !== t27 || $[60] !== t28 || $[61] !== t5 || $[62] !== t8 || $[63] !== t9) {
    t29 = /* @__PURE__ */ React.createElement("li", { role: "treeitem", "data-id": id, tabIndex: t5, "aria-level": level, "aria-posinset": t6, "aria-setsize": t7, "aria-expanded": t8, "data-state": t9, "aria-selected": t10, "aria-checked": t11, "aria-disabled": t12, className: t15, onFocus: t16 }, t27, t28);
    $[50] = id;
    $[51] = level;
    $[52] = props.pos;
    $[53] = props.size;
    $[54] = t10;
    $[55] = t11;
    $[56] = t12;
    $[57] = t15;
    $[58] = t16;
    $[59] = t27;
    $[60] = t28;
    $[61] = t5;
    $[62] = t8;
    $[63] = t9;
    $[64] = t29;
  } else {
    t29 = $[64];
  }
  return t29;
});
export {
  TreeView
};
//# sourceMappingURL=TreeView.js.map
