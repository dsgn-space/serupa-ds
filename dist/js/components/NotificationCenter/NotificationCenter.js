"use client";

// src/components/NotificationCenter/NotificationCenter.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, oneOf, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { Drawer } from "../Drawer/Drawer.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { Icon } from "../Icon/Icon.js";
import { RelativeTime } from "../RelativeTime/RelativeTime.js";
import { watchToasts } from "../Toast/Toast.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
function useToastHistory(options) {
  const $ = _c(11);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = [];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const [items, setItems] = React.useState(t0);
  const limit = Math.max(1, Math.floor(options && options.limit && options.limit > 0 ? options.limit : 50));
  let t1;
  let t2;
  if ($[1] !== limit) {
    t1 = () => watchToasts((t) => {
      const time = Date.now();
      setItems((l) => [{
        id: t.id,
        title: t.title,
        description: t.description,
        tone: t.tone,
        time,
        read: false
      }, ...l.filter((x) => x.id !== t.id)].slice(0, limit));
    });
    t2 = [limit];
    $[1] = limit;
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  React.useEffect(t1, t2);
  let t3;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (id) => setItems((l_0) => l_0.map((x_0) => id == null || x_0.id === id ? Object.assign({}, x_0, {
      read: true
    }) : x_0));
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const markRead = t3;
  let t4;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => setItems([]);
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const clear = t4;
  let t5;
  if ($[6] !== items) {
    t5 = items.filter(_temp);
    $[6] = items;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== items || $[9] !== t5.length) {
    t6 = {
      items,
      unread: t5.length,
      markRead,
      clear
    };
    $[8] = items;
    $[9] = t5.length;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
function _temp(x_1) {
  return !x_1.read;
}
var ICONS = {
  neutral: null,
  info: icons.Info,
  success: icons.CheckCircle,
  warning: icons.Warning,
  danger: icons.Error
};
var TONES = ["neutral", "info", "success", "warning", "danger"];
function NotificationCenterRender(t0) {
  const $ = _c(14);
  const {
    ref,
    ...props
  } = t0;
  const labels = useSettings(words).labels;
  const base = domId("srp-nc", React.useId());
  const rest = omit(props, {
    title: 1,
    description: 1,
    footer: 1,
    children: 1,
    items: 1,
    onMarkRead: 1,
    onMarkAllRead: 1,
    onClear: 1,
    emptyText: 1,
    settingsHref: 1,
    className: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    placement: 1,
    size: 1,
    modal: 1,
    closeButton: 1,
    closeLabel: 1,
    closeOnBackdrop: 1,
    swipeToClose: 1,
    initialFocus: 1,
    finalFocus: 1,
    unsaved: 1,
    snapPoints: 1,
    snap: 1,
    defaultSnap: 1,
    onSnapChange: 1
  });
  const emptyText = props.emptyText;
  const {
    items,
    onMarkRead,
    onMarkAllRead,
    onClear
  } = props;
  const markAll = !!onMarkAllRead && items.some(_temp2);
  const clear = !!onClear && items.length > 0;
  const clearButton = React.useRef(null);
  const fromFooter = React.useRef(false);
  const [asking, setAsking] = React.useState(false);
  const keep = React.useRef(null);
  const askId = base + "-ask";
  let t1;
  let t2;
  if ($[0] !== asking) {
    t1 = () => {
      if (asking) {
        keep.current?.focus();
      }
    };
    t2 = [asking];
    $[0] = asking;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  useIsoLayoutEffect(t1, t2);
  if (asking && !clear) {
    setAsking(false);
  }
  const footer = asking && clear ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "srp-notification-center__ask", id: askId }, labels.clearNotificationsConfirm), /* @__PURE__ */ React.createElement(Button, { destructive: true, variant: "outline", size: "sm", onClick: () => {
    fromFooter.current = true;
    setAsking(false);
    onClear?.();
  } }, labels.clearNotifications), /* @__PURE__ */ React.createElement(Button, { ref: keep, variant: "ghost", size: "sm", "aria-describedby": askId, onClick: () => {
    setAsking(false);
    requestAnimationFrame(() => clearButton.current?.focus());
  } }, labels.keepNotifications)) : markAll || clear || props.settingsHref ? /* @__PURE__ */ React.createElement(React.Fragment, null, props.settingsHref ? /* @__PURE__ */ React.createElement(Button, { className: "srp-notification-center__settings", href: props.settingsHref, variant: "link", size: "sm" }, labels.notificationSettings) : null, markAll ? /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => {
    fromFooter.current = true;
    onMarkAllRead?.();
  } }, labels.markAllRead) : null, clear ? /* @__PURE__ */ React.createElement(Button, { ref: clearButton, variant: "ghost", size: "sm", onClick: () => setAsking(true) }, labels.clearNotifications) : null) : null;
  const list = React.useRef(null);
  const none = React.useRef(null);
  const at = React.useRef(-1);
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (t) => {
      const l = list.current;
      const li = t instanceof Element ? t.closest("li") : null;
      return l && li && li.parentElement === l ? Array.prototype.indexOf.call(l.children, li) : -1;
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const rowOf = t3;
  let t4;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => {
      if (fromFooter.current) {
        fromFooter.current = false;
        const active = document.activeElement;
        if (!active || active === document.body || !active.isConnected) {
          (clearButton.current || list.current?.firstElementChild || none.current)?.focus();
        }
        return;
      }
      if (at.current < 0) {
        return;
      }
      const active_0 = document.activeElement;
      const l_0 = list.current;
      if (active_0 && active_0 !== document.body && active_0.isConnected) {
        at.current = rowOf(active_0);
        return;
      }
      const rows = l_0 ? l_0.children : null;
      const to = rows && rows.length ? rows[Math.min(at.current, rows.length - 1)] : none.current;
      at.current = -1;
      if (to) {
        to.focus();
      }
    };
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  useIsoLayoutEffect(t4, [items]);
  const T0 = Drawer;
  const t5 = cn("srp-notification-center", props.className);
  const t6 = props.title != null ? props.title : labels.notificationCenter;
  const t7 = items.length ? /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-notification-center__list", ref: list, onFocus: (e) => {
    at.current = rowOf(e.target);
    fromFooter.current = false;
  }, onBlur: (e_0) => {
    if (e_0.relatedTarget && !e_0.currentTarget.contains(e_0.relatedTarget)) {
      at.current = -1;
    }
  } }, items.map((n_0, i) => {
    const tone = oneOf(TONES, n_0.tone, "neutral");
    const icon = ICONS[tone];
    const titleId = base + "-" + i;
    return /* @__PURE__ */ React.createElement("li", { key: n_0.id, tabIndex: -1, className: cn("srp-notification-center__item", "srp-notification-center__item--" + tone), "data-tone": tone, "data-read": n_0.read ? "" : void 0 }, icon ? /* @__PURE__ */ React.createElement("span", { className: "srp-notification-center__icon", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon })) : null, /* @__PURE__ */ React.createElement("div", { className: "srp-notification-center__content" }, /* @__PURE__ */ React.createElement("p", { className: "srp-notification-center__title" }, n_0.read ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, labels.unreadNotification + ": "), /* @__PURE__ */ React.createElement("span", { id: titleId }, n_0.title)), n_0.description != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-notification-center__description" }, n_0.description) : null, n_0.time != null ? /* @__PURE__ */ React.createElement(RelativeTime, { className: "srp-notification-center__time", date: n_0.time, format: "short" }) : null), n_0.read ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-notification-center__dot", "aria-hidden": "true" }), !n_0.read && onMarkRead ? /* @__PURE__ */ React.createElement(Tooltip, { content: labels.markRead, role: "label" }, /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Check, label: labels.markRead, hideTitle: true, "aria-describedby": titleId, size: "sm", onClick: (e_1) => {
      e_1.currentTarget.closest("li")?.focus();
      onMarkRead(n_0.id);
    } })) : null);
  })) : /* @__PURE__ */ React.createElement("p", { className: "srp-notification-center__empty", ref: none, tabIndex: -1 }, emptyText != null ? emptyText : labels.noNotifications);
  let t8;
  if ($[5] !== T0 || $[6] !== footer || $[7] !== props || $[8] !== ref || $[9] !== rest || $[10] !== t5 || $[11] !== t6 || $[12] !== t7) {
    t8 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, className: t5, open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange, placement: props.placement, size: props.size, modal: props.modal, closeButton: props.closeButton, closeLabel: props.closeLabel, closeOnBackdrop: props.closeOnBackdrop, swipeToClose: props.swipeToClose, initialFocus: props.initialFocus, finalFocus: props.finalFocus, title: t6, footer }, t7);
    $[5] = T0;
    $[6] = footer;
    $[7] = props;
    $[8] = ref;
    $[9] = rest;
    $[10] = t5;
    $[11] = t6;
    $[12] = t7;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  return t8;
}
function _temp2(n) {
  return !n.read;
}
var NotificationCenter = /* @__PURE__ */ named("NotificationCenter", NotificationCenterRender);
export {
  NotificationCenter,
  useToastHistory
};
//# sourceMappingURL=NotificationCenter.js.map
