// The site's router: the address bar's path picks the page, with no library. A link to another page of the site
// changes the path and the page without a reload; a modified click, a download or another site's link is the
// browser's. Storybook's own links in the docs (?path=/docs/…--docs) are followed to the site's page for them.
import * as React from 'react';
import { pageForStorybook } from './pages';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** A site path ("/components/button") as an address, under the folder the site is served from. */
export const href = (to: string) => BASE + to;
/** The site path in the address bar. */
export const current = () => (window.location.pathname.startsWith(BASE) ? window.location.pathname.slice(BASE.length) : window.location.pathname).replace(/\/+$/, '') || '/';

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/** Go to a site path, with an optional #section. */
export function navigate(to: string, { replace = false } = {}) {
  const [path = '/', hash] = to.split('#');
  const same = path === current();
  window.history[replace ? 'replaceState' : 'pushState'](null, '', href(path) + (hash ? '#' + hash : ''));
  for (const fn of listeners) fn();
  if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
  else if (!same) window.scrollTo(0, 0);
}

// The path a page is drawn for ahead of time, into its HTML (tools/site/prerender.mjs), where there is no address bar.
let drawing = '/';
/** Draws the next render for this path, outside a browser. */
export const drawFor = (path: string) => { drawing = path; };

/** The current site path, without a trailing slash: "/" or "/components/button". */
export function usePath(): string {
  // In the browser the page drawn ahead of time is taken over at the address it was drawn for, so the first render
  // reads the address too.
  return React.useSyncExternalStore(subscribe, current, () => (typeof window === 'undefined' ? drawing : current()));
}

/** Where a link in the docs leads on the site: a Storybook link's page, or the href as it is. */
export function resolve(to: string): string {
  // A docs link may name a section of its page (#props): it leads to the same section of the site's page.
  const story = /^\?path=\/(docs|story)\/([a-z0-9-]+?)(?:--([a-z0-9-]+))?(#[\w-]+)?$/.exec(to);
  if (!story) return to;
  const page = pageForStorybook(story[2]!);
  if (!page) return to;
  return page.path + (story[1] === 'story' && story[3] ? '#' + story[3] : story[4] ?? '');
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => { for (const fn of listeners) fn(); });
  // One listener for every link on the page: the components' own links, the Markdown's and the docs' plain <a>s.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]');
    if (!a || a.getAttribute('target') || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href')!;
    const to = resolve(raw);
    if (to.startsWith('?path=')) { e.preventDefault(); return; }   // a Storybook page the site doesn't have
    if (!to.startsWith('/') || to.startsWith('//')) return;        // another site, #section, mailto:
    const path = to.startsWith(BASE + '/') || to === BASE ? to.slice(BASE.length) || '/' : to;
    e.preventDefault();
    navigate(path);
  });
  // Opened at a Storybook address (a link copied from the docs): go to the site's page for it.
  const asked = new URLSearchParams(window.location.search).get('path');
  if (asked) { const to = resolve('?path=' + asked); if (!to.startsWith('?')) navigate(to, { replace: true }); }
}

/** A link to a site path. Serupa's components get it through configure({ link }), so their href is a site path too. */
export const RouterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink({ href: to, ...rest }, ref) {
  const target = to == null ? undefined : resolve(to);
  // eslint-disable-next-line jsx-a11y-x/anchor-has-content -- the content comes with the props
  return <a ref={ref} href={target != null && target.startsWith('/') && !target.startsWith('//') ? href(target) : target} {...rest} />;
});
