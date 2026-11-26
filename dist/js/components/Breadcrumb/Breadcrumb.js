"use client";

// src/components/Breadcrumb/Breadcrumb.tsx
import { c as _c2 } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { flattenChildren } from "../../internal/children.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
function BreadcrumbItemBaseRender(t0) {
  const $ = _c2(3);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    icon: 1,
    as: 1,
    current: 1,
    className: 1,
    children: 1
  });
  const named2 = props.children != null && props.children !== false && props.children !== "" || !!props["aria-label"] || !!props["aria-labelledby"] || !!props.title;
  let t1;
  let t2;
  if ($[0] !== named2) {
    t1 = function() {
      if (process.env.NODE_ENV !== "production" && !named2) {
        warnOnce("no-name", "BreadcrumbItem has no accessible name, so a screen reader announces only its role. Give it text, or an aria-label.", "name:BreadcrumbItem");
      }
    };
    t2 = [named2];
    $[0] = named2;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  React.useEffect(t1, t2);
  const content = /* @__PURE__ */ React.createElement(React.Fragment, null, props.icon ? /* @__PURE__ */ React.createElement("span", { className: "srp-breadcrumb__icon" }, asIcon(props.icon)) : null, props.children);
  if (props.current) {
    delete rest.href;
    return /* @__PURE__ */ React.createElement("span", { ...rest, ref, "aria-current": "page", "data-current": "", className: cn("srp-breadcrumb__item srp-breadcrumb__item--current", props.className) }, content);
  }
  const Tag = props.as || config.link;
  return /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, className: cn("srp-breadcrumb__item srp-breadcrumb__link", props.className) }, content);
}
var BreadcrumbItemBase = /* @__PURE__ */ named("BreadcrumbItem", BreadcrumbItemBaseRender);
var BreadcrumbItem = BreadcrumbItemBase;
function BreadcrumbRender(t0) {
  const $ = _c2(5);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const rest = omit(props, {
    separator: 1,
    maxItems: 1,
    collapse: 1,
    expandLabel: 1,
    className: 1,
    children: 1
  });
  const asMenu = props.collapse === "menu";
  const separator = oneOf(["chevron", "slash"], props.separator, "chevron");
  const [expanded, setExpanded] = React.useState(false);
  const firstHidden = React.useRef(null);
  const focusAfter = React.useRef(false);
  const items = flattenChildren(props.children).filter(React.isValidElement);
  const max = typeof props.maxItems === "number" && props.maxItems >= 2 ? Math.floor(props.maxItems) : 0;
  const trail = items.map(_temp).join(" ");
  const [was, setWas] = React.useState(trail);
  if (was !== trail) {
    setWas(trail);
    setExpanded(false);
  }
  const collapse = !expanded && max > 0 && items.length > max;
  const shown = items.map(_temp2).filter((t1) => {
    const {
      i: i_0
    } = t1;
    return !collapse || i_0 === 0 || i_0 >= items.length - (max - 1);
  });
  let t2;
  let t3;
  if ($[0] !== expanded) {
    t2 = () => {
      if (expanded && focusAfter.current && firstHidden.current) {
        focusAfter.current = false;
        const a = firstHidden.current.querySelector("a, [tabindex], button");
        if (a) {
          a.focus();
        }
      }
    };
    t3 = [expanded];
    $[0] = expanded;
    $[1] = t2;
    $[2] = t3;
  } else {
    t2 = $[1];
    t3 = $[2];
  }
  React.useEffect(t2, t3);
  const t4 = separator === "slash" ? "/" : /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight });
  let t5;
  if ($[3] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("span", { className: "srp-breadcrumb__separator", "aria-hidden": "true" }, t4);
    $[3] = t4;
    $[4] = t5;
  } else {
    t5 = $[4];
  }
  const sep = t5;
  const out = [];
  shown.forEach((t6, n) => {
    const {
      el: el_1,
      i: i_1
    } = t6;
    if (collapse && n === 1) {
      const label = props.expandLabel || (asMenu ? sds.labels.morePages : sds.labels.showHiddenPages);
      const more = /* @__PURE__ */ React.createElement("button", { type: "button", className: "srp-breadcrumb__item srp-breadcrumb__more", "aria-label": label, onClick: asMenu ? void 0 : () => {
        focusAfter.current = true;
        setExpanded(true);
      } }, "\u2026");
      out.push(/* @__PURE__ */ React.createElement("li", { key: "more", className: "srp-breadcrumb__li" }, sep, asMenu ? /* @__PURE__ */ React.createElement(Menu, { trigger: more, "aria-label": label }, items.slice(1, items.length - (max - 1)).map(_temp3)) : more));
    }
    const last = i_1 === items.length - 1;
    out.push(/* @__PURE__ */ React.createElement("li", { key: el_1.key != null ? el_1.key : i_1, className: "srp-breadcrumb__li", ref: expanded && max > 0 && i_1 === 1 ? firstHidden : void 0 }, n > 0 ? sep : null, React.cloneElement(el_1, {
      current: last || el_1.props.current
    })));
  });
  if (!items.length) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("nav", { "aria-label": sds.labels.breadcrumb, ...rest, ref, "data-component": "breadcrumb", className: cn("srp-breadcrumb", props.className) }, /* @__PURE__ */ React.createElement("ol", { className: "srp-breadcrumb__list" }, out));
}
function _temp3(h, k) {
  const {
    current: _c,
    className: _n,
    style: _s,
    children,
    ...own
  } = h.props;
  return /* @__PURE__ */ React.createElement(MenuItem, { key: h.key != null ? h.key : k, ...own }, children);
}
function _temp2(el_0, i) {
  return {
    el: el_0,
    i
  };
}
function _temp(el) {
  return String(el.key) + el.props.href;
}
var Breadcrumb = /* @__PURE__ */ named("Breadcrumb", BreadcrumbRender);
export {
  Breadcrumb,
  BreadcrumbItem
};
//# sourceMappingURL=Breadcrumb.js.map
