// src/blocks/PageHeader/PageHeader.tsx
import * as React from "react";
import { Breadcrumb, BreadcrumbItem } from "../../components/Breadcrumb/Breadcrumb.js";
import { Heading } from "../../components/Heading/Heading.js";
import { Button } from "../../components/Button/Button.js";
import { Menu, MenuItem } from "../../components/Menu/Menu.js";
import { Link } from "../../components/Link/Link.js";
var button = (a, variant) => a.href ? /* @__PURE__ */ React.createElement(Button, { key: a.label, href: a.href, variant }, a.label) : /* @__PURE__ */ React.createElement(Button, { key: a.label, variant, onClick: a.onSelect }, a.label);
function PageHeader({ breadcrumb, title, description, primary, secondary = [], sections, sectionsLabel = "Sections", moreLabel = "More actions" }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-4 border-b border-border pb-4" }, breadcrumb?.length ? /* @__PURE__ */ React.createElement(Breadcrumb, null, breadcrumb.map((b, i) => /* @__PURE__ */ React.createElement(BreadcrumbItem, { key: b.label, href: i < breadcrumb.length - 1 ? b.href : void 0 }, b.label))) : null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-start justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-col gap-1" }, /* @__PURE__ */ React.createElement(Heading, { level: 1 }, title), description != null ? /* @__PURE__ */ React.createElement("p", { className: "m-0 max-w-prose text-text-muted" }, description) : null), primary || secondary.length ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, primary ? button(primary, "primary") : null, secondary.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "hidden flex-wrap gap-2 sm:flex" }, secondary.map((a) => button(a, "secondary"))), /* @__PURE__ */ React.createElement("div", { className: "sm:hidden" }, /* @__PURE__ */ React.createElement(Menu, { placement: "bottom-end", trigger: /* @__PURE__ */ React.createElement(Button, { variant: "secondary", icon: "more_horiz", "aria-label": moreLabel }) }, secondary.map((a) => /* @__PURE__ */ React.createElement(MenuItem, { key: a.label, href: a.href, onSelect: a.onSelect }, a.label))))) : null) : null), sections?.length ? /* @__PURE__ */ React.createElement("nav", { "aria-label": sectionsLabel }, /* @__PURE__ */ React.createElement("ul", { className: "m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0" }, sections.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.href }, /* @__PURE__ */ React.createElement(Link, { href: s.href, "aria-current": s.current ? "page" : void 0, className: s.current ? "font-semibold" : "no-underline" }, s.label))))) : null);
}
export {
  PageHeader
};
//# sourceMappingURL=PageHeader.js.map
