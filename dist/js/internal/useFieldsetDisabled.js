// src/internal/useFieldsetDisabled.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
function useFieldsetDisabled(ref) {
  const [off, setOff] = React.useState(false);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fieldsets = [];
    for (let f = el.closest("fieldset"); f; f = f.parentElement && f.parentElement.closest("fieldset")) fieldsets.push(f);
    const check = () => setOff(fieldsets.some((f) => f.hasAttribute("disabled") && !f.querySelector(":scope > legend")?.contains(el)));
    check();
    if (!fieldsets.length || typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(check);
    for (const f of fieldsets) mo.observe(f, { attributes: true, attributeFilter: ["disabled"] });
    return () => mo.disconnect();
  }, [ref]);
  return off;
}
export {
  useFieldsetDisabled
};
//# sourceMappingURL=useFieldsetDisabled.js.map
