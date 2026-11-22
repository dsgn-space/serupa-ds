"use client";

// src/components/Drawer/Drawer.tsx
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { warnOnce } from "../../internal/warn.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Discard } from "../Dialog/Dialog.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { modalClosed, modalOpened, modalOpening, wasDismissal } from "../../internal/layers.js";
import { listenForInput } from "../../internal/lastInput.js";
import * as icons from "../../material/builtin.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { isComposing } from "../../internal/ime.js";
import { useCloseWatcher } from "../../internal/closeWatcher.js";
import { deepActive } from "../../internal/root.js";
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
  const el = React.useRef(null);
  const back = React.useRef(null);
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
  const ask = useLatest(props.onOpenChange);
  const initial = useLatest(props.initialFocus);
  const final = useLatest(props.finalFocus);
  const isModal = useLatest(modal);
  const [openIn, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "Drawer", "open");
  const open = !!openIn;
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOwnSnap(props.defaultSnap ?? 0);
  }
  const close = React.useCallback((reason) => {
    if (!controlled) setInner(false);
    if (ask.current) ask.current(false, {
      reason
    });
  }, [controlled, setInner, ask]);
  const unsaved = useLatest(props.unsaved);
  const [asking, setAsking] = React.useState(null);
  if (!open && asking) setAsking(null);
  const request = (reason_0) => {
    if (unsaved.current) setAsking(reason_0);
    else close(reason_0);
  };
  React.useEffect(() => {
    if (!open || !props.unsaved) return;
    const stay = (e) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", stay);
    return () => window.removeEventListener("beforeunload", stay);
  }, [open, props.unsaved]);
  const has = (n_0) => n_0 != null && n_0 !== false && n_0 !== "";
  const arrived = React.useRef(open);
  if (!open) arrived.current = false;
  const giveBack = (go, keep) => {
    if (!back.current) return;
    const f = final.current && final.current.current, b_0 = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (go && b_0 && b_0.isConnected && typeof b_0.focus === "function") b_0.focus();
  };
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(listenForInput, []);
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
    const d_0 = el.current;
    return () => {
      if (d_0) modalClosed(d_0);
      const a_0 = deepActive();
      giveBack(isModal.current || !a_0 || a_0 === document.body || !!d_0 && d_0.contains(a_0), true);
    };
  }, []);
  const onKeyDown = (e_0) => {
    if (rest.onKeyDown) rest.onKeyDown(e_0);
    if (modal || e_0.defaultPrevented || e_0.key !== "Escape" || isComposing(e_0)) return;
    if (e_0.target instanceof Element && e_0.target.closest("dialog") !== e_0.currentTarget) return;
    e_0.preventDefault();
    request("escape");
  };
  useCloseWatcher(open && !modal && !asking, () => request("escape"), true);
  const onCancel = (e_1) => {
    if (rest.onCancel) rest.onCancel(e_1);
    if (e_1.target !== e_1.currentTarget) return;
    e_1.preventDefault();
    request("escape");
  };
  const openNow = useLatest(open);
  const onClose = (e_2) => {
    if (rest.onClose) rest.onClose(e_2);
    if (e_2.target !== e_2.currentTarget) return;
    if (!e_2.currentTarget.open) modalClosed(e_2.currentTarget);
    if (!openNow.current || e_2.currentTarget.open) return;
    if (unsaved.current) {
      const d_1 = e_2.currentTarget;
      if (!modal) {
        if (typeof d_1.show === "function") d_1.show();
      } else {
        modalOpening();
        if (typeof d_1.showModal === "function") d_1.showModal();
        modalOpened(d_1);
      }
      setAsking("api");
      return;
    }
    close("api");
    reopen((n_1) => n_1 + 1);
  };
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e_3) => {
    if (rest.onPointerDown) rest.onPointerDown(e_3);
    downOnBackdrop.current = e_3.target === e_3.currentTarget && !wasDismissal(e_3.nativeEvent);
  };
  const swipe = props.swipeToClose !== false;
  const horiz = side !== "top" && side !== "bottom";
  const settling = React.useRef(null);
  const shift = (d_2, away) => horiz ? d_2 * away + "px 0" : "0 " + d_2 * away + "px";
  const drag = React.useRef(null);
  const onSwipeDown = (e_4) => {
    const t = e_4.target;
    if (!swipe && !snaps.length || e_4.pointerType !== "touch" || !e_4.isPrimary || t.closest("input, textarea, select, [contenteditable]")) return;
    if (!horiz && t.closest(".srp-drawer__body")) return;
    const away_0 = side === "start" || side === "end" ? side === "end" !== isRtl(e_4.currentTarget) ? 1 : -1 : side === "bottom" ? 1 : -1;
    drag.current = {
      id: e_4.pointerId,
      x: e_4.clientX,
      y: e_4.clientY,
      d: 0,
      at: 0,
      on: false,
      s: [{
        t: e_4.timeStamp,
        p: 0
      }],
      away: away_0
    };
  };
  const sheetPx = (i_0) => snaps[i_0] * (el.current ? el.current.clientHeight : window.innerHeight);
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
      if (unsaved.current) {
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
  const onSwipeMove = (e_5) => {
    const g_1 = drag.current;
    if (!g_1 || e_5.pointerId !== g_1.id) return;
    const d_3 = (horiz ? e_5.clientX - g_1.x : e_5.clientY - g_1.y) * g_1.away, across = Math.abs(horiz ? e_5.clientY - g_1.y : e_5.clientX - g_1.x);
    if (!g_1.on) {
      if (across > 10 && across > Math.abs(d_3)) {
        drag.current = null;
        return;
      }
      if (Math.abs(d_3) < 10) return;
      g_1.on = true;
      e_5.currentTarget.setAttribute("data-dragging", "");
      try {
        e_5.currentTarget.setPointerCapture(e_5.pointerId);
      } catch {
      }
      if (settling.current) settling.current();
    }
    g_1.d = d_3;
    track(g_1.s, e_5.timeStamp, d_3);
    if (snaps.length) {
      sheetMove(e_5.currentTarget, g_1);
      return;
    }
    g_1.at = d_3 >= 0 ? d_3 : rubber(d_3, INWARD);
    e_5.currentTarget.style.translate = shift(g_1.at, g_1.away);
    e_5.currentTarget.toggleAttribute("data-inward", g_1.at < 0);
  };
  const onSwipeEnd = (e_6) => {
    const g_2 = drag.current;
    if (!g_2 || e_6.pointerId !== g_2.id) return;
    drag.current = null;
    const p_3 = e_6.currentTarget, size_0 = horiz ? p_3.offsetWidth : p_3.offsetHeight;
    p_3.removeAttribute("data-dragging");
    if (!g_2.on) {
      p_3.style.translate = "";
      delete p_3.dataset.inward;
      return;
    }
    const v_1 = speed(g_2.s);
    if (snaps.length) {
      sheetEnd(p_3, g_2, v_1, e_6.type === "pointerup");
      return;
    }
    const out_0 = e_6.type === "pointerup" && (v_1 > FLICK || g_2.d + project(v_1) > size_0 / 3 && v_1 > -0.1);
    const left = out_0 ? size_0 - g_2.at : Math.abs(g_2.at);
    const done_1 = () => {
      delete p_3.dataset.settling;
      delete p_3.dataset.inward;
      if (!out_0) {
        p_3.style.translate = "";
        return;
      }
      if (unsaved.current) {
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
  const onClick = (e_7) => {
    if (rest.onClick) rest.onClick(e_7);
    if (backdrop && downOnBackdrop.current && e_7.target === e_7.currentTarget && !wasDismissal(e_7.nativeEvent)) request("outside");
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
  const mergedRef = useMergedRef(ref, (n_2) => {
    el.current = n_2;
    nameRef(n_2);
    restyle(n_2);
  });
  return /* @__PURE__ */ React.createElement("dialog", { ...rest, ref: mergedRef, "aria-modal": modal ? "true" : void 0, "aria-labelledby": rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0), "aria-describedby": rest["aria-describedby"] || (has(props.description) ? base + "-desc" : void 0), className: cn("srp-drawer", "srp-drawer--" + side, "srp-drawer--" + size, !modal && "srp-drawer--nonmodal", snaps.length > 0 && "srp-drawer--snaps", props.className), "data-component": "drawer", "data-state": open ? "open" : "closed", "data-side": side, "data-size": size, "data-instant": arrived.current ? "" : void 0, onKeyDown, onCancel, onClose, onPointerDown, onClick }, /* @__PURE__ */ React.createElement("div", { ref: panel, className: "srp-drawer__panel", "data-snap": snaps.length ? snapAt : void 0, style: snaps.length ? {
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
