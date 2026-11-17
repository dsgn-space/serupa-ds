"use client";

// src/components/DescriptionList/DescriptionList.tsx
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
var DescriptionList = /* @__PURE__ */ component("DescriptionList", function DescriptionList2(props, ref) {
  const { className, layout = "inline", dividers, ...rest } = props;
  return /* @__PURE__ */ React.createElement(
    "dl",
    {
      ...rest,
      ref,
      "data-component": "description-list",
      className: cn("dk-description-list", `dk-description-list--${layout}`, dividers && "dk-description-list--dividers", className)
    }
  );
});
var DescriptionItem = /* @__PURE__ */ component("DescriptionItem", function DescriptionItem2(props, ref) {
  const { className, term, children, emphasis, ...rest } = props;
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-description-list__item", emphasis && "dk-description-list__item--emphasis", className) }, /* @__PURE__ */ React.createElement("dt", { className: "dk-description-list__term" }, term), /* @__PURE__ */ React.createElement("dd", { className: "dk-description-list__details" }, children));
});
export {
  DescriptionItem,
  DescriptionList
};
//# sourceMappingURL=DescriptionList.js.map
