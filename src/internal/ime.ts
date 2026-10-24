// Typing with an input method (Japanese, Chinese, Korean): Enter confirms the composed text and Escape cancels it, and
// Safari still sends those keydowns (isComposing true; keyCode 229 in older engines). Key handlers ignore them, so
// they don't pick an option, clear a field, close a layer or read half-typed text.

/** Whether a keydown (React or DOM) belongs to an input method's composition. */
export function isComposing(e: { nativeEvent?: Event; isComposing?: boolean; keyCode?: number }): boolean {
  const n = (e.nativeEvent || e) as KeyboardEvent;
  return !!n.isComposing || n.keyCode === 229;
}
