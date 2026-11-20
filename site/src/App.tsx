// The site's pages by address, drawn in the browser (main.tsx) and ahead of time into each page's HTML (server.tsx).
import * as React from 'react';
import { configure } from '../../src/internal/config';
import { Button } from '../../src/components/Button/Button';
import { EmptyState } from '../../src/components/EmptyState/EmptyState';
import { Heading } from '../../src/components/Heading/Heading';
import { ErrorBoundary } from '../../src/components/ErrorBoundary/ErrorBoundary';
import { About } from './About';
import { Doc, loadDoc, type Loaded } from './Doc';
import type { StoryEntry } from './stories';
import { takeOver } from './drawn';
import { Frame, frameEntry } from './Frame';
import { Home } from './Home';
import { Index } from './Index';
import { pageAt, sections } from './pages';
import { RouterLink, usePath } from './router';
import { Shell } from './Shell';
import { Showcase } from './Showcase';
import { Themes } from './Themes';

// Every Serupa component with an href (Navbar, Sidebar, Card, Button, Link) goes through the site's router.
configure({ link: RouterLink });

function NotFound() {
  React.useEffect(() => { document.title = 'Page not found · Serupa'; }, []);
  return <Shell>
    <Heading level={1} className="sr-only">Page not found</Heading>
    <EmptyState icon="explore_off" title="There’s no page here" description="The address may be old, or mistyped." headingLevel={2}
      actions={<><Button href="/">Go to the front page</Button><Button href="/components" variant="outline">Browse the components</Button></>} />
  </Shell>;
}

type Initial = Loaded | StoryEntry | null;
/** What the page at a site path needs before it can be drawn whole: a docs page's content, a frame's story, or
 *  nothing. */
export const preload = (path: string): Promise<Initial> => {
  if (path.startsWith('/frame/')) return frameEntry(path.slice(7));
  const page = pageAt(path);
  return page ? loadDoc(page) : Promise.resolve(null);
};

/** The page for the address. initial is what preload gave for it. */
export function App({ initial = null }: { initial?: Initial }) {
  const path = usePath();
  const page = pageAt(path);
  const section = sections.find((s) => s.lead && s.path === path);
  // The page drawn ahead of time is taken over once the first render is in: what draws after it is the browser's own.
  React.useEffect(() => takeOver(false), []);
  return <ErrorBoundary resetKeys={[path]}>
    {path === '/' ? <Home /> : page ? <Doc page={page} initial={initial && 'Content' in initial ? initial : null} /> : section ? <Index section={section} />
      : path === '/about' ? <About /> : path === '/themes' ? <Themes /> : path === '/showcase' ? <Showcase />
      : path.startsWith('/frame/') ? <Frame id={path.slice(7)} initial={initial && 'slug' in initial ? initial : null} /> : <NotFound />}
  </ErrorBoundary>;
}
