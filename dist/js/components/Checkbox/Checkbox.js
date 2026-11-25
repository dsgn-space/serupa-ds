"use client";

// src/components/Checkbox/Checkbox.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, oneOf, omit, useMergedRef, SIZES, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
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
var GROUP_OWN = {
  name: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  orientation: 1,
  size: 1,
  variant: 1,
  invalid: 1,
  disabled: 1,
  required: 1,
  readOnly: 1,
  children: 1,
  className: 1,
  autoFocus: 1
};
function childBoxes(children, disabled, out = /* @__PURE__ */ new Map()) {
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement(c)) return;
    if (c.type === Checkbox) {
      if (!c.props.selectAll && c.props.value != null && String(c.props.value) !== "") out.set(String(c.props.value), disabled || !!c.props.disabled);
    } else childBoxes(c.props.children, disabled, out);
  });
  return out;
}
function CheckboxGroupRender({
  ref,
  ...props
}) {
  const rest = omit(props, GROUP_OWN);
  const autoName = domId("srp-cbg", React.useId());
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
  const latest = useLatest(raw);
  const emit = function(next, e) {
    const order = [...boxes.keys()].filter((k) => next.has(k)).concat([...next].filter((k_0) => !boxes.has(k_0)));
    const out = order.map((k_1) => typed.has(k_1) ? typed.get(k_1) : k_1);
    if (!controlled) setOwn(out);
    if (props.onValueChange) props.onValueChange(out, {
      event: e
    });
  };
  const known = boxes.size ? boxes : childBoxes(props.children, !!props.disabled);
  const around = useControlSize(props.size);
  const state = {
    name: props.name || autoName,
    values: raw.map(String),
    size: around,
    variant: props.variant,
    invalid,
    disabled: !!props.disabled,
    required: !!props.required,
    readOnly: !!props.readOnly,
    boxes: known
  };
  const api = {
    register(v_0, dis) {
      const k_2 = String(v_0);
      boxes.set(k_2, dis);
      typed.set(k_2, v_0);
      rerender((n_0) => n_0 + 1);
      return () => {
        boxes.delete(k_2);
        rerender((n_1) => n_1 + 1);
      };
    },
    toggle(v_1, on, e_0) {
      const next_0 = new Set(latest.current.map(String));
      if (on) next_0.add(v_1);
      else next_0.delete(v_1);
      emit(next_0, e_0);
    },
    toggleAll(on_0, e_1) {
      const next_1 = new Set(latest.current.map(String));
      boxes.forEach((dis_0, k_3) => {
        if (!dis_0) {
          if (on_0) next_1.add(k_3);
          else next_1.delete(k_3);
        }
      });
      emit(next_1, e_1);
    }
  };
  const live = useLatest(api);
  const store = React.useRef(null);
  if (!store.current) {
    const st = {
      state,
      listeners: /* @__PURE__ */ new Set()
    };
    st.ctx = {
      get: () => st.state,
      subscribe(l) {
        st.listeners.add(l);
        return () => {
          st.listeners.delete(l);
        };
      },
      register: (v_2, dis_1) => live.current.register(v_2, dis_1),
      toggle: (v_3, on_1, e_2) => live.current.toggle(v_3, on_1, e_2),
      toggleAll: (on_2, e_3) => live.current.toggleAll(on_2, e_3)
    };
    store.current = st;
  }
  const st_0 = store.current;
  useIsoLayoutEffect(function() {
    st_0.state = state;
    st_0.listeners.forEach((l_0) => l_0());
  });
  useAutoFocus(props.autoFocus, () => root.current);
  const groupRef = useMergedRef(ref, function(n_2) {
    root.current = n_2;
    delegateFocus(n_2, () => n_2 && n_2.querySelector("input:enabled"));
  });
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: groupRef, role: "group", "aria-disabled": props.disabled || void 0, className: cn("srp-checkbox-group", "srp-checkbox-group--" + orientation, props.variant === "card" && "srp-checkbox-group--card", invalid && "srp-checkbox-group--invalid", props.className), "data-component": "checkbox-group", "data-orientation": orientation }, /* @__PURE__ */ React.createElement(GroupContext.Provider, { value: st_0.ctx }, props.children));
}
var CheckboxGroup = /* @__PURE__ */ named("CheckboxGroup", CheckboxGroupRender);
var OWN = {
  size: 1,
  variant: 1,
  invalid: 1,
  indeterminate: 1,
  selectAll: 1,
  onCheckedChange: 1,
  description: 1,
  children: 1,
  className: 1,
  style: 1,
  type: 1
};
function CheckboxRender(t0) {
  const $ = _c(41);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("Checkbox", NAME_HOW.label);
  if (process.env.NODE_ENV !== "production" && props.label != null) {
    warnOnce("label-prop", "Checkbox: label isn't one of its props, so it lands on the <input> as an attribute and names nothing. Put the text in children.", "label-prop:Checkbox");
  }
  const store = React.useContext(GroupContext);
  const key = props.value == null ? "" : String(props.value);
  const all = !!(store && props.selectAll);
  let t2;
  let t3;
  if ($[0] !== all || $[1] !== key || $[2] !== store) {
    t2 = () => store ? boxView(store.get(), key, all) : "";
    t3 = () => store ? boxView(store.get(), key, all) : "";
    $[0] = all;
    $[1] = key;
    $[2] = store;
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  React.useSyncExternalStore(store ? store.subscribe : noSubscribe, t2, t3);
  const group = store ? Object.assign({}, store.get(), {
    register: store.register,
    toggle: store.toggle,
    toggleAll: store.toggleAll
  }) : null;
  const fromField = useFieldControl(props);
  if (!group) {
    props = fromField;
  }
  const rest = omit(props, OWN);
  const outer = useControlSize(void 0);
  const size = oneOf(SIZES, props.size, oneOf(SIZES, group ? group.size : outer, "md"));
  const card = oneOf(VARIANTS, props.variant, oneOf(VARIANTS, group && group.variant, "plain")) === "card";
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid || group && group.invalid) {
    rest["aria-invalid"] = true;
  }
  let mixed = !!props.indeterminate;
  let need = false;
  const counted = !!group && !all && key !== "";
  const labels = useSettings(words).labels;
  const boxDisabled = !!(rest.disabled || group && group.disabled);
  let t4;
  if ($[5] !== boxDisabled || $[6] !== counted || $[7] !== key) {
    t4 = [counted, key, boxDisabled];
    $[5] = boxDisabled;
    $[6] = counted;
    $[7] = key;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  useIsoLayoutEffect(function() {
    return counted && group ? group.register(props.value, boxDisabled) : void 0;
  }, t4);
  if (group) {
    const ownChange = rest.onChange;
    delete rest.defaultChecked;
    if (group.disabled) {
      rest.disabled = true;
    }
    if (group.readOnly) {
      rest.readOnly = true;
    }
    if (all) {
      const enabled = [...group.boxes].filter(_temp).map(_temp2);
      const on = enabled.filter((k_0) => group.values.includes(k_0)).length;
      rest.checked = enabled.length > 0 && on === enabled.length;
      mixed = on > 0 && on < enabled.length;
      if (!enabled.length) {
        rest.disabled = true;
      }
      delete rest.name;
      rest.onChange = function(e) {
        if (ownChange) {
          ownChange(e);
        }
        group.toggleAll(on < enabled.length, e);
      };
    } else {
      rest.name = group.name;
      rest.checked = group.values.includes(key);
      rest.onChange = function(e_0) {
        if (ownChange) {
          ownChange(e_0);
        }
        group.toggle(key, e_0.currentTarget.checked, e_0);
      };
      if (group.required && !group.values.some((v) => group.boxes.has(v))) {
        rest.required = true;
      }
      need = !!rest.required;
    }
  }
  const checkedChange = props.onCheckedChange;
  if (checkedChange) {
    const before = rest.onChange;
    rest.onChange = function(e_1) {
      if (before) {
        before(e_1);
      }
      checkedChange(e_1.currentTarget.checked, {
        event: e_1
      });
    };
  }
  const readOnly = !!rest.readOnly;
  if (readOnly) {
    rest["aria-readonly"] = true;
    delete rest.onChange;
    const onClick = rest.onClick;
    rest.onClick = (e_2) => {
      if (onClick) {
        onClick(e_2);
      }
      e_2.preventDefault();
    };
  }
  const own = React.useRef(null);
  let t5;
  if ($[9] !== nameRef) {
    t5 = function(node) {
      own.current = node;
      nameRef(node);
    };
    $[9] = nameRef;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const setRefs = useMergedRef(ref, t5);
  let t6;
  if ($[11] !== mixed) {
    t6 = function() {
      const i = own.current;
      if (i) {
        i.indeterminate = mixed;
        i.removeAttribute("data-indeterminate");
      }
    };
    $[11] = mixed;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  useIsoLayoutEffect(t6);
  const said = React.useRef(false);
  let t7;
  if ($[13] !== labels || $[14] !== need) {
    t7 = function() {
      if (!own.current || !need && !said.current) {
        return;
      }
      own.current.setCustomValidity(need ? labels.selectAtLeastOne : "");
      said.current = need;
    };
    $[13] = labels;
    $[14] = need;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  useIsoLayoutEffect(t7);
  markKeyFocus(rest);
  let t8;
  if ($[16] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = [];
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  useIsoLayoutEffect(listenForInput, t8);
  const base = domId("srp-cb", React.useId());
  const labelId = base + "-label";
  const descId = base + "-desc";
  const hasLabel = props.children != null && props.children !== false && props.children !== "";
  const hasDesc = props.description != null && props.description !== false && props.description !== "";
  if (hasDesc) {
    rest["aria-describedby"] = cn(rest["aria-describedby"], descId);
  }
  if (hasDesc && hasLabel && rest["aria-label"] == null && rest["aria-labelledby"] == null) {
    rest["aria-labelledby"] = labelId;
  }
  const t9 = cn("srp-checkbox", "srp-checkbox--size-" + size, card && "srp-checkbox--card", (invalid || group && group.invalid) && "srp-checkbox--invalid", rest.disabled && "srp-checkbox--disabled", readOnly && "srp-checkbox--readonly", !hasLabel && !hasDesc && "srp-checkbox--bare", props.className);
  const t10 = invalid || group && group.invalid ? "" : void 0;
  const t11 = readOnly ? "" : void 0;
  const t12 = mixed ? "" : void 0;
  let t13;
  if ($[17] !== rest || $[18] !== setRefs || $[19] !== t12) {
    t13 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: setRefs, type: "checkbox", className: "srp-checkbox__input", "data-indeterminate": t12, key: "input" });
    $[17] = rest;
    $[18] = setRefs;
    $[19] = t12;
    $[20] = t13;
  } else {
    t13 = $[20];
  }
  const t14 = mixed ? icons.Remove : icons.Check;
  let t15;
  if ($[21] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("span", { className: "srp-checkbox__icon", "aria-hidden": true, key: "icon" }, /* @__PURE__ */ React.createElement(Icon, { icon: t14 }));
    $[21] = t14;
    $[22] = t15;
  } else {
    t15 = $[22];
  }
  let t16;
  if ($[23] !== t13 || $[24] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("span", { className: "srp-checkbox__control", key: "control" }, t13, t15);
    $[23] = t13;
    $[24] = t15;
    $[25] = t16;
  } else {
    t16 = $[25];
  }
  let t17;
  if ($[26] !== descId || $[27] !== hasDesc || $[28] !== hasLabel || $[29] !== labelId || $[30] !== props.children || $[31] !== props.description) {
    t17 = hasLabel || hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-checkbox__text", key: "text" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-checkbox__label", id: labelId, key: "label" }, props.children) : null, hasDesc ? /* @__PURE__ */ React.createElement("span", { className: "srp-checkbox__description", id: descId, key: "desc" }, props.description) : null) : null;
    $[26] = descId;
    $[27] = hasDesc;
    $[28] = hasLabel;
    $[29] = labelId;
    $[30] = props.children;
    $[31] = props.description;
    $[32] = t17;
  } else {
    t17 = $[32];
  }
  let t18;
  if ($[33] !== props.style || $[34] !== size || $[35] !== t10 || $[36] !== t11 || $[37] !== t16 || $[38] !== t17 || $[39] !== t9) {
    t18 = /* @__PURE__ */ React.createElement("label", { className: t9, "data-invalid": t10, "data-readonly": t11, style: props.style, "data-component": "checkbox", "data-size": size }, t16, t17);
    $[33] = props.style;
    $[34] = size;
    $[35] = t10;
    $[36] = t11;
    $[37] = t16;
    $[38] = t17;
    $[39] = t9;
    $[40] = t18;
  } else {
    t18 = $[40];
  }
  return t18;
}
function _temp2(t0) {
  const [k] = t0;
  return k;
}
function _temp(t0) {
  const [, dis] = t0;
  return !dis;
}
var Checkbox = /* @__PURE__ */ named("Checkbox", CheckboxRender);
export {
  Checkbox,
  CheckboxGroup
};
//# sourceMappingURL=Checkbox.js.map
