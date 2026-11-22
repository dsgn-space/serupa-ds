"use client";

// src/components/TransferList/TransferList.tsx
import { c as _c } from "../../internal/memoCache.js";
import { listFormat } from "../../internal/intl.js";
import * as React from "react";
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
  const $ = _c(63);
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
  const controlled = valueIn !== void 0;
  let t3;
  if ($[7] !== defaultValue || $[8] !== known) {
    t3 = () => known(defaultValue);
    $[7] = defaultValue;
    $[8] = known;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const [own, setOwn] = React.useState(t3);
  const chosen = controlled ? known(valueIn) : own;
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
  if ($[12] !== controlled || $[13] !== defaultValue || $[14] !== known || $[15] !== setCheckedRight) {
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
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  useFormReset(root, t6, form);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const off = !!disabled || inDisabledFieldset;
  const readOnly = !!props.readOnly && !off;
  const required = !!props.required;
  let t7;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => root.current?.querySelector("input:enabled")?.focus();
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  const {
    missing,
    onInvalid
  } = useRequired(chosen.length > 0, t7);
  const marked = !!invalid || missing;
  const left = options.filter((o_0) => !chosen.includes(o_0.value));
  let t8;
  if ($[18] !== options) {
    t8 = (v_0) => options.find((o_1) => o_1.value === v_0);
    $[18] = options;
    $[19] = t8;
  } else {
    t8 = $[19];
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
  if ($[20] !== nameRef) {
    t9 = (n) => {
      root.current = n;
      delegateFocus(n, () => n && n.querySelector("input:enabled"));
      nameRef(n);
    };
    $[20] = nameRef;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  const ref2 = useMergedRef(ref, t9);
  let t10;
  if ($[22] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = () => root.current;
    $[22] = t10;
  } else {
    t10 = $[22];
  }
  useAutoFocus(autoFocus, t10);
  const [boxes] = React.useState(_temp5);
  let t11;
  if ($[23] !== boxes) {
    t11 = (o_6) => boxFor(boxes, o_6);
    $[23] = boxes;
    $[24] = t11;
  } else {
    t11 = $[24];
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
  if ($[25] !== className || $[26] !== t15) {
    t16 = cn("srp-transfer-list", t15, className);
    $[25] = className;
    $[26] = t15;
    $[27] = t16;
  } else {
    t16 = $[27];
  }
  const t17 = "transfer-list";
  const t18 = side("left", left, checkedLeft, setCheckedLeft);
  let t19;
  if ($[28] !== canAdd || $[29] !== canRemove || $[30] !== move || $[31] !== off || $[32] !== readOnly || $[33] !== sds) {
    t19 = readOnly ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-transfer-list__moves" }, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", endIcon: "arrow_forward", disabled: off || !canAdd, disabledReason: off ? void 0 : sds.labels.transferAddReason, onClick: () => move("right") }, sds.labels.transferAdd), /* @__PURE__ */ React.createElement(Button, { variant: "secondary", size: "sm", startIcon: "arrow_back", disabled: off || !canRemove, disabledReason: off ? void 0 : sds.labels.transferRemoveReason, onClick: () => move("left") }, sds.labels.transferRemove));
    $[28] = canAdd;
    $[29] = canRemove;
    $[30] = move;
    $[31] = off;
    $[32] = readOnly;
    $[33] = sds;
    $[34] = t19;
  } else {
    t19 = $[34];
  }
  let t20;
  if ($[35] !== checkedRight || $[36] !== right || $[37] !== setCheckedRight || $[38] !== side) {
    t20 = side("right", right, checkedRight, setCheckedRight);
    $[35] = checkedRight;
    $[36] = right;
    $[37] = setCheckedRight;
    $[38] = side;
    $[39] = t20;
  } else {
    t20 = $[39];
  }
  let t21;
  if ($[40] !== chosen || $[41] !== form || $[42] !== name || $[43] !== off) {
    t21 = name ? chosen.map((v_5) => /* @__PURE__ */ React.createElement("input", { key: v_5, type: "hidden", name, form, value: v_5, disabled: off })) : null;
    $[40] = chosen;
    $[41] = form;
    $[42] = name;
    $[43] = off;
    $[44] = t21;
  } else {
    t21 = $[44];
  }
  let t22;
  if ($[45] !== chosen || $[46] !== form || $[47] !== off || $[48] !== onInvalid || $[49] !== readOnly || $[50] !== required) {
    t22 = required ? /* @__PURE__ */ React.createElement("input", { key: chosen.length ? "filled" : "empty", className: "srp-transfer-list__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: chosen.length ? "filled" : "", disabled: off || readOnly, form, onInvalid }) : null;
    $[45] = chosen;
    $[46] = form;
    $[47] = off;
    $[48] = onInvalid;
    $[49] = readOnly;
    $[50] = required;
    $[51] = t22;
  } else {
    t22 = $[51];
  }
  let t23;
  if ($[52] !== ref2 || $[53] !== rest || $[54] !== t13 || $[55] !== t14 || $[56] !== t16 || $[57] !== t18 || $[58] !== t19 || $[59] !== t20 || $[60] !== t21 || $[61] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: ref2, role: t12, "aria-labelledby": t13, "aria-disabled": t14, className: t16, "data-component": t17 }, t18, t19, t20, t21, t22);
    $[52] = ref2;
    $[53] = rest;
    $[54] = t13;
    $[55] = t14;
    $[56] = t16;
    $[57] = t18;
    $[58] = t19;
    $[59] = t20;
    $[60] = t21;
    $[61] = t22;
    $[62] = t23;
  } else {
    t23 = $[62];
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
