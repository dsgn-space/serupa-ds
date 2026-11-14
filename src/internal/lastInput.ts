// module state: whether the last input was a key rather than a pointer, which a layer reads as it opens or closes and
// an indicator as it moves (KW1). Only a browser sets it, from listeners on its own document added when the first
// component that asks mounts, so a server render always reads false and no request sees another's keys. pressed: what a
// pointer clicked last, until that task ends, as a label passes its click on to its control within it.
// downOn: what a key went down on, for a held Enter. Enter on a button opens a dialog and focus moves to its first
// button; held half a second, the key repeats there and presses it, the dialog closes, focus comes back, and the next
// repeat opens it again, 30 times a second (or submits the form a popover opened on). A press belongs to what it
// went down on, so a repeat of Enter that lands on anything else does nothing. Held on one button, it still repeats.
let keyed = false, listening = false, pressed: EventTarget | null = null, downOn: EventTarget | null = null;

/** Starts noting the last input, once for the page. Call it from a layout effect when the component mounts. */
export function listenForInput(): void {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('keydown', (e) => {
    keyed = true;
    if (!e.repeat) downOn = e.target;
    else if (e.key === 'Enter' && e.target !== downOn) e.preventDefault();
  }, true);
  document.addEventListener('pointerdown', () => { keyed = false; }, true);
  // A click with no presses (detail 0) came from a key or a screen reader, as Enter on a button does. Except where a
  // label passes a pointer's click on to its control: Safari sends that click with detail 0 too.
  document.addEventListener('click', (e) => {
    const p = pressed as Node | null;
    keyed = !e.detail && !(p && Array.from((e.target as HTMLInputElement).labels || []).some((l) => l.contains(p)));
    if (e.detail) { pressed = e.target; setTimeout(() => { pressed = null; }); }
  }, true);
}

/** Whether the last input was a key (or a click a key or screen reader made), not a pointer or a touch. */
export function lastInputKeyboard(): boolean { return keyed; }
