'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { warnOnce } from '../../internal/warn';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { en as words } from './labels';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { modalClosed, modalOpened, modalOpening, wasDismissal } from '../../internal/layers';
import { listenForInput } from '../../internal/lastInput';
import { deepActive } from '../../internal/root';
import * as icons from '../../material/builtin';
import { useScrolls } from '../../internal/useScrolls';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import type { OpenChangeDetails, OpenChangeReason } from '../../internal/openChange';

export interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open'> {
  /** Whether it's open. Controlled: close it yourself in onOpenChange. */
  open?: boolean | undefined;
  /** Open at first, then it closes itself (uncontrolled), for one shown on arrival. Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called with false when people ask to close it, and why: { reason: 'escape' | 'close' (the ×) | 'outside' (the backdrop) | 'api' (the browser closed it) }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The heading, which also names the dialog. */
  title?: React.ReactNode | undefined;
  /** A muted line under the title, read when the dialog opens. */
  description?: React.ReactNode | undefined;
  /** Buttons at the bottom end: the main action last. */
  footer?: React.ReactNode | undefined;
  /** 'sm' 384px, 'md' 512px (default) or 'lg' 672px wide, at most the screen less 16px each side. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** An alert dialog (role="alertdialog") for a confirmation that needs an answer: no close button, and the backdrop doesn't close it. Escape still does. */
  alert?: boolean | undefined;
  /** Shows the × in the corner. Default: true (false for alert). */
  closeButton?: boolean | undefined;
  /** The × button's name. Default: 'Close'. */
  closeLabel?: string | undefined;
  /** Whether a click on the backdrop closes it. Default: true (false for alert). */
  closeOnBackdrop?: boolean | undefined;
  /** Fills the screen: true always, 'mobile' under 640px wide (a long form on a phone). Default: false. */
  fullScreen?: boolean | 'mobile' | undefined;
  /** The element that takes focus when it opens, instead of the first that can (the ×) or one marked data-autofocus: the safe choice in a confirmation (Cancel), or the field people came to fill. */
  initialFocus?: React.RefObject<HTMLElement | null> | undefined;
  /** Where focus goes when it closes, instead of back to what opened it: the next row after deleting one, whose own button is gone. Used when it's on the page then; otherwise focus goes back to the opener. */
  finalFocus?: React.RefObject<HTMLElement | null> | undefined;
  /** There are changes that would be lost: Escape, the ×, the backdrop or the browser closing it first ask "Discard changes?" (an alert dialog, Keep editing focused), and onOpenChange(false) comes only after Discard. Leaving the page asks too (beforeunload). Your own Cancel button closes it directly, so ask there yourself if it should. Default: false. */
  unsaved?: boolean | undefined;
}

/* Dialog: a modal on the native <dialog> (showModal), so the browser keeps focus inside, makes the page behind
   inert, and puts it in the top layer. title names it, description describes it. Escape, the × and a click on
   the backdrop ask to close (onOpenChange(false)); focus goes back to where it was. The page doesn't scroll
   behind it. alert makes a role="alertdialog" for confirmations. fullScreen fills the
   screen, always or ('mobile') under 640px. unsaved puts a "Discard changes?" question between a request to
   close and onOpenChange(false). */
const OWN = { open: 1, defaultOpen: 1, onOpenChange: 1, title: 1, description: 1, footer: 1, size: 1, alert: 1, closeButton: 1, closeLabel: 1, closeOnBackdrop: 1, fullScreen: 1, initialFocus: 1, finalFocus: 1, unsaved: 1, className: 1, children: 1 } as const;

/** A modal dialog on the native <dialog>: a title, content and actions, over a dimmed page. */
export const Dialog = /* @__PURE__ */ component<HTMLDialogElement, DialogProps>('Dialog', function Dialog(props, ref) {
  const nameRef = useNameCheck('Dialog', NAME_HOW.title);   // warns when it has no accessible name
  const sds = useSettings();
  const rest = omit(props, OWN);
  const base = domId('dk-dlg', React.useId());
  const el = React.useRef<HTMLDialogElement | null>(null);
  const back = React.useRef<HTMLElement | null>(null);
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  const alert = !!props.alert;
  const showClose = props.closeButton != null ? props.closeButton : !alert;
  const backdrop = props.closeOnBackdrop != null ? props.closeOnBackdrop : !alert;
  const ask = React.useRef(props.onOpenChange); ask.current = props.onOpenChange;
  const initial = React.useRef(props.initialFocus); initial.current = props.initialFocus;
  const final = React.useRef(props.finalFocus); final.current = props.finalFocus;
  // Back to finalFocus, else to the opener, if either is still on the page. A confirmation that deletes the row it
  // was opened from took its button away, and focus fell to <body>, the top of the page for a keyboard (L8E19).
  // Unmounting keeps it: StrictMode mounts it again, open, and it's still owed when that one closes.
  const giveBack = (keep?: boolean) => {
    if (!back.current) return;   // never opened, or already given back
    const f = final.current && final.current.current, b = f && f.isConnected ? f : back.current;
    if (!keep) back.current = null;
    if (b && b.isConnected && typeof b.focus === 'function') b.focus();
  };
  const [inner, setInner] = React.useState(!!props.defaultOpen);
  const controlled = props.open !== undefined;
  const open = controlled ? !!props.open : inner;
  const close = React.useCallback((reason: OpenChangeReason) => { if (!controlled) setInner(false); if (ask.current) ask.current(false, { reason }); }, [controlled]);
  // unsaved: a request to close asks "Discard changes?" first, and remembers why it came.
  const unsaved = React.useRef(props.unsaved); unsaved.current = props.unsaved;
  const [asking, setAsking] = React.useState<OpenChangeReason | null>(null);
  // The app closing it while the question shows takes the question away too, so it can't come back stale (GR96).
  if (!open && asking) setAsking(null);
  const request = (reason: OpenChangeReason) => { if (unsaved.current) setAsking(reason); else close(reason); };
  React.useEffect(() => {
    if (!open || !props.unsaved) return;
    const stay = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', stay);
    return () => window.removeEventListener('beforeunload', stay);
  }, [open, props.unsaved]);
  const has = (n: React.ReactNode) => n != null && n !== false && n !== '';
  // Open on arrival: there from the first frame, so it doesn't fade in; it closes, and opens again, with motion.
  const arrived = React.useRef(open); if (!open) arrived.current = false;

  // Bumped when the browser closed it while open was true: open again, unless the parent said false.
  const [reopened, reopen] = React.useState(0);
  useIsoLayoutEffect(listenForInput, []);   // a held Enter that opened it doesn't go on to press what focus lands on
  useIsoLayoutEffect(() => {
    const d = el.current;
    if (!d) return;
    if (open && !d.open) {
      if (!back.current) back.current = deepActive() as HTMLElement | null;   // kept when it opens again (inside a shadow root, not its host)
      // It renders where it's placed: inside a page <form>, its own form nests in that one (Enter reloads the page) and
      // Enter in its field submits the page's form, as with Popover.
      if (process.env.NODE_ENV !== 'production' && d.parentElement?.closest('form') && d.querySelector('form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])')) warnOnce('overlay-in-form', "Dialog: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Dialog after the form.", 'Dialog:overlay-in-form');
      modalOpening();
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
      modalOpened(d);
      // A child's autoFocus ran while the dialog was still hidden, and showModal() then focused the first focusable
      // (the ×). React doesn't write the autofocus attribute, so data-autofocus (or autofocus in plain HTML) marks it;
      // initialFocus, when it points inside, wins over both.
      const want = initial.current && initial.current.current;
      const own = want && d.contains(want) ? want : d.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
      if (own && typeof own.focus === 'function') own.focus();
    } else if (open) {
      // Already open: StrictMode ran the unmount cleanup (which took it off the modal stack) and mounts it again.
      modalOpened(d);
    } else {
      if (d.open) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
      modalClosed(d);
      giveBack();
    }
  }, [open, reopened]);
  // Closed while unmounting: give focus back too.
  React.useEffect(() => { const d = el.current; return () => { if (d) modalClosed(d); giveBack(true); }; }, []);

  // Escape fires "cancel": ask instead of closing, so open stays the truth.
  // React passes a nested dialog's cancel and close up to this one, though the browser doesn't bubble them: only
  // this dialog's own count, or Escape in a Dialog or Drawer opened from inside it would close this one too.
  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => { if (rest.onCancel) rest.onCancel(e); if (e.target !== e.currentTarget) return; e.preventDefault(); request('escape'); };
  // The browser can close it on its own (dialog.close(), a form with method="dialog", an Escape it doesn't let us
  // cancel, such as Chromium's second Escape with no click in between): if open is still true, ask to close. A
  // parent that keeps open true gets it shown again, so open stays the truth.
  const openNow = React.useRef(open); openNow.current = open;
  const onClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (rest.onClose) rest.onClose(e);
    if (e.target !== e.currentTarget) return;
    if (!e.currentTarget.open) modalClosed(e.currentTarget);
    if (!openNow.current || e.currentTarget.open) return;
    // unsaved: show it again now, so the question opens on top of it, and ask.
    if (unsaved.current) { const d = e.currentTarget; modalOpening(); if (typeof d.showModal === 'function') d.showModal(); modalOpened(d); setAsking('api'); return; }
    close('api');
    reopen((n) => n + 1);
  };
  // A click that lands on the <dialog> itself (outside the panel) is on the backdrop.
  // A press that starts on the panel (selecting text, say) and ends on the backdrop clicks the <dialog> too: only a
  // press that starts and ends on the backdrop counts.
  const downOnBackdrop = React.useRef(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDialogElement>) => { if (rest.onPointerDown) rest.onPointerDown(e); downOnBackdrop.current = e.target === e.currentTarget && !wasDismissal(e.nativeEvent); };
  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => { if (rest.onClick) rest.onClick(e); if (backdrop && downOnBackdrop.current && e.target === e.currentTarget && !wasDismissal(e.nativeEvent)) request('outside'); downOnBackdrop.current = false; };
  // A body taller than the panel takes Tab focus, so it can be scrolled from the keyboard when nothing in it is
  // focusable (only Chromium scrolls it with focus on the ×). It's a region named like the dialog, as Table's frame is.
  const [body, setBody] = React.useState<HTMLDivElement | null>(null);
  const scrolls = useScrolls(body);
  const named = rest['aria-labelledby'] || (has(props.title) ? base + '-title' : undefined);
  const region = !scrolls ? {} : named ? { tabIndex: 0, role: 'region', 'aria-labelledby': named }
    : rest['aria-label'] ? { tabIndex: 0, role: 'region', 'aria-label': rest['aria-label'] } : { tabIndex: 0 };
  const mergedRef = useMergedRef(ref, (n) => { el.current = n; nameRef(n); });
  return (
    <dialog {...rest} ref={mergedRef}
      role={alert ? 'alertdialog' : undefined} aria-modal="true"
      aria-labelledby={rest['aria-labelledby'] || (has(props.title) ? base + '-title' : undefined)}
      aria-describedby={rest['aria-describedby'] || (has(props.description) ? base + '-desc' : undefined)}
      className={cn('dk-dialog', 'dk-dialog--' + size, props.fullScreen === true && 'dk-dialog--full', props.fullScreen === 'mobile' && 'dk-dialog--full-mobile', props.className)} data-component="dialog" data-size={size} data-state={open ? 'open' : 'closed'} data-instant={arrived.current ? '' : undefined}
      onCancel={onCancel} onClose={onClose} onPointerDown={onPointerDown} onClick={onClick}>
      <div className="dk-dialog__panel">
        {has(props.title) || has(props.description) || showClose ? (
          <div className="dk-dialog__header">
            <div className="dk-dialog__heading">
              {has(props.title) ? <h2 className="dk-dialog__title" id={base + '-title'}>{props.title}</h2> : null}
              {has(props.description) ? <p className="dk-dialog__description" id={base + '-desc'}>{props.description}</p> : null}
            </div>
            {showClose ? <IconButton className="dk-dialog__close" icon={icons.Close} label={props.closeLabel || sds.labels.close} size="sm" hideTitle onClick={() => request('close')} /> : null}
          </div>
        ) : null}
        {has(props.children) ? <div {...region} ref={setBody} className="dk-dialog__body">{props.children}</div> : null}
        {has(props.footer) ? <div className="dk-dialog__footer">{props.footer}</div> : null}
      </div>
      {props.unsaved || asking ? <Discard open={!!asking && open} onKeep={() => setAsking(null)} onDiscard={() => { const why = asking || 'close'; setAsking(null); close(why); }} /> : null}
    </dialog>
  );
});

// The "Discard changes?" question an unsaved Dialog (or Drawer) asks before it closes: Keep editing (focused, the
// safe choice) or Discard. Escape keeps editing. Not in the package's exports (index.ts).
export function Discard(props: { open: boolean; onKeep: () => void; onDiscard: () => void }) {
  const sds = useSettings(words);
  const keep = React.useRef<HTMLButtonElement | null>(null);
  return (
    <Dialog alert size="sm" open={props.open} onOpenChange={props.onKeep} title={sds.labels.discardTitle} description={sds.labels.discardDescription} initialFocus={keep}
      footer={[<Button key="keep" ref={keep} variant="secondary" onClick={props.onKeep}>{sds.labels.keepEditing}</Button>,
        <Button key="discard" destructive onClick={props.onDiscard}>{sds.labels.discard}</Button>]} />
  );
}

/* useUnsavedChanges: Dialog's "Discard changes?" question for a form or a page with changes that would be lost (13).
   While unsaved, leaving the page (closing the tab, reloading, a link to another site) asks the browser's own
   question, as an unsaved Dialog does. Moving away inside the app is the app's router: before it moves, it awaits
   confirm(), which is true at once when nothing is unsaved, and otherwise asks "Discard changes?" (Keep editing
   focused) and is true on Discard. Render dialog somewhere in the form's tree. A newer confirm() answers the one
   before with false, saving while it asks answers it with true, and unmounting with false. */
/** Asks "Discard changes?" before a form or page with unsaved changes is left: the browser asks on leaving the page, and `await confirm()` before moving away inside the app. Render `dialog`. */
export function useUnsavedChanges(unsaved: boolean): { confirm: () => Promise<boolean>; dialog: React.ReactElement | null } {
  const [asking, setAsking] = React.useState(false);
  const settle = React.useRef<((ok: boolean) => void) | null>(null);
  const now = React.useRef(unsaved);
  useIsoLayoutEffect(() => { now.current = unsaved; }, [unsaved]);
  const answer = React.useCallback((ok: boolean) => { const s = settle.current; settle.current = null; setAsking(false); if (s) s(ok); }, []);
  React.useEffect(() => {
    if (!unsaved) { if (settle.current) answer(true); return; }   // saved while it asked: nothing to lose
    const stay = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', stay);
    return () => window.removeEventListener('beforeunload', stay);
  }, [unsaved, answer]);
  React.useEffect(() => () => { const s = settle.current; settle.current = null; if (s) s(false); }, []);
  const confirm = React.useCallback(() => {
    if (!now.current) return Promise.resolve(true);
    if (settle.current) settle.current(false);
    setAsking(true);
    return new Promise<boolean>((ok) => { settle.current = ok; });
  }, []);
  return { confirm, dialog: unsaved || asking ? <Discard open={asking} onKeep={() => answer(false)} onDiscard={() => answer(true)} /> : null };
}
