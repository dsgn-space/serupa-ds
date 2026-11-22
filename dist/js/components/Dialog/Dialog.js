"use client";

// src/components/Dialog/Dialog.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { warnOnce } from "../../internal/warn.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { modalClosed, modalOpened, modalOpening, wasDismissal } from "../../internal/layers.js";
import { listenForInput } from "../../internal/lastInput.js";
import { deepActive } from "../../internal/root.js";
import * as icons from "../../material/builtin.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
var OWN = {
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  title: 1,
  description: 1,
  footer: 1,
  size: 1,
  alert: 1,
  closeButton: 1,
  closeLabel: 1,
  closeOnBackdrop: 1,
  fullScreen: 1,
  initialFocus: 1,
  finalFocus: 1,
  unsaved: 1,
  className: 1,
  children: 1
};
function DialogRender({
  ref,
  ...props
}) {
  const nameRef = useNameCheck("Dialog", NAME_HOW.title);
  const sds = useSettings();
  const rest = omit(props, OWN);
  const base = domId("srp-dlg", React.useId());
  const el = React.useRef(null);
  const back = React.useRef(null);
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const alert = !!props.alert;
  const showClose = props.closeButton != null ? props.closeButton : !alert;
  const backdrop = props.closeOnBackdrop != null ? props.closeOnBackdrop : !alert;
  const ask = useLatest(props.onOpenChange);
  const initial = useLatest(props.initialFocus);
  const final = useLatest(props.finalFocus);
  const giveBack = (keep) => {
    if (!back.current) return;
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (b && b.isConnected && typeof b.focus === "function") b.focus();
  };
  const [openIn, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, "Dialog", "open");
  const open = !!openIn;
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
  const has = (n) => n != null && n !== false && n !== "";
  const arrived = React.useRef(open);
  if (!open) arrived.current = false;
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(listenForInput, []);
  useIsoLayoutEffect(() => {
    const d = el.current;
    if (!d) return;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive();
      if (process.env.NODE_ENV !== "production" && d.parentElement?.closest("form") && d.querySelector("form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])")) warnOnce("overlay-in-form", "Dialog: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Dialog after the form.", "Dialog:overlay-in-form");
      modalOpening();
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
      modalOpened(d);
      const want = initial.current && initial.current.current;
      const own = want && d.contains(want) ? want : d.querySelector("[data-autofocus], [autofocus]");
      if (own && typeof own.focus === "function") own.focus();
    } else if (open) {
      modalOpened(d);
    } else {
      if (d.open) {
        if (typeof d.close === "function") d.close();
        else d.removeAttribute("open");
      }
      modalClosed(d);
      giveBack();
    }
  }, [open, reopened]);
  React.useEffect(() => {
    const d_0 = el.current;
    return () => {
      if (d_0) modalClosed(d_0);
      giveBack(true);
    };
  }, []);
  const onCancel = (e_0) => {
    if (rest.onCancel) rest.onCancel(e_0);
    if (e_0.target !== e_0.currentTarget) return;
    e_0.preventDefault();
    request("escape");
  };
  const openNow = useLatest(open);
  const onClose = (e_1) => {
    if (rest.onClose) rest.onClose(e_1);
    if (e_1.target !== e_1.currentTarget) return;
    if (!e_1.currentTarget.open) modalClosed(e_1.currentTarget);
    if (!openNow.current || e_1.currentTarget.open) return;
    if (unsaved.current) {
      const d_1 = e_1.currentTarget;
      modalOpening();
      if (typeof d_1.showModal === "function") d_1.showModal();
      modalOpened(d_1);
      setAsking("api");
      return;
    }
    close("api");
    reopen((n_0) => n_0 + 1);
  };
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e_2) => {
    if (rest.onPointerDown) rest.onPointerDown(e_2);
    downOnBackdrop.current = e_2.target === e_2.currentTarget && !wasDismissal(e_2.nativeEvent);
  };
  const onClick = (e_3) => {
    if (rest.onClick) rest.onClick(e_3);
    if (backdrop && downOnBackdrop.current && e_3.target === e_3.currentTarget && !wasDismissal(e_3.nativeEvent)) request("outside");
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
    el.current = n_1;
    nameRef(n_1);
  });
  return /* @__PURE__ */ React.createElement("dialog", { ...rest, ref: mergedRef, role: alert ? "alertdialog" : void 0, "aria-modal": "true", "aria-labelledby": rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0), "aria-describedby": rest["aria-describedby"] || (has(props.description) ? base + "-desc" : void 0), className: cn("srp-dialog", "srp-dialog--" + size, props.fullScreen === true && "srp-dialog--full", props.fullScreen === "mobile" && "srp-dialog--full-mobile", props.className), "data-component": "dialog", "data-size": size, "data-state": open ? "open" : "closed", "data-instant": arrived.current ? "" : void 0, onCancel, onClose, onPointerDown, onClick }, /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__panel" }, has(props.title) || has(props.description) || showClose ? /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__header" }, /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__heading" }, has(props.title) ? /* @__PURE__ */ React.createElement("h2", { className: "srp-dialog__title", id: base + "-title" }, props.title) : null, has(props.description) ? /* @__PURE__ */ React.createElement("p", { className: "srp-dialog__description", id: base + "-desc" }, props.description) : null), showClose ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-dialog__close", icon: icons.Close, label: props.closeLabel || sds.labels.close, size: "sm", hideTitle: true, onClick: () => request("close") }) : null) : null, has(props.children) ? /* @__PURE__ */ React.createElement("div", { ...region, ref: setBody, className: "srp-dialog__body" }, props.children) : null, has(props.footer) ? /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__footer" }, props.footer) : null), props.unsaved || asking ? /* @__PURE__ */ React.createElement(Discard, { open: !!asking && open, onKeep: () => setAsking(null), onDiscard: () => {
    const why = asking || "close";
    setAsking(null);
    close(why);
  } }) : null);
}
var Dialog = /* @__PURE__ */ named("Dialog", DialogRender);
function Discard(props) {
  const $ = _c(15);
  const sds = useSettings(words);
  const keep = React.useRef(null);
  let t0;
  if ($[0] !== props.onKeep || $[1] !== sds.labels.keepEditing) {
    t0 = /* @__PURE__ */ React.createElement(Button, { key: "keep", ref: keep, variant: "secondary", onClick: props.onKeep }, sds.labels.keepEditing);
    $[0] = props.onKeep;
    $[1] = sds.labels.keepEditing;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  let t1;
  if ($[3] !== props.onDiscard || $[4] !== sds.labels.discard) {
    t1 = /* @__PURE__ */ React.createElement(Button, { key: "discard", destructive: true, onClick: props.onDiscard }, sds.labels.discard);
    $[3] = props.onDiscard;
    $[4] = sds.labels.discard;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[6] !== t0 || $[7] !== t1) {
    t2 = [t0, t1];
    $[6] = t0;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  let t3;
  if ($[9] !== props.onKeep || $[10] !== props.open || $[11] !== sds.labels.discardDescription || $[12] !== sds.labels.discardTitle || $[13] !== t2) {
    t3 = /* @__PURE__ */ React.createElement(Dialog, { alert: true, size: "sm", open: props.open, onOpenChange: props.onKeep, title: sds.labels.discardTitle, description: sds.labels.discardDescription, initialFocus: keep, footer: t2 });
    $[9] = props.onKeep;
    $[10] = props.open;
    $[11] = sds.labels.discardDescription;
    $[12] = sds.labels.discardTitle;
    $[13] = t2;
    $[14] = t3;
  } else {
    t3 = $[14];
  }
  return t3;
}
function useUnsavedChanges(unsaved) {
  const $ = _c(15);
  const [asking, setAsking] = React.useState(false);
  const settle = React.useRef(null);
  const now = React.useRef(unsaved);
  let t0;
  let t1;
  if ($[0] !== unsaved) {
    t0 = () => {
      now.current = unsaved;
    };
    t1 = [unsaved];
    $[0] = unsaved;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  useIsoLayoutEffect(t0, t1);
  let t2;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = (ok) => {
      const s = settle.current;
      settle.current = null;
      setAsking(false);
      if (s) {
        s(ok);
      }
    };
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const answer = t2;
  let t3;
  let t4;
  if ($[4] !== unsaved) {
    t3 = () => {
      if (!unsaved) {
        if (settle.current) {
          answer(true);
        }
        return;
      }
      const stay = _temp;
      window.addEventListener("beforeunload", stay);
      return () => window.removeEventListener("beforeunload", stay);
    };
    t4 = [unsaved, answer];
    $[4] = unsaved;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  React.useEffect(t3, t4);
  let t5;
  let t6;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => () => {
      const s_0 = settle.current;
      settle.current = null;
      if (s_0) {
        s_0(false);
      }
    };
    t6 = [];
    $[7] = t5;
    $[8] = t6;
  } else {
    t5 = $[7];
    t6 = $[8];
  }
  React.useEffect(t5, t6);
  let t7;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      if (!now.current) {
        return Promise.resolve(true);
      }
      if (settle.current) {
        settle.current(false);
      }
      setAsking(true);
      return new Promise((ok_0) => {
        settle.current = ok_0;
      });
    };
    $[9] = t7;
  } else {
    t7 = $[9];
  }
  const confirm = t7;
  let t8;
  if ($[10] !== asking || $[11] !== unsaved) {
    t8 = unsaved || asking ? /* @__PURE__ */ React.createElement(Discard, { open: asking, onKeep: () => answer(false), onDiscard: () => answer(true) }) : null;
    $[10] = asking;
    $[11] = unsaved;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  let t9;
  if ($[13] !== t8) {
    t9 = {
      confirm,
      dialog: t8
    };
    $[13] = t8;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  return t9;
}
function _temp(e) {
  e.preventDefault();
}
export {
  Dialog,
  Discard,
  useUnsavedChanges
};
//# sourceMappingURL=Dialog.js.map
