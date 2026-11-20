// Draws a page of the site to HTML, outside a browser, for its file (tools/site/prerender.mjs): a visitor sees the page
// before any script has run, and main.tsx takes it over.
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { App, preload } from './App';
import { drawAloneWith } from './drawn';
import { drawFor } from './router';

drawAloneWith((node) => renderToString(node));

export async function render(path: string): Promise<string> {
  const initial = await preload(path);
  drawFor(path);
  return renderToString(<React.StrictMode><App initial={initial} /></React.StrictMode>);
}
