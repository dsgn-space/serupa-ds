// src/internal/skeletonArt.tsx
import * as React from "react";
import { cn } from "./cn.js";
import { announce, ensureAnnouncer } from "./announce.js";
import { useShowAfter } from "./showAfter.js";
import { spinnerDelay } from "./timing.js";
function SkeletonArt({ shape = "text", lines = 1, waiting, className }) {
  const bones = [];
  if (shape === "text") for (let i = 0; i < lines; i++) bones.push(/* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__line", key: i }, /* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__bone" })));
  else bones.push(/* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__bone", key: "bone" }));
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      "data-component": "skeleton",
      "data-size": "md",
      "data-shape": shape,
      "aria-hidden": true,
      className: cn("srp-skeleton", "srp-skeleton--" + shape, "srp-skeleton--size-md", waiting && "srp-skeleton--waiting", className)
    },
    bones
  );
}
function useSkeletonShown(label) {
  const shown = useShowAfter(true, spinnerDelay);
  const latest = React.useRef(label);
  React.useEffect(function() {
    latest.current = label;
  });
  React.useEffect(function() {
    ensureAnnouncer();
  }, []);
  React.useEffect(function() {
    if (shown && latest.current) announce(latest.current);
  }, [shown]);
  return shown;
}
export {
  SkeletonArt,
  useSkeletonShown
};
//# sourceMappingURL=skeletonArt.js.map
