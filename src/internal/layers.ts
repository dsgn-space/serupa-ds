// The open modal dialogs (Dialog and Drawer, shown with showModal()), innermost last. While one is open the
// browser makes everything outside it inert: screen readers skip it and it can't be clicked. So what the whole
// page shares (the live regions, the Toaster) moves into the innermost open modal, and back when it closes.
const modals: HTMLElement[] = [];
const listeners = new Set<() => void>();

/** The innermost open modal, or null. */
export const topModal = (): HTMLElement | null => modals[modals.length - 1] || null;

/** Called when the innermost modal changes; returns a function that stops it. */
export function onModalChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Dialog and Drawer call this right after showModal(). */
export function modalOpened(el: HTMLElement): void {
  const at = modals.indexOf(el);
  if (at >= 0) modals.splice(at, 1);
  modals.push(el);
  listeners.forEach((l) => l());
}

/** …and this when it closes or unmounts. */
export function modalClosed(el: HTMLElement): void {
  const at = modals.indexOf(el);
  if (at < 0) return;
  modals.splice(at, 1);
  listeners.forEach((l) => l());
}
