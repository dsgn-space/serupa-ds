'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { isComposing } from '../../internal/ime';
import { typeahead, type Typed } from '../../internal/typeahead';
import { Menu } from '../Menu/Menu';

export interface MenubarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** The bar's name for screen readers ("Editor"): every menu bar needs one, by aria-label or aria-labelledby. */
  'aria-label'?: string | undefined;
  /** Its menus, in order: MenubarMenu elements. */
  children?: React.ReactNode;
}

export interface MenubarMenuProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'children' | 'role'> {
  /** The menu's name in the bar ("File"). */
  label: React.ReactNode;
  /** Its items: MenuItem, MenuSub, MenuGroup, MenuSeparator, MenuCheckboxItem and MenuRadioGroup, as in a Menu. */
  children?: React.ReactNode;
  /** Still reachable with the keys, but doesn't open (aria-disabled). */
  disabled?: boolean | undefined;
  /** Open on arrival, as Menu's defaultOpen (a walkthrough or a screenshot). */
  defaultOpen?: boolean | undefined;
}

interface Bar {
  /** The open menu's index, or null. */
  open: number | null;
  setOpen: React.Dispatch<React.SetStateAction<number | null>>;
  /** The menu that holds the bar's one Tab stop. */
  at: number;
  setAt: (i: number) => void;
}
const BarContext = /* @__PURE__ */ React.createContext<Bar | null>(null);
const IndexContext = /* @__PURE__ */ React.createContext(0);
const OWN = { className: 1, children: 1, onKeyDown: 1 } as const;
const TOP = ':scope > .dk-menubar__item';

/* Menubar: an application's menu bar (File, Edit, View), following the WAI-ARIA menubar pattern. The bar is one Tab
   stop; ← → move across its menus (mirrored right to left), Home and End jump, typing goes to the next menu
   starting with what was typed. ↓, ↑, Enter or Space opens a menu (Menu's own keys). While one is open, ← → close
   it and open the next one on its first item, and pointing at another menu's name opens that one instead. Escape
   closes and puts focus back on the menu's name; Tab closes and leaves the bar. Each menu is a Menu, so its items,
   submenus, shortcuts and type-ahead work as they do there. */
/** An application's menu bar: File, Edit, View along the top, each opening a menu, with one Tab stop and the arrow keys across.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Menubar = /* @__PURE__ */ component<HTMLDivElement, MenubarProps>('Menubar', function Menubar(props, ref) {
  const menus = React.Children.toArray(props.children).filter(React.isValidElement);
  const [open, setOpen] = React.useState<number | null>(() => {
    const first = menus.findIndex((m) => !!(m.props as MenubarMenuProps).defaultOpen);
    return first < 0 ? null : first;
  });
  const [at, setAt] = React.useState(() => open ?? 0);
  const typed = React.useRef<Typed>({ text: '', at: 0 });
  const bar = React.useMemo(() => ({ open, setOpen, at, setAt }), [open, at]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (props.onKeyDown) props.onKeyDown(e);
    // With Alt, Ctrl or ⌘ the keys are the browser's or the page's.
    if (e.defaultPrevented || isComposing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
    const tops = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(TOP));
    if (!tops.length) return;
    const top = tops.indexOf(e.target as HTMLElement);
    const i = top >= 0 ? top : open ?? at;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    const go = (j: number) => {
      e.preventDefault();
      const n = (j + tops.length) % tops.length;
      setAt(n);
      // An open menu moves along, open; a disabled name takes the focus instead, closed.
      if (open !== null && tops[n].getAttribute('aria-disabled') !== 'true') setOpen(n);
      else { setOpen(null); tops[n].focus(); }
    };
    if (step) go(i + step);
    else if (top < 0) return;
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(tops.length - 1);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const n = typeahead(typed.current, e.key, tops.map((t) => t.textContent || ''), top);
      if (n >= 0) { e.preventDefault(); setAt(n); tops[n].focus(); }
    }
  };

  return (
    <BarContext.Provider value={bar}>
      <div {...omit(props, OWN)} ref={ref} role="menubar" tabIndex={-1} className={cn('dk-menubar', props.className)} data-component="menubar" onKeyDown={onKeyDown}>
        {menus.map((m, i) => <IndexContext.Provider key={m.key ?? i} value={i}>{m}</IndexContext.Provider>)}
      </div>
    </BarContext.Provider>
  );
});

/* MenubarMenu: one menu in a Menubar, its name a menuitem button in the bar (aria-haspopup, aria-expanded) and its
   panel a Menu. Outside a Menubar it is a plain Menu behind a button. */
/** One menu in a Menubar: its name in the bar, and the items it opens. */
export const MenubarMenu = /* @__PURE__ */ component<HTMLButtonElement, MenubarMenuProps>('MenubarMenu', function MenubarMenu(props, ref) {
  const bar = React.useContext(BarContext);
  const i = React.useContext(IndexContext);
  const { label, children, disabled, defaultOpen, className, onFocus, onPointerEnter, ...rest } = props;
  const [alone, setAlone] = React.useState(!!defaultOpen);
  const open = !disabled && (bar ? bar.open === i : alone);
  const onOpenChange = (next: boolean) => {
    if (next && disabled) return;
    if (!bar) setAlone(next);
    else if (next) { bar.setAt(i); bar.setOpen(i); }
    else bar.setOpen((o) => (o === i ? null : o));
  };
  const trigger = (
    <button {...rest} ref={ref} type="button" role="menuitem" className={cn('dk-menubar__item', className)}
      tabIndex={bar ? (bar.at === i ? 0 : -1) : 0} aria-disabled={disabled || undefined}
      onFocus={(e) => { if (onFocus) onFocus(e); if (bar) bar.setAt(i); }}
      onPointerEnter={(e) => {
        if (onPointerEnter) onPointerEnter(e);
        // Moving across the bar while a menu is open opens the menu pointed at, as desktop menu bars do.
        if (bar && e.pointerType === 'mouse' && bar.open !== null && bar.open !== i && !disabled) { bar.setAt(i); bar.setOpen(i); }
      }}>
      {label}
    </button>
  );
  return <Menu trigger={trigger} open={open} onOpenChange={onOpenChange} placement="bottom-start">{children}</Menu>;
});
