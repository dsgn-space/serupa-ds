"use client";
import * as React from "react";
import { cn, omit, setRef } from "../../internal/cn";
import { component } from "../../internal/component";
import { announce } from "../../internal/announce";
import { useSettings } from "../../internal/provider";
import { feedbackHold } from "../../internal/timing";
import { useExit } from "../../internal/useExit";
import { Icon } from "../Icon/Icon";
import * as icons from "../../material/builtin";
import { en as words } from "./labels";

export interface OfflineBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Whether the app can reach its server. Leave it out to follow the browser (navigator.onLine and its online and
      offline events); set it when the app knows better, such as when its requests fail on a network that's "online". */
  online?: boolean | undefined;
  /** 'bottom' (default) or 'top': fixed to that edge of the screen, in the middle. 'inline': where you put it. */
  placement?: "bottom" | "top" | "inline" | undefined;
  /** More words after "You're offline", such as what still works: "Changes are kept and sent when you're back." */
  children?: React.ReactNode | undefined;
  /** Called when the connection drops (false) or comes back (true). */
  onChange?: ((online: boolean) => void) | undefined;
}

const listen = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
};
const browserOnline = () => navigator.onLine;
const serverOnline = () => true;

/* OfflineBanner: nothing while the app is online. When the connection drops, a bar ("You're offline", and your own
   words after it) slides in and the shared polite live region says so; when it comes back the bar says "Back
   online" for feedbackHold, is said too, and slides away. The bar itself isn't a live region, so it's said once. */
/** Says when the connection drops and when it comes back, on screen and to screen readers.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const OfflineBanner = /* @__PURE__ */ component<HTMLDivElement, OfflineBannerProps>("OfflineBanner", function OfflineBanner(props, ref) {
  const rest = omit(props, { online: 1, placement: 1, children: 1, onChange: 1, className: 1 });
  const labels = useSettings(words).labels;
  const browser = React.useSyncExternalStore(listen, browserOnline, serverOnline);
  const online = props.online ?? browser;
  // "Back online" shows for a moment after it comes back; null until the connection first changes.
  const [back, setBack] = React.useState(false);
  // Offline from the first render, it's simply there; it slides in only when the connection drops later.
  const [instant, setInstant] = React.useState(!online);
  const was = React.useRef<boolean | null>(null);
  const onChange = React.useRef(props.onChange);
  // every render: the newest onChange is the one called when the connection changes.
  React.useEffect(() => { onChange.current = props.onChange; });
  React.useEffect(() => {
    const before = was.current;
    was.current = online;
    if (before === online || (before === null && online)) return;   // no change, or online from the start
    announce(online ? labels.backOnline : labels.offline);
    if (before !== null) { onChange.current?.(online); setInstant(false); }
    setBack(online);
  }, [online, labels]);
  React.useEffect(() => {
    if (!back) return;
    const t = setTimeout(() => setBack(false), feedbackHold);
    return () => clearTimeout(t);
  }, [back]);

  const open = !online || back;
  const bar = React.useRef<HTMLDivElement | null>(null);
  const { leaving } = useExit(open, bar);
  const [shown, setShown] = React.useState<"offline" | "back">("offline");
  if (open && shown !== (online ? "back" : "offline")) setShown(online ? "back" : "offline");
  if (!open && !leaving) return null;
  const placement = props.placement === "top" || props.placement === "inline" ? props.placement : "bottom";
  return (
    <div {...rest} ref={(n) => { bar.current = n; setRef(ref, n); }} className={cn("dk-offline-banner", `dk-offline-banner--${placement}`, props.className)} data-component="offline-banner" data-instant={instant ? "" : undefined}
      data-state={shown} data-leaving={open ? undefined : ""} inert={open ? undefined : true}>
      <Icon className="dk-offline-banner__icon" icon={shown === "back" ? icons.CloudDone : icons.CloudOff} />
      <span className="dk-offline-banner__text">
        <strong className="dk-offline-banner__title">{shown === "back" ? labels.backOnline : labels.offline}</strong>
        {shown === "offline" && props.children ? <> {props.children}</> : null}
      </span>
    </div>
  );
});
