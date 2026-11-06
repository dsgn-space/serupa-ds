"use client";
import * as React from "react";
import { cn, omit, setRef, useIsoLayoutEffect } from "../../internal/cn";
import { component } from "../../internal/component";
import { announce } from "../../internal/announce";
import { activeIn } from "../../internal/root";
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
  onOnlineChange?: ((online: boolean) => void) | undefined;
  /** @deprecated Use onOnlineChange, named like every other callback (value and onValueChange, open and
      onOpenChange); removed in 15.0.0. Called as onOnlineChange is, when onOnlineChange isn't given. */
  onChange?: ((online: boolean) => void) | undefined;
}

const listen = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
};
// Two fixed banners can show at once (one in a layout, one in a page). Each claims the room it needs on the same
// element: the first one saves what the page had there, every one keeps its own space, the element gets the largest,
// and the last one to go puts back what the page had. Without this, the second saved the first's padding and put it
// back after both had gone (GR172).
type Claim = { had: string; base: string; spaces: Map<object, number> };
// module state: only the browser fills these, from effects, keyed by page elements and mounted banners; a server render never touches them.
const claims = new WeakMap<HTMLElement, Record<string, Claim | undefined>>(), rootSpaces = new Map<object, number>();
const claimRoom = (el: HTMLElement, prop: "paddingBlockEnd" | "paddingBlockStart" | "marginBlockEnd", who: object) => {
  const mine = claims.get(el) || {};
  claims.set(el, mine);
  const claim = mine[prop] || (mine[prop] = { had: el.style[prop], base: getComputedStyle(el)[prop], spaces: new Map() });
  let gone = false;
  return {
    set(space: number) { if (gone) return; claim.spaces.set(who, space); el.style[prop] = "calc(" + claim.base + " + " + Math.max(...claim.spaces.values()) + "px)"; },
    drop() {
      gone = true;
      claim.spaces.delete(who);
      if (claim.spaces.size) el.style[prop] = "calc(" + claim.base + " + " + Math.max(...claim.spaces.values()) + "px)";
      else { el.style[prop] = claim.had; mine[prop] = undefined; }
    },
  };
};
const setRootSpace = (root: HTMLElement, who: object, space: number | null) => {
  if (space === null) rootSpaces.delete(who); else rootSpaces.set(who, space);
  if (rootSpaces.size) root.style.setProperty("--dk-offline-banner-space", Math.max(...rootSpaces.values()) + "px");
  else root.style.removeProperty("--dk-offline-banner-space");
};
const browserOnline = () => navigator.onLine;
const serverOnline = () => true;

/* OfflineBanner: nothing while the app is online. When the connection drops, a bar ("You're offline", and your own
   words after it) slides in and the shared polite live region says so; when it comes back the bar says "Back
   online" for feedbackHold, is said too, and slides away. The bar itself isn't a live region, so it's said once. */
/** Says when the connection drops and when it comes back, on screen and to screen readers.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const OfflineBanner = /* @__PURE__ */ component<HTMLDivElement, OfflineBannerProps>("OfflineBanner", function OfflineBanner(props, ref) {
  const rest = omit(props, { online: 1, placement: 1, children: 1, onOnlineChange: 1, onChange: 1, className: 1 });
  const labels = useSettings(words).labels;
  const browser = React.useSyncExternalStore(listen, browserOnline, serverOnline);
  const online = props.online ?? browser;
  // "Back online" shows for a moment after it comes back; null until the connection first changes.
  const [back, setBack] = React.useState(false);
  // Offline from the first render, it's simply there; it slides in only when the connection drops later.
  const [instant, setInstant] = React.useState(!online);
  const was = React.useRef<boolean | null>(null);
  const onChange = React.useRef(props.onOnlineChange ?? props.onChange);
  // every render: the newest onOnlineChange is the one called when the connection changes.
  React.useEffect(() => { onChange.current = props.onOnlineChange ?? props.onChange; });
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
  const placement = props.placement === "top" || props.placement === "inline" ? props.placement : "bottom";
  // While the fixed bar shows, the page keeps what it covers clear of it (GR122, WCAG 2.4.11): its height and its gap
  // from the edge, plus a little room, go to --dk-offline-banner-space on the root, which OfflineBanner.css makes the
  // root's scroll-padding on that edge, so a field Tab moves to scrolls into view clear of the bar, not under it.
  // At the foot of the page there's nothing left to scroll, so a bottom bar also adds its space to the end of the
  // body: the last field (a form's Submit) can scroll up clear of it too. A top bar adds it to the start, so the first
  // fields aren't under it at the top of the page (GR125); below a sticky Navbar, after the Navbar (GR134). What was
  // there is put back after.
  useIsoLayoutEffect(() => {
    const n = bar.current, root = document.documentElement, body = document.body;
    if (!open || !n || placement === "inline") return;
    const side = placement === "bottom" ? "paddingBlockEnd" : "paddingBlockStart";
    // A top bar sits below a sticky Navbar, not over its links and Menu button (GR134), so its room counts from there.
    const nav = placement === "top" ? document.querySelector<HTMLElement>(".dk-navbar--sticky") : null;
    // The room goes on the page's edge, or after the Navbar, which is in the page's flow: padding the body would move
    // the Navbar down with the page.
    const room = nav || body, prop = nav ? "marginBlockEnd" : side, me = {};
    const claim = claimRoom(room, prop, me);
    const set = () => {
      // Its settled place, not where it is now: as it slides in, translate moves it a few pixels toward its edge, and
      // nothing measures again when that ends (a ResizeObserver doesn't see translate), so the room came out short
      // (GR124). Its height and its inset from the edge are where it comes to rest.
      // The room past it, --dk-offline-gap, reads as the token wrote it ("0.5rem"), not in pixels.
      const cs = getComputedStyle(n), g = cs.getPropertyValue("--dk-offline-gap").trim();
      const gap = /rem$/.test(g) ? parseFloat(g) * parseFloat(getComputedStyle(root).fontSize) : parseFloat(g) || 8;
      const inset = parseFloat(placement === "bottom" ? cs.bottom : cs.top) || 0;
      const space = Math.ceil(n.offsetHeight + inset + gap);
      setRootSpace(root, me, space);
      claim.set(Math.max(0, space - (nav ? Math.floor(nav.getBoundingClientRect().height) : 0)));
    };
    set();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(set);
    if (ro) { ro.observe(n); if (nav) ro.observe(nav); }
    window.addEventListener("resize", set);
    // Safari doesn't take scroll-padding when it scrolls a field Tab moves to into view, and leaves it under the bar.
    // After the browser's own focus scroll, the page moves by what's still covered, plus the gap. Not for the bar's own
    // controls, or a field in a dialog or popover: those sit above the page.
    let raf = 0;
    const onFocus = (e: FocusEvent) => {
      const t = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
      if (!(t instanceof Element) || n.contains(t) || t.closest("dialog, [popover]")) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // A top bar's edge is its bottom, below a sticky Navbar too: a field under either is above it.
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
  if (!open && !leaving) return null;
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
