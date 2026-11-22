// src/components/PageSection/PageSection.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { space } from "../../internal/space.js";
import { named } from "../../internal/component.js";
import { Container } from "../Container/Container.js";
var TAGS = ["section", "div", "header", "footer", "aside"];
function PageSectionRender({ ref, ...props }) {
  const rest = omit(props, { tone: 1, divider: 1, spacing: 1, size: 1, align: 1, gap: 1, as: 1, className: 1, children: 1 });
  const tone = oneOf(["plain", "muted"], props.tone, "plain");
  const spacing = oneOf(["sm", "md", "lg"], props.spacing, "md");
  const gap = space(props.gap);
  const Tag = oneOf(TAGS, props.as, "section");
  return /* @__PURE__ */ React.createElement(
    Tag,
    {
      ...rest,
      ref,
      "data-component": "page-section",
      className: cn("srp-page-section", "srp-page-section--" + spacing, tone === "muted" && "srp-page-section--muted", props.divider && "srp-page-section--divider", props.align === "center" && "srp-page-section--center", props.className)
    },
    /* @__PURE__ */ React.createElement(Container, { size: props.size, className: "srp-page-section__inner", style: gap ? { "--srp-page-section-gap": gap } : void 0 }, props.children)
  );
}
var PageSection = /* @__PURE__ */ named("PageSection", PageSectionRender);
export {
  PageSection
};
//# sourceMappingURL=PageSection.js.map
