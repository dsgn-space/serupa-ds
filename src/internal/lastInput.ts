// module state: whether the last input was a key rather than a pointer, which a layer reads as it opens or closes and
// an indicator as it moves (KW1). Only a browser sets it, from listeners on its own document added when the first
// component that asks mounts, so a server render always reads false and no request sees another's keys.
let keyed = false, listening = false;
// What a pointer clicked last, until the task it was clicked in ends: a label passes its click on to its control within it.
let pressed: Node | null = null;

/** Starts noting the last input, once for the page. Call it from a layout effect when the component mounts. */
export function listenForInput(): void {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('keydown', () => { keyed = true; }, true);
  document.addEventListener('pointerdown', () => { keyed = false; }, true);
  // A click with no presses (detail 0) came from a key or a screen reader, as Enter on a button does. Except where a
  // label passes a pointer's click on to its control: Safari sends that click with detail 0 too.
  document.addEventListener('click', (e) => {
    const t = e.target, from = pressed;
    const passed = e.detail === 0 && from !== null && t instanceof HTMLInputElement && Array.from(t.labels ?? []).some((l) => l.contains(from));
    keyed = e.detail === 0 && !passed;
    if (e.detail > 0 && t instanceof Node) { pressed = t; setTimeout(() => { pressed = null; }); }
  }, true);
}

/** Whether the last input was a key (or a click a key or screen reader made), not a pointer or a touch. */
export function lastInputKeyboard(): boolean { return keyed; }
