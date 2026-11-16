"use client";

// src/internal/clipboardHandOn.ts
import * as React from "react";
function useClipboardHandOn(ref) {
  React.useEffect(() => {
    const hand = (e) => {
      const t = ref.current;
      if (!t || e.target !== document.body || !t.contains(document.activeElement)) return;
      const again = new ClipboardEvent(e.type, { bubbles: true, cancelable: true });
      Object.defineProperty(again, "clipboardData", { value: e.clipboardData });
      if (!t.dispatchEvent(again)) e.preventDefault();
    };
    document.addEventListener("copy", hand);
    document.addEventListener("paste", hand);
    return () => {
      document.removeEventListener("copy", hand);
      document.removeEventListener("paste", hand);
    };
  }, [ref]);
}
export {
  useClipboardHandOn
};
//# sourceMappingURL=clipboardHandOn.js.map
