"use client";

// src/components/CascadeSelect/CascadeSelect.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { useFieldControl } from "../../internal/field.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { isComposing } from "../../internal/ime.js";
import { PickerButton, PickerValidity } from "../../internal/pickerButton.js";
import { typeahead } from "../../internal/typeahead.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { useControllable } from "../../internal/controllable.js";
import { useRequired } from "../../internal/required.js";
import { isRtl } from "../../internal/position.js";
var keyOf = (values) => JSON.stringify(values);
function CascadeSelectRender(t0) {
  const $ = _c(39);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  props = useFieldControl(props);
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const rest = omit(props, {
    options: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    loadOptions: 1,
    levels: 1,
    selectParents: 1,
    placeholder: 1,
    size: 1,
    invalid: 1,
    required: 1,
    name: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    className: 1,
    style: 1,
    form: 1,
    disabled: 1,
    readOnly: 1
  });
  const base = domId("srp-cs", React.useId());
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const disabled = !!props.disabled;
  const readOnly = !!props.readOnly;
  const [value, setOwn, controlled] = useControllable(props.value, props.defaultValue || [], "CascadeSelect", "value");
  const [loaded, setLoaded] = React.useState(_temp);
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = [];
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  const [known, setKnown] = React.useState(t2);
  const [heldOpen, setOwnOpen, openControlled] = useControllable(props.open, !!props.defaultOpen, "CascadeSelect", "open");
  const open = !disabled && !readOnly && heldOpen;
  const setOpen = (next, reason) => {
    if (next === open) {
      return;
    }
    if (!openControlled) {
      setOwnOpen(next);
    }
    if (props.onOpenChange) {
      props.onOpenChange(next, {
        reason
      });
    }
  };
  const [path, setPath] = React.useState(value);
  const [col, setCol] = React.useState(Math.max(0, value.length - 1));
  const button = React.useRef(null);
  const required = !!props.required;
  let t3;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => button.current?.focus();
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  const {
    missing,
    onInvalid
  } = useRequired(value.length > 0, t3);
  const panel = React.useRef(null);
  const hidden = React.useRef(null);
  const typed = React.useRef({
    text: "",
    at: 0
  });
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => !!button.current && isRtl(button.current);
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const rtl = t4;
  const [openRtl, setOpenRtl] = React.useState(false);
  let t5;
  let t6;
  if ($[3] !== open) {
    t5 = () => {
      if (open) {
        setOpenRtl(rtl());
      }
    };
    t6 = [open];
    $[3] = open;
    $[4] = t5;
    $[5] = t6;
  } else {
    t5 = $[4];
    t6 = $[5];
  }
  useIsoLayoutEffect(t5, t6);
  const childrenOf = (o, at) => {
    if (!o) {
      return props.options || [];
    }
    if (o.children) {
      return o.children;
    }
    if (o.isLeaf || !props.loadOptions) {
      return null;
    }
    return loaded.get(keyOf(at)) || null;
  };
  const hasMore = (o_0, at_0) => !o_0.isLeaf && (o_0.children ? o_0.children.length > 0 : !!props.loadOptions || (loaded.get(keyOf(at_0)) || []).length > 0);
  const columnsFor = (p) => {
    const cols = [];
    let list = childrenOf(null, []);
    for (let i = 0; list; i++) {
      const at_1 = p[i];
      const chosen = Array.isArray(list) ? list.find((o_1) => o_1.value === at_1) || null : null;
      cols.push({
        options: list,
        chosen
      });
      if (!chosen) {
        break;
      }
      list = childrenOf(chosen, p.slice(0, i + 1));
    }
    return cols;
  };
  const optionsOf = (p_0) => {
    const out = [];
    for (const c of columnsFor(p_0)) {
      if (c.chosen) {
        out.push(c.chosen);
      }
    }
    return out;
  };
  const columns = columnsFor(open ? path : value);
  const load = (p_1) => {
    const opts = optionsOf(p_1);
    const last = opts[opts.length - 1];
    if (!props.loadOptions || !last || opts.length !== p_1.length || last.children || last.isLeaf || loaded.has(keyOf(p_1)) && loaded.get(keyOf(p_1)) !== "failed") {
      return;
    }
    setLoaded((m) => new Map(m).set(keyOf(p_1), "loading"));
    props.loadOptions(opts).then((kids) => setLoaded((m_0) => new Map(m_0).set(keyOf(p_1), kids)), () => setLoaded((m_1) => new Map(m_1).set(keyOf(p_1), "failed")));
  };
  React.useEffect(() => {
    if (!props.loadOptions) {
      return;
    }
    for (let i_0 = 1; i_0 < value.length; i_0++) {
      const p_2 = value.slice(0, i_0);
      if (!loaded.has(keyOf(p_2))) {
        load(p_2);
      }
    }
  });
  const chosenLabels = value.map((v, i_1) => {
    const o_2 = optionsOf(value)[i_1] || known.find((k, j) => j === i_1 && k.value === v);
    return o_2 ? o_2.label : v;
  });
  const choose = (p_3) => {
    const opts_0 = optionsOf(p_3);
    setKnown(opts_0);
    if (!controlled) {
      setOwn(p_3);
    }
    if (props.onValueChange) {
      props.onValueChange(p_3, {
        options: opts_0
      });
    }
    close(true, "select");
  };
  const close = (focus, reason_0) => {
    setOpen(false, reason_0);
    if (focus && button.current) {
      button.current.focus();
    }
  };
  const [dialogName, setDialogName] = React.useState("");
  const show = () => {
    if (!disabled && !readOnly) {
      setOpen(true, "trigger");
    }
  };
  const focusCol = React.useRef(null);
  const first = React.useRef(true);
  let t7;
  if ($[6] !== open) {
    t7 = [open];
    $[6] = open;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  useIsoLayoutEffect(() => {
    const opening = open && !first.current;
    first.current = false;
    if (!open) {
      return;
    }
    const b = button.current;
    const label = b && b.labels && b.labels[0];
    setDialogName(props["aria-label"] || label && label.textContent || props.levels && props.levels[0] || L.cascadePlaceholder);
    const start = value.slice();
    const c_0 = Math.max(0, start.length - 1);
    setPath(start);
    setCol(c_0);
    if (opening) {
      focusCol.current = c_0;
    }
    start.forEach((_, i_2) => load(start.slice(0, i_2 + 1)));
  }, t7);
  useFormReset(hidden, () => {
    if (!controlled) {
      setOwn(props.defaultValue || []);
    }
    setOpen(false, "reset");
  }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, {
    placement: "bottom-start",
    offsetVar: "--srp-cs-offset",
    onOutside: () => close(false, "outside"),
    onFocusOutside: () => close(false, "outside"),
    inside: button
  });
  let t8;
  if ($[8] !== open) {
    t8 = () => {
      if (!open || focusCol.current == null || !panel.current) {
        return;
      }
      const lists = panel.current.querySelectorAll("[role=listbox]");
      const list_0 = lists[focusCol.current];
      if (!list_0) {
        return;
      }
      const target = list_0.querySelector("[role=option][tabindex='0']") || list_0;
      target.focus({
        preventScroll: true
      });
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        });
      }
      focusCol.current = null;
    };
    $[8] = open;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  React.useEffect(t8);
  const pick = (c_1, o_3, viaKey) => {
    if (o_3.disabled) {
      return;
    }
    const next_0 = path.slice(0, c_1).concat(o_3.value);
    if (!hasMore(o_3, next_0) || props.selectParents && path[c_1] === o_3.value && path.length === c_1 + 1) {
      choose(next_0);
      return;
    }
    setPath(next_0);
    load(next_0);
    if (!viaKey) {
      setCol(c_1 + 1);
      focusCol.current = c_1 + 1;
    }
  };
  const onKeyDown = (c_2, list_1) => (e) => {
    if (isComposing(e)) {
      return;
    }
    const k_0 = e.key;
    const into = rtl() ? "ArrowLeft" : "ArrowRight";
    const back = rtl() ? "ArrowRight" : "ArrowLeft";
    const enabled = list_1.map(_temp2).filter(_temp3);
    const at_2 = list_1.findIndex((o_5) => o_5.value === path[c_2]);
    const go = (i_5) => {
      if (i_5 < 0 || !list_1[i_5]) {
        return;
      }
      const next_1 = path.slice(0, c_2).concat(list_1[i_5].value);
      setPath(next_1);
      setCol(c_2);
      focusCol.current = c_2;
    };
    if (k_0 === "ArrowDown") {
      go(enabled.find((i_6) => i_6 > at_2) ?? (at_2 < 0 ? enabled[0] ?? -1 : -1));
    } else {
      if (k_0 === "ArrowUp") {
        go([...enabled].reverse().find((i_7) => i_7 < at_2) ?? -1);
      } else {
        if (k_0 === "Home") {
          go(enabled[0] ?? -1);
        } else {
          if (k_0 === "End") {
            go(enabled[enabled.length - 1] ?? -1);
          } else {
            if (k_0 === into) {
              const o_6 = list_1[at_2];
              if (!o_6 || !hasMore(o_6, path.slice(0, c_2 + 1))) {
                return;
              }
              load(path.slice(0, c_2 + 1));
              setCol(c_2 + 1);
              focusCol.current = c_2 + 1;
              const kids_0 = childrenOf(o_6, path.slice(0, c_2 + 1));
              if (Array.isArray(kids_0)) {
                const first_0 = kids_0.find(_temp4);
                if (first_0) {
                  setPath(path.slice(0, c_2 + 1).concat(first_0.value));
                }
              }
            } else {
              if (k_0 === back) {
                if (c_2 > 0) {
                  setPath(path.slice(0, c_2));
                  setCol(c_2 - 1);
                  focusCol.current = c_2 - 1;
                }
              } else {
                if (k_0 === "Enter" || k_0 === " ") {
                  const o_7 = list_1[at_2];
                  if (!o_7 || o_7.disabled) {
                    return;
                  }
                  const p_4 = path.slice(0, c_2 + 1);
                  if (!hasMore(o_7, p_4) || props.selectParents) {
                    choose(p_4);
                  } else {
                    load(p_4);
                    setCol(c_2 + 1);
                    focusCol.current = c_2 + 1;
                  }
                } else {
                  if (k_0 === "Escape") {
                    e.stopPropagation();
                    close(true, "escape");
                  } else {
                    if (k_0 === "Tab") {
                      return;
                    } else {
                      if (k_0.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        go(typeahead(typed.current, k_0, list_1.map(_temp5), at_2));
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
    }
    e.preventDefault();
  };
  const labelFor = (c_3) => props.levels && props.levels[c_3] || L.cascadeLevel(c_3 + 1, displayNumber(c_3 + 1, locale));
  const empty = !value.length;
  let t9;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = (n) => {
      button.current = n;
    };
    $[10] = t9;
  } else {
    t9 = $[10];
  }
  const mergedRef = useMergedRef(ref, t9);
  const t10 = cn("srp-cascade-select", "srp-cascade-select--size-" + size, (invalid || missing) && "srp-cascade-select--invalid", disabled && "srp-cascade-select--disabled", readOnly && "srp-cascade-select--readonly", open && "srp-cascade-select--open", props.className);
  const t11 = props.style;
  const t12 = empty && "srp-cascade-select__value--empty";
  let t13;
  if ($[11] !== t12) {
    t13 = cn("srp-cascade-select__value", t12);
    $[11] = t12;
    $[12] = t13;
  } else {
    t13 = $[12];
  }
  const t14 = empty ? props.placeholder ?? L.cascadePlaceholder : L.cascadePath(chosenLabels);
  let t15;
  if ($[13] !== t13 || $[14] !== t14) {
    t15 = /* @__PURE__ */ React.createElement(TruncatedText, { className: t13, dir: "auto" }, t14);
    $[13] = t13;
    $[14] = t14;
    $[15] = t15;
  } else {
    t15 = $[15];
  }
  let t16;
  if ($[16] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-cascade-select__chevron" });
    $[16] = t16;
  } else {
    t16 = $[16];
  }
  const t17 = value.length > 0;
  const t18 = disabled || readOnly;
  const t19 = props;
  let t20;
  if ($[17] !== onInvalid || $[18] !== required || $[19] !== t17 || $[20] !== t18 || $[21] !== t19.form) {
    t20 = /* @__PURE__ */ React.createElement(PickerValidity, { block: "srp-cascade-select", required, filled: t17, disabled: t18, form: t19.form, onInvalid });
    $[17] = onInvalid;
    $[18] = required;
    $[19] = t17;
    $[20] = t18;
    $[21] = t19.form;
    $[22] = t20;
  } else {
    t20 = $[22];
  }
  const t21 = base + "-more";
  let t22;
  if ($[23] !== L || $[24] !== open || $[25] !== openRtl) {
    t22 = L.cascadeHasMore(open && openRtl);
    $[23] = L;
    $[24] = open;
    $[25] = openRtl;
    $[26] = t22;
  } else {
    t22 = $[26];
  }
  let t23;
  if ($[27] !== t21 || $[28] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("span", { id: t21, hidden: true }, t22);
    $[27] = t21;
    $[28] = t22;
    $[29] = t23;
  } else {
    t23 = $[29];
  }
  const t24 = base + "-panel";
  const t25 = "dialog";
  let t26;
  if ($[30] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t26 = {
      popover: "manual"
    };
    $[30] = t26;
  } else {
    t26 = $[30];
  }
  const t27 = !open || void 0;
  const t28 = !open || void 0;
  const t29 = exit.instant ? "" : void 0;
  const t30 = "srp-cascade-select__panel";
  const t31 = open || exit.leaving ? columns.map((column, c_4) => /* @__PURE__ */ React.createElement("div", { key: c_4, className: "srp-cascade-select__column", "data-active": c_4 === Math.min(col, columns.length - 1) ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "srp-cascade-select__level", id: base + "-level-" + c_4 }, c_4 > 0 ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-cascade-select__back", tabIndex: -1, "aria-label": L.cascadeBack, onClick: () => {
    setPath(path.slice(0, c_4));
    setCol(c_4 - 1);
    focusCol.current = c_4 - 1;
  } }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronLeft })) : null, labelFor(c_4)), Array.isArray(column.options) ? /* @__PURE__ */ React.createElement("div", { role: "listbox", className: "srp-cascade-select__list", "aria-labelledby": base + "-level-" + c_4, tabIndex: column.options.length && column.options.some((o_9) => o_9.value === path[c_4]) ? -1 : 0, onKeyDown: onKeyDown(c_4, column.options), onFocus: () => setCol(c_4), onClick: (e_0) => {
    const el = e_0.target instanceof Element ? e_0.target.closest("[role=option]") : null;
    const o_10 = el && Array.isArray(column.options) ? column.options[Number(el.dataset.index)] : null;
    if (o_10) {
      setCol(c_4);
      pick(c_4, o_10, false);
    }
  } }, column.options.length ? column.options.map((o_11, i_8) => {
    const on = path[c_4] === o_11.value;
    const more = hasMore(o_11, path.slice(0, c_4).concat(o_11.value));
    return /* @__PURE__ */ React.createElement("div", { key: o_11.value, role: "option", id: base + "-" + c_4 + "-" + o_11.value, className: cn("srp-cascade-select__option", on && "srp-cascade-select__option--on"), "aria-selected": on, "aria-disabled": o_11.disabled || void 0, "aria-describedby": more ? base + "-more" : void 0, tabIndex: on ? 0 : -1, dir: "auto", "data-index": i_8 }, /* @__PURE__ */ React.createElement("span", { className: "srp-cascade-select__label" }, o_11.label), more ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, className: "srp-cascade-select__more" }) : value[c_4] === o_11.value && value.length === c_4 + 1 ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-cascade-select__check" }) : null);
  }) : /* @__PURE__ */ React.createElement("div", { className: "srp-cascade-select__note" }, L.cascadeEmpty)) : /* @__PURE__ */ React.createElement("div", { className: "srp-cascade-select__note", role: "status", "aria-live": "polite", "aria-busy": column.options === "loading" || void 0 }, column.options === "loading" ? L.cascadeLoading : L.cascadeFailed))) : null;
  let t32;
  if ($[31] !== dialogName || $[32] !== t24 || $[33] !== t26 || $[34] !== t27 || $[35] !== t28 || $[36] !== t29 || $[37] !== t31) {
    t32 = /* @__PURE__ */ React.createElement("div", { ref: panel, id: t24, role: t25, "aria-label": dialogName, ...t26, hidden: t27, inert: t28, "data-instant": t29, className: t30 }, t31);
    $[31] = dialogName;
    $[32] = t24;
    $[33] = t26;
    $[34] = t27;
    $[35] = t28;
    $[36] = t29;
    $[37] = t31;
    $[38] = t32;
  } else {
    t32 = $[38];
  }
  return /* @__PURE__ */ React.createElement("div", { className: t10, style: t11, "data-component": "cascade-select", "data-state": open ? "open" : "closed" }, /* @__PURE__ */ React.createElement(PickerButton, { ...rest, block: "srp-cascade-select", buttonRef: mergedRef, open, panelId: base + "-panel", invalid: invalid || missing, required, readOnly, disabled, onOpen: show, onClose: () => close(false, "trigger") }, t15, t16), props.name ? /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", name: props.name, form: props.form, value: value[value.length - 1] || "", disabled }) : /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", disabled: true }), t20, t23, t32);
}
function _temp5(o_8) {
  return o_8.disabled ? "" : o_8.label;
}
function _temp4(x) {
  return !x.disabled;
}
function _temp3(i_4) {
  return i_4 >= 0;
}
function _temp2(o_4, i_3) {
  return o_4.disabled ? -1 : i_3;
}
function _temp() {
  return /* @__PURE__ */ new Map();
}
var CascadeSelect = /* @__PURE__ */ named("CascadeSelect", CascadeSelectRender);
export {
  CascadeSelect
};
//# sourceMappingURL=CascadeSelect.js.map
