"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn, oneOf } from "../../internal/cn";
import { announce, ensureAnnouncer } from "../../internal/announce";
import { Icon } from "../Icon/Icon";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { named } from "../../internal/component";
import { useSerupa } from "../../internal/provider";
import { onModalChange, topModal } from "../../internal/layers";

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type ToasterPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface ToastOptions {
  /** The main line. */
  title: React.ReactNode;
  /** A muted line under it. */
  description?: React.ReactNode;
  /** 'neutral' (default, no icon), 'info', 'success', 'warning' or 'danger': an icon in the tone's color. */
  tone?: ToastTone;
  /** One button in the toast, such as Undo. Choosing it also closes the toast. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it goes. Default: 5000; 0 keeps it until it's closed. The time stops while it's hovered or focused, or the window is in the background. */
  duration?: number;
  /** What screen readers announce. Default: the title and description, when they're text. */
  announcement?: string;
  /** Reuse an id to replace a toast that's showing (say, "Saving…" → "Saved"). */
  id?: string;
}

interface Item extends ToastOptions { id: string; tone: ToastTone }
type Listener = (items: Item[]) => void;
let items: Item[] = [];
const listeners = new Set<Listener>();
let next = 0;
const emit = () => listeners.forEach((l) => l(items));
const text = (n: React.ReactNode) => (typeof n === "string" || typeof n === "number" ? String(n) : "");
const TONES: readonly ToastTone[] = ["neutral", "info", "success", "warning", "danger"];

/** Shows a toast in the page's <Toaster> and returns its id. */
function show(options: ToastOptions | string): string {
  const o: ToastOptions = typeof options === "string" ? { title: options } : options;
  const id = o.id || "dk-toast-" + ++next;
  const item: Item = Object.assign({}, o, { id: id, tone: oneOf(TONES, o.tone, "neutral") });
  const at = items.findIndex((x) => x.id === id);
  items = at >= 0 ? items.map((x, i) => (i === at ? item : x)) : items.concat(item);
  emit();
  const say = o.announcement != null ? o.announcement : [text(o.title), text(o.description)].filter(Boolean).join(". ");
  if (say) announce(say, { assertive: item.tone === "danger" });   // an error interrupts; the rest wait their turn
  return id;
}
/** Closes one toast, or every toast with no id. */
function dismiss(id?: string): void {
  items = id == null ? [] : items.filter((x) => x.id !== id);
  emit();
}
/** Shows a toast in the page's <Toaster> and returns its id; toast.dismiss(id) closes it. */
export const toast = /* @__PURE__ */ Object.assign(show, { dismiss });

export interface ToasterProps extends React.HTMLAttributes<HTMLElement> {
  /** Where toasts appear: 'bottom-end' (default), 'bottom-start', 'bottom-center', 'top-start', 'top-center' or 'top-end'. Start and end follow the text direction. */
  position?: ToasterPosition;
  /** The region's name for screen readers. Default: 'Notifications'. */
  label?: string;
  /** The close button's name. Default: 'Dismiss'. */
  dismissLabel?: string;
}

const POSITIONS: readonly ToasterPosition[] = ["top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end"];
const ICONS: Record<ToastTone, string | null> = { neutral: null, info: "info", success: "check_circle", warning: "warning", danger: "error" };

/* Toaster: where toast() messages appear. Render one, once, near the root. Each toast has a title, an optional
   description, tone icon, action and close button, and goes after its duration; the time stops while it's
   hovered or focused. New toasts are announced through the shared polite live region. */
/** The place toast() messages appear: render one, once, near the root of the app. */
export const Toaster = /* @__PURE__ */ named("Toaster", function Toaster(props: ToasterProps): React.ReactElement {
  const sds = useSerupa();
  const { position, label, dismissLabel, className, ...rest } = props;
  const [list, setList] = React.useState<Item[]>(items);
  React.useEffect(() => { ensureAnnouncer(); listeners.add(setList); setList(items); return () => { listeners.delete(setList); }; }, []);
  const pos = oneOf(POSITIONS, position, "bottom-end");
  const ordered = pos.startsWith("top") ? list.slice().reverse() : list;   // newest nearest the edge
  // While a Dialog or Drawer is open the page behind it is inert and under it, so the toasts move into it: a
  // "Couldn't save, Retry" toast from inside a dialog can be seen and clicked.
  const modal = React.useSyncExternalStore(onModalChange, topModal, () => null);
  const region = (
    <section {...rest} aria-label={label || sds.labels.notifications} className={cn("dk-toaster", "dk-toaster--" + pos, className)} data-component="toaster" data-position={pos}>
      <ol className="dk-toaster__list">
        {ordered.map((t) => <ToastView key={t.id} item={t} dismissLabel={dismissLabel || sds.labels.dismiss} />)}
      </ol>
    </section>
  );
  return modal ? createPortal(region, modal) : region;
});

function ToastView(props: { item: Item; dismissLabel: string }): React.ReactElement {
  const t = props.item;
  const duration = t.duration == null ? 5000 : t.duration;
  // Each reason to stop the time is kept apart, so leaving with the mouse doesn't restart it while focus is still inside.
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const paused = hovered || focused || hidden;
  const left = React.useRef(duration);
  React.useEffect(() => { left.current = duration; }, [t, duration]);   // a replaced toast starts its time again
  React.useEffect(() => {
    if (!duration || paused) return;
    const start = Date.now();
    const timer = window.setTimeout(() => toast.dismiss(t.id), left.current);
    return () => { window.clearTimeout(timer); left.current -= Date.now() - start; };
  }, [paused, t, duration]);
  React.useEffect(() => {
    const vis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);
  const titleId = t.id + "-title", descId = t.id + "-desc";
  const icon = ICONS[t.tone];
  return (
    <li className={cn("dk-toast", "dk-toast--" + t.tone)} data-tone={t.tone} aria-labelledby={titleId} aria-describedby={t.description != null ? descId : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}>
      {icon ? <span className="dk-toast__icon" aria-hidden="true"><Icon name={icon} /></span> : null}
      <div className="dk-toast__content">
        <p className="dk-toast__title" id={titleId}>{t.title}</p>
        {t.description != null ? <p className="dk-toast__description" id={descId}>{t.description}</p> : null}
      </div>
      {t.action ? <Button className="dk-toast__action" size="sm" variant="secondary" onClick={() => { t.action!.onClick(); toast.dismiss(t.id); }}>{t.action.label}</Button> : null}
      <IconButton className="dk-toast__close" icon="close" label={props.dismissLabel} size="sm" noTitle onClick={() => toast.dismiss(t.id)} />
    </li>
  );
}
