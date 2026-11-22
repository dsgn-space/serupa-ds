import * as React from 'react';
import { useControllable } from './controllable';
import { useIsoLayoutEffect, useLatest } from './cn';
import { warnOnce } from './warn';
import { modalClosed, modalOpened, modalOpening } from './layers';
import { listenForInput } from './lastInput';
import { deepActive } from './root';
import type { OpenChangeDetails, OpenChangeReason } from './openChange';

export interface ModalDialogOptions {
  /** The component, for warnings. */
  name: 'Dialog' | 'Drawer';
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  initialFocus: React.RefObject<HTMLElement | null> | undefined;
  finalFocus: React.RefObject<HTMLElement | null> | undefined;
  unsaved: boolean | undefined;
  /** false: shown in place (show()), not in the top layer, and the page stays usable (a non-modal Drawer). */
  modal: boolean;
  /** The app's own handlers, which run first. */
  onCancel: React.ReactEventHandler<HTMLDialogElement> | undefined;
  onClose: React.ReactEventHandler<HTMLDialogElement> | undefined;
}

const show = (d: HTMLDialogElement, modal: boolean) => {
  if (!modal) { if (typeof d.show === 'function') d.show(); else d.setAttribute('open', ''); return; }
  modalOpening();
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  modalOpened(d);
};

/* The native <dialog> machine Dialog and Drawer share: open is the truth, shown with showModal (or show for a
   non-modal Drawer) and closed again; focus goes in (initialFocus, data-autofocus) and back out (finalFocus, else the
   opener); Escape and the browser closing it ask to close (onOpenChange(false)) rather than close; and unsaved puts
   "Discard changes?" (asking) between a request to close and onOpenChange(false). The component draws the <dialog>,
   with dialogRef, onCancel and onClose on it, and Discard while asking. */
export function useModalDialog(o: ModalDialogOptions) {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const back = React.useRef<HTMLElement | null>(null);
  const ask = useLatest(o.onOpenChange);
  const initial = useLatest(o.initialFocus);
  const final = useLatest(o.finalFocus);
  const isModal = useLatest(o.modal);
  const [openIn, setInner, controlled] = useControllable(o.open, !!o.defaultOpen, o.name, 'open');
  const open = !!openIn;
  const close = React.useCallback((reason: OpenChangeReason) => { if (!controlled) setInner(false); if (ask.current) ask.current(false, { reason }); }, [controlled, setInner, ask]);
  // unsaved: a request to close asks "Discard changes?" first, and remembers why it came.
  const unsavedRef = useLatest(o.unsaved);
  const [asking, setAsking] = React.useState<OpenChangeReason | null>(null);
  // The app closing it while the question shows takes the question away too, so it can't come back stale (GR96).
  if (!open && asking) setAsking(null);
  const request = (reason: OpenChangeReason) => { if (unsavedRef.current) setAsking(reason); else close(reason); };
  React.useEffect(() => {
    if (!open || !o.unsaved) return;
    const stay = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', stay);
    return () => window.removeEventListener('beforeunload', stay);
  }, [open, o.unsaved]);
  // Open on arrival: there from the first frame, so it doesn't fade or slide in; it closes, and opens again, with motion.
  const arrivedRef = React.useRef(open); if (!open) arrivedRef.current = false;

  // Back to finalFocus, else to the opener, if either is still on the page. A confirmation that deletes the row it
  // was opened from took its button away, and focus fell to <body>, the top of the page for a keyboard (L8E19).
  // Unmounting keeps it: StrictMode mounts it again, open, and it's still owed when that one closes.
  const giveBack = (go: boolean, keep?: boolean) => {
    if (!back.current) return;   // never opened, or already given back
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (go && b && b.isConnected && typeof b.focus === 'function') b.focus();
  };
  // Bumped when the browser closed it while open was true: open again, unless the parent said false.
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(listenForInput, []);   // a held Enter that opened it doesn't go on to press what focus lands on
  useIsoLayoutEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const modal = isModal.current;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive() as HTMLElement | null;   // kept when it opens again (inside a shadow root, not its host)
      // It renders where it's placed: inside a page <form>, its own form nests in that one (Enter reloads the page) and
      // Enter in its field submits the page's form, as with Popover.
      if (process.env.NODE_ENV !== 'production' && d.parentElement?.closest('form') && d.querySelector('form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])')) warnOnce('overlay-in-form', `${o.name}: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the ${o.name} after the form.`, o.name + ':overlay-in-form');
      // Non-modal: shown in place (not the top layer), so it isn't on the modal stack and the page stays usable.
      show(d, modal);
      // A child's autoFocus ran while the dialog was still hidden, and showModal() then focused the first focusable
      // (the ×). React doesn't write the autofocus attribute, so data-autofocus (or autofocus in plain HTML) marks it;
      // initialFocus, when it points inside, wins over both.
      const want = initial.current && initial.current.current;
      const own = want && d.contains(want) ? want : d.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
      if (own && typeof own.focus === 'function') own.focus();
    } else if (open) {
      // Already open: StrictMode ran the unmount cleanup (which took it off the modal stack) and mounts it again.
      if (modal) modalOpened(d);
    } else {
      // Non-modal, focus may have moved on to the page: it goes back only from inside the dialog.
      const inside = modal || d.contains(deepActive());
      if (d.open) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
      modalClosed(d);
      giveBack(inside);
    }
  }, [open, reopened]);
  // Closed while unmounting: give focus back too, unless it's non-modal and focus had moved on to the page (focus
  // that was inside it has fallen to <body> by now, the dialog gone from the page).
  React.useEffect(() => { const d = dialogRef.current; return () => { if (d) modalClosed(d); const a = deepActive(); giveBack(isModal.current || !a || a === document.body || !!d && d.contains(a), true); }; }, []);

  // Escape fires "cancel": ask instead of closing, so open stays the truth.
  // React passes a nested dialog's cancel and close up to this one, though the browser doesn't bubble them: only
  // this dialog's own count, or Escape in a Dialog or Drawer opened from inside it would close this one too.
  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => { if (o.onCancel) o.onCancel(e); if (e.target !== e.currentTarget) return; e.preventDefault(); request('escape'); };
  // The browser can close it on its own (dialog.close(), a form with method="dialog", an Escape it doesn't let us
  // cancel, such as Chromium's second Escape with no click in between): if open is still true, ask to close. A
  // parent that keeps open true gets it shown again, so open stays the truth.
  const openNow = useLatest(open);
  const onClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (o.onClose) o.onClose(e);
    if (e.target !== e.currentTarget) return;
    if (!e.currentTarget.open) modalClosed(e.currentTarget);
    if (!openNow.current || e.currentTarget.open) return;
    // unsaved: show it again now, so the question opens on top of it, and ask.
    if (unsavedRef.current) { show(e.currentTarget, isModal.current); setAsking('api'); return; }
    close('api');
    reopen((n) => n + 1);
  };
  return { dialogRef, open, close, request, asking, setAsking, arrivedRef, unsavedRef, onCancel, onClose };
}
