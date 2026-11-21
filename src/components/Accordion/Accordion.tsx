'use client';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { cn, domId, oneOf, omit } from '../../internal/cn';
import { reducedMotion } from '../../internal/mediaList';
import { toMs } from '../../internal/cssTime';
import { Icon } from '../Icon/Icon';
import { named } from '../../internal/component';
import { flattenChildren } from '../../internal/children';
import * as icons from '../../material/builtin';
import { useSettings } from '../../internal/provider';
import { warnOnce } from '../../internal/warn';
import { hideUntilFound, revealInvalid } from '../../internal/untilFound';
import { buttonClass } from '../Button/buttonClass';
import { en as words } from './labels';

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** 'multiple' (default): any number can be open, so people can compare them. 'single': opening one closes the others. */
  type?: 'single' | 'multiple' | undefined;
  /** The open items' values (controlled). Use with onValueChange. */
  value?: string[] | undefined;
  /** The items open at first (uncontrolled). Default: none. */
  defaultValue?: string[] | undefined;
  /** Called with the open items' values when one opens or closes. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /** With type="single": lets the open item close again, leaving none open. Default: true. */
  collapsible?: boolean | undefined;
  /** 'plain' (default): lines between items. 'card': a bordered, rounded frame. */
  variant?: 'plain' | 'card' | undefined;
  /** The heading level of the titles, to fit the page's outline. Default: 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** With type="multiple": an "Expand all" button above the items, which becomes "Collapse all" once every item
      is open. Disabled items stay as they are. Default: false. */
  showExpandAll?: boolean | undefined;
}

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Identifies the item in value. Default: its position ("0", "1"…). */
  value?: string | undefined;
  /** The title: what the heading button says. */
  title: React.ReactNode;
  /** Can't be opened or closed. Default: false. */
  disabled?: boolean | undefined;
  /** The content shown when it's open. */
  children?: React.ReactNode | undefined;
  /** Closed content stays in the page, keeping its state, and find-in-page searches it. false renders the content
      only while the item is open (and while it closes), for heavy content; find-in-page can't find it then. Default: true. */
  keepMounted?: boolean | undefined;
}

interface Ctx { open: string[]; toggle: (v: string) => void; level: number; collapsible: boolean; single: boolean; many: boolean; }
const AccordionContext = /* @__PURE__ */ React.createContext<Ctx | null>(null);

function AccordionRender({ ref, ...props }: AccordionProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { type: 1, value: 1, defaultValue: 1, onValueChange: 1, collapsible: 1, variant: 1, headingLevel: 1, showExpandAll: 1, className: 1, children: 1 });
  const labels = useSettings(words).labels;
  const single = props.type === 'single';
  const [open, setInner, controlled] = useControllable<string[]>(props.value, (props.defaultValue || []).slice(0, single ? 1 : undefined), 'Accordion', 'value');
  if (process.env.NODE_ENV !== 'production' && single && controlled && open.length > 1) warnOnce('accordion-single-value', `Accordion: value has ${open.length} items with type="single", so ${open.length} items show open; pass one value, or type="multiple".`);
  const collapsible = props.collapsible !== false;
  const onChange = React.useRef(props.onValueChange);
  onChange.current = props.onValueChange;
  const change = React.useCallback((next: string[]) => {
    if (!controlled) setInner(next);
    if (onChange.current) onChange.current(next);
  }, [controlled, setInner]);
  const toggle = React.useCallback((v: string) => {
    const isOpen = open.indexOf(v) >= 0;
    let next: string[];
    if (single) next = isOpen ? (collapsible ? [] : open) : [v];
    else next = isOpen ? open.filter((x) => x !== v) : open.concat(v);
    if (next !== open) change(next);
  }, [open, single, collapsible, change]);
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel as number) >= 0 ? (props.headingLevel as number) : 3;
  const variant = oneOf(['plain', 'card'] as const, props.variant, 'plain');
  let n = 0;
  const items = flattenChildren(props.children).map((c) => React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ 'data-index'?: string }>, { 'data-index': String(n++) }) : c);
  // Each open panel is a region landmark (DP1). Past six that could be open at once, landmarks crowd the list screen
  // readers offer, so the panels are plain groups of content under their headings (the APG's advice).
  const many = !single && items.filter(React.isValidElement).length > 6;
  // Expand all / Collapse all acts on the items that can open and close (not disabled ones).
  let all: React.ReactNode = null;
  if (props.showExpandAll && !single) {
    const values = items.flatMap((c) => {
      if (!React.isValidElement(c)) return [];
      const p = c.props as AccordionItemProps & { 'data-index'?: string };
      return p.disabled ? [] : [p.value != null ? p.value : String(p['data-index'])];
    });
    const allOpen = values.length > 0 && values.every((v) => open.indexOf(v) >= 0);
    const onAll = () => change(allOpen ? open.filter((v) => values.indexOf(v) < 0) : open.concat(values.filter((v) => open.indexOf(v) < 0)));
    // aria-expanded as well as the words: VoiceOver doesn't reliably say a label that changes on its own. Expanded
    // only once every item is open (modern web guidance, accordion).
    all = (
      <div className="srp-accordion__toolbar">
        <button type="button" className={buttonClass({ variant: 'link', size: 'sm', className: 'srp-accordion__all' })} onClick={onAll} disabled={!values.length} aria-expanded={allOpen}>
          {allOpen ? labels.collapseAll : labels.expandAll}
        </button>
      </div>
    );
  }
  return (
    <AccordionContext.Provider value={{ open, toggle, level, collapsible, single, many }}>
      <div {...rest} ref={ref} data-component="accordion" className={cn('srp-accordion', variant === 'card' && 'srp-accordion--card', props.className)}>{all}{items}</div>
    </AccordionContext.Provider>
  );
}

/* Accordion: a stack of items whose content shows and hides under a heading button (the WAI-ARIA accordion
   pattern). Tab moves between the titles, as it does between any buttons: the pattern's optional arrow keys are
   left out, so on a title, as on every other button, they scroll the page. className and every other prop go to the
   wrapper. */
/** Items that show and hide their content under heading buttons; one open at a time, or several. */
export const Accordion = /* @__PURE__ */ named('Accordion', AccordionRender);

function AccordionItemRender({ ref, ...props }: AccordionItemProps & React.RefAttributes<HTMLDivElement>) {
  const ctx = React.useContext(AccordionContext);
  const rest = omit(props, { value: 1, title: 1, disabled: 1, keepMounted: 1, className: 1, children: 1 });
  const index = String(rest['data-index'] || '0');
  delete rest['data-index'];
  const value = props.value != null ? props.value : index;
  const open = !!ctx && ctx.open.indexOf(value) >= 0;
  const id = domId('srp-acc', React.useId());   // its own id, not its position, so ids stay unique however items are wrapped
  // an open item in a single, non-collapsible accordion can't close: say so with aria-disabled
  const locked = !!ctx && open && ctx.single && !ctx.collapsible;
  const H = ('h' + (ctx ? ctx.level : 3)) as 'h3';
  // Closed content is hidden="until-found": hidden from everyone, but the browser's find-in-page still searches it,
  // and on a match fires beforematch, which opens the item. It's set once the closing animation ends, so the
  // content stays visible while it folds away. React renders any hidden value as hidden="", so it's set here.
  // The first render (the server's HTML) marks closed content plain hidden, so it stays hidden before the stylesheet
  // arrives (or without it: tools/test/no-css.mjs); the effect below then makes it until-found. The prop never
  // changes after that, so React leaves the attribute to the effect.
  const [startsClosed] = React.useState(!open);
  const content = React.useRef<HTMLDivElement>(null);
  const toggle = React.useRef<(() => void) | null>(null);
  toggle.current = ctx && !open && !props.disabled ? () => ctx.toggle(value) : null;
  const findable = !props.disabled;
  // With keepMounted={false} the content renders while the item is open, and goes once the closing animation ends.
  const keep = props.keepMounted !== false;
  const [mounted, setMounted] = React.useState(open || keep);
  if ((open || keep) && !mounted) setMounted(true);
  // One item closing as another opens (type="single"): both heights move over the opening one's time and curve, so
  // their sum goes straight from the old height to the new. On their own curves (the closing one slow to start, the
  // opening one fast) the two were briefly taller together than either, and what's below dipped and came back.
  const swapping = React.useRef(false);
  swapping.current = !!ctx && ctx.single && !open && ctx.open.length > 0;
  const swapTime = (panel: HTMLElement) => {
    if (!swapping.current) return 0;
    const cs = getComputedStyle(panel);
    return toMs(cs.getPropertyValue('--accordion-duration') || cs.getPropertyValue('--motion-change-md'));
  };
  React.useLayoutEffect(function () {
    const el = content.current, panel = el && el.closest<HTMLElement>('.srp-accordion__panel');
    if (!el || !panel) return;
    if (open || (!findable && keep)) { el.removeAttribute('hidden'); return; }
    const style = getComputedStyle(panel);
    const delays = style.transitionDelay.split(',');
    const fold = Math.max(0, ...style.transitionDuration.split(',').map((d, i) => toMs(d) + toMs(delays[i] || '0')));
    // Closing as another item opens, its height takes the opening one's time (below), so the content stays that long.
    const ms = fold ? Math.max(fold, swapTime(panel)) : 0;
    // The panel keeps its content shown until the fold ends. CSS alone (a discrete content-visibility transition)
    // isn't enough: WebKit sometimes drops it, and the panel lost its height at the start of the fold.
    const hold = (on: boolean) => { panel.style.contentVisibility = on ? 'visible' : ''; };
    // The height animation goes with it: one left behind made the next opening start from the open height, a snap.
    const hide = () => { hold(false); if (grow.current) { grow.current.cancel(); grow.current = null; } if (findable) hideUntilFound(el); if (!keep) setMounted(false); };
    if (ms) hold(true);
    if (!ms || !el.isConnected || panel.getBoundingClientRect().height === 0) { hide(); return; }
    const t = setTimeout(hide, ms);
    return () => { clearTimeout(t); hold(false); };
  }, [open, findable, keep]);
  // The height glides too (EH2, revised): the panel grows from nothing to its content's height, or shrinks to
  // nothing, over the same time as its fade (read from that transition), so what's below slides
  // instead of jumping. It's the one layout a component animates on purpose: one panel, while it moves. A press
  // mid-way turns back from the height it has. Not under reduced motion (the fade alone, and the height at once).
  const grow = React.useRef<Animation | null>(null);
  const was = React.useRef(open);
  React.useLayoutEffect(function () {
    const panel = content.current && content.current.closest<HTMLElement>('.srp-accordion__panel');
    if (!panel || was.current === open) return;
    was.current = open;
    const from = grow.current ? panel.getBoundingClientRect().height : open ? 0 : panel.offsetHeight;
    if (grow.current) { grow.current.cancel(); grow.current = null; }
    const fade = typeof panel.getAnimations === 'function' ? panel.getAnimations().find((a) => (a as CSSTransition).transitionProperty === 'opacity') : null;
    const timing = fade && fade.effect ? fade.effect.getTiming() : null;
    if (!timing || !timing.duration || reducedMotion(panel)) return;
    const to = open ? panel.offsetHeight : 0;
    if (from === to) return;
    // Closing, it slows to a stop on ease-move rather than the fade's ease-exit, which would end what's below at full speed.
    const swap = swapTime(panel);
    const easing = open ? timing.easing : getComputedStyle(panel).getPropertyValue(swap ? '--ease-enter' : '--ease-move').trim() || timing.easing;
    grow.current = panel.animate({ height: [from + 'px', to + 'px'] }, { duration: swap || timing.duration, easing, fill: open ? 'none' : 'forwards' });
    grow.current.id = 'srp-accordion-height';
    if (open) grow.current.onfinish = () => { grow.current = null; };
  }, [open]);
  React.useEffect(() => () => { if (grow.current) grow.current.cancel(); }, []);
  React.useEffect(function () {
    const el = content.current;
    if (!el) return;
    const onMatch = () => { if (toggle.current) toggle.current(); };
    el.addEventListener('beforematch', onMatch);
    el.addEventListener('invalid', revealInvalid, true);   // a required field in it, on submit, opens it (L8E99)
    return () => { el.removeEventListener('beforematch', onMatch); el.removeEventListener('invalid', revealInvalid, true); };
  }, []);
  return (
    <div {...rest} ref={ref} data-state={open ? 'open' : 'closed'} className={cn('srp-accordion__item', open && 'srp-accordion__item--open', props.disabled && 'srp-accordion__item--disabled', props.className)}>
      <H className="srp-accordion__heading">
        <button type="button" id={id + '-t'} className="srp-accordion__trigger" aria-expanded={open} aria-controls={id + '-p'} disabled={props.disabled}
          aria-disabled={locked ? true : undefined} onClick={() => { if (ctx && !locked) ctx.toggle(value); }}>
          <span className="srp-accordion__title">{props.title}</span>
          <Icon icon={icons.ExpandMore} className="srp-accordion__icon" />
        </button>
      </H>
      <div id={id + '-p'} role={open && !(ctx && ctx.many) ? 'region' : undefined} aria-labelledby={id + '-t'} className="srp-accordion__panel">
        <div className="srp-accordion__clip"><div ref={content} className="srp-accordion__content" hidden={startsClosed || undefined}>{mounted ? props.children : null}</div></div>
      </div>
    </div>
  );
}

/* AccordionItem: a heading holding a button (aria-expanded, aria-controls) and a region (aria-labelledby) that
   grows to its height as it unfolds (a fade and a clip), and folds back as it shrinks; closed content is hidden from everyone, but find-in-page can still
   find it (hidden="until-found"), which opens the item. */
/** One item in an Accordion: a title button and the content it shows and hides. */
export const AccordionItem = /* @__PURE__ */ named('AccordionItem', AccordionItemRender);
