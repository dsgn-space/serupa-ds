'use client';
import * as React from 'react';
import { deepActive } from './root';
import { announce } from './announce';
import { useSettings } from './provider';
import { feedbackHold } from './timing';
import { en as words } from '../components/CopyButton/labels';

// The clipboard API needs a secure page and focus; the old execCommand route covers the rest.
export async function writeText(text: string, at: Element): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch (e) { if (!fallback(text, at)) throw e; return; }
  }
  if (!fallback(text, at)) throw new Error("Copying isn't available here.");
}
// A value that's fetched goes to the clipboard as a promise, written within the press: Safari refuses a write once the
// press's user activation has run out, as it may have by the time a fetch ends. Without ClipboardItem (or if the
// browser turns the promise down), it's written once it's there, as before.
export function writeTextLater(text: Promise<string>, at: Element): Promise<string> {
  const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  const after = () => text.then((t) => writeText(t, at).then(() => t));
  if (typeof ClipboardItem === 'undefined' || !clip || !clip.write) return after();
  const blob = text.then((t) => new Blob([t], { type: 'text/plain' }));
  blob.catch(() => {});   // a value that fails is reported through the write below, not again as unhandled
  let item: ClipboardItem;
  try { item = new ClipboardItem({ 'text/plain': blob }); } catch { return after(); }
  return clip.write([item]).then(() => text, after);
}
// The text goes in the pressed control's modal <dialog> when it's in one: the page behind a modal is inert, and a
// textarea there can't be selected, so nothing was copied while the button said "Copied" (L8E96).
function fallback(text: string, at: Element): boolean {
  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.insetInlineStart = '-9999px';
  const back = deepActive() as HTMLElement | null;   // read through shadow roots: inside one, the button, not the host (GR95)
  (at.closest('dialog') || document.body).appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  if (back && back.focus) back.focus();
  return ok;
}

export interface CopyToClipboardOptions {
  /** What it announces once it has copied. Default: "Copied" (labels.copied). */
  copiedLabel?: string | undefined;
  /** Says "Copied", or labels.copyFailed when the browser refuses, to screen readers. Turn it off when your own UI
   *  says so in a live region already, such as a toast. Default: true. */
  announce?: boolean | undefined;
  /** How long `copied` stays true, in ms. Default: 2000. */
  timeout?: number | undefined;
}
export interface CopyToClipboard {
  /** Copies the text, or what a function returns (or a promise of it, written within the press so Safari takes it).
   *  Call it from the press itself, with nothing awaited first. Resolves true once it's on the clipboard, false when
   *  the browser refused. */
  copy: (value: string | (() => string | Promise<string>)) => Promise<boolean>;
  /** True for `timeout` ms after a copy worked: show "Copied" or a check while it is. */
  copied: boolean;
  /** What the last copy that failed threw, until the next copy. */
  error: unknown;
}

/** Copies text the way CopyButton does, for a control that isn't a CopyButton: a "Copy link" menu item, a table
 *  row's action, a keyboard shortcut. It falls back to the old route where the clipboard API is refused, works
 *  inside a modal Dialog, and says "Copied" (or why it couldn't) to screen readers. For a plain button, use
 *  CopyButton. */
export function useCopyToClipboard(options?: CopyToClipboardOptions): CopyToClipboard {
  const sds = useSettings(words);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<unknown>(undefined);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const { copiedLabel, announce: speak, timeout } = options || {};
  const { copied: copiedWord, copyFailed } = sds.labels;
  const copy = React.useCallback(async (value: string | (() => string | Promise<string>)) => {
    const say = speak !== false;
    const at = deepActive() || (typeof document !== 'undefined' ? document.body : null);
    try {
      // Nothing awaited before the write starts, so it's still inside the press.
      const got = typeof value === 'function' ? value() : value;
      if (!at) throw new Error("Copying isn't available here.");
      if (typeof got === 'string') await writeText(got, at); else await writeTextLater(Promise.resolve(got), at);
      setError(undefined);
      setCopied(true);
      if (say) announce(copiedLabel || copiedWord);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeout ?? feedbackHold);
      return true;
    } catch (err) {
      // The last copy's "Copied" may still show: take it away, so the control doesn't say this one worked.
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
      setCopied(false);
      setError(err);
      if (say) announce(copyFailed, { assertive: true });
      return false;
    }
  }, [speak, copiedLabel, timeout, copiedWord, copyFailed]);
  return { copy, copied, error };
}
