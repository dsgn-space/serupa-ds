"use client";

// src/components/Timeline/Timeline.tsx
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
import { useSettings } from "../../internal/provider.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { en as words } from "./labels.js";
var ALIGNS = ["start", "alternate"];
var ORIENTATIONS = ["vertical", "horizontal"];
var STATUSES = ["neutral", "primary", "success", "warning", "danger", "info"];
var Timeline = /* @__PURE__ */ component("Timeline", function Timeline2(props, ref) {
  const { className, align, orientation, stackWhenNarrow, style, ...rest } = props;
  const a = oneOf(ALIGNS, align, "start");
  const horizontal = oneOf(ORIENTATIONS, orientation, "vertical") === "horizontal";
  const L = useSettings(words).labels;
  const [box, setBox] = React.useState(null);
  const scrolls = useScrolls(horizontal ? box : null);
  if (!horizontal) {
    return /* @__PURE__ */ React.createElement("ol", { role: "list", ...rest, style, ref, className: cn("dk-timeline", a === "alternate" && "dk-timeline--alternate", className), "data-component": "timeline" });
  }
  const { "aria-label": label, "aria-labelledby": labelledBy, ...list } = rest;
  const region = scrolls ? { tabIndex: 0, role: "region", "aria-labelledby": labelledBy, "aria-label": labelledBy ? void 0 : label || L.timeline } : {};
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: setBox,
      className: cn("dk-timeline-scroll", stackWhenNarrow && "dk-timeline-scroll--stack", className),
      style,
      ...region,
      "data-component": "timeline",
      "data-orientation": "horizontal"
    },
    /* @__PURE__ */ React.createElement("ol", { role: "list", ...list, "aria-label": scrolls ? void 0 : label, "aria-labelledby": scrolls ? void 0 : labelledBy, ref, className: "dk-timeline dk-timeline--horizontal" })
  );
});
var TimelineItem = /* @__PURE__ */ component("TimelineItem", function TimelineItem2(props, ref) {
  const { className, title, time, dateTime, icon, status, children, ...rest } = props;
  const s = oneOf(STATUSES, status, "neutral");
  return /* @__PURE__ */ React.createElement("li", { ...rest, ref, className: cn("dk-timeline__item", "dk-timeline__item--" + s, className) }, /* @__PURE__ */ React.createElement("span", { className: "dk-timeline__rail", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: cn("dk-timeline__marker", icon != null && "dk-timeline__marker--icon") }, icon != null ? asIcon(icon) : null)), /* @__PURE__ */ React.createElement("div", { className: "dk-timeline__body" }, title != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-timeline__title" }, title) : null, time != null ? dateTime ? /* @__PURE__ */ React.createElement("time", { className: "dk-timeline__time", dateTime }, time) : /* @__PURE__ */ React.createElement("span", { className: "dk-timeline__time" }, time) : null, children != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-timeline__content" }, children) : null));
});
export {
  Timeline,
  TimelineItem
};
//# sourceMappingURL=Timeline.js.map
