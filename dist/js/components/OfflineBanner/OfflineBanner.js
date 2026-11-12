"use client";

// src/components/OfflineBanner/OfflineBanner.tsx
import * as React from "react";
import { cn, omit, useMergedRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
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
  const claim = mine[prop] || (mine[prop] = { had: el.style[prop], base: getComputedStyle(el)[prop], spaces: /* @__PURE__ */ new Map() });
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
  if (rootSpaces.size) root.style.setProperty("--dk-offline-banner-space", Math.max(...rootSpaces.values()) + "px");
  else root.style.removeProperty("--dk-offline-banner-space");
};
var browserOnline = () => navigator.onLine;
var serverOnline = () => true;
var OfflineBanner = /* @__PURE__ */ component("OfflineBanner", function OfflineBanner2(props, ref) {
  const rest = omit(props, { online: 1, placement: 1, children: 1, onOnlineChange: 1, onChange: 1, className: 1 });
  const labels = useSettings(words).labels;
  const browser = React.useSyncExternalStore(listen, browserOnline, serverOnline);
  const online = props.online ?? browser;
  const [back, setBack] = React.useState(false);
  const [instant, setInstant] = React.useState(!online);
  const was = React.useRef(null);
  const onChange = React.useRef(props.onOnlineChange ?? props.onChange);
  React.useEffect(() => {
    onChange.current = props.onOnlineChange ?? props.onChange;
  });
  React.useEffect(() => {
    const before = was.current;
    was.current = online;
    if (before === online || before === null && online) return;
    announce(online ? labels.backOnline : labels.offline);
    if (before !== null) {
      onChange.current?.(online);
      setInstant(false);
    }
    setBack(online);
  }, [online, labels]);
  React.useEffect(() => {
    if (!back) return;
    const t = setTimeout(() => setBack(false), feedbackHold);
    return () => clearTimeout(t);
  }, [back]);
  const open = !online || back;
  const bar = React.useRef(null);
  const { leaving } = useExit(open, bar);
  const [shown, setShown] = React.useState("offline");
  if (open && shown !== (online ? "back" : "offline")) setShown(online ? "back" : "offline");
  const placement = props.placement === "top" || props.placement === "inline" ? props.placement : "bottom";
  useIsoLayoutEffect(() => {
    const n = bar.current, root = document.documentElement, body = document.body;
    if (!open || !n || placement === "inline") return;
    const side = placement === "bottom" ? "paddingBlockEnd" : "paddingBlockStart";
    const nav = placement === "top" ? document.querySelector(".dk-navbar--sticky") : null;
    const room = nav || body, prop = nav ? "marginBlockEnd" : side, me = {};
    const claim = claimRoom(room, prop, me);
    const set = () => {
      const cs = getComputedStyle(n), g = cs.getPropertyValue("--dk-offline-gap").trim();
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
      if (nav) ro.observe(nav);
    }
    window.addEventListener("resize", set);
    let raf = 0;
    const onFocus = (e) => {
      const t = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
      if (!(t instanceof Element) || n.contains(t) || t.closest("dialog, [popover]")) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = n.getBoundingClientRect(), r = t.getBoundingClientRect(), pad = 8;
        const by = placement === "bottom" ? Math.max(0, r.bottom - b.top + pad) : Math.min(0, r.top - b.bottom - pad);
        if (activeIn(t) === t && (placement === "bottom" ? r.bottom > b.top : r.top < b.bottom)) window.scrollBy(0, by);
      });
    };
    document.addEventListener("focusin", onFocus);
    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("resize", set);
      setRootSpace(root, me, null);
      claim.drop();
    };
  }, [open, placement]);
  const mergedRef = useMergedRef(ref, (n) => {
    bar.current = n;
  });
  if (!open && !leaving) return null;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: mergedRef,
      className: cn("dk-offline-banner", `dk-offline-banner--${placement}`, props.className),
      "data-component": "offline-banner",
      "data-instant": instant ? "" : void 0,
      "data-state": shown,
      "data-leaving": open ? void 0 : "",
      inert: open ? void 0 : true
    },
    /* @__PURE__ */ React.createElement(Icon, { className: "dk-offline-banner__icon", icon: shown === "back" ? icons.CloudDone : icons.CloudOff }),
    /* @__PURE__ */ React.createElement("span", { className: "dk-offline-banner__text" }, /* @__PURE__ */ React.createElement("strong", { className: "dk-offline-banner__title" }, shown === "back" ? labels.backOnline : labels.offline), shown === "offline" && props.children ? /* @__PURE__ */ React.createElement(React.Fragment, null, " ", props.children) : null)
  );
});
export {
  OfflineBanner
};
//# sourceMappingURL=OfflineBanner.js.map
