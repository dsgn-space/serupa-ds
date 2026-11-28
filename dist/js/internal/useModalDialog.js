// src/internal/useModalDialog.ts
import * as React from "react";
import { useControllable } from "./controllable.js";
import { useIsoLayoutEffect, useLatest } from "./cn.js";
import { warnOnce } from "./warn.js";
import { modalClosed, modalOpened, modalOpening } from "./layers.js";
import { listenForInput } from "./lastInput.js";
import { deepActive } from "./root.js";
var show = (d, modal) => {
  if (!modal) {
    if (typeof d.show === "function") d.show();
    else d.setAttribute("open", "");
    return;
  }
  modalOpening();
  if (typeof d.showModal === "function") d.showModal();
  else d.setAttribute("open", "");
  modalOpened(d);
};
function useModalDialog(o) {
  const dialogRef = React.useRef(null);
  const back = React.useRef(null);
  const ask = useLatest(o.onOpenChange);
  const initial = useLatest(o.initialFocus);
  const final = useLatest(o.finalFocus);
  const isModal = useLatest(o.modal);
  const [openIn, setInner, controlled] = useControllable(o.open, !!o.defaultOpen, o.name, "open");
  const open = !!openIn;
  const close = React.useCallback((reason) => {
    if (!controlled) setInner(false);
    if (ask.current) ask.current(false, { reason });
  }, [controlled, setInner, ask]);
  const unsavedRef = useLatest(o.unsaved);
  const [asking, setAsking] = React.useState(null);
  if (!open && asking) setAsking(null);
  const request = (reason) => {
    if (unsavedRef.current) setAsking(reason);
    else close(reason);
  };
  React.useEffect(() => {
    if (!open || !o.unsaved) return;
    const stay = (e) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", stay);
    return () => window.removeEventListener("beforeunload", stay);
  }, [open, o.unsaved]);
  const [arrived, setArrived] = React.useState(open);
  if (!open && arrived) setArrived(false);
  const giveBack = (go, keep) => {
    if (!back.current) return;
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (go && b && b.isConnected && typeof b.focus === "function") b.focus();
  };
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(listenForInput, []);
  useIsoLayoutEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const modal = isModal.current;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive();
      if (process.env.NODE_ENV !== "production" && d.parentElement?.closest("form") && d.querySelector("form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])")) warnOnce("overlay-in-form", `${o.name}: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the ${o.name} after the form.`, o.name + ":overlay-in-form");
      show(d, modal);
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
    const d = dialogRef.current;
    return () => {
      if (d) modalClosed(d);
      const a = deepActive();
      giveBack(isModal.current || !a || a === document.body || !!d && d.contains(a), true);
    };
  }, []);
  const onCancel = (e) => {
    if (o.onCancel) o.onCancel(e);
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    request("escape");
  };
  const openNow = useLatest(open);
  const onClose = (e) => {
    if (o.onClose) o.onClose(e);
    if (e.target !== e.currentTarget) return;
    if (!e.currentTarget.open) modalClosed(e.currentTarget);
    if (!openNow.current || e.currentTarget.open) return;
    if (unsavedRef.current) {
      show(e.currentTarget, isModal.current);
      setAsking("api");
      return;
    }
    close("api");
    reopen((n) => n + 1);
  };
  return { dialogRef, open, close, request, asking, setAsking, arrived, unsavedRef, onCancel, onClose };
}
export {
  useModalDialog
};
//# sourceMappingURL=useModalDialog.js.map
