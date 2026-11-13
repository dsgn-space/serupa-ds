"use client";

// src/components/CascadeSelect/CascadeSelect.tsx
import * as React from "react";
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { useFieldControl } from "../../internal/field.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { isComposing } from "../../internal/ime.js";
import { typeahead } from "../../internal/typeahead.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var keyOf = (values) => JSON.stringify(values);
var CascadeSelect = /* @__PURE__ */ component("CascadeSelect", function CascadeSelect2(props, ref) {
  props = useFieldControl(props);
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { options: 1, value: 1, defaultValue: 1, onValueChange: 1, loadOptions: 1, levels: 1, selectParents: 1, placeholder: 1, size: 1, invalid: 1, name: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1, style: 1, form: 1, disabled: 1, readOnly: 1 });
  const base = domId("dk-cs", React.useId());
  const size = props.size === "sm" || props.size === "lg" ? props.size : "md";
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const disabled = !!props.disabled, readOnly = !!props.readOnly;
  const controlled = props.value !== void 0;
  const [own, setOwn] = React.useState(props.defaultValue || []);
  const value = controlled ? props.value : own;
  const [loaded, setLoaded] = React.useState(() => /* @__PURE__ */ new Map());
  const [known, setKnown] = React.useState([]);
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen);
  const open = !disabled && !readOnly && (props.open !== void 0 ? props.open : ownOpen);
  const setOpen = (next, reason) => {
    if (next === open) return;
    if (props.open === void 0) setOwnOpen(next);
    if (props.onOpenChange) props.onOpenChange(next, { reason });
  };
  const [path, setPath] = React.useState(value);
  const [col, setCol] = React.useState(Math.max(0, value.length - 1));
  const button = React.useRef(null);
  const panel = React.useRef(null);
  const hidden = React.useRef(null);
  const typed = React.useRef({ text: "", at: 0 });
  const rtl = () => !!button.current && getComputedStyle(button.current).direction === "rtl";
  const childrenOf = (o, at) => {
    if (!o) return props.options || [];
    if (o.children) return o.children;
    if (o.isLeaf || !props.loadOptions) return null;
    return loaded.get(keyOf(at)) || null;
  };
  const hasMore = (o, at) => !o.isLeaf && (o.children ? o.children.length > 0 : !!props.loadOptions || (loaded.get(keyOf(at)) || []).length > 0);
  const columnsFor = (p) => {
    const cols = [];
    let list = childrenOf(null, []);
    for (let i = 0; list; i++) {
      const chosen = Array.isArray(list) ? list.find((o) => o.value === p[i]) || null : null;
      cols.push({ options: list, chosen });
      if (!chosen) break;
      list = childrenOf(chosen, p.slice(0, i + 1));
    }
    return cols;
  };
  const optionsOf = (p) => {
    const out = [];
    for (const c of columnsFor(p)) if (c.chosen) out.push(c.chosen);
    return out;
  };
  const columns = columnsFor(open ? path : value);
  const load = (p) => {
    const opts = optionsOf(p), last = opts[opts.length - 1];
    if (!props.loadOptions || !last || opts.length !== p.length || last.children || last.isLeaf || loaded.has(keyOf(p)) && loaded.get(keyOf(p)) !== "failed") return;
    setLoaded((m) => new Map(m).set(keyOf(p), "loading"));
    props.loadOptions(opts).then((kids) => setLoaded((m) => new Map(m).set(keyOf(p), kids)), () => setLoaded((m) => new Map(m).set(keyOf(p), "failed")));
  };
  React.useEffect(() => {
    if (!props.loadOptions) return;
    for (let i = 1; i < value.length; i++) {
      const p = value.slice(0, i);
      if (!loaded.has(keyOf(p))) load(p);
    }
  });
  const chosenLabels = value.map((v, i) => {
    const o = optionsOf(value)[i] || known.find((k, j) => j === i && k.value === v);
    return o ? o.label : v;
  });
  const choose = (p) => {
    const opts = optionsOf(p);
    setKnown(opts);
    if (!controlled) setOwn(p);
    if (props.onValueChange) props.onValueChange(p, { options: opts });
    close(true, "select");
  };
  const close = (focus, reason) => {
    setOpen(false, reason);
    if (focus && button.current) button.current.focus();
  };
  const [dialogName, setDialogName] = React.useState("");
  const show = () => {
    if (!disabled && !readOnly) setOpen(true, "trigger");
  };
  const focusCol = React.useRef(null);
  const first = React.useRef(true);
  useIsoLayoutEffect(() => {
    const opening = open && !first.current;
    first.current = false;
    if (!open) return;
    const b = button.current, label = b && b.labels && b.labels[0];
    setDialogName(props["aria-label"] || label && label.textContent || props.levels && props.levels[0] || L.cascadePlaceholder);
    const start = value.slice(), c = Math.max(0, start.length - 1);
    setPath(start);
    setCol(c);
    if (opening) focusCol.current = c;
    start.forEach((_, i) => load(start.slice(0, i + 1)));
  }, [open]);
  useFormReset(hidden, () => {
    if (!controlled) setOwn(props.defaultValue || []);
    setOpen(false, "reset");
  }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, { placement: "bottom-start", offsetVar: "--dk-cs-offset", onOutside: () => close(false, "outside"), onFocusOutside: () => close(false, "outside"), inside: button });
  React.useEffect(() => {
    if (!open || focusCol.current == null || !panel.current) return;
    const lists = panel.current.querySelectorAll("[role=listbox]"), list = lists[focusCol.current];
    if (!list) return;
    const target = list.querySelector("[role=option][tabindex='0']") || list;
    target.focus({ preventScroll: true });
    if (typeof target.scrollIntoView === "function") target.scrollIntoView({ block: "nearest", inline: "nearest" });
    focusCol.current = null;
  });
  const pick = (c, o, viaKey) => {
    if (o.disabled) return;
    const next = path.slice(0, c).concat(o.value);
    if (!hasMore(o, next) || props.selectParents && path[c] === o.value && path.length === c + 1) {
      choose(next);
      return;
    }
    setPath(next);
    load(next);
    if (!viaKey) {
      setCol(c + 1);
      focusCol.current = c + 1;
    }
  };
  const onKeyDown = (c, list) => (e) => {
    if (isComposing(e)) return;
    const k = e.key, into = rtl() ? "ArrowLeft" : "ArrowRight", back = rtl() ? "ArrowRight" : "ArrowLeft";
    const enabled = list.map((o, i) => o.disabled ? -1 : i).filter((i) => i >= 0);
    const at = list.findIndex((o) => o.value === path[c]);
    const go = (i) => {
      if (i < 0 || !list[i]) return;
      const next = path.slice(0, c).concat(list[i].value);
      setPath(next);
      setCol(c);
      focusCol.current = c;
    };
    if (k === "ArrowDown") go(enabled.find((i) => i > at) ?? (at < 0 ? enabled[0] : -1));
    else if (k === "ArrowUp") go([...enabled].reverse().find((i) => i < at) ?? -1);
    else if (k === "Home") go(enabled[0]);
    else if (k === "End") go(enabled[enabled.length - 1]);
    else if (k === into) {
      const o = list[at];
      if (!o || !hasMore(o, path.slice(0, c + 1))) return;
      load(path.slice(0, c + 1));
      setCol(c + 1);
      focusCol.current = c + 1;
      const kids = childrenOf(o, path.slice(0, c + 1));
      if (Array.isArray(kids)) {
        const first2 = kids.find((x) => !x.disabled);
        if (first2) setPath(path.slice(0, c + 1).concat(first2.value));
      }
    } else if (k === back) {
      if (c > 0) {
        setPath(path.slice(0, c));
        setCol(c - 1);
        focusCol.current = c - 1;
      }
    } else if (k === "Enter" || k === " ") {
      const o = list[at];
      if (!o || o.disabled) return;
      const p = path.slice(0, c + 1);
      if (!hasMore(o, p) || props.selectParents) choose(p);
      else {
        load(p);
        setCol(c + 1);
        focusCol.current = c + 1;
      }
    } else if (k === "Escape") {
      e.stopPropagation();
      close(true, "escape");
    } else if (k === "Tab") return;
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      go(typeahead(typed.current, k, list.map((o) => o.disabled ? "" : o.label), at));
    } else return;
    e.preventDefault();
  };
  const labelFor = (c) => props.levels && props.levels[c] || L.cascadeLevel(c + 1, displayNumber(c + 1, locale));
  const empty = !value.length;
  const mergedRef = useMergedRef(ref, (n) => {
    button.current = n;
  });
  return /* @__PURE__ */ React.createElement("div", { className: cn("dk-cascade-select", "dk-cascade-select--size-" + size, invalid && "dk-cascade-select--invalid", disabled && "dk-cascade-select--disabled", readOnly && "dk-cascade-select--readonly", open && "dk-cascade-select--open", props.className), style: props.style, "data-component": "cascade-select", "data-state": open ? "open" : "closed" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      ...rest,
      ref: mergedRef,
      type: "button",
      role: "combobox",
      className: "dk-cascade-select__button",
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": open ? base + "-panel" : void 0,
      "aria-invalid": invalid || void 0,
      "aria-readonly": readOnly || void 0,
      disabled,
      onClick: (e) => {
        if (rest.onClick) rest.onClick(e);
        if (!e.defaultPrevented) {
          if (open) close(false, "trigger");
          else show();
        }
      },
      onKeyDown: (e) => {
        if (rest.onKeyDown) rest.onKeyDown(e);
        if (!e.defaultPrevented && !open && (e.key === "ArrowDown" || e.key === "ArrowUp") && !isComposing(e)) {
          e.preventDefault();
          show();
        }
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: cn("dk-cascade-select__value", empty && "dk-cascade-select__value--empty"), dir: "auto" }, empty ? props.placeholder ?? L.cascadePlaceholder : L.cascadePath(chosenLabels)),
    /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "dk-cascade-select__chevron" })
  ), props.name ? /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", name: props.name, form: props.form, value: value[value.length - 1] || "", disabled }) : /* @__PURE__ */ React.createElement("input", { ref: hidden, type: "hidden", disabled: true }), /* @__PURE__ */ React.createElement("span", { id: base + "-more", hidden: true }, L.cascadeHasMore(open && rtl())), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: panel,
      id: base + "-panel",
      role: "dialog",
      "aria-label": dialogName,
      ...{ popover: "manual" },
      hidden: !open || void 0,
      inert: !open || void 0,
      "data-instant": exit.instant ? "" : void 0,
      className: "dk-cascade-select__panel"
    },
    open || exit.leaving ? columns.map((column, c) => /* @__PURE__ */ React.createElement("div", { key: c, className: "dk-cascade-select__column", "data-active": c === Math.min(col, columns.length - 1) ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "dk-cascade-select__level", id: base + "-level-" + c }, c > 0 ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "dk-cascade-select__back", tabIndex: -1, "aria-label": L.cascadeBack, onClick: () => {
      setPath(path.slice(0, c));
      setCol(c - 1);
      focusCol.current = c - 1;
    } }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronLeft })) : null, labelFor(c)), Array.isArray(column.options) ? /* @__PURE__ */ React.createElement(
      "div",
      {
        role: "listbox",
        className: "dk-cascade-select__list",
        "aria-labelledby": base + "-level-" + c,
        tabIndex: column.options.length && column.options.some((o) => o.value === path[c]) ? -1 : 0,
        onKeyDown: onKeyDown(c, column.options),
        onFocus: () => setCol(c),
        onClick: (e) => {
          const el = e.target instanceof Element ? e.target.closest("[role=option]") : null, o = el && Array.isArray(column.options) ? column.options[Number(el.dataset.index)] : null;
          if (o) {
            setCol(c);
            pick(c, o, false);
          }
        }
      },
      column.options.length ? column.options.map((o, i) => {
        const on = path[c] === o.value, more = hasMore(o, path.slice(0, c).concat(o.value));
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: o.value,
            role: "option",
            id: base + "-" + c + "-" + o.value,
            className: cn("dk-cascade-select__option", on && "dk-cascade-select__option--on"),
            "aria-selected": on,
            "aria-disabled": o.disabled || void 0,
            "aria-describedby": more ? base + "-more" : void 0,
            tabIndex: on ? 0 : -1,
            dir: "auto",
            "data-index": i
          },
          /* @__PURE__ */ React.createElement("span", { className: "dk-cascade-select__label" }, o.label),
          more ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, className: "dk-cascade-select__more" }) : value[c] === o.value && value.length === c + 1 ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "dk-cascade-select__check" }) : null
        );
      }) : /* @__PURE__ */ React.createElement("div", { className: "dk-cascade-select__note" }, L.cascadeEmpty)
    ) : /* @__PURE__ */ React.createElement("div", { className: "dk-cascade-select__note", role: "status", "aria-live": "polite", "aria-busy": column.options === "loading" || void 0 }, column.options === "loading" ? L.cascadeLoading : L.cascadeFailed))) : null
  ));
});
export {
  CascadeSelect
};
//# sourceMappingURL=CascadeSelect.js.map
