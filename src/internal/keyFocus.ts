import type * as React from 'react';
import { lastInputKeyboard } from './lastInput';

type Handlers = Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur' | 'onKeyDown' | 'onClick'>;

/** Marks a checkbox or radio data-key-focus while the keyboard has it (Tab in, an arrow to it, Space on it), for the focus
 *  ring beside :focus-visible. Chromium shows :focus-visible for a key pressed after a click; Firefox doesn't for Space
 *  on a clicked checkbox, and Safari doesn't for an arrow between radios, which left keyboard users there no ring.
 *  Wraps the handlers in `rest` (the caller's own still run first). The component calls listenForInput on mount. */
export function markKeyFocus(rest: Handlers): void {
  const wrap = (k: keyof Handlers, on: () => boolean) => {
    const own = rest[k] as ((e: React.SyntheticEvent<HTMLInputElement>) => void) | undefined;
    rest[k] = ((e: React.SyntheticEvent<HTMLInputElement>) => { if (own) own(e); e.currentTarget.toggleAttribute('data-key-focus', on()); });
  };
  wrap('onFocus', lastInputKeyboard);
  wrap('onClick', lastInputKeyboard);
  wrap('onKeyDown', () => true);
  wrap('onBlur', () => false);
}
