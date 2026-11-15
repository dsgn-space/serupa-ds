import * as React from 'react';
import { useIsoLayoutEffect } from './cn';

/* The system's close request (Android's Back gesture or button, and Escape pressed anywhere on the page) for a part
   that opens without being a modal <dialog> or a popover layer: the browser sends those their own, but not a panel
   shown in place, so Back left the page with it open. While `active`, a CloseWatcher (where the browser has one)
   takes the request, the newest open part first, and calls onClose. Elsewhere it does nothing.
   backOnly: an Escape pressed on the page isn't a request to close it (a side panel beside a usable page), only
   Back is. The browser sends both the same way, so an Escape seen just before is let pass and the watcher set again. */
type Watcher = { onclose: (() => void) | null; destroy(): void };

export function useCloseWatcher(active: boolean, onClose: () => void, backOnly = false): void {
  const call = React.useRef(onClose);
  // every render: the newest onClose, read when the request comes, without a new watcher for each render.
  useIsoLayoutEffect(() => { call.current = onClose; });
  React.useEffect(() => {
    if (!active) return;
    const W = Reflect.get(window, 'CloseWatcher') as (new () => Watcher) | undefined;
    if (!W) return;
    let watcher: Watcher | null = null, escape = false, live = true, timer = 0;
    const arm = () => {
      try { watcher = new W(); } catch { watcher = null; return; }
      watcher.onclose = () => {
        if (!escape) { call.current(); return; }
        escape = false;
        if (live) arm();
      };
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      escape = true; window.clearTimeout(timer);
      timer = window.setTimeout(() => { escape = false; });
    };
    if (backOnly) document.addEventListener('keydown', key, true);
    arm();
    return () => {
      live = false; window.clearTimeout(timer);
      if (backOnly) document.removeEventListener('keydown', key, true);
      if (watcher) { watcher.onclose = null; watcher.destroy(); }
    };
  }, [active, backOnly]);
}
