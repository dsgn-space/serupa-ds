import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn";
import { config } from "../../internal/config";
import { cssLength, hideLayer, place, showLayer, type Placement } from "../../internal/position";
import { asIcon } from "../Icon/Icon";

export interface MenuProps {
  /** The button that opens the menu: one element, such as a Button or IconButton. It gets aria-haspopup, aria-expanded and the keys. */
  trigger: React.ReactElement;
  /** MenuItem, MenuGroup and MenuSeparator. */
  children: React.ReactNode;
  /** Where the menu goes: 'bottom-start' (default), 'bottom-end', 'top-start', 'top-end', or any Tooltip placement. It flips when there's no room. */
  placement?: Placement;
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The menu's name for screen readers. Default: the trigger's text, by aria-labelledby. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface Ctx { close: (focusTrigger: boolean) => void }
const MenuContext = React.createContext<Ctx | null>(null);
const ITEMS = '[role="menuitem"]';

/* Menu: a list of actions behind a button, following the WAI-ARIA menu button pattern. Enter, Space or ↓ on the
   button opens it on the first item (↑ on the last); ↑ ↓ move (wrapping), Home and End jump, typing a letter
   goes to the next item starting with it, Enter or Space chooses, Escape closes, and focus goes back to the
   button. Tab, a click outside or choosing an item closes it. It sits in the top layer next to the button. */
/** A list of actions behind a button: MenuItem, MenuGroup and MenuSeparator inside. */
export function Menu(props: MenuProps): React.ReactElement {
  const id = domId("dk-menu", React.useId());
  const [inner, setInner] = React.useState(false);
  const controlled = props.open !== undefined;
  const open = controlled ? !!props.open : inner;
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const focusOn = React.useRef<"first" | "last" | null>(null);
  const ask = React.useRef(props.onOpenChange); ask.current = props.onOpenChange;
  const set = React.useCallback((v: boolean) => { if (!controlled) setInner(v); if (ask.current) ask.current(v); }, [controlled]);
  const close = React.useCallback((focusTrigger: boolean) => { set(false); if (focusTrigger && triggerRef.current) triggerRef.current.focus(); }, [set]);
  const ctx = React.useMemo(() => ({ close }), [close]);
  const items = () => menuRef.current ? Array.from(menuRef.current.querySelectorAll<HTMLElement>(ITEMS)) : [];

  useIsoLayoutEffect(() => {
    const menu = menuRef.current, trigger = triggerRef.current;
    if (!menu) return;
    if (!open || !trigger) { hideLayer(menu); return; }
    showLayer(menu);
    const update = () => {
      const r = place(trigger.getBoundingClientRect(), { width: menu.offsetWidth, height: menu.offsetHeight }, props.placement, cssLength(menu, "--dk-menu-offset"), "bottom-start");
      menu.style.left = r.x + "px"; menu.style.top = r.y + "px"; menu.dataset.side = r.side;
    };
    update();
    const list = items();
    const target = focusOn.current === "last" ? list[list.length - 1] : list[0];
    focusOn.current = null;
    if (target) target.focus(); else menu.focus();
    window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open, props.placement]);

  // A press outside the menu and its button closes it (focus stays where the press put it).
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      close(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open, close]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = items(), i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); if (list.length) list[(n + list.length) % list.length].focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i < 0 ? list.length - 1 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Tab") close(false);
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const k = e.key.toLowerCase();
      for (let s = 1; s <= list.length; s++) {
        const it = list[(i + s) % list.length];
        const label = it.querySelector(".dk-menu__label") || it;
        if ((label.textContent || "").trim().toLowerCase().startsWith(k)) { it.focus(); break; }
      }
    }
  };

  const child = React.Children.only(props.trigger) as React.ReactElement<any>;
  const cp = child.props;
  const childRef = (child as any).ref;
  const trigger = React.cloneElement(child, {
    ref: (n: HTMLElement | null) => { triggerRef.current = n; if (typeof childRef === "function") childRef(n); else if (childRef && typeof childRef === "object") childRef.current = n; },
    id: cp.id || id + "-button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e: React.MouseEvent) => { if (cp.onClick) cp.onClick(e); if (e.defaultPrevented) return; if (!open) focusOn.current = "first"; set(!open); },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (cp.onKeyDown) cp.onKeyDown(e);
      if (e.defaultPrevented) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); focusOn.current = e.key === "ArrowUp" ? "last" : "first"; set(true); }
    },
  });
  return (
    <MenuContext.Provider value={ctx}>
      {trigger}
      <div ref={menuRef} id={id} role="menu" tabIndex={-1} {...{ popover: "manual" }} hidden={!open || undefined}
        aria-label={props["aria-label"]} aria-labelledby={props["aria-label"] ? undefined : cp.id || id + "-button"}
        className={cn("dk-menu", props.className)} style={props.style} data-component="menu" data-state={open ? "open" : "closed"} onKeyDown={onMenuKey}>
        {open ? props.children : null}
      </div>
    </MenuContext.Provider>
  );
}
Menu.displayName = "Menu";

export interface MenuItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Called when the item is chosen (click, Enter or Space). The menu then closes, unless you call event.preventDefault(). */
  onSelect?: (event: React.SyntheticEvent) => void;
  /** An icon before the label: an icon name or any element. */
  icon?: React.ReactNode;
  /** A keyboard shortcut shown at the end, such as "⌘K". Only a hint: wire the shortcut yourself. */
  shortcut?: string;
  /** Danger colors, for deleting. */
  destructive?: boolean;
  /** Still reachable with the keys, but can't be chosen (aria-disabled). */
  disabled?: boolean;
  /** Makes it a link (the configure({ link }) component, <a> by default). */
  href?: string;
  target?: string;
  rel?: string;
}

/** One action in a Menu. */
export const MenuItem = React.forwardRef<HTMLElement, MenuItemProps>(function MenuItem(props, ref) {
  const ctx = React.useContext(MenuContext);
  const rest = omit(props, { onSelect: 1, icon: 1, shortcut: 1, destructive: 1, disabled: 1, className: 1, children: 1, onClick: 1, onKeyDown: 1, onPointerMove: 1 });
  const own = { onClick: props.onClick, onKeyDown: props.onKeyDown, onPointerMove: props.onPointerMove };
  const choose = (e: React.SyntheticEvent) => {
    if (props.disabled) { e.preventDefault(); return; }
    if (props.onSelect) props.onSelect(e);
    if (!e.defaultPrevented && ctx) ctx.close(true);
  };
  const onClick = (e: React.MouseEvent<HTMLElement>) => { if (own.onClick) own.onClick(e); if (rest.href != null && !props.disabled) { if (props.onSelect) props.onSelect(e); if (ctx) ctx.close(false); return; } choose(e); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (own.onKeyDown) own.onKeyDown(e);
    if (e.defaultPrevented) return;
    if (e.key === "Enter" || e.key === " ") { if (rest.href != null && e.key === "Enter" && !props.disabled) return; choose(e); e.preventDefault(); }
  };
  const isLink = rest.href != null && !props.disabled;
  if (!isLink) delete rest.href;
  if (isLink && rest.target === "_blank" && rest.rel == null) rest.rel = "noopener noreferrer";
  return React.createElement(isLink ? config.link : "div", Object.assign(rest, {
    ref: ref, role: "menuitem", tabIndex: -1, "aria-disabled": props.disabled || undefined,
    className: cn("dk-menu__item", props.destructive && "dk-menu__item--destructive", props.className),
    onClick: onClick, onKeyDown: onKeyDown, onPointerMove: (e: React.PointerEvent<HTMLElement>) => { if (own.onPointerMove) own.onPointerMove(e); if (document.activeElement !== e.currentTarget) e.currentTarget.focus(); },
  }),
    props.icon != null ? <span className="dk-menu__icon" aria-hidden="true">{asIcon(props.icon)}</span> : null,
    <span className="dk-menu__label">{props.children}</span>,
    props.shortcut ? <kbd className="dk-menu__shortcut">{props.shortcut}</kbd> : null);
});
MenuItem.displayName = "MenuItem";

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A small heading over the group, which also names it. */
  label?: React.ReactNode;
}

/** Items that belong together, with an optional heading. */
export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(props, ref) {
  const rest = omit(props, { label: 1, className: 1, children: 1 });
  const id = domId("dk-mg", React.useId());
  return (
    <div {...rest} ref={ref} role="group" aria-labelledby={props.label != null ? id : undefined} className={cn("dk-menu__group", props.className)}>
      {props.label != null ? <div className="dk-menu__group-label" id={id} role="presentation">{props.label}</div> : null}
      {props.children}
    </div>
  );
});
MenuGroup.displayName = "MenuGroup";

/** A line between groups of items. */
export const MenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function MenuSeparator(props, ref) {
  return <div {...props} ref={ref} role="separator" className={cn("dk-menu__separator", props.className)} />;
});
MenuSeparator.displayName = "MenuSeparator";
