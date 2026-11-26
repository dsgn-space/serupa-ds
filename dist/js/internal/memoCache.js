// src/internal/memoCache.ts
import * as React from "react";
var EMPTY = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel");
function useMemoCache(size) {
  return React.useState(() => Array.from({ length: size }, () => EMPTY))[0];
}
export {
  useMemoCache as c
};
//# sourceMappingURL=memoCache.js.map
