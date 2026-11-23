// src/internal/keyFocus.ts
import { lastInputKeyboard } from "./lastInput.js";
function markKeyFocus(rest) {
  const wrap = (k, on) => {
    const own = rest[k];
    rest[k] = ((e) => {
      if (own) own(e);
      e.currentTarget.toggleAttribute("data-key-focus", on());
    });
  };
  wrap("onFocus", lastInputKeyboard);
  wrap("onClick", lastInputKeyboard);
  wrap("onKeyDown", () => true);
  wrap("onBlur", () => false);
}
export {
  markKeyFocus
};
//# sourceMappingURL=keyFocus.js.map
