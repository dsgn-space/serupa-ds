"use client";

// src/components/Image/Image.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, useMergedRef } from "../../internal/cn.js";
import { mediaList } from "../../internal/mediaList.js";
import { removeAndRefocus } from "../../internal/removeFocus.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { schemeOf, useThemeChanges } from "../../internal/scheme.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { quickArrival } from "../../internal/timing.js";
var RATIOS = ["auto", "square", "4:3", "video"];
var never = () => () => {
};
var yes = () => true;
var no = () => false;
function autoSizes(lazy, srcSet, sizes) {
  if (!lazy || !/\dw\s*(,|$)/.test(srcSet || "") || /^\s*auto\b/i.test(sizes || "")) return sizes;
  return sizes ? "auto, " + sizes : "auto";
}
function largest(srcSet, least) {
  let best, most = 0;
  for (const m of (srcSet || "").matchAll(/(?:^|,)\s*(\S+?)\s+(\d+(?:\.\d+)?)[wx]\s*(?=,|$)/g)) if (!best || (least ? Number(m[2]) < most : Number(m[2]) > most)) {
    most = Number(m[2]);
    best = m[1] ?? "";
  }
  return best;
}
function shownDark(i, darkSrc) {
  return i && darkSrc && i.currentSrc && i.currentSrc === new URL(darkSrc, document.baseURI).href ? darkSrc : void 0;
}
var REDUCED = "(prefers-reduced-data: reduce)";
var connection = () => navigator.connection;
var reducedData = () => mediaList(REDUCED);
var savingData = () => {
  const m = reducedData();
  return !!(connection() || {}).saveData || !!(m && m.matches);
};
var dataTold = /* @__PURE__ */ new Set();
var dataHeard = false;
function onSaveData(f) {
  if (!dataHeard) {
    dataHeard = true;
    const c = connection(), m = reducedData(), tell = () => dataTold.forEach((g) => g());
    if (c) c.addEventListener("change", tell);
    if (m) m.addEventListener("change", tell);
  }
  dataTold.add(f);
  return () => {
    dataTold.delete(f);
  };
}
function Full(t0) {
  const $ = _c(18);
  const {
    src,
    alt,
    fallback,
    shape
  } = t0;
  const [state, setState] = React.useState("loading");
  const [own, setOwn] = React.useState(null);
  let t1;
  if ($[0] !== own || $[1] !== shape) {
    t1 = own || shape || [4, 3];
    $[0] = own;
    $[1] = shape;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const [w, h] = t1;
  const t2 = "srp-image--" + state;
  let t3;
  if ($[3] !== t2) {
    t3 = cn("srp-image__stage", t2);
    $[3] = t2;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const t4 = w + " / " + h;
  const t5 = own || shape ? w + "px" : "100%";
  let t6;
  if ($[5] !== t4 || $[6] !== t5) {
    t6 = {
      "--srp-image-ratio": t4,
      "--srp-image-w": t5
    };
    $[5] = t4;
    $[6] = t5;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  const t7 = t6;
  let t8;
  if ($[8] !== alt || $[9] !== fallback || $[10] !== src || $[11] !== state) {
    t8 = state === "error" ? /* @__PURE__ */ React.createElement("span", { className: "srp-image__fallback", role: alt ? "img" : void 0, "aria-label": alt || void 0, "aria-hidden": alt ? void 0 : true }, fallback != null ? fallback : /* @__PURE__ */ React.createElement(Icon, { icon: icons.BrokenImage })) : /* @__PURE__ */ React.createElement("img", { src, alt: "", className: "srp-image__full", decoding: "async", onLoad: (e) => {
      const i = e.currentTarget;
      if (i.naturalWidth > 0) {
        setOwn([i.naturalWidth, i.naturalHeight]);
      }
      setState("loaded");
    }, onError: () => setState("error") });
    $[8] = alt;
    $[9] = fallback;
    $[10] = src;
    $[11] = state;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  let t9;
  if ($[13] !== state || $[14] !== t3 || $[15] !== t7 || $[16] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("span", { className: t3, "data-state": state, style: t7 }, t8);
    $[13] = state;
    $[14] = t3;
    $[15] = t7;
    $[16] = t8;
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  return t9;
}
function ImageRender({
  ref,
  ...props
}) {
  const frame = React.useRef(null);
  const restyle = useServerStyles(frame);
  const sds = useSettings(words);
  const {
    src,
    alt,
    ratio: _r,
    fit: _f,
    rounded,
    fallback,
    viewable,
    fullSrc,
    viewLabel,
    onRemove,
    removeLabel,
    frameProps,
    className,
    onLoad,
    onError,
    loading,
    priority,
    decoding,
    fetchPriority,
    sources,
    sizes,
    darkSrc,
    dim,
    ...rest
  } = props;
  const thrifty = React.useSyncExternalStore(onSaveData, savingData, no);
  const load = thrifty && !priority ? "lazy" : loading || (priority ? "eager" : "lazy");
  const lazy = load === "lazy";
  const small = (srcSet) => thrifty ? largest(srcSet, true) : void 0;
  const least = (srcSet_0) => small(srcSet_0) || srcSet_0;
  const sizing = (srcSet_1, given) => small(srcSet_1) ? void 0 : autoSizes(lazy, srcSet_1, given);
  const ratio = typeof props.ratio === "number" && props.ratio > 0 ? props.ratio : oneOf(RATIOS, props.ratio, "auto");
  const fit = oneOf(["cover", "contain"], props.fit, "cover");
  const [state, setState] = React.useState("loading");
  const [open, setOpen] = React.useState(false);
  const img = React.useRef(null);
  const mergedRef = useMergedRef(ref, (n) => {
    img.current = n;
  });
  const [live, setLive] = React.useState(false);
  const since = React.useRef(0);
  const served = React.useRef(React.useSyncExternalStore(never, yes, no) ? null : src);
  React.useEffect(() => {
    setState("loading");
  }, [src]);
  const listening = React.useRef(false);
  React.useEffect(() => {
    const i = img.current, first = !listening.current;
    listening.current = true;
    const choosing = i && !i.currentSrc && !i.naturalWidth && (i.srcset || i.parentElement && i.parentElement.tagName === "PICTURE");
    if (first && i && i.complete && !choosing) {
      setState(i.naturalWidth > 0 ? "loaded" : "error");
      return;
    }
    since.current = performance.now();
    if (served.current === src) return;
    const f = requestAnimationFrame(() => {
      if (img.current && !img.current.complete) setLive(true);
    });
    return () => cancelAnimationFrame(f);
  }, [src]);
  const themes = useThemeChanges(!!darkSrc);
  const [scheme, setScheme] = React.useState(null);
  React.useEffect(() => {
    if (darkSrc && frame.current) setScheme(schemeOf(frame.current));
  }, [darkSrc, themes]);
  const arrived = () => {
    if (performance.now() - since.current < quickArrival) setLive(false);
  };
  const named2 = (base) => alt ? base + ": " + alt : base;
  const w = Number(props.width), h = Number(props.height);
  const sized = ratio === "auto" && w > 0 && h > 0;
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && ratio === "auto" && !sized) warnOnce("image-size", `Image: with ratio "auto" and no width and height, the frame has no height until the picture loads, so the page jumps. Pass the picture's width and height, or a ratio.`);
  }, [ratio, sized]);
  const fill = ratio !== "auto" && !className && !rest.style;
  const shape = typeof ratio === "number" ? {
    "--srp-image-ratio": String(ratio)
  } : sized ? {
    "--srp-image-ratio": w + " / " + h,
    width: w
  } : null;
  const frameStyle = shape ? {
    ...shape,
    ...frameProps && frameProps.style
  } : frameProps && frameProps.style;
  const failed = state === "error" ? /* @__PURE__ */ React.createElement("span", { className: "srp-image__fallback", role: alt ? "img" : void 0, "aria-label": alt || void 0, "aria-hidden": alt ? void 0 : true }, fallback != null ? fallback : /* @__PURE__ */ React.createElement(Icon, { icon: icons.BrokenImage })) : null;
  const picture = /* @__PURE__ */ React.createElement("img", { ...rest, ref: mergedRef, src, alt, loading: load, srcSet: least(rest.srcSet), sizes: sizing(rest.srcSet, sizes), decoding: decoding || "async", fetchPriority: fetchPriority || (priority ? "high" : void 0), className: cn("srp-image__img", className), onLoad: (e) => {
    arrived();
    setState("loaded");
    if (onLoad) onLoad(e);
  }, onError: (e_0) => {
    setLive(false);
    setState("error");
    if (onError) onError(e_0);
  } });
  const shown = sources && sources.length || darkSrc ? /* @__PURE__ */ React.createElement("picture", { className: "srp-image__picture" }, darkSrc ? /* @__PURE__ */ React.createElement("source", { srcSet: darkSrc, media: scheme === "dark" ? "all" : scheme === "light" ? "not all" : "(prefers-color-scheme: dark)" }) : null, (sources || []).map((o, k) => /* @__PURE__ */ React.createElement("source", { key: k, srcSet: least(o.srcSet), media: o.media, type: o.type, sizes: sizing(o.srcSet, o.sizes), width: o.width, height: o.height })), picture) : picture;
  return /* @__PURE__ */ React.createElement("span", { ...frameProps, ref: restyle, style: frameStyle, className: cn("srp-image", "srp-image--ratio-" + (typeof ratio === "number" ? "custom" : ratio.replace(":", "-")), sized && "srp-image--sized", fill && "srp-image--fill", "srp-image--" + fit, dim && "srp-image--dim", rounded !== false && "srp-image--rounded", "srp-image--" + state, live && !priority && "srp-image--fades", frameProps && frameProps.className), "data-component": "image", "data-state": state }, viewable && state !== "error" ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-image__view", "aria-label": viewLabel || named2(sds.labels.viewImage), "aria-haspopup": "dialog", onClick: () => setOpen(true) }, shown) : shown, failed, onRemove ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-image__remove", icon: icons.Close, label: removeLabel || named2(sds.labels.removeImage), size: "sm", variant: "secondary", shape: "round", hideTitle: true, onClick: (e_1) => removeAndRefocus(e_1, onRemove, ".srp-image", ".srp-image__remove") }) : null, viewable ? /* @__PURE__ */ React.createElement(Dialog, { open, onOpenChange: setOpen, size: "lg", title: alt || void 0, "aria-label": alt ? void 0 : viewLabel || sds.labels.image, className: "srp-image__viewer" }, open ? /* @__PURE__ */ React.createElement(Full, { src: fullSrc || shownDark(img.current, darkSrc) || largest(rest.srcSet) || src, alt, fallback, shape: w > 0 && h > 0 ? [w, h] : img.current && img.current.naturalWidth > 0 ? [img.current.naturalWidth, img.current.naturalHeight] : null }) : null) : null);
}
var Image = /* @__PURE__ */ named("Image", ImageRender);
export {
  Image
};
//# sourceMappingURL=Image.js.map
