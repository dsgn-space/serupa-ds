import * as React from 'react';
import { useLatest } from './cn';
import { isComposing } from './ime';
import type { OpenChangeReason } from './openChange';

/* The hover timing Tooltip and HoverCard share: show or hide after a delay, Escape while a show is waiting cancels it
   (GR88, GR89), and the timers and listeners go when the component unmounts. With mute, that Escape also keeps it
   shut until unmute (HoverCard: until the pointer or focus leaves the trigger and comes back).

   Interest invokers (174): the trigger points at the popup with interestfor, so where the browser has them, a long
   press on a touch screen shows it (Chrome on Android), as a hover does with a mouse. The browser's own showing and
   hiding are cancelled and onInterest runs, but only while the pointer isn't over the trigger and it doesn't have
   keyboard focus: those the component already handles, with its delay and Escape cancelling a waiting show. The
   component sets hoveredRef and focusedRef as they change. The component's set clears timerRef too. */
export function useHoverIntent(
  timerRef: React.RefObject<number | undefined>,
  set: (open: boolean, reason: OpenChangeReason) => void,
  shown: React.RefObject<boolean>,
  popup: React.RefObject<HTMLElement | null>,
  onInterest: () => void,
  mute = false,
) {
  const muted = React.useRef(false);
  const armed = React.useRef<((e: KeyboardEvent) => void) | null>(null);
  const hoveredRef = React.useRef(false), focusedRef = React.useRef(false);
  const apply = useLatest(set);
  const unarm = () => { if (armed.current) document.removeEventListener('keydown', armed.current, true); armed.current = null; };
  /** Stops a waiting show or hide. */
  const stay = () => window.clearTimeout(timerRef.current);
  /** Shows or hides after ms, unless something else happens first. */
  const later = (v: boolean, ms: number, reason: OpenChangeReason = 'hover') => {
    stay(); unarm();
    if (v && muted.current) return;
    timerRef.current = window.setTimeout(() => { unarm(); apply.current(v, reason); }, ms);
    if (!v || shown.current) return;
    const esc = (e: KeyboardEvent) => { if (e.key !== 'Escape' || isComposing(e)) return; stay(); unarm(); if (mute) muted.current = true; };
    armed.current = esc;
    document.addEventListener('keydown', esc, true);
  };
  const unmute = () => { muted.current = false; };
  React.useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    if (armed.current) document.removeEventListener('keydown', armed.current, true);
  }, [timerRef]);
  const interest = useLatest(() => { if (!hoveredRef.current && !focusedRef.current) onInterest(); });
  React.useEffect(() => {
    const el = popup.current;
    if (!el) return;
    const on = (e: Event) => { e.preventDefault(); interest.current(); };
    const lose = (e: Event) => { e.preventDefault(); };
    el.addEventListener('interest', on);
    el.addEventListener('loseinterest', lose);
    return () => { el.removeEventListener('interest', on); el.removeEventListener('loseinterest', lose); };
  }, [interest, popup]);
  return { stay, later, unmute, hoveredRef, focusedRef };
}
