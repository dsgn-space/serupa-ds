// A page drawn ahead of time (tools/site/prerender.mjs) and taken over in the browser (main.tsx): what the two sides
// share about it.
import * as React from 'react';

let ahead = false;
/** Whether the render under way takes over a page drawn ahead of time: main.tsx says so, and App says when it's done. */
export const takeOver = (on: boolean) => { ahead = on; };
export const takingOver = () => ahead;

let alone: ((node: React.ReactNode) => string) | null = null;
/** How to draw one part of a page on its own, as HTML: server.tsx gives it, the browser never has it. */
export const drawAloneWith = (fn: (node: React.ReactNode) => string) => { alone = fn; };
/** A part of the page as HTML on its own, or '' where it can't be drawn (in the browser, or when it throws). */
export function drawAlone(node: React.ReactNode): string {
  try { return alone?.(node) ?? ''; } catch { return ''; }
}

/** A story as the page first shows it. Drawn ahead of time (tools/site/prerender.mjs), it is its HTML on its own, so a
 *  story that throws (an error boundary's example) leaves its frame empty rather than stopping the page. Taking the
 *  page over, the browser keeps that HTML for the first render, then draws the story itself in its place: the page
 *  doesn't move, and the story's own state starts in the browser. */
export function Drawn({ children }: { children: React.ReactNode }) {
  const [live, setLive] = React.useState(() => typeof window !== 'undefined' && !takingOver());
  React.useEffect(() => setLive(true), []);
  if (live) return children;
  return <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: typeof window === 'undefined' ? drawAlone(children) : '' }} />;
}

