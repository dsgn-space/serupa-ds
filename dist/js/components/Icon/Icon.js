"use client";

// src/components/Icon/Icon.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { warnOnce } from "../../internal/warn.js";
import { ICONS, hasIcon, getIcon, getRegisteredIcon, loadIcon } from "../../icons.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
var never = () => () => {
};
var yes = () => true;
var no = () => false;
function spellings(name) {
  const words = name.trim().replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase();
  return [words, words.replace(/([a-z])(\d)/g, "$1_$2")].filter((n, i, all) => n !== name && all.indexOf(n) === i);
}
function shapes(markup) {
  const all = [], open = [];
  let here = all;
  for (const [, close, tag = "", attrs = "", alone] of markup.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    if (close) {
      const o = open.pop();
      if (o) {
        const [t, p2, inner, parent] = o;
        parent.push(React.createElement(t, p2, ...inner));
        here = parent;
      }
      continue;
    }
    const p = {
      key: String(here.length)
    };
    for (const [, k = "", v = ""] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) p[k.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
    if (alone) here.push(React.createElement(tag, p));
    else {
      const inner = [];
      open.push([tag, p, inner, here]);
      here = inner;
    }
  }
  return all;
}
function IconRender(t0) {
  const $ = _c(43);
  const {
    ref,
    ...props
  } = t0;
  const restyle = useServerStyles(ref);
  const [tries, again] = React.useReducer(_temp, 0);
  const own = useSettings().icons;
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const custom = !props.icon && hasIcon(props.name);
  const data = props.icon || (custom || props.name == null ? void 0 : own.get(props.name) || (hydrated ? getIcon : getRegisteredIcon)(props.name));
  const missing = !custom && !data && props.name != null;
  let t1;
  if ($[0] !== again || $[1] !== missing || $[2] !== own || $[3] !== props.name) {
    t1 = () => {
      if (!missing) {
        return;
      }
      let live = true;
      let offline = _temp2;
      loadIcon(props.name).then((found) => {
        if (!live) {
          return;
        }
        if (found) {
          again();
        } else {
          if (process.env.NODE_ENV !== "production") {
            const known = (n_0) => hasIcon(n_0) || !!own.get(n_0) || !!getIcon(n_0);
            const names = spellings(props.name);
            Promise.all(names.map(_temp4)).then(() => {
              const meant = names.find(known);
              warnOnce("icon-unknown", `Icon: "${props.name}" isn't a Material Symbol or one of your icons. ${meant ? `Did you mean "${meant}"? Names are snake_case.` : "Check the name on the Icons page (Foundations/Icons)."}`, "icon:" + props.name);
            });
          }
        }
      }, (err) => {
        if (!live) {
          return;
        }
        if (process.env.NODE_ENV !== "production") {
          warnOnce("icon-load", `Icon: the icons drawn by name didn't load (${err instanceof Error ? err.message : String(err)}), so "${props.name}" is empty for now. It tries again when the browser is back online; pass icon={\u2026} to draw an icon without loading it.`);
        }
        window.addEventListener("online", again, {
          once: true
        });
        offline = () => window.removeEventListener("online", again);
      });
      return () => {
        live = false;
        offline();
      };
    };
    $[0] = again;
    $[1] = missing;
    $[2] = own;
    $[3] = props.name;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== missing || $[6] !== own || $[7] !== props.name || $[8] !== tries) {
    t2 = [missing, props.name, tries, own];
    $[5] = missing;
    $[6] = own;
    $[7] = props.name;
    $[8] = tries;
    $[9] = t2;
  } else {
    t2 = $[9];
  }
  React.useEffect(t1, t2);
  let rest;
  let style;
  if ($[10] !== props) {
    rest = omit(props, {
      name: 1,
      icon: 1,
      size: 1,
      weight: 1,
      mirror: 1,
      className: 1,
      style: 1
    });
    const labelled = rest["aria-label"] || rest["aria-labelledby"];
    if (!labelled) {
      rest["aria-hidden"] = true;
    } else {
      rest.role = "img";
    }
    if ($[13] !== props.size || $[14] !== props.style) {
      style = Object.assign({}, props.style);
      if (props.size != null) {
        let t32;
        if ($[16] !== props.size) {
          t32 = /^(xs|sm|md|lg|xl)$/.test(props.size) ? `var(--icon-size-${props.size})` : typeof props.size === "number" || /^\s*\d*\.?\d+\s*$/.test(props.size) ? String(props.size).trim() + "px" : props.size;
          $[16] = props.size;
          $[17] = t32;
        } else {
          t32 = $[17];
        }
        style.fontSize = t32;
      }
      $[13] = props.size;
      $[14] = props.style;
      $[15] = style;
    } else {
      style = $[15];
    }
    const name = props.icon ? props.icon.name : props.name;
    if (name != null) {
      rest["data-icon"] = name;
    }
    $[10] = props;
    $[11] = rest;
    $[12] = style;
  } else {
    rest = $[11];
    style = $[12];
  }
  const mirror = props.mirror === true ? "srp-icon--mirror" : props.mirror === false ? "srp-icon--fixed" : null;
  if (custom) {
    let t32;
    if ($[18] !== mirror || $[19] !== props.className) {
      t32 = cn("srp-icon srp-icon--custom", mirror, props.className);
      $[18] = mirror;
      $[19] = props.className;
      $[20] = t32;
    } else {
      t32 = $[20];
    }
    const t42 = ICONS[props.name] ?? "";
    let t52;
    if ($[21] !== t42) {
      t52 = shapes(t42);
      $[21] = t42;
      $[22] = t52;
    } else {
      t52 = $[22];
    }
    let t62;
    if ($[23] !== t52) {
      t62 = /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, focusable: "false" }, t52);
      $[23] = t52;
      $[24] = t62;
    } else {
      t62 = $[24];
    }
    let t7;
    if ($[25] !== rest || $[26] !== restyle || $[27] !== style || $[28] !== t32 || $[29] !== t62) {
      t7 = /* @__PURE__ */ React.createElement("span", { ...rest, ref: restyle, className: t32, style }, t62);
      $[25] = rest;
      $[26] = restyle;
      $[27] = style;
      $[28] = t32;
      $[29] = t62;
      $[30] = t7;
    } else {
      t7 = $[30];
    }
    return t7;
  }
  const t3 = props.weight && "srp-icon--" + props.weight;
  let t4;
  if ($[31] !== mirror || $[32] !== props.className || $[33] !== t3) {
    t4 = cn("srp-icon", mirror, t3, props.className);
    $[31] = mirror;
    $[32] = props.className;
    $[33] = t3;
    $[34] = t4;
  } else {
    t4 = $[34];
  }
  let t5;
  if ($[35] !== data) {
    t5 = data && /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 -960 960 960", fill: "currentColor", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("path", { d: data.d }));
    $[35] = data;
    $[36] = t5;
  } else {
    t5 = $[36];
  }
  let t6;
  if ($[37] !== rest || $[38] !== restyle || $[39] !== style || $[40] !== t4 || $[41] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("span", { ...rest, ref: restyle, className: t4, style }, t5);
    $[37] = rest;
    $[38] = restyle;
    $[39] = style;
    $[40] = t4;
    $[41] = t5;
    $[42] = t6;
  } else {
    t6 = $[42];
  }
  return t6;
}
function _temp4(n_1) {
  return loadIcon(n_1).catch(_temp3);
}
function _temp3() {
}
function _temp2() {
}
function _temp(n) {
  return n + 1;
}
var Icon = /* @__PURE__ */ named("Icon", IconRender);
export {
  Icon
};
//# sourceMappingURL=Icon.js.map
