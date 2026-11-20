// A page drawn ahead of time (tools/site/prerender.mjs) and taken over in the browser (main.tsx): what the two sides
// share about it.
import type * as React from 'react';

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
