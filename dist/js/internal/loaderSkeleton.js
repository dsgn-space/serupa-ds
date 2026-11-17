// src/internal/loaderSkeleton.tsx
import * as React from "react";
import { cn } from "./cn.js";
import { announce, ensureAnnouncer } from "./announce.js";
import { useShowAfter } from "./showAfter.js";
import { spinnerDelay } from "./timing.js";
function SkeletonArt({ shape = "text", lines = 1, waiting, className }) {
  const bones = [];
  if (shape === "text") for (let i = 0; i < lines; i++) bones.push(/* @__PURE__ */ React.createElement("span", { className: "dk-loader__line", key: i }, /* @__PURE__ */ React.createElement("span", { className: "dk-loader__bone" })));
  else bones.push(/* @__PURE__ */ React.createElement("span", { className: "dk-loader__bone", key: "bone" }));
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      "data-component": "loader",
      "data-variant": "skeleton",
      "data-size": "md",
      "data-shape": shape,
      "aria-hidden": true,
      className: cn("dk-loader dk-loader--skeleton", "dk-loader--shape-" + shape, "dk-loader--size-md", waiting && "dk-loader--waiting", className)
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
//# sourceMappingURL=loaderSkeleton.js.map
