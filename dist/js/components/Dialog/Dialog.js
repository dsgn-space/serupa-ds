"use client";

// src/components/Dialog/Dialog.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
import { named } from "../../internal/component.js";
import { useModalDialog } from "../../internal/useModalDialog.js";
import { useSettings } from "../../internal/provider.js";
import { wasDismissal } from "../../internal/layers.js";
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
function DialogRender(t0) {
  const $ = _c(29);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Dialog", NAME_HOW.title);
  const sds = useSettings();
  const rest = omit(props, OWN);
  const base = domId("srp-dlg", React.useId());
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const alert = !!props.alert;
  const showClose = props.closeButton != null ? props.closeButton : !alert;
  const backdrop = props.closeOnBackdrop != null ? props.closeOnBackdrop : !alert;
  const {
    dialogRef,
    open,
    close,
    request,
    asking,
    setAsking,
    arrived,
    onCancel,
    onClose
  } = useModalDialog({
    name: "Dialog",
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
    initialFocus: props.initialFocus,
    finalFocus: props.finalFocus,
    unsaved: props.unsaved,
    modal: true,
    onCancel: rest.onCancel,
    onClose: rest.onClose
  });
  const has = _temp;
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e) => {
    if (rest.onPointerDown) {
      rest.onPointerDown(e);
    }
    downOnBackdrop.current = e.target === e.currentTarget && !wasDismissal(e.nativeEvent);
  };
  const onClick = (e_0) => {
    if (rest.onClick) {
      rest.onClick(e_0);
    }
    if (backdrop && downOnBackdrop.current && e_0.target === e_0.currentTarget && !wasDismissal(e_0.nativeEvent)) {
      request("outside");
    }
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
  let t1;
  if ($[0] !== dialogRef || $[1] !== nameRef) {
    t1 = (n_0) => {
      dialogRef.current = n_0;
      nameRef(n_0);
    };
    $[0] = dialogRef;
    $[1] = nameRef;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const mergedRef = useMergedRef(ref, t1);
  const t2 = alert ? "alertdialog" : void 0;
  const t3 = "true";
  const t4 = rest["aria-labelledby"] || (has(props.title) ? base + "-title" : void 0);
  const t5 = rest["aria-describedby"] || (has(props.description) ? base + "-desc" : void 0);
  const t6 = cn("srp-dialog", "srp-dialog--" + size, props.fullScreen === true && "srp-dialog--full", props.fullScreen === "mobile" && "srp-dialog--full-mobile", props.className);
  const t7 = "dialog";
  const t8 = open ? "open" : "closed";
  const t9 = arrived ? "" : void 0;
  const t10 = "srp-dialog__panel";
  const t11 = has(props.title) || has(props.description) || showClose ? /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__header" }, /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__heading" }, has(props.title) ? /* @__PURE__ */ React.createElement("h2", { className: "srp-dialog__title", id: base + "-title" }, props.title) : null, has(props.description) ? /* @__PURE__ */ React.createElement("p", { className: "srp-dialog__description", id: base + "-desc" }, props.description) : null), showClose ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-dialog__close", icon: icons.Close, label: props.closeLabel || sds.labels.close, size: "sm", hideTitle: true, onClick: () => request("close") }) : null) : null;
  const t12 = has(props.children) ? /* @__PURE__ */ React.createElement("div", { ...region, ref: setBody, className: "srp-dialog__body" }, props.children) : null;
  const t13 = has(props.footer) ? /* @__PURE__ */ React.createElement("div", { className: "srp-dialog__footer" }, props.footer) : null;
  let t14;
  if ($[3] !== t11 || $[4] !== t12 || $[5] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("div", { className: t10 }, t11, t12, t13);
    $[3] = t11;
    $[4] = t12;
    $[5] = t13;
    $[6] = t14;
  } else {
    t14 = $[6];
  }
  let t15;
  if ($[7] !== asking || $[8] !== close || $[9] !== open || $[10] !== props.unsaved || $[11] !== setAsking) {
    t15 = props.unsaved || asking ? /* @__PURE__ */ React.createElement(Discard, { open: !!asking && open, onKeep: () => setAsking(null), onDiscard: () => {
      const why = asking || "close";
      setAsking(null);
      close(why);
    } }) : null;
    $[7] = asking;
    $[8] = close;
    $[9] = open;
    $[10] = props.unsaved;
    $[11] = setAsking;
    $[12] = t15;
  } else {
    t15 = $[12];
  }
  let t16;
  if ($[13] !== mergedRef || $[14] !== onCancel || $[15] !== onClick || $[16] !== onClose || $[17] !== onPointerDown || $[18] !== rest || $[19] !== size || $[20] !== t14 || $[21] !== t15 || $[22] !== t2 || $[23] !== t4 || $[24] !== t5 || $[25] !== t6 || $[26] !== t8 || $[27] !== t9) {
    t16 = /* @__PURE__ */ React.createElement("dialog", { ...rest, ref: mergedRef, role: t2, "aria-modal": t3, "aria-labelledby": t4, "aria-describedby": t5, className: t6, "data-component": t7, "data-size": size, "data-state": t8, "data-instant": t9, onCancel, onClose, onPointerDown, onClick }, t14, t15);
    $[13] = mergedRef;
    $[14] = onCancel;
    $[15] = onClick;
    $[16] = onClose;
    $[17] = onPointerDown;
    $[18] = rest;
    $[19] = size;
    $[20] = t14;
    $[21] = t15;
    $[22] = t2;
    $[23] = t4;
    $[24] = t5;
    $[25] = t6;
    $[26] = t8;
    $[27] = t9;
    $[28] = t16;
  } else {
    t16 = $[28];
  }
  return t16;
}
function _temp(n) {
  return n != null && n !== false && n !== "";
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
      const stay = _temp2;
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
function _temp2(e) {
  e.preventDefault();
}
export {
  Dialog,
  Discard,
  useUnsavedChanges
};
//# sourceMappingURL=Dialog.js.map
