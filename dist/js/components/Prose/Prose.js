"use client";

// src/components/Prose/Prose.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
var TAGS = ["div", "article", "section"];
var MARK = "data-prose-scroll";
function syncScrollers(root) {
  const boxes = root.querySelectorAll("pre, table");
  for (const el of boxes) {
    const ours = el.hasAttribute(MARK);
    if (!ours && el.hasAttribute("tabindex")) continue;
    const wide = el.scrollWidth > el.clientWidth + 1;
    if (wide && !ours) {
      el.setAttribute("tabindex", "0");
      el.setAttribute(MARK, "");
    } else if (!wide && ours) {
      el.removeAttribute("tabindex");
      el.removeAttribute(MARK);
    }
  }
}
function ProseRender(t0) {
  const $ = _c(3);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    as: 1,
    className: 1
  });
  const root = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n) => {
      root.current = n;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const rootRefs = useMergedRef(ref, t1);
  let t2;
  let t3;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      const el = root.current;
      if (!el) {
        return;
      }
      const sync = () => syncScrollers(el);
      sync();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
      const watch = () => {
        if (!ro) {
          return;
        }
        ro.disconnect();
        ro.observe(el);
        for (const b of el.querySelectorAll("pre, table")) {
          ro.observe(b);
        }
      };
      watch();
      const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(() => {
        watch();
        sync();
      });
      if (mo) {
        mo.observe(el, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
      const stop = onFontsLoaded(sync);
      return () => {
        if (ro) {
          ro.disconnect();
        }
        if (mo) {
          mo.disconnect();
        }
        stop();
      };
    };
    t3 = [];
    $[1] = t2;
    $[2] = t3;
  } else {
    t2 = $[1];
    t3 = $[2];
  }
  React.useEffect(t2, t3);
  return React.createElement(oneOf(TAGS, props.as, "div"), Object.assign(rest, {
    ref: rootRefs,
    "data-component": "prose",
    className: cn("srp-prose", props.className)
  }));
}
var Prose = /* @__PURE__ */ named("Prose", ProseRender);
export {
  Prose
};
//# sourceMappingURL=Prose.js.map
