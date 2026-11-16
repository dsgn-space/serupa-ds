import * as React from 'react';
import { useIsoLayoutEffect } from './cn';
import { useControllable } from './controllable';

/** Why an overlay asks to open or close, passed to onOpenChange as { reason }.
    'trigger': its trigger was pressed. 'escape': Escape was pressed. 'outside': a press outside it.
    'blur': focus moved somewhere else. 'close': its close button, or a close() it handed you, such as a Done button's.
    'api': the browser closed it itself, as dialog.close() or a form with method="dialog" do.
    'select': an item in it was chosen, as a MenuItem is.
    'hover': the pointer came onto its element or left it. 'focus': its element took focus from the keyboard.
    'swipe': a touch drag flung it back toward its edge, as on a Drawer. */
export type OpenChangeReason = 'trigger' | 'escape' | 'outside' | 'blur' | 'close' | 'api' | 'select' | 'hover' | 'focus' | 'swipe';

/** The second argument of onOpenChange. */
export interface OpenChangeDetails { reason: OpenChangeReason }

/** An overlay's open state, as every one takes it: `open` (controlled), `defaultOpen` (uncontrolled) and
    `onOpenChange(open, { reason })`. Returns whether it shows (never while `blocked`, such as disabled or read-only)
    and the setter its parts call with the reason. onOpenChange hears only a real change: closing what is closed says
    nothing. */
export function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange: ((open: boolean, details: OpenChangeDetails) => void) | undefined, component: string, blocked = false): [boolean, (open: boolean, reason: OpenChangeReason) => void] {
  const [held, setOwn, controlled] = useControllable(open, !!defaultOpen, component, 'open');
  const shown = !blocked && !!held;
  const now = React.useRef(shown);
  const told = React.useRef(onOpenChange);
  // After each render that changes them, before the person can press anything: what shows, and the newest callback.
  useIsoLayoutEffect(() => { now.current = shown; told.current = onOpenChange; }, [shown, onOpenChange]);
  const set = React.useCallback((v: boolean, reason: OpenChangeReason) => {
    if (!controlled) setOwn(v);
    if (v === now.current) return;
    now.current = v;
    if (told.current) told.current(v, { reason });
  }, [controlled, setOwn]);
  return [shown, set];
}
