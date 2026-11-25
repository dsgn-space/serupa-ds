"use client";

// src/components/TransferList/TransferList.tsx
import { c as _c } from "../../internal/memoCache.js";
import { listFormat } from "../../internal/intl.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useMergedRef, cn, domId, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { announce } from "../../internal/announce.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { useRequired } from "../../internal/required.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { Checkbox, CheckboxGroup } from "../Checkbox/Checkbox.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
function boxFor(boxes, o) {
  let box = boxes.get(o);
  if (!box) {
    box = /* @__PURE__ */ React.createElement(Checkbox, { key: o.value, value: o.value, disabled: o.disabled, description: o.description }, o.label);
    boxes.set(o, box);
  }
  return box;
}
function TransferListRender(t0) {
  const $ = _c(64);
  let given;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...given
    } = t0);
    $[0] = t0;
    $[1] = given;
    $[2] = ref;
  } else {
    given = $[1];
    ref = $[2];
  }
  const props = useFieldControl(given);
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  let t1;
  if ($[3] !== props) {
    t1 = omit(props, {
      options: 1,
      value: 1,
      defaultValue: 1,
      onValueChange: 1,
      name: 1,
      form: 1,
      disabled: 1,
      readOnly: 1,
      invalid: 1,
      required: 1,
      "aria-required": 1,
      availableLabel: 1,
      chosenLabel: 1,
      className: 1,
      autoFocus: 1
    });
    $[3] = props;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const rest = t1;
  const {
    options,
    value: valueIn,
    defaultValue,
    onValueChange,
    name,
    form,
    disabled,
    invalid,
    availableLabel,
    chosenLabel,
    className,
    autoFocus
  } = props;
  const nameRef = useNameCheck("TransferList", NAME_HOW.group);
  const sds = useSettings(words);
  const locale = useLocale();
  let t2;
  if ($[5] !== options) {
    t2 = (vs) => (vs || []).filter((v, i, a) => a.indexOf(v) === i && options.some((o) => o.value === v));
    $[5] = options;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const known = t2;
  let t3;
  if ($[7] !== defaultValue || $[8] !== known) {
    t3 = known(defaultValue);
    $[7] = defaultValue;
    $[8] = known;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const [held, setOwn, controlled] = useControllable(valueIn, t3, "TransferList", "value");
  const chosen = known(held);
  let t4;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = [];
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  const [checkedLeft, setCheckedLeft] = React.useState(t4);
  let t5;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = [];
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const [checkedRight, setCheckedRight] = React.useState(t5);
  const root = React.useRef(null);
  const id = domId("srp-transfer", React.useId());
  let t6;
  if ($[12] !== controlled || $[13] !== defaultValue || $[14] !== known || $[15] !== setCheckedRight || $[16] !== setOwn) {
    t6 = () => {
      if (!controlled) {
        setOwn(known(defaultValue));
      }
      setCheckedLeft([]);
      setCheckedRight([]);
    };
    $[12] = controlled;
    $[13] = defaultValue;
    $[14] = known;
    $[15] = setCheckedRight;
    $[16] = setOwn;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  useFormReset(root, t6, form);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const off = !!disabled || inDisabledFieldset;
  const readOnly = !!props.readOnly && !off;
  const required = !!props.required;
  let t7;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => root.current?.querySelector("input:enabled")?.focus();
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  const {
    missing,
    onInvalid
  } = useRequired(chosen.length > 0, t7);
  const marked = !!invalid || missing;
  const left = options.filter((o_0) => !chosen.includes(o_0.value));
  let t8;
  if ($[19] !== options) {
    t8 = (v_0) => options.find((o_1) => o_1.value === v_0);
    $[19] = options;
    $[20] = t8;
  } else {
    t8 = $[20];
  }
  const right = chosen.map(t8);
  const names = {
    left: availableLabel || sds.labels.transferAvailable,
    right: chosenLabel || sds.labels.transferChosen
  };
  const keep = _temp;
  if (keep(left, checkedLeft).length !== checkedLeft.length) {
    setCheckedLeft(keep(left, checkedLeft));
  }
  if (keep(right, checkedRight).length !== checkedRight.length) {
    setCheckedRight(keep(right, checkedRight));
  }
  const moveable = _temp2;
  const move = (to) => {
    const moving = to === "right" ? moveable(left, checkedLeft) : moveable(right, checkedRight);
    if (!moving.length || off || readOnly) {
      return;
    }
    const vs_0 = moving.map(_temp3);
    const next = to === "right" ? [...chosen, ...vs_0] : chosen.filter((v_2) => !vs_0.includes(v_2));
    if (!controlled) {
      setOwn(next);
    }
    if (onValueChange) {
      onValueChange(next);
    }
    (to === "right" ? setCheckedLeft : setCheckedRight)([]);
    const list_1 = listFormat(locale, {
      type: "conjunction"
    }).format(moving.map(_temp4));
    announce(sds.labels.transferMoved(list_1, to === "right" ? names.right : names.left));
  };
  let t9;
  if ($[21] !== nameRef) {
    t9 = (n) => {
      root.current = n;
      delegateFocus(n, () => n && n.querySelector("input:enabled"));
      nameRef(n);
    };
    $[21] = nameRef;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  const ref2 = useMergedRef(ref, t9);
  let t10;
  if ($[23] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = () => root.current;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  useAutoFocus(autoFocus, t10);
  const [boxes] = React.useState(_temp5);
  let t11;
  if ($[24] !== boxes) {
    t11 = (o_6) => boxFor(boxes, o_6);
    $[24] = boxes;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  const boxOf = t11;
  const side = (which, list_2, checked_1, setChecked) => {
    const titleId = id + "-" + which;
    return /* @__PURE__ */ React.createElement("div", { className: "srp-transfer-list__side" }, /* @__PURE__ */ React.createElement("p", { id: titleId, className: "srp-transfer-list__title" }, names[which], " ", /* @__PURE__ */ React.createElement("span", { className: "srp-transfer-list__count" }, "(", displayNumber(list_2.length, locale), ")")), list_2.length ? /* @__PURE__ */ React.createElement(CheckboxGroup, { className: "srp-transfer-list__options", "aria-labelledby": titleId, size: "sm", value: checked_1.filter((v_3) => list_2.some((o_7) => o_7.value === v_3)), onValueChange: (v_4) => setChecked(v_4.map(String)), invalid: marked, disabled: off, readOnly }, list_2.length > 1 ? /* @__PURE__ */ React.createElement(Checkbox, { selectAll: true }, sds.labels.transferAll) : null, list_2.map(boxOf)) : /* @__PURE__ */ React.createElement("p", { className: "srp-transfer-list__empty" }, sds.labels.transferEmpty));
  };
  const canAdd = moveable(left, checkedLeft).length > 0;
  const canRemove = moveable(right, checkedRight).length > 0;
  const t12 = "group";
  const t13 = rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel);
  const t14 = off || void 0;
  const t15 = off && "srp-transfer-list--disabled";
  let t16;
  if ($[26] !== className || $[27] !== t15) {
    t16 = cn("srp-transfer-list", t15, className);
    $[26] = className;
    $[27] = t15;
    $[28] = t16;
  } else {
    t16 = $[28];
  }
  const t17 = "transfer-list";
  const t18 = side("left", left, checkedLeft, setCheckedLeft);
  let t19;
  if ($[29] !== canAdd || $[30] !== canRemove || $[31] !== move || $[32] !== off || $[33] !== readOnly || $[34] !== sds) {
    t19 = readOnly ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-transfer-list__moves" }, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", endIcon: "arrow_forward", disabled: off || !canAdd, disabledReason: off ? void 0 : sds.labels.transferAddReason, onClick: () => move("right") }, sds.labels.transferAdd), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", startIcon: "arrow_back", disabled: off || !canRemove, disabledReason: off ? void 0 : sds.labels.transferRemoveReason, onClick: () => move("left") }, sds.labels.transferRemove));
    $[29] = canAdd;
    $[30] = canRemove;
    $[31] = move;
    $[32] = off;
    $[33] = readOnly;
    $[34] = sds;
    $[35] = t19;
  } else {
    t19 = $[35];
  }
  let t20;
  if ($[36] !== checkedRight || $[37] !== right || $[38] !== setCheckedRight || $[39] !== side) {
    t20 = side("right", right, checkedRight, setCheckedRight);
    $[36] = checkedRight;
    $[37] = right;
    $[38] = setCheckedRight;
    $[39] = side;
    $[40] = t20;
  } else {
    t20 = $[40];
  }
  let t21;
  if ($[41] !== chosen || $[42] !== form || $[43] !== name || $[44] !== off) {
    t21 = name ? chosen.map((v_5) => /* @__PURE__ */ React.createElement("input", { key: v_5, type: "hidden", name, form, value: v_5, disabled: off })) : null;
    $[41] = chosen;
    $[42] = form;
    $[43] = name;
    $[44] = off;
    $[45] = t21;
  } else {
    t21 = $[45];
  }
  let t22;
  if ($[46] !== chosen || $[47] !== form || $[48] !== off || $[49] !== onInvalid || $[50] !== readOnly || $[51] !== required) {
    t22 = required ? /* @__PURE__ */ React.createElement("input", { key: chosen.length ? "filled" : "empty", className: "srp-transfer-list__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: chosen.length ? "filled" : "", disabled: off || readOnly, form, onInvalid }) : null;
    $[46] = chosen;
    $[47] = form;
    $[48] = off;
    $[49] = onInvalid;
    $[50] = readOnly;
    $[51] = required;
    $[52] = t22;
  } else {
    t22 = $[52];
  }
  let t23;
  if ($[53] !== ref2 || $[54] !== rest || $[55] !== t13 || $[56] !== t14 || $[57] !== t16 || $[58] !== t18 || $[59] !== t19 || $[60] !== t20 || $[61] !== t21 || $[62] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: ref2, role: t12, "aria-labelledby": t13, "aria-disabled": t14, className: t16, "data-component": t17 }, t18, t19, t20, t21, t22);
    $[53] = ref2;
    $[54] = rest;
    $[55] = t13;
    $[56] = t14;
    $[57] = t16;
    $[58] = t18;
    $[59] = t19;
    $[60] = t20;
    $[61] = t21;
    $[62] = t22;
    $[63] = t23;
  } else {
    t23 = $[63];
  }
  return t23;
}
function _temp5() {
  return /* @__PURE__ */ new WeakMap();
}
function _temp4(o_5) {
  return o_5.label;
}
function _temp3(o_4) {
  return o_4.value;
}
function _temp2(list_0, checked_0) {
  return list_0.filter((o_3) => !o_3.disabled && checked_0.includes(o_3.value));
}
function _temp(list, checked) {
  return checked.filter((v_1) => list.some((o_2) => o_2.value === v_1));
}
var TransferList = /* @__PURE__ */ named("TransferList", TransferListRender);
export {
  TransferList
};
//# sourceMappingURL=TransferList.js.map
