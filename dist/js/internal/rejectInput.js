// src/internal/rejectInput.ts
import { announce } from "./announce.js";
function reject(text, reason, onInvalidInput, say, shown) {
  const t = text.trim();
  if (onInvalidInput) onInvalidInput(t, reason);
  const said = say(t);
  announce(said, { assertive: true });
  if (shown) shown(said);
}
export {
  reject
};
//# sourceMappingURL=rejectInput.js.map
