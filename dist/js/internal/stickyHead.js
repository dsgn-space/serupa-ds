// src/internal/stickyHead.ts
import * as React from "react";
function useStickyHead(frame, sticky, headSelector, cssVar) {
  React.useEffect(() => {
    const el = frame.current, head = el && el.querySelector(headSelector);
    if (!el || !sticky || !head || typeof ResizeObserver === "undefined") return;
    const set = () => el.style.setProperty(cssVar, head.getBoundingClientRect().height + "px");
    const ro = new ResizeObserver(set);
    ro.observe(head);
    set();
    let raf = 0;
    const onFocus = (e) => {
      const t = e.target;
      if (t === el || head.contains(t)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const covered = el.getBoundingClientRect().top + el.clientTop + head.getBoundingClientRect().height - t.getBoundingClientRect().top;
        if (covered > 0) el.scrollTop -= covered;
      });
    };
    el.addEventListener("focusin", onFocus);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("focusin", onFocus);
      el.style.removeProperty(cssVar);
    };
  }, [frame, sticky, headSelector, cssVar]);
}
export {
  useStickyHead
};
//# sourceMappingURL=stickyHead.js.map
