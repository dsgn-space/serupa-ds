"use client";

// src/components/Checkbox/Checkbox.tsx
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, oneOf, omit, useMergedRef, SIZES, useIsoLayoutEffect } from "../../internal/cn.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { Icon } from "../Icon/Icon.js";
import { component } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { warnOnce } from "../../internal/warn.js";
import { markKeyFocus } from "../../internal/keyFocus.js";
import { listenForInput } from "../../internal/lastInput.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { en as words } from "./labels.js";
function boxView(g, key, all) {
  const head = [g.name, g.size, g.variant, g.invalid, g.disabled, g.required, g.readOnly].join("|");
  if (all) {
    let enabled = 0, on = 0;
    g.boxes.forEach((dis, k) => {
      if (!dis) {
        enabled++;
        if (g.values.includes(k)) on++;
      }
    });
    return head + "|" + enabled + "/" + on;
  }
  return head + "|" + g.values.includes(key) + "|" + (g.required && !g.values.some((v) => g.boxes.has(v)));
}
var VARIANTS = ["plain", "card"];
var noSubscribe = () => () => {
};
var GroupContext = /* @__PURE__ */ React.createContext(null);
var GROUP_OWN = { name: 1, value: 1, defaultValue: 1, onValueChange: 1, orientation: 1, size: 1, variant: 1, invalid: 1, disabled: 1, required: 1, readOnly: 1, children: 1, className: 1, autoFocus: 1 };
function childBoxes(children, disabled, out = /* @__PURE__ */ new Map()) {
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement(c)) return;
    if (c.type === Checkbox) {
      if (!c.props.selectAll && c.props.value != null && String(c.props.value) !== "") out.set(String(c.props.value), disabled || !!c.props.disabled);
    } else childBoxes(c.props.children, disabled, out);
  });
  return out;
}
var CheckboxGroup = /* @__PURE__ */ component("CheckboxGroup", function CheckboxGroup2(props, ref) {
  const rest = omit(props, GROUP_OWN);
  const autoName = domId("dk-cbg", React.useId());
  const [chosen, setOwn, controlled] = useControllable(props.value, props.defaultValue || [], "CheckboxGroup", "value");
  const raw = chosen || [];
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  delete rest["aria-invalid"];
  const orientation = props.orientation === "horizontal" ? "horizontal" : "vertical";
  const root = React.useRef(null);
  const [, rerender] = React.useState(0);
  useFormReset(root, function() {
    if (!controlled) setOwn(props.defaultValue || []);
    rerender(function(n) {
      return n + 1;
    });
  });
  const boxes = React.useRef(/* @__PURE__ */ new Map()).current;
  const typed = React.useRef(/* @__PURE__ */ new Map()).current;
  for (const v of raw) typed.set(String(v), v);
  const latest = React.useRef(raw);
  latest.current = raw;
  const emit = function(next, e) {
    const order = [...boxes.keys()].filter((k) => next.has(k)).concat([...next].filter((k) => !boxes.has(k)));
    const out = order.map((k) => typed.has(k) ? typed.get(k) : k);
    if (!controlled) setOwn(out);
    if (props.onValueChange) props.onValueChange(out, e);
  };
  const known = boxes.size ? boxes : childBoxes(props.children, !!props.disabled);
  const around = useControlSize(props.size);
  const state = { name: props.name || autoName, values: raw.map(String), size: around, variant: props.variant, invalid, disabled: !!props.disabled, required: !!props.required, readOnly: !!props.readOnly, boxes: known };
  const api = {
    register(v, dis) {
      const k = String(v);
      boxes.set(k, dis);
      typed.set(k, v);
      rerender((n) => n + 1);
      return () => {
        boxes.delete(k);
        rerender((n) => n + 1);
      };
    },
    toggle(v, on, e) {
      const next = new Set(latest.current.map(String));
      if (on) next.add(v);
      else next.delete(v);
      emit(next, e);
    },
    toggleAll(on, e) {
      const next = new Set(latest.current.map(String));
      boxes.forEach((dis, k) => {
        if (!dis) {
          if (on) next.add(k);
          else next.delete(k);
        }
      });
      emit(next, e);
    }
  };
  const live = React.useRef(api);
  live.current = api;
  const store = React.useRef(null);
  if (!store.current) {
    const st2 = { state, listeners: /* @__PURE__ */ new Set() };
    st2.ctx = {
      get: () => st2.state,
      subscribe(l) {
        st2.listeners.add(l);
        return () => {
          st2.listeners.delete(l);
        };
      },
      register: (v, dis) => live.current.register(v, dis),
      toggle: (v, on, e) => live.current.toggle(v, on, e),
      toggleAll: (on, e) => live.current.toggleAll(on, e)
    };
    store.current = st2;
  }
  const st = store.current;
  useIsoLayoutEffect(function() {
    st.state = state;
    st.listeners.forEach((l) => l());
  });
  useAutoFocus(props.autoFocus, () => root.current);
  const groupRef = useMergedRef(ref, function(n) {
    root.current = n;
    delegateFocus(n, () => n && n.querySelector("input:enabled"));
  });
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: groupRef,
      role: "group",
      "aria-disabled": props.disabled || void 0,
      className: cn("dk-checkbox-group", "dk-checkbox-group--" + orientation, props.variant === "card" && "dk-checkbox-group--card", invalid && "dk-checkbox-group--invalid", props.className),
      "data-component": "checkbox-group",
      "data-orientation": orientation
    },
    /* @__PURE__ */ React.createElement(GroupContext.Provider, { value: st.ctx }, props.children)
  );
});
var OWN = { size: 1, variant: 1, invalid: 1, indeterminate: 1, selectAll: 1, onCheckedChange: 1, description: 1, children: 1, className: 1, style: 1, type: 1 };
var Checkbox = /* @__PURE__ */ component("Checkbox", function Checkbox2(props, ref) {
  const nameRef = useNameCheck("Checkbox", NAME_HOW.label);
  if (process.env.NODE_ENV !== "production" && props.label != null) warnOnce("label-prop", "Checkbox: label isn't one of its props, so it lands on the <input> as an attribute and names nothing. Put the text in children.", "label-prop:Checkbox");
  const store = React.useContext(GroupContext);
  const key = props.value == null ? "" : String(props.value);
  const all = !!(store && props.selectAll);
  React.useSyncExternalStore(store ? store.subscribe : noSubscribe, () => store ? boxView(store.get(), key, all) : "", () => store ? boxView(store.get(), key, all) : "");
  const group = store ? Object.assign({}, store.get(), { register: store.register, toggle: store.toggle, toggleAll: store.toggleAll }) : null;
  const fromField = useFieldControl(props);
  if (!group) props = fromField;
  const rest = omit(props, OWN);
  const outer = useControlSize(void 0);
  const size = oneOf(SIZES, props.size, oneOf(SIZES, group ? group.size : outer, "md"));
  const card = oneOf(VARIANTS, props.variant, oneOf(VARIANTS, group && group.variant, "plain")) === "card";
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid || group && group.invalid) rest["aria-invalid"] = true;
  let mixed = !!props.indeterminate;
  let need = false;
  const counted = !!group && !all && key !== "";
  const labels = useSettings(words).labels;
  const boxDisabled = !!(rest.disabled || group && group.disabled);
  useIsoLayoutEffect(function() {
    return counted && group ? group.register(props.value, boxDisabled) : void 0;
  }, [counted, key, boxDisabled]);
  if (group) {
    const ownChange = rest.onChange;
    delete rest.defaultChecked;
    if (group.disabled) rest.disabled = true;
    if (group.readOnly) rest.readOnly = true;
    if (all) {
      const enabled = [...group.boxes].filter(([, dis]) => !dis).map(([k]) => k), on = enabled.filter((k) => group.values.includes(k)).length;
      rest.checked = enabled.length > 0 && on === enabled.length;
      mixed = on > 0 && on < enabled.length;
      if (!enabled.length) rest.disabled = true;
      delete rest.name;
      rest.onChange = function(e) {
        if (ownChange) ownChange(e);
        group.toggleAll(on < enabled.length, e);
      };
    } else {
      rest.name = group.name;
      rest.checked = group.values.includes(key);
      rest.onChange = function(e) {
        if (ownChange) ownChange(e);
        group.toggle(key, e.currentTarget.checked, e);
      };
      if (group.required && !group.values.some((v) => group.boxes.has(v))) rest.required = true;
      need = !!rest.required;
    }
  }
  const checkedChange = props.onCheckedChange;
  if (checkedChange) {
    const before = rest.onChange;
    rest.onChange = function(e) {
      if (before) before(e);
      checkedChange(e.currentTarget.checked, e);
    };
  }
  const readOnly = !!rest.readOnly;
  if (readOnly) {
    rest["aria-readonly"] = true;
    delete rest.onChange;
    const onClick = rest.onClick;
    rest.onClick = (e) => {
      if (onClick) onClick(e);
      e.preventDefault();
    };
  }
  const own = React.useRef(null);
  const setRefs = useMergedRef(ref, function(node) {
    own.current = node;
    nameRef(node);
  });
  useIsoLayoutEffect(function() {
    const i = own.current;
    if (i) {
      i.indeterminate = mixed;
      i.removeAttribute("data-indeterminate");
    }
  });
  const said = React.useRef(false);
  useIsoLayoutEffect(function() {
    if (!own.current || !need && !said.current) return;
    own.current.setCustomValidity(need ? labels.selectAtLeastOne : "");
    said.current = need;
  });
  markKeyFocus(rest);
  useIsoLayoutEffect(listenForInput, []);
  const base = domId("dk-cb", React.useId()), labelId = base + "-label", descId = base + "-desc";
  const hasLabel = props.children != null && props.children !== false && props.children !== "";
  const hasDesc = props.description != null && props.description !== false && props.description !== "";
  if (hasDesc) rest["aria-describedby"] = cn(rest["aria-describedby"], descId);
  if (hasDesc && hasLabel && rest["aria-label"] == null && rest["aria-labelledby"] == null) rest["aria-labelledby"] = labelId;
  return /* @__PURE__ */ React.createElement("label", { className: cn("dk-checkbox", "dk-checkbox--size-" + size, card && "dk-checkbox--card", (invalid || group && group.invalid) && "dk-checkbox--invalid", rest.disabled && "dk-checkbox--disabled", readOnly && "dk-checkbox--readonly", !hasLabel && !hasDesc && "dk-checkbox--bare", props.className), style: props.style, "data-component": "checkbox", "data-size": size }, /* @__PURE__ */ React.createElement("span", { className: "dk-checkbox__control", key: "control" }, /* @__PURE__ */ React.createElement("input", { ...rest, ref: setRefs, type: "checkbox", className: "dk-checkbox__input", "data-indeterminate": mixed ? "" : void 0, key: "input" }), /* @__PURE__ */ React.createElement("span", { className: "dk-checkbox__icon", "aria-hidden": true, key: "icon" }, /* @__PURE__ */ React.createElement(Icon, { icon: mixed ? icons.Remove : icons.Check }))), hasLabel || hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "dk-checkbox__text", key: "text" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "dk-checkbox__label", id: labelId, key: "label" }, props.children) : null, hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "dk-checkbox__description", id: descId, key: "desc" }, props.description) : null) : null);
});
export {
  Checkbox,
  CheckboxGroup
};
//# sourceMappingURL=Checkbox.js.map
