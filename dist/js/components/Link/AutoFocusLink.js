"use client";

// src/components/Link/AutoFocusLink.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useMergedRef } from "../../internal/cn.js";
import { useAutoFocus } from "../../internal/focus.js";
function AutoFocusLink(props) {
  const $ = _c(10);
  const node = React.useRef(null);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = (n) => {
      node.current = n;
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const linkRefs = useMergedRef(props.linkRef, t0);
  let t1;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => node.current;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  useAutoFocus(true, t1);
  let t2;
  if ($[2] !== linkRefs || $[3] !== props.as || $[4] !== props.attrs || $[5] !== props.children) {
    let t3;
    if ($[7] !== linkRefs || $[8] !== props.attrs) {
      t3 = {
        ...props.attrs,
        ref: linkRefs
      };
      $[7] = linkRefs;
      $[8] = props.attrs;
      $[9] = t3;
    } else {
      t3 = $[9];
    }
    t2 = React.createElement(props.as, t3, props.children);
    $[2] = linkRefs;
    $[3] = props.as;
    $[4] = props.attrs;
    $[5] = props.children;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  return t2;
}
export {
  AutoFocusLink
};
//# sourceMappingURL=AutoFocusLink.js.map
