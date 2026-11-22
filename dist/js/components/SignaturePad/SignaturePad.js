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
var pathOf = (s) => s.length === 1 && s[0] ? `M${s[0][0]} ${s[0][1]}h0` : "M" + s.map((p) => p[0] + " " + p[1]).join("L");
var strokesOf = (svg) => [...svg.matchAll(/<path d="M([^"]+)"/g)].map(([, d = ""]) => d.replace(/h0$/, "").split("L").map((p) => {
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
  const $ = _c(147);
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
  const [drawing, setDrawing] = React.useState(null);
  let t5;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = (v, empty) => {
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
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const show = t5;
  let t6;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = [0, 0];
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  const [size, setSize] = React.useState(t6);
  const handover = useFocusHandover();
  let t7;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => root.current && root.current.querySelector('.srp-signature-pad__method [role=radio][tabindex="0"]');
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  const methodStop = t7;
  useAutoFocus(props.autoFocus, methodStop);
  let t8;
  if ($[13] !== size) {
    t8 = () => {
      const b = area.current && area.current.getBoundingClientRect();
      return b ? [Math.round(b.width), Math.round(b.height)] : size;
    };
    $[13] = size;
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  const measure = t8;
  let t9;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = () => {
      const b_0 = area.current && area.current.getBoundingClientRect();
      if (b_0) {
        setSize([Math.round(b_0.width), Math.round(b_0.height)]);
      }
    };
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  let t10;
  if ($[16] !== method) {
    t10 = [method];
    $[16] = method;
    $[17] = t10;
  } else {
    t10 = $[17];
  }
  React.useLayoutEffect(t9, t10);
  const valueOf = _temp;
  let t11;
  if ($[18] !== method || $[19] !== size || $[20] !== strokes || $[21] !== typed) {
    t11 = valueOf(method, strokes, typed, size);
    $[18] = method;
    $[19] = size;
    $[20] = strokes;
    $[21] = typed;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  const value = t11;
  let t12;
  if ($[23] !== measure || $[24] !== props) {
    t12 = (m_1, s_0, t_0, reason) => {
      if (props.onValueChange) {
        props.onValueChange(valueOf(m_1, s_0, t_0, measure()), {
          reason
        });
      }
    };
    $[23] = measure;
    $[24] = props;
    $[25] = t12;
  } else {
    t12 = $[25];
  }
  const tell = t12;
  const want = controlled ? props.value ?? null : void 0;
  let t13;
  if ($[26] !== want) {
    t13 = want === void 0 ? "" : want ? want.method === "type" ? "t:" + want.name.trim() : "d:" + JSON.stringify(strokesOf(want.svg)) : "-";
    $[26] = want;
    $[27] = t13;
  } else {
    t13 = $[27];
  }
  const wantKey = t13;
  const haveKey = !value ? "-" : value.method === "type" ? "t:" + value.name : "d:" + JSON.stringify(strokes);
  let t14;
  if ($[28] !== haveKey || $[29] !== method || $[30] !== want || $[31] !== wantKey) {
    t14 = () => {
      if (want !== void 0 && !liveRef.current && wantKey !== haveKey) {
        show(want, method);
      }
    };
    $[28] = haveKey;
    $[29] = method;
    $[30] = want;
    $[31] = wantKey;
    $[32] = t14;
  } else {
    t14 = $[32];
  }
  React.useLayoutEffect(t14);
  let t15;
  if ($[33] !== controlled || $[34] !== first || $[35] !== measure || $[36] !== props) {
    t15 = () => {
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
    $[33] = controlled;
    $[34] = first;
    $[35] = measure;
    $[36] = props;
    $[37] = t15;
  } else {
    t15 = $[37];
  }
  useFormReset(root, t15, props.form);
  const at = _temp2;
  let t16;
  if ($[38] !== disabled || $[39] !== readOnly) {
    t16 = (e_0) => {
      if (disabled || readOnly || e_0.pointerType === "mouse" && e_0.button !== 0) {
        return;
      }
      e_0.preventDefault();
      try {
        e_0.currentTarget.setPointerCapture(e_0.pointerId);
      } catch {
      }
      liveRef.current = [at(e_0)];
      setDrawing(liveRef.current.slice());
    };
    $[38] = disabled;
    $[39] = readOnly;
    $[40] = t16;
  } else {
    t16 = $[40];
  }
  const onDown = t16;
  let t17;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t17 = (e_1) => {
      const s_1 = liveRef.current;
      if (!s_1) {
        return;
      }
      const p = at(e_1);
      const q = s_1[s_1.length - 1];
      if (q && Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 1) {
        return;
      }
      s_1.push(p);
      setDrawing(s_1.slice());
    };
    $[41] = t17;
  } else {
    t17 = $[41];
  }
  const onMove = t17;
  let t18;
  if ($[42] !== measure || $[43] !== strokes || $[44] !== tell || $[45] !== typed) {
    t18 = () => {
      const s_2 = liveRef.current;
      if (!s_2) {
        return;
      }
      liveRef.current = null;
      setDrawing(null);
      const next = [...strokes, s_2];
      setSize(measure());
      setStrokes(next);
      tell("draw", next, typed, "draw");
    };
    $[42] = measure;
    $[43] = strokes;
    $[44] = tell;
    $[45] = typed;
    $[46] = t18;
  } else {
    t18 = $[46];
  }
  const onUp = t18;
  let t19;
  if ($[47] !== handover || $[48] !== strokes || $[49] !== tell || $[50] !== typed) {
    t19 = (e_2) => {
      const next_0 = strokes.slice(0, -1);
      if (!next_0.length) {
        handover(e_2.currentTarget, methodStop);
      }
      setStrokes(next_0);
      tell("draw", next_0, typed, "undo");
    };
    $[47] = handover;
    $[48] = strokes;
    $[49] = tell;
    $[50] = typed;
    $[51] = t19;
  } else {
    t19 = $[51];
  }
  const undo = t19;
  let t20;
  if ($[52] !== handover || $[53] !== tell || $[54] !== typed) {
    t20 = (e_3) => {
      handover(e_3.currentTarget, methodStop);
      setStrokes([]);
      tell("draw", [], typed, "clear");
    };
    $[52] = handover;
    $[53] = tell;
    $[54] = typed;
    $[55] = t20;
  } else {
    t20 = $[55];
  }
  const clear = t20;
  let t21;
  if ($[56] !== strokes || $[57] !== tell || $[58] !== typed) {
    t21 = (m_2) => {
      const next_1 = m_2 === "type" ? "type" : "draw";
      setMethod(next_1);
      tell(next_1, strokes, typed, "method");
    };
    $[56] = strokes;
    $[57] = tell;
    $[58] = typed;
    $[59] = t21;
  } else {
    t21 = $[59];
  }
  const pick = t21;
  let t22;
  if ($[60] !== drawing || $[61] !== strokes) {
    t22 = drawing ? [...strokes, drawing] : strokes;
    $[60] = drawing;
    $[61] = strokes;
    $[62] = t22;
  } else {
    t22 = $[62];
  }
  const shown = t22;
  let t23;
  if ($[63] !== method || $[64] !== shown || $[65] !== typed) {
    t23 = method === "draw" ? !shown.length : !typed.trim();
    $[63] = method;
    $[64] = shown;
    $[65] = typed;
    $[66] = t23;
  } else {
    t23 = $[66];
  }
  const empty_0 = t23;
  let t24;
  if ($[67] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t24 = () => methodStop()?.focus();
    $[67] = t24;
  } else {
    t24 = $[67];
  }
  const {
    missing,
    onInvalid
  } = useRequired(!!value, t24);
  const invalid = own || missing;
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  let t25;
  if ($[68] !== base || $[69] !== props || $[70] !== readOnly) {
    t25 = cn(!readOnly && base + "-how", props["aria-describedby"]) || void 0;
    $[68] = base;
    $[69] = props;
    $[70] = readOnly;
    $[71] = t25;
  } else {
    t25 = $[71];
  }
  const describedBy = t25;
  let t26;
  if ($[72] !== nameRef) {
    t26 = (n) => {
      root.current = n;
      delegateFocus(n, methodStop);
      nameRef(n);
    };
    $[72] = nameRef;
    $[73] = t26;
  } else {
    t26 = $[73];
  }
  const mergedRef = useMergedRef(ref, t26);
  const t27 = disabled && "srp-signature-pad--disabled";
  const t28 = readOnly && "srp-signature-pad--readonly";
  const t29 = invalid && "srp-signature-pad--invalid";
  let t30;
  if ($[74] !== props.className || $[75] !== t27 || $[76] !== t28 || $[77] !== t29) {
    t30 = cn("srp-signature-pad", t27, t28, t29, props.className);
    $[74] = props.className;
    $[75] = t27;
    $[76] = t28;
    $[77] = t29;
    $[78] = t30;
  } else {
    t30 = $[78];
  }
  const t31 = invalid || void 0;
  let t32;
  if ($[79] !== L.signatureDraw) {
    t32 = {
      value: "draw",
      label: L.signatureDraw
    };
    $[79] = L.signatureDraw;
    $[80] = t32;
  } else {
    t32 = $[80];
  }
  let t33;
  if ($[81] !== L.signatureType) {
    t33 = {
      value: "type",
      label: L.signatureType
    };
    $[81] = L.signatureType;
    $[82] = t33;
  } else {
    t33 = $[82];
  }
  let t34;
  if ($[83] !== t32 || $[84] !== t33) {
    t34 = [t32, t33];
    $[83] = t32;
    $[84] = t33;
    $[85] = t34;
  } else {
    t34 = $[85];
  }
  let t35;
  if ($[86] !== L.signatureMethod || $[87] !== disabled || $[88] !== method || $[89] !== pick || $[90] !== readOnly || $[91] !== t31 || $[92] !== t34) {
    t35 = /* @__PURE__ */ React.createElement(SegmentedControl, { className: "srp-signature-pad__method", size: "sm", "aria-label": L.signatureMethod, disabled, readOnly, invalid: t31, value: method, onValueChange: pick, options: t34 });
    $[86] = L.signatureMethod;
    $[87] = disabled;
    $[88] = method;
    $[89] = pick;
    $[90] = readOnly;
    $[91] = t31;
    $[92] = t34;
    $[93] = t35;
  } else {
    t35 = $[93];
  }
  let t36;
  if ($[94] !== L.signatureDrawHint || $[95] !== L.signatureTypeHint || $[96] !== base || $[97] !== method || $[98] !== readOnly) {
    t36 = readOnly ? null : /* @__PURE__ */ React.createElement("p", { className: "srp-signature-pad__how", id: base + "-how" }, method === "draw" ? L.signatureDrawHint : L.signatureTypeHint);
    $[94] = L.signatureDrawHint;
    $[95] = L.signatureTypeHint;
    $[96] = base;
    $[97] = method;
    $[98] = readOnly;
    $[99] = t36;
  } else {
    t36 = $[99];
  }
  let t37;
  if ($[100] !== L.signatureClear || $[101] !== L.signatureDrawn || $[102] !== L.signatureEmpty || $[103] !== L.signatureName || $[104] !== L.signatureUndo || $[105] !== base || $[106] !== clear || $[107] !== disabled || $[108] !== empty_0 || $[109] !== invalid || $[110] !== method || $[111] !== onDown || $[112] !== onUp || $[113] !== props || $[114] !== readOnly || $[115] !== required || $[116] !== shown || $[117] !== strokes || $[118] !== tell || $[119] !== typed || $[120] !== undo) {
    t37 = method === "draw" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__box" }, /* @__PURE__ */ React.createElement("svg", { ref: area, className: "srp-signature-pad__area", role: "img", "aria-label": empty_0 ? L.signatureEmpty : L.signatureDrawn, onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onLostPointerCapture: onUp }, /* @__PURE__ */ React.createElement("g", { className: "srp-signature-pad__strokes" }, shown.map(_temp3))), /* @__PURE__ */ React.createElement("span", { className: "srp-signature-pad__line", "aria-hidden": true })), readOnly ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__actions" }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: undo }, L.signatureUndo), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: clear }, L.signatureClear))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { className: "srp-signature-pad__label", htmlFor: base + "-name" }, L.signatureName), /* @__PURE__ */ React.createElement(Input, { id: base + "-name", className: "srp-signature-pad__input", autoComplete: "name", spellCheck: false, disabled, readOnly, invalid: invalid || void 0, "aria-required": props["aria-required"] ?? (required || void 0), value: typed, onChange: (e_4) => {
      setTyped(e_4.target.value);
      tell("type", strokes, e_4.target.value, "type");
    } }), /* @__PURE__ */ React.createElement("div", { className: "srp-signature-pad__box", "aria-hidden": true }, /* @__PURE__ */ React.createElement("svg", { ref: area, className: "srp-signature-pad__area srp-signature-pad__area--typed", role: "presentation" }, typed.trim() ? /* @__PURE__ */ React.createElement("text", { className: "srp-signature-pad__typed", x: "16", y: "68%" }, typed.trim()) : null), /* @__PURE__ */ React.createElement("span", { className: "srp-signature-pad__line" })));
    $[100] = L.signatureClear;
    $[101] = L.signatureDrawn;
    $[102] = L.signatureEmpty;
    $[103] = L.signatureName;
    $[104] = L.signatureUndo;
    $[105] = base;
    $[106] = clear;
    $[107] = disabled;
    $[108] = empty_0;
    $[109] = invalid;
    $[110] = method;
    $[111] = onDown;
    $[112] = onUp;
    $[113] = props;
    $[114] = readOnly;
    $[115] = required;
    $[116] = shown;
    $[117] = strokes;
    $[118] = tell;
    $[119] = typed;
    $[120] = undo;
    $[121] = t37;
  } else {
    t37 = $[121];
  }
  let t38;
  if ($[122] !== t35 || $[123] !== t36 || $[124] !== t37) {
    t38 = /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, t35, t36, t37);
    $[122] = t35;
    $[123] = t36;
    $[124] = t37;
    $[125] = t38;
  } else {
    t38 = $[125];
  }
  let t39;
  if ($[126] !== disabled || $[127] !== props.form || $[128] !== props.name || $[129] !== value) {
    t39 = props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: value ? value.svg : "", disabled }) : null;
    $[126] = disabled;
    $[127] = props.form;
    $[128] = props.name;
    $[129] = value;
    $[130] = t39;
  } else {
    t39 = $[130];
  }
  let t40;
  if ($[131] !== disabled || $[132] !== onInvalid || $[133] !== props.form || $[134] !== readOnly || $[135] !== required || $[136] !== value) {
    t40 = required ? /* @__PURE__ */ React.createElement("input", { key: value ? "filled" : "empty", className: "srp-signature-pad__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: value ? "filled" : "", disabled: disabled || readOnly, form: props.form, onInvalid }) : null;
    $[131] = disabled;
    $[132] = onInvalid;
    $[133] = props.form;
    $[134] = readOnly;
    $[135] = required;
    $[136] = value;
    $[137] = t40;
  } else {
    t40 = $[137];
  }
  let t41;
  if ($[138] !== describedBy || $[139] !== labelledBy || $[140] !== mergedRef || $[141] !== rest || $[142] !== t30 || $[143] !== t38 || $[144] !== t39 || $[145] !== t40) {
    t41 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: "group", "aria-labelledby": labelledBy, "aria-describedby": describedBy, className: t30, "data-component": "signature-pad" }, t38, t39, t40);
    $[138] = describedBy;
    $[139] = labelledBy;
    $[140] = mergedRef;
    $[141] = rest;
    $[142] = t30;
    $[143] = t38;
    $[144] = t39;
    $[145] = t40;
    $[146] = t41;
  } else {
    t41 = $[146];
  }
  return t41;
}
function _temp3(s_3, i) {
  return /* @__PURE__ */ React.createElement("path", { key: i, d: pathOf(s_3) });
}
function _temp2(e) {
  const b_1 = e.currentTarget.getBoundingClientRect();
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
