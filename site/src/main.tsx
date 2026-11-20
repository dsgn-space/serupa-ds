// The docs site's entry (npm run site): the system's own styles, then the page for the address.
import * as React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '../../tokens.css';
import '../../src/styles/base.css';
import '../../src/styles/index.css';
import '../../.storybook/docs.css';
import './site.css';
import { App, preload } from './App';
import { takeOver } from './drawn';
import { current } from './router';

// A tab opened before a new version went live asks for files the host no longer has (each version's are named by their
// content) once it moves to another page. It loads the address again, the new version's, rather than saying "Something
// went wrong", but only once in ten seconds, so a file that is really missing shows the error instead of reloading forever.
const RELOADED = 'serupa-site-reloaded';
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (Date.now() - Number(sessionStorage.getItem(RELOADED)) < 10000) return;
    sessionStorage.setItem(RELOADED, String(Date.now()));
  } catch { return; }
  event.preventDefault();
  window.location.reload();
});

// Each page's HTML already holds the page, drawn when the site was built (tools/site/prerender.mjs), so it shows before
// any script has run. React takes it over once the page's own content has loaded, rather than drawing it again.
const root = document.getElementById('root')!;
const app = (initial: Awaited<ReturnType<typeof preload>>) => <React.StrictMode><App initial={initial} /></React.StrictMode>;
if (root.hasChildNodes()) void preload(current()).then((initial) => { takeOver(true); hydrateRoot(root, app(initial)); });
else createRoot(root).render(app(null));
