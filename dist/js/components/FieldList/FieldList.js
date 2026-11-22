"use client";

// src/components/FieldList/FieldList.tsx
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
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
function FieldListRender({
  ref,
  ...props
}) {
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
  const next = React.useRef(0);
  const keys = React.useRef([]);
  while (keys.current.length < rows.length) keys.current.push(next.current++);
  if (keys.current.length > rows.length) keys.current.length = rows.length;
  const latest = React.useRef(rows);
  latest.current = rows;
  const own = React.useRef(null);
  const setRef = useMergedRef(ref, (n) => {
    own.current = n;
  });
  const addRef = React.useRef(null);
  const focusNext = React.useRef(null);
  React.useEffect(() => {
    ensureAnnouncer();
  }, []);
  const commit = (list, order) => {
    keys.current = order;
    latest.current = list;
    setOwn(list);
    if (onValueChange) onValueChange(list);
  };
  const add = () => {
    if (rows.length >= max || props.disabled) return;
    const list_0 = latest.current.concat([newItem()]);
    const order_0 = keys.current.concat([next.current++]);
    focusNext.current = order_0[order_0.length - 1];
    commit(list_0, order_0);
    announce(L.valueAdded(itemLabel(list_0.length - 1)));
  };
  const remove = (at) => {
    const label = itemLabel(at);
    const list_1 = latest.current.slice(), order_1 = keys.current.slice();
    list_1.splice(at, 1);
    order_1.splice(at, 1);
    focusNext.current = at > 0 ? order_1[at - 1] : "add";
    commit(list_1, order_1);
    announce(L.valueRemoved(label));
  };
  const update = (at_0, value) => {
    const list_2 = latest.current.slice();
    list_2[at_0] = typeof value === "function" ? value(list_2[at_0]) : value;
    commit(list_2, keys.current.slice());
  };
  useIsoLayoutEffect(() => {
    const want = focusNext.current;
    focusNext.current = null;
    if (want == null || !own.current) return;
    const target = want === "add" ? addRef.current : firstField(own.current.querySelector(`[data-row-key="${want}"]`));
    if (target) target.focus();
  });
  const atMax = rows.length >= max;
  const limit = atMax ? L.fieldListLimit(numberFormat(locale).format(max)) : "";
  const hintId = shows(props.hint) ? base + "-hint" : void 0, errorId = shows(props.error) ? base + "-error" : void 0;
  const rowFor = (value_0, at_1) => {
    const label_0 = itemLabel(at_1), rowError = props.errors ? props.errors[at_1] : void 0;
    const rowErrorId = shows(rowError) ? `${base}-${keys.current[at_1]}-error` : void 0;
    const state = {
      index: at_1,
      label: label_0,
      name: (field) => props.name ? `${props.name}[${at_1}]${field ? "." + field : ""}` : void 0,
      update: (v) => update(at_1, v),
      error: rowError
    };
    return /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__row", role: "group", "aria-label": label_0, "aria-describedby": rowErrorId, "data-row-key": keys.current[at_1] }, /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__fields" }, props.children(value_0, state)), rows.length > min ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-field-list__remove", icon: icons.Close, label: L.tagRemove(label_0), onClick: () => remove(at_1) }) : null, rowErrorId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__error srp-field-list__row-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-field-list__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: rowErrorId }, rowError)) : null);
  };
  const list_3 = props.reorderable ? /* @__PURE__ */ React.createElement(SortableList, { className: "srp-field-list__rows", items: rows.map((value_1, at_2) => ({
    value: value_1,
    at: at_2,
    key: keys.current[at_2]
  })), getKey: (r) => r.key, getLabel: (r_0) => itemLabel(r_0.at), disabled: props.disabled, renderItem: (r_1) => rowFor(r_1.value, r_1.at), onReorder: (moved) => commit(moved.map((r_2) => r_2.value), moved.map((r_3) => r_3.key)) }) : rows.length ? /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-field-list__rows" }, rows.map((value_2, at_3) => /* @__PURE__ */ React.createElement("li", { key: keys.current[at_3] }, rowFor(value_2, at_3)))) : null;
  return /* @__PURE__ */ React.createElement("fieldset", { ...rest, ref: setRef, className: cn("srp-field-list", props.className), "data-component": "field-list", "aria-describedby": cn(hintId, errorId, rest["aria-describedby"]) || void 0 }, /* @__PURE__ */ React.createElement("legend", { className: "srp-field-list__label" }, props.label), hintId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__hint", id: hintId }, props.hint) : null, list_3, errorId ? /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-field-list__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: errorId }, props.error)) : null, /* @__PURE__ */ React.createElement("div", { className: "srp-field-list__add" }, /* @__PURE__ */ React.createElement(Button, { ref: addRef, variant: "secondary", size: "sm", startIcon: icons.Add, disabled: atMax, disabledReason: limit || void 0, onClick: add }, props.addLabel), atMax ? /* @__PURE__ */ React.createElement("span", { className: "srp-field-list__limit", "aria-hidden": true }, limit) : null));
}
var FieldList = /* @__PURE__ */ named("FieldList", FieldListRender);
export {
  FieldList
};
//# sourceMappingURL=FieldList.js.map
