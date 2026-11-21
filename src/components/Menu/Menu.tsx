'use client';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { cn, domId, elementRef, omit, useLatest, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { oneElement, useTriggerRef } from '../../internal/trigger';
import { config } from '../../internal/config';
import type { Placement } from '../../internal/position';
import { typeahead, typing, type Typed } from '../../internal/typeahead';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useExit } from '../../internal/useExit';
import { Icon, type IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import { named } from '../../internal/component';
import { isComposing } from '../../internal/ime';
import * as icons from '../../material/builtin';
import type { OpenChangeDetails, OpenChangeReason } from '../../internal/openChange';
import { submenuIntent } from '../../internal/timing';
import { activeIn } from '../../internal/root';
import { shortcutShown, useApple } from '../../internal/keys';

/** The trigger element's props this component reads and adds to. */
type TriggerProps = React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>;

export interface MenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** The button that opens the menu: one element, such as a Button or IconButton. It gets aria-haspopup, aria-expanded and the keys. */
  trigger: React.ReactElement;
  /** MenuItem, MenuGroup and MenuSeparator. */
  children: React.ReactNode;
  /** Where the menu goes: 'bottom-start' (default), 'bottom-end', 'top-start', 'top-end', or any Tooltip placement. It flips when there's no room. */
  placement?: Placement | undefined;
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean | undefined;
  /** Open at first (uncontrolled), such as a menu a page returns to. Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called when it asks to open or close, with why: { reason: 'trigger' | 'escape' | 'outside' | 'blur' (Tab) | 'select' (an item chosen) }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The menu's name for screen readers. Default: the trigger's text, by aria-labelledby. */
  'aria-label'?: string | undefined;
  /** Classes on the menu panel. The other HTML attributes (id, data-*, aria-*) and the ref go on the panel too. */
  className?: string | undefined;
  /** Styles on the menu panel. */
  style?: React.CSSProperties | undefined;
}
// The panel is a <span>, typed as the <div> it lays out as (a popover in the top layer is fixed, so a block): its
// trigger often sits in a line of text, and a <div> there ends the paragraph when the browser reads the server's HTML.
const Panel = 'span' as 'div';
// What goes in it is a <span> too, for the same reason, laid out as a block in Menu.css.
const Box = 'span' as 'div';
const OWN_MENU = { trigger: 1, children: 1, 'aria-label': 1, 'aria-labelledby': 1, placement: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1, style: 1, onKeyDown: 1 } as const;

interface Ctx { close: (reason: OpenChangeReason, focusTrigger: boolean) => void; open: boolean; typed: React.RefObject<Typed> }
const MenuContext = /* @__PURE__ */ React.createContext<Ctx | null>(null);
const ITEMS = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
/** The items of one panel (the menu or a submenu), not those of the submenus inside it. An item hidden by CSS or the
    hidden attribute can't take focus, so the keys skip it rather than stick on it (L8E80), unless the panel isn't
    laid out yet, when none of them is. */
const itemsOf = (panel: HTMLElement | null): HTMLElement[] => {
  const all = panel ? Array.from(panel.querySelectorAll<HTMLElement>(ITEMS)).filter((it) => it.closest('[role="menu"]') === panel) : [];
  const shown = all.filter((it) => it.getClientRects().length > 0);
  return shown.length ? shown : all;
};

/** True while a Menubar swaps one open menu for another: both go at once, with no fade (not exported by the package). */
export const MenuSwap = /* @__PURE__ */ React.createContext(false);

/* The keys inside an open menu (or a submenu's panel, whose keys bubble to the menu's element): ↑ ↓ move,
   wrapping, Home and End jump, typing goes to the next item starting with what was typed, Escape closes and puts
   focus back, Tab closes. Shared by Menu and ContextMenu. */
function menuKeys(menuRef: React.RefObject<HTMLDivElement | null>, typed: React.RefObject<Typed>, close: (reason: OpenChangeReason, focusBack: boolean) => void) {
  return (e: React.KeyboardEvent<HTMLDivElement>) => {
    // The arrows, Home and End with Alt, Ctrl or ⌘ are the browser's (L8E36).
    if (isComposing(e) || (e.altKey || e.ctrlKey || e.metaKey) && /^(Arr|Home|End)/.test(e.key)) return;
    const panel = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>('[role="menu"]') : null;
    const list = itemsOf(panel || menuRef.current), i = list.indexOf(activeIn(e.currentTarget) as HTMLElement);   // its own root's focus, in a shadow root too (GR60)
    const go = (n: number) => { e.preventDefault(); list[(n + list.length) % list.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i < 0 ? list.length - 1 : i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close('escape', true); }
    else if (e.key === 'Tab') close('blur', false);
    // Space only while a word is being typed ("my files"); otherwise the item chose itself on it.
    else if (e.key.length === 1 && (/\S/.test(e.key) || typing(typed.current)) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Taken, so a page shortcut on the same letter (useShortcut("g")) doesn't also run: a menu is no text field (L8E42).
      e.preventDefault();
      const n = typeahead(typed.current, e.key, list.map((it) => (it.querySelector('.srp-menu__label') || it).textContent || ''), i);
      list[n]?.focus();
    }
  };
}

function MenuRender({ ref, ...props }: MenuProps & React.RefAttributes<HTMLDivElement>) {
  const own = domId('srp-menu', React.useId());
  const id = props.id || own;
  const [openIn, setInner, controlled] = useControllable(props.open, !!props.defaultOpen, 'Menu', 'open');
  const open = !!openIn;
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const focusOn = React.useRef<'first' | 'last' | null>(null);
  const pressed = React.useRef(0);
  const typed = React.useRef<Typed>({ text: '', at: 0 });
  const askRef = useLatest(props.onOpenChange);
  const set = React.useCallback((v: boolean, reason: OpenChangeReason) => { if (!controlled) setInner(v); if (askRef.current) askRef.current(v, { reason }); }, [controlled, setInner, askRef]);
  const close = React.useCallback((reason: OpenChangeReason, focusTrigger: boolean) => { set(false, reason); if (focusTrigger && triggerRef.current) triggerRef.current.focus(); }, [set]);
  const ctx = React.useMemo(() => ({ close, open, typed }), [close, open, typed]);
  const items = () => itemsOf(menuRef.current);

  // A press outside the menu and its button closes it (focus stays where the press put it).
  // Its items stay, inert, while it fades out (DZ1); one open on arrival doesn't fade in.
  const exit = useExit(open, menuRef);
  const swap = React.useContext(MenuSwap);
  useAnchoredLayer(open, menuRef, triggerRef, { placement: props.placement, fallback: 'bottom-start', offsetVar: '--srp-menu-offset', onOutside: () => close('outside', false), inside: triggerRef });
  // On open, focus goes to the first item (or the last, opened with ↑).
  useIsoLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    const list = items();
    const target = focusOn.current === 'last' ? list[list.length - 1] : list[0];
    focusOn.current = null;
    if (target) target.focus(); else menu.focus();
  }, [open]);

  const keys = (e: React.KeyboardEvent<HTMLDivElement>) => menuKeys(menuRef, typed, close)(e);
  const panelRef = useMergedRef(ref, undefined, menuRef);
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => { if (props.onKeyDown) props.onKeyDown(e); if (!e.defaultPrevented) keys(e); };

  const child = oneElement<TriggerProps>(props.trigger, 'Menu', 'trigger');
  useTriggerRef(triggerRef, 'Menu');
  const cp = child.props;
  const childRef = elementRef<HTMLElement>(child);
  // The trigger's id as the page has it: a trigger wrapped in another component (a Tooltip) can keep an id of its own.
  const [triggerId, setTriggerId] = React.useState<string | undefined>(undefined);
  const mergedRef = useMergedRef(childRef, (n: HTMLElement | null) => { if (n) setTriggerId(n.id || undefined); }, triggerRef);
  const Tag = child.type as React.ElementType;   // drawn with JSX, not cloneElement, which the React Compiler skips
  const trigger = <Tag {...cp} key={child.key} ref={mergedRef} {...{
    id: cp.id || own + '-button',
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (cp.onPointerDown) cp.onPointerDown(e);
      // A mouse opens it on the press (a touch or pen, the keys, and a trigger with its own onClick, which may stop
      // it, keep the click), so it can be dragged onto an item and let go there.
      if (e.defaultPrevented || cp.onClick || e.pointerType !== 'mouse' || e.button !== 0 || e.currentTarget.matches(':disabled, [aria-disabled="true"]')) return;
      const at = pressed.current = e.timeStamp || 1;
      if (open) close('trigger', true);
      else { focusOn.current = 'first'; set(true, 'trigger'); }
      const up = (u: PointerEvent) => {
        document.removeEventListener('pointerup', up, true);
        document.removeEventListener('pointercancel', up, true);
        // The click that follows (on the button, or wherever the press and release meet) is this press's.
        setTimeout(() => { pressed.current = 0; });
        const item = !open && u.type === 'pointerup' && u.timeStamp - at > 200 && u.target instanceof Element ? u.target.closest<HTMLElement>('[role^="menuitem"]') : null;
        if (item && menuRef.current && menuRef.current.contains(item)) item.click();
      };
      document.addEventListener('pointerup', up, true);
      document.addEventListener('pointercancel', up, true);
    },
    // Keeps the focus on the item the press put it on.
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => { if (cp.onMouseDown) cp.onMouseDown(e); if (pressed.current) e.preventDefault(); },
    onClick: (e: React.MouseEvent<HTMLElement>) => { if (cp.onClick) cp.onClick(e); if (e.defaultPrevented || pressed.current) return; if (!open) focusOn.current = 'first'; set(!open, 'trigger'); },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (cp.onKeyDown) cp.onKeyDown(e);
      // With Alt, Ctrl or ⌘ the arrows are the browser's or the system's (⌘+↓ scrolls to the page's end): leave them (L8E36).
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); focusOn.current = e.key === 'ArrowUp' ? 'last' : 'first'; set(true, 'trigger'); }
    },
  }} />;
  return (
    <MenuContext.Provider value={ctx}>
      {trigger}
      <Panel {...omit(props, OWN_MENU)} ref={panelRef} id={id} role="menu" tabIndex={-1} {...{ popover: 'manual' }} hidden={!open || undefined}
        aria-label={props['aria-label']} aria-labelledby={props['aria-label'] || props['aria-labelledby'] ? props['aria-labelledby'] : cp.id || triggerId || own + '-button'}
        className={cn('srp-menu', props.className)} style={props.style} data-component="menu" data-state={open ? 'open' : 'closed'} data-instant={exit.instant || swap ? '' : undefined}
        inert={!open || undefined} onKeyDown={onMenuKey}>
        {open || exit.leaving ? props.children : null}
      </Panel>
    </MenuContext.Provider>
  );
}

/* Menu: a list of actions behind a button, following the WAI-ARIA menu button pattern. Enter, Space or ↓ on the
   button opens it on the first item (↑ on the last); ↑ ↓ move (wrapping), Home and End jump, typing goes to the
   next item starting with what was typed (internal/typeahead.ts), Enter or Space chooses, Escape closes, and focus
   goes back to the button. Tab, a click outside or choosing an item closes it. It sits in the top layer next to the button.
   A MenuSub's panel sits inside the menu's element, so the keys bubble here and work on the panel the focus is in. */
/** A list of actions behind a button: MenuItem, MenuGroup and MenuSeparator inside. */
export const Menu = /* @__PURE__ */ named('Menu', MenuRender);

export interface ContextMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** The area the menu belongs to: one element, such as a Card, a table row or a canvas. A right-click (a long
      press on touch), Shift+F10 or the Menu key in it opens the menu. */
  target: React.ReactElement;
  /** MenuItem, MenuGroup, MenuSub and MenuSeparator. */
  children: React.ReactNode;
  /** The menu's name for screen readers ("File actions"). Required: there's no button to take it from. */
  'aria-label': string;
  /** Open it yourself (controlled), with onOpenChange. It opens where it was last asked for, or at the target. */
  open?: boolean | undefined;
  /** Called when it asks to open or close, with why: { reason: 'trigger' | 'escape' | 'outside' | 'blur' (Tab) | 'select' (an item chosen) }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** Leaves the browser's own menu in place: the target's right-click and keys do nothing. Default: false. */
  disabled?: boolean | undefined;
  /** Classes on the menu panel. The other HTML attributes (id, data-*, aria-*) and the ref go on the panel too. */
  className?: string | undefined;
  /** Styles on the menu panel. */
  style?: React.CSSProperties | undefined;
}
const OWN_CONTEXT = { target: 1, children: 1, 'aria-label': 1, open: 1, onOpenChange: 1, disabled: 1, className: 1, style: 1, onKeyDown: 1 } as const;

function ContextMenuRender({ ref, ...props }: ContextMenuProps & React.RefAttributes<HTMLDivElement>) {
  const own = domId('srp-ctxmenu', React.useId());
  const id = props.id || own;
  const [openIn, setInner, controlled] = useControllable(props.open, false, 'ContextMenu', 'open');
  const open = !!openIn;
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const point = React.useRef<HTMLSpanElement | null>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const back = React.useRef<HTMLElement | null>(null);
  const typed = React.useRef<Typed>({ text: '', at: 0 });
  const askRef = useLatest(props.onOpenChange);
  const set = React.useCallback((v: boolean, reason: OpenChangeReason) => { if (!controlled) setInner(v); if (askRef.current) askRef.current(v, { reason }); }, [controlled, setInner, askRef]);
  const close = React.useCallback((reason: OpenChangeReason, focusBack: boolean) => {
    set(false, reason);
    const to = back.current || targetRef.current;
    if (focusBack && to) to.focus();
  }, [set]);
  const ctx = React.useMemo(() => ({ close, open, typed }), [close, open, typed]);
  // Opened from outside (controlled) before any right-click: at the target's corner, measured before paint.
  useIsoLayoutEffect(() => {
    if (open && !at && targetRef.current) { const r = targetRef.current.getBoundingClientRect(); setAt({ x: r.left, y: r.top }); }
  }, [open, at]);
  const spot = at;

  // Its items stay, inert, while it fades out (DZ1); one open on arrival doesn't fade in.
  const exit = useExit(open, menuRef);
  useAnchoredLayer(open && !!spot, menuRef, point, { placement: 'bottom-start', offsetVar: '--srp-menu-offset', onOutside: () => close('outside', false), watch: spot && spot.x + ',' + spot.y });
  useIsoLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    const first = itemsOf(menu)[0];
    if (first) first.focus(); else menu.focus();
  }, [open, at]);

  const show = (x: number, y: number) => {
    const was = activeIn(targetRef.current);
    if (!open) back.current = was instanceof HTMLElement && was !== document.body ? was : null;
    setAt({ x: x, y: y });
    if (!open) set(true, 'trigger');
  };
  // From the keyboard, at the focused element's lower start corner.
  const fromElement = (el: EventTarget) => { const r = (el instanceof Element ? el : targetRef.current || document.body).getBoundingClientRect(); show(r.left, r.bottom); };

  const keys = (e: React.KeyboardEvent<HTMLDivElement>) => menuKeys(menuRef, typed, close)(e);
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => { if (props.onKeyDown) props.onKeyDown(e); if (!e.defaultPrevented) keys(e); };
  const panelRef = useMergedRef(ref, undefined, menuRef);

  const child = oneElement<TriggerProps>(props.target, 'ContextMenu', 'target');
  useTriggerRef(targetRef, 'ContextMenu');
  const cp = child.props;
  const childRef = elementRef<HTMLElement>(child);
  const mergedRef2 = useMergedRef(childRef, undefined, targetRef);
  // cloneElement, not JSX as Menu's trigger is: the target is the app's own element (often styled inline), and a copy
  // drawn here would be the library's, which a strict-CSP page's hydration then holds to the library's rules. The
  // React Compiler skips ContextMenu for the ref handed to cloneElement.
  const target = React.cloneElement(child, {
    ref: mergedRef2,
    onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
      if (cp.onContextMenu) cp.onContextMenu(e);
      if (e.defaultPrevented || props.disabled) return;
      e.preventDefault();
      // A contextmenu from the keyboard has no pointer position.
      if (e.clientX === 0 && e.clientY === 0) fromElement(e.target); else show(e.clientX, e.clientY);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (cp.onKeyDown) cp.onKeyDown(e);
      if (e.defaultPrevented || props.disabled) return;
      if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') { e.preventDefault(); fromElement(e.target); }
    },
  });
  return (
    <MenuContext.Provider value={ctx}>
      {target}
      <span ref={point} className="srp-menu__point" aria-hidden style={spot ? { left: spot.x + 'px', top: spot.y + 'px' } : undefined} />
      <div {...omit(props, OWN_CONTEXT)} ref={panelRef} id={id} role="menu" tabIndex={-1} {...{ popover: 'manual' }} hidden={!open || undefined} aria-label={props['aria-label']}
        className={cn('srp-menu', props.className)} style={props.style} data-component="menu" data-state={open ? 'open' : 'closed'} data-instant={exit.instant ? '' : undefined}
        inert={!open || undefined} onKeyDown={onMenuKey}>
        {open || exit.leaving ? props.children : null}
      </div>
    </MenuContext.Provider>
  );
}

/* ContextMenu: a Menu opened from an area instead of a button, at the pointer on a right-click (or a long press,
   which browsers turn into contextmenu) or at the focused element on Shift+F10 or the Menu key. Its items, keys,
   top layer and closing are Menu's; when it closes after a choice or Escape, focus goes back to where it was. */
/** A Menu that opens at the pointer on a right-click, or at the focused element on Shift+F10 or the Menu key. */
export const ContextMenu = /* @__PURE__ */ named('ContextMenu', ContextMenuRender);

/** MenuItem's own props, beside those of the element it renders. */
export interface MenuItemOwnProps {
  /** Called when the item is chosen (click, Enter or Space). The menu then closes, unless you call event.preventDefault(). */
  onSelect?: ((event: React.SyntheticEvent) => void) | undefined;
  /** An icon before the label: an icon name or any element. */
  icon?: IconSource | undefined;
  /** A keyboard shortcut shown at the end. Only a hint: wire the shortcut yourself. As keys, ["mod", "K"] follows the
      platform, as Kbd does: "⌘K" on an Apple device and "Ctrl+K" elsewhere. As text ("Ctrl+Shift+P") it shows as
      written. It's also given to assistive tech as aria-keyshortcuts ("Control+K", or "Meta+K" on an Apple device),
      worked out from it; pass aria-keyshortcuts to set that yourself. */
  shortcut?: string | readonly string[] | undefined;
  /** Danger colors, for deleting. */
  destructive?: boolean | undefined;
  /** Still reachable with the keys, but can't be chosen (aria-disabled). */
  disabled?: boolean | undefined;
}

// Inside, and for the checkable items, an item is a <div> or a link: attributes and handlers typed for HTMLElement.
interface MenuItemBaseProps extends MenuItemOwnProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Makes it a link (the configure({ link }) component, <a> by default). */
  href?: string | undefined;
  /** Makes it a link with this component, in place of the configure({ link }) one: a router's Link, with its own props (to). */
  as?: React.ElementType | undefined;
  /** Where the link opens, as on <a>; with "_blank", rel defaults to "noopener noreferrer". */
  target?: string | undefined;
  /** The link's relation to the page, as on <a>. */
  rel?: string | undefined;
}

const KEY_NAMES: Record<string, string> = { '⌘': 'Meta', cmd: 'Meta', command: 'Meta', meta: 'Meta', '⌥': 'Alt', opt: 'Alt', option: 'Alt', alt: 'Alt',
  '⇧': 'Shift', shift: 'Shift', '⌃': 'Control', ctrl: 'Control', control: 'Control', '⏎': 'Enter', '↵': 'Enter', enter: 'Enter', return: 'Enter',
  '⌫': 'Backspace', del: 'Delete', delete: 'Delete', esc: 'Escape', '⎋': 'Escape', tab: 'Tab', space: 'Space', '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', arrowup: 'ArrowUp', arrowdown: 'ArrowDown', arrowleft: 'ArrowLeft', arrowright: 'ArrowRight', escape: 'Escape', '+': 'Plus', plus: 'Plus' };
/** "⌘⇧K", "Ctrl+Shift+P", "Cmd-K" or "Alt F4" as aria-keyshortcuts wants it: "Meta+Shift+K", "Control+Shift+P",
    "Meta+K", "Alt+F4". A + or - key at the end stays a key ("Ctrl++" is "Control+Plus"), and "G then I" is two
    presses, space-separated: "G I". */
export function keyShortcuts(shortcut: string): string {
  return shortcut.trim().split(/\s+then\s+/i).map(chord).filter(Boolean).join(' ');
}
function chord(text: string): string {
  const parts: string[] = [];
  // A last + or - after a separator (or alone) is the key itself, not a separator.
  let last = '';
  const end = /(^|[+\-\s⌘⌥⇧⌃])([+-])$/.exec(text);
  if (end?.[2]) { last = end[2]; text = text.slice(0, text.length - 1); }
  const tokens = text.split(/\s*[+-]\s*|\s+/).filter(Boolean);
  if (last) tokens.push(last);
  for (const token of tokens) {
    // Mac symbols are written together ("⌘⇧K"): split off each modifier symbol.
    let rest = token;
    for (let mod = KEY_NAMES[rest.charAt(0)]; rest.length > 1 && mod && /[⌘⌥⇧⌃]/.test(rest.charAt(0)); mod = KEY_NAMES[rest.charAt(0)]) { parts.push(mod); rest = rest.slice(1); }
    const named = KEY_NAMES[rest] || KEY_NAMES[rest.toLowerCase()];
    parts.push(named || (rest.length === 1 ? rest.toUpperCase() : rest));
  }
  return parts.join('+');
}

function MenuItemBaseRender({ ref, ...props }: MenuItemBaseProps & React.RefAttributes<HTMLElement>) {
  const ctx = React.useContext(MenuContext);
  const rest = omit(props, { onSelect: 1, icon: 1, shortcut: 1, destructive: 1, disabled: 1, className: 1, children: 1, onClick: 1, onKeyDown: 1, onPointerMove: 1, as: 1 });
  const own = { onClick: props.onClick, onKeyDown: props.onKeyDown, onPointerMove: props.onPointerMove };
  const linked = rest.href != null || props.as != null;   // a link component of its own may take its address another way (to)
  const choose = (e: React.SyntheticEvent) => {
    if (props.disabled) { e.preventDefault(); return; }
    if (props.onSelect) props.onSelect(e);
    // onSelect may move focus itself (to the next row, after deleting this one): then it stays there (L8E21).
    const a = activeIn(e.currentTarget);
    if (!e.defaultPrevented && ctx) ctx.close('select', !a || a === document.body || !!a.closest('[role="menu"]'));
  };
  const onClick = (e: React.MouseEvent<HTMLElement>) => { if (own.onClick) own.onClick(e); if (linked && !props.disabled) { if (props.onSelect) props.onSelect(e); if (ctx) ctx.close('select', false); return; } choose(e); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (own.onKeyDown) own.onKeyDown(e);
    if (e.defaultPrevented) return;
    if (e.key === ' ' && ctx && typing(ctx.typed.current)) return;   // part of a typed word: the menu's typeahead takes it
    if (e.key === 'Enter' || e.key === ' ') {
      if (linked && !props.disabled) {
        // Enter follows a link by itself; Space doesn't, so it clicks the link as Enter would (L8E66).
        if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }
        return;
      }
      choose(e); e.preventDefault();
    }
  };
  const isLink = linked && !props.disabled;
  if (!isLink) delete rest.href;
  // Keys follow the platform: "mod" is ⌘ (Meta) on an Apple device and Ctrl (Control) elsewhere.
  const apple = useApple(), keys = props.shortcut, list = typeof keys === 'string' ? null : keys && keys.length ? keys : null;
  const shown = list ? shortcutShown(list, apple) : keys as string | undefined;
  if (shown && rest['aria-keyshortcuts'] == null) rest['aria-keyshortcuts'] = keyShortcuts(list ? list.map((k) => (k.toLowerCase() === 'mod' ? (apple ? 'Meta' : 'Control') : k)).join('+') : shown);
  if (isLink && rest.target === '_blank' && rest.rel == null) rest.rel = 'noopener noreferrer';
  // MenuCheckboxItem and MenuRadioItem pass their role and aria-checked: a check slot goes before the label.
  const checkable = !isLink && (rest.role === 'menuitemcheckbox' || rest.role === 'menuitemradio');
  const Tag = (isLink ? props.as || config.link : Box);   // JSX, not createElement: see Menu's trigger
  return <Tag {...rest} ref={ref} {...{
    role: checkable ? rest.role : 'menuitem', tabIndex: -1, 'aria-disabled': props.disabled || undefined,
    className: cn('srp-menu__item', props.destructive && 'srp-menu__item--destructive', props.className),
    onClick: onClick, onKeyDown: onKeyDown, onPointerMove: (e: React.PointerEvent<HTMLElement>) => { if (own.onPointerMove) own.onPointerMove(e); if (activeIn(e.currentTarget) !== e.currentTarget) e.currentTarget.focus(); },
  }}>
    {checkable ? <span className="srp-menu__check" aria-hidden="true"><Icon icon={icons.Check} /></span> : null}
    {props.icon != null ? <span className="srp-menu__icon" aria-hidden="true">{asIcon(props.icon)}</span> : null}
    <span className="srp-menu__label">{props.children}</span>
    {/* Shown, but not part of the item's name ("Copy", not "Copy command K"): aria-keyshortcuts says it. */}
    {shown ? <kbd className="srp-menu__shortcut" aria-hidden="true">{shown}</kbd> : null}
  </Tag>;
}

/** One action in a Menu. */
const MenuItemBase = /* @__PURE__ */ named('MenuItem', MenuItemBaseRender);

/** One action in a Menu, or with href a link. `as` renders your router's link, typed with its props. */
export const MenuItem = MenuItemBase as {
  <C extends React.ElementType = 'a'>(props: MenuItemProps<C> & React.RefAttributes<HTMLElement>): React.ReactElement | null;
  displayName?: string | undefined;
};

/** MenuItem's props: its own, `as`, and the props of the element `as` names (an <a>'s by default, for href, target
 *  and rel), so <MenuItem as={RouterLink} to="/settings"> takes RouterLink's `to`. */
export type MenuItemProps<C extends React.ElementType = 'a'> = MenuItemOwnProps & {
  /** Makes it a link with this component, in place of the configure({ link }) one: a router's Link, with its own props (to). */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof MenuItemOwnProps | 'as'>;

type CheckableProps = Omit<MenuItemBaseProps, 'href' | 'as' | 'target' | 'rel' | 'destructive' | 'role' | 'aria-checked'>;
export interface MenuCheckboxItemProps extends CheckableProps {
  /** Whether it's on. The menu's items unmount while it's closed, so the state lives with you: set it in onCheckedChange. */
  checked: boolean;
  /** Called with the new state when it's chosen (click, Enter or Space). */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
}

/** Space on a setting changes it and keeps the menu open on it, so several take one trip (the APG's menu pattern);
 *  Enter and a click choose and close, as on any item. */
const stayOnSpace = (e: React.SyntheticEvent) => { if ((e as React.KeyboardEvent).key === ' ') e.preventDefault(); };

function MenuCheckboxItemRender({ ref, ...props }: MenuCheckboxItemProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { checked: 1, onCheckedChange: 1, onSelect: 1, icon: 1, shortcut: 1 });
  const onSelect = (e: React.SyntheticEvent) => { if (props.onCheckedChange) props.onCheckedChange(!props.checked); if (props.onSelect) props.onSelect(e); stayOnSpace(e); };
  return <MenuItem {...rest} ref={ref} icon={props.icon} shortcut={props.shortcut} {...{ role: 'menuitemcheckbox', 'aria-checked': !!props.checked }} onSelect={onSelect} />;
}

/* MenuCheckboxItem: an on/off setting in a Menu (role menuitemcheckbox, aria-checked), with a check before the
   label while it's on. Choosing it asks for the other state and closes the menu, as MenuItem does, except with Space,
   which keeps it open; call event.preventDefault() in onSelect to keep the menu open. */
/** A setting in a Menu that's on or off, such as "Show grid". */
export const MenuCheckboxItem = /* @__PURE__ */ named('MenuCheckboxItem', MenuCheckboxItemRender);

interface RadioCtx { value: string | undefined; choose: (value: string) => void }
const RadioContext = /* @__PURE__ */ React.createContext<RadioCtx | null>(null);

export interface MenuRadioGroupProps extends Omit<MenuGroupProps, 'defaultValue' | 'onChange'> {
  /** The chosen item's value. The menu's items unmount while it's closed, so the state lives with you: set it in onValueChange. */
  value: string | undefined;
  /** Called with the item's value when one is chosen. */
  onValueChange?: ((value: string) => void) | undefined;
}

function MenuRadioGroupRender({ ref, ...props }: MenuRadioGroupProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { value: 1, onValueChange: 1 });
  const askRef = useLatest(props.onValueChange);
  // Choosing the item that's chosen already changes nothing, so it isn't told.
  const value = props.value;
  const ctx = React.useMemo<RadioCtx>(() => ({ value, choose: (v) => { if (v !== value && askRef.current) askRef.current(v); } }), [value, askRef]);
  return <RadioContext.Provider value={ctx}><MenuGroup {...rest} ref={ref} /></RadioContext.Provider>;
}

/* MenuRadioGroup: MenuRadioItems of which one is chosen (role menuitemradio, aria-checked), such as a sort order.
   It's a MenuGroup, so label gives it a heading that names it. */
/** A group of MenuRadioItems, one of them chosen. */
export const MenuRadioGroup = /* @__PURE__ */ named('MenuRadioGroup', MenuRadioGroupRender);

export interface MenuRadioItemProps extends CheckableProps {
  /** The value MenuRadioGroup chooses with this item. */
  value: string;
}

function MenuRadioItemRender({ ref, ...props }: MenuRadioItemProps & React.RefAttributes<HTMLElement>) {
  const group = React.useContext(RadioContext);
  const rest = omit(props, { value: 1, onSelect: 1, icon: 1, shortcut: 1 });
  const onSelect = (e: React.SyntheticEvent) => { if (group) group.choose(props.value); if (props.onSelect) props.onSelect(e); stayOnSpace(e); };
  return <MenuItem {...rest} ref={ref} icon={props.icon} shortcut={props.shortcut} {...{ role: 'menuitemradio', 'aria-checked': !!group && group.value === props.value }} onSelect={onSelect} />;
}

/** One choice in a MenuRadioGroup. */
export const MenuRadioItem = /* @__PURE__ */ named('MenuRadioItem', MenuRadioItemRender);

export interface MenuSubProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The item's label, which also names the submenu. */
  label: React.ReactNode;
  /** MenuItem, MenuGroup, MenuSeparator, and MenuSub again. */
  children: React.ReactNode;
  /** An icon before the label: an icon name or any element. */
  icon?: IconSource | undefined;
  /** Still reachable with the keys, but doesn't open (aria-disabled). */
  disabled?: boolean | undefined;
}

/* MenuSub: an item that opens a submenu at its end edge (to the right, or the left in rtl, flipping when there's
   no room). → (← in rtl), Enter or Space opens it on its first item, ← (→ in rtl) or Escape closes it and goes back
   to the item; ↑ ↓ Home End and letters work inside it alone. Hovering the item opens it after a moment, and the
   pointer can cross the items in between on its way: it closes a moment after the focus settles on another item
   of its menu. Choosing an item in it closes the whole menu. */
type Point = { x: number; y: number };
/** Whether p is inside the triangle a, b, c (on an edge counts). */
const inTriangle = (p: Point, a: Point, b: Point, c: Point) => {
  const side = (u: Point, v: Point) => (v.x - u.x) * (p.y - u.y) - (v.y - u.y) * (p.x - u.x);
  const d1 = side(a, b), d2 = side(b, c), d3 = side(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};

function MenuSubRender({ ref, ...props }: MenuSubProps & React.RefAttributes<HTMLElement>) {
  const id = domId('srp-menu-sub', React.useId());
  const rest = omit(props, { label: 1, icon: 1, disabled: 1, className: 1, children: 1, onClick: 1, onKeyDown: 1, onPointerMove: 1, onPointerLeave: 1 });
  const [own, setOpen] = React.useState(false);
  // Right to left, it opens to the left: read from the item when it opens, as rendering can't read the page.
  const [left, setLeft] = React.useState(false);
  // Closed with its menu: a submenu open when its menu closes fades out with it rather than stay open inside it.
  const parent = React.useContext(MenuContext);
  const open = own && (!parent || parent.open);
  if (own && parent && !parent.open) setOpen(false);   // in this render, not an effect after
  const itemRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const focusFirst = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hover = React.useRef(false);   // the pointer is on the item and it opens in a moment
  const stop = () => { clearTimeout(timer.current); hover.current = false; };
  const later = (fn: () => void) => { stop(); timer.current = setTimeout(fn, submenuIntent); };
  const rtl = () => !!itemRef.current && getComputedStyle(itemRef.current).direction === 'rtl';
  const show = (focus: boolean) => {
    stop();
    if (props.disabled) return;
    if (open) { if (focus) { const first = itemsOf(panelRef.current)[0]; if (first) first.focus(); } return; }
    focusFirst.current = focus; setLeft(rtl()); setOpen(true);
  };
  const hide = (focusItem: boolean) => { stop(); setOpen(false); if (focusItem && itemRef.current) itemRef.current.focus(); };
  React.useEffect(() => stop, []);

  // Its items stay, inert, while it fades out (DZ1).
  const exit = useExit(open, panelRef);
  useAnchoredLayer(open, panelRef, itemRef, { placement: left ? 'left-start' : 'right-start', fallback: 'right-start', offsetVar: '--srp-menu-sub-offset' });
  useIsoLayoutEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    const first = itemsOf(panelRef.current)[0];
    if (first) first.focus(); else if (panelRef.current) panelRef.current.focus();
  }, [open]);
  // Focus settling on another item of this item's menu (by pointer or keys) closes it, after a moment.
  React.useEffect(() => {
    const item = itemRef.current, parent = item && item.closest<HTMLElement>('[role="menu"]');
    if (!open || !item || !parent) return;
    // While the pointer heads for the submenu across the items below or above this one, they take focus on the way
    // but the submenu stays: each moment it checks again whether the pointer is still moving inside the triangle from
    // where it was toward the submenu's near edge (the "safe triangle" of native menus). Resting, or moving off it, closes.
    let at = { x: 0, y: 0, t: 0 }, from = at;
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse') at = { x: e.clientX, y: e.clientY, t: e.timeStamp }; };
    const check = () => {
      const r = panelRef.current && panelRef.current.getBoundingClientRect();
      const x = r && (from.x <= r.left ? r.left : r.right);
      if (r && at !== from && performance.now() - at.t < submenuIntent && inTriangle(at, from, { x: x!, y: r.top }, { x: x!, y: r.bottom })) { from = at; timer.current = setTimeout(check, submenuIntent); }
      else setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      clearTimeout(timer.current);
      if (t !== item && !(panelRef.current && panelRef.current.contains(t)) && parent.contains(t)) { from = at; timer.current = setTimeout(check, submenuIntent); }
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('pointermove', onMove, true);
    return () => { document.removeEventListener('focusin', onFocus); document.removeEventListener('pointermove', onMove, true); };
  }, [open]);

  const opens = (key: string) => key === 'Enter' || key === ' ' || key === (rtl() ? 'ArrowLeft' : 'ArrowRight');
  const onPanelKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing(e) || !(e.target instanceof HTMLElement) || e.target.closest('[role="menu"]') !== panelRef.current) return;
    if (e.key === 'Escape' || e.key === (rtl() ? 'ArrowRight' : 'ArrowLeft')) { e.preventDefault(); e.stopPropagation(); hide(true); }
  };
  const mergedRef3 = useMergedRef(ref, undefined, itemRef);
  return (
    <>
      <Box {...rest} ref={mergedRef3}
        role="menuitem" tabIndex={-1} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
        aria-disabled={props.disabled || undefined} data-state={open ? 'open' : 'closed'}
        className={cn('srp-menu__item', 'srp-menu__item--sub', props.className)}
        onClick={(e: React.MouseEvent<HTMLElement>) => { if (props.onClick) props.onClick(e); if (!e.defaultPrevented) show(true); }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (props.onKeyDown) props.onKeyDown(e);
          if (e.defaultPrevented || isComposing(e) || !opens(e.key) || (e.key === ' ' && parent && typing(parent.typed.current))) return;
          e.preventDefault(); e.stopPropagation(); show(true);
        }}
        onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
          if (props.onPointerMove) props.onPointerMove(e);
          if (activeIn(e.currentTarget) !== e.currentTarget) e.currentTarget.focus();
          if (!open && !props.disabled && !hover.current) { later(() => { show(false); }); hover.current = true; }
        }}
        onPointerLeave={(e: React.PointerEvent<HTMLElement>) => { if (props.onPointerLeave) props.onPointerLeave(e); if (hover.current) stop(); }}>
        {props.icon != null ? <span className="srp-menu__icon" aria-hidden="true">{asIcon(props.icon)}</span> : null}
        <span className="srp-menu__label" id={id + '-label'}>{props.label}</span>
        <span className="srp-menu__chevron" aria-hidden="true"><Icon icon={icons.ChevronRight} /></span>
      </Box>
      <Box ref={panelRef} id={id} role="menu" tabIndex={-1} {...{ popover: 'manual' }} hidden={!open || undefined} data-instant={exit.instant ? '' : undefined} aria-labelledby={id + '-label'}
        className="srp-menu srp-menu--sub" data-component="menu" data-state={open ? 'open' : 'closed'} inert={!open || undefined} onKeyDown={onPanelKey}>
        {open || exit.leaving ? props.children : null}
      </Box>
    </>
  );
}

/** An item that opens a submenu of more items. */
export const MenuSub = /* @__PURE__ */ named('MenuSub', MenuSubRender);

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A small heading over the group, which also names it. */
  label?: React.ReactNode | undefined;
}

function MenuGroupRender({ ref, ...props }: MenuGroupProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { label: 1, className: 1, children: 1 });
  const id = domId('srp-mg', React.useId());
  return (
    <Box {...rest} ref={ref} role="group" aria-labelledby={props.label != null ? id : undefined} className={cn('srp-menu__group', props.className)}>
      {props.label != null ? <span className="srp-menu__group-label" id={id} role="presentation">{props.label}</span> : null}
      {props.children}
    </Box>
  );
}

/** Items that belong together, with an optional heading. */
export const MenuGroup = /* @__PURE__ */ named('MenuGroup', MenuGroupRender);

export type MenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

function MenuSeparatorRender({ ref, ...props }: MenuSeparatorProps & React.RefAttributes<HTMLDivElement>) {
  return <Box {...props} ref={ref} role="separator" className={cn('srp-menu__separator', props.className)} />;
}

/** A line between groups of items. */
export const MenuSeparator = /* @__PURE__ */ named('MenuSeparator', MenuSeparatorRender);
