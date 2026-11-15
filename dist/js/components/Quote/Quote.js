"use client";

// src/components/Quote/Quote.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
var OWN = { children: 1, author: 1, source: 1, avatar: 1, cite: 1, size: 1, className: 1 };
var Quote = /* @__PURE__ */ component("Quote", function Quote2(props, ref) {
  const { children, author, source, avatar, cite, size, className } = props;
  const by = author != null && author !== false && author !== "";
  const from = source != null && source !== false && source !== "";
  return /* @__PURE__ */ React.createElement("figure", { ...omit(props, OWN), ref, className: cn("dk-quote", size === "lg" && "dk-quote--lg", className), "data-component": "quote" }, /* @__PURE__ */ React.createElement("blockquote", { className: "dk-quote__text", cite }, typeof children === "string" ? /* @__PURE__ */ React.createElement("p", null, children) : children), by || from ? /* @__PURE__ */ React.createElement("figcaption", { className: "dk-quote__by" }, avatar, /* @__PURE__ */ React.createElement("span", { className: "dk-quote__who" }, by ? /* @__PURE__ */ React.createElement("span", { className: "dk-quote__author" }, author) : null, from ? /* @__PURE__ */ React.createElement("span", { className: "dk-quote__source" }, source) : null)) : null);
});
export {
  Quote
};
//# sourceMappingURL=Quote.js.map
