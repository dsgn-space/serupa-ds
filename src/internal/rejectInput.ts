import { announce } from './announce';

/* DatePicker, DateRangePicker, TimePicker and NumberInput put back typed text they don't take. This tells the app why
   (onInvalidInput), says so to screen readers, who would otherwise hear the old value come back without a word, and
   hands the words to shown, which the component puts under the field until the text changes, so people who see the
   value jump back also read why (GR232). */
export function reject<R extends string>(text: string, reason: R, onInvalidInput: ((text: string, reason: R) => void) | undefined, say: (text: string) => string, shown?: (said: string) => void): void {
  const t = text.trim();
  if (onInvalidInput) onInvalidInput(t, reason);
  const said = say(t);
  announce(said, { assertive: true });
  if (shown) shown(said);
}
