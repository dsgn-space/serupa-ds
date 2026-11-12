"use client";

// src/components/SignaturePad/SignaturePad.tsx
import * as React from "react";
import { cn, domId, isInvalid, omit, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { delegateFocus, useAutoFocus, useFocusHandover } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { Button } from "../Button/Button.js";
import { Input } from "../Input/Input.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { en as words } from "./labels.js";
var OWN = { value: 1, defaultValue: 1, onValueChange: 1, defaultMethod: 1, name: 1, form: 1, disabled: 1, readOnly: 1, invalid: 1, "aria-invalid": 1, "aria-required": 1, autoFocus: 1, className: 1 };
var r1 = (n) => Math.round(n * 10) / 10;
var pathOf = (s) => s.length === 1 ? `M${s[0][0]} ${s[0][1]}h0` : "M" + s.map((p) => p[0] + " " + p[1]).join("L");
var strokesOf = (svg) => [...svg.matchAll(/<path d="M([^"]+)"/g)].map(
  (m) => m[1].replace(/h0$/, "").split("L").map((p) => {
    const [x, y] = p.trim().split(/[\s,]+/).map(Number);
    return [x, y];
  }).filter((p) => isFinite(p[0]) && isFinite(p[1]))
).filter((s) => s.length);
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
var SignaturePad = /* @__PURE__ */ component("SignaturePad", function SignaturePad2(given, ref) {
  const props = useFieldControl(given);
  const nameRef = useNameCheck("SignaturePad", NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  const rest = omit(props, OWN);
  const sds = useSettings(words), L = sds.labels;
  const base = domId("dk-sig", React.useId());
  const root = React.useRef(null);
  const area = React.useRef(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset, readOnly = !!props.readOnly;
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const first = props.defaultMethod === "type" ? "type" : "draw";
  const controlled = props.value !== void 0;
  const start = controlled ? props.value : props.defaultValue;
  const [method, setMethod] = React.useState(start ? start.method === "type" ? "type" : "draw" : first);
  const [strokes, setStrokes] = React.useState(() => start && start.method !== "type" ? strokesOf(start.svg) : []);
  const [typed, setTyped] = React.useState(start && start.method === "type" ? start.name : "");
  const show = (v, empty2) => {
    live.current = null;
    if (!v) {
      setStrokes([]);
      setTyped("");
      setMethod(empty2);
      return;
    }
    const m = v.method === "type" ? "type" : "draw";
    setMethod(m);
    if (m === "type") setTyped(v.name);
    else setStrokes(strokesOf(v.svg));
  };
  const [size, setSize] = React.useState([0, 0]);
  const live = React.useRef(null);
  const [, redraw] = React.useReducer((n) => n + 1, 0);
  const handover = useFocusHandover();
  const methodStop = () => root.current && root.current.querySelector('.dk-signature-pad__method [role=radio][tabindex="0"]');
  useAutoFocus(props.autoFocus, methodStop);
  const measure = () => {
    const b = area.current && area.current.getBoundingClientRect();
    return b ? [Math.round(b.width), Math.round(b.height)] : size;
  };
  React.useLayoutEffect(() => {
    const b = area.current && area.current.getBoundingClientRect();
    if (b) setSize([Math.round(b.width), Math.round(b.height)]);
  }, [method]);
  const valueOf = (m, s, t, wh) => {
    const w = wh[0] || 600, h = wh[1] || 160, name = t.trim();
    if (m === "type") return name ? { method: m, svg: typedSvg(name, w, h), name } : null;
    return s.length ? { method: m, svg: drawnSvg(s, w, h), name: "" } : null;
  };
  const value = valueOf(method, strokes, typed, size);
  const tell = (m, s, t, reason) => {
    if (props.onValueChange) props.onValueChange(valueOf(m, s, t, measure()), { reason });
  };
  const want = controlled ? props.value ?? null : void 0;
  const wantKey = want === void 0 ? "" : want ? want.method === "type" ? "t:" + want.name.trim() : "d:" + JSON.stringify(strokesOf(want.svg)) : "-";
  const haveKey = !value ? "-" : value.method === "type" ? "t:" + value.name : "d:" + JSON.stringify(strokes);
  React.useLayoutEffect(() => {
    if (want !== void 0 && !live.current && wantKey !== haveKey) show(want, method);
  });
  useFormReset(root, () => {
    if (controlled) return;
    setStrokes([]);
    setTyped("");
    show(props.defaultValue, first);
    if (props.onValueChange) props.onValueChange(props.defaultValue ? valueOf(props.defaultValue.method === "type" ? "type" : "draw", props.defaultValue.method === "type" ? [] : strokesOf(props.defaultValue.svg), props.defaultValue.name, measure()) : null, { reason: "reset" });
  }, props.form);
  const at = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    return [r1(Math.min(b.width, Math.max(0, e.clientX - b.left))), r1(Math.min(b.height, Math.max(0, e.clientY - b.top)))];
  };
  const onDown = (e) => {
    if (disabled || readOnly || e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    live.current = [at(e)];
    redraw();
  };
  const onMove = (e) => {
    const s = live.current;
    if (!s) return;
    const p = at(e), q = s[s.length - 1];
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 1) return;
    s.push(p);
    redraw();
  };
  const onUp = () => {
    const s = live.current;
    if (!s) return;
    live.current = null;
    const next = [...strokes, s];
    setSize(measure());
    setStrokes(next);
    tell("draw", next, typed, "draw");
  };
  const undo = (e) => {
    const next = strokes.slice(0, -1);
    if (!next.length) handover(e.currentTarget, methodStop);
    setStrokes(next);
    tell("draw", next, typed, "undo");
  };
  const clear = (e) => {
    handover(e.currentTarget, methodStop);
    setStrokes([]);
    tell("draw", [], typed, "clear");
  };
  const pick = (m) => {
    const next = m === "type" ? "type" : "draw";
    setMethod(next);
    tell(next, strokes, typed, "method");
  };
  const shown = live.current ? [...strokes, live.current] : strokes;
  const empty = method === "draw" ? !shown.length : !typed.trim();
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  const describedBy = cn(!readOnly && base + "-how", props["aria-describedby"]) || void 0;
  const mergedRef = useMergedRef(ref, (n) => {
    root.current = n;
    delegateFocus(n, methodStop);
    nameRef(n);
  });
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: mergedRef,
      role: "group",
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      className: cn("dk-signature-pad", disabled && "dk-signature-pad--disabled", readOnly && "dk-signature-pad--readonly", invalid && "dk-signature-pad--invalid", props.className),
      "data-component": "signature-pad"
    },
    /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, /* @__PURE__ */ React.createElement(
      SegmentedControl,
      {
        className: "dk-signature-pad__method",
        size: "sm",
        "aria-label": L.signatureMethod,
        disabled,
        readOnly,
        invalid: invalid || void 0,
        value: method,
        onValueChange: pick,
        options: [{ value: "draw", label: L.signatureDraw }, { value: "type", label: L.signatureType }]
      }
    ), readOnly ? null : /* @__PURE__ */ React.createElement("p", { className: "dk-signature-pad__how", id: base + "-how" }, method === "draw" ? L.signatureDrawHint : L.signatureTypeHint), method === "draw" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "dk-signature-pad__box" }, /* @__PURE__ */ React.createElement(
      "svg",
      {
        ref: area,
        className: "dk-signature-pad__area",
        role: "img",
        "aria-label": empty ? L.signatureEmpty : L.signatureDrawn,
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onUp,
        onLostPointerCapture: onUp
      },
      /* @__PURE__ */ React.createElement("g", { className: "dk-signature-pad__strokes" }, shown.map((s, i) => /* @__PURE__ */ React.createElement("path", { key: i, d: pathOf(s) })))
    ), /* @__PURE__ */ React.createElement("span", { className: "dk-signature-pad__line", "aria-hidden": true })), readOnly ? null : /* @__PURE__ */ React.createElement("div", { className: "dk-signature-pad__actions" }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: undo }, L.signatureUndo), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", disabled: disabled || !strokes.length, onClick: clear }, L.signatureClear))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", { className: "dk-signature-pad__label", htmlFor: base + "-name" }, L.signatureName), /* @__PURE__ */ React.createElement(
      Input,
      {
        id: base + "-name",
        className: "dk-signature-pad__input",
        autoComplete: "name",
        spellCheck: false,
        disabled,
        readOnly,
        invalid: invalid || void 0,
        value: typed,
        onChange: (e) => {
          setTyped(e.target.value);
          tell("type", strokes, e.target.value, "type");
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "dk-signature-pad__box", "aria-hidden": true }, /* @__PURE__ */ React.createElement("svg", { ref: area, className: "dk-signature-pad__area dk-signature-pad__area--typed", role: "presentation" }, typed.trim() ? /* @__PURE__ */ React.createElement("text", { className: "dk-signature-pad__typed", x: "16", y: "68%" }, typed.trim()) : null), /* @__PURE__ */ React.createElement("span", { className: "dk-signature-pad__line" })))),
    props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: value ? value.svg : "", disabled }) : null
  );
});
export {
  SignaturePad,
  signatureToPng
};
//# sourceMappingURL=SignaturePad.js.map
