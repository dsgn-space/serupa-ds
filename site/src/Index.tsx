// A section's index (Components, Foundations, Patterns…): its pages as cards, grouped as the sidebar groups them,
// with a filter where there are many.
import * as React from 'react';
import { Badge } from '../../src/components/Badge/Badge';
import { Card, CardHeader } from '../../src/components/Card/Card';
import { EmptyState } from '../../src/components/EmptyState/EmptyState';
import { Heading } from '../../src/components/Heading/Heading';
import { SearchInput } from '../../src/components/SearchInput/SearchInput';
import { pagesOf, type NavSection, type Page } from './pages';
import { Shell } from './Shell';
import { loadStories, StoryView, type StoryEntry } from './stories';

const STATUS = { alpha: 'warning', beta: 'info', deprecated: 'danger' } as const;

// A component's first story, the one its page opens with, drawn small at the top of its card. It loads when the card
// comes near the screen, is shrunk to fit, and is only a picture: hidden from assistive technology, out of the tab
// order, and a click on it is a click on the card.
// A story that opens a dialog or a tooltip as it draws would put it over the whole index, so the card takes the first
// story that starts closed: Lightbox's gallery, Tooltip's trigger.
const closed = (e: StoryEntry) => { const args = { ...e.meta.args, ...e.moduleExport.args }; return args['open'] !== true && args['defaultOpen'] !== true; };

function Preview({ file }: { file: string }) {
  const box = React.useRef<HTMLDivElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const [entry, setEntry] = React.useState<StoryEntry | null>(null);
  React.useEffect(() => {
    const el = box.current;
    if (!el) return;
    let live = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      void loadStories(file).then((list) => { if (live) setEntry(list.find(closed) ?? null); });
    }, { rootMargin: '400px 0px' });
    io.observe(el);
    return () => { live = false; io.disconnect(); };
  }, [file]);
  React.useEffect(() => {
    const el = box.current, inner = stage.current;
    if (!el || !inner) return;
    // A block (a Progress bar, a list), a text field and anything wider than the stage take the stage's width, as
    // they would a page's; an inline one (a Button, a Badge), even inside the wrappers a story puts around it, stays
    // its own size, centered. (A flex item's display reads as a block's, so the stage is a block while they are read.)
    const inline = (e: Element): boolean => getComputedStyle(e).display.startsWith('inline') || (e.children.length === 1 && inline(e.children[0]!));
    const field = 'textarea, select, input:not([type="checkbox"], [type="radio"], [type="hidden"], [type="range"], [type="color"])';
    inner.style.display = 'block';
    // A field laid over boxes of its own (PinInput's one input over its six boxes) isn't a text field's box to widen.
    const drawnField = (e: Element) => [...e.querySelectorAll(field)].some((f) => getComputedStyle(f).position !== 'absolute');
    const blocks = [...inner.children].filter((child) => !inline(child) || child.matches(field) || drawnField(child) || (child as HTMLElement).offsetWidth > inner.clientWidth);
    inner.style.display = '';
    // As wide as the stage up to its own max-width, centered; one the story gave a width keeps it.
    // A picture keeps its own size.
    for (const child of blocks as HTMLElement[]) if (!child.style.width && !child.style.inlineSize && !child.matches('svg, img, canvas, video')) child.style.inlineSize = '100%';
    const fit = () => {
      // A story wider than the stage (a board, a grid) widens it, and is shrunk to fit like the rest.
      inner.style.inlineSize = '';
      inner.style.maxBlockSize = '';
      if (inner.scrollWidth > inner.offsetWidth) inner.style.inlineSize = `${inner.scrollWidth}px`;
      // Shrunk to the card's width, and to its height down to 60%: a taller story (a list, or room it keeps for a
      // menu to open into) shows its top, which is where its point is.
      const h = inner.scrollHeight || 1;
      // Only as wide as what's drawn: a lone Button keeps its size.
      const w = Math.max(...[...inner.children].map((c) => Math.max((c as HTMLElement).offsetWidth, c.scrollWidth)), 1);
      const scale = Math.min(1, (el.clientWidth - 32) / w, Math.max((el.clientHeight - 24) / h, 0.6));
      inner.style.setProperty('--site-preview-scale', String(scale));
      const tall = h * scale > el.clientHeight - 24;
      inner.toggleAttribute('data-tall', tall);
      // A tall stage ends where the picture does, so a bar or button the story pins to the screen's edge (a BottomNav
      // under a page of messages) shows at the picture's edge, as on a screen, not past it. (The stage is what
      // they're pinned to: its scale makes it their containing block.)
      if (tall) inner.style.maxBlockSize = `${(el.clientHeight - 12) / scale}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [entry]);
  return <div ref={box} className="site-card__preview" aria-hidden="true" inert>
    {entry && <div ref={stage} className="site-card__stage"><StoryView entry={entry} /></div>}
  </div>;
}

export function PageCard({ page, headingLevel = 3 }: { page: Page; headingLevel?: 2 | 3 }) {
  return <Card as="li" href={page.path} className="site-card">
    {page.component && page.stories && <Preview file={page.stories} />}
    {/* The status sits beside the name, not in the header's action column, which would hold the summary to a
        narrower column for the card's whole height. */}
    <CardHeader headingLevel={headingLevel} description={page.summary || undefined}
      title={page.status !== 'stable' ? <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">{page.name}<Badge tone={STATUS[page.status]}>{page.status[0]!.toUpperCase() + page.status.slice(1)}</Badge></span> : page.name} />
  </Card>;
}

export function Index({ section }: { section: NavSection }) {
  const [query, setQuery] = React.useState('');
  React.useEffect(() => { document.title = `${section.label} · Serupa`; window.scrollTo(0, 0); }, [section]);
  const total = pagesOf(section).length;
  const q = query.trim().toLowerCase();
  const groups = section.groups.map((g) => ({ ...g, pages: g.pages.filter((p) => !q || `${p.name} ${p.summary} ${p.group}`.toLowerCase().includes(q)) })).filter((g) => g.pages.length);
  const found = groups.reduce((n, g) => n + g.pages.length, 0);
  return <Shell>
    <div className="site-index">
      <header className="site-title">
        <p className="site-eyebrow">Serupa</p>
        <Heading level={1} className="site-h1">{section.label}</Heading>
        <p className="site-lead">{section.lead}</p>
      </header>
      {total > 12 && <div className="site-index__filter">
        <SearchInput aria-label={`Filter ${section.label.toLowerCase()}`} placeholder={`Filter ${total} ${section.label.toLowerCase()}`} value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
        <p className="sr-only" role="status">{q ? `${found} of ${total} shown` : ''}</p>
      </div>}
      {groups.map((g) => <section key={g.title} aria-label={g.title || section.label} className="site-index__group">
        {g.title && <Heading level={2} className="site-h site-h2">{g.title}</Heading>}
        <ul className="site-grid" role="list">{g.pages.map((p) => <PageCard key={p.path} page={p} headingLevel={g.title ? 3 : 2} />)}</ul>
      </section>)}
      {!groups.length && <EmptyState announce icon="search_off" title={`Nothing matches “${query}”`} description={`Try a shorter word, or what ${section.label === 'Components' ? 'the component does' : 'it’s for'}.`} />}
    </div>
  </Shell>;
}
