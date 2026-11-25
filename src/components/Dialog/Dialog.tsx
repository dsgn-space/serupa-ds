'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { en as words } from './labels';
import { named } from '../../internal/component';
import { useModalDialog } from '../../internal/useModalDialog';
import { useSettings } from '../../internal/provider';
import { wasDismissal } from '../../internal/layers';
import * as icons from '../../material/builtin';
import { useScrolls } from '../../internal/useScrolls';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import type { OpenChangeDetails } from '../../internal/openChange';

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

function DialogRender({ ref, ...props }: DialogProps & React.RefAttributes<HTMLDialogElement>) {
  const nameRef = useNameCheck('Dialog', NAME_HOW.title);   // warns when it has no accessible name
  const sds = useSettings();
  const rest = omit(props, OWN);
  const base = domId('srp-dlg', React.useId());
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  const alert = !!props.alert;
  const showClose = props.closeButton != null ? props.closeButton : !alert;
  const backdrop = props.closeOnBackdrop != null ? props.closeOnBackdrop : !alert;
  // Open and close, focus in and back, Escape and the browser asking to close, and "Discard changes?" (useModalDialog).
  const { dialogRef, open, close, request, asking, setAsking, arrivedRef, onCancel, onClose } = useModalDialog({
    name: 'Dialog', open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange, initialFocus: props.initialFocus,
    finalFocus: props.finalFocus, unsaved: props.unsaved, modal: true, onCancel: rest.onCancel, onClose: rest.onClose,
  });
  const has = (n: React.ReactNode) => n != null && n !== false && n !== '';

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
  const mergedRef = useMergedRef(ref, (n) => { dialogRef.current = n; nameRef(n); });
  return (
    <dialog {...rest} ref={mergedRef}
      role={alert ? 'alertdialog' : undefined} aria-modal="true"
      aria-labelledby={rest['aria-labelledby'] || (has(props.title) ? base + '-title' : undefined)}
      aria-describedby={rest['aria-describedby'] || (has(props.description) ? base + '-desc' : undefined)}
      className={cn('srp-dialog', 'srp-dialog--' + size, props.fullScreen === true && 'srp-dialog--full', props.fullScreen === 'mobile' && 'srp-dialog--full-mobile', props.className)} data-component="dialog" data-size={size} data-state={open ? 'open' : 'closed'} data-instant={arrivedRef.current ? '' : undefined}
      onCancel={onCancel} onClose={onClose} onPointerDown={onPointerDown} onClick={onClick}>
      <div className="srp-dialog__panel">
        {has(props.title) || has(props.description) || showClose ? (
          <div className="srp-dialog__header">
            <div className="srp-dialog__heading">
              {has(props.title) ? <h2 className="srp-dialog__title" id={base + '-title'}>{props.title}</h2> : null}
              {has(props.description) ? <p className="srp-dialog__description" id={base + '-desc'}>{props.description}</p> : null}
            </div>
            {showClose ? <IconButton className="srp-dialog__close" icon={icons.Close} label={props.closeLabel || sds.labels.close} size="sm" hideTitle onClick={() => request('close')} /> : null}
          </div>
        ) : null}
        {has(props.children) ? <div {...region} ref={setBody} className="srp-dialog__body">{props.children}</div> : null}
        {has(props.footer) ? <div className="srp-dialog__footer">{props.footer}</div> : null}
      </div>
      {props.unsaved || asking ? <Discard open={!!asking && open} onKeep={() => setAsking(null)} onDiscard={() => { const why = asking || 'close'; setAsking(null); close(why); }} /> : null}
    </dialog>
  );
}

/** A modal dialog on the native <dialog>: a title, content and actions, over a dimmed page. */
export const Dialog = /* @__PURE__ */ named('Dialog', DialogRender);

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
