"use client";

// src/components/SignaturePad/SignaturePad.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, isInvalid, omit, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useRequired } from "../../internal/required.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { delegateFocus, useAutoFocus, useFocusHandover } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { Button } from "../Button/Button.js";
import { Input } from "../Input/Input.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { en as words } from "./labels.js";
var OWN = {
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
  defaultMethod: 1,
  name: 1,
  form: 1,
  required: 1,
  disabled: 1,
  readOnly: 1,
  invalid: 1,
  "aria-invalid": 1,
  "aria-required": 1,
  autoFocus: 1,
  className: 1
};
var r1 = (n) => Math.round(n * 10) / 10;
var pathOf = (s) => {
  if (!s.length || !s[0]) return "";
  if (s.length === 1) return `M${s[0][0]} ${s[0][1]}h0`;
  if (s.length === 2 && s[1]) return `M${s[0][0]} ${s[0][1]}L${s[1][0]} ${s[1][1]}`;
  let d = `M${s[0][0]} ${s[0][1]}`;
  for (let i = 1; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1];
    d += `Q${a[0]} ${a[1]} ${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2)}`;
  }
  const end = s[s.length - 1];
  return `${d}L${end[0]} ${end[1]}`;
};
var strokesOf = (svg) => [...svg.matchAll(/<path d="M([^"]+)"/g)].map(([, d = ""]) => d.replace(/h0$/, "").split(/[LQ]/).map((p) => {
  const [x = NaN, y = NaN] = p.trim().split(/[\s,]+/).map(Number);
  return [x, y];
}).filter((p) => isFinite(p[0]) && isFinite(p[1]))).filter((s) => s.length);
var xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var SVG = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
var typedSvg = (name, w, h) => SVG(w, h, `<text x="16" y="${r1(h * 0.68)}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="30" fill="#000">${xml(name)}</text>`);
var drawnSvg = (strokes, w, h) => SVG(w, h, `<g fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${strokes.map((s) => `<path d="${pathOf(s)}"/>`).join("")}</g>`);
function signatureToPng(svg, scale = 2) {
  if (typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * scale));
      c.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const g = c.getContext("2d");
      if (!g) {
        resolve(null);
        return;
      }
      g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b), "image/png");
    };
    img.onerror = () => resolve(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
function SignaturePadRender(t0) {
  const $ = _c(153);
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
  const nameRef = useNameCheck("SignaturePad", NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  let t1;
  if ($[3] !== props) {
    t1 = omit(props, OWN);
    $[3] = props;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const rest = t1;
  const sds = useSettings(words);
  const L = sds.labels;
  const base = domId("srp-sig", React.useId());
  const root = React.useRef(null);
  const area = React.useRef(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset;
  const readOnly = !!props.readOnly;
  const t2 = props["aria-invalid"];
  let t3;
  if ($[5] !== props.invalid || $[6] !== t2) {
    t3 = isInvalid(props.invalid, t2);
    $[5] = props.invalid;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const own = t3;
  const required = !!props.required;
  const first = props.defaultMethod === "type" ? "type" : "draw";
  const controlled = props.value !== void 0;
  const start = controlled ? props.value : props.defaultValue;
  const [method, setMethod] = React.useState(start ? start.method === "type" ? "type" : "draw" : first);
  let t4;
  if ($[8] !== start) {
    t4 = () => start && start.method !== "type" ? strokesOf(start.svg) : [];
    $[8] = start;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const [strokes, setStrokes] = React.useState(t4);
  const [typed, setTyped] = React.useState(start && start.method === "type" ? start.name : "");
  const liveRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const [drawing, setDrawing] = React.useState(null);
  let t5;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const cancelDraw = t5;
  let t6;
  let t7;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => cancelDraw;
    t7 = [];
    $[11] = t6;
    $[12] = t7;
  } else {
    t6 = $[11];
    t7 = $[12];
  }
  React.useEffect(t6, t7);
  let t8;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = (v, empty) => {
      cancelDraw();
      liveRef.current = null;
      setDrawing(null);
      if (!v) {
        setStrokes([]);
        setTyped("");
        setMethod(empty);
        return;
      }
      const m = v.method === "type" ? "type" : "draw";
      setMethod(m);
      if (m === "type") {
        setTyped(v.name);
      } else {
        setStrokes(strokesOf(v.svg));
      }
    };
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  const show = t8;
  let t9;
  if ($[14] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = [0, 0];
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  const [size, setSize] = React.useState(t9);
  const handover = useFocusHandover();
  let t10;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = () => root.current && root.current.querySelector('.srp-signature-pad__method [role=radio][tabindex="0"]');
    $[15] = t10;
  } else {
    t10 = $[15];
  }
  const methodStop = t10;
  useAutoFocus(props.autoFocus, methodStop);
  let t11;
  if ($[16] !== size) {
    t11 = () => {
      const b = area.current && area.current.getBoundingClientRect();
      return b ? [Math.round(b.width), Math.round(b.height)] : size;
    };
    $[16] = size;
    $[17] = t11;
  } else {
    t11 = $[17];
  }
  const measure = t11;
  let t12;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = () => {
      const b_0 = area.current && area.current.getBoundingClientRect();
      if (b_0) {
        setSize([Math.round(b_0.width), Math.round(b_0.height)]);
      }
    };
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  let t13;
  if ($[19] !== method) {
    t13 = [method];
    $[19] = method;
    $[20] = t13;
  } else {
    t13 = $[20];
  }
  React.useLayoutEffect(t12, t13);
  const valueOf = _temp;
  let t14;
  if ($[21] !== method || $[22] !== size || $[23] !== strokes || $[24] !== typed) {
    t14 = valueOf(method, strokes, typed, size);
    $[21] = method;
    $[22] = size;
    $[23] = strokes;
    $[24] = typed;
    $[25] = t14;
  } else {
    t14 = $[25];
  }
  const value = t14;
  let t15;
  if ($[26] !== measure || $[27] !== props) {
    t15 = (m_1, s_0, t_0, reason) => {
      if (props.onValueChange) {
        props.onValueChange(valueOf(m_1, s_0, t_0, measure()), {
          reason
        });
      }
    };
    $[26] = measure;
    $[27] = props;
    $[28] = t15;
  } else {
    t15 = $[28];
  }
  const tell = t15;
  const want = controlled ? props.value ?? null : void 0;
  let t16;
  if ($[29] !== want) {
    t16 = want === void 0 ? "" : want ? want.method === "type" ? "t:" + want.name.trim() : "d:" + JSON.stringify(strokesOf(want.svg)) : "-";
    $[29] = want;
    $[30] = t16;
  } else {
    t16 = $[30];
  }
  const wantKey = t16;
  const haveKey = !value ? "-" : value.method === "type" ? "t:" + value.name : "d:" + JSON.stringify(strokes);
  let t17;
  if ($[31] !== haveKey || $[32] !== method || $[33] !== want || $[34] !== wantKey) {
    t17 = () => {
      if (want !== void 0 && !liveRef.current && wantKey !== haveKey) {
        show(want, method);
      }
    };
    $[31] = haveKey;
    $[32] = method;
    $[33] = want;
    $[34] = wantKey;
    $[35] = t17;
  } else {
    t17 = $[35];
  }
  React.useLayoutEffect(t17);
  let t18;
  if ($[36] !== controlled || $[37] !== first || $[38] !== measure || $[39] !== props) {
    t18 = () => {
      if (controlled) {
        return;
      }
      setStrokes([]);
      setTyped("");
      show(props.defaultValue, first);
      if (props.onValueChange) {
        props.onValueChange(props.defaultValue ? valueOf(props.defaultValue.method === "type" ? "type" : "draw", props.defaultValue.method === "type" ? [] : strokesOf(props.defaultValue.svg), props.defaultValue.name, measure()) : null, {
          reason: "reset"
        });
      }
    };
    $[36] = controlled;
    $[37] = first;
    $[38] = measure;
    $[39] = props;
    $[40] = t18;
  } else {
    t18 = $[40];
  }
  useFormReset(root, t18, props.form);
  const pt = _temp2;
  let t19;
  if ($[41] !== disabled || $[42] !== readOnly) {
    t19 = (e_0) => {
      if (disabled || readOnly || e_0.pointerType === "mouse" && e_0.button !== 0) {
        return;
      }
      e_0.preventDefault();
      try {
        e_0.currentTarget.setPointerCapture(e_0.pointerId);
      } catch {
      }
      cancelDraw();
      liveRef.current = [pt(e_0, e_0.currentTarget.getBoundingClientRect())];
      setDrawing(liveRef.current.slice());
    };
    $[41] = disabled;
    $[42] = readOnly;
    $[43] = t19;
  } else {
    t19 = $[43];
  }
  const onDown = t19;
  let t20;
  if ($[44] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = (e_1) => {
      const s_1 = liveRef.current;
      if (!s_1) {
        return;
      }
      const b_2 = e_1.currentTarget.getBoundingClientRect();
      const raw = typeof e_1.nativeEvent.getCoalescedEvents === "function" ? e_1.nativeEvent.getCoalescedEvents() : [];
      const list = raw.length ? raw : [e_1];
      let added = false;
      for (const ev of list) {
        const p = pt(ev, b_2);
        const q = s_1[s_1.length - 1];
        if (q && Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 1) {
          continue;
        }
        s_1.push(p);
        added = true;
      }
      if (added && !rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          if (liveRef.current) {
            setDrawing(liveRef.current.slice());
          }
        });
      }
    };
    $[44] = t20;
  } else {
    t20 = $[44];
  }
  const onMove = t20;
  let t21;
  if ($[45] !== measure || $[46] !== strokes || $[47] !== tell || $[48] !== typed) {
    t21 = () => {
      const s_2 = liveRef.current;
      if (!s_2) {
        return;
      }
      cancelDraw();
      liveRef.current = null;
      setDrawing(null);
      const next = [...strokes, s_2];
      setSize(measure());
      setStrokes(next);
      tell("draw", next, typed, "draw");
    };
    $[45] = measure;
    $[46] = strokes;
    $[47] = tell;
    $[48] = typed;
    $[49] = t21;
  } else {
    t21 = $[49];
  }
  const onUp = t21;
  let t22;
  if ($[50] !== handover || $[51] !== strokes || $[52] !== tell || $[53] !== typed) {
    t22 = (e_2) => {
      const next_0 = strokes.slice(0, -1);
      if (!next_0.length) {
        handover(e_2.currentTarget, methodStop);
      }
      setStrokes(next_0);
      tell("draw", next_0, typed, "undo");
    };
    $[50] = handover;
    $[51] = strokes;
    $[52] = tell;
    $[53] = typed;
    $[54] = t22;
  } else {
    t22 = $[54];
  }
  const undo = t22;
  let t23;
  if ($[55] !== handover || $[56] !== tell || $[57] !== typed) {
    t23 = (e_3) => {
      handover(e_3.currentTarget, methodStop);
      setStrokes([]);
      tell("draw", [], typed, "clear");
    };
    $[55] = handover;
    $[56] = tell;
    $[57] = typed;
    $[58] = t23;
  } else {
    t23 = $[58];
  }
  const clear = t23;
  let t24;
  if ($[59] !== strokes || $[60] !== tell || $[61] !== typed) {
    t24 = (m_2) => {
      const next_1 = m_2 === "type" ? "type" : "draw";
      setMethod(next_1);
      tell(next_1, strokes, typed, "method");
    };
    $[59] = strokes;
    $[60] = tell;
    $[61] = typed;
    $[62] = t24;
  } else {
    t24 = $[62];
  }
  const pick = t24;
  let t25;
  if ($[63] !== drawing || $[64] !== strokes) {
    t25 = drawing ? [...strokes, drawing] : strokes;
    $[63] = drawing;
    $[64] = strokes;
    $[65] = t25;
  } else {
    t25 = $[65];
  }
  const shown = t25;
  let t26;
  if ($[66] !== method || $[67] !== shown || $[68] !== typed) {
    t26 = method === "draw" ? !shown.length : !typed.trim();
    $[66] = method;
    $[67] = shown;
    $[68] = typed;
    $[69] = t26;
  } else {
    t26 = $[69];
  }
  const empty_0 = t26;
  let t27;
  if ($[70] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t27 = () => methodStop()?.focus();
    $[70] = t27;
  } else {
    t27 = $[70];
  }
  const {
    missing,
    onInvalid
  } = useRequired(!!value, t27);
  const invalid = own || missing;
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  let t28;
  if ($[71] !== base || $[72] !== props || $[73] !== readOnly) {
    t28 = cn(!readOnly && base + "-how", props["aria-describedby"]) || void 0;
    $[71] = base;
    $[72] = props;
    $[73] = readOnly;
    $[74] = t28;
  } else {
    t28 = $[74];
  }
  const describedBy = t28;
  let t29;
  if ($[75] !== nameRef) {
    t29 = (n) => {
      root.current = n;
      delegateFocus(n, methodStop);
      nameRef(n);
    };
    $[75] = nameRef;
    $[76] = t29;
  } else {
    t29 = $[76];
  }
  const mergedRef = useMergedRef(ref, t29);
  const t30 = disabled && "srp-signature-pad--disabled";
  const t31 = readOnly && "srp-signature-pad--readonly";
  const t32 = invalid && "srp-signature-pad--invalid";
  let t33;
  if ($[77] !== props.className || $[78] !== t30 || $[79] !== t31 || $[80] !== t32) {
    t33 = cn("srp-signature-pad", t30, t31, t32, props.className);
    $[77] = props.className;
    $[78] = t30;
    $[79] = t31;
    $[80] = t32;
    $[81] = t33;
  } else {
    t33 = $[81];
  }
  const t34 = disabled ? "" : void 0;
  const t35 = readOnly ? "" : void 0;
  const t36 = invalid ? "" : void 0;
  const t37 = invalid || void 0;
  let t38;
  if ($[82] !== L.signatureDraw) {
    t38 = {
      value: "draw",
      label: L.signatureDraw
    };
    $[82] = L.signatureDraw;
    $[83] = t38;
  } else {
    t38 = $[83];
  }
  let t39;
  if ($[84] !== L.signatureType) {
    t39 = {
      value: "type",
      label: L.signatureType
    };
    $[84] = L.signatureType;
    $[85] = t39;
  } else {
    t39 = $[85];
  }
  let t40;
  if ($[86] !== t38 || $[87] !== t39) {
    t40 = [t38, t39];
    $[86] = t38;
    $[87] = t39;
    $[88] = t40;
  } else {
    t40 = $[88];
  }
  let t41;
  if ($[89] !== L.signatureMethod || $[90] !== disabled || $[91] !== method || $[92] !== pick || $[93] !== readOnly || $[94] !== t37 || $[95] !== t40) {
    t41 = /* @__PURE__ */ React.createElement(SegmentedControl, { className: "srp-signature-pad__method", size: "sm", "aria-label": L.signatureMethod, disabled, readOnly, invalid: t37, value: method, onValueChange: pick, options: t40 });
    $[89] = L.signatureMethod;
    $[90] = disabled;
    $[91] = method;
    $[92] = pick;
    $[93] = readOnly;
    $[94] = t37;
    $[95] = t40;
    $[96] = t41;
  } else {
    t41 = $[96];
  }
  let t42;
  if ($[97] !== L.signatureDrawHint || $[98] !== L.signatureTypeHint || $[99] !== base || $[100] !== method || $[101] !== readOnly) {
    t42 = readOnly ? null : /* @__PURE__ */ React.createElement("p", { className: "srp-signature-pad__how", id: base + "-how" }, method === "draw" ? L.signatureDrawHint : L.signatureTypeHint);
    $[97] = L.signatureDrawHint;
    $[98] = L.signatureTypeHint;
    $[99] = base;
    $[100] = method;
    $[101] = readOnly;
    $[102] = t42;
  } else {
    t42 = $[102];
  }
  let t43;
  if ($[103] !== L.signatureClear || $[104] !== L.signatureDrawn || $[105] !== L.signatureEmpty || $[106] !== L.signatureName || $[107] !== L.signatureUndo || $[108] !== base || $[109] !== clear || $[110] !== disabled || $[111] !== empty_0 || $[112] !== invalid || $[113] !== method || $[114] !== onDown || $[115] !== onUp || $[116] !== props || $[117] !== readOnly || $[118] !== required || $[119] !== shown || $[120] !== strokes || $[121] !== tell || $[122] !== typed || $[123] !== undo) {
    t43 = method === "draw" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__box" }, /* @__PURE__ */ React.createElement("svg", { ref: area, className: "srp-signature-pad__area", role: "img", "aria-label": empty_0 ? L.signatureEmpty : L.signatureDrawn, onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onLostPointerCapture: onUp }, /* @__PURE__ */ React.createElement("g", { className: "srp-signature-pad__strokes" }, shown.map(_temp3))), /* @__PURE__ */ React.createElement("span", { className: "srp-signature-pad__line", "aria-hidden": true })), readOnly ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__actions" }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: undo }, L.signatureUndo), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: clear }, L.signatureClear))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { className: "srp-signature-pad__label", htmlFor: base + "-name" }, L.signatureName), /* @__PURE__ */ React.createElement(Input, { id: base + "-name", className: "srp-signature-pad__input", autoComplete: "name", spellCheck: false, disabled, readOnly, invalid: invalid || void 0, "aria-required": props["aria-required"] ?? (required || void 0), value: typed, onChange: (e_4) => {
      setTyped(e_4.target.value);
      tell("type", strokes, e_4.target.value, "type");
    } }), /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__box", "aria-hidden": true }, /* @__PURE__ */ React.createElement("svg", { ref: area, className: "srp-signature-pad__area srp-signature-pad__area--typed", role: "presentation" }, typed.trim() ? /* @__PURE__ */ React.createElement("text", { className: "srp-signature-pad__typed", x: "16", y: "68%" }, typed.trim()) : null), /* @__PURE__ */ React.createElement("span", { className: "srp-signature-pad__line" })));
    $[103] = L.signatureClear;
    $[104] = L.signatureDrawn;
    $[105] = L.signatureEmpty;
    $[106] = L.signatureName;
    $[107] = L.signatureUndo;
    $[108] = base;
    $[109] = clear;
    $[110] = disabled;
    $[111] = empty_0;
    $[112] = invalid;
    $[113] = method;
    $[114] = onDown;
    $[115] = onUp;
    $[116] = props;
    $[117] = readOnly;
    $[118] = required;
    $[119] = shown;
    $[120] = strokes;
    $[121] = tell;
    $[122] = typed;
    $[123] = undo;
    $[124] = t43;
  } else {
    t43 = $[124];
  }
  let t44;
  if ($[125] !== t41 || $[126] !== t42 || $[127] !== t43) {
    t44 = /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, t41, t42, t43);
    $[125] = t41;
    $[126] = t42;
    $[127] = t43;
    $[128] = t44;
  } else {
    t44 = $[128];
  }
  let t45;
  if ($[129] !== disabled || $[130] !== props.form || $[131] !== props.name || $[132] !== value) {
    t45 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: value ? value.svg : "", disabled }) : null;
    $[129] = disabled;
    $[130] = props.form;
    $[131] = props.name;
    $[132] = value;
    $[133] = t45;
  } else {
    t45 = $[133];
  }
  let t46;
  if ($[134] !== disabled || $[135] !== onInvalid || $[136] !== props.form || $[137] !== readOnly || $[138] !== required || $[139] !== value) {
    t46 = required ? /* @__PURE__ */ React.createElement("input", { key: value ? "filled" : "empty", className: "srp-signature-pad__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: value ? "filled" : "", disabled: disabled || readOnly, form: props.form, onInvalid }) : null;
    $[134] = disabled;
    $[135] = onInvalid;
    $[136] = props.form;
    $[137] = readOnly;
    $[138] = required;
    $[139] = value;
    $[140] = t46;
  } else {
    t46 = $[140];
  }
  let t47;
  if ($[141] !== describedBy || $[142] !== labelledBy || $[143] !== mergedRef || $[144] !== rest || $[145] !== t33 || $[146] !== t34 || $[147] !== t35 || $[148] !== t36 || $[149] !== t44 || $[150] !== t45 || $[151] !== t46) {
    t47 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: "group", "aria-labelledby": labelledBy, "aria-describedby": describedBy, className: t33, "data-disabled": t34, "data-readonly": t35, "data-invalid": t36, "data-component": "signature-pad" }, t44, t45, t46);
    $[141] = describedBy;
    $[142] = labelledBy;
    $[143] = mergedRef;
    $[144] = rest;
    $[145] = t33;
    $[146] = t34;
    $[147] = t35;
    $[148] = t36;
    $[149] = t44;
    $[150] = t45;
    $[151] = t46;
    $[152] = t47;
  } else {
    t47 = $[152];
  }
  return t47;
}
function _temp3(s_3, i) {
  return /* @__PURE__ */ React.createElement("path", { key: i, d: pathOf(s_3) });
}
function _temp2(e, b_1) {
  return [r1(Math.min(b_1.width, Math.max(0, e.clientX - b_1.left))), r1(Math.min(b_1.height, Math.max(0, e.clientY - b_1.top)))];
}
function _temp(m_0, s, t, wh) {
  const w = wh[0] || 600;
  const h = wh[1] || 160;
  const name = t.trim();
  if (m_0 === "type") {
    return name ? {
      method: m_0,
      svg: typedSvg(name, w, h),
      name
    } : null;
  }
  return s.length ? {
    method: m_0,
    svg: drawnSvg(s, w, h),
    name: ""
  } : null;
}
var SignaturePad = /* @__PURE__ */ named("SignaturePad", SignaturePadRender);
export {
  SignaturePad,
  signatureToPng
};
//# sourceMappingURL=SignaturePad.js.map
