'use client';
import * as React from 'react';
import { cn, omit, useIsoLayoutEffect } from '../../internal/cn';
import { useBreakpoint } from '../../internal/media';
import { useServerStyles } from '../../internal/serverStyles';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { named } from '../../internal/component';
import { activeIn } from '../../internal/root';
import { flattenChildren } from '../../internal/children';
import { useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { en as words } from './labels';
import { project, speed, track as sample, type Samples } from '../../internal/fling';
import { useControllable } from '../../internal/controllable';

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The slides, one per child (pictures, cards, anything). */
  children?: React.ReactNode | undefined;
  /** What the carousel shows, such as "Featured products": it names the region. Required unless you give aria-label, or aria-labelledby pointing at a visible heading. */
  label?: string | undefined;
  /** The slide shown (from 0), when you control it. */
  index?: number | undefined;
  /** The first slide shown when you don't control it. Default: 0. */
  defaultIndex?: number | undefined;
  /** Called with the new slide's index when the person moves to it. */
  onIndexChange?: ((index: number) => void) | undefined;
  /** Past the last slide comes the first, and before the first the last. Default: false (the buttons stop at the ends). */
  loop?: boolean | undefined;
  /** The previous and next buttons on the sides. Default: true. */
  arrows?: boolean | undefined;
  /** A dot for each slide under the carousel. Default: true. */
  dots?: boolean | undefined;
  /** The previous button's name. Default: "Previous slide". */
  previousLabel?: string | undefined;
  /** The next button's name. Default: "Next slide". */
  nextLabel?: string | undefined;
  /** Each slide's name, and its dot's, from the index (from 0) and the count. Default: the slideOf label, "2 of 5". */
  slideLabel?: ((index: number, count: number) => string) | undefined;
  /** How many slides show side by side: a number, or one per screen width, { base, sm, md, lg } (from 640, 768
      and 1024px up; each one holds until the next is set). Default: 1. Previous and next still move one slide,
      and with more than one the dots count pages. */
  perView?: number | CarouselPerView | undefined;
  /** Shows the edge of the next slide (48px, the carousel-peek token) so people can see there is more. The slide
      that peeks stays out of the tab order and screen readers' view until it is moved to. On the last slide the
      previous one peeks instead. Default: false. */
  peek?: boolean | undefined;
}
export interface CarouselPerView { base?: number; sm?: number; md?: number; lg?: number }

const WIDTHS = [['sm', 640], ['md', 768], ['lg', 1024]] as const;
const whole = (n: unknown) => Math.max(1, Math.floor(Number(n)) || 1);
type Bp = 'base' | 'sm' | 'md' | 'lg';
function perAt(per: CarouselProps['perView'], count: number): Record<Bp, number> | null {
  if (per == null || typeof per !== 'object') return null;
  const cap = Math.max(1, count), out = { base: Math.min(whole(per.base), cap) } as Record<Bp, number>;
  let n = out.base;
  for (const [k] of WIDTHS) { if (per[k] != null) n = Math.min(whole(per[k]), cap); out[k] = n; }
  return out;
}
/** The slides per view at the screen width now, following the breakpoints as the width changes (the base count in
 *  server HTML, where CSS lays out the width). */
function usePerView(per: CarouselProps['perView']): number {
  const map = per != null && typeof per === 'object' ? per : null;
  const at = { sm: useBreakpoint('sm'), md: useBreakpoint('md'), lg: useBreakpoint('lg') };
  if (!map) return whole(per);
  let n = whole(map.base);
  for (const [k] of WIDTHS) if (map[k] != null && at[k]) n = whole(map[k]);
  return n;
}

/* Carousel: one slide at a time with previous and next buttons, a dot per slide and swipe. The outer
   <section> is a region named by label (aria-roledescription "carousel"); each slide is a group named
   "2 of 5", and the slides not shown are inert. It never moves on its own. The slides sit in a native scroll
   container with scroll snap: a touch swipe, a trackpad and Shift with the wheel scroll it with the platform's own
   momentum, one slide per gesture (scroll-snap-stop), and the index follows where it settles. The buttons, dots
   and a controlled index scroll it there, smoothly (at once with reduced motion). Before JavaScript runs, the
   slides already scroll and snap, and none is inert. className and every other prop go to the <section>. With
   perView, two or more slides show side by side: index is the first one shown, the buttons still move one slide,
   and the dots count pages. */
const OWN = { children: 1, label: 1, index: 1, defaultIndex: 1, onIndexChange: 1, loop: 1, arrows: 1, dots: 1, previousLabel: 1, nextLabel: 1, slideLabel: 1, perView: 1, peek: 1, className: 1, style: 1 } as const;
const SWIPE = 40; // px a mouse drag must travel to change the slide
const FLICK = 0.3; // px per ms over the last 100ms: a shorter drag this fast changes the slide too
const QUIET = 120; // ms without scrolling that counts as settled, where scrollend isn't there

/** One slide at a time, with previous and next buttons, dots and swipe. */
function CarouselRender({ ref, ...props }: CarouselProps & React.RefAttributes<HTMLElement>) {
  const nameRef = useNameCheck('Carousel', NAME_HOW.label);   // warns when it has no accessible name
  const restyle = useServerStyles(ref);
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const slides = flattenChildren(props.children);
  const count = slides.length;
  const per = Math.min(usePerView(props.perView), Math.max(1, count));
  // With a breakpoint map, the slides per view at each width, carried up from the one below and capped at the slide
  // count. CSS picks from these with media queries (Carousel.css), so the server HTML is already laid out for the
  // width and nothing moves when matchMedia catches up after mount.
  const perMap = perAt(props.perView, count);
  const last = Math.max(0, count - per);   // the last index: the first slide of the last full view
  const clamp = (i: number) => Math.min(Math.max(0, Math.floor(i) || 0), last);
  // null counts as not passed, as before.
  const [held, setOwn, controlled] = useControllable<number>(props.index == null ? undefined : props.index, props.defaultIndex || 0, 'Carousel', 'index');
  const index = clamp(held);
  const loop = !!props.loop && last > 0;
  // Pages for the dots: with 3 per view and 7 slides, 1–3, 4–6 and 5–7; a dot goes to its page's first slide.
  const pages = Math.ceil(count / per), page = index >= last ? pages - 1 : Math.floor(index / per);
  const pageStart = (k: number) => Math.min(k * per, last);
  const dotName = (k: number) => per > 1 ? sds.labels.slidesOf(pageStart(k) + 1, pageStart(k) + per, count) : name(k, count);
  const name = props.slideLabel || ((i: number, n: number) => sds.labels.slideOf(i + 1, n));
  const dotsRef = React.useRef<HTMLDivElement>(null);
  const viewport = React.useRef<HTMLDivElement>(null);
  const track = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; from: number; id: number; s: Samples } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const dragged = React.useRef(false);   // a drag just ended: the click that follows it doesn't count
  const prevBtn = React.useRef<HTMLButtonElement>(null), nextBtn = React.useRef<HTMLButtonElement>(null);
  const refocus = React.useRef<'prev' | 'next' | 'dot' | null>(null);
  // Off-screen slides are inert only once the page runs: in server HTML, before JavaScript, every slide can be
  // scrolled to and read. Set before the first paint, so a page rendered in the browser never shows them live.
  const [live, setLive] = React.useState(false);
  useIsoLayoutEffect(() => { setLive(true); }, []);
  // A scroll that settled where a controlled parent didn't follow: a render to scroll back to its index.
  const [recheck, setRecheck] = React.useState(0);
  // The slide the view is scrolling to for the index, until it gets there.
  const heading = React.useRef<number | null>(null);

  const go = (i: number) => {
    const next = loop ? ((i % (last + 1)) + last + 1) % (last + 1) : clamp(i);
    if (next === index) return;
    if (!controlled) setOwn(next);
    if (props.onIndexChange) props.onIndexChange(next);
  };
  const rtl = () => !!viewport.current && getComputedStyle(viewport.current).direction === 'rtl';
  // The direction as laid out (a dir attribute or CSS direction), so the chevrons can follow it.
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  // every render: an ancestor's dir or direction can change without a render of ours; reading it is a style lookup, not a layout.
  useIsoLayoutEffect(() => { const d = rtl() ? 'rtl' : 'ltr'; if (d !== dir) setDir(d); });

  // How far to scroll (in scrollLeft's sign) to put slide i at the start of the view.
  const delta = (i: number) => {
    const v = viewport.current, s = track.current?.children[i];
    if (!v || !s) return 0;
    const vr = v.getBoundingClientRect(), sr = s.getBoundingClientRect();
    return rtl() ? sr.right - vr.right : sr.left - vr.left;
  };
  // The index the scroll is at: the slide whose start is nearest the view's start, or the last at the far end (where
  // a peek or the last full view can't line up a slide's start).
  const scrolledTo = () => {
    const v = viewport.current;
    if (!v || last < 1) return index;
    if (Math.abs(v.scrollLeft) >= v.scrollWidth - v.clientWidth - 1) return last;
    let best = 0, near = Infinity;
    for (let i = 0; i <= last; i++) { const d = Math.abs(delta(i)); if (d < near) { near = d; best = i; } }
    return best;
  };
  const latest = React.useRef({ index, go, scrolledTo, controlled });
  React.useInsertionEffect(function () { latest.current = { index, go, scrolledTo, controlled }; });   // every render: what the scroll listeners read
  // Where a scroll settled (a swipe, a trackpad, Shift and the wheel, the find bar): that slide becomes the index.
  // scrollsnapchange and scrollend say so where they're supported, and a quiet moment after the last scroll anywhere.
  useIsoLayoutEffect(() => {
    const v = viewport.current;
    if (!v || last < 1) return;
    let quiet = 0;
    const settled = () => {
      window.clearTimeout(quiet);
      if (drag.current) return;   // a mouse drag decides on release
      const l = latest.current, n = l.scrolledTo();
      // While the view heads for a slide the index asked for, a scroll that ends on the way (a drag's own, or an
      // earlier one) isn't where people stopped.
      if (heading.current != null) { if (n === heading.current) heading.current = null; return; }
      if (n === l.index) return;
      l.go(n);
      l.index = n;   // scrollsnapchange and scrollend can both come before the render
      if (l.controlled) setRecheck((k) => k + 1);   // the parent may keep its index: scroll back to it
    };
    const onScroll = () => { window.clearTimeout(quiet); quiet = window.setTimeout(settled, QUIET); };
    // People take over: a press or a wheel stops the view heading anywhere, so where they stop counts.
    const mine = () => { heading.current = null; };
    v.addEventListener('scroll', onScroll, { passive: true });
    v.addEventListener('scrollend', settled);
    v.addEventListener('scrollsnapchange', settled);
    v.addEventListener('pointerdown', mine);
    v.addEventListener('wheel', mine, { passive: true });
    return () => { v.removeEventListener('pointerdown', mine); v.removeEventListener('wheel', mine); v.removeEventListener('scroll', onScroll); v.removeEventListener('scrollend', settled); v.removeEventListener('scrollsnapchange', settled); window.clearTimeout(quiet); };
  }, [last]);
  // The index scrolls the view: at once on the first render and with reduced motion, smoothly otherwise. Nothing
  // happens when the scroll is already there (a swipe that settled), or while a mouse drag holds it; a drag let go
  // of short of a slide comes back here.
  // Smoothly is the viewport's scroll-behavior (Carousel.css: smooth unless motion is reduced), which 'auto' follows.
  const first = React.useRef(true);
  useIsoLayoutEffect(() => {
    const v = viewport.current, at = first.current;
    first.current = false;
    if (!v || dragging) return;
    // Where it heads, from where it is now, inside the scroll's range (scrollLeft runs negative right to left).
    const max = v.scrollWidth - v.clientWidth, to = Math.min(rtl() ? 0 : max, Math.max(rtl() ? -max : 0, v.scrollLeft + delta(index)));
    if (Math.abs(to - v.scrollLeft) < 1) return;
    heading.current = at ? null : index;
    v.scrollTo({ left: to, behavior: at ? 'instant' : 'auto' });
  }, [index, recheck, per, count, dragging]);

  const onDotsKey = (e: React.KeyboardEvent) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's (Alt+← goes back a page): leave them (L8E28).
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const back = rtl() ? 'ArrowRight' : 'ArrowLeft', fwd = rtl() ? 'ArrowLeft' : 'ArrowRight';
    let to = -1;
    if (e.key === back) to = loop ? page - 1 : Math.max(0, page - 1);
    else if (e.key === fwd) to = loop ? page + 1 : Math.min(pages - 1, page + 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = pages - 1;
    else return;
    e.preventDefault();
    to = ((to % pages) + pages) % pages;
    refocus.current = 'dot';   // focus the current dot once the index settles (a controlled parent may say no)
    go(pageStart(to));
  };
  const arrow = (step: 1 | -1) => {
    const to = index + step;
    if (!loop && (to <= 0 || to >= last)) refocus.current = step > 0 ? 'prev' : 'next';   // this button hides at the end: keep focus on the other
    go(to);
  };
  // every render: puts focus back after a key or button moved the slides, once the render has moved them.
  useIsoLayoutEffect(() => {
    const r = refocus.current;
    refocus.current = null;
    if (r === 'dot') (dotsRef.current?.children[page] as HTMLElement | undefined)?.focus();
    else if (r) {
      // its own root's focus: inside a shadow root that's null once the hidden button lost it, not the body (GR90)
      const a = activeIn(viewport.current);
      if (!a || a === prevBtn.current || a === nextBtn.current || a === document.body) (r === 'prev' ? prevBtn : nextBtn).current?.focus();
    }
  });

  // A mouse doesn't scroll a scroll container by dragging, so a drag with it does: the snap lets go while it's held,
  // and on release it moves one slide (40px or a flick) or goes back. Touch and pens scroll natively.
  const onPointerDown = (e: React.PointerEvent) => {
    if (last < 1 || e.pointerType !== 'mouse' || e.button !== 0 || !viewport.current) return;
    drag.current = { x: e.clientX, from: viewport.current.scrollLeft, id: e.pointerId, s: [{ t: e.timeStamp, p: e.clientX }] };
    dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current, v = viewport.current;
    if (!d || d.id !== e.pointerId || !v) return;
    const dx = e.clientX - d.x;
    if (!dragged.current && Math.abs(dx) < 8) return;
    // The snap lets go at once (data-dragging), not a render later, or this first move would snap back.
    if (!dragged.current) { dragged.current = true; v.setAttribute('data-dragging', ''); setDragging(true); try { v.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ } }
    sample(d.s, e.timeStamp, e.clientX);   // for the speed the mouse had as it let go
    v.scrollLeft = d.from - dx;
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!dragged.current) return;
    const dx = e.clientX - d.x, sp = speed(d.s);
    const flick = Math.abs(dx) > 10 && Math.abs(sp) > FLICK && Math.sign(sp) === Math.sign(dx);
    // Where the release is heading (KW11, fling.ts): a drag let go of while pulling back to under 40px springs back.
    const to = dx + project(sp), far = Math.abs(dx) >= SWIPE && Math.sign(to) === Math.sign(dx) && Math.abs(to) >= SWIPE;
    const n = flick || far ? index + ((dx < 0) !== rtl() ? 1 : -1) : index;
    setDragging(false);   // the index, new or the same, scrolls the view to its slide
    go(loop ? n : clamp(n));
  };
  // The pointer left or the browser took it before a drag began: change nothing.
  const onPointerCancel = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    drag.current = null; dragged.current = false;
    setDragging(false);   // back to the slide it was on
  };

  const style = { ...props.style, '--srp-carousel-count': count,
    ...(perMap ? { '--srp-carousel-per-base': perMap.base, '--srp-carousel-per-sm': perMap.sm, '--srp-carousel-per-md': perMap.md, '--srp-carousel-per-lg': perMap.lg } as Record<string, number> : { '--srp-carousel-per': per }) } as React.CSSProperties;
  const multi = perMap ? Math.max(perMap.base, perMap.sm, perMap.md, perMap.lg) > 1 : per > 1;
  // The widths where a dot is past the last page, so CSS hides it there until the dots are counted again after mount.
  const pastAt = (k: number) => perMap ? (['sm', 'md', 'lg'] as const).filter((b) => k >= Math.ceil(count / perMap[b])).join(' ') || undefined : undefined;
  const shown = (i: number) => !live || (i >= index && i < index + per);
  const prevOff = !loop && index === 0, nextOff = !loop && index >= last;

  return (
    <section {...rest} ref={(n) => { restyle(n); nameRef(n); }} className={cn('srp-carousel', (multi || props.peek) && 'srp-carousel--multi', props.peek && 'srp-carousel--peek', props.className)} style={style}
      aria-roledescription={sds.labels.carouselRole} aria-label={props.label ?? rest['aria-label']} data-component="carousel" data-index={index} data-dir={dir} data-per-map={perMap ? '' : undefined}>
      <div className="srp-carousel__frame">
        {/* A scroll container is a keyboard stop of its own (WCAG 2.1.1, axe's scrollable-region-focusable): focused,
            the arrow keys scroll it a slide at a time, and it's named by the slides in view ("2 of 5"). */}
        <div className="srp-carousel__viewport" ref={viewport} role={last > 0 ? 'group' : undefined} tabIndex={last > 0 ? 0 : undefined}
          aria-label={last > 0 ? (per > 1 ? sds.labels.slidesOf(index + 1, index + per, count) : name(index, count)) : undefined} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd} onPointerCancel={onPointerCancel} onLostPointerCapture={onPointerCancel}
          onDragStart={(e) => e.preventDefault()}   // a picture's own drag would end the swipe
          onClickCapture={(e) => { if (dragged.current && e.detail) { dragged.current = false; e.preventDefault(); e.stopPropagation(); } }}   // a swipe across a link isn't a click
          data-dragging={dragging ? '' : undefined}>
          <div className="srp-carousel__track" aria-live="polite" ref={track}>
            {slides.map((s, i) => (
              <div key={(s as React.ReactElement).key ?? i} className="srp-carousel__slide" role="group" aria-roledescription={sds.labels.slideRole} aria-label={name(i, count)}
                aria-hidden={shown(i) ? undefined : true} inert={!shown(i)} data-active={shown(i) ? '' : undefined}>
                {s}
              </div>
            ))}
          </div>
        </div>
        {props.arrows !== false && last > 0 ? <>
          <IconButton className="srp-carousel__arrow srp-carousel__arrow--prev" label={props.previousLabel || sds.labels.previousSlide} size="sm" variant="secondary" shape="round" hideTitle
            icon={<><Icon icon={icons.ChevronLeft} className="srp-carousel__ltr" mirror={false} /><Icon icon={icons.ChevronRight} className="srp-carousel__rtl" mirror={false} /></>}
            ref={prevBtn} disabled={prevOff} onClick={() => arrow(-1)} />
          <IconButton className="srp-carousel__arrow srp-carousel__arrow--next" label={props.nextLabel || sds.labels.nextSlide} size="sm" variant="secondary" shape="round" hideTitle
            icon={<><Icon icon={icons.ChevronRight} className="srp-carousel__ltr" mirror={false} /><Icon icon={icons.ChevronLeft} className="srp-carousel__rtl" mirror={false} /></>}
            ref={nextBtn} disabled={nextOff} onClick={() => arrow(1)} />
        </> : null}
      </div>
      {props.dots !== false && last > 0 ? (
        <div className="srp-carousel__dots" ref={dotsRef} onKeyDown={onDotsKey}>
          {Array.from({ length: pages }, (_, k) => (
            <button key={k} type="button" className="srp-carousel__dot" aria-label={dotName(k)} aria-current={k === page ? 'true' : undefined}
              tabIndex={k === page ? 0 : -1} data-past={pastAt(k)} onClick={() => go(pageStart(k))} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export const Carousel = /* @__PURE__ */ named('Carousel', CarouselRender);
