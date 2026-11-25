"use client";

// src/components/ImageCropper/ImageCropper.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { delegateFocus } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import * as icons from "../../material/builtin.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Slider } from "../Slider/Slider.js";
import { en as words } from "./labels.js";
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function areaOf(nw, nh, aspect, zoom, cx, cy) {
  let w = nw, h = nw / aspect;
  if (h > nh) {
    h = nh;
    w = nh * aspect;
  }
  w /= zoom;
  h /= zoom;
  return {
    x: clamp(cx * nw - w / 2, 0, nw - w),
    y: clamp(cy * nh - h / 2, 0, nh - h),
    width: w,
    height: h
  };
}
function viewOf(nw, nh, aspect, maxZoom, a) {
  const full = areaOf(nw, nh, aspect, 1, 0.5, 0.5);
  return {
    zoom: clamp(Math.round(full.width / Math.max(1, a.width) * 1e3) / 1e3, 1, maxZoom),
    center: [(a.x + a.width / 2) / nw, (a.y + a.height / 2) / nh]
  };
}
var whole = (a) => ({
  x: Math.round(a.x),
  y: Math.round(a.y),
  width: Math.round(a.width),
  height: Math.round(a.height)
});
function cropImage(src, area, options = {}) {
  if (typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    if (options.crossOrigin !== void 0) img.crossOrigin = options.crossOrigin || "anonymous";
    img.onload = () => {
      const w = Math.max(1, Math.round(options.width || area.width)), h = Math.max(1, Math.round(w * area.height / area.width));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      if (!g) {
        resolve(null);
        return;
      }
      g.imageSmoothingQuality = "high";
      g.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
      try {
        c.toBlob((b) => resolve(b), options.type || "image/png", options.quality);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
var OWN = {
  src: 1,
  crop: 1,
  defaultCrop: 1,
  aspect: 1,
  shape: 1,
  defaultZoom: 1,
  maxZoom: 1,
  onCropChange: 1,
  crossOrigin: 1,
  disabled: 1,
  className: 1,
  style: 1
};
var STEP = 0.1;
var TAP = 4;
function ImageCropperRender(t0) {
  const $ = _c(136);
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
  const nameRef = useNameCheck("ImageCropper", NAME_HOW.group);
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
  const L = useSettings(words).labels;
  const base = domId("srp-crop", React.useId());
  const root = React.useRef(null);
  const frame = React.useRef(null);
  const disabled = useFieldsetDisabled(root) || !!props.disabled;
  const aspect = props.aspect && props.aspect > 0 && isFinite(props.aspect) ? props.aspect : 1;
  const maxZoom = Math.max(1, props.maxZoom || 4);
  const t2 = props.defaultZoom || 1;
  let t3;
  if ($[5] !== maxZoom || $[6] !== t2) {
    t3 = clamp(t2, 1, maxZoom);
    $[5] = maxZoom;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const first = t3;
  const [nat, setNat] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const [ownZoom, setZoom] = React.useState(first);
  let t4;
  if ($[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = [0.5, 0.5];
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const [ownCenter, setCenter] = React.useState(t4);
  const [shown, setShown] = React.useState(props.src);
  const [gen, setGen] = React.useState(0);
  if (shown !== props.src) {
    setShown(props.src);
    setGen(gen + 1);
    setNat(null);
    setFailed(false);
    setZoom(first);
    setCenter([0.5, 0.5]);
  }
  let t5;
  if ($[9] !== aspect || $[10] !== maxZoom || $[11] !== nat || $[12] !== props.crop) {
    t5 = nat && props.crop ? viewOf(nat[0], nat[1], aspect, maxZoom, props.crop) : null;
    $[9] = aspect;
    $[10] = maxZoom;
    $[11] = nat;
    $[12] = props.crop;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const ctl = t5;
  const zoom = ctl ? ctl.zoom : ownZoom;
  const center = ctl ? ctl.center : ownCenter;
  let t6;
  if ($[14] !== aspect || $[15] !== center || $[16] !== nat || $[17] !== zoom) {
    t6 = nat ? areaOf(nat[0], nat[1], aspect, zoom, center[0], center[1]) : null;
    $[14] = aspect;
    $[15] = center;
    $[16] = nat;
    $[17] = zoom;
    $[18] = t6;
  } else {
    t6 = $[18];
  }
  const area = t6;
  let t7;
  if ($[19] !== aspect || $[20] !== maxZoom || $[21] !== props) {
    t7 = (n, z, cx, cy) => {
      const zz = clamp(Math.round(z * 1e3) / 1e3, 1, maxZoom);
      const a = areaOf(n[0], n[1], aspect, zz, cx, cy);
      const c = [(a.x + a.width / 2) / n[0], (a.y + a.height / 2) / n[1]];
      setZoom(zz);
      setCenter(c);
      if (props.onCropChange) {
        props.onCropChange(whole(a));
      }
    };
    $[19] = aspect;
    $[20] = maxZoom;
    $[21] = props;
    $[22] = t7;
  } else {
    t7 = $[22];
  }
  const go = t7;
  let t8;
  if ($[23] !== area || $[24] !== aspect || $[25] !== go || $[26] !== maxZoom || $[27] !== nat) {
    t8 = (z_0, t92, t102) => {
      const fx = t92 === void 0 ? 0.5 : t92;
      const fy = t102 === void 0 ? 0.5 : t102;
      if (!nat || !area) {
        return;
      }
      const px = area.x + fx * area.width;
      const py = area.y + fy * area.height;
      const b = areaOf(nat[0], nat[1], aspect, clamp(z_0, 1, maxZoom), 0.5, 0.5);
      go(nat, z_0, (px - fx * b.width + b.width / 2) / nat[0], (py - fy * b.height + b.height / 2) / nat[1]);
    };
    $[23] = area;
    $[24] = aspect;
    $[25] = go;
    $[26] = maxZoom;
    $[27] = nat;
    $[28] = t8;
  } else {
    t8 = $[28];
  }
  const zoomTo = t8;
  const read = React.useRef(null);
  const firstSrc = React.useRef(props.src);
  let t9;
  if ($[29] !== aspect || $[30] !== first || $[31] !== gen || $[32] !== go || $[33] !== maxZoom || $[34] !== props.crop || $[35] !== props.defaultCrop || $[36] !== props.src) {
    t9 = (i) => {
      if (read.current === gen) {
        return;
      }
      read.current = gen;
      if (!i.naturalWidth || !i.naturalHeight) {
        setFailed(true);
        return;
      }
      const n_0 = [i.naturalWidth, i.naturalHeight];
      setNat(n_0);
      setFailed(false);
      const at = props.crop || (props.src === firstSrc.current ? props.defaultCrop : null);
      if (at) {
        const v = viewOf(n_0[0], n_0[1], aspect, maxZoom, at);
        go(n_0, v.zoom, v.center[0], v.center[1]);
      } else {
        go(n_0, first, 0.5, 0.5);
      }
    };
    $[29] = aspect;
    $[30] = first;
    $[31] = gen;
    $[32] = go;
    $[33] = maxZoom;
    $[34] = props.crop;
    $[35] = props.defaultCrop;
    $[36] = props.src;
    $[37] = t9;
  } else {
    t9 = $[37];
  }
  const loaded = t9;
  let t10;
  if ($[38] !== loaded) {
    t10 = (i_0) => {
      if (i_0 && i_0.complete && i_0.naturalWidth) {
        loaded(i_0);
      }
    };
    $[38] = loaded;
    $[39] = t10;
  } else {
    t10 = $[39];
  }
  const imgRef = t10;
  const live = !disabled && !!area;
  const off = disabled;
  let t11;
  if ($[40] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ new Map();
    $[40] = t11;
  } else {
    t11 = $[40];
  }
  const pointers = React.useRef(t11);
  const start = React.useRef(null);
  const pinch = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  let t12;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = () => {
      const [p, q] = [...pointers.current.values()];
      return p && q ? Math.hypot(p.x - q.x, p.y - q.y) : 0;
    };
    $[41] = t12;
  } else {
    t12 = $[41];
  }
  const spread = t12;
  let t13;
  if ($[42] !== center || $[43] !== live || $[44] !== zoom) {
    t13 = (e) => {
      if (!live || e.pointerType === "mouse" && e.button !== 0) {
        return;
      }
      e.preventDefault();
      e.currentTarget.focus({
        preventScroll: true
      });
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      pointers.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });
      start.current = {
        x: e.clientX,
        y: e.clientY,
        cx: center[0],
        cy: center[1],
        moved: pointers.current.size > 1
      };
      pinch.current = pointers.current.size === 2 ? {
        d: spread(),
        z: zoom
      } : null;
      setDragging(true);
    };
    $[42] = center;
    $[43] = live;
    $[44] = zoom;
    $[45] = t13;
  } else {
    t13 = $[45];
  }
  const onDown = t13;
  let t14;
  if ($[46] !== area || $[47] !== go || $[48] !== nat || $[49] !== zoom || $[50] !== zoomTo) {
    t14 = (e_0) => {
      const s = start.current;
      if (!s || !nat || !area || !pointers.current.has(e_0.pointerId)) {
        return;
      }
      pointers.current.set(e_0.pointerId, {
        x: e_0.clientX,
        y: e_0.clientY
      });
      const b_0 = e_0.currentTarget.getBoundingClientRect();
      if (pinch.current && pinch.current.d) {
        const ps = [...pointers.current.values()];
        const mx = ps.reduce(_temp, 0) / ps.length;
        const my = ps.reduce(_temp2, 0) / ps.length;
        zoomTo(pinch.current.z * spread() / pinch.current.d, (mx - b_0.left) / b_0.width, (my - b_0.top) / b_0.height);
        return;
      }
      if (!s.moved && Math.hypot(e_0.clientX - s.x, e_0.clientY - s.y) < TAP) {
        return;
      }
      s.moved = true;
      go(nat, zoom, s.cx - (e_0.clientX - s.x) * area.width / b_0.width / nat[0], s.cy - (e_0.clientY - s.y) * area.height / b_0.height / nat[1]);
    };
    $[46] = area;
    $[47] = go;
    $[48] = nat;
    $[49] = zoom;
    $[50] = zoomTo;
    $[51] = t14;
  } else {
    t14 = $[51];
  }
  const onMove = t14;
  let t15;
  if ($[52] !== area || $[53] !== center || $[54] !== go || $[55] !== nat || $[56] !== zoom) {
    t15 = (e_1) => {
      const s_0 = start.current;
      if (e_1.type === "pointerup" && s_0 && !s_0.moved && pointers.current.size === 1 && nat && area) {
        const b_1 = e_1.currentTarget.getBoundingClientRect();
        go(nat, zoom, (area.x + (e_1.clientX - b_1.left) / b_1.width * area.width) / nat[0], (area.y + (e_1.clientY - b_1.top) / b_1.height * area.height) / nat[1]);
      }
      pointers.current.delete(e_1.pointerId);
      pinch.current = null;
      const left = [...pointers.current.values()][0];
      start.current = left ? {
        x: left.x,
        y: left.y,
        cx: center[0],
        cy: center[1],
        moved: true
      } : null;
      if (!left) {
        setDragging(false);
      }
    };
    $[52] = area;
    $[53] = center;
    $[54] = go;
    $[55] = nat;
    $[56] = zoom;
    $[57] = t15;
  } else {
    t15 = $[57];
  }
  const onUp = t15;
  let t16;
  if ($[58] !== area || $[59] !== center || $[60] !== go || $[61] !== live || $[62] !== nat || $[63] !== zoom || $[64] !== zoomTo) {
    t16 = (e_2) => {
      if (!live || !nat || !area || e_2.altKey || e_2.ctrlKey || e_2.metaKey) {
        return;
      }
      const k = e_2.key;
      const f = e_2.shiftKey ? 0.5 : 0.1;
      const dx = k === "ArrowLeft" ? -1 : k === "ArrowRight" ? 1 : 0;
      const dy = k === "ArrowUp" ? -1 : k === "ArrowDown" ? 1 : 0;
      if (dx || dy) {
        e_2.preventDefault();
        go(nat, zoom, center[0] - dx * f * area.width / nat[0], center[1] - dy * f * area.height / nat[1]);
      } else {
        if (k === "+" || k === "=") {
          e_2.preventDefault();
          zoomTo(zoom + STEP);
        } else {
          if (k === "-" || k === "_") {
            e_2.preventDefault();
            zoomTo(zoom - STEP);
          }
        }
      }
    };
    $[58] = area;
    $[59] = center;
    $[60] = go;
    $[61] = live;
    $[62] = nat;
    $[63] = zoom;
    $[64] = zoomTo;
    $[65] = t16;
  } else {
    t16 = $[65];
  }
  const onKey = t16;
  let t17;
  if ($[66] !== live || $[67] !== zoom || $[68] !== zoomTo) {
    t17 = () => {
      const f_0 = frame.current;
      if (!f_0 || !live) {
        return;
      }
      const wheel = (e_3) => {
        if (!e_3.ctrlKey) {
          return;
        }
        e_3.preventDefault();
        const b_2 = f_0.getBoundingClientRect();
        zoomTo(zoom * Math.exp(-e_3.deltaY / 100), (e_3.clientX - b_2.left) / b_2.width, (e_3.clientY - b_2.top) / b_2.height);
      };
      f_0.addEventListener("wheel", wheel, {
        passive: false
      });
      return () => f_0.removeEventListener("wheel", wheel);
    };
    $[66] = live;
    $[67] = zoom;
    $[68] = zoomTo;
    $[69] = t17;
  } else {
    t17 = $[69];
  }
  React.useEffect(t17);
  const pct = _temp3;
  let t18;
  if ($[70] !== area || $[71] !== nat) {
    t18 = nat && area ? {
      width: pct(nat[0] / area.width),
      height: pct(nat[1] / area.height),
      left: pct(-area.x / area.width),
      top: pct(-area.y / area.height)
    } : void 0;
    $[70] = area;
    $[71] = nat;
    $[72] = t18;
  } else {
    t18 = $[72];
  }
  const imgStyle = t18;
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  const restyle = useServerStyles();
  let t19;
  if ($[73] !== nameRef || $[74] !== restyle) {
    t19 = (n_2) => {
      root.current = n_2;
      delegateFocus(n_2, () => frame.current);
      nameRef(n_2);
      restyle(n_2);
    };
    $[73] = nameRef;
    $[74] = restyle;
    $[75] = t19;
  } else {
    t19 = $[75];
  }
  const mergedRef = useMergedRef(ref, t19);
  const percent = _temp4;
  const t20 = disabled && "srp-image-cropper--disabled";
  let t21;
  if ($[76] !== props.className || $[77] !== t20) {
    t21 = cn("srp-image-cropper", t20, props.className);
    $[76] = props.className;
    $[77] = t20;
    $[78] = t21;
  } else {
    t21 = $[78];
  }
  const t22 = disabled ? "" : void 0;
  const t23 = props.style;
  const t24 = String(aspect);
  let t25;
  if ($[79] !== props.style || $[80] !== t24) {
    t25 = {
      ...t23,
      "--srp-image-cropper-aspect": t24
    };
    $[79] = props.style;
    $[80] = t24;
    $[81] = t25;
  } else {
    t25 = $[81];
  }
  const t26 = t25;
  const t27 = props.shape === "round" ? "round" : "rect";
  const t28 = failed ? "error" : area ? "ready" : "loading";
  const t29 = dragging || void 0;
  const t30 = live ? 0 : void 0;
  const t31 = live ? "application" : void 0;
  const t32 = live ? L.cropArea : void 0;
  const t33 = live ? base + "-how" : void 0;
  let t34;
  if ($[82] !== loaded) {
    t34 = (e_4) => loaded(e_4.currentTarget);
    $[82] = loaded;
    $[83] = t34;
  } else {
    t34 = $[83];
  }
  let t35;
  if ($[84] !== gen) {
    t35 = () => {
      read.current = gen;
      setFailed(true);
    };
    $[84] = gen;
    $[85] = t35;
  } else {
    t35 = $[85];
  }
  let t36;
  if ($[86] !== imgRef || $[87] !== imgStyle || $[88] !== props.crossOrigin || $[89] !== props.src || $[90] !== t34 || $[91] !== t35) {
    t36 = /* @__PURE__ */ React.createElement("img", { ref: imgRef, key: props.src, className: "srp-image-cropper__img", src: props.src, alt: "", draggable: false, crossOrigin: props.crossOrigin, style: imgStyle, onLoad: t34, onError: t35 });
    $[86] = imgRef;
    $[87] = imgStyle;
    $[88] = props.crossOrigin;
    $[89] = props.src;
    $[90] = t34;
    $[91] = t35;
    $[92] = t36;
  } else {
    t36 = $[92];
  }
  let t37;
  if ($[93] !== L.cropFailed || $[94] !== failed) {
    t37 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-image-cropper__fallback" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.BrokenImage }), L.cropFailed) : null;
    $[93] = L.cropFailed;
    $[94] = failed;
    $[95] = t37;
  } else {
    t37 = $[95];
  }
  let t38;
  let t39;
  if ($[96] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t38 = /* @__PURE__ */ React.createElement("span", { className: "srp-image-cropper__mask", "aria-hidden": "true" });
    t39 = /* @__PURE__ */ React.createElement("span", { className: "srp-image-cropper__grid", "aria-hidden": "true" });
    $[96] = t38;
    $[97] = t39;
  } else {
    t38 = $[96];
    t39 = $[97];
  }
  let t40;
  if ($[98] !== onDown || $[99] !== onKey || $[100] !== onMove || $[101] !== onUp || $[102] !== t27 || $[103] !== t28 || $[104] !== t29 || $[105] !== t30 || $[106] !== t31 || $[107] !== t32 || $[108] !== t33 || $[109] !== t36 || $[110] !== t37) {
    t40 = /* @__PURE__ */ React.createElement("div", { ref: frame, className: "srp-image-cropper__frame", "data-shape": t27, "data-state": t28, "data-dragging": t29, tabIndex: t30, role: t31, "aria-label": t32, "aria-describedby": t33, onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onKeyDown: onKey }, t36, t37, t38, t39);
    $[98] = onDown;
    $[99] = onKey;
    $[100] = onMove;
    $[101] = onUp;
    $[102] = t27;
    $[103] = t28;
    $[104] = t29;
    $[105] = t30;
    $[106] = t31;
    $[107] = t32;
    $[108] = t33;
    $[109] = t36;
    $[110] = t37;
    $[111] = t40;
  } else {
    t40 = $[111];
  }
  const t41 = base + "-how";
  let t42;
  if ($[112] !== L.cropHint || $[113] !== t41) {
    t42 = /* @__PURE__ */ React.createElement("span", { id: t41, hidden: true }, L.cropHint);
    $[112] = L.cropHint;
    $[113] = t41;
    $[114] = t42;
  } else {
    t42 = $[114];
  }
  let t43;
  if ($[115] !== L.cropZoom || $[116] !== L.cropZoomIn || $[117] !== L.cropZoomOut || $[118] !== failed || $[119] !== maxZoom || $[120] !== off || $[121] !== zoom || $[122] !== zoomTo) {
    t43 = failed ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-image-cropper__zoom" }, /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Remove, label: L.cropZoomOut, size: "sm", disabled: off || zoom <= 1, onClick: () => zoomTo(zoom - STEP) }), /* @__PURE__ */ React.createElement(Slider, { className: "srp-image-cropper__slider", size: "sm", "aria-label": L.cropZoom, min: 1, max: maxZoom, step: 0.01, largeStep: 10, value: zoom, disabled: off, formatValue: percent, onValueChange: (z_2) => zoomTo(z_2) }), /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Add, label: L.cropZoomIn, size: "sm", disabled: off || zoom >= maxZoom, onClick: () => zoomTo(zoom + STEP) }));
    $[115] = L.cropZoom;
    $[116] = L.cropZoomIn;
    $[117] = L.cropZoomOut;
    $[118] = failed;
    $[119] = maxZoom;
    $[120] = off;
    $[121] = zoom;
    $[122] = zoomTo;
    $[123] = t43;
  } else {
    t43 = $[123];
  }
  let t44;
  if ($[124] !== t40 || $[125] !== t42 || $[126] !== t43) {
    t44 = /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, t40, t42, t43);
    $[124] = t40;
    $[125] = t42;
    $[126] = t43;
    $[127] = t44;
  } else {
    t44 = $[127];
  }
  let t45;
  if ($[128] !== labelledBy || $[129] !== mergedRef || $[130] !== rest || $[131] !== t21 || $[132] !== t22 || $[133] !== t26 || $[134] !== t44) {
    t45 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, role: "group", "aria-labelledby": labelledBy, className: t21, "data-disabled": t22, "data-component": "image-cropper", style: t26 }, t44);
    $[128] = labelledBy;
    $[129] = mergedRef;
    $[130] = rest;
    $[131] = t21;
    $[132] = t22;
    $[133] = t26;
    $[134] = t44;
    $[135] = t45;
  } else {
    t45 = $[135];
  }
  return t45;
}
function _temp4(z_1) {
  return Math.round(z_1 * 100) + "%";
}
function _temp3(n_1) {
  return n_1 * 100 + "%";
}
function _temp2(t_0, p_1) {
  return t_0 + p_1.y;
}
function _temp(t, p_0) {
  return t + p_0.x;
}
var ImageCropper = /* @__PURE__ */ named("ImageCropper", ImageCropperRender);
export {
  ImageCropper,
  cropImage
};
//# sourceMappingURL=ImageCropper.js.map
