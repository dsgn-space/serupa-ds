"use client";

// src/components/EmptyState/AnnounceText.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { announce } from "../../internal/announce.js";
function AnnounceText() {
  const $ = _c(3);
  const ref = React.useRef(null);
  let t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => {
      const box = ref.current && ref.current.parentElement;
      if (!box) {
        return;
      }
      const words = _temp2;
      const said = [...box.children].map(words).filter(Boolean).map(_temp3).join(" ");
      if (said) {
        announce(said);
      }
    };
    t1 = [];
    $[0] = t0;
    $[1] = t1;
  } else {
    t0 = $[0];
    t1 = $[1];
  }
  React.useEffect(t0, t1);
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ React.createElement("span", { ref, hidden: true });
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  return t2;
}
function _temp3(x) {
  return /[.!?…。]$/.test(x) ? x : x + ".";
}
function _temp2(c) {
  if (!c.classList.contains("srp-empty-state__suggestions")) {
    return (c.textContent || "").trim();
  }
  const kids = [...c.children].map(_temp).filter(Boolean);
  return kids.length ? kids[0] + " " + kids.slice(1).join(", ") : "";
}
function _temp(k) {
  return (k.textContent || "").trim();
}
export {
  AnnounceText
};
//# sourceMappingURL=AnnounceText.js.map
