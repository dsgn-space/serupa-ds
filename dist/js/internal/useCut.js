// src/internal/useCut.ts
import * as React from "react";
import { useIsoLayoutEffect } from "./cn.js";
import { onFontsLoaded } from "./fontsLoaded.js";
var checks = /* @__PURE__ */ new Map();
var ro;
var fontsHeard = false;
function watch(l, check) {
  if (ro === void 0) ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver((entries) => entries.forEach((e) => checks.get(e.target)?.())) : null;
  if (!fontsHeard) {
    fontsHeard = true;
    onFontsLoaded(() => checks.forEach((check2) => check2()));
  }
  checks.set(l, check);
  if (ro) ro.observe(l);
  return () => {
    if (checks.get(l) === check) {
      checks.delete(l);
      if (ro) ro.unobserve(l);
    }
  };
}
function useCut(on, text, label) {
  const [cut, setCut] = React.useState(false);
  useIsoLayoutEffect(() => {
    const l = label();
    if (!on || !l) {
      setCut(false);
      return;
    }
    const check = () => setCut(l.scrollWidth > l.clientWidth);
    check();
    return watch(l, check);
  }, [on, text]);
  return cut;
}
export {
  useCut
};
//# sourceMappingURL=useCut.js.map
