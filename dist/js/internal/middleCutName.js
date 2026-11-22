// src/internal/middleCutName.tsx
import * as React from "react";
import { graphemes } from "./graphemes.js";
import { middleCutAt } from "./middleCut.js";
import { useIsoLayoutEffect } from "./cn.js";
import { Tooltip } from "../components/Tooltip/Tooltip.js";
var CONTROL = 'a[href], button, [role="button"], [role="link"], [tabindex="0"]';
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
  const chars = cut ? graphemes(name) : [];
  const at = cut ? middleCutAt(name, chars) : 0;
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  if (!cut && open) setOpen(false);
  useIsoLayoutEffect(() => {
    const control = el && el.parentElement ? el.parentElement.closest(CONTROL) : null;
    setInside(!!control);
    if (!control) return;
    const focus = () => {
      if (cut && control.matches(":focus-visible")) setOpen(true);
    };
    const blur = () => setOpen(false);
    control.addEventListener("focus", focus);
    control.addEventListener("blur", blur);
    return () => {
      control.removeEventListener("focus", focus);
      control.removeEventListener("blur", blur);
    };
  }, [el, cut]);
  return /* @__PURE__ */ React.createElement(Tooltip, { visual: true, content: name, open, onOpenChange: setOpen, disabled: !cut }, /* @__PURE__ */ React.createElement("span", { ref: setEl, className: cls.root, dir: "auto", "data-cut": cut ? "" : void 0, tabIndex: cut && !inside ? 0 : void 0 }, cut && at > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: cls.start, "aria-hidden": true }, chars.slice(0, at).join("")), /* @__PURE__ */ React.createElement("span", { className: cls.end, "aria-hidden": true }, chars.slice(at).join(""))) : /* @__PURE__ */ React.createElement("span", { className: cls.start, "aria-hidden": true }, name), /* @__PURE__ */ React.createElement("span", { className: cls.hidden, id }, name)));
}
export {
  MiddleCutName
};
//# sourceMappingURL=middleCutName.js.map
