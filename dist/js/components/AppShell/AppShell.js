// src/components/AppShell/AppShell.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { SkipLink } from "../SkipLink/SkipLink.js";
function AppShellRender({ ref, ...props }) {
  const rest = omit(props, { header: 1, sidebar: 1, sidebarFrom: 1, children: 1, footer: 1, bottomNav: 1, background: 1, padded: 1, skipLink: 1, mainId: 1, className: 1 });
  const from = oneOf(["sm", "md", "lg"], props.sidebarFrom, "sm");
  const mainId = props.mainId || "main";
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, "data-component": "app-shell", className: cn("srp-app-shell", props.background === "muted" && "srp-app-shell--muted", props.className) }, props.skipLink === false ? null : /* @__PURE__ */ React.createElement(SkipLink, { target: mainId }), props.header, props.sidebar == null ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-app-shell__side srp-app-shell__side--from-" + from }, props.sidebar), /* @__PURE__ */ React.createElement("main", { id: mainId, tabIndex: -1, className: cn("srp-app-shell__main", props.padded !== false && "srp-app-shell__main--padded") }, props.children), props.footer == null ? null : /* @__PURE__ */ React.createElement("footer", { className: "srp-app-shell__footer" }, props.footer), props.bottomNav == null ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-app-shell__bottom" }, props.bottomNav));
}
var AppShell = /* @__PURE__ */ named("AppShell", AppShellRender);
export {
  AppShell
};
//# sourceMappingURL=AppShell.js.map
