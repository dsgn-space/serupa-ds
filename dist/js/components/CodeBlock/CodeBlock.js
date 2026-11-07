"use client";

// src/components/CodeBlock/CodeBlock.tsx
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { useSettings } from "../../internal/provider.js";
import { CopyButton } from "../CopyButton/CopyButton.js";
import { en as words } from "./labels.js";
var OWN = { code: 1, language: 1, title: 1, lineNumbers: 1, startLine: 1, highlight: 1, wrap: 1, copyable: 1, className: 1 };
var CodeBlock = /* @__PURE__ */ component("CodeBlock", function CodeBlock2(props, ref) {
  const rest = omit(props, OWN);
  const restyle = useServerStyles(ref);
  const labels = useSettings(words).labels;
  const base = domId("dk-code", React.useId());
  const code = String(props.code ?? "").replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const lines = code.split("\n");
  const start = Math.round(Number(props.startLine) || 1);
  const marked = /* @__PURE__ */ new Set();
  for (const h of props.highlight || []) {
    const [a, b] = typeof h === "number" ? [h, h] : h;
    for (let n = Math.max(start, a); n <= Math.min(b, start + lines.length - 1); n++) marked.add(n);
  }
  const hasTitle = props.title != null && props.title !== false && props.title !== "";
  const copyable = props.copyable !== false;
  const lang = props.language ? String(props.language) : "";
  const pre = React.useRef(null);
  const [scrolls, setScrolls] = React.useState(false);
  useIsoLayoutEffect(() => {
    const el = pre.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  const header = hasTitle || lang || copyable;
  const name = hasTitle ? { "aria-labelledby": base + "-title" } : { "aria-label": lang || labels.codeName };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: restyle,
      className: cn("dk-code-block", props.wrap && "dk-code-block--wrap", props.lineNumbers && "dk-code-block--numbered", props.className),
      "data-component": "code-block",
      "data-language": lang || void 0
    },
    header ? /* @__PURE__ */ React.createElement("div", { className: "dk-code-block__header" }, hasTitle ? /* @__PURE__ */ React.createElement("div", { className: "dk-code-block__title", id: base + "-title" }, props.title) : lang ? /* @__PURE__ */ React.createElement("div", { className: "dk-code-block__language" }, lang) : /* @__PURE__ */ React.createElement("span", null), copyable ? /* @__PURE__ */ React.createElement(CopyButton, { className: "dk-code-block__copy", value: code, variant: "ghost", size: "sm", iconOnly: true }, labels.codeCopy) : null) : null,
    /* @__PURE__ */ React.createElement(
      "pre",
      {
        ref: pre,
        className: "dk-code-block__pre",
        ...scrolls ? { tabIndex: 0, role: "region", ...name } : {},
        style: props.lineNumbers ? { "--dk-code-digits": String(start + lines.length - 1).length, ...start !== 1 ? { counterReset: `dk-code-line ${start - 1}` } : {} } : void 0
      },
      /* @__PURE__ */ React.createElement("code", { className: cn("dk-code-block__code", lang && "language-" + lang) }, lines.map((line, i) => {
        const n = start + i, end = i < lines.length - 1 ? "\n" : "";
        return marked.has(n) ? /* @__PURE__ */ React.createElement("mark", { key: i, className: "dk-code-block__line dk-code-block__line--marked" }, line, end) : /* @__PURE__ */ React.createElement("span", { key: i, className: "dk-code-block__line" }, line, end);
      }))
    )
  );
});
export {
  CodeBlock
};
//# sourceMappingURL=CodeBlock.js.map
