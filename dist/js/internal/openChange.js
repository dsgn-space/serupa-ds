// src/internal/openChange.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
import { useControllable } from "./controllable.js";
function useOpenState(open, defaultOpen, onOpenChange, component, blocked = false) {
  const [held, setOwn, controlled] = useControllable(open, !!defaultOpen, component, "open");
  const shown = !blocked && !!held;
  const now = React.useRef(shown);
  const told = React.useRef(onOpenChange);
  useIsoLayoutEffect(() => {
    now.current = shown;
    told.current = onOpenChange;
  }, [shown, onOpenChange]);
  const set = React.useCallback((v, reason) => {
    if (!controlled) setOwn(v);
    if (v === now.current) return;
    now.current = v;
    if (told.current) told.current(v, { reason });
  }, [controlled, setOwn]);
  return [shown, set];
}
export {
  useOpenState
};
//# sourceMappingURL=openChange.js.map
