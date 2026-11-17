// src/internal/useScrolls.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
function useScrolls(target, onMeasure) {
  const [scrolls, setScrolls] = React.useState(false);
  const measured = React.useRef(onMeasure);
  useIsoLayoutEffect(() => {
    measured.current = onMeasure;
  });
  useIsoLayoutEffect(() => {
    const el = target && "current" in target ? target.current : target;
    if (!el) return;
    const check = () => {
      setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
      measured.current?.();
    };
    if (typeof ResizeObserver === "undefined") {
      check();
      return () => setScrolls(false);
    }
    const ro = new ResizeObserver(check);
    const watch = () => {
      ro.disconnect();
      ro.observe(el);
      for (const c of Array.from(el.children)) ro.observe(c);
      check();
    };
    const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(watch);
    if (mo) mo.observe(el, { childList: true });
    watch();
    return () => {
      ro.disconnect();
      if (mo) mo.disconnect();
      setScrolls(false);
    };
  }, [target]);
  return scrolls;
}
export {
  useScrolls
};
//# sourceMappingURL=useScrolls.js.map
