// src/internal/middleCutName.tsx
import * as React from "react";
import { graphemes } from "./graphemes.js";
var JOINS = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}]/u;
var LETTER = /[\p{L}\p{M}]/u;
function nameCut(chars, ext) {
  let at = Math.max(0, chars.length - Math.min(chars.length, Math.min(ext, 10) + 6));
  if (at > 0 && JOINS.test(chars[at - 1] ?? "") && JOINS.test(chars[at] ?? "")) {
    while (at > 0 && LETTER.test(chars[at - 1] ?? "")) at--;
  }
  return at;
}
function MiddleCutName({ name, id, cls }) {
  const [el, setEl] = React.useState(null);
  const [cut, setCut] = React.useState(false);
  React.useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => {
      const part = el.firstElementChild;
      if (part instanceof HTMLElement) setCut(part.scrollWidth > part.clientWidth + 1);
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    check();
    return () => ro.disconnect();
  }, [el, name, cut]);
  const chars = cut ? graphemes(name) : [], dot = name.lastIndexOf(".");
  const at = cut ? nameCut(chars, dot > 0 ? graphemes(name.slice(dot)).length : 0) : 0;
  return /* @__PURE__ */ React.createElement("span", { ref: setEl, className: cls.root, dir: "auto", title: name }, cut && at > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: cls.start, "aria-hidden": true }, chars.slice(0, at).join("")), /* @__PURE__ */ React.createElement("span", { className: cls.end, "aria-hidden": true }, chars.slice(at).join(""))) : /* @__PURE__ */ React.createElement("span", { className: cls.start, "aria-hidden": true }, name), /* @__PURE__ */ React.createElement("span", { className: cls.hidden, id }, name));
}
export {
  MiddleCutName
};
//# sourceMappingURL=middleCutName.js.map
