"use client";

// src/components/SaveStatus/SaveStatus.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { activeIn } from "../../internal/root.js";
import { Icon } from "../Icon/Icon.js";
import { LoaderRing } from "../../internal/loaderRing.js";
import { Button } from "../Button/Button.js";
import { RelativeTime } from "../RelativeTime/RelativeTime.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var STATES = ["idle", "saving", "saved", "error"];
var ORDER = ["saving", "saved", "error"];
function SaveStatusRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const {
    status: _s,
    savedAt,
    onRetry,
    errorText,
    className,
    ...rest
  } = props;
  const status = oneOf(STATES, props.status, "idle");
  const text = React.useRef(null);
  const before = React.useRef(status === "error" ? "idle" : status);
  React.useEffect(() => {
    const was = before.current;
    before.current = status;
    if (was === status) {
      return;
    }
    if (status === "saved") {
      announce(sds.labels.saved);
    } else {
      if (status === "error" && text.current) {
        announce(text.current.textContent || sds.labels.saveFailed);
      }
    }
  }, [status, sds.labels]);
  const [shown, setShown] = React.useState(status);
  const [gone, setGone] = React.useState(null);
  const [changed, setChanged] = React.useState(false);
  if (shown !== status) {
    setShown(status);
    setGone(shown === "idle" ? null : shown);
    setChanged(true);
  }
  const leaving = React.useRef(null);
  const root = React.useRef(null);
  const focusedIn = React.useRef(false);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const r = root.current;
      const a = activeIn(r);
      const lost = !a || a === document.body || !a.isConnected || r && r.contains(a) && a.closest("[inert]");
      if (!r || !focusedIn.current || !lost) {
        return;
      }
      r.tabIndex = -1;
      r.focus();
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== status) {
    t2 = [status];
    $[1] = status;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  React.useLayoutEffect(t1, t2);
  const onFocus = (e) => {
    if (rest.onFocus) {
      rest.onFocus(e);
    }
    focusedIn.current = true;
  };
  const onBlur = (e_0) => {
    if (rest.onBlur) {
      rest.onBlur(e_0);
    }
    const to = e_0.relatedTarget;
    if (to ? !e_0.currentTarget.contains(to) : !e_0.target.closest("[inert]")) {
      focusedIn.current = false;
      if (e_0.target === e_0.currentTarget) {
        e_0.currentTarget.removeAttribute("tabindex");
      }
    }
  };
  let t3;
  let t4;
  if ($[3] !== gone) {
    t3 = () => {
      if (!gone) {
        return;
      }
      const s = leaving.current && getComputedStyle(leaving.current);
      const ms = s ? Math.max(...s.transitionDuration.split(",").map(_temp)) : 0;
      if (!(ms > 0)) {
        setGone(null);
        return;
      }
      const t = window.setTimeout(() => setGone(null), ms + 50);
      return () => window.clearTimeout(t);
    };
    t4 = [gone];
    $[3] = gone;
    $[4] = t3;
    $[5] = t4;
  } else {
    t3 = $[4];
    t4 = $[5];
  }
  React.useLayoutEffect(t3, t4);
  const face = (st, out) => st === "idle" ? null : /* @__PURE__ */ React.createElement("span", { key: st, ref: out ? leaving : void 0, className: "srp-save-status__face srp-save-status__face--" + st, "data-leaving": out ? "" : void 0, "data-entering": !out && changed ? "" : void 0, inert: out || void 0, "aria-hidden": out || void 0, onTransitionEnd: out ? (e_1) => {
    if (e_1.target === e_1.currentTarget && e_1.propertyName === "opacity") {
      setGone(null);
    }
  } : void 0 }, st === "saving" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LoaderRing, { className: "srp-save-status__icon", size: "sm" }), /* @__PURE__ */ React.createElement("span", { className: "srp-save-status__text" }, sds.labels.saving)) : null, st === "saved" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { className: "srp-save-status__icon", icon: icons.Check }), /* @__PURE__ */ React.createElement("span", { className: "srp-save-status__text" }, sds.labels.saved, savedAt != null ? /* @__PURE__ */ React.createElement(React.Fragment, null, " ", /* @__PURE__ */ React.createElement(RelativeTime, { date: savedAt })) : null)) : null, st === "error" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { className: "srp-save-status__icon", icon: icons.Error }), /* @__PURE__ */ React.createElement("span", { className: "srp-save-status__text", ref: out ? void 0 : text }, errorText != null ? errorText : sds.labels.saveFailed), onRetry ? /* @__PURE__ */ React.createElement(Button, { className: "srp-save-status__retry", variant: "link", size: "sm", onClick: () => onRetry() }, sds.labels.retrySave) : null) : null);
  let t5;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = (n) => {
      root.current = n;
    };
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const mergedRef = useMergedRef(ref, t5);
  const t6 = cn("srp-save-status", "srp-save-status--" + status, className);
  const t7 = "save-status";
  const t8 = ORDER.map((st_0) => st_0 === status ? face(st_0, false) : st_0 === gone ? face(st_0, true) : null);
  let t9;
  if ($[7] !== mergedRef || $[8] !== onBlur || $[9] !== onFocus || $[10] !== rest || $[11] !== status || $[12] !== t6 || $[13] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, onFocus, onBlur, className: t6, "data-component": t7, "data-state": status }, t8);
    $[7] = mergedRef;
    $[8] = onBlur;
    $[9] = onFocus;
    $[10] = rest;
    $[11] = status;
    $[12] = t6;
    $[13] = t8;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  return t9;
}
function _temp(d) {
  return parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1e3);
}
var SaveStatus = /* @__PURE__ */ named("SaveStatus", SaveStatusRender);
export {
  SaveStatus
};
//# sourceMappingURL=SaveStatus.js.map
