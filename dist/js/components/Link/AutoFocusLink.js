"use client";

// src/components/Link/AutoFocusLink.tsx
import * as React from "react";
import { useMergedRef } from "../../internal/cn.js";
import { useAutoFocus } from "../../internal/focus.js";
function AutoFocusLink(props) {
  const node = React.useRef(null);
  const linkRefs = useMergedRef(props.linkRef, (n) => {
    node.current = n;
  });
  useAutoFocus(true, () => node.current);
  return React.createElement(props.as, { ...props.attrs, ref: linkRefs }, props.children);
}
export {
  AutoFocusLink
};
//# sourceMappingURL=AutoFocusLink.js.map
