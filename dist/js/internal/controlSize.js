// src/internal/controlSize.ts
import * as React from "react";
var ControlSize = /* @__PURE__ */ React.createContext(void 0);
function useControlSize(own) {
  const around = React.useContext(ControlSize);
  return own ?? around;
}
export {
  ControlSize,
  useControlSize
};
//# sourceMappingURL=controlSize.js.map
