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
  const found = [];
  for (const m of mentionSpans(text, byLength(options), trigger)) if (!found.includes(m.option)) found.push(m.option);
  return found;
}
function byLength(options) {
  return options.map((option) => ({
    label: option.label,
    option
  })).sort((a, b) => b.label.length - a.label.length);
}
function mentionSpans(text, longest, trigger) {
  const spans = [];
  for (let at = text.indexOf(trigger); at >= 0; at = text.indexOf(trigger, at + trigger.length)) {
    const o = longest.find((x) => x.label && text.startsWith(x.label, at + trigger.length) && !/[\p{L}\p{N}]/u.test(text.charAt(at + trigger.length + x.label.length)));
    if (o) spans.push({
      start: at,
      end: at + trigger.length + o.label.length,
      option: o.option
    });
  }
  return spans;
}
function useSpans(text, options, trigger) {
  const $ = _c(6);
  let t0;
  if ($[0] !== options) {
    t0 = byLength(options);
    $[0] = options;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const longest = t0;
  let t1;
  if ($[2] !== longest || $[3] !== text || $[4] !== trigger) {
    t1 = mentionSpans(text, longest, trigger);
    $[2] = longest;
    $[3] = text;
    $[4] = trigger;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  return t1;
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
  const $ = _c(84);
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
  const marks = React.useRef(null);
  const spans = useSpans(text, options, trigger);
  const hasMarks = spans.length > 0;
  let t9;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = () => {
      const el_3 = field.current;
      const m = marks.current;
      if (!el_3 || !m) {
        return;
      }
      const place = () => {
        m.hidden = false;
        const cs = getComputedStyle(el_3);
        for (const k of COPIED) {
          if (k !== "width" && !k.startsWith("border")) {
            m.style[k] = cs[k];
          }
        }
        Object.assign(m.style, {
          left: el_3.offsetLeft + el_3.clientLeft + "px",
          top: el_3.offsetTop + el_3.clientTop + "px",
          width: el_3.clientWidth + "px",
          height: el_3.clientHeight + "px"
        });
        m.scrollTop = el_3.scrollTop;
        m.scrollLeft = el_3.scrollLeft;
      };
      place();
      const sync = () => {
        m.scrollTop = el_3.scrollTop;
        m.scrollLeft = el_3.scrollLeft;
      };
      el_3.addEventListener("scroll", sync);
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
      if (ro) {
        ro.observe(el_3);
      }
      return () => {
        el_3.removeEventListener("scroll", sync);
        if (ro) {
          ro.disconnect();
        }
      };
    };
    $[18] = t9;
  } else {
    t9 = $[18];
  }
  let t10;
  if ($[19] !== hasMarks || $[20] !== text) {
    t10 = [hasMarks, text];
    $[19] = hasMarks;
    $[20] = text;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  useIsoLayoutEffect(t9, t10);
  let t11;
  let t12;
  if ($[22] !== setQuery) {
    t11 = () => setQuery(null);
    t12 = () => setQuery(null);
    $[22] = setQuery;
    $[23] = t11;
    $[24] = t12;
  } else {
    t11 = $[23];
    t12 = $[24];
  }
  let t13;
  if ($[25] !== shown.length || $[26] !== t11 || $[27] !== t12) {
    t13 = {
      placement: "bottom-start",
      offsetVar: "--srp-mention-input-offset",
      watch: shown.length,
      onOutside: t11,
      onFocusOutside: t12
    };
    $[25] = shown.length;
    $[26] = t11;
    $[27] = t12;
    $[28] = t13;
  } else {
    t13 = $[28];
  }
  useAnchoredLayer(open, pop, anchor, t13);
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
  let t14;
  if ($[29] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = (n) => {
      field.current = n;
    };
    $[29] = t14;
  } else {
    t14 = $[29];
  }
  const setRefs = useMergedRef(ref, t14);
  const keep = _temp3;
  const t15 = cn("srp-mention-input", className);
  const t16 = open ? "open" : "closed";
  let t17;
  if ($[30] !== hasMarks || $[31] !== spans || $[32] !== text) {
    t17 = hasMarks ? /* @__PURE__ */ React.createElement("div", { ref: marks, className: "srp-mention-input__marks", "aria-hidden": "true", hidden: true }, spans.map((m_0, i_1) => [text.slice(i_1 ? spans[i_1 - 1].end : 0, m_0.start), /* @__PURE__ */ React.createElement("mark", { key: m_0.start, className: "srp-mention-input__mention" }, text.slice(m_0.start, m_0.end))]), text.slice(spans[spans.length - 1].end), "\u200B") : null;
    $[30] = hasMarks;
    $[31] = spans;
    $[32] = text;
    $[33] = t17;
  } else {
    t17 = $[33];
  }
  const t18 = open ? listId : void 0;
  const t19 = open && current >= 0 ? base + "-opt-" + current : void 0;
  let t20;
  if ($[34] !== change || $[35] !== onChangeProp || $[36] !== read) {
    t20 = (e_1) => {
      if (onChangeProp) {
        onChangeProp(e_1);
      }
      change(e_1.target.value);
      read(e_1.target);
    };
    $[34] = change;
    $[35] = onChangeProp;
    $[36] = read;
    $[37] = t20;
  } else {
    t20 = $[37];
  }
  let t21;
  if ($[38] !== onSelectProp || $[39] !== read) {
    t21 = (e_2) => {
      if (onSelectProp) {
        onSelectProp(e_2);
      }
      read(e_2.currentTarget);
    };
    $[38] = onSelectProp;
    $[39] = read;
    $[40] = t21;
  } else {
    t21 = $[40];
  }
  let t22;
  if ($[41] !== onBlurProp || $[42] !== setQuery) {
    t22 = (e_3) => {
      if (onBlurProp) {
        onBlurProp(e_3);
      }
      setQuery(null);
    };
    $[41] = onBlurProp;
    $[42] = setQuery;
    $[43] = t22;
  } else {
    t22 = $[43];
  }
  let t23;
  if ($[44] !== onKeyDown || $[45] !== rest || $[46] !== setRefs || $[47] !== t18 || $[48] !== t19 || $[49] !== t20 || $[50] !== t21 || $[51] !== t22 || $[52] !== text) {
    t23 = /* @__PURE__ */ React.createElement(Textarea, { ...rest, ref: setRefs, value: text, "aria-autocomplete": "list", "aria-controls": t18, "aria-activedescendant": t19, onChange: t20, onSelect: t21, onKeyDown, onBlur: t22 });
    $[44] = onKeyDown;
    $[45] = rest;
    $[46] = setRefs;
    $[47] = t18;
    $[48] = t19;
    $[49] = t20;
    $[50] = t21;
    $[51] = t22;
    $[52] = text;
    $[53] = t23;
  } else {
    t23 = $[53];
  }
  let t24;
  if ($[54] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t24 = /* @__PURE__ */ React.createElement("span", { ref: anchor, className: "srp-mention-input__anchor", "aria-hidden": true });
    $[54] = t24;
  } else {
    t24 = $[54];
  }
  let t25;
  if ($[55] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t25 = {
      popover: "manual"
    };
    $[55] = t25;
  } else {
    t25 = $[55];
  }
  const t26 = !open || void 0;
  const t27 = rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel);
  const t28 = rest["aria-labelledby"] ? void 0 : rest["aria-label"];
  let t29;
  if ($[56] !== base || $[57] !== current || $[58] !== open || $[59] !== pick || $[60] !== setActive || $[61] !== shown) {
    t29 = open ? shown.map((o_1, i_2) => /* @__PURE__ */ React.createElement("div", { key: o_1.id, id: base + "-opt-" + i_2, role: "option", "aria-selected": i_2 === current, "aria-disabled": o_1.disabled || void 0, className: cn("srp-mention-input__option", i_2 === current && "srp-mention-input__option--active"), "data-active": i_2 === current ? "" : void 0, onMouseMove: () => {
      if (!o_1.disabled && i_2 !== current) {
        setActive(i_2);
      }
    }, onClick: () => pick(o_1) }, /* @__PURE__ */ React.createElement(Avatar, { size: "xs", name: o_1.label, src: o_1.avatar, alt: "" }), /* @__PURE__ */ React.createElement("span", { className: "srp-mention-input__text" }, /* @__PURE__ */ React.createElement("span", null, o_1.label), o_1.description != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-mention-input__description" }, o_1.description) : null))) : null;
    $[56] = base;
    $[57] = current;
    $[58] = open;
    $[59] = pick;
    $[60] = setActive;
    $[61] = shown;
    $[62] = t29;
  } else {
    t29 = $[62];
  }
  let t30;
  if ($[63] !== listId || $[64] !== t27 || $[65] !== t28 || $[66] !== t29) {
    t30 = /* @__PURE__ */ React.createElement("div", { id: listId, role: "listbox", className: "srp-mention-input__listbox", "aria-labelledby": t27, "aria-label": t28 }, t29);
    $[63] = listId;
    $[64] = t27;
    $[65] = t28;
    $[66] = t29;
    $[67] = t30;
  } else {
    t30 = $[67];
  }
  let t31;
  if ($[68] !== L || $[69] !== open || $[70] !== shown.length) {
    t31 = open && !shown.length ? /* @__PURE__ */ React.createElement("div", { className: "srp-mention-input__message" }, L.noResults) : null;
    $[68] = L;
    $[69] = open;
    $[70] = shown.length;
    $[71] = t31;
  } else {
    t31 = $[71];
  }
  let t32;
  if ($[72] !== keep || $[73] !== t26 || $[74] !== t30 || $[75] !== t31) {
    t32 = /* @__PURE__ */ React.createElement("div", { ref: pop, className: "srp-mention-input__popup", ...t25, hidden: t26, onMouseDown: keep }, t30, t31);
    $[72] = keep;
    $[73] = t26;
    $[74] = t30;
    $[75] = t31;
    $[76] = t32;
  } else {
    t32 = $[76];
  }
  let t33;
  if ($[77] !== style || $[78] !== t15 || $[79] !== t16 || $[80] !== t17 || $[81] !== t23 || $[82] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("span", { ref: wrap, className: t15, style, "data-component": "mention-input", "data-state": t16 }, t17, t23, t24, t32);
    $[77] = style;
    $[78] = t15;
    $[79] = t16;
    $[80] = t17;
    $[81] = t23;
    $[82] = t32;
    $[83] = t33;
  } else {
    t33 = $[83];
  }
  return t33;
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
