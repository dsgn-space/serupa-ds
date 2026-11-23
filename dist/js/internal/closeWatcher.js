// src/internal/closeWatcher.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
function useCloseWatcher(active, onClose, backOnly = false) {
  const call = React.useRef(onClose);
  useIsoLayoutEffect(() => {
    call.current = onClose;
  });
  React.useEffect(() => {
    if (!active) return;
    const W = Reflect.get(window, "CloseWatcher");
    if (!W) return;
    let watcher = null, escape = false, live = true, timer = 0;
    const arm = () => {
      try {
        watcher = new W();
      } catch {
        watcher = null;
        return;
      }
      watcher.onclose = () => {
        if (!escape) {
          call.current();
          return;
        }
        escape = false;
        if (live) arm();
      };
    };
    const key = (e) => {
      if (e.key !== "Escape") return;
      escape = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        escape = false;
      });
    };
    if (backOnly) document.addEventListener("keydown", key, true);
    arm();
    return () => {
      live = false;
      window.clearTimeout(timer);
      if (backOnly) document.removeEventListener("keydown", key, true);
      if (watcher) {
        watcher.onclose = null;
        watcher.destroy();
      }
    };
  }, [active, backOnly]);
}
export {
  useCloseWatcher
};
//# sourceMappingURL=closeWatcher.js.map
