'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { IconButton } from '../IconButton/IconButton';
import * as icons from '../../material/builtin';
import { en as words } from './labels';
import { useControllable } from '../../internal/controllable';

export interface MaskedValueProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The whole value: a card or account number, a phone number, an email address, a key. Only the characters kept
   *  are in the page until it's shown. */
  value: string;
  /** What the value is, as a noun ("Card number", "Phone", "API key"): screen readers hear "Card number ending in
   *  1208", and the Show button is named "Show Card number". */
  label: string;
  /** How many characters to keep at the end. Default: 4 ("•••• 1208"). 0 hides it all. */
  end?: number | undefined;
  /** How many characters to keep at the start, such as an email's first letter or a key's prefix. Default: 0. */
  start?: number | undefined;
  /** A Show button before it, for the person the value belongs to. Pressed, it shows the whole value; it hides again
   *  when they leave the page (another tab, the app in the background). Default: false. */
  revealable?: boolean | undefined;
  /** Whether the whole value shows (controlled). Use with onRevealedChange. */
  revealed?: boolean | undefined;
  /** Whether the whole value shows at first (uncontrolled), with revealable. Default: false. */
  defaultRevealed?: boolean | undefined;
  /** Called when the Show button is pressed, or the value hides because the page was left. */
  onRevealedChange?: ((revealed: boolean) => void) | undefined;
}

/* MaskedValue: a value shown with most of it replaced by a fixed run of bullets, keeping the ends that let its owner
   recognize it. The bullets are hidden from screen readers, which hear what it is and the end kept instead. With
   revealable, a Show button (aria-pressed) puts the whole value in the page, until the page is left. */
// module state: a fixed string, never changed.
const DOTS = '••••';

/** A value with most of it hidden behind bullets, keeping its ends ("•••• 1208"), read as "Card number ending in 1208"; optionally a Show button.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const MaskedValue = /* @__PURE__ */ component<HTMLSpanElement, MaskedValueProps>('MaskedValue', function MaskedValue(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, { value: 1, label: 1, end: 1, start: 1, revealable: 1, revealed: 1, defaultRevealed: 1, onRevealedChange: 1, className: 1 });
  const [revealed, setOwn, controlled] = useControllable(props.revealed, !!props.defaultRevealed, 'MaskedValue', 'revealed');
  const shown = !!props.revealable && !!revealed;
  const set = React.useRef<((v: boolean) => void) | null>(null);
  set.current = (v: boolean) => { if (!controlled) setOwn(v); if (props.onRevealedChange) props.onRevealedChange(v); };
  // Leaving the page hides it again, so a value shown for a moment isn't left on a screen someone walks away from.
  React.useEffect(() => {
    if (!shown) return;
    const hide = () => { if (document.visibilityState === 'hidden') set.current?.(false); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [shown]);
  const { masked, kept } = mask(props.value, props.start, props.end);
  const said = kept ? sds.labels.maskedEnding(props.label, kept) : sds.labels.maskedHidden(props.label);
  return (
    <span {...rest} ref={ref} className={cn('dk-masked-value', shown && 'dk-masked-value--revealed', props.className)} data-component="masked-value">
      {/* Show comes first, so it stays where it was as the value appears and a second press hides it again. After the
          value it moved as far as the value grew; the value's width isn't kept free while masked, as that would give
          the secret's length away. */}
      {props.revealable ? <IconButton className="dk-masked-value__toggle" icon={shown ? icons.VisibilityOff : icons.Visibility} label={sds.labels.showValue(props.label)} hideTitle
        size="sm" variant="ghost" aria-pressed={shown} onClick={() => set.current?.(!shown)} /> : null}
      {shown
        ? <span className="dk-masked-value__text">{props.value}</span>
        : <><span className="dk-masked-value__text" aria-hidden>{masked}</span><span className="dk-visually-hidden">{said}</span></>}
    </span>
  );
});

/** The value as shown while masked: the start kept, a fixed run of bullets (so it doesn't give away the length), and
 *  the end kept, counted in characters people see, not code units. Asking to keep more than half shows nothing but
 *  the bullets, since what's left wouldn't be hidden. */
export function maskValue(value: string, start = 0, end = 4): string {
  return mask(value, start, end).masked;
}

function mask(value: string, start?: number, end?: number): { masked: string; kept: string } {
  const chars = Array.from(String(value ?? ''));
  const whole = (n: number | undefined, d: number) => (typeof n === 'number' && isFinite(n) && n > 0 ? Math.floor(n) : n === 0 ? 0 : d);
  let s = whole(start, 0), e = whole(end, 4);
  if (s + e > chars.length / 2) { s = 0; e = 0; }
  const head = chars.slice(0, s).join(''), tail = e ? chars.slice(chars.length - e).join('') : '';
  return { masked: head + DOTS + (tail ? ' ' + tail : ''), kept: tail };
}
