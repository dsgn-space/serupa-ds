"use client";

// src/components/OfflineBanner/OfflineBanner.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { activeIn } from "../../internal/root.js";
import { useSettings } from "../../internal/provider.js";
import { feedbackHold } from "../../internal/timing.js";
import { useExit } from "../../internal/useExit.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var listen = (cb) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};
var claims = /* @__PURE__ */ new WeakMap();
var rootSpaces = /* @__PURE__ */ new Map();
var claimRoom = (el, prop, who) => {
  const mine = claims.get(el) || {};
  claims.set(el, mine);
  const claim = mine[prop] || (mine[prop] = {
    had: el.style[prop],
    base: getComputedStyle(el)[prop],
    spaces: /* @__PURE__ */ new Map()
  });
  let gone = false;
  return {
    set(space) {
      if (gone) return;
      claim.spaces.set(who, space);
      el.style[prop] = "calc(" + claim.base + " + " + Math.max(...claim.spaces.values()) + "px)";
    },
    drop() {
      gone = true;
      claim.spaces.delete(who);
      if (claim.spaces.size) el.style[prop] = "calc(" + claim.base + " + " + Math.max(...claim.spaces.values()) + "px)";
      else {
        el.style[prop] = claim.had;
        mine[prop] = void 0;
      }
    }
  };
};
var setRootSpace = (root, who, space) => {
  if (space === null) rootSpaces.delete(who);
  else rootSpaces.set(who, space);
  if (rootSpaces.size) root.style.setProperty("--srp-offline-banner-space", Math.max(...rootSpaces.values()) + "px");
  else root.style.removeProperty("--srp-offline-banner-space");
};
var browserOnline = () => navigator.onLine;
var serverOnline = () => true;
function OfflineBannerRender(t0) {
  const $ = _c(41);
  let props;
  let ref;
  let t1;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    t1 = omit(props, {
      online: 1,
      placement: 1,
      children: 1,
      onOnlineChange: 1,
      className: 1
    });
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
    $[3] = t1;
  } else {
    props = $[1];
    ref = $[2];
    t1 = $[3];
  }
  const rest = t1;
  const labels = useSettings(words).labels;
  const browser = React.useSyncExternalStore(listen, browserOnline, serverOnline);
  const online = props.online ?? browser;
  const [back, setBack] = React.useState(false);
  const [instant, setInstant] = React.useState(!online);
  const was = React.useRef(null);
  const onChange = React.useRef(props.onOnlineChange);
  let t2;
  if ($[4] !== props.onOnlineChange) {
    t2 = () => {
      onChange.current = props.onOnlineChange;
    };
    $[4] = props.onOnlineChange;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  React.useEffect(t2);
  let t3;
  let t4;
  if ($[6] !== labels || $[7] !== online) {
    t3 = () => {
      const before = was.current;
      was.current = online;
      if (before === online || before === null && online) {
        return;
      }
      announce(online ? labels.backOnline : labels.offline);
      if (before !== null) {
        onChange.current?.(online);
        setInstant(false);
      }
      setBack(online);
    };
    t4 = [online, labels];
    $[6] = labels;
    $[7] = online;
    $[8] = t3;
    $[9] = t4;
  } else {
    t3 = $[8];
    t4 = $[9];
  }
  React.useEffect(t3, t4);
  let t5;
  let t6;
  if ($[10] !== back) {
    t5 = () => {
      if (!back) {
        return;
      }
      const t = setTimeout(() => setBack(false), feedbackHold);
      return () => clearTimeout(t);
    };
    t6 = [back];
    $[10] = back;
    $[11] = t5;
    $[12] = t6;
  } else {
    t5 = $[11];
    t6 = $[12];
  }
  React.useEffect(t5, t6);
  const open = !online || back;
  const bar = React.useRef(null);
  const {
    leaving
  } = useExit(open, bar);
  const [shown, setShown] = React.useState("offline");
  if (open && shown !== (online ? "back" : "offline")) {
    setShown(online ? "back" : "offline");
  }
  const placement = props.placement === "top" || props.placement === "inline" ? props.placement : "bottom";
  let t7;
  let t8;
  if ($[13] !== open || $[14] !== placement) {
    t7 = () => {
      const n = bar.current;
      const root = document.documentElement;
      const body = document.body;
      if (!open || !n || placement === "inline") {
        return;
      }
      const side = placement === "bottom" ? "paddingBlockEnd" : "paddingBlockStart";
      const nav = placement === "top" ? document.querySelector(".srp-navbar--sticky") : null;
      const room = nav || body;
      const prop = nav ? "marginBlockEnd" : side;
      const me = {};
      const claim = claimRoom(room, prop, me);
      const set = () => {
        const cs = getComputedStyle(n);
        const g = cs.getPropertyValue("--srp-offline-gap").trim();
        const gap = /rem$/.test(g) ? parseFloat(g) * parseFloat(getComputedStyle(root).fontSize) : parseFloat(g) || 8;
        const inset = parseFloat(placement === "bottom" ? cs.bottom : cs.top) || 0;
        const space = Math.ceil(n.offsetHeight + inset + gap);
        setRootSpace(root, me, space);
        claim.set(Math.max(0, space - (nav ? Math.floor(nav.getBoundingClientRect().height) : 0)));
      };
      set();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(set);
      if (ro) {
        ro.observe(n);
        if (nav) {
          ro.observe(nav);
        }
      }
      window.addEventListener("resize", set);
      let raf = 0;
      const onFocus = (e) => {
        const t_0 = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
        if (!(t_0 instanceof Element) || n.contains(t_0) || t_0.closest("dialog, [popover]")) {
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const b = n.getBoundingClientRect();
          const r = t_0.getBoundingClientRect();
          const by = placement === "bottom" ? Math.max(0, r.bottom - b.top + 8) : Math.min(0, r.top - b.bottom - 8);
          if (activeIn(t_0) === t_0 && (placement === "bottom" ? r.bottom > b.top : r.top < b.bottom)) {
            window.scrollBy(0, by);
          }
        });
      };
      document.addEventListener("focusin", onFocus);
      return () => {
        if (ro) {
          ro.disconnect();
        }
        cancelAnimationFrame(raf);
        document.removeEventListener("focusin", onFocus);
        window.removeEventListener("resize", set);
        setRootSpace(root, me, null);
        claim.drop();
      };
    };
    t8 = [open, placement];
    $[13] = open;
    $[14] = placement;
    $[15] = t7;
    $[16] = t8;
  } else {
    t7 = $[15];
    t8 = $[16];
  }
  useIsoLayoutEffect(t7, t8);
  let t9;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = (n_0) => {
      bar.current = n_0;
    };
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  const mergedRef = useMergedRef(ref, t9);
  if (!open && !leaving) {
    return null;
  }
  const t10 = `srp-offline-banner--${placement}`;
  let t11;
  if ($[18] !== props.className || $[19] !== t10) {
    t11 = cn("srp-offline-banner", t10, props.className);
    $[18] = props.className;
    $[19] = t10;
    $[20] = t11;
  } else {
    t11 = $[20];
  }
  const t12 = instant ? "" : void 0;
  const t13 = open ? void 0 : "";
  const t14 = open ? void 0 : true;
  const t15 = shown === "back" ? icons.CloudDone : icons.CloudOff;
  let t16;
  if ($[21] !== t15) {
    t16 = /* @__PURE__ */ React.createElement(Icon, { className: "srp-offline-banner__icon", icon: t15 });
    $[21] = t15;
    $[22] = t16;
  } else {
    t16 = $[22];
  }
  const t17 = shown === "back" ? labels.backOnline : labels.offline;
  let t18;
  if ($[23] !== t17) {
    t18 = /* @__PURE__ */ React.createElement("strong", { className: "srp-offline-banner__title" }, t17);
    $[23] = t17;
    $[24] = t18;
  } else {
    t18 = $[24];
  }
  let t19;
  if ($[25] !== props.children || $[26] !== shown) {
    t19 = shown === "offline" && props.children ? /* @__PURE__ */ React.createElement(React.Fragment, null, " ", props.children) : null;
    $[25] = props.children;
    $[26] = shown;
    $[27] = t19;
  } else {
    t19 = $[27];
  }
  let t20;
  if ($[28] !== t18 || $[29] !== t19) {
    t20 = /* @__PURE__ */ React.createElement("span", { className: "srp-offline-banner__text" }, t18, t19);
    $[28] = t18;
    $[29] = t19;
    $[30] = t20;
  } else {
    t20 = $[30];
  }
  let t21;
  if ($[31] !== mergedRef || $[32] !== rest || $[33] !== shown || $[34] !== t11 || $[35] !== t12 || $[36] !== t13 || $[37] !== t14 || $[38] !== t16 || $[39] !== t20) {
    t21 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, className: t11, "data-component": "offline-banner", "data-instant": t12, "data-state": shown, "data-leaving": t13, inert: t14 }, t16, t20);
    $[31] = mergedRef;
    $[32] = rest;
    $[33] = shown;
    $[34] = t11;
    $[35] = t12;
    $[36] = t13;
    $[37] = t14;
    $[38] = t16;
    $[39] = t20;
    $[40] = t21;
  } else {
    t21 = $[40];
  }
  return t21;
}
var OfflineBanner = /* @__PURE__ */ named("OfflineBanner", OfflineBannerRender);
export {
  OfflineBanner
};
//# sourceMappingURL=OfflineBanner.js.map
