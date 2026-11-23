"use client";

// src/components/Alert/Alert.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { ButtonBase } from "../Button/Button.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { rootOf } from "../../internal/root.js";
var OWN = {
  tone: 1,
  title: 1,
  icon: 1,
  actions: 1,
  onDismiss: 1,
  dismissLabel: 1,
  className: 1,
  children: 1
};
var TONES = ["info", "success", "warning", "danger", "neutral"];
var ICONS = {
  info: icons.Info,
  success: icons.CheckCircle,
  warning: icons.Warning,
  danger: icons.Error,
  neutral: icons.Info
};
var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function dismissAndRefocus(e, onDismiss) {
  const me = e.currentTarget, box = me.closest(".srp-alert"), doc = me.ownerDocument, r = rootOf(me);
  const near = box && r.activeElement === me ? Array.from(r.querySelectorAll(FOCUSABLE)).filter((el) => el.tabIndex >= 0 && !box.contains(el)) : [];
  const next = near.filter((el) => box.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const prev = near.filter((el) => !next.includes(el)).reverse();
  onDismiss();
  if (near.length) setTimeout(function() {
    const a = r.activeElement;
    if (me.isConnected || a && a !== doc.body) return;
    next.concat(prev).some((el) => el.isConnected && el.getClientRects().length > 0 && (el.focus(), r.activeElement === el));
  }, 0);
}
function AlertRender(t0) {
  const $ = _c(16);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const rest = omit(props, OWN);
  const tone = oneOf(TONES, props.tone, "info");
  const has = _temp;
  if (rest.role == null) {
    rest.role = tone === "warning" || tone === "danger" ? "alert" : "status";
  }
  const icon = props.icon === false ? null : props.icon == null || props.icon === true ? /* @__PURE__ */ React.createElement(Icon, { icon: ICONS[tone] }) : asIcon(props.icon);
  const t1 = cn("srp-alert", "srp-alert--" + tone, props.className);
  const t2 = "alert";
  const t3 = icon ? /* @__PURE__ */ React.createElement("span", { className: "srp-alert__icon", "aria-hidden": "true" }, icon) : null;
  const t4 = "srp-alert__content";
  const t5 = has(props.title) ? /* @__PURE__ */ React.createElement("p", { className: "srp-alert__title" }, props.title) : null;
  const t6 = has(props.children) ? /* @__PURE__ */ React.createElement("div", { className: "srp-alert__message" }, props.children) : null;
  const t7 = has(props.actions) ? /* @__PURE__ */ React.createElement("div", { className: "srp-alert__actions" }, props.actions) : null;
  let t8;
  if ($[0] !== t5 || $[1] !== t6 || $[2] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { className: t4 }, t5, t6, t7);
    $[0] = t5;
    $[1] = t6;
    $[2] = t7;
    $[3] = t8;
  } else {
    t8 = $[3];
  }
  let t9;
  if ($[4] !== props.dismissLabel || $[5] !== props.onDismiss || $[6] !== sds) {
    t9 = props.onDismiss ? /* @__PURE__ */ React.createElement(ButtonBase, { className: "srp-alert__dismiss", variant: "ghost", size: "sm", icon: icons.Close, "aria-label": props.dismissLabel || sds.labels.dismiss, onClick: (e) => dismissAndRefocus(e, props.onDismiss) }) : null;
    $[4] = props.dismissLabel;
    $[5] = props.onDismiss;
    $[6] = sds;
    $[7] = t9;
  } else {
    t9 = $[7];
  }
  let t10;
  if ($[8] !== ref || $[9] !== rest || $[10] !== t1 || $[11] !== t3 || $[12] !== t8 || $[13] !== t9 || $[14] !== tone) {
    t10 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-component": t2, "data-tone": tone }, t3, t8, t9);
    $[8] = ref;
    $[9] = rest;
    $[10] = t1;
    $[11] = t3;
    $[12] = t8;
    $[13] = t9;
    $[14] = tone;
    $[15] = t10;
  } else {
    t10 = $[15];
  }
  return t10;
}
function _temp(n) {
  return n != null && n !== false && n !== "";
}
var Alert = /* @__PURE__ */ named("Alert", AlertRender);
export {
  Alert
};
//# sourceMappingURL=Alert.js.map
