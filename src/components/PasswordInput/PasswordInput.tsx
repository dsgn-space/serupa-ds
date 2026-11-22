'use client';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { useControlSize } from '../../internal/controlSize';
import { announce } from '../../internal/announce';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { cn, domId, isInvalid, omit, oneOf, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { Icon } from '../Icon/Icon';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import { asIcon } from '../Icon/asIcon';
import { InputAction, type InputProps } from '../Input/Input';
import { named } from '../../internal/component';
import { useFieldControl } from '../../internal/field';
import { pressFocuses } from '../../internal/affix';
import { activeIn } from '../../internal/root';
import { useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'actions' | 'showCount' | 'prefix' | 'suffix' | 'endIcon'> {
  /** Shows the password as text (controlled). Use with onRevealedChange. */
  revealed?: boolean | undefined;
  /** Shows it as text at first (uncontrolled). Default: false. */
  defaultRevealed?: boolean | undefined;
  /** Called with the new state when the show/hide button is pressed. */
  onRevealedChange?: ((revealed: boolean) => void) | undefined;
  /** The show/hide button's name. Default: "Show password" (its aria-pressed says whether it's shown). */
  toggleLabel?: string | undefined;
  /** While Caps Lock is on and the field has focus, a caps-lock icon shows at the end of the field, and "Caps Lock is on" is read out once. Default: true. */
  capsLockHint?: boolean | undefined;
}

const SIZES = ['sm', 'md', 'lg'] as const;

// What the person does in the field that a late caret restore must not undo.
const STOP = ['keydown', 'pointerdown', 'input'] as const;

// The time since a press, for a click handler; out here, as the compiler can't tell toggle runs only on a click.
const msSince = (t: number) => performance.now() - t;

function PasswordInputRender({ ref, ...props }: PasswordInputProps & React.RefAttributes<HTMLInputElement>) {
  const nameRef = useNameCheck('PasswordInput', NAME_HOW.field);   // warns when it has no accessible name
  props = useFieldControl(props);   // the props a surrounding Field hands it, at any depth
  const sds = useSettings(words);
  const rest = omit(props, { size: 1, invalid: 1, startIcon: 1, className: 1, style: 1, revealed: 1, defaultRevealed: 1, onRevealedChange: 1, toggleLabel: 1, capsLockHint: 1 } as const);
  const size = oneOf(SIZES, useControlSize(props.size), 'md');
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  if (invalid) rest['aria-invalid'] = true;
  if (rest.autoComplete === undefined) rest.autoComplete = 'current-password';
  const [revealed, setOwn, controlled] = useControllable(props.revealed, !!props.defaultRevealed, 'PasswordInput', 'revealed');
  const shown = !!revealed;
  const left = asIcon(props.startIcon);
  // Caps Lock, read from the key events while the field has focus (there's no event for the key itself).
  const [caps, setCaps] = React.useState(false);
  const capsId = domId('srp-pw-caps', React.useId());
  const hint = props.capsLockHint !== false;
  const sense = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hint || typeof e.getModifierState !== 'function') return;
    const on = e.getModifierState('CapsLock');
    if (on !== caps) { setCaps(on); if (on) announce(sds.labels.capsLockOn); }
  };
  const onKeyDown = rest.onKeyDown, onKeyUp = rest.onKeyUp, onBlur = rest.onBlur;
  rest.onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { sense(e); if (onKeyDown) onKeyDown(e); };
  rest.onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => { sense(e); if (onKeyUp) onKeyUp(e); };
  rest.onBlur = (e: React.FocusEvent<HTMLInputElement>) => { setCaps(false); if (onBlur) onBlur(e); };
  if (caps) rest['aria-describedby'] = cn(rest['aria-describedby'], capsId);
  // Switching the type puts the caret at the start: keep where it was, so typing goes on where it stopped.
  const field = React.useRef<HTMLInputElement | null>(null);
  const caret = React.useRef<[number, number, 'forward' | 'backward' | 'none', number, number] | null>(null);
  const fieldRef = useMergedRef(ref, (n: HTMLInputElement | null) => { field.current = n; nameRef(n); });
  useIsoLayoutEffect(() => {
    const f = field.current, c = caret.current;
    caret.current = null;
    if (!f || !c) return;
    // Chrome moves the caret once it has applied the new type, after this effect: put it back then too. The new type
    // also scrolls the field back to its start, so a long password's caret goes out of view: the caret is kept where it
    // was in the view, its place in the text scaled to the new width (at the end, the field scrolls to the end) (GI4).
    const put = () => {
      if (f.selectionStart === null) return;
      f.setSelectionRange(c[0], c[1], c[2]);
      const at = (c[2] === 'backward' ? c[0] : c[1]) / Math.max(f.value.length, 1);
      f.scrollLeft = at * f.scrollWidth - (at * c[4] - c[3]);
    };
    put();
    // The frame can come late (WebKit's can wait past the next keystrokes), so it puts the caret back only while the
    // person hasn't typed, pressed or selected since: otherwise it would undo what they just did.
    const frame = requestAnimationFrame(put);
    const stop = () => { cancelAnimationFrame(frame); for (const t of STOP) f.removeEventListener(t, stop); };
    for (const t of STOP) f.addEventListener(t, stop);
    return stop;
  }, [shown]);
  // Read at the button's mousedown when there is one: WebKit collapses the field's selection to its end on the way to the
  // click, so a selection read there is already gone (BW1). A press that never became a click leaves a stale one: kept
  // only for a click within a second of it. The selection is also kept as it changes while the field has focus, and that
  // is what's read: WebKit can collapse a selection set by script (setSelectionRange) before the mousedown, unless it was
  // read when it changed.
  const pressed = React.useRef(0);
  const seen = React.useRef<[number, number, 'forward' | 'backward' | 'none'] | null>(null);
  React.useEffect(() => {
    const keep = () => {
      const f = field.current;
      if (f && activeIn(f) === f && f.selectionStart !== null && f.selectionEnd !== null) seen.current = [f.selectionStart, f.selectionEnd, f.selectionDirection || 'none'];
    };
    // Also on the field: WebKit sends a field's selectionchange to the field, and inside a shadow root it never
    // reaches the document (the event isn't composed).
    const f = field.current;
    document.addEventListener('selectionchange', keep, true);
    if (f) f.addEventListener('selectionchange', keep);
    return () => { document.removeEventListener('selectionchange', keep, true); if (f) f.removeEventListener('selectionchange', keep); };
  }, []);
  const capture = () => {
    const f = field.current;
    if (!f || f.selectionStart === null || f.selectionEnd === null) return;
    const s = seen.current && activeIn(f) === f ? seen.current : [f.selectionStart, f.selectionEnd, f.selectionDirection || 'none'] as const;
    caret.current = [s[0], s[1], s[2], f.scrollLeft, f.scrollWidth];
  };
  const toggle = () => {
    if (!caret.current || msSince(pressed.current) > 1000) capture();
    if (!controlled) setOwn(!shown);
    if (props.onRevealedChange) props.onRevealedChange(!shown);
  };
  return (
    <span className={cn('srp-input srp-password-input', 'srp-input--size-' + size, invalid && 'srp-input--invalid', rest.disabled && 'srp-input--disabled', rest.readOnly && 'srp-input--readonly', props.className)}
      style={props.style} data-component="password-input" data-size={size} onMouseDown={(e) => pressFocuses(field)(e)}>
      {left != null && left !== false ? <span className="srp-input__icon srp-input__icon--start" aria-hidden>{left}</span> : null}
      <input {...rest} ref={fieldRef} type={shown ? 'text' : 'password'} className="srp-input__field" spellCheck={false} autoCapitalize="off" autoCorrect="off" />
      {caps ? (
        // An icon, with the words for screen readers (they describe the field) and as a tooltip for the pointer.
        <span className="srp-password-input__caps" id={capsId} title={sds.labels.capsLockOn}>
          <Icon icon={icons.KeyboardCapslock} /><VisuallyHidden>{sds.labels.capsLockOn}</VisuallyHidden>
        </span>
      ) : null}
      <span className="srp-input__actions">
        <InputAction className="srp-password-input__toggle" icon={shown ? icons.VisibilityOff : icons.Visibility} label={props.toggleLabel || sds.labels.showPassword} aria-pressed={shown}
          aria-controls={rest.id} disabled={!!rest.disabled} onClick={toggle} onMouseDown={(e) => { e.preventDefault(); capture(); pressed.current = performance.now(); }} />
      </span>
    </span>
  );
}

/* PasswordInput: an Input for passwords with a button at the end that shows and hides what was typed. It uses
   Input's box and tokens. autoComplete defaults to "current-password"; use "new-password" on sign-up forms.
   While Caps Lock is on, a caps-lock icon ("Caps Lock is on" to screen readers and as its tooltip) shows in the field and is read out (capsLockHint={false} turns it
   off). Pasting is never blocked, so password managers and pasted passwords work (WCAG 3.3.8).
   className and style go to the box; ref and every other prop to the <input>. */
/** A password field with a button that shows and hides what was typed. */
export const PasswordInput = /* @__PURE__ */ named('PasswordInput', PasswordInputRender);
