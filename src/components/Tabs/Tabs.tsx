'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import { named } from '../../internal/component';
import { warnOnce } from '../../internal/warn';
import { hideUntilFound, revealInvalid } from '../../internal/untilFound';
import { lastInputKeyboard, listenForInput } from '../../internal/lastInput';
import { activeIn } from '../../internal/root';
import { useTabRow } from './tabRow';
import { useControllable } from '../../internal/controllable';
import { useSettings } from '../../internal/provider';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

export type TabsVariant = 'line' | 'pill';

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The selected tab's value (controlled). Use with onValueChange. */
  value?: string | undefined;
  /** The tab selected at first (uncontrolled). Default: the first tab that isn't disabled. */
  defaultValue?: string | undefined;
  /** Called with the new value when a tab is chosen. */
  onValueChange?: ((value: string) => void) | undefined;
  /** 'line' (default): a line under the selected tab. 'pill': the selected tab filled in primary. */
  variant?: TabsVariant | undefined;
  /** 'sm' (32px tabs), 'md' (36px, default) or 'lg' (44px with 16px text, the touch-target size, beside lg fields and buttons). */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** 'auto' (default): arrow keys move and select at once. 'manual': arrow keys move, Enter or Space selects (for panels that are slow to show). */
  activation?: 'auto' | 'manual' | undefined;
  /** 'horizontal' (default): the tabs in a row over the panels. 'vertical': a column beside them, with ↑ ↓ between tabs. */
  orientation?: 'horizontal' | 'vertical' | undefined;
}

interface Ctx { closed: { current: string | null }; size: 'sm' | 'md' | 'lg'; base: string; value: string | null; select: (v: string) => void; manual: boolean; vertical: boolean; panels: Record<string, number>; register: (v: string, d: number) => void; stop: string | null; before: { current: (() => void) | null }; keyed: boolean }
const TabsContext = /* @__PURE__ */ React.createContext<Ctx | null>(null);
const useTabs = (who: string): Ctx => {
  const c = React.useContext(TabsContext);
  if (!c) throw new Error('Serupa: ' + who + ' must be inside <Tabs>.');
  return c;
};
const safe = (v: string) => String(v).replace(/[^A-Za-z0-9_-]/g, '_');
// The first enabled Tab's value, found in the children while rendering (so the server's HTML already has a
// selected tab and a visible panel). Tabs inside a component of your own aren't seen: the effect in Tabs
// picks the first one after mount then.
function firstTab(children: React.ReactNode): string | null {
  let found: string | null = null;
  React.Children.forEach(children, (c) => {
    if (found != null || !React.isValidElement(c)) return;
    const p = c.props as { value?: string; disabled?: boolean; children?: React.ReactNode };
    if (c.type === Tab) { if (!p.disabled && p.value != null) found = p.value; return; }
    found = firstTab(p.children);
  });
  return found;
}

function TabsRender({ ref, ...props }: TabsProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { value: 1, defaultValue: 1, onValueChange: 1, variant: 1, size: 1, activation: 1, orientation: 1, className: 1 });
  const vertical = props.orientation === 'vertical';
  const base = domId('dk-tabs', React.useId());
  const [value, setInner, controlled] = useControllable<string | null>(props.value, props.defaultValue != null ? props.defaultValue : firstTab(props.children), 'Tabs', 'value');
  const onChange = React.useRef(props.onValueChange); onChange.current = props.onValueChange;
  // TabList's hook to note where the line or fill is just before the selection changes, so a slide that is still
  // running turns back from where it has got to (EH1).
  const before = React.useRef<(() => void) | null>(null);
  // Picked from the keyboard (an arrow, Home, End), the line or fill is there at once rather than sliding (KW1).
  // Worked out whenever the value changes, not only when a tab picks it, so a controlled value set by a click
  // elsewhere (a Next button) slides even after an arrow picked the tab before (GR61).
  const [keyed, setKeyed] = React.useState(false);
  const [shown, setShown] = React.useState(value);
  if (shown !== value) { setShown(value); setKeyed(lastInputKeyboard()); }
  useIsoLayoutEffect(listenForInput, []);
  // The selected tab pressed again (a click, Enter or Space) changes nothing, so it doesn't call onValueChange: an app
  // that puts the tab in the URL pushed the same page into the history each time (L8E107).
  const current = React.useRef(value); current.current = value;
  const select = React.useCallback((v: string) => {
    if (v === current.current) return;
    if (before.current) before.current();
    if (!controlled) { current.current = v; setInner(v); }
    if (onChange.current) onChange.current(v);
  }, [controlled, setInner]);
  const variant = oneOf(['line', 'pill'] as const, props.variant, 'line');
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  // Which values have a TabPanel, so a tab only points (aria-controls) at a panel that exists: a tab row can
  // drive content of its own (a filter, say) with no TabPanel at all.
  const [panels, setPanels] = React.useState<Record<string, number>>({});
  const register = React.useCallback((v: string, d: number) => setPanels((p) => Object.assign({}, p, { [v]: (p[v] || 0) + d })), []);
  // Controlled with a value no tab has (a stale link, data still loading): the first enabled tab takes the Tab stop,
  // so the tab list can still be reached from the keyboard.
  const [stop, setStop] = React.useState<string | null>(null);
  // The selected tab hidden by CSS or the hidden attribute (a responsive class, at load or after a resize) can't take
  // focus, so its tabindex 0 left the list out of the Tab order: the first shown enabled tab takes the stop (GR67).
  const [hiddenStop, setHiddenStop] = React.useState<string | null>(null);
  const tabStop = stop != null ? stop : hiddenStop;
  // The tab a Delete key or a × closed while it had focus, by value, and the tab next to it: once the closed tab is
  // gone, focus goes there (the selected tab's own removal above hands focus on too).
  const closed = React.useRef<string | null>(null);
  const ctx = React.useMemo(() => ({ closed, size, base, value, select, manual: props.activation === 'manual', vertical, panels, register, stop: tabStop, before, keyed }), [size, base, value, select, props.activation, vertical, panels, register, tabStop, keyed]);
  // After each render: uncontrolled with no defaultValue, and the tabs out of firstTab's sight, the first enabled tab.
  // When the selected tab is removed (a closable tab), the nearest enabled one: the next, or else the previous. So a
  // tab is always selected and the tab list stays in the Tab order. Controlled Tabs leave it to you, with a warning.
  const self = React.useRef<HTMLDivElement | null>(null);
  const order = React.useRef<string[]>([]);
  const focusedIn = React.useRef(false);   // focus is in the Tabs, so a closed tab that had it hands it on
  // every render: tabs come and go with the children, which change in any render; it reads attributes, not layout.
  useIsoLayoutEffect(() => {
    if (!self.current) return;
    const tabs = Array.from(self.current.querySelectorAll<HTMLElement>('[role="tab"]')).filter((t) => t.id.startsWith(base + '-tab-'));
    const all = tabs.map((t) => t.dataset.value as string), enabled = tabs.filter((t) => !t.hasAttribute('disabled')).map((t) => t.dataset.value as string);
    const before = order.current;
    order.current = all;
    const gone = closed.current;
    if (gone != null && !all.includes(gone)) {
      closed.current = null;
      const at = before.indexOf(gone), active = activeIn(self.current);
      const near = before.slice(at + 1).find((v) => enabled.includes(v)) ?? before.slice(0, at).reverse().find((v) => enabled.includes(v));
      const t = near != null && near !== value ? tabs.find((x) => x.dataset.value === near) : undefined;
      // Only when focus was lost with the tab: a selected tab's removal below hands focus to the newly selected one.
      if (t && value != null && all.includes(value) && focusedIn.current && (!active || active === document.body || !active.isConnected)) t.focus();
    }
    const matched = value != null && all.includes(value);
    setStop(matched ? null : enabled[0] ?? null);
    const first = enabled[0];
    if (first === undefined || matched) return;
    if (controlled) {
      if (process.env.NODE_ENV !== 'production' && value != null && before.includes(value)) warnOnce('tabs-removed', `Tabs: the selected tab "${value}" was removed, so no tab is selected. Set value to another tab when you remove it.`);
      else if (process.env.NODE_ENV !== 'production' && value != null) warnOnce('tabs-value', `Tabs: value "${value}" matches no Tab, so no tab is selected. Set it to one of the Tabs' values.`);
      return;
    }
    const at = value != null ? before.indexOf(value) : -1;
    if (process.env.NODE_ENV !== 'production' && at < 0 && value != null && !before.length) warnOnce('tabs-value', `Tabs: defaultValue "${value}" matches no Tab, so the first tab is selected. Set it to one of the Tabs' values.`);
    if (at < 0) { setInner(first); return; }   // nothing chosen yet (or a defaultValue with no tab): no onValueChange
    const after = before.slice(at + 1).find((v) => enabled.includes(v)), prev = before.slice(0, at).reverse().find((v) => enabled.includes(v));
    const next = after ?? prev ?? first;
    select(next);
    // Focus was on the closed tab (its own close button, or a Delete key the app handles): it goes to the tab now
    // selected, not to the page. A removed element can still read as the active one until the browser next looks.
    const active = activeIn(self.current);
    if (focusedIn.current && (!active || active === document.body || !active.isConnected)) { const t = tabs.find((x) => x.dataset.value === next); if (t) t.focus(); }
  });
  // every render: tabs can be added, removed or re-rendered any time; then again whenever a tab or the list changes size (a media query hiding a tab sets it to 0).
  React.useEffect(() => {
    const el = self.current;
    if (!el) return;
    const tabs = Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]')).filter((t) => t.id.startsWith(base + '-tab-'));
    const check = () => {
      const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      const next = sel && !sel.getClientRects().length ? tabs.find((t) => !t.hasAttribute('disabled') && t.getClientRects().length > 0) : undefined;
      setHiddenStop(next ? (next.dataset.value as string) : null);
    };
    check();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check);
    if (ro) { ro.observe(el); for (const t of tabs) ro.observe(t); }
    return () => { if (ro) ro.disconnect(); };
  });
  const mergedRef = useMergedRef(ref, (n) => { self.current = n; });
  return (
    <TabsContext.Provider value={ctx}>
      <div {...rest} ref={mergedRef}
        onFocus={(e) => { focusedIn.current = true; if (rest.onFocus) rest.onFocus(e); }}
        onBlur={(e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) focusedIn.current = false; if (rest.onBlur) rest.onBlur(e); }}
        className={cn('dk-tabs', 'dk-tabs--' + variant, size !== 'md' && 'dk-tabs--' + size, vertical && 'dk-tabs--vertical', props.className)} data-component="tabs" data-variant={variant} data-orientation={vertical ? 'vertical' : 'horizontal'} />
    </TabsContext.Provider>
  );
}

/* Tabs: switches between panels in one place, following the WAI-ARIA tabs pattern. <Tabs> holds the state
   (value or defaultValue, onValueChange), <TabList> the row of <Tab value>, and each <TabPanel value> the content.
   Arrow keys move between tabs (following the text direction; ↑ ↓ with orientation "vertical"), Home and End jump
   to the ends; with activation "auto" moving also selects. Only the selected tab is in the Tab order, and the selected panel follows it. */
/** Switches between panels in one place: Tabs > TabList > Tab, and a TabPanel for each tab. */
export const Tabs = /* @__PURE__ */ named('Tabs', TabsRender);

/* TabList: the row (or column) of tabs. When the tabs don't fit, it scrolls with no scrollbar; the edge with more
   tabs past it fades out, so it's plain there's more, and the selected tab is scrolled into view whenever it changes. */
export type TabListProps = React.HTMLAttributes<HTMLDivElement> & ({
  /** Shows a + button after the tabs that calls this, for tabs people open (a new document, a new query). Select
   *  the new tab in it, and focus goes with the selection. Needs addLabel. */
  onAdd: () => void;
  /** The + button's words, shown beside the +: "New query". */
  addLabel: string;
} | { onAdd?: undefined; addLabel?: undefined });

function TabListRender({ ref, ...props }: TabListProps & React.RefAttributes<HTMLDivElement>) {
  const ctx = useTabs('TabList');
  const { onAdd, addLabel, ...own } = props;
  const [list, fade, place] = useTabRow<HTMLDivElement>('[role="tab"]', '[role="tab"][aria-selected="true"]', ctx.vertical, ctx.value);
  // every render: place reads ctx and the list as they are now; it only swaps a function, so it costs nothing.
  useIsoLayoutEffect(() => { ctx.before.current = () => place(true); return () => { ctx.before.current = null; }; });
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (props.onKeyDown) props.onKeyDown(e);
    // Delete closes the focused tab, when it can be closed (its × is for the pointer, and hidden from screen readers).
    if (!e.defaultPrevented && e.key === 'Delete' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const tab = activeIn(e.currentTarget) as HTMLElement | null;
      if (tab && tab.getAttribute('role') === 'tab' && tab.hasAttribute('data-closable') && !tab.hasAttribute('disabled')) {
        e.preventDefault();
        tab.dispatchEvent(new CustomEvent('dk-tab-close'));
        return;
      }
    }
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's (Alt+← goes back a page): leave them (L8E28).
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    // A tab hidden by CSS or the hidden attribute can't take focus: the keys skip it rather than select it out of
    // sight while focus stays put (L8E81).
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')).filter((t) => t.getClientRects().length > 0);
    const i = tabs.indexOf(activeIn(e.currentTarget) as HTMLButtonElement);
    if (i < 0 || !tabs.length) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = ctx.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight', back = ctx.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    let next = -1;
    if (e.key === fwd) next = (i + 1) % tabs.length;
    else if (e.key === back) next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    const tab = tabs[next];
    if (!tab) return;
    e.preventDefault();
    tab.focus();
    if (!ctx.manual && tab.dataset.value != null) ctx.select(tab.dataset.value);
  };
  const mergedRef2 = useMergedRef(ref, (n) => { list.current = n; });
  const tablist = <div {...own} ref={mergedRef2} role="tablist" aria-orientation={ctx.vertical ? 'vertical' : 'horizontal'}
    className={cn('dk-tabs__list', props.className)} data-fade-before={fade.before ? '' : undefined} data-fade-after={fade.after ? '' : undefined} onKeyDown={onKeyDown} />;
  // The + sits beside the tab list, not in it: a tablist holds only tabs. It's drawn as a tab, with its words shown, so
  // it needs no tooltip to say what it adds.
  return onAdd ? <div className="dk-tabs__bar">{tablist}<button type="button" className="dk-tabs__tab dk-tabs__add" onClick={onAdd}><span className="dk-tabs__icon" aria-hidden="true"><Icon icon={icons.Add} /></span><span className="dk-tabs__label">{addLabel}</span></button></div> : tablist;
}

/** The row of tabs. Give it an aria-label when the page doesn't already say what the tabs are for. */
export const TabList = /* @__PURE__ */ named('TabList', TabListRender);

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Ties the tab to the TabPanel with the same value. */
  value: string;
  /** An icon before the label: an icon name or any element. */
  icon?: IconSource | undefined;
  /** Makes the tab closable: a × at its end for the pointer, and the Delete key while it has focus, both call this.
   *  Remove the tab in it; when it was selected, the tab after it (or before) is selected and takes focus. */
  onClose?: (() => void) | undefined;
}

function TabRender({ ref, ...props }: TabProps & React.RefAttributes<HTMLButtonElement>) {
  const ctx = useTabs('Tab');
  const rest = omit(props, { value: 1, icon: 1, className: 1, children: 1, onClose: 1 });
  const L = useSettings(words).labels;
  const own = React.useRef<HTMLButtonElement | null>(null);
  const close = React.useRef(props.onClose); close.current = props.onClose;
  const closes = !!props.onClose;
  const closed = ctx.closed, value = props.value;
  const shut = React.useCallback(() => { closed.current = value; if (close.current) close.current(); }, [closed, value]);
  // TabList's Delete key reaches the focused tab through this event, so the tab's own onClose runs.
  React.useEffect(() => {
    const el = own.current;
    if (!el || !closes) return;
    el.addEventListener('dk-tab-close', shut);
    return () => el.removeEventListener('dk-tab-close', shut);
  }, [closes, shut]);
  const hintId = closes ? ctx.base + '-close-' + safe(props.value) : undefined;
  const refs = useMergedRef(ref, (n) => { own.current = n; });
  const selected = ctx.value === props.value;
  const id = ctx.base + '-tab-' + safe(props.value), panel = ctx.base + '-panel-' + safe(props.value);
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => { if (props.onClick) props.onClick(e); if (!e.defaultPrevented) ctx.select(props.value); };
  return (
    <button {...rest} ref={refs} type="button" role="tab" id={id} data-closable={closes ? '' : undefined} aria-keyshortcuts={closes ? 'Delete' : undefined} aria-describedby={cn(hintId, props['aria-describedby']) || undefined} aria-controls={ctx.panels[props.value] ? panel : undefined} aria-selected={selected} data-instant={selected && ctx.keyed ? '' : undefined} tabIndex={selected || ctx.stop === props.value ? 0 : -1}
      data-value={props.value} data-state={selected ? 'active' : 'inactive'} className={cn('dk-tabs__tab', props.className)} onClick={onClick}>
      {props.icon != null ? <span className="dk-tabs__icon" aria-hidden="true">{asIcon(props.icon)}</span> : null}
      <span className="dk-tabs__label">{props.children}</span>
      {closes ? (
        // A × inside the tab, for the pointer: a button can't hold another button, and the keyboard closes with Delete
        // (said in the tab's description), so it's a hidden span that takes the press and leaves the tab unselected.
        <span className="dk-tabs__close" aria-hidden="true" data-closes=""
          onPointerDown={(e) => { e.preventDefault(); }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); shut(); }}>
          <Icon icon={icons.Close} />
        </span>
      ) : null}
      {closes ? <span className="dk-tabs__close-hint" id={hintId} hidden>{L.tabCloseHint}</span> : null}
    </button>
  );
}

/** One tab: a button that selects its panel. */
export const Tab = /* @__PURE__ */ named('Tab', TabRender);

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The value of the Tab that shows this panel. */
  value: string;
  /** Keeps the panel in the page while hidden (the default: hidden panels keep their state). false renders it only while selected. */
  keepMounted?: boolean | undefined;
}

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
/** Whether the first thing in el, in reading order, is something Tab lands on rather than text. */
function startsFocusable(el: HTMLElement): boolean {
  const first = el.querySelector(FOCUSABLE);
  if (!first) return false;
  const before = el.ownerDocument.createRange();
  before.setStart(el, 0); before.setEndBefore(first);
  return !before.toString().trim();
}

function TabPanelRender({ ref, ...props }: TabPanelProps & React.RefAttributes<HTMLDivElement>) {
  const ctx = useTabs('TabPanel');
  const rest = omit(props, { value: 1, keepMounted: 1, className: 1, children: 1 });
  const selected = ctx.value === props.value;
  const keep = props.keepMounted !== false;
  const register = ctx.register;
  useIsoLayoutEffect(() => { register(props.value, 1); return () => register(props.value, -1); }, [props.value, register]);
  // A kept panel of another tab is hidden="until-found", as Accordion's closed content is: hidden from everyone, but
  // the browser's find-in-page still searches it and, on a match, fires beforematch, which selects its tab. React
  // renders any hidden value as hidden="", so it's set here. A disabled tab's panel stays plainly hidden.
  const own = React.useRef<HTMLDivElement | null>(null);
  const pick = React.useRef<(() => void) | null>(null);
  const tabOf = () => own.current && (own.current.getRootNode() as Document | ShadowRoot).getElementById(ctx.base + '-tab-' + safe(props.value));
  pick.current = selected ? null : () => { const t = tabOf(); if (t && !t.hasAttribute('disabled')) ctx.select(props.value); };
  // every render: the panel's tab can be enabled or disabled in any render of the tab list; nothing is measured.
  useIsoLayoutEffect(() => {
    const el = own.current, t = tabOf();
    if (!el || selected || !keep || !t) return;
    if (!t.hasAttribute('disabled')) hideUntilFound(el);
    // Its tab disabled since: plainly hidden again, or find-in-page (or a form's invalid field) still showed it.
    else if (el.hasAttribute('data-findable')) { el.removeAttribute('data-findable'); el.setAttribute('hidden', ''); }
  });
  React.useEffect(() => {
    const el = own.current;
    if (!el) return;
    const onMatch = () => { if (pick.current) pick.current(); };
    el.addEventListener('beforematch', onMatch);
    el.addEventListener('invalid', revealInvalid, true);   // a required field in it, on submit, selects its tab (L8E100)
    return () => { el.removeEventListener('beforematch', onMatch); el.removeEventListener('invalid', revealInvalid, true); };
  }, []);
  // The shown panel is a Tab stop only while its content starts with text, as the APG asks: when it starts with a
  // link or a field, Tab from the tab goes straight there rather than to the panel first. Content can change after
  // the panel shows (a loaded list, a Retry button), so a change inside looks again. A tabIndex prop keeps its value.
  useIsoLayoutEffect(() => {
    const el = own.current;
    if (!el || !selected || props.tabIndex !== undefined) return;
    const look = () => { const t = startsFocusable(el) ? -1 : 0; if (el.tabIndex !== t) el.tabIndex = t; };
    look();
    const watch = new MutationObserver(look);
    watch.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'href', 'tabindex', 'hidden'] });
    return () => watch.disconnect();
  }, [selected, props.tabIndex]);
  const mergedRef3 = useMergedRef(ref, (n) => { own.current = n; });
  return (
    <div tabIndex={selected ? 0 : -1} {...rest} ref={mergedRef3} role="tabpanel" id={ctx.base + '-panel-' + safe(props.value)} aria-labelledby={ctx.base + '-tab-' + safe(props.value)}
      hidden={!selected} data-state={selected ? 'active' : 'inactive'} className={cn('dk-tabs__panel', props.className)}>
      {selected || keep ? props.children : null}
    </div>
  );
}

/** The content for one tab, shown while its tab is selected. */
export const TabPanel = /* @__PURE__ */ named('TabPanel', TabPanelRender);
