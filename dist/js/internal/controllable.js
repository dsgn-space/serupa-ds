// src/internal/controllable.ts
import * as React from "react";
import { warnOnce } from "./warn.js";
function useControllable(value, initial, component, prop) {
  const [own, setOwn] = React.useState(initial);
  const controlled = value !== void 0;
  const was = React.useRef(controlled);
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && was.current !== controlled) {
      warnOnce("controlled-switch", `${component}: \`${prop}\` changed from ${was.current ? "controlled to uncontrolled" : "uncontrolled to controlled"} (it ${controlled ? "was undefined and now has a value" : "had a value and is now undefined"}). Keep it one or the other for the component's lifetime: pass a real value (false, an empty list) rather than undefined while the app's state loads or resets, or pass default${prop[0].toUpperCase() + prop.slice(1)} for the component to keep its own.`, "controlled-switch:" + component + ":" + prop);
    }
    was.current = controlled;
  }, [controlled, component, prop]);
  return [controlled ? value : own, setOwn, controlled];
}
export {
  useControllable
};
//# sourceMappingURL=controllable.js.map
