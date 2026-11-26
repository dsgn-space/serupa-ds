"use client";

// src/components/Link/NewTabNote.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useSettings } from "../../internal/provider.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import { en as words } from "./labels.js";
function NewTabNote() {
  const $ = _c(2);
  const t0 = useSettings(words);
  let t1;
  if ($[0] !== t0.labels.opensInNewTab) {
    t1 = /* @__PURE__ */ React.createElement(VisuallyHidden, null, " ", t0.labels.opensInNewTab);
    $[0] = t0.labels.opensInNewTab;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
export {
  NewTabNote
};
//# sourceMappingURL=NewTabNote.js.map
