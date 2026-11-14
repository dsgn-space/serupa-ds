"use client";

// src/components/TransferList/TransferList.tsx
import * as React from "react";
import { useMergedRef, cn, domId, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { announce } from "../../internal/announce.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { Checkbox, CheckboxGroup } from "../Checkbox/Checkbox.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
var TransferList = /* @__PURE__ */ component("TransferList", function TransferList2(given, ref) {
  const props = useFieldControl(given);
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const rest = omit(props, { options: 1, value: 1, defaultValue: 1, onValueChange: 1, name: 1, form: 1, disabled: 1, invalid: 1, required: 1, availableLabel: 1, chosenLabel: 1, className: 1, autoFocus: 1 });
  const { options, value: valueIn, defaultValue, onValueChange, name, form, disabled, invalid, availableLabel, chosenLabel, className, autoFocus } = props;
  const nameRef = useNameCheck("TransferList", NAME_HOW.group);
  const sds = useSettings(words), locale = useLocale();
  const known = (vs) => (vs || []).filter((v, i, a) => a.indexOf(v) === i && options.some((o) => o.value === v));
  const controlled = valueIn !== void 0;
  const [own, setOwn] = React.useState(() => known(defaultValue));
  const chosen = controlled ? known(valueIn) : own;
  const [checkedLeft, setCheckedLeft] = React.useState([]);
  const [checkedRight, setCheckedRight] = React.useState([]);
  const root = React.useRef(null);
  const id = domId("dk-transfer", React.useId());
  useFormReset(root, () => {
    if (!controlled) setOwn(known(defaultValue));
    setCheckedLeft([]);
    setCheckedRight([]);
  }, form);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const off = !!disabled || inDisabledFieldset;
  const left = options.filter((o) => !chosen.includes(o.value));
  const right = chosen.map((v) => options.find((o) => o.value === v));
  const names = { left: availableLabel || sds.labels.transferAvailable, right: chosenLabel || sds.labels.transferChosen };
  const keep = (list, checked) => checked.filter((v) => list.some((o) => o.value === v));
  if (keep(left, checkedLeft).length !== checkedLeft.length) setCheckedLeft(keep(left, checkedLeft));
  if (keep(right, checkedRight).length !== checkedRight.length) setCheckedRight(keep(right, checkedRight));
  const moveable = (list, checked) => list.filter((o) => !o.disabled && checked.includes(o.value));
  const move = (to) => {
    const moving = to === "right" ? moveable(left, checkedLeft) : moveable(right, checkedRight);
    if (!moving.length || off) return;
    const vs = moving.map((o) => o.value);
    const next = to === "right" ? [...chosen, ...vs] : chosen.filter((v) => !vs.includes(v));
    if (!controlled) setOwn(next);
    if (onValueChange) onValueChange(next);
    (to === "right" ? setCheckedLeft : setCheckedRight)([]);
    const list = new Intl.ListFormat(locale, { type: "conjunction" }).format(moving.map((o) => o.label));
    announce(sds.labels.transferMoved(list, to === "right" ? names.right : names.left));
  };
  const ref2 = useMergedRef(ref, (n) => {
    root.current = n;
    delegateFocus(n, () => n && n.querySelector("input:enabled"));
    nameRef(n);
  });
  useAutoFocus(autoFocus, () => root.current);
  const side = (which, list, checked, setChecked) => {
    const titleId = id + "-" + which;
    return /* @__PURE__ */ React.createElement("div", { className: "dk-transfer-list__side" }, /* @__PURE__ */ React.createElement("p", { id: titleId, className: "dk-transfer-list__title" }, names[which], " ", /* @__PURE__ */ React.createElement("span", { className: "dk-transfer-list__count" }, "(", displayNumber(list.length, locale), ")")), list.length ? /* @__PURE__ */ React.createElement(
      CheckboxGroup,
      {
        className: "dk-transfer-list__options",
        "aria-labelledby": titleId,
        size: "sm",
        value: checked.filter((v) => list.some((o) => o.value === v)),
        onValueChange: (v) => setChecked(v.map(String)),
        invalid,
        disabled: off
      },
      list.length > 1 ? /* @__PURE__ */ React.createElement(Checkbox, { selectAll: true }, sds.labels.transferAll) : null,
      list.map((o) => /* @__PURE__ */ React.createElement(Checkbox, { key: o.value, value: o.value, disabled: o.disabled, description: o.description }, o.label))
    ) : /* @__PURE__ */ React.createElement("p", { className: "dk-transfer-list__empty" }, sds.labels.transferEmpty));
  };
  const canAdd = moveable(left, checkedLeft).length > 0, canRemove = moveable(right, checkedRight).length > 0;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: ref2,
      role: "group",
      "aria-labelledby": rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel),
      "aria-disabled": off || void 0,
      className: cn("dk-transfer-list", off && "dk-transfer-list--disabled", className),
      "data-component": "transfer-list"
    },
    side("left", left, checkedLeft, setCheckedLeft),
    /* @__PURE__ */ React.createElement("div", { className: "dk-transfer-list__moves" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "secondary",
        size: "sm",
        rightIcon: "arrow_forward",
        disabled: off || !canAdd,
        disabledReason: off ? void 0 : sds.labels.transferAddReason,
        onClick: () => move("right")
      },
      sds.labels.transferAdd
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        variant: "secondary",
        size: "sm",
        leftIcon: "arrow_back",
        disabled: off || !canRemove,
        disabledReason: off ? void 0 : sds.labels.transferRemoveReason,
        onClick: () => move("left")
      },
      sds.labels.transferRemove
    )),
    side("right", right, checkedRight, setCheckedRight),
    name ? chosen.map((v) => /* @__PURE__ */ React.createElement("input", { key: v, type: "hidden", name, form, value: v, disabled: off })) : null
  );
});
export {
  TransferList
};
//# sourceMappingURL=TransferList.js.map
