"use client";

// src/components/CodeBlock/CodeBlock.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useScrolls } from "../../internal/useScrolls.js";
import { cn, domId, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { useSettings } from "../../internal/provider.js";
import { CopyButton } from "../CopyButton/CopyButton.js";
import { en as words } from "./labels.js";
var OWN = {
  code: 1,
  language: 1,
  title: 1,
  lineNumbers: 1,
  startLine: 1,
  highlight: 1,
  wrap: 1,
  copyable: 1,
  className: 1
};
function CodeBlockRender(t0) {
  const $ = _c(24);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const restyle = useServerStyles(ref);
  const labels = useSettings(words).labels;
  const base = domId("srp-code", React.useId());
  const code = String(props.code ?? "").replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const lines = code.split("\n");
  const start = Number.isFinite(Number(props.startLine)) ? Math.round(Number(props.startLine) || 1) : 1;
  const marked = /* @__PURE__ */ new Set();
  for (const h of props.highlight || []) {
    const [a, b] = typeof h === "number" ? [h, h] : h;
    for (let n = Math.max(start, a); n <= Math.min(b, start + lines.length - 1); n++) {
      marked.add(n);
    }
  }
  const hasTitle = props.title != null && props.title !== false && props.title !== "";
  const copyable = props.copyable !== false;
  const lang = props.language ? String(props.language) : "";
  const pre = React.useRef(null);
  const scrolls = useScrolls(pre);
  const header = hasTitle || lang || copyable;
  let t1;
  if ($[0] !== base || $[1] !== hasTitle || $[2] !== labels || $[3] !== lang) {
    t1 = hasTitle ? {
      "aria-labelledby": base + "-title"
    } : {
      "aria-label": lang || labels.codeName
    };
    $[0] = base;
    $[1] = hasTitle;
    $[2] = labels;
    $[3] = lang;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const name = t1;
  const t2 = cn("srp-code-block", props.wrap && "srp-code-block--wrap", props.lineNumbers && "srp-code-block--numbered", props.className);
  const t3 = "code-block";
  const t4 = lang || void 0;
  const t5 = header ? /* @__PURE__ */ React.createElement("div", { className: "srp-code-block__header" }, hasTitle ? /* @__PURE__ */ React.createElement("div", { className: "srp-code-block__title", id: base + "-title" }, props.title) : lang ? /* @__PURE__ */ React.createElement("div", { className: "srp-code-block__language" }, lang) : /* @__PURE__ */ React.createElement("span", null), copyable ? /* @__PURE__ */ React.createElement(CopyButton, { className: "srp-code-block__copy", value: code, variant: "ghost", size: "sm", iconOnly: true }, labels.codeCopy) : null) : null;
  const t6 = "srp-code-block__pre";
  let t7;
  if ($[5] !== name || $[6] !== scrolls) {
    t7 = scrolls ? {
      tabIndex: 0,
      role: "region",
      ...name
    } : {};
    $[5] = name;
    $[6] = scrolls;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  const t8 = props.lineNumbers ? {
    "--srp-code-digits": String(start + lines.length - 1).length,
    ...start !== 1 ? {
      counterReset: `srp-code-line ${start - 1}`
    } : {}
  } : void 0;
  const t9 = lang && "language-" + lang;
  let t10;
  if ($[8] !== t9) {
    t10 = cn("srp-code-block__code", t9);
    $[8] = t9;
    $[9] = t10;
  } else {
    t10 = $[9];
  }
  const t11 = lines.map((line, i) => {
    const n_0 = start + i;
    const end = i < lines.length - 1 ? "\n" : "";
    return marked.has(n_0) ? /* @__PURE__ */ React.createElement("mark", { key: i, className: "srp-code-block__line srp-code-block__line--marked" }, line, end) : /* @__PURE__ */ React.createElement("span", { key: i, className: "srp-code-block__line" }, line, end);
  });
  let t12;
  if ($[10] !== t10 || $[11] !== t11) {
    t12 = /* @__PURE__ */ React.createElement("code", { className: t10 }, t11);
    $[10] = t10;
    $[11] = t11;
    $[12] = t12;
  } else {
    t12 = $[12];
  }
  let t13;
  if ($[13] !== t12 || $[14] !== t7 || $[15] !== t8) {
    t13 = /* @__PURE__ */ React.createElement("pre", { ref: pre, className: t6, ...t7, style: t8 }, t12);
    $[13] = t12;
    $[14] = t7;
    $[15] = t8;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  let t14;
  if ($[17] !== rest || $[18] !== restyle || $[19] !== t13 || $[20] !== t2 || $[21] !== t4 || $[22] !== t5) {
    t14 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: restyle, className: t2, "data-component": t3, "data-language": t4 }, t5, t13);
    $[17] = rest;
    $[18] = restyle;
    $[19] = t13;
    $[20] = t2;
    $[21] = t4;
    $[22] = t5;
    $[23] = t14;
  } else {
    t14 = $[23];
  }
  return t14;
}
var CodeBlock = /* @__PURE__ */ named("CodeBlock", CodeBlockRender);
export {
  CodeBlock
};
//# sourceMappingURL=CodeBlock.js.map
