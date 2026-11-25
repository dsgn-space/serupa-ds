"use client";

// src/components/Slider/Slider.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { useControlSize } from "../../internal/controlSize.js";
import { cn, isInvalid, omit, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { named } from "../../internal/component.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { snap as snapToGrid } from "../../internal/step.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { NumberInput } from "../NumberInput/NumberInput.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
import { isComposing } from "../../internal/ime.js";
var OWN = {
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  onValueCommit: 1,
  min: 1,
  max: 1,
  step: 1,
  largeStep: 1,
  size: 1,
  disabled: 1,
  formatValue: 1,
  thumbLabels: 1,
  name: 1,
  form: 1,
  invalid: 1,
  readOnly: 1,
  required: 1,
  marks: 1,
  showValue: 1,
  inputs: 1,
  origin: 1,
  orientation: 1,
  "aria-required": 1,
  "aria-invalid": 1,
  "aria-readonly": 1,
  autoFocus: 1,
  className: 1,
  "aria-label": 1,
  "aria-labelledby": 1,
  "aria-describedby": 1,
  "aria-errormessage": 1
};
function markList(marks, min, max, step, large) {
  if (Array.isArray(marks)) return marks.filter((m) => m && isFinite(m.value) && m.value >= min && m.value <= max);
  if (marks !== true) return [];
  const every = (max - min) / step > 100 ? step * large : step, out = [];
  for (let i = 0, v = min; v <= max + every / 1e9 && i <= 1e3; i++, v = min + i * every) out.push({
    value: snapToGrid(v, min, max, step)
  });
  return out;
}
var FIT = ".srp-slider__mark-label > span, .srp-slider__value > span";
function share(el) {
  const labels = Array.from(el.querySelectorAll(".srp-slider__mark-label > span"));
  for (const p of labels) {
    p.removeAttribute("data-wrap");
    p.style.removeProperty("--srp-slider-share");
  }
  el.style.removeProperty("--srp-slider-labels-h");
  if (labels.length < 2) return;
  const box = el.getBoundingClientRect(), gap = parseFloat(getComputedStyle(labels[0].parentElement).columnGap) || 0;
  const at = labels.map((p) => {
    const w = p.getBoundingClientRect().width;
    p.setAttribute("data-wrap", "");
    p.style.setProperty("--srp-slider-share", "0px");
    const least = p.getBoundingClientRect().width;
    p.removeAttribute("data-wrap");
    p.style.removeProperty("--srp-slider-share");
    return {
      p,
      c: p.parentElement.getBoundingClientRect().left,
      w,
      least,
      cap: w
    };
  }).sort((a, b) => a.c - b.c);
  const n = at.length;
  at.forEach((x, i) => {
    const left = i === 0 ? x.c - box.left : (x.c - at[i - 1].c) / 2, right = i === n - 1 ? box.right - x.c : (at[i + 1].c - x.c) / 2;
    const room = i === 0 ? Math.min(left, right - gap / 2) + right - gap / 2 : i === n - 1 ? Math.min(right, left - gap / 2) + left - gap / 2 : 2 * Math.min(left, right) - gap;
    x.cap = Math.max(x.least, Math.min(x.w, room));
  });
  const span = (x, w) => {
    const l = Math.min(Math.max(x.c - w / 2, box.left), box.right - w);
    return [l, l + w];
  };
  for (let i = 0, guard = 0; i < n - 1 && guard < 2e3; guard++) {
    const a = at[i], b = at[i + 1];
    if (span(a, a.cap)[1] + gap <= span(b, b.cap)[0] + 0.5) {
      i++;
      continue;
    }
    const give = (x2) => x2.cap - x2.least;
    const x = give(a) >= give(b) ? a : b;
    if (give(x) <= 0) {
      i++;
      continue;
    }
    x.cap = Math.max(x.least, x.cap - 1);
  }
  let wrapped = false;
  for (const x of at) if (x.cap < x.w - 0.5) {
    x.p.setAttribute("data-wrap", "");
    x.p.style.setProperty("--srp-slider-share", Math.ceil(x.cap) + "px");
    wrapped = true;
  }
  if (wrapped) el.style.setProperty("--srp-slider-labels-h", Math.max(...labels.map((p) => p.getBoundingClientRect().height)) + "px");
}
function SliderRender(t0) {
  const $ = _c(50);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const nameRef = useNameCheck("Slider", NAME_HOW.field);
  props = useFieldControl(props);
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const sds = useSettings(words);
  const locale = useLocale();
  const min = isFinite(Number(props.min)) && props.min != null ? Number(props.min) : 0;
  const maxIn = isFinite(Number(props.max)) && props.max != null ? Number(props.max) : 100;
  const max = maxIn > min ? maxIn : min + 1;
  const step = Number(props.step) > 0 && Number.isFinite(Number(props.step)) ? Number(props.step) : 1;
  const large = Number(props.largeStep) > 0 ? Number(props.largeStep) : 10;
  let t2;
  if ($[0] !== max || $[1] !== min || $[2] !== step) {
    t2 = (v) => snapToGrid(v, min, max, step);
    $[0] = max;
    $[1] = min;
    $[2] = step;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const snap = t2;
  const [raw, setOwn, controlled] = useControllable(props.value, props.defaultValue ?? min, "Slider", "value");
  const isRange = Array.isArray(raw);
  let t3;
  if ($[4] !== isRange || $[5] !== raw || $[6] !== snap) {
    t3 = isRange ? [snap(raw[0]), snap(raw[1])].sort(_temp) : [snap(raw)];
    $[4] = isRange;
    $[5] = raw;
    $[6] = snap;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const vals = t3;
  const latestRef = useLatest(vals);
  const root = React.useRef(null);
  useFormReset(root, () => {
    if (!controlled) {
      setOwn(props.defaultValue ?? min);
    }
  }, props.form);
  let t4;
  if ($[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = [];
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const thumbs = React.useRef(t4);
  const drag = React.useRef(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const sized = useControlSize(props.size);
  const size = sized === "sm" || sized === "lg" ? sized : "md";
  const disabled = !!props.disabled || inDisabledFieldset;
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const readOnly = !!props.readOnly || props["aria-readonly"] === true || props["aria-readonly"] === "true";
  const still = disabled || readOnly;
  let t5;
  if ($[9] !== max || $[10] !== min) {
    t5 = (v_0) => (v_0 - min) / (max - min) * 100;
    $[9] = max;
    $[10] = min;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const pct = t5;
  const vertical = props.orientation === "vertical";
  let t6;
  if ($[12] !== vertical) {
    t6 = (p) => vertical ? 100 - p : p;
    $[12] = vertical;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const place = t6;
  let t7;
  if ($[14] !== min) {
    t7 = (vs, i) => vs[i] ?? min;
    $[14] = min;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const at = t7;
  let t8;
  if ($[16] !== at || $[17] !== isRange) {
    t8 = (vs_0) => isRange ? [at(vs_0, 0), at(vs_0, 1)] : at(vs_0, 0);
    $[16] = at;
    $[17] = isRange;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  const out = t8;
  const text = (v_1) => props.formatValue ? props.formatValue(v_1) : displayNumber(v_1, locale);
  const liveRef = useLatest(disabled);
  let t9;
  if ($[19] !== liveRef) {
    t9 = () => liveRef.current ? null : thumbs.current[0];
    $[19] = liveRef;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  const first = t9;
  useAutoFocus(props.autoFocus, first);
  const set = (i_0, v_2) => {
    const vs_1 = latestRef.current.slice();
    let n = snap(v_2);
    if (isRange) {
      n = i_0 === 0 ? Math.min(n, at(vs_1, 1)) : Math.max(n, at(vs_1, 0));
    }
    if (n === vs_1[i_0]) {
      return vs_1;
    }
    vs_1[i_0] = n;
    latestRef.current = vs_1;
    if (!controlled) {
      setOwn(out(vs_1));
    }
    if (props.onValueChange) {
      props.onValueChange(out(vs_1));
    }
    return vs_1;
  };
  const commit = () => {
    if (props.onValueCommit) {
      props.onValueCommit(out(latestRef.current));
    }
  };
  const onChange = (i_1) => (e) => {
    if (still) {
      return;
    }
    const before = latestRef.current[i_1];
    if (set(i_1, Number(e.currentTarget.value))[i_1] !== before) {
      commit();
    }
  };
  const from = React.useRef([]);
  const fromPoint = (x, y) => {
    const r = root.current.querySelector(".srp-slider__track").getBoundingClientRect();
    let share$0 = r.width ? (x - r.left) / r.width : 0;
    if (vertical) {
      share$0 = r.height ? (r.bottom - y) / r.height : 0;
    } else {
      if (isRtl(root.current)) {
        share$0 = 1 - share$0;
      }
    }
    return min + Math.min(1, Math.max(0, share$0)) * (max - min);
  };
  const onPointerDown = (e_0) => {
    if (rest.onPointerDown) {
      rest.onPointerDown(e_0);
    }
    if (disabled || e_0.button !== 0 || e_0.defaultPrevented || inField(e_0.target)) {
      return;
    }
    e_0.preventDefault();
    const v_3 = fromPoint(e_0.clientX, e_0.clientY);
    const vs_2 = latestRef.current;
    let i_2 = 0;
    if (isRange) {
      const d0 = Math.abs(v_3 - at(vs_2, 0));
      const d1 = Math.abs(v_3 - at(vs_2, 1));
      i_2 = d1 < d0 || d1 === d0 && v_3 > at(vs_2, 1) ? 1 : 0;
    }
    if (readOnly) {
      thumbs.current[i_2]?.focus({
        preventScroll: true
      });
      return;
    }
    drag.current = i_2;
    from.current = vs_2.slice();
    e_0.currentTarget.setPointerCapture(e_0.pointerId);
    set(i_2, v_3);
    const t = thumbs.current[i_2];
    if (t) {
      t.focus({
        preventScroll: true
      });
    }
  };
  const inField = _temp2;
  const onPointerMove = (e_1) => {
    if (rest.onPointerMove) {
      rest.onPointerMove(e_1);
    }
    if (drag.current != null) {
      set(drag.current, fromPoint(e_1.clientX, e_1.clientY));
    }
  };
  const end = (e_2) => {
    if (drag.current == null) {
      return;
    }
    drag.current = null;
    if (e_2.currentTarget.hasPointerCapture(e_2.pointerId)) {
      e_2.currentTarget.releasePointerCapture(e_2.pointerId);
    }
    if (latestRef.current.some((v_4, k) => v_4 !== from.current[k])) {
      commit();
    }
  };
  const cancel = (e_3) => {
    if (rest.onPointerCancel) {
      rest.onPointerCancel(e_3);
    }
    const i_3 = drag.current;
    if (i_3 == null) {
      return;
    }
    drag.current = null;
    set(i_3, at(from.current, i_3));
  };
  const onKeyDownCapture = (e_4) => {
    if (rest.onKeyDownCapture) {
      rest.onKeyDownCapture(e_4);
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e_4);
    }
  };
  const onKeyDown = (i_4) => (e_5) => {
    if (disabled || e_5.defaultPrevented || e_5.altKey || e_5.ctrlKey || e_5.metaKey) {
      return;
    }
    const rtl = !vertical && isRtl(e_5.currentTarget);
    const by = (e_5.shiftKey ? large : 1) * step;
    const v_5 = at(latestRef.current, i_4);
    let n_0;
    bb255: switch (e_5.key) {
      case "ArrowUp": {
        n_0 = v_5 + by;
        break bb255;
      }
      case "ArrowDown": {
        n_0 = v_5 - by;
        break bb255;
      }
      case "ArrowRight": {
        n_0 = rtl ? v_5 - by : v_5 + by;
        break bb255;
      }
      case "ArrowLeft": {
        n_0 = rtl ? v_5 + by : v_5 - by;
        break bb255;
      }
      case "PageUp": {
        n_0 = v_5 + large * step;
        break bb255;
      }
      case "PageDown": {
        n_0 = v_5 - large * step;
        break bb255;
      }
      case "Home": {
        n_0 = isRange && i_4 === 1 ? at(latestRef.current, 0) : min;
        break bb255;
      }
      case "End": {
        n_0 = isRange && i_4 === 0 ? at(latestRef.current, 1) : max;
        break bb255;
      }
      default: {
        return;
      }
    }
    e_5.preventDefault();
    if (readOnly) {
      return;
    }
    const before_0 = latestRef.current[i_4];
    if (set(i_4, n_0)[i_4] !== before_0) {
      commit();
    }
  };
  const crossing = _temp3;
  const onFocus = (e_7) => {
    if (rest.onFocus && crossing(e_7)) {
      rest.onFocus(e_7);
    }
  };
  const onBlur = (e_8) => {
    if (rest.onBlur && crossing(e_8)) {
      rest.onBlur(e_8);
    }
  };
  const names = props.thumbLabels || [sds.labels.sliderMinimum, sds.labels.sliderMaximum];
  const fieldLabel = useFieldLabel(props.id);
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? void 0 : fieldLabel);
  const originAt = !isRange && props.origin != null && isFinite(props.origin) ? pct(Math.min(max, Math.max(min, props.origin))) : null;
  let t10;
  if ($[21] !== at || $[22] !== pct || $[23] !== vals) {
    t10 = pct(at(vals, vals.length - 1));
    $[21] = at;
    $[22] = pct;
    $[23] = vals;
    $[24] = t10;
  } else {
    t10 = $[24];
  }
  const thumbAt = t10;
  let t11;
  if ($[25] !== at || $[26] !== isRange || $[27] !== originAt || $[28] !== pct || $[29] !== thumbAt || $[30] !== vals) {
    t11 = isRange ? pct(at(vals, 0)) : originAt != null ? Math.min(originAt, thumbAt) : 0;
    $[25] = at;
    $[26] = isRange;
    $[27] = originAt;
    $[28] = pct;
    $[29] = thumbAt;
    $[30] = vals;
    $[31] = t11;
  } else {
    t11 = $[31];
  }
  const lo = t11;
  const hi = originAt != null ? Math.max(originAt, thumbAt) : thumbAt;
  const marks = markList(props.marks, min, max, step, large);
  const labelled = marks.some(_temp4);
  let t12;
  if ($[32] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (t132) => {
      const wrap = t132 === void 0 ? true : t132;
      const el = root.current;
      if (!el || el.classList.contains("srp-slider--vertical")) {
        return;
      }
      const parts = Array.from(el.querySelectorAll(FIT));
      if (!parts.length) {
        return;
      }
      for (const p_0 of parts) {
        p_0.style.removeProperty("--srp-slider-nudge");
      }
      if (wrap) {
        share(el);
      }
      const box = el.getBoundingClientRect();
      const by_0 = parts.map((p_1) => {
        const r_0 = p_1.getBoundingClientRect();
        return r_0.width >= box.width ? 0 : Math.max(0, box.left - r_0.left) - Math.max(0, r_0.right - box.right);
      });
      parts.forEach((p_2, i_5) => {
        if (by_0[i_5]) {
          p_2.style.setProperty("--srp-slider-nudge", by_0[i_5] + "px");
        }
      });
    };
    $[32] = t12;
  } else {
    t12 = $[32];
  }
  const fit = t12;
  const ro = React.useRef(void 0);
  let t13;
  if ($[33] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = () => {
      const el_0 = root.current;
      if (el_0 && ro.current) {
        for (const p_3 of [el_0, ...el_0.querySelectorAll(FIT)]) {
          if (!ro.current[1].has(p_3)) {
            ro.current[1].add(p_3);
            ro.current[0].observe(p_3);
          }
        }
      }
    };
    $[33] = t13;
  } else {
    t13 = $[33];
  }
  const watch = t13;
  let t14;
  if ($[34] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = () => {
      fit();
      watch();
    };
    $[34] = t14;
  } else {
    t14 = $[34];
  }
  useIsoLayoutEffect(t14);
  let t15;
  let t16;
  if ($[35] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t15 = () => {
      if (typeof ResizeObserver === "undefined") {
        return;
      }
      let later = 0;
      const o = new ResizeObserver(() => {
        fit(false);
        cancelAnimationFrame(later);
        later = requestAnimationFrame(() => fit());
      });
      ro.current = [o, /* @__PURE__ */ new WeakSet()];
      watch();
      return () => {
        o.disconnect();
        cancelAnimationFrame(later);
      };
    };
    t16 = [fit];
    $[35] = t15;
    $[36] = t16;
  } else {
    t15 = $[35];
    t16 = $[36];
  }
  React.useEffect(t15, t16);
  const typedFrom = React.useRef(null);
  const fieldDone = () => {
    const f = typedFrom.current;
    if (f && latestRef.current.some((v_6, k_0) => v_6 !== f[k_0])) {
      commit();
      typedFrom.current = latestRef.current.slice();
    }
  };
  const field = (i_6) => /* @__PURE__ */ React.createElement(FieldContext.Provider, { key: "field" + i_6, value: null }, /* @__PURE__ */ React.createElement(NumberInput, { className: "srp-slider__input", size, steppers: false, value: vals[i_6], min: isRange && i_6 === 1 ? vals[0] : min, max: isRange && i_6 === 0 ? vals[1] : max, step, largeStep: large, disabled, readOnly, invalid: invalid || void 0, "aria-label": isRange ? names[i_6] : props["aria-label"], "aria-labelledby": isRange ? void 0 : labelledBy, "aria-describedby": isRange ? void 0 : props["aria-describedby"], "aria-errormessage": invalid ? props["aria-errormessage"] : void 0, onFocus: () => {
    typedFrom.current = latestRef.current.slice();
  }, onValueChange: (v_7) => {
    if (v_7 != null) {
      set(i_6, v_7);
    }
  }, onKeyUp: (e_9) => {
    if (e_9.key === "Enter" && !isComposing(e_9)) {
      fieldDone();
    }
  }, onBlur: () => {
    fieldDone();
    typedFrom.current = null;
  } }));
  let t17;
  if ($[37] !== first || $[38] !== restyle) {
    t17 = (n_1) => {
      root.current = n_1;
      delegateFocus(n_1, first);
      restyle(n_1);
    };
    $[37] = first;
    $[38] = restyle;
    $[39] = t17;
  } else {
    t17 = $[39];
  }
  const t18 = (vertical ? 100 - hi : lo) + "%";
  const t19 = hi - lo + "%";
  let t20;
  if ($[40] !== t18 || $[41] !== t19) {
    t20 = /* @__PURE__ */ React.createElement("div", { className: "srp-slider__fill", style: {
      insetInlineStart: t18,
      inlineSize: t19
    } });
    $[40] = t18;
    $[41] = t19;
    $[42] = t20;
  } else {
    t20 = $[42];
  }
  let t21;
  if ($[43] !== hi || $[44] !== lo || $[45] !== max || $[46] !== min || $[47] !== pct || $[48] !== place) {
    t21 = (m_0, i_7) => /* @__PURE__ */ React.createElement("span", { key: i_7, className: "srp-slider__mark", style: {
      insetInlineStart: place(pct(m_0.value)) + "%"
    }, "aria-hidden": "true" }, m_0.value > min && m_0.value < max ? /* @__PURE__ */ React.createElement("span", { className: cn("srp-slider__tick", (pct(m_0.value) < lo || pct(m_0.value) > hi) && "srp-slider__tick--off") }) : null, m_0.label != null && m_0.label !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-slider__mark-label" }, /* @__PURE__ */ React.createElement("span", null, m_0.label)) : null);
    $[43] = hi;
    $[44] = lo;
    $[45] = max;
    $[46] = min;
    $[47] = pct;
    $[48] = place;
    $[49] = t21;
  } else {
    t21 = $[49];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: t17, role: isRange ? "group" : rest.role, "aria-label": isRange ? props["aria-label"] : void 0, "aria-labelledby": isRange ? labelledBy : void 0, "aria-describedby": isRange ? props["aria-describedby"] : void 0, className: cn("srp-slider", "srp-slider--size-" + size, disabled && "srp-slider--disabled", readOnly && "srp-slider--readonly", invalid && "srp-slider--invalid", labelled && "srp-slider--mark-labels", props.inputs && "srp-slider--inputs", vertical && "srp-slider--vertical", props.className), "data-component": "slider", "data-size": size, "data-orientation": vertical ? "vertical" : void 0, "data-disabled": disabled ? "" : void 0, "data-readonly": readOnly ? "" : void 0, "data-invalid": invalid ? "" : void 0, onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: cancel, onKeyDown: void 0, onKeyDownCapture, onFocus, onBlur }, props.inputs && isRange ? field(0) : null, /* @__PURE__ */ React.createElement("div", { className: "srp-slider__track" }, t20, marks.map(t21), vals.map((v_8, i_8) => /* @__PURE__ */ React.createElement("span", { key: i_8, className: "srp-slider__thumb", style: {
    insetInlineStart: place(pct(v_8)) + "%"
  } }, /* @__PURE__ */ React.createElement("input", { ref: (n_2) => {
    thumbs.current[i_8] = n_2;
    if (!isRange) {
      nameRef(n_2);
    }
  }, className: "srp-slider__range", type: "range", value: v_8, min: isRange && i_8 === 1 ? vals[0] : min, max: isRange && i_8 === 0 ? vals[1] : max, step, name: props.name, form: props.form, disabled, "aria-valuetext": props.formatValue ? text(v_8) : void 0, "aria-orientation": vertical ? "vertical" : "horizontal", "aria-readonly": readOnly || void 0, "aria-invalid": invalid || void 0, "aria-errormessage": invalid ? props["aria-errormessage"] : void 0, "aria-label": isRange ? names[i_8] : props["aria-label"], "aria-labelledby": isRange ? void 0 : labelledBy, "aria-describedby": isRange ? void 0 : props["aria-describedby"], onKeyDown: onKeyDown(i_8), onChange: onChange(i_8) }), props.showValue ? /* @__PURE__ */ React.createElement("span", { className: "srp-slider__value", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", null, text(v_8))) : null))), props.inputs ? field(vals.length - 1) : null);
}
function _temp4(m) {
  return m.label != null && m.label !== false && m.label !== "";
}
function _temp3(e_6) {
  return !(e_6.relatedTarget instanceof Node && e_6.currentTarget.contains(e_6.relatedTarget));
}
function _temp2(t_0) {
  return t_0 instanceof Element && !!t_0.closest(".srp-slider__input");
}
function _temp(a, b) {
  return a - b;
}
var Slider = /* @__PURE__ */ named("Slider", SliderRender);
export {
  Slider
};
//# sourceMappingURL=Slider.js.map
