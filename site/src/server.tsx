// Draws a page of the site to HTML, outside a browser, for its file (tools/site/prerender.mjs): a visitor sees the page
// before any script has run, and main.tsx takes it over.
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { App, preload } from './App';
import { drawAloneWith } from './drawn';
import { drawFor } from './router';
import { pages } from './pages';
import { loadStories, parameter } from './stories';

drawAloneWith((node) => renderToString(node));

/** The frames drawn ahead of time (/frame/<page>--<story>): each pattern's stories, which the showcase and the front
 *  page show as screens, and every story that takes a whole screen (layout: fullscreen), which a docs page shows in a
 *  frame of its own. */
export async function frames(): Promise<string[]> {
  const out: string[] = [];
  for (const page of pages) {
    if (!page.stories) continue;
    for (const entry of await loadStories(page.stories)) {
      if (page.section === 'Patterns' || parameter(entry, 'layout') === 'fullscreen') out.push(`/frame/${page.id}--${entry.slug}`);
    }
  }
  return [...new Set(out)];
}

export async function render(path: string): Promise<string> {
  const initial = await preload(path);
  drawFor(path);
  return renderToString(<React.StrictMode><App initial={initial} /></React.StrictMode>);
}
