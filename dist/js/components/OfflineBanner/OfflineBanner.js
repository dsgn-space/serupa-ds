"use client";

// src/components/OfflineBanner/OfflineBanner.tsx
import * as React from "react";
import { cn, omit, setRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
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
var browserOnline = () => navigator.onLine;
var serverOnline = () => true;
var OfflineBanner = /* @__PURE__ */ component("OfflineBanner", function OfflineBanner2(props, ref) {
  const rest = omit(props, { online: 1, placement: 1, children: 1, onChange: 1, className: 1 });
  const labels = useSettings(words).labels;
  const browser = React.useSyncExternalStore(listen, browserOnline, serverOnline);
  const online = props.online ?? browser;
  const [back, setBack] = React.useState(false);
  const [instant, setInstant] = React.useState(!online);
  const was = React.useRef(null);
  const onChange = React.useRef(props.onChange);
  React.useEffect(() => {
    onChange.current = props.onChange;
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
    const had = body.style.paddingBlockEnd, base = getComputedStyle(body).paddingBlockEnd;
    const set = () => {
      const cs = getComputedStyle(n), g = cs.getPropertyValue("--dk-offline-gap").trim();
      const gap = /rem$/.test(g) ? parseFloat(g) * parseFloat(getComputedStyle(root).fontSize) : parseFloat(g) || 8;
      const inset = parseFloat(placement === "bottom" ? cs.bottom : cs.top) || 0;
      const space = Math.ceil(n.offsetHeight + inset + gap) + "px";
      root.style.setProperty("--dk-offline-banner-space", space);
      if (placement === "bottom") body.style.paddingBlockEnd = "calc(" + base + " + " + space + ")";
    };
    set();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(set);
    if (ro) ro.observe(n);
    window.addEventListener("resize", set);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", set);
      root.style.removeProperty("--dk-offline-banner-space");
      if (placement === "bottom") body.style.paddingBlockEnd = had;
    };
  }, [open, placement]);
  if (!open && !leaving) return null;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: (n) => {
        bar.current = n;
        setRef(ref, n);
      },
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
