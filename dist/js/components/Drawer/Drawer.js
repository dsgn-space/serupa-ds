"use client";

// src/components/Drawer/Drawer.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { warnOnce } from "../../internal/warn.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Discard } from "../Dialog/Dialog.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { modalClosed, modalOpened, modalOpening, wasDismissal } from "../../internal/layers.js";
import * as icons from "../../material/builtin.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { isComposing } from "../../internal/ime.js";
import { deepActive } from "../../internal/root.js";
import { isRtl } from "../../internal/position.js";
import { project, rubber, settleTime, speed, track } from "../../internal/fling.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { en as words } from "./labels.js";
var FLICK = 0.2;
var INWARD = 24;
var OWN = { open: 1, defaultOpen: 1, onOpenChange: 1, placement: 1, side: 1, size: 1, title: 1, description: 1, footer: 1, closeButton: 1, closeLabel: 1, closeOnBackdrop: 1, modal: 1, swipeToClose: 1, initialFocus: 1, finalFocus: 1, unsaved: 1, snapPoints: 1, snap: 1, defaultSnap: 1, onSnapChange: 1, className: 1, children: 1 };
var Drawer = /* @__PURE__ */ component("Drawer", function Drawer2(props, ref) {
  const nameRef = useNameCheck("Drawer", NAME_HOW.title);
  const sds = useSettings(words);
  const restyle = useServerStyles();
  const rest = omit(props, OWN);
  const base = domId("dk-drw", React.useId());
  const el = React.useRef(null);
  const back = React.useRef(null);
  if (process.env.NODE_ENV !== "production" && props.side != null) warnOnce("drawer-side", "Drawer: side is deprecated and removed in 15.0.0. Use placement, which takes the same edges, and start and end.");
  const side = oneOf(["right", "left", "top", "bottom", "start", "end"], props.placement ?? props.side, "right");
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
  const ask = React.useRef(props.onOpenChange);
  ask.current = props.onOpenChange;
  const initial = React.useRef(props.initialFocus);
  initial.current = props.initialFocus;
  const final = React.useRef(props.finalFocus);
  final.current = props.finalFocus;
  const isModal = React.useRef(modal);
  isModal.current = modal;
  const [inner, setInner] = React.useState(!!props.defaultOpen);
  const controlled = props.open !== void 0;
  const open = controlled ? !!props.open : inner;
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOwnSnap(props.defaultSnap ?? 0);
  }
  const close = React.useCallback((reason) => {
    if (!controlled) setInner(false);
    if (ask.current) ask.current(false, { reason });
  }, [controlled]);
  const unsaved = React.useRef(props.unsaved);
  unsaved.current = props.unsaved;
  const [asking, setAsking] = React.useState(null);
  if (!open && asking) setAsking(null);
  const request = (reason) => {
    if (unsaved.current) setAsking(reason);
    else close(reason);
  };
  React.useEffect(() => {
    if (!open || !props.unsaved) return;
    const stay = (e) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", stay);
    return () => window.removeEventListener("beforeunload", stay);
  }, [open, props.unsaved]);
  const has = (n) => n != null && n !== false && n !== "";
  const arrived = React.useRef(open);
  if (!open) arrived.current = false;
  const giveBack = (go, keep) => {
    if (!back.current) return;
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (go && b && b.isConnected && typeof b.focus === "function") b.focus();
  };
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(() => {
    const d = el.current;
    if (!d) return;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive();
      if (process.env.NODE_ENV !== "production" && d.parentElement?.closest("form") && d.querySelector("form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])")) warnOnce("overlay-in-form", "Drawer: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Drawer after the form.", "Drawer:overlay-in-form");
      if (!modal) {
        if (typeof d.show === "function") d.show();
        else d.setAttribute("open", "");
      } else {
        modalOpening();
        if (typeof d.showModal === "function") d.showModal();
        else d.setAttribute("open", "");
        modalOpened(d);
      }
      const want = initial.current && initial.current.current;
      const own = want && d.contains(want) ? want : d.querySelector("[data-autofocus], [autofocus]");
      if (own && typeof own.focus === "function") own.focus();
    } else if (open) {
      if (modal) modalOpened(d);
    } else {
      const inside = modal || d.contains(deepActive());
      if (d.open) {
        if (typeof d.close === "function") d.close();
        else d.removeAttribute("open");
      }
      modalClosed(d);
      giveBack(inside);
    }
  }, [open, reopened]);
  React.useEffect(() => {
    const d = el.current;
    return () => {
      if (d) modalClosed(d);
      const a = deepActive();
      giveBack(isModal.current || !a || a === document.body || !!d && d.contains(a), true);
    };
  }, []);
  const onKeyDown = (e) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (modal || e.defaultPrevented || e.key !== "Escape" || isComposing(e)) return;
    if (e.target instanceof Element && e.target.closest("dialog") !== e.currentTarget) return;
    e.preventDefault();
    request("escape");
  };
  const onCancel = (e) => {
    if (rest.onCancel) rest.onCancel(e);
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    request("escape");
  };
  const openNow = React.useRef(open);
  openNow.current = open;
  const onClose = (e) => {
    if (rest.onClose) rest.onClose(e);
    if (e.target !== e.currentTarget) return;
    if (!e.currentTarget.open) modalClosed(e.currentTarget);
    if (!openNow.current || e.currentTarget.open) return;
    if (unsaved.current) {
      const d = e.currentTarget;
      if (!modal) {
        if (typeof d.show === "function") d.show();
      } else {
        modalOpening();
        if (typeof d.showModal === "function") d.showModal();
        modalOpened(d);
      }
      setAsking("api");
      return;
    }
    close("api");
    reopen((n) => n + 1);
  };
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e) => {
    if (rest.onPointerDown) rest.onPointerDown(e);
    downOnBackdrop.current = e.target === e.currentTarget && !wasDismissal(e.nativeEvent);
  };
  const swipe = props.swipeToClose !== false;
  const horiz = side !== "top" && side !== "bottom";
  const settling = React.useRef(null);
  const shift = (d, away) => horiz ? d * away + "px 0" : "0 " + d * away + "px";
  const drag = React.useRef(null);
  const onSwipeDown = (e) => {
    const t = e.target;
    if (!swipe && !snaps.length || e.pointerType !== "touch" || !e.isPrimary || t.closest("input, textarea, select, [contenteditable]")) return;
    if (!horiz && t.closest(".dk-drawer__body")) return;
    const away = side === "start" || side === "end" ? side === "end" !== isRtl(e.currentTarget) ? 1 : -1 : side === "right" || side === "bottom" ? 1 : -1;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, d: 0, at: 0, on: false, s: [{ t: e.timeStamp, p: 0 }], away };
  };
  const sheetPx = (i) => snaps[i] * (el.current ? el.current.clientHeight : window.innerHeight);
  const sheetMove = (p, g) => {
    const low = sheetPx(0), high = sheetPx(snaps.length - 1), h = sheetPx(snapAt) - g.d;
    g.at = h >= low ? 0 : swipe ? low - h : rubber(low - h, INWARD);
    p.style.height = (h > high ? high - rubber(high - h, INWARD) : Math.max(h, low)) + "px";
    p.style.translate = g.at ? shift(g.at, g.away) : "";
  };
  const glide = (p, from, at, to, v, done) => {
    const tall = Math.max(from, to), dist = Math.abs(to - from) + at;
    p.style.transition = "none";
    p.style.height = tall + "px";
    p.style.translate = shift(tall - from + at, 1);
    p.style.setProperty("--dk-drawer-settle", settleTime(dist, Math.abs(v)) + "ms");
    void p.offsetHeight;
    p.style.transition = "";
    p.dataset.settling = "";
    const finish = () => {
      delete p.dataset.settling;
      p.style.height = "";
      p.style.translate = "";
      done();
    };
    if (!dist || !parseFloat(getComputedStyle(p).transitionDuration)) {
      finish();
      return;
    }
    const end = (ev) => {
      if (ev.target === p && ev.propertyName === "translate") {
        stop();
        finish();
      }
    };
    const stop = () => {
      p.removeEventListener("transitionend", end);
      delete p.dataset.settling;
      settling.current = null;
    };
    p.addEventListener("transitionend", end);
    settling.current = stop;
    p.style.translate = tall - to ? shift(tall - to, 1) : "";
  };
  const sheetEnd = (p, g, v, released) => {
    const low = sheetPx(0), h = sheetPx(snapAt) - g.d, rest2 = h - (released ? project(v) : 0);
    const out = swipe && released && h < low && (v > FLICK || rest2 < low * 2 / 3);
    if (!out) {
      let to = snapAt;
      snaps.forEach((_, i) => {
        if (Math.abs(sheetPx(i) - rest2) < Math.abs(sheetPx(to) - rest2)) to = i;
      });
      glide(p, p.offsetHeight, g.at, sheetPx(to), v, () => {
      });
      toSnap(to);
      return;
    }
    const done = () => {
      delete p.dataset.settling;
      if (unsaved.current) {
        p.style.height = "";
        p.style.translate = "";
        request("swipe");
        return;
      }
      close("swipe");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!drag.current) {
          p.style.height = "";
          p.style.translate = "";
        }
      }));
    };
    const dist = p.offsetHeight - g.at;
    p.style.setProperty("--dk-drawer-settle", settleTime(dist, Math.abs(v)) + "ms");
    p.dataset.settling = "";
    if (!dist || !parseFloat(getComputedStyle(p).transitionDuration)) {
      done();
      return;
    }
    const end = (ev) => {
      if (ev.target === p && ev.propertyName === "translate") {
        stop();
        done();
      }
    };
    const stop = () => {
      p.removeEventListener("transitionend", end);
      delete p.dataset.settling;
      settling.current = null;
    };
    p.addEventListener("transitionend", end);
    settling.current = stop;
    p.style.translate = shift(p.offsetHeight, g.away);
  };
  const panel = React.useRef(null);
  const onHandle = () => {
    const i = snapAt < snaps.length - 1 ? snapAt + 1 : 0, p = panel.current;
    if (p && props.snap === void 0) {
      if (settling.current) settling.current();
      glide(p, p.offsetHeight, 0, sheetPx(i), 0, () => {
      });
    }
    toSnap(i);
  };
  const onSwipeMove = (e) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    const d = (horiz ? e.clientX - g.x : e.clientY - g.y) * g.away, across = Math.abs(horiz ? e.clientY - g.y : e.clientX - g.x);
    if (!g.on) {
      if (across > 10 && across > Math.abs(d)) {
        drag.current = null;
        return;
      }
      if (Math.abs(d) < 10) return;
      g.on = true;
      e.currentTarget.setAttribute("data-dragging", "");
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      if (settling.current) settling.current();
    }
    g.d = d;
    track(g.s, e.timeStamp, d);
    if (snaps.length) {
      sheetMove(e.currentTarget, g);
      return;
    }
    g.at = d >= 0 ? d : rubber(d, INWARD);
    e.currentTarget.style.translate = shift(g.at, g.away);
    e.currentTarget.toggleAttribute("data-inward", g.at < 0);
  };
  const onSwipeEnd = (e) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    drag.current = null;
    const p = e.currentTarget, size2 = horiz ? p.offsetWidth : p.offsetHeight;
    p.removeAttribute("data-dragging");
    if (!g.on) {
      p.style.translate = "";
      delete p.dataset.inward;
      return;
    }
    const v = speed(g.s);
    if (snaps.length) {
      sheetEnd(p, g, v, e.type === "pointerup");
      return;
    }
    const out = e.type === "pointerup" && (v > FLICK || g.d + project(v) > size2 / 3 && v > -0.1);
    const left = out ? size2 - g.at : Math.abs(g.at);
    const done = () => {
      delete p.dataset.settling;
      delete p.dataset.inward;
      if (!out) {
        p.style.translate = "";
        return;
      }
      if (unsaved.current) {
        p.style.translate = "";
        request("swipe");
        return;
      }
      close("swipe");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!drag.current) p.style.translate = "";
      }));
    };
    p.style.setProperty("--dk-drawer-settle", settleTime(left, (out ? v : -v) > 0 ? v : 0) + "ms");
    p.dataset.settling = "";
    if (!left || !parseFloat(getComputedStyle(p).transitionDuration)) {
      done();
      return;
    }
    const end = (ev) => {
      if (ev.target === p && ev.propertyName === "translate") {
        stop();
        done();
      }
    };
    const stop = () => {
      p.removeEventListener("transitionend", end);
      delete p.dataset.settling;
      settling.current = null;
    };
    p.addEventListener("transitionend", end);
    settling.current = stop;
    p.style.translate = out ? shift(size2, g.away) : "";
  };
  const onClick = (e) => {
    if (rest.onClick) rest.onClick(e);
    if (backdrop && downOnBackdrop.current && e.target === e.currentTarget && !wasDismissal(e.nativeEvent)) request("outside");
    downOnBackdrop.current = false;
  };
  const [body, setBody] = React.useState(null);
  const scrolls = useScrolls(body);
  const named = rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0);
  const region = !scrolls ? {} : named ? { tabIndex: 0, role: "region", "aria-labelledby": named } : rest["aria-label"] ? { tabIndex: 0, role: "region", "aria-label": rest["aria-label"] } : { tabIndex: 0 };
  const mergedRef = useMergedRef(ref, (n) => {
    el.current = n;
    nameRef(n);
    restyle(n);
  });
  return /* @__PURE__ */ React.createElement(
    "dialog",
    {
      ...rest,
      ref: mergedRef,
      "aria-modal": modal ? "true" : void 0,
      "aria-labelledby": rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0),
      "aria-describedby": rest["aria-describedby"] || (has(props.description) ? base + "-desc" : void 0),
      className: cn("dk-drawer", "dk-drawer--" + side, "dk-drawer--" + size, !modal && "dk-drawer--nonmodal", snaps.length > 0 && "dk-drawer--snaps", props.className),
      "data-component": "drawer",
      "data-state": open ? "open" : "closed",
      "data-side": side,
      "data-size": size,
      "data-instant": arrived.current ? "" : void 0,
      onKeyDown,
      onCancel,
      onClose,
      onPointerDown,
      onClick
    },
    /* @__PURE__ */ React.createElement("div", { ref: panel, className: "dk-drawer__panel", "data-snap": snaps.length ? snapAt : void 0, style: snaps.length ? { "--dk-drawer-snap": snaps[snapAt] } : void 0, onPointerDown: onSwipeDown, onPointerMove: onSwipeMove, onPointerUp: onSwipeEnd, onPointerCancel: onSwipeEnd }, snaps.length > 1 ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "dk-drawer__handle",
        "aria-label": snapAt < snaps.length - 1 ? sds.labels.drawerExpand : sds.labels.drawerCollapse,
        onClick: onHandle
      },
      /* @__PURE__ */ React.createElement("span", { className: "dk-drawer__grip", "aria-hidden": "true" })
    ) : null, has(props.title) || has(props.description) || showClose ? /* @__PURE__ */ React.createElement("div", { className: "dk-drawer__header" }, /* @__PURE__ */ React.createElement("div", { className: "dk-drawer__heading" }, has(props.title) ? /* @__PURE__ */ React.createElement("h2", { className: "dk-drawer__title", id: base + "-title" }, props.title) : null, has(props.description) ? /* @__PURE__ */ React.createElement("p", { className: "dk-drawer__description", id: base + "-desc" }, props.description) : null), showClose ? /* @__PURE__ */ React.createElement(IconButton, { className: "dk-drawer__close", icon: icons.Close, label: props.closeLabel || sds.labels.close, size: "sm", hideTitle: true, onClick: () => request("close") }) : null) : null, has(props.children) ? /* @__PURE__ */ React.createElement("div", { ...region, ref: setBody, className: "dk-drawer__body" }, props.children) : null, has(props.footer) ? /* @__PURE__ */ React.createElement("div", { className: "dk-drawer__footer" }, props.footer) : null),
    props.unsaved || asking ? /* @__PURE__ */ React.createElement(Discard, { open: !!asking && open, onKeep: () => setAsking(null), onDiscard: () => {
      const why = asking || "close";
      setAsking(null);
      close(why);
    } }) : null
  );
});
export {
  Drawer
};
//# sourceMappingURL=Drawer.js.map
