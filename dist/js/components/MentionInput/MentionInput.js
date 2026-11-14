"use client";

// src/components/MentionInput/MentionInput.tsx
import * as React from "react";
import { cn, domId, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { FieldContext } from "../../internal/field.js";
import { isComposing } from "../../internal/ime.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { announcePause } from "../../internal/timing.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { Avatar } from "../Avatar/Avatar.js";
import { highlightRanges } from "../Highlight/Highlight.js";
import { Textarea } from "../Textarea/Textarea.js";
import { en as words } from "../Combobox/labels.js";
var MAX_QUERY = 40;
function mentionQuery(text, caret, trigger = "@") {
  const start = text.lastIndexOf(trigger, caret - 1);
  if (start < 0 || caret - start - trigger.length > MAX_QUERY) return null;
  const before = start ? text.charAt(start - 1) : " ";
  if (!/[\s([{"'“‘]/.test(before)) return null;
  const q = text.slice(start + trigger.length, caret);
  if (/[\n\r]/.test(q) || /^\s|\s$/.test(q)) return null;
  return { start, text: q };
}
function mentionsIn(text, options, trigger = "@") {
  const longest = options.slice().sort((a, b) => b.label.length - a.label.length);
  const found = [];
  for (let at = text.indexOf(trigger); at >= 0; at = text.indexOf(trigger, at + trigger.length)) {
    const o = longest.find((x) => x.label && text.startsWith(x.label, at + trigger.length) && !/[\p{L}\p{N}]/u.test(text.charAt(at + trigger.length + x.label.length)));
    if (o && !found.includes(o)) found.push(o);
  }
  return found;
}
var COPIED = [
  "boxSizing",
  "width",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textTransform",
  "wordSpacing",
  "textIndent",
  "tabSize",
  "direction"
];
function caretAt(el, index) {
  const cs = getComputedStyle(el), copy = document.createElement("div"), mark = document.createElement("span");
  for (const k of COPIED) copy.style[k] = cs[k];
  Object.assign(copy.style, { position: "absolute", visibility: "hidden", top: "0", left: "-9999px", whiteSpace: "pre-wrap", overflowWrap: "break-word", overflow: "hidden" });
  copy.textContent = el.value.slice(0, index);
  mark.textContent = "\u200B";
  copy.appendChild(mark);
  document.body.appendChild(copy);
  const line = parseFloat(cs.lineHeight) || mark.offsetHeight;
  const out = { left: mark.offsetLeft - el.scrollLeft, top: mark.offsetTop - el.scrollTop, height: line };
  copy.remove();
  return out;
}
var MentionInput = /* @__PURE__ */ component("MentionInput", function MentionInput2(props, ref) {
  const { options, value, defaultValue, onValueChange, onSearch, onMention, trigger = "@", filter = true, maxOptions = 8, className, style, ...rest } = props;
  const L = useSettings(words).labels, locale = useLocale();
  const field = React.useRef(null);
  const [own, setOwn] = React.useState(defaultValue || "");
  const text = value !== void 0 ? value : own;
  const [query, setQuery] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(-1);
  const [active, setActive] = React.useState(0);
  const caret = React.useRef(null);
  useFormReset(field, () => {
    if (value === void 0) setOwn(defaultValue || "");
    setQuery(null);
  }, rest.form);
  const base = domId("dk-mention", React.useId()), listId = base + "-list";
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const q = query && query.start !== dismissed ? query : null;
  const max = Math.max(1, Math.floor(maxOptions) || 8);
  const shown = !q ? [] : (filter ? options.filter((o) => !q.text || highlightRanges(o.label, q.text).length > 0).sort((a, b) => Number(!(highlightRanges(a.label, q.text)[0]?.[0] === 0)) - Number(!(highlightRanges(b.label, q.text)[0]?.[0] === 0))) : options.slice()).slice(0, max);
  const open = !!q && !rest.disabled && !rest.readOnly;
  const pickable = shown.map((o, i) => o.disabled ? -1 : i).filter((i) => i >= 0);
  const current = pickable.indexOf(active) >= 0 ? active : pickable[0] ?? -1;
  const qText = q ? q.text : null;
  const onQuery = React.useRef(onSearch);
  useIsoLayoutEffect(() => {
    onQuery.current = onSearch;
  });
  const lastQuery = React.useRef(null);
  React.useEffect(() => {
    if (qText === lastQuery.current) return;
    lastQuery.current = qText;
    if (onQuery.current) onQuery.current(qText);
  }, [qText]);
  const said = !open ? "" : shown.length ? L.resultsCount(shown.length, displayNumber(shown.length, locale)) : L.noResults;
  React.useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [said]);
  const read = (el) => {
    const at = el.selectionStart === el.selectionEnd ? el.selectionStart : -1;
    const next = at < 0 ? null : mentionQuery(el.value, at, trigger);
    setQuery((was) => was && next && was.start === next.start && was.text === next.text ? was : next);
    if (!next || query && next.start !== query.start) setActive(0);
    if (!next) setDismissed(-1);
  };
  const change = (next) => {
    if (value === void 0) setOwn(next);
    if (onValueChange) onValueChange(next);
  };
  const pick = (o) => {
    const el = field.current;
    if (!q || !el || o.disabled) return;
    const end = q.start + trigger.length + q.text.length;
    const after = text.slice(end).replace(/^[^\s]*/, "");
    const put = trigger + o.label + (after.startsWith(" ") ? "" : " ");
    const next = text.slice(0, q.start) + put + after;
    caret.current = q.start + put.length + (after.startsWith(" ") ? 1 : 0);
    setQuery(null);
    change(next);
    if (onMention) onMention(o);
  };
  useIsoLayoutEffect(() => {
    const el = field.current;
    if (caret.current == null || !el) return;
    el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });
  const wrap = React.useRef(null), anchor = React.useRef(null), pop = React.useRef(null);
  useIsoLayoutEffect(() => {
    const el = field.current, a = anchor.current;
    if (!open || !el || !a || !q) return;
    const c = caretAt(el, q.start);
    a.style.insetInlineStart = "";
    a.style.left = el.offsetLeft + el.clientLeft + Math.max(0, Math.min(c.left, el.clientWidth)) + "px";
    a.style.top = el.offsetTop + el.clientTop + Math.max(0, Math.min(c.top, el.clientHeight - c.height)) + "px";
    a.style.height = c.height + "px";
  }, [open, q && q.start, text]);
  useAnchoredLayer(open, pop, anchor, {
    placement: "bottom-start",
    offsetVar: "--dk-mention-input-offset",
    watch: shown.length,
    onOutside: () => setQuery(null),
    onFocusOutside: () => setQuery(null)
  });
  const onKeyDown = (e) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (e.defaultPrevented || !open || isComposing(e)) return;
    const at = pickable.indexOf(current);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!pickable.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive(pickable[(at + step + pickable.length) % pickable.length] ?? -1);
    } else if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey && shown[current]) {
      e.preventDefault();
      pick(shown[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setDismissed(q ? q.start : -1);
    }
  };
  const setRefs = useMergedRef(ref, (n) => {
    field.current = n;
  });
  const keep = (e) => e.preventDefault();
  return /* @__PURE__ */ React.createElement("span", { ref: wrap, className: cn("dk-mention-input", className), style, "data-component": "mention-input", "data-state": open ? "open" : "closed" }, /* @__PURE__ */ React.createElement(
    Textarea,
    {
      ...rest,
      ref: setRefs,
      value: text,
      "aria-autocomplete": "list",
      "aria-controls": open ? listId : void 0,
      "aria-activedescendant": open && current >= 0 ? base + "-opt-" + current : void 0,
      onChange: (e) => {
        if (rest.onChange) rest.onChange(e);
        change(e.target.value);
        read(e.target);
      },
      onSelect: (e) => {
        if (rest.onSelect) rest.onSelect(e);
        read(e.currentTarget);
      },
      onKeyDown,
      onBlur: (e) => {
        if (rest.onBlur) rest.onBlur(e);
        setQuery(null);
      }
    }
  ), /* @__PURE__ */ React.createElement("span", { ref: anchor, className: "dk-mention-input__anchor", "aria-hidden": true }), /* @__PURE__ */ React.createElement("div", { ref: pop, className: "dk-mention-input__popup", ...{ popover: "manual" }, hidden: !open || void 0, onMouseDown: keep }, /* @__PURE__ */ React.createElement(
    "div",
    {
      id: listId,
      role: "listbox",
      className: "dk-mention-input__listbox",
      "aria-labelledby": rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel),
      "aria-label": rest["aria-labelledby"] ? void 0 : rest["aria-label"]
    },
    open ? shown.map((o, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: o.id,
        id: base + "-opt-" + i,
        role: "option",
        "aria-selected": i === current,
        "aria-disabled": o.disabled || void 0,
        className: cn("dk-mention-input__option", i === current && "dk-mention-input__option--active"),
        onMouseMove: () => {
          if (!o.disabled && i !== current) setActive(i);
        },
        onClick: () => pick(o)
      },
      /* @__PURE__ */ React.createElement(Avatar, { size: "xs", name: o.label, src: o.avatar, alt: "" }),
      /* @__PURE__ */ React.createElement("span", { className: "dk-mention-input__text" }, /* @__PURE__ */ React.createElement("span", null, o.label), o.description != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-mention-input__description" }, o.description) : null)
    )) : null
  ), open && !shown.length ? /* @__PURE__ */ React.createElement("div", { className: "dk-mention-input__message" }, L.noResults) : null));
});
export {
  MentionInput,
  mentionQuery,
  mentionsIn
};
//# sourceMappingURL=MentionInput.js.map
