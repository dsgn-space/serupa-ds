import * as React from "react";
import { cn, domId, oneOf, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** 'single' (default): opening one closes the others. 'multiple': any number can be open. */
  type?: 'single' | 'multiple';
  /** The open items' values (controlled). Use with onValueChange. */
  value?: string[];
  /** The items open at first (uncontrolled). Default: none. */
  defaultValue?: string[];
  /** Called with the open items' values when one opens or closes. */
  onValueChange?: (value: string[]) => void;
  /** With type="single": lets the open item close again, leaving none open. Default: true. */
  collapsible?: boolean;
  /** 'plain' (default): lines between items. 'card': a bordered, rounded frame. */
  variant?: 'plain' | 'card';
  /** The heading level of the titles, to fit the page's outline. Default: 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Identifies the item in value. Default: its position ("0", "1"…). */
  value?: string;
  /** The title: what the heading button says. */
  title: React.ReactNode;
  /** Can't be opened or closed. Default: false. */
  disabled?: boolean;
  /** The content shown when it's open. */
  children?: React.ReactNode;
}

interface Ctx { open: string[]; toggle: (v: string) => void; level: number; collapsible: boolean; single: boolean; base: string; }
const AccordionContext = React.createContext<Ctx | null>(null);

/* Accordion: a stack of items whose content shows and hides under a heading button (the WAI-ARIA accordion
   pattern). Arrow keys, Home and End move between the titles. className and every other prop go to the
   wrapper. */
/** Items that show and hide their content under heading buttons; one open at a time, or several. */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const rest = omit(props, { type: 1, value: 1, defaultValue: 1, onValueChange: 1, collapsible: 1, variant: 1, headingLevel: 1, className: 1, children: 1, onKeyDown: 1 });
  const single = props.type !== "multiple";
  const controlled = props.value !== undefined;
  const [inner, setInner] = React.useState<string[]>(() => (props.defaultValue || []).slice(0, single ? 1 : undefined));
  const open = controlled ? (props.value as string[]) : inner;
  const collapsible = props.collapsible !== false;
  const onChange = React.useRef(props.onValueChange);
  onChange.current = props.onValueChange;
  const toggle = React.useCallback((v: string) => {
    const isOpen = open.indexOf(v) >= 0;
    let next: string[];
    if (single) next = isOpen ? (collapsible ? [] : open) : [v];
    else next = isOpen ? open.filter((x) => x !== v) : open.concat(v);
    if (next === open) return;
    if (!controlled) setInner(next);
    if (onChange.current) onChange.current(next);
  }, [open, single, collapsible, controlled]);
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel as number) >= 0 ? (props.headingLevel as number) : 3;
  const base = domId("dk-acc", React.useId());
  const variant = oneOf(["plain", "card"] as const, props.variant, "plain");
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (props.onKeyDown) props.onKeyDown(e);
    const t = e.target as HTMLElement;
    if (e.defaultPrevented || !t.classList.contains("dk-accordion__trigger") || t.closest(".dk-accordion") !== e.currentTarget) return;
    const all = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>(".dk-accordion__trigger")).filter((b) => b.closest(".dk-accordion") === e.currentTarget && !b.disabled);
    const i = all.indexOf(t as HTMLButtonElement);
    const to = e.key === "ArrowDown" ? all[(i + 1) % all.length] : e.key === "ArrowUp" ? all[(i - 1 + all.length) % all.length] : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
    if (to) { e.preventDefault(); to.focus(); }
  }
  let n = 0;
  const items = React.Children.map(props.children, (c) => React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<any>, { "data-index": String(n++) }) : c);
  return (
    <AccordionContext.Provider value={{ open, toggle, level, collapsible, single, base }}>
      <div {...rest} ref={ref} onKeyDown={onKeyDown} data-component="accordion" className={cn("dk-accordion", variant === "card" && "dk-accordion--card", props.className)}>{items}</div>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

/* AccordionItem: a heading holding a button (aria-expanded, aria-controls) and a region (aria-labelledby) that
   opens and closes with a height animation; closed content is hidden from everyone. */
/** One item in an Accordion: a title button and the content it shows and hides. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(props, ref) {
  const ctx = React.useContext(AccordionContext);
  const rest: Record<string, any> = omit(props, { value: 1, title: 1, disabled: 1, className: 1, children: 1 });
  const index = rest["data-index"] || "0";
  delete rest["data-index"];
  const value = props.value != null ? props.value : index;
  const open = !!ctx && ctx.open.indexOf(value) >= 0;
  const id = (ctx ? ctx.base : "dk-acc") + "-" + index;
  // an open item in a single, non-collapsible accordion can't close: say so with aria-disabled
  const locked = !!ctx && open && ctx.single && !ctx.collapsible;
  const H = ("h" + (ctx ? ctx.level : 3)) as "h3";
  return (
    <div {...rest} ref={ref} data-state={open ? "open" : "closed"} className={cn("dk-accordion__item", open && "dk-accordion__item--open", props.disabled && "dk-accordion__item--disabled", props.className)}>
      <H className="dk-accordion__heading">
        <button type="button" id={id + "-t"} className="dk-accordion__trigger" aria-expanded={open} aria-controls={id + "-p"} disabled={props.disabled}
          aria-disabled={locked ? true : undefined} onClick={() => { if (ctx && !locked) ctx.toggle(value); }}>
          <span className="dk-accordion__title">{props.title}</span>
          <Icon name="expand_more" className="dk-accordion__icon" />
        </button>
      </H>
      <div id={id + "-p"} role="region" aria-labelledby={id + "-t"} className="dk-accordion__panel">
        <div className="dk-accordion__clip"><div className="dk-accordion__content">{props.children}</div></div>
      </div>
    </div>
  );
});
AccordionItem.displayName = "AccordionItem";
