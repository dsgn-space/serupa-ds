'use client';
import * as React from 'react';
import { cn, domId, omit } from '../../internal/cn';
import { reducedMotion as reduced } from '../../internal/mediaList';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useServerStyles } from '../../internal/serverStyles';
import { en as words } from './labels';

/** One entry: the id of the heading it goes to, its text, and its level (2 for an h2). */
export interface TocItem {
  id: string;
  label: React.ReactNode;
  /** 2 (default) for a section, 3 for one under it, and so on: each step indents it. */
  level?: number | undefined;
}

export interface TableOfContentsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The entries. Leave it out to read them from the headings in `container`. */
  items?: TocItem[] | undefined;
  /** Where to find the headings when items is left out: an element, or a selector. Default: the page's <main>, else <body>. */
  container?: Element | string | null | undefined;
  /** Which headings it lists, as a selector. Default: "h2, h3". */
  headings?: string | undefined;
  /** The title over the list, and the landmark's name. Default: "On this page"; null for none (then name it with aria-label). */
  title?: React.ReactNode | null | undefined;
  /** How far from the top of the window a heading counts as reached, in pixels: past it, its section is the current one.
   *  Set it to a sticky header's height plus a little. Default: 96. */
  offset?: number | undefined;
}

const slug = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';

/* TableOfContents: an "On this page" list of links to the page's sections, as a navigation landmark. It reads the
   headings from the page (giving an id to one that has none) or takes items. As the page scrolls, the link to the
   section being read is marked aria-current="location" and highlighted: the last heading above the offset line.
   A click scrolls to the heading (smoothly, unless motion is reduced), puts its id in the address, and moves focus to
   it, so the next Tab continues from there. */
/** An "On this page" list of links to the page's sections, marking the one being read.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TableOfContents = /* @__PURE__ */ component<HTMLElement, TableOfContentsProps>('TableOfContents', function TableOfContents(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { items: 1, container: 1, headings: 1, title: 1, offset: 1, className: 1 } as const);
  const titleId = domId('dk-toc', React.useId()) + '-title';
  const offset = props.offset ?? 96;
  const [found, setFound] = React.useState<TocItem[]>([]);
  const items = props.items || found;
  const [current, setCurrent] = React.useState<string | null>(null);
  const selector = props.headings || 'h2, h3';
  // After a click, the clicked section stays current while the page scrolls to it (until it stops, or a second).
  const pinned = React.useRef(0);
  // Each entry's indent is an inline style: after hydration under a strict CSP it's applied again (serverStyles).
  const styled = useServerStyles(ref);

  // Read the headings once mounted, again when headings are added, removed or renamed later (content loaded after
  // the page, a tab that renders its panel), and when what to read changes.
  React.useEffect(() => {
    if (props.items) return;
    const box = typeof props.container === 'string' ? document.querySelector(props.container) : props.container || document.querySelector('main') || document.body;
    if (!box) return;
    let last = '', frameId = 0, hashDone = false;
    const read = () => {
      frameId = 0;
      const used = new Set<string>();
      const next = [...box.querySelectorAll<HTMLElement>(selector)].filter((h) => !h.closest("[data-component='table-of-contents']")).map((h) => {
        // An id from the heading's text for a heading without one, kept unique on the page.
        if (!h.id) { const b = slug(h.textContent); let id = b, n = 2; while (document.getElementById(id) || used.has(id)) id = b + '-' + n++; h.id = id; }
        used.add(h.id);
        return { id: h.id, label: h.textContent, level: Number(h.tagName.slice(1)) || 2 };
      });
      const key = JSON.stringify(next);
      if (key !== last) { last = key; setFound(next); }
      // A shared link to a heading whose id is made here (#beta-part): the browser looked for it before it existed,
      // so the page opened at the top. Go there once, as the browser would have, the first time the id exists.
      if (!hashDone) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const h = hash ? document.getElementById(hash) : null;
        if (!hash) hashDone = true;
        else if (h && used.has(hash)) { hashDone = true; h.scrollIntoView({ block: 'start' }); }
      }
    };
    read();
    // Only the headings' own changes matter: mutations inside this list (its links re-render) are left out.
    const watch = new MutationObserver((list) => {
      const mine = (n: Node) => { const e = n instanceof Element ? n : n.parentElement; return !!e && !!e.closest("[data-component='table-of-contents']"); };
      if (frameId || list.every((m) => mine(m.target))) return;
      frameId = requestAnimationFrame(read);
    });
    watch.observe(box, { childList: true, subtree: true, characterData: true });
    return () => { watch.disconnect(); if (frameId) cancelAnimationFrame(frameId); };
  }, [props.items, props.container, selector]);

  // The current section: the last heading whose top has passed the offset line (the first one before any has).
  const ids = items.map((i) => i.id).join('\n');
  React.useEffect(() => {
    if (!ids) return;
    const list = ids.split('\n');
    let frame = 0;
    // The box the headings scroll in: the page, or a pane of its own (overflow auto or scroll) around them.
    const scroller = (): HTMLElement | null => {
      for (let e = document.getElementById(list[0])?.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
        const o = getComputedStyle(e).overflowY;
        if ((o === 'auto' || o === 'scroll' || o === 'overlay') && e.scrollHeight > e.clientHeight) return e;
      }
      return null;
    };
    const update = () => {
      frame = 0;
      if (Date.now() < pinned.current) return;
      const pane = scroller(), top = pane ? pane.getBoundingClientRect().top : 0;
      let at: string | null = null;
      for (const id of list) {
        const h = document.getElementById(id);
        if (!h) continue;
        if (h.getBoundingClientRect().top - top - offset <= 1 || at == null) at = id;
        else break;
      }
      // At the very bottom, the last section is current even when its heading can't reach the line.
      const bottom = pane ? pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (bottom) { const last = list[list.length - 1]; if (last && document.getElementById(last)) at = last; }
      setCurrent(at);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onEnd = () => { pinned.current = 0; };
    update();
    // Scroll doesn't bubble, but it reaches the document while capturing: the page's scroll and a pane's alike.
    const opts = { capture: true, passive: true } as const;
    document.addEventListener('scroll', onScroll, opts);
    document.addEventListener('scrollend', onEnd, { capture: true });
    window.addEventListener('resize', onScroll);
    return () => { document.removeEventListener('scroll', onScroll, opts); document.removeEventListener('scrollend', onEnd, { capture: true }); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [ids, offset]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const h = document.getElementById(id);
    if (!h) return;
    e.preventDefault();
    pinned.current = Date.now() + 1000;
    h.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
    if (window.location.hash !== '#' + id) window.history.pushState(null, '', '#' + id);
    setCurrent(id);
  };

  const title = props.title === undefined ? L.tocTitle : props.title;
  const minLevel = items.reduce((m, i) => Math.min(m, i.level ?? 2), 6);
  return (
    <nav {...rest} ref={styled} className={cn('dk-toc', props.className)} data-component="table-of-contents"
      aria-labelledby={props['aria-label'] || props['aria-labelledby'] || title == null ? props['aria-labelledby'] : titleId}>
      {title != null ? <p className="dk-toc__title" id={titleId}>{title}</p> : null}
      <ul className="dk-toc__list" role="list">
        {items.map((it) => (
          <li key={it.id} className="dk-toc__item" style={{ '--dk-toc-depth': Math.max(0, (it.level ?? 2) - minLevel) } as React.CSSProperties}>
            <a className="dk-toc__link" href={'#' + it.id} aria-current={current === it.id ? 'location' : undefined} onClick={(e) => go(e, it.id)}>{it.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
