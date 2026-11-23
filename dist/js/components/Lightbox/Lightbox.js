"use client";

// src/components/Lightbox/Lightbox.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { useFocusHandover } from "../../internal/focus.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { quickArrival } from "../../internal/timing.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { isRtl } from "../../internal/position.js";
var SWIPE = 48;
function Stage(t0) {
  const $ = _c(19);
  const {
    item
  } = t0;
  const [state, setState] = React.useState("loading");
  const [own, setOwn] = React.useState(null);
  const since = React.useRef(0);
  let t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      since.current = performance.now();
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  React.useEffect(t1, t2);
  const [fades, setFades] = React.useState(false);
  let t3;
  if ($[2] !== item.height || $[3] !== item.width) {
    t3 = item.width && item.height ? [item.width, item.height] : null;
    $[2] = item.height;
    $[3] = item.width;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const given = t3;
  let t4;
  if ($[5] !== given || $[6] !== own) {
    t4 = own || given || [4, 3];
    $[5] = given;
    $[6] = own;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const [w, h] = t4;
  const t5 = fades || void 0;
  const t6 = w + " / " + h;
  const t7 = own || given ? w + "px" : "100%";
  let t8;
  if ($[8] !== t6 || $[9] !== t7) {
    t8 = {
      "--srp-lightbox-ratio": t6,
      "--srp-lightbox-w": t7
    };
    $[8] = t6;
    $[9] = t7;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  const t9 = t8;
  let t10;
  if ($[11] !== item.src || $[12] !== state) {
    t10 = state === "error" ? /* @__PURE__ */ React.createElement("span", { className: "srp-lightbox__fallback", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.BrokenImage })) : /* @__PURE__ */ React.createElement("img", { src: item.src, alt: "", className: "srp-lightbox__img", decoding: "async", onLoad: (e) => {
      const i = e.currentTarget;
      if (i.naturalWidth > 0) {
        setOwn([i.naturalWidth, i.naturalHeight]);
      }
      setFades(performance.now() - since.current > quickArrival);
      setState("loaded");
    }, onError: () => setState("error") });
    $[11] = item.src;
    $[12] = state;
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  let t11;
  if ($[14] !== state || $[15] !== t10 || $[16] !== t5 || $[17] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("span", { className: "srp-lightbox__stage", "data-state": state, "data-fades": t5, style: t9 }, t10);
    $[14] = state;
    $[15] = t10;
    $[16] = t5;
    $[17] = t9;
    $[18] = t11;
  } else {
    t11 = $[18];
  }
  return t11;
}
function LightboxRender(t0) {
  const $ = _c(30);
  const {
    ref,
    ...props
  } = t0;
  const {
    items,
    open: openProp,
    defaultOpen,
    onOpenChange,
    index: indexProp,
    defaultIndex,
    onIndexChange,
    loop,
    className,
    ...rest
  } = props;
  const sds = useSettings(words);
  const [ownOpen, setOwnOpen] = React.useState(!!defaultOpen);
  const [ownIndex, setOwnIndex] = React.useState(defaultIndex || 0);
  const open = openProp ?? ownOpen;
  const count = items.length;
  const index = Math.min(Math.max(0, indexProp ?? ownIndex), Math.max(0, count - 1));
  const item = items[index];
  const root = React.useRef(null);
  const restyle = useServerStyles(root);
  const setOpen = (o, d) => {
    if (openProp === void 0) {
      setOwnOpen(o);
    }
    if (onOpenChange) {
      onOpenChange(o, d);
    }
  };
  const go = (to) => {
    const next = loop ? (to % count + count) % count : Math.min(Math.max(0, to), count - 1);
    if (next === index || !count) {
      return;
    }
    if (indexProp === void 0) {
      setOwnIndex(next);
    }
    if (onIndexChange) {
      onIndexChange(next);
    }
  };
  const said = React.useRef(null);
  React.useEffect(() => {
    if (!open || !item) {
      said.current = null;
      return;
    }
    if (said.current != null && said.current !== index) {
      announce(item.alt + ", " + sds.labels.imageOf(index + 1, count));
    }
    said.current = index;
  }, [open, index, item, count, sds.labels]);
  React.useEffect(() => {
    if (!open || count < 2) {
      return;
    }
    for (const i of [index + 1, index - 1]) {
      const near = items[loop ? (i + count) % count : i];
      if (near && near !== item) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = near.src;
      }
    }
  }, [open, index, items, item, count, loop]);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => !!root.current && isRtl(root.current);
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const rtl = t1;
  const [dir, setDir] = React.useState("ltr");
  let t2;
  if ($[1] !== dir) {
    t2 = () => {
      const d_0 = rtl() ? "rtl" : "ltr";
      if (d_0 !== dir) {
        setDir(d_0);
      }
    };
    $[1] = dir;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  useIsoLayoutEffect(t2);
  const onKeyDown = (e) => {
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    const back = rtl() ? "ArrowRight" : "ArrowLeft";
    const fwd = rtl() ? "ArrowLeft" : "ArrowRight";
    if (e.key === back) {
      go(index - 1);
    } else {
      if (e.key === fwd) {
        go(index + 1);
      } else {
        if (e.key === "Home") {
          go(0);
        } else {
          if (e.key === "End") {
            go(count - 1);
          } else {
            return;
          }
        }
      }
    }
    e.preventDefault();
  };
  const start = React.useRef(null);
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (e_0) => {
      start.current = e_0.pointerType === "mouse" || !e_0.isPrimary ? null : {
        x: e_0.clientX,
        y: e_0.clientY
      };
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const onPointerDown = t3;
  const onPointerUp = (e_1) => {
    const s = start.current;
    start.current = null;
    if (!s) {
      return;
    }
    const dx = e_1.clientX - s.x;
    const dy = e_1.clientY - s.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 2) {
      return;
    }
    const forward = dx < 0 !== rtl();
    go(index + (forward ? 1 : -1));
  };
  const first = !loop && index === 0;
  const last = !loop && index === count - 1;
  const countId = React.useId();
  const handover = useFocusHandover();
  const prevNav = React.useRef(null);
  const nextNav = React.useRef(null);
  const prevIcon = dir === "rtl" ? icons.ChevronRight : icons.ChevronLeft;
  const nextIcon = dir === "rtl" ? icons.ChevronLeft : icons.ChevronRight;
  const T0 = Dialog;
  const t4 = open && !!item;
  const t5 = "lg";
  const t6 = item ? item.alt : void 0;
  const t7 = rest["aria-describedby"] || (count > 1 ? countId : void 0);
  const t8 = cn("srp-lightbox", className);
  let t9;
  if ($[4] !== count || $[5] !== countId || $[6] !== first || $[7] !== go || $[8] !== handover || $[9] !== index || $[10] !== item || $[11] !== last || $[12] !== nextIcon || $[13] !== onPointerDown || $[14] !== onPointerUp || $[15] !== prevIcon || $[16] !== restyle || $[17] !== sds.labels) {
    t9 = item ? /* @__PURE__ */ React.createElement("div", { ref: restyle, className: "srp-lightbox__body", "data-index": index, onPointerDown, onPointerUp, onPointerCancel: () => {
      start.current = null;
    } }, /* @__PURE__ */ React.createElement("figure", { className: "srp-lightbox__figure" }, /* @__PURE__ */ React.createElement(Stage, { key: item.src, item }), item.caption != null ? /* @__PURE__ */ React.createElement("figcaption", { className: "srp-lightbox__caption" }, item.caption) : null), count > 1 ? /* @__PURE__ */ React.createElement("div", { className: "srp-lightbox__nav" }, /* @__PURE__ */ React.createElement(IconButton, { icon: prevIcon, label: sds.labels.previousImage, variant: "secondary", shape: "round", ref: prevNav, disabled: first, onClick: (e_2) => {
      handover(e_2.currentTarget, () => nextNav.current);
      go(index - 1);
    } }), /* @__PURE__ */ React.createElement("span", { className: "srp-lightbox__count", id: countId }, sds.labels.imageOf(index + 1, count)), /* @__PURE__ */ React.createElement(IconButton, { icon: nextIcon, label: sds.labels.nextImage, variant: "secondary", shape: "round", ref: nextNav, disabled: last, onClick: (e_3) => {
      handover(e_3.currentTarget, () => prevNav.current);
      go(index + 1);
    } })) : null) : null;
    $[4] = count;
    $[5] = countId;
    $[6] = first;
    $[7] = go;
    $[8] = handover;
    $[9] = index;
    $[10] = item;
    $[11] = last;
    $[12] = nextIcon;
    $[13] = onPointerDown;
    $[14] = onPointerUp;
    $[15] = prevIcon;
    $[16] = restyle;
    $[17] = sds.labels;
    $[18] = t9;
  } else {
    t9 = $[18];
  }
  let t10;
  if ($[19] !== T0 || $[20] !== onKeyDown || $[21] !== ref || $[22] !== rest || $[23] !== setOpen || $[24] !== t4 || $[25] !== t6 || $[26] !== t7 || $[27] !== t8 || $[28] !== t9) {
    t10 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, onKeyDown, open: t4, onOpenChange: setOpen, size: t5, title: t6, "aria-describedby": t7, className: t8, "data-component": "lightbox" }, t9);
    $[19] = T0;
    $[20] = onKeyDown;
    $[21] = ref;
    $[22] = rest;
    $[23] = setOpen;
    $[24] = t4;
    $[25] = t6;
    $[26] = t7;
    $[27] = t8;
    $[28] = t9;
    $[29] = t10;
  } else {
    t10 = $[29];
  }
  return t10;
}
var Lightbox = /* @__PURE__ */ named("Lightbox", LightboxRender);
export {
  Lightbox
};
//# sourceMappingURL=Lightbox.js.map
