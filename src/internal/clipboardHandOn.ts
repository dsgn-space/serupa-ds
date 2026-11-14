'use client';
import * as React from 'react';

// With no text selected, Chrome before 125 sends Ctrl+C and Ctrl+V to the body, not to the focused element
// (Firefox and Safari send them to the focused element). While focus is inside `ref`, they're handed on to it, so
// its onCopy and onPaste run as in other browsers.
export function useClipboardHandOn(ref: React.RefObject<HTMLElement | null>): void {
  React.useEffect(() => {
    const hand = (e: ClipboardEvent) => {
      const t = ref.current;
      // Only an event sent to the body: one sent to another element is that element's.
      if (!t || e.target !== document.body || !t.contains(document.activeElement)) return;
      // The browser's own clipboard rides along (Firefox drops one given to new ClipboardEvent).
      const again = new ClipboardEvent(e.type, { bubbles: true, cancelable: true });
      Object.defineProperty(again, 'clipboardData', { value: e.clipboardData });
      if (!t.dispatchEvent(again)) e.preventDefault();
    };
    document.addEventListener('copy', hand); document.addEventListener('paste', hand);
    return () => { document.removeEventListener('copy', hand); document.removeEventListener('paste', hand); };
  }, [ref]);
}
