"use client";

// src/components/MentionInput/MentionInput.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
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
  if (start < 0 || caret < start + trigger.length || caret - start - trigger.length > MAX_QUERY) return null;
  const before = start ? text.charAt(start - 1) : " ";
  if (!/[\s([{"'“‘]/.test(before)) return null;
  const q = text.slice(start + trigger.length, caret);
  if (/[\n\r]/.test(q) || /^\s|\s$/.test(q)) return null;
  return {
    start,
    text: q
  };
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
var COPIED = ["boxSizing", "width", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "lineHeight", "textTransform", "wordSpacing", "textIndent", "tabSize", "direction"];
function caretAt(el, index) {
  const cs = getComputedStyle(el), copy = document.createElement("div"), mark = document.createElement("span");
  for (const k of COPIED) copy.style[k] = cs[k];
  Object.assign(copy.style, {
    position: "absolute",
    visibility: "hidden",
    top: "0",
    left: "-9999px",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    overflow: "hidden"
  });
  copy.textContent = el.value.slice(0, index);
  mark.textContent = "\u200B";
  copy.appendChild(mark);
  document.body.appendChild(copy);
  const line = parseFloat(cs.lineHeight) || mark.offsetHeight;
  const out = {
    left: mark.offsetLeft - el.scrollLeft,
    top: mark.offsetTop - el.scrollTop,
    height: line
  };
  copy.remove();
  return out;
}
function matching(options, qText, filter, max) {
  if (qText == null) return [];
  if (!filter || !qText) return options.slice(0, max);
  const starts = [], inside = [];
  for (const o of options) {
    const at = highlightRanges(o.label, qText)[0];
    if (at) (at[0] === 0 ? starts : inside).push(o);
  }
  return starts.concat(inside).slice(0, max);
}
function useMatching(options, qText, filter, max) {
  const $ = _c(5);
  let t0;
  if ($[0] !== filter || $[1] !== max || $[2] !== options || $[3] !== qText) {
    t0 = matching(options, qText, filter, max);
    $[0] = filter;
    $[1] = max;
    $[2] = options;
    $[3] = qText;
    $[4] = t0;
  } else {
    t0 = $[4];
  }
  return t0;
}
function MentionInputRender(t0) {
  const $ = _c(75);
  const {
    ref,
    ...props
  } = t0;
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    onSearch,
    onMention,
    triggerChar: triggerIn,
    filter: filterIn,
    maxOptions: maxIn,
    className,
    style,
    onKeyDown: onKeyDownProp,
    onChange: onChangeProp,
    onSelect: onSelectProp,
    onBlur: onBlurProp,
    ...rest
  } = props;
  const trigger = triggerIn ?? "@";
  const filter = filterIn ?? true;
  const maxOptions = maxIn ?? 8;
  const L = useSettings(words).labels;
  const locale = useLocale();
  const field = React.useRef(null);
  const [text, setOwn, controlled] = useControllable(value, defaultValue || "", "MentionInput", "value");
  const [query, setQuery] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(-1);
  const [active, setActive] = React.useState(0);
  const caret = React.useRef(null);
  useFormReset(field, () => {
    if (!controlled) {
      setOwn(defaultValue || "");
    }
    setQuery(null);
  }, rest.form);
  const base = domId("srp-mention", React.useId());
  const listId = base + "-list";
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const q = query && query.start !== dismissed ? query : null;
  const max = Math.max(1, Math.floor(maxOptions) || 8);
  const qText = q ? q.text : null;
  const shown = useMatching(options, qText, filter, max);
  const open = !!q && !rest.disabled && !rest.readOnly;
  const pickable = shown.map(_temp).filter(_temp2);
  const current = pickable.indexOf(active) >= 0 ? active : pickable[0] ?? -1;
  const onQuery = React.useRef(onSearch);
  useIsoLayoutEffect(() => {
    onQuery.current = onSearch;
  });
  const lastQuery = React.useRef(null);
  let t1;
  if ($[0] !== qText) {
    t1 = [qText];
    $[0] = qText;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  React.useEffect(() => {
    if (qText === lastQuery.current) {
      return;
    }
    lastQuery.current = qText;
    if (onQuery.current) {
      onQuery.current(qText);
    }
  }, t1);
  let t2;
  if ($[2] !== L || $[3] !== locale || $[4] !== open || $[5] !== shown.length) {
    t2 = !open ? "" : shown.length ? L.resultsCount(shown.length, displayNumber(shown.length, locale)) : L.noResults;
    $[2] = L;
    $[3] = locale;
    $[4] = open;
    $[5] = shown.length;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const said = t2;
  let t3;
  let t4;
  if ($[7] !== said) {
    t3 = () => {
      if (!said) {
        return;
      }
      const t = setTimeout(() => announce(said), announcePause);
      return () => clearTimeout(t);
    };
    t4 = [said];
    $[7] = said;
    $[8] = t3;
    $[9] = t4;
  } else {
    t3 = $[8];
    t4 = $[9];
  }
  React.useEffect(t3, t4);
  const read = (el) => {
    const at = el.selectionStart === el.selectionEnd ? el.selectionStart : -1;
    const next = at < 0 ? null : mentionQuery(el.value, at, trigger);
    setQuery((was) => was && next && was.start === next.start && was.text === next.text ? was : next);
    if (!next || query && next.start !== query.start) {
      setActive(0);
    }
    if (!next) {
      setDismissed(-1);
    }
  };
  const change = (next_0) => {
    if (!controlled) {
      setOwn(next_0);
    }
    if (onValueChange) {
      onValueChange(next_0);
    }
  };
  const pick = (o_0) => {
    const el_0 = field.current;
    if (!q || !el_0 || o_0.disabled) {
      return;
    }
    const end = q.start + trigger.length + q.text.length;
    const after = text.slice(end).replace(/^[^\s]*/, "");
    const put = trigger + o_0.label + (after.startsWith(" ") ? "" : " ");
    const next_1 = text.slice(0, q.start) + put + after;
    caret.current = q.start + put.length + (after.startsWith(" ") ? 1 : 0);
    setQuery(null);
    change(next_1);
    if (onMention) {
      onMention(o_0);
    }
  };
  let t5;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => {
      const el_1 = field.current;
      if (caret.current == null || !el_1) {
        return;
      }
      el_1.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    };
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  useIsoLayoutEffect(t5);
  const wrap = React.useRef(null);
  const anchor = React.useRef(null);
  const pop = React.useRef(null);
  let t6;
  if ($[11] !== open || $[12] !== q) {
    t6 = () => {
      const el_2 = field.current;
      const a = anchor.current;
      if (!open || !el_2 || !a || !q) {
        return;
      }
      const c = caretAt(el_2, q.start);
      a.style.insetInlineStart = "";
      a.style.left = el_2.offsetLeft + el_2.clientLeft + Math.max(0, Math.min(c.left, el_2.clientWidth)) + "px";
      a.style.top = el_2.offsetTop + el_2.clientTop + Math.max(0, Math.min(c.top, el_2.clientHeight - c.height)) + "px";
      a.style.height = c.height + "px";
    };
    $[11] = open;
    $[12] = q;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const t7 = q && q.start;
  let t8;
  if ($[14] !== open || $[15] !== t7 || $[16] !== text) {
    t8 = [open, t7, text];
    $[14] = open;
    $[15] = t7;
    $[16] = text;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  useIsoLayoutEffect(t6, t8);
  let t10;
  let t9;
  if ($[18] !== setQuery) {
    t9 = () => setQuery(null);
    t10 = () => setQuery(null);
    $[18] = setQuery;
    $[19] = t10;
    $[20] = t9;
  } else {
    t10 = $[19];
    t9 = $[20];
  }
  let t11;
  if ($[21] !== shown.length || $[22] !== t10 || $[23] !== t9) {
    t11 = {
      placement: "bottom-start",
      offsetVar: "--srp-mention-input-offset",
      watch: shown.length,
      onOutside: t9,
      onFocusOutside: t10
    };
    $[21] = shown.length;
    $[22] = t10;
    $[23] = t9;
    $[24] = t11;
  } else {
    t11 = $[24];
  }
  useAnchoredLayer(open, pop, anchor, t11);
  const onKeyDown = (e) => {
    if (onKeyDownProp) {
      onKeyDownProp(e);
    }
    if (e.defaultPrevented || !open || isComposing(e)) {
      return;
    }
    const at_0 = pickable.indexOf(current);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!pickable.length) {
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive(pickable[(at_0 + step + pickable.length) % pickable.length] ?? -1);
    } else {
      if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey && shown[current]) {
        e.preventDefault();
        pick(shown[current]);
      } else {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(q ? q.start : -1);
        }
      }
    }
  };
  let t12;
  if ($[25] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (n) => {
      field.current = n;
    };
    $[25] = t12;
  } else {
    t12 = $[25];
  }
  const setRefs = useMergedRef(ref, t12);
  const keep = _temp3;
  const t13 = cn("srp-mention-input", className);
  const t14 = open ? "open" : "closed";
  const t15 = open ? listId : void 0;
  const t16 = open && current >= 0 ? base + "-opt-" + current : void 0;
  let t17;
  if ($[26] !== change || $[27] !== onChangeProp || $[28] !== read) {
    t17 = (e_1) => {
      if (onChangeProp) {
        onChangeProp(e_1);
      }
      change(e_1.target.value);
      read(e_1.target);
    };
    $[26] = change;
    $[27] = onChangeProp;
    $[28] = read;
    $[29] = t17;
  } else {
    t17 = $[29];
  }
  let t18;
  if ($[30] !== onSelectProp || $[31] !== read) {
    t18 = (e_2) => {
      if (onSelectProp) {
        onSelectProp(e_2);
      }
      read(e_2.currentTarget);
    };
    $[30] = onSelectProp;
    $[31] = read;
    $[32] = t18;
  } else {
    t18 = $[32];
  }
  let t19;
  if ($[33] !== onBlurProp || $[34] !== setQuery) {
    t19 = (e_3) => {
      if (onBlurProp) {
        onBlurProp(e_3);
      }
      setQuery(null);
    };
    $[33] = onBlurProp;
    $[34] = setQuery;
    $[35] = t19;
  } else {
    t19 = $[35];
  }
  let t20;
  if ($[36] !== onKeyDown || $[37] !== rest || $[38] !== setRefs || $[39] !== t15 || $[40] !== t16 || $[41] !== t17 || $[42] !== t18 || $[43] !== t19 || $[44] !== text) {
    t20 = /* @__PURE__ */ React.createElement(Textarea, { ...rest, ref: setRefs, value: text, "aria-autocomplete": "list", "aria-controls": t15, "aria-activedescendant": t16, onChange: t17, onSelect: t18, onKeyDown, onBlur: t19 });
    $[36] = onKeyDown;
    $[37] = rest;
    $[38] = setRefs;
    $[39] = t15;
    $[40] = t16;
    $[41] = t17;
    $[42] = t18;
    $[43] = t19;
    $[44] = text;
    $[45] = t20;
  } else {
    t20 = $[45];
  }
  let t21;
  if ($[46] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t21 = /* @__PURE__ */ React.createElement("span", { ref: anchor, className: "srp-mention-input__anchor", "aria-hidden": true });
    $[46] = t21;
  } else {
    t21 = $[46];
  }
  let t22;
  if ($[47] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t22 = {
      popover: "manual"
    };
    $[47] = t22;
  } else {
    t22 = $[47];
  }
  const t23 = !open || void 0;
  const t24 = rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel);
  const t25 = rest["aria-labelledby"] ? void 0 : rest["aria-label"];
  let t26;
  if ($[48] !== base || $[49] !== current || $[50] !== open || $[51] !== pick || $[52] !== setActive || $[53] !== shown) {
    t26 = open ? shown.map((o_1, i_1) => /* @__PURE__ */ React.createElement("div", { key: o_1.id, id: base + "-opt-" + i_1, role: "option", "aria-selected": i_1 === current, "aria-disabled": o_1.disabled || void 0, className: cn("srp-mention-input__option", i_1 === current && "srp-mention-input__option--active"), "data-active": i_1 === current ? "" : void 0, onMouseMove: () => {
      if (!o_1.disabled && i_1 !== current) {
        setActive(i_1);
      }
    }, onClick: () => pick(o_1) }, /* @__PURE__ */ React.createElement(Avatar, { size: "xs", name: o_1.label, src: o_1.avatar, alt: "" }), /* @__PURE__ */ React.createElement("span", { className: "srp-mention-input__text" }, /* @__PURE__ */ React.createElement("span", null, o_1.label), o_1.description != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-mention-input__description" }, o_1.description) : null))) : null;
    $[48] = base;
    $[49] = current;
    $[50] = open;
    $[51] = pick;
    $[52] = setActive;
    $[53] = shown;
    $[54] = t26;
  } else {
    t26 = $[54];
  }
  let t27;
  if ($[55] !== listId || $[56] !== t24 || $[57] !== t25 || $[58] !== t26) {
    t27 = /* @__PURE__ */ React.createElement("div", { id: listId, role: "listbox", className: "srp-mention-input__listbox", "aria-labelledby": t24, "aria-label": t25 }, t26);
    $[55] = listId;
    $[56] = t24;
    $[57] = t25;
    $[58] = t26;
    $[59] = t27;
  } else {
    t27 = $[59];
  }
  let t28;
  if ($[60] !== L || $[61] !== open || $[62] !== shown.length) {
    t28 = open && !shown.length ? /* @__PURE__ */ React.createElement("div", { className: "srp-mention-input__message" }, L.noResults) : null;
    $[60] = L;
    $[61] = open;
    $[62] = shown.length;
    $[63] = t28;
  } else {
    t28 = $[63];
  }
  let t29;
  if ($[64] !== keep || $[65] !== t23 || $[66] !== t27 || $[67] !== t28) {
    t29 = /* @__PURE__ */ React.createElement("div", { ref: pop, className: "srp-mention-input__popup", ...t22, hidden: t23, onMouseDown: keep }, t27, t28);
    $[64] = keep;
    $[65] = t23;
    $[66] = t27;
    $[67] = t28;
    $[68] = t29;
  } else {
    t29 = $[68];
  }
  let t30;
  if ($[69] !== style || $[70] !== t13 || $[71] !== t14 || $[72] !== t20 || $[73] !== t29) {
    t30 = /* @__PURE__ */ React.createElement("span", { ref: wrap, className: t13, style, "data-component": "mention-input", "data-state": t14 }, t20, t21, t29);
    $[69] = style;
    $[70] = t13;
    $[71] = t14;
    $[72] = t20;
    $[73] = t29;
    $[74] = t30;
  } else {
    t30 = $[74];
  }
  return t30;
}
function _temp3(e_0) {
  return e_0.preventDefault();
}
function _temp2(i_0) {
  return i_0 >= 0;
}
function _temp(o, i) {
  return o.disabled ? -1 : i;
}
var MentionInput = /* @__PURE__ */ named("MentionInput", MentionInputRender);
export {
  MentionInput,
  mentionQuery,
  mentionsIn
};
//# sourceMappingURL=MentionInput.js.map
