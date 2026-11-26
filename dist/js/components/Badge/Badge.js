"use client";

// src/components/Badge/Badge.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { useCut } from "../../internal/useCut.js";
import { config } from "../../internal/config.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { useShowAfter } from "../../internal/showAfter.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { block, both, chain, pressKey, releaseKey } from "../../internal/interactions.js";
import { warnOnce } from "../../internal/warn.js";
import { removeAndRefocus } from "../../internal/removeFocus.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { LoaderRing } from "../../internal/loaderRing.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import { named } from "../../internal/component.js";
import * as icons from "../../material/builtin.js";
var VARIANTS = ["subtle", "solid", "outline"];
var TONES = ["neutral", "primary", "success", "warning", "danger", "info", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
var PLAIN = {
  useGrouping: false
};
var OWN = {
  variant: 1,
  tone: 1,
  dot: 1,
  ping: 1,
  startIcon: 1,
  count: 1,
  max: 1,
  showZero: 1,
  onRemove: 1,
  removeLabel: 1,
  loading: 1,
  loadingLabel: 1,
  className: 1,
  children: 1
};
function BadgeRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const locale = useLocale();
  const rest = omit(props, OWN);
  const variant = oneOf(VARIANTS, props.variant, "subtle");
  const tone = oneOf(TONES, props.tone, "neutral");
  const loading = useShowAfter(!!props.loading, 0);
  const loadingText = props.loadingLabel ?? sds.labels.loading;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(_temp, t1);
  const wasLoading = React.useRef(false);
  React.useEffect(function() {
    if (loading && !wasLoading.current && loadingText) {
      announce(loadingText);
    }
    wasLoading.current = loading;
  }, [loading, loadingText]);
  const isCount = props.count != null;
  const text = !isCount && (typeof props.children === "string" || typeof props.children === "number") ? String(props.children) : "";
  const tipOk = !!text && rest.title == null && !rest["aria-label"] && !rest["aria-labelledby"] && !rest["aria-describedby"];
  const node = React.useRef(null);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => node.current && node.current.querySelector(".srp-badge__label");
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const cut = useCut(tipOk, text, t2);
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (n) => {
      node.current = n;
    };
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const setNode = useMergedRef(ref, t3);
  let label = props.children;
  if (isCount) {
    const n_0 = Math.max(0, Math.floor(Number(props.count)) || 0);
    const max = props.max != null && Number.isFinite(Number(props.max)) ? Math.max(1, Math.floor(Number(props.max))) : 99;
    if (n_0 === 0 && !props.showZero) {
      return null;
    }
    label = displayNumber(Math.min(n_0, max), locale, PLAIN) + (n_0 > max ? "+" : "");
    if (n_0 > max) {
      let t42;
      if ($[3] !== locale || $[4] !== n_0) {
        t42 = displayNumber(n_0, locale, PLAIN);
        $[3] = locale;
        $[4] = n_0;
        $[5] = t42;
      } else {
        t42 = $[5];
      }
      const full = t42;
      let t5;
      if ($[6] !== label) {
        t5 = /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, label);
        $[6] = label;
        $[7] = t5;
      } else {
        t5 = $[7];
      }
      let t6;
      if ($[8] !== full) {
        t6 = /* @__PURE__ */ React.createElement(VisuallyHidden, null, full);
        $[8] = full;
        $[9] = t6;
      } else {
        t6 = $[9];
      }
      let t7;
      if ($[10] !== t5 || $[11] !== t6) {
        t7 = /* @__PURE__ */ React.createElement(React.Fragment, null, t5, t6);
        $[10] = t5;
        $[11] = t6;
        $[12] = t7;
      } else {
        t7 = $[12];
      }
      label = t7;
      if (rest.title == null) {
        rest.title = full;
      }
    }
  }
  const isLink = rest.href != null;
  const interactive = isLink || typeof rest.onClick === "function";
  let removable = !isCount && typeof props.onRemove === "function";
  if (removable && interactive) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce("badge-remove-interactive", "Badge: onRemove is ignored on a badge with onClick or href (a button can't hold another button).");
    }
    removable = false;
  }
  const hasLabel = !(label == null || label === false || label === "");
  if (!isCount && props.dot && !hasLabel && (props.startIcon == null || props.startIcon === false)) {
    if (process.env.NODE_ENV !== "production" && (interactive || typeof props.onRemove === "function")) {
      warnOnce("badge-indicator", "Badge: a dot indicator can't be clicked or removed (it's too small to target); name and handle the control it sits on.");
    }
    delete rest.href;
    delete rest.onClick;
    delete rest.type;
    delete rest.disabled;
    delete rest.target;
    delete rest.rel;
    rest["data-component"] = "badge";
    rest["data-variant"] = "indicator";
    rest["data-tone"] = tone;
    if (rest["aria-label"] || rest["aria-labelledby"]) {
      rest.role = rest.role || "img";
    } else {
      rest["aria-hidden"] = true;
    }
    return /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cn("srp-badge", "srp-badge--indicator", "srp-badge--tone-" + tone, props.ping && "srp-badge--ping", props.className) });
  }
  if (cut && tipOk) {
    rest.title = text;
  }
  rest["data-component"] = "badge";
  rest["data-variant"] = variant;
  rest["data-tone"] = tone;
  if (interactive) {
    rest["data-interactive"] = "";
  }
  if (loading) {
    rest["aria-busy"] = true;
    rest["data-loading"] = "";
    if (interactive) {
      rest["aria-disabled"] = true;
      rest.onClick = block;
    }
  }
  const icon = !isCount && props.startIcon != null && props.startIcon !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-badge__icon", "aria-hidden": true, key: "icon" }, asIcon(props.startIcon)) : null;
  const dot = !isCount && !icon && props.dot ? /* @__PURE__ */ React.createElement("span", { className: "srp-badge__icon srp-badge__icon--dot", "aria-hidden": true, key: "dot" }, /* @__PURE__ */ React.createElement("span", { className: "srp-badge__dot" })) : null;
  const named2 = typeof label === "string" || typeof label === "number" ? " " + label : "";
  const remove = removable ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-badge__remove", key: "remove", onClick: (e) => removeAndRefocus(e, props.onRemove, ".srp-badge", ".srp-badge__remove"), disabled: loading || void 0, "aria-label": (props.removeLabel || sds.labels.remove) + named2 }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Close })) : null;
  let t4;
  if ($[13] !== loading) {
    t4 = loading ? /* @__PURE__ */ React.createElement("span", { className: "srp-badge__loader", "aria-hidden": true, key: "loader" }, /* @__PURE__ */ React.createElement(LoaderRing, null)) : null;
    $[13] = loading;
    $[14] = t4;
  } else {
    t4 = $[14];
  }
  const spin = t4;
  const classes = cn("srp-badge", "srp-badge--" + variant, "srp-badge--tone-" + tone, isCount && "srp-badge--count", (icon || dot) && "srp-badge--lead", dot && props.ping && "srp-badge--ping", removable && "srp-badge--removable", interactive && "srp-badge--interactive", loading && "srp-badge--loading", props.className);
  const content = /* @__PURE__ */ React.createElement(React.Fragment, null, dot, icon, /* @__PURE__ */ React.createElement("span", { className: "srp-badge__label" }, label), remove, spin);
  if (loading) {
    rest["data-loading"] = "";
  }
  if (interactive) {
    rest.onKeyDown = chain(rest.onKeyDown, pressKey);
    rest.onKeyUp = both(rest.onKeyUp, releaseKey);
    rest.onBlur = both(rest.onBlur, releaseKey);
  }
  if (isLink) {
    if (rest.target === "_blank" && rest.rel == null) {
      rest.rel = "noopener noreferrer";
    }
    delete rest.type;
    if (rest.disabled) {
      delete rest.href;
      delete rest.disabled;
      rest.role = "link";
      rest["aria-disabled"] = true;
      rest.onClick = block;
      return React.createElement("a", Object.assign(rest, {
        ref: setNode,
        className: classes
      }), content);
    }
    return React.createElement(config.link, Object.assign(rest, {
      ref: setNode,
      className: classes
    }), content);
  }
  if (interactive && rest.type === void 0) {
    rest.type = "button";
  }
  return React.createElement(interactive ? "button" : "span", Object.assign(rest, {
    ref: setNode,
    className: classes
  }), content);
}
function _temp() {
  ensureAnnouncer();
}
var Badge = /* @__PURE__ */ named("Badge", BadgeRender);
export {
  Badge
};
//# sourceMappingURL=Badge.js.map
