"use client";

// src/components/Drawer/Drawer.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Discard } from "../Dialog/Dialog.js";
import { useModalDialog } from "../../internal/useModalDialog.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { wasDismissal } from "../../internal/layers.js";
import * as icons from "../../material/builtin.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { isComposing } from "../../internal/ime.js";
import { useCloseWatcher } from "../../internal/closeWatcher.js";
import { isRtl } from "../../internal/position.js";
import { project, rubber, settleTime, speed, track } from "../../internal/fling.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { reflow } from "../../internal/reflow.js";
import { en as words } from "./labels.js";
var FLICK = 0.2;
var INWARD = 24;
var OWN = {
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  placement: 1,
  size: 1,
  title: 1,
  description: 1,
  footer: 1,
  closeButton: 1,
  closeLabel: 1,
  closeOnBackdrop: 1,
  modal: 1,
  swipeToClose: 1,
  initialFocus: 1,
  finalFocus: 1,
  unsaved: 1,
  snapPoints: 1,
  snap: 1,
  defaultSnap: 1,
  onSnapChange: 1,
  className: 1,
  children: 1
};
function DrawerRender({
  ref,
  ...props
}) {
  const nameRef = useNameCheck("Drawer", NAME_HOW.title);
  const sds = useSettings(words);
  const restyle = useServerStyles();
  const rest = omit(props, OWN);
  const base = domId("srp-drw", React.useId());
  const side = oneOf(["end", "start", "top", "bottom"], props.placement, "end");
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const showClose = props.closeButton !== false;
  const snaps = side === "bottom" && props.snapPoints ? props.snapPoints.filter((n) => n > 0 && n <= 1).slice().sort((a, b) => a - b) : [];
  const [ownSnap, setOwnSnap] = React.useState(props.defaultSnap ?? 0);
  const snapAt = snaps.length ? Math.min(Math.max(0, Math.round(props.snap ?? ownSnap)), snaps.length - 1) : 0;
  const toSnap = (i) => {
    if (i === snapAt) return;
    if (props.snap === void 0) setOwnSnap(i);
    if (props.onSnapChange) props.onSnapChange(i);
  };
  const modal = props.modal !== false;
  const backdrop = modal && props.closeOnBackdrop !== false;
  const {
    dialogRef,
    open,
    close,
    request,
    asking,
    setAsking,
    arrivedRef,
    unsavedRef,
    onCancel,
    onClose
  } = useModalDialog({
    name: "Drawer",
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    initialFocus: props.initialFocus,
    finalFocus: props.finalFocus,
    unsaved: props.unsaved,
    modal,
    onCancel: rest.onCancel,
    onClose: rest.onClose
  });
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOwnSnap(props.defaultSnap ?? 0);
  }
  const has = (n_0) => n_0 != null && n_0 !== false && n_0 !== "";
  const onKeyDown = (e) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (modal || e.defaultPrevented || e.key !== "Escape" || isComposing(e)) return;
    if (e.target instanceof Element && e.target.closest("dialog") !== e.currentTarget) return;
    e.preventDefault();
    request("escape");
  };
  useCloseWatcher(open && !modal && !asking, () => request("escape"), true);
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e_0) => {
    if (rest.onPointerDown) rest.onPointerDown(e_0);
    downOnBackdrop.current = e_0.target === e_0.currentTarget && !wasDismissal(e_0.nativeEvent);
  };
  const swipe = props.swipeToClose !== false;
  const horiz = side !== "top" && side !== "bottom";
  const settling = React.useRef(null);
  const shift = (d, away) => horiz ? d * away + "px 0" : "0 " + d * away + "px";
  const drag = React.useRef(null);
  const onSwipeDown = (e_1) => {
    const t = e_1.target;
    if (!swipe && !snaps.length || e_1.pointerType !== "touch" || !e_1.isPrimary || t.closest("input, textarea, select, [contenteditable]")) return;
    if (!horiz && t.closest(".srp-drawer__body")) return;
    const away_0 = side === "start" || side === "end" ? side === "end" !== isRtl(e_1.currentTarget) ? 1 : -1 : side === "bottom" ? 1 : -1;
    drag.current = {
      id: e_1.pointerId,
      x: e_1.clientX,
      y: e_1.clientY,
      d: 0,
      at: 0,
      on: false,
      s: [{
        t: e_1.timeStamp,
        p: 0
      }],
      away: away_0
    };
  };
  const sheetPx = (i_0) => snaps[i_0] * (dialogRef.current ? dialogRef.current.clientHeight : window.innerHeight);
  const sheetMove = (p, g) => {
    const low = sheetPx(0), high = sheetPx(snaps.length - 1), h = sheetPx(snapAt) - g.d;
    g.at = h >= low ? 0 : swipe ? low - h : rubber(low - h, INWARD);
    p.style.height = (h > high ? high - rubber(high - h, INWARD) : Math.max(h, low)) + "px";
    p.style.translate = g.at ? shift(g.at, g.away) : "";
  };
  const glide = (p_0, from, at, to, v, done) => {
    const tall = Math.max(from, to), dist = Math.abs(to - from) + at;
    p_0.style.transition = "none";
    p_0.style.height = tall + "px";
    p_0.style.translate = shift(tall - from + at, 1);
    p_0.style.setProperty("--srp-drawer-settle", settleTime(dist, Math.abs(v)) + "ms");
    reflow(p_0);
    p_0.style.transition = "";
    p_0.dataset.settling = "";
    const finish = () => {
      delete p_0.dataset.settling;
      p_0.style.height = "";
      p_0.style.translate = "";
      done();
    };
    if (!dist || !parseFloat(getComputedStyle(p_0).transitionDuration)) {
      finish();
      return;
    }
    const end = (ev) => {
      if (ev.target === p_0 && ev.propertyName === "translate") {
        stop();
        finish();
      }
    };
    const stop = () => {
      p_0.removeEventListener("transitionend", end);
      delete p_0.dataset.settling;
      settling.current = null;
    };
    p_0.addEventListener("transitionend", end);
    settling.current = stop;
    p_0.style.translate = tall - to ? shift(tall - to, 1) : "";
  };
  const sheetEnd = (p_1, g_0, v_0, released) => {
    const low_0 = sheetPx(0), h_0 = sheetPx(snapAt) - g_0.d, rest_0 = h_0 - (released ? project(v_0) : 0);
    const out = swipe && released && h_0 < low_0 && (v_0 > FLICK || rest_0 < low_0 * 2 / 3);
    if (!out) {
      let to_0 = snapAt;
      snaps.forEach((_, i_1) => {
        if (Math.abs(sheetPx(i_1) - rest_0) < Math.abs(sheetPx(to_0) - rest_0)) to_0 = i_1;
      });
      glide(p_1, p_1.offsetHeight, g_0.at, sheetPx(to_0), v_0, () => {
      });
      toSnap(to_0);
      return;
    }
    const done_0 = () => {
      delete p_1.dataset.settling;
      if (unsavedRef.current) {
        p_1.style.height = "";
        p_1.style.translate = "";
        request("swipe");
        return;
      }
      close("swipe");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!drag.current) {
          p_1.style.height = "";
          p_1.style.translate = "";
        }
      }));
    };
    const dist_0 = p_1.offsetHeight - g_0.at;
    p_1.style.setProperty("--srp-drawer-settle", settleTime(dist_0, Math.abs(v_0)) + "ms");
    p_1.dataset.settling = "";
    if (!dist_0 || !parseFloat(getComputedStyle(p_1).transitionDuration)) {
      done_0();
      return;
    }
    const end_0 = (ev_0) => {
      if (ev_0.target === p_1 && ev_0.propertyName === "translate") {
        stop_0();
        done_0();
      }
    };
    const stop_0 = () => {
      p_1.removeEventListener("transitionend", end_0);
      delete p_1.dataset.settling;
      settling.current = null;
    };
    p_1.addEventListener("transitionend", end_0);
    settling.current = stop_0;
    p_1.style.translate = shift(p_1.offsetHeight, g_0.away);
  };
  const panel = React.useRef(null);
  const onHandle = () => {
    const i_2 = snapAt < snaps.length - 1 ? snapAt + 1 : 0, p_2 = panel.current;
    if (p_2 && props.snap === void 0) {
      if (settling.current) settling.current();
      glide(p_2, p_2.offsetHeight, 0, sheetPx(i_2), 0, () => {
      });
    }
    toSnap(i_2);
  };
  const onSwipeMove = (e_2) => {
    const g_1 = drag.current;
    if (!g_1 || e_2.pointerId !== g_1.id) return;
    const d_0 = (horiz ? e_2.clientX - g_1.x : e_2.clientY - g_1.y) * g_1.away, across = Math.abs(horiz ? e_2.clientY - g_1.y : e_2.clientX - g_1.x);
    if (!g_1.on) {
      if (across > 10 && across > Math.abs(d_0)) {
        drag.current = null;
        return;
      }
      if (Math.abs(d_0) < 10) return;
      g_1.on = true;
      e_2.currentTarget.setAttribute("data-dragging", "");
      try {
        e_2.currentTarget.setPointerCapture(e_2.pointerId);
      } catch {
      }
      if (settling.current) settling.current();
    }
    g_1.d = d_0;
    track(g_1.s, e_2.timeStamp, d_0);
    if (snaps.length) {
      sheetMove(e_2.currentTarget, g_1);
      return;
    }
    g_1.at = d_0 >= 0 ? d_0 : rubber(d_0, INWARD);
    e_2.currentTarget.style.translate = shift(g_1.at, g_1.away);
    e_2.currentTarget.toggleAttribute("data-inward", g_1.at < 0);
  };
  const onSwipeEnd = (e_3) => {
    const g_2 = drag.current;
    if (!g_2 || e_3.pointerId !== g_2.id) return;
    drag.current = null;
    const p_3 = e_3.currentTarget, size_0 = horiz ? p_3.offsetWidth : p_3.offsetHeight;
    p_3.removeAttribute("data-dragging");
    if (!g_2.on) {
      p_3.style.translate = "";
      delete p_3.dataset.inward;
      return;
    }
    const v_1 = speed(g_2.s);
    if (snaps.length) {
      sheetEnd(p_3, g_2, v_1, e_3.type === "pointerup");
      return;
    }
    const out_0 = e_3.type === "pointerup" && (v_1 > FLICK || g_2.d + project(v_1) > size_0 / 3 && v_1 > -0.1);
    const left = out_0 ? size_0 - g_2.at : Math.abs(g_2.at);
    const done_1 = () => {
      delete p_3.dataset.settling;
      delete p_3.dataset.inward;
      if (!out_0) {
        p_3.style.translate = "";
        return;
      }
      if (unsavedRef.current) {
        p_3.style.translate = "";
        request("swipe");
        return;
      }
      close("swipe");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!drag.current) p_3.style.translate = "";
      }));
    };
    p_3.style.setProperty("--srp-drawer-settle", settleTime(left, (out_0 ? v_1 : -v_1) > 0 ? v_1 : 0) + "ms");
    p_3.dataset.settling = "";
    if (!left || !parseFloat(getComputedStyle(p_3).transitionDuration)) {
      done_1();
      return;
    }
    const end_1 = (ev_1) => {
      if (ev_1.target === p_3 && ev_1.propertyName === "translate") {
        stop_1();
        done_1();
      }
    };
    const stop_1 = () => {
      p_3.removeEventListener("transitionend", end_1);
      delete p_3.dataset.settling;
      settling.current = null;
    };
    p_3.addEventListener("transitionend", end_1);
    settling.current = stop_1;
    p_3.style.translate = out_0 ? shift(size_0, g_2.away) : "";
  };
  const onClick = (e_4) => {
    if (rest.onClick) rest.onClick(e_4);
    if (backdrop && downOnBackdrop.current && e_4.target === e_4.currentTarget && !wasDismissal(e_4.nativeEvent)) request("outside");
    downOnBackdrop.current = false;
  };
  const [body, setBody] = React.useState(null);
  const scrolls = useScrolls(body);
  const named2 = rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0);
  const region = !scrolls ? {} : named2 ? {
    tabIndex: 0,
    role: "region",
    "aria-labelledby": named2
  } : rest["aria-label"] ? {
    tabIndex: 0,
    role: "region",
    "aria-label": rest["aria-label"]
  } : {
    tabIndex: 0
  };
  const mergedRef = useMergedRef(ref, (n_1) => {
    dialogRef.current = n_1;
    nameRef(n_1);
    restyle(n_1);
  });
  return /* @__PURE__ */ React.createElement("dialog", { ...rest, ref: mergedRef, "aria-modal": modal ? "true" : void 0, "aria-labelledby": rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0), "aria-describedby": rest["aria-describedby"] || (has(props.description) ? base + "-desc" : void 0), className: cn("srp-drawer", "srp-drawer--" + side, "srp-drawer--" + size, !modal && "srp-drawer--nonmodal", snaps.length > 0 && "srp-drawer--snaps", props.className), "data-component": "drawer", "data-state": open ? "open" : "closed", "data-side": side, "data-size": size, "data-instant": arrivedRef.current ? "" : void 0, onKeyDown, onCancel, onClose, onPointerDown, onClick }, /* @__PURE__ */ React.createElement("div", { ref: panel, className: "srp-drawer__panel", "data-snap": snaps.length ? snapAt : void 0, style: snaps.length ? {
    "--srp-drawer-snap": snaps[snapAt]
  } : void 0, onPointerDown: onSwipeDown, onPointerMove: onSwipeMove, onPointerUp: onSwipeEnd, onPointerCancel: onSwipeEnd }, snaps.length > 1 ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-drawer__handle", "aria-label": snapAt < snaps.length - 1 ? sds.labels.drawerExpand : sds.labels.drawerCollapse, onClick: onHandle }, /* @__PURE__ */ React.createElement("span", { className: "srp-drawer__grip", "aria-hidden": "true" })) : null, has(props.title) || has(props.description) || showClose ? /* @__PURE__ */ React.createElement("div", { className: "srp-drawer__header" }, /* @__PURE__ */ React.createElement("div", { className: "srp-drawer__heading" }, has(props.title) ? /* @__PURE__ */ React.createElement("h2", { className: "srp-drawer__title", id: base + "-title" }, props.title) : null, has(props.description) ? /* @__PURE__ */ React.createElement("p", { className: "srp-drawer__description", id: base + "-desc" }, props.description) : null), showClose ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-drawer__close", icon: icons.Close, label: props.closeLabel || sds.labels.close, size: "sm", hideTitle: true, onClick: () => request("close") }) : null) : null, has(props.children) ? /* @__PURE__ */ React.createElement("div", { ...region, ref: setBody, className: "srp-drawer__body" }, props.children) : null, has(props.footer) ? /* @__PURE__ */ React.createElement("div", { className: "srp-drawer__footer" }, props.footer) : null), props.unsaved || asking ? /* @__PURE__ */ React.createElement(Discard, { open: !!asking && open, onKeep: () => setAsking(null), onDiscard: () => {
    const why = asking || "close";
    setAsking(null);
    close(why);
  } }) : null);
}
var Drawer = /* @__PURE__ */ named("Drawer", DrawerRender);
export {
  Drawer
};
//# sourceMappingURL=Drawer.js.map
