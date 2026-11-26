"use client";

// src/components/InlineEdit/InlineEdit.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { cn, domId, omit, oneOf, SIZES } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { deepActive } from "../../internal/root.js";
import { useAutoFocus } from "../../internal/focus.js";
import { isComposing } from "../../internal/ime.js";
import { useSettings } from "../../internal/provider.js";
import { Icon } from "../Icon/Icon.js";
import { Input } from "../Input/Input.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var isThenable = (v) => !!v && typeof v.then === "function";
function InlineEditRender(t0) {
  const $ = _c(28);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    label: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    onCancel: 1,
    validate: 1,
    placeholder: 1,
    size: 1,
    editing: 1,
    defaultEditing: 1,
    onEditingChange: 1,
    disabled: 1,
    readOnly: 1,
    editLabel: 1,
    inputProps: 1,
    className: 1,
    autoFocus: 1
  });
  const sds = useSettings(words);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const [value, setOwn, controlled] = useControllable(props.value, props.defaultValue ?? "", "InlineEdit", "value");
  const [editingIn, setOwnEditing, editingControlled] = useControllable(props.editing, !!props.defaultEditing, "InlineEdit", "editing");
  const locked = !!props.disabled || !!props.readOnly;
  const editing = !locked && !!editingIn;
  const [draft, setDraft] = React.useState(value);
  const [error, setError] = React.useState(null);
  const [wasEditing, setWasEditing] = React.useState(editing);
  if (wasEditing !== editing) {
    setWasEditing(editing);
    if (editing) {
      setDraft(value);
      setError(null);
    }
  }
  const field = React.useRef(null);
  const view = React.useRef(null);
  const refocus = React.useRef(false);
  const closing = React.useRef(false);
  const errorId = domId("srp-ie", React.useId()) + "-error";
  const [tries, setTries] = React.useState(0);
  const errorText = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(_temp, t1);
  let t2;
  let t3;
  if ($[1] !== tries) {
    t2 = () => {
      const t = errorText.current && errorText.current.textContent;
      if (tries && t) {
        announce(t);
      }
    };
    t3 = [tries];
    $[1] = tries;
    $[2] = t2;
    $[3] = t3;
  } else {
    t2 = $[2];
    t3 = $[3];
  }
  React.useEffect(t2, t3);
  const setEditing = (on) => {
    if (!editingControlled) {
      setOwnEditing(on);
    }
    if (props.onEditingChange) {
      props.onEditingChange(on);
    }
  };
  const open = () => {
    if (locked) {
      return;
    }
    closing.current = false;
    setDraft(value);
    setError(null);
    setEditing(true);
  };
  let t4;
  let t5;
  if ($[4] !== editing) {
    t4 = () => {
      if (editing && field.current) {
        closing.current = false;
        field.current.focus();
        field.current.select();
      }
    };
    t5 = [editing];
    $[4] = editing;
    $[5] = t4;
    $[6] = t5;
  } else {
    t4 = $[5];
    t5 = $[6];
  }
  React.useEffect(t4, t5);
  let t6;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => field.current || view.current;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  useAutoFocus(props.autoFocus, t6);
  let t7;
  let t8;
  if ($[8] !== editing) {
    t7 = () => {
      if (!editing && refocus.current) {
        refocus.current = false;
        if (view.current) {
          view.current.focus();
        }
      }
    };
    t8 = [editing];
    $[8] = editing;
    $[9] = t7;
    $[10] = t8;
  } else {
    t7 = $[9];
    t8 = $[10];
  }
  React.useEffect(t7, t8);
  const check = React.useRef(0);
  const [checking, setChecking] = React.useState(false);
  let t10;
  let t9;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = () => () => {
      check.current = check.current + 1;
    };
    t10 = [];
    $[11] = t10;
    $[12] = t9;
  } else {
    t10 = $[11];
    t9 = $[12];
  }
  React.useEffect(t9, t10);
  const finish = (problem, text, keyboard) => {
    if (problem != null && problem !== false && problem !== "") {
      setError(problem);
      setTries(_temp2);
      return;
    }
    refocus.current = keyboard;
    closing.current = true;
    if (text !== value) {
      if (!controlled) {
        setOwn(text);
      }
      if (props.onValueChange) {
        props.onValueChange(text);
      }
    }
    setError(null);
    setEditing(false);
  };
  const save = (keyboard_0) => {
    const mine = check.current = check.current + 1;
    const text_0 = draft;
    const problem_0 = props.validate ? props.validate(text_0) : null;
    if (!isThenable(problem_0)) {
      setChecking(false);
      finish(problem_0, text_0, keyboard_0);
      return;
    }
    setChecking(true);
    const here = () => {
      const a = deepActive();
      return !a || a === document.body || a === field.current;
    };
    problem_0.then((p) => {
      if (mine === check.current) {
        setChecking(false);
        finish(p, text_0, keyboard_0 && here());
      }
    }, () => {
      if (mine === check.current) {
        setChecking(false);
      }
    });
  };
  const cancel = () => {
    check.current = check.current + 1;
    setChecking(false);
    refocus.current = true;
    closing.current = true;
    setDraft(value);
    setError(null);
    setEditing(false);
    if (props.onCancel) {
      props.onCancel();
    }
  };
  const ip = props.inputProps || {};
  const onKeyDown = (e) => {
    if (ip.onKeyDown) {
      ip.onKeyDown(e);
    }
    if (e.defaultPrevented || isComposing(e)) {
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      save(true);
    } else {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        cancel();
      }
    }
  };
  const onBlur = (e_0) => {
    if (ip.onBlur) {
      ip.onBlur(e_0);
    }
    if (editing && !closing.current && !checking && deepActive() !== e_0.currentTarget) {
      save(false);
    }
  };
  const empty = value === "";
  const t11 = empty && "srp-inline-edit__text--placeholder";
  let t12;
  if ($[13] !== t11) {
    t12 = cn("srp-inline-edit__text", t11);
    $[13] = t11;
    $[14] = t12;
  } else {
    t12 = $[14];
  }
  const text_1 = /* @__PURE__ */ React.createElement("span", { className: t12 }, empty ? props.placeholder : value);
  const cls = cn("srp-inline-edit", "srp-inline-edit--size-" + size, editing && "srp-inline-edit--editing", props.disabled && "srp-inline-edit--disabled", error != null && "srp-inline-edit--invalid", props.className);
  const t13 = props.disabled ? "" : void 0;
  const t14 = "inline-edit";
  const t15 = editing ? "editing" : "viewing";
  const t16 = editing ? /* @__PURE__ */ React.createElement(Input, { ...ip, ref: field, size, "aria-label": props.label, value: draft, invalid: error != null || ip.invalid, "aria-describedby": cn(ip["aria-describedby"], error != null && errorId) || void 0, "aria-busy": checking || void 0, onChange: (e_1) => {
    setDraft(e_1.target.value);
    if (checking) {
      check.current = check.current + 1;
      setChecking(false);
    }
    if (error != null) {
      setError(null);
    }
    if (ip.onChange) {
      ip.onChange(e_1);
    }
  }, onKeyDown, onBlur }) : locked ? /* @__PURE__ */ React.createElement("span", { className: "srp-inline-edit__view srp-inline-edit__view--static" }, text_1) : /* @__PURE__ */ React.createElement("button", { type: "button", ref: view, className: cn("srp-inline-edit__view", empty && !props.placeholder && "srp-inline-edit__view--blank"), onClick: open }, /* @__PURE__ */ React.createElement(VisuallyHidden, null, props.label, ": "), text_1, /* @__PURE__ */ React.createElement(VisuallyHidden, null, ", ", props.editLabel || sds.labels.edit), /* @__PURE__ */ React.createElement(Icon, { icon: icons.Edit, className: "srp-inline-edit__icon" }));
  let t17;
  if ($[15] !== editing || $[16] !== error || $[17] !== errorId) {
    t17 = editing && error != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-inline-edit__error", id: errorId }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-inline-edit__error-icon" }), /* @__PURE__ */ React.createElement("span", { ref: errorText }, error)) : null;
    $[15] = editing;
    $[16] = error;
    $[17] = errorId;
    $[18] = t17;
  } else {
    t17 = $[18];
  }
  let t18;
  if ($[19] !== cls || $[20] !== ref || $[21] !== rest || $[22] !== size || $[23] !== t13 || $[24] !== t15 || $[25] !== t16 || $[26] !== t17) {
    t18 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cls, "data-disabled": t13, "data-component": t14, "data-size": size, "data-state": t15 }, t16, t17);
    $[19] = cls;
    $[20] = ref;
    $[21] = rest;
    $[22] = size;
    $[23] = t13;
    $[24] = t15;
    $[25] = t16;
    $[26] = t17;
    $[27] = t18;
  } else {
    t18 = $[27];
  }
  return t18;
}
function _temp2(n) {
  return n + 1;
}
function _temp() {
  ensureAnnouncer();
}
var InlineEdit = /* @__PURE__ */ named("InlineEdit", InlineEditRender);
export {
  InlineEdit
};
//# sourceMappingURL=InlineEdit.js.map
