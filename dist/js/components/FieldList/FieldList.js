"use client";

// src/components/FieldList/FieldList.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect, useLatest, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useControllable } from "../../internal/controllable.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { SortableList } from "../SortableList/SortableList.js";
import { en as words } from "./labels.js";
import { en as tagWords } from "../TagGroup/labels.js";
import { en as comboWords } from "../Combobox/labels.js";
var OWN = {
  label: 1,
  hint: 1,
  itemLabel: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  newItem: 1,
  children: 1,
  addLabel: 1,
  min: 1,
  max: 1,
  name: 1,
  error: 1,
  errors: 1,
  reorderable: 1,
  className: 1
};
var allWords = /* @__PURE__ */ Object.assign({}, words, tagWords, comboWords);
var FIELD = 'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';
var firstField = (row) => row ? Array.from(row.querySelectorAll(FIELD)).find((e) => !e.closest(".srp-field-list__remove, .srp-sortable-list__handle")) || null : null;
var shows = (v) => v != null && v !== false && v !== "";
function RowFields({
  fields,
  value,
  state
}) {
  return fields(value, state);
}
function FieldListRender(t0) {
  const $ = _c(52);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const L = useSettings(allWords).labels;
  const locale = useLocale();
  const base = domId("srp-fl", React.useId());
  const min = Math.max(0, Math.floor(props.min || 0));
  const max = props.max != null && props.max >= Math.max(1, min) ? Math.floor(props.max) : Infinity;
  const {
    newItem,
    itemLabel,
    onValueChange
  } = props;
  const [start] = React.useState(() => props.defaultValue ? props.defaultValue.slice() : Array.from({
    length: min
  }, () => newItem()));
  const [rows, setOwn] = useControllable(props.value, start, "FieldList", "value");
  let t1;
  if ($[0] !== rows) {
    t1 = () => ({
      keys: rows.map(_temp),
      next: rows.length
    });
    $[0] = rows;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [keyed, setKeyed] = React.useState(t1);
  let shown = keyed;
  if (shown.keys.length !== rows.length) {
    let next;
    let padded;
    if ($[2] !== rows.length || $[3] !== shown.keys || $[4] !== shown.next) {
      padded = shown.keys.slice(0, rows.length);
      next = shown.next;
      while (padded.length < rows.length) {
        padded.push(next++);
      }
      $[2] = rows.length;
      $[3] = shown.keys;
      $[4] = shown.next;
      $[5] = next;
      $[6] = padded;
    } else {
      next = $[5];
      padded = $[6];
    }
    let t22;
    if ($[7] !== next || $[8] !== padded) {
      t22 = {
        keys: padded,
        next
      };
      $[7] = next;
      $[8] = padded;
      $[9] = t22;
    } else {
      t22 = $[9];
    }
    shown = t22;
    setKeyed(shown);
  }
  const keys = shown.keys;
  let t2;
  if ($[10] !== keys || $[11] !== rows || $[12] !== shown.next) {
    t2 = {
      rows,
      keys,
      next: shown.next
    };
    $[10] = keys;
    $[11] = rows;
    $[12] = shown.next;
    $[13] = t2;
  } else {
    t2 = $[13];
  }
  const latestRef = useLatest(t2);
  const own = React.useRef(null);
  let t3;
  if ($[14] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (n) => {
      own.current = n;
    };
    $[14] = t3;
  } else {
    t3 = $[14];
  }
  const setRef = useMergedRef(ref, t3);
  const addRef = React.useRef(null);
  const focusNext = React.useRef(null);
  let t4;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = [];
    $[15] = t4;
  } else {
    t4 = $[15];
  }
  React.useEffect(_temp2, t4);
  const commit = (list, order, next_0) => {
    latestRef.current = {
      rows: list,
      keys: order,
      next: next_0
    };
    setKeyed({
      keys: order,
      next: next_0
    });
    setOwn(list);
    if (onValueChange) {
      onValueChange(list);
    }
  };
  const add = () => {
    if (rows.length >= max || props.disabled) {
      return;
    }
    const {
      rows: now,
      keys: order0,
      next: next_1
    } = latestRef.current;
    const list_0 = now.concat([newItem()]);
    const order_0 = order0.concat([next_1]);
    focusNext.current = next_1;
    commit(list_0, order_0, next_1 + 1);
    announce(L.valueAdded(itemLabel(list_0.length - 1)));
  };
  const remove = (at) => {
    const label = itemLabel(at);
    const list_1 = latestRef.current.rows.slice();
    const order_1 = latestRef.current.keys.slice();
    list_1.splice(at, 1);
    order_1.splice(at, 1);
    focusNext.current = at > 0 ? order_1[at - 1] : "add";
    commit(list_1, order_1, latestRef.current.next);
    announce(L.valueRemoved(label));
  };
  const update = (at_0, value) => {
    const list_2 = latestRef.current.rows.slice();
    list_2[at_0] = typeof value === "function" ? value(list_2[at_0]) : value;
    commit(list_2, latestRef.current.keys.slice(), latestRef.current.next);
  };
  useIsoLayoutEffect(() => {
    const want = focusNext.current;
    focusNext.current = null;
    if (want == null || !own.current) {
      return;
    }
    const target = want === "add" ? addRef.current : firstField(own.current.querySelector(`[data-row-key="${want}"]`));
    if (target) {
      target.focus();
    }
  });
  const atMax = rows.length >= max;
  let t5;
  if ($[16] !== L || $[17] !== atMax || $[18] !== locale || $[19] !== max) {
    t5 = atMax ? L.fieldListLimit(numberFormat(locale).format(max)) : "";
    $[16] = L;
    $[17] = atMax;
    $[18] = locale;
    $[19] = max;
    $[20] = t5;
  } else {
    t5 = $[20];
  }
  const limit = t5;
  const hintId = shows(props.hint) ? base + "-hint" : void 0;
  const errorId = shows(props.error) ? base + "-error" : void 0;
  const rowFor = (value_0, at_1) => {
    const label_0 = itemLabel(at_1);
    const rowError = props.errors ? props.errors[at_1] : void 0;
    const rowErrorId = shows(rowError) ? `${base}-${keys[at_1]}-error` : void 0;
    const state = {
      index: at_1,
      label: label_0,
      name: (field) => props.name ? `${props.name}[${at_1}]${field ? "." + field : ""}` : void 0,
      update: (v) => update(at_1, v),
      error: rowError
    };
    return /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__row", role: "group", "aria-label": label_0, "aria-describedby": rowErrorId, "data-row-key": keys[at_1] }, /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__fields" }, /* @__PURE__ */ React.createElement(RowFields, { fields: props.children, value: value_0, state })), rows.length > min ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-field-list__remove", icon: icons.Close, label: L.tagRemove(label_0), onClick: () => remove(at_1) }) : null, rowErrorId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__error srp-field-list__row-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-field-list__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: rowErrorId }, rowError)) : null);
  };
  const list_3 = props.reorderable ? /* @__PURE__ */ React.createElement(SortableList, { className: "srp-field-list__rows", items: rows.map((value_1, at_2) => ({
    value: value_1,
    at: at_2,
    key: keys[at_2]
  })), getKey: _temp3, getLabel: (r_0) => itemLabel(r_0.at), disabled: props.disabled, renderItem: (r_1) => rowFor(r_1.value, r_1.at), onReorder: (moved) => commit(moved.map(_temp4), moved.map(_temp5), latestRef.current.next) }) : rows.length ? /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-field-list__rows" }, rows.map((value_2, at_3) => /* @__PURE__ */ React.createElement("li", { key: keys[at_3] }, rowFor(value_2, at_3)))) : null;
  let t6;
  if ($[21] !== props.className) {
    t6 = cn("srp-field-list", props.className);
    $[21] = props.className;
    $[22] = t6;
  } else {
    t6 = $[22];
  }
  const t7 = "field-list";
  const t8 = cn(hintId, errorId, rest["aria-describedby"]) || void 0;
  let t9;
  if ($[23] !== props.label) {
    t9 = /* @__PURE__ */ React.createElement("legend", { className: "srp-field-list__label" }, props.label);
    $[23] = props.label;
    $[24] = t9;
  } else {
    t9 = $[24];
  }
  let t10;
  if ($[25] !== hintId || $[26] !== props.hint) {
    t10 = hintId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__hint", id: hintId }, props.hint) : null;
    $[25] = hintId;
    $[26] = props.hint;
    $[27] = t10;
  } else {
    t10 = $[27];
  }
  let t11;
  if ($[28] !== errorId || $[29] !== props.error) {
    t11 = errorId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-field-list__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: errorId }, props.error)) : null;
    $[28] = errorId;
    $[29] = props.error;
    $[30] = t11;
  } else {
    t11 = $[30];
  }
  const t12 = limit || void 0;
  let t13;
  if ($[31] !== add || $[32] !== atMax || $[33] !== props.addLabel || $[34] !== t12) {
    t13 = /* @__PURE__ */ React.createElement(Button, { ref: addRef, variant: "secondary", size: "sm", startIcon: icons.Add, disabled: atMax, disabledReason: t12, onClick: add }, props.addLabel);
    $[31] = add;
    $[32] = atMax;
    $[33] = props.addLabel;
    $[34] = t12;
    $[35] = t13;
  } else {
    t13 = $[35];
  }
  let t14;
  if ($[36] !== atMax || $[37] !== limit) {
    t14 = atMax ? /* @__PURE__ */ React.createElement("span", { className: "srp-field-list__limit", "aria-hidden": true }, limit) : null;
    $[36] = atMax;
    $[37] = limit;
    $[38] = t14;
  } else {
    t14 = $[38];
  }
  let t15;
  if ($[39] !== t13 || $[40] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__add" }, t13, t14);
    $[39] = t13;
    $[40] = t14;
    $[41] = t15;
  } else {
    t15 = $[41];
  }
  let t16;
  if ($[42] !== list_3 || $[43] !== rest || $[44] !== setRef || $[45] !== t10 || $[46] !== t11 || $[47] !== t15 || $[48] !== t6 || $[49] !== t8 || $[50] !== t9) {
    t16 = /* @__PURE__ */ React.createElement("fieldset", { ...rest, ref: setRef, className: t6, "data-component": t7, "aria-describedby": t8 }, t9, t10, list_3, t11, t15);
    $[42] = list_3;
    $[43] = rest;
    $[44] = setRef;
    $[45] = t10;
    $[46] = t11;
    $[47] = t15;
    $[48] = t6;
    $[49] = t8;
    $[50] = t9;
    $[51] = t16;
  } else {
    t16 = $[51];
  }
  return t16;
}
function _temp5(r_3) {
  return r_3.key;
}
function _temp4(r_2) {
  return r_2.value;
}
function _temp3(r) {
  return r.key;
}
function _temp2() {
  ensureAnnouncer();
}
function _temp(_, i) {
  return i;
}
var FieldList = /* @__PURE__ */ named("FieldList", FieldListRender);
export {
  FieldList
};
//# sourceMappingURL=FieldList.js.map
