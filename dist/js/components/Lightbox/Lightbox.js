"use client";

// src/components/Lightbox/Lightbox.tsx
import * as React from "react";
import { cn, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
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
var SWIPE = 48;
function Stage({ item }) {
  const [state, setState] = React.useState("loading");
  const [own, setOwn] = React.useState(null);
  const since = React.useRef(0);
  React.useEffect(() => {
    since.current = performance.now();
  }, []);
  const [fades, setFades] = React.useState(false);
  const given = item.width && item.height ? [item.width, item.height] : null;
  const [w, h] = own || given || [4, 3];
  return /* @__PURE__ */ React.createElement("span", { className: "dk-lightbox__stage", "data-state": state, "data-fades": fades || void 0, style: { "--dk-lightbox-ratio": w + " / " + h, "--dk-lightbox-w": own || given ? w + "px" : "100%" } }, state === "error" ? /* @__PURE__ */ React.createElement("span", { className: "dk-lightbox__fallback", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.BrokenImage })) : /* @__PURE__ */ React.createElement(
    "img",
    {
      src: item.src,
      alt: "",
      className: "dk-lightbox__img",
      decoding: "async",
      onLoad: (e) => {
        const i = e.currentTarget;
        if (i.naturalWidth > 0) setOwn([i.naturalWidth, i.naturalHeight]);
        setFades(performance.now() - since.current > quickArrival);
        setState("loaded");
      },
      onError: () => setState("error")
    }
  ));
}
var Lightbox = /* @__PURE__ */ component("Lightbox", function Lightbox2(props, ref) {
  const { items, open: openProp, defaultOpen, onOpenChange, index: indexProp, defaultIndex, onIndexChange, loop, className, ...rest } = props;
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
    if (openProp === void 0) setOwnOpen(o);
    if (onOpenChange) onOpenChange(o, d);
  };
  const go = (to) => {
    const next = loop ? (to % count + count) % count : Math.min(Math.max(0, to), count - 1);
    if (next === index || !count) return;
    if (indexProp === void 0) setOwnIndex(next);
    if (onIndexChange) onIndexChange(next);
  };
  const said = React.useRef(null);
  React.useEffect(() => {
    if (!open || !item) {
      said.current = null;
      return;
    }
    if (said.current != null && said.current !== index) announce(item.alt + ", " + sds.labels.imageOf(index + 1, count));
    said.current = index;
  }, [open, index, item, count, sds.labels]);
  React.useEffect(() => {
    if (!open || count < 2) return;
    for (const i of [index + 1, index - 1]) {
      const near = items[loop ? (i + count) % count : i];
      if (near && near !== item) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = near.src;
      }
    }
  }, [open, index, items, item, count, loop]);
  const rtl = () => !!root.current && getComputedStyle(root.current).direction === "rtl";
  const [dir, setDir] = React.useState("ltr");
  useIsoLayoutEffect(() => {
    const d = rtl() ? "rtl" : "ltr";
    if (d !== dir) setDir(d);
  });
  const onKeyDown = (e) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const back = rtl() ? "ArrowRight" : "ArrowLeft", fwd = rtl() ? "ArrowLeft" : "ArrowRight";
    if (e.key === back) go(index - 1);
    else if (e.key === fwd) go(index + 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(count - 1);
    else return;
    e.preventDefault();
  };
  const start = React.useRef(null);
  const onPointerDown = (e) => {
    start.current = e.pointerType === "mouse" || !e.isPrimary ? null : { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 2) return;
    const forward = dx < 0 !== rtl();
    go(index + (forward ? 1 : -1));
  };
  const first = !loop && index === 0, last = !loop && index === count - 1;
  const handover = useFocusHandover();
  const prevNav = React.useRef(null), nextNav = React.useRef(null);
  const prevIcon = dir === "rtl" ? icons.ChevronRight : icons.ChevronLeft, nextIcon = dir === "rtl" ? icons.ChevronLeft : icons.ChevronRight;
  return /* @__PURE__ */ React.createElement(
    Dialog,
    {
      ...rest,
      ref,
      onKeyDown,
      open: open && !!item,
      onOpenChange: setOpen,
      size: "lg",
      title: item ? item.alt : void 0,
      description: count > 1 ? sds.labels.imageOf(index + 1, count) : void 0,
      className: cn("dk-lightbox", className),
      "data-component": "lightbox"
    },
    item ? /* @__PURE__ */ React.createElement("div", { ref: restyle, className: "dk-lightbox__body", "data-index": index, onPointerDown, onPointerUp, onPointerCancel: () => {
      start.current = null;
    } }, /* @__PURE__ */ React.createElement("figure", { className: "dk-lightbox__figure" }, /* @__PURE__ */ React.createElement(Stage, { key: item.src, item }), item.caption != null ? /* @__PURE__ */ React.createElement("figcaption", { className: "dk-lightbox__caption" }, item.caption) : null), count > 1 ? /* @__PURE__ */ React.createElement("div", { className: "dk-lightbox__nav" }, /* @__PURE__ */ React.createElement(IconButton, { icon: prevIcon, label: sds.labels.previousImage, variant: "secondary", shape: "round", ref: prevNav, disabled: first, onClick: (e) => {
      handover(e.currentTarget, () => nextNav.current);
      go(index - 1);
    } }), /* @__PURE__ */ React.createElement("span", { className: "dk-lightbox__count", "aria-hidden": "true" }, sds.labels.imageOf(index + 1, count)), /* @__PURE__ */ React.createElement(IconButton, { icon: nextIcon, label: sds.labels.nextImage, variant: "secondary", shape: "round", ref: nextNav, disabled: last, onClick: (e) => {
      handover(e.currentTarget, () => prevNav.current);
      go(index + 1);
    } })) : null) : null
  );
});
export {
  Lightbox
};
//# sourceMappingURL=Lightbox.js.map
