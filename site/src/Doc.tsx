// A docs page: the .mdx file Storybook shows, drawn with the site's blocks and elements, with the page's sections
// listed beside it and the pages before and after it under it.
import * as React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary/ErrorBoundary';
import { Loader } from '../../src/components/Loader/Loader';
import { TableOfContents } from '../../src/components/TableOfContents/TableOfContents';
import { DocsContext, type Docs } from './blocks';
import { elements } from './markdown';
import { loadPage, loadProps, pagesOf, sectionOf, type ComponentDoc, type Page } from './pages';
import { href, resolve } from './router';
import { Shell } from './Shell';
import { storiesOf } from './stories';

type Loaded = { page: Page; Content: React.ComponentType<{ components?: Record<string, React.ElementType> }>; docs: ComponentDoc[] };

// The page's sections: its h2 and h3, without the headings inside a story or the docs' long lists (the tests, the changes).
const HEADINGS = ['h2', 'h3'].map((h) => `${h}[id]:not([data-site-demo] *, .sb-tested h3, .sb-changes h3, .sb-anatomy *, .sb-dodont *, .sb-unstyled *)`).join(', ');

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

/** Gives every heading in the article an id (the ones Markdown wrote have none), each once, so the section list
 *  and a #link can reach it. */
function nameHeadings(article: HTMLElement) {
  const taken = new Set([...document.querySelectorAll('[id]')].map((e) => e.id));
  for (const h of article.querySelectorAll<HTMLElement>('h2, h3, h4')) {
    if (h.id || h.closest('[data-site-demo]')) continue;   // a story's own headings are its, not the page's
    const base = slug(h.textContent ?? '');
    let id = base;
    for (let n = 1; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    h.id = id;
  }
}

/** Points the docs' Storybook links (?path=/docs/…) at the site's pages, in the address itself, so a new tab or a
 *  copied link goes to the right place. The blocks write some as plain <a>s, and some arrive after the page. */
function pointLinks(root: ParentNode) {
  for (const a of root.querySelectorAll<HTMLAnchorElement>('a[href^="?path="]')) {
    const to = resolve(a.getAttribute('href')!);
    if (!to.startsWith('?')) a.setAttribute('href', href(to.split('#')[0]!) + (to.includes('#') ? '#' + to.split('#')[1] : ''));
  }
}

function PrevNext({ page }: { page: Page }) {
  const section = sectionOf(page.path);
  const list = section ? pagesOf(section) : [];
  const i = list.findIndex((p) => p.path === page.path);
  const prev = list[i - 1], next = list[i + 1];
  if (!prev && !next) return null;
  return <nav className="site-prevnext" aria-label="More pages">
    {prev ? <a className="site-prevnext__link" href={prev.path}><span className="site-prevnext__dir">Previous</span><span className="site-prevnext__name">{prev.name}</span></a> : <span />}
    {next ? <a className="site-prevnext__link site-prevnext__link--next" href={next.path}><span className="site-prevnext__dir">Next</span><span className="site-prevnext__name">{next.name}</span></a> : <span />}
  </nav>;
}

export function Doc({ page }: { page: Page }) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [failed, setFailed] = React.useState<Error | null>(null);
  // How many times the article has been named: the section list reads the headings again when it changes.
  const [named, setNamed] = React.useState(0);
  const article = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    let live = true;
    setFailed(null);
    Promise.all([loadPage(page), page.component ? loadProps(page.component) : Promise.resolve([])])
      .then(([mod, docs]) => { if (live) setLoaded({ page, Content: mod.default, docs }); }, (e: unknown) => { if (live) setFailed(e instanceof Error ? e : new Error(String(e))); });
    return () => { live = false; };
  }, [page]);
  // The page that's showing: the last one loaded stays until the next has arrived, so the frame never empties.
  const shown = loaded;
  const ready = shown?.page === page;
  React.useEffect(() => {
    if (!ready || !article.current) return;
    document.title = `${page.name} · Serupa`;
    const el = article.current;
    nameHeadings(el);
    setNamed((n) => n + 1);
    pointLinks(el);
    const links = new MutationObserver(() => pointLinks(el));
    links.observe(el, { childList: true, subtree: true });
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) document.getElementById(hash)?.scrollIntoView(); else window.scrollTo(0, 0);
    return () => links.disconnect();
  }, [ready, page]);
  const docs = React.useMemo<Docs>(() => ({ componentStories: () => storiesOf(shown?.page.stories), page: shown?.page ?? null, docs: shown?.docs ?? [] }), [shown]);
  if (failed) throw failed;
  return <Shell aside={shown && <TableOfContents key={`${shown.page.path}:${named}`} variant="rail" container="#article" headings={HEADINGS} />}>
    {!shown ? <div className="site-loading"><Loader size="lg" label={`Loading ${page.name}`} /></div> : <DocsContext.Provider value={docs}>
      <article id="article" ref={article} className="site-doc" aria-busy={!ready || undefined} key={shown.page.path}>
        <ErrorBoundary className="site-broken" title="This page couldn’t be shown" resetKeys={[shown.page.path]}>
          <shown.Content components={elements} />
        </ErrorBoundary>
      </article>
      <PrevNext page={shown.page} />
    </DocsContext.Provider>}
  </Shell>;
}
