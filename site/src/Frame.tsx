// One story on a page of its own, with nothing around it (/frame/patterns-dashboard--default): what a screen in the
// showcase frames, so the story lays itself out for the frame's width as it would for a phone's or a laptop's.
import * as React from 'react';
import { EmptyState } from '../../src/components/EmptyState/EmptyState';
import { Heading } from '../../src/components/Heading/Heading';
import { Loader } from '../../src/components/Loader/Loader';
import { pages } from './pages';
import { loadStories, StoryView, type StoryEntry } from './stories';

// Inside a screen (an iframe on the front page or the showcase) a theme change is applied at once, with no crossfade
// of its own: the page around it already crossfades, the screen with it, and a View Transition in a frame while its
// parent runs one has crashed the tab in Chrome. The theme script goes without one where the document has none.
if (typeof window !== 'undefined' && window.parent !== window) {
  try { Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true }); } catch { /* the crossfade stays */ }
}

export function Frame({ id }: { id: string }) {
  const [pageId = '', slug = ''] = id.split('--');
  const file = pages.find((p) => p.id === pageId)?.stories ?? null;
  const [entry, setEntry] = React.useState<StoryEntry | null | undefined>(undefined);
  React.useEffect(() => {
    let live = true;
    setEntry(undefined);
    if (!file) { setEntry(null); return; }
    loadStories(file).then((all) => { if (live) setEntry(all.find((e) => e.slug === slug) ?? null); }, () => { if (live) setEntry(null); });
    return () => { live = false; };
  }, [file, slug]);
  React.useEffect(() => { if (entry) document.title = `${entry.name} · ${entry.meta.title?.split('/').pop() ?? 'Example'} · Serupa`; }, [entry]);
  if (entry === undefined) return <div className="site-loading"><Loader label="Loading the example" /></div>;
  if (entry === null) return <main className="site-loading"><Heading level={1} className="sr-only">Example not found</Heading><EmptyState icon="explore_off" title="There’s no example here" description="The address may be old, or mistyped." headingLevel={2} /></main>;
  return <div className="site-frame" data-site-frame=""><StoryView entry={entry} /></div>;
}
