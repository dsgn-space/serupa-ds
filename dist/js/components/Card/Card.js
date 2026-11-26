"use client";

// src/components/Card/Card.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { named } from "../../internal/component.js";
var INTERACTIVE = "a[href], button, input, select, textarea, label, summary, [tabindex]";
var OWN = {
  variant: 1,
  padding: 1,
  as: 1,
  className: 1,
  href: 1,
  target: 1,
  rel: 1,
  children: 1
};
var CardLinkContext = /* @__PURE__ */ React.createContext(null);
var VARIANTS = ["outline", "elevated", "filled"];
var PADDINGS = ["none", "sm", "md", "lg"];
function CardRender(t0) {
  const $ = _c(20);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const variant = oneOf(VARIANTS, props.variant, "outline");
  const padding = oneOf(PADDINGS, props.padding, "md");
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-card", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const base = t2;
  const isLink = props.href != null;
  const cls = cn("srp-card", variant !== "outline" && "srp-card--" + variant, padding !== "md" && "srp-card--padding-" + padding, isLink && "srp-card--link", props.className);
  const Tag = props.as === "section" || props.as === "article" || props.as === "li" ? props.as : "div";
  const inLink = React.useContext(CardLinkContext) != null;
  if (!isLink) {
    return /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, className: cls, "data-component": "card", "data-variant": variant }, inLink ? /* @__PURE__ */ React.createElement(CardLinkContext.Provider, { value: null }, props.children) : props.children);
  }
  const link = {
    href: props.href,
    target: props.target,
    rel: props.target === "_blank" && props.rel == null ? "noopener noreferrer" : props.rel,
    "aria-label": rest["aria-label"]
  };
  delete rest["aria-label"];
  const titled = React.Children.toArray(props.children).some(_temp);
  const id = rest.id || base;
  const own = rest.onClick;
  const ownAux = rest.onAuxClick;
  const target = _temp2;
  const away = _temp3;
  let t3;
  if ($[2] !== own) {
    t3 = (e_0) => {
      if (own) {
        own(e_0);
      }
      const a_0 = target(e_0);
      if (!a_0) {
        return;
      }
      if (e_0.ctrlKey || e_0.metaKey || e_0.shiftKey) {
        away(a_0);
      } else {
        a_0.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          altKey: e_0.altKey
        }));
      }
    };
    $[2] = own;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const onClick = t3;
  let t4;
  if ($[4] !== ownAux) {
    t4 = (e_1) => {
      if (ownAux) {
        ownAux(e_1);
      }
      const a_1 = e_1.button === 1 ? target(e_1) : null;
      if (a_1) {
        away(a_1);
      }
    };
    $[4] = ownAux;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const onAuxClick = t4;
  const t5 = ref;
  const t6 = titled ? null : React.createElement(config.link, {
    ...link,
    className: "srp-card__link srp-card__link--cover",
    "aria-labelledby": link["aria-label"] ? void 0 : id,
    key: "link"
  });
  const t7 = titled ? link : null;
  let t8;
  if ($[6] !== props.children || $[7] !== t7) {
    t8 = /* @__PURE__ */ React.createElement(CardLinkContext.Provider, { value: t7, key: "content" }, props.children);
    $[6] = props.children;
    $[7] = t7;
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  let t9;
  if ($[9] !== Tag || $[10] !== cls || $[11] !== id || $[12] !== onAuxClick || $[13] !== onClick || $[14] !== rest || $[15] !== t5 || $[16] !== t6 || $[17] !== t8 || $[18] !== variant) {
    t9 = /* @__PURE__ */ React.createElement(Tag, { ...rest, id, ref: t5, className: cls, "data-component": "card", "data-variant": variant, onClick, onAuxClick }, t6, t8);
    $[9] = Tag;
    $[10] = cls;
    $[11] = id;
    $[12] = onAuxClick;
    $[13] = onClick;
    $[14] = rest;
    $[15] = t5;
    $[16] = t6;
    $[17] = t8;
    $[18] = variant;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  return t9;
}
function _temp3(a) {
  if (/^(https?|mailto|tel):$/.test(a.protocol)) {
    window.open(a.href, "_blank", "noopener");
  }
}
function _temp2(e) {
  const t = e.target;
  if (e.defaultPrevented || !(t instanceof Element) || t.closest(INTERACTIVE)) {
    return null;
  }
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed && e.currentTarget.contains(sel.anchorNode)) {
    return null;
  }
  return e.currentTarget.querySelector(".srp-card__link");
}
function _temp(c) {
  return React.isValidElement(c) && c.type === CardHeader && hasContent(c.props.title);
}
var Card = /* @__PURE__ */ named("Card", CardRender);
var hasContent = (n) => n != null && n !== false && n !== "";
function CardHeaderRender(t0) {
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    title: 1,
    description: 1,
    action: 1,
    headingLevel: 1,
    className: 1,
    children: 1
  });
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) < 0 ? 3 : props.headingLevel;
  const link = React.useContext(CardLinkContext);
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("srp-card__header", props.className) }, /* @__PURE__ */ React.createElement("div", { className: "srp-card__heading" }, hasContent(props.title) ? React.createElement("h" + level, {
    className: "srp-card__title"
  }, link ? React.createElement(config.link, {
    ...link,
    className: "srp-card__link"
  }, props.title) : props.title) : null, hasContent(props.description) ? /* @__PURE__ */ React.createElement("p", { className: "srp-card__description" }, props.description) : null, props.children), hasContent(props.action) ? /* @__PURE__ */ React.createElement("div", { className: "srp-card__action" }, props.action) : null);
}
var CardHeader = /* @__PURE__ */ named("CardHeader", CardHeaderRender);
function CardBodyRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    t1 = props;
    t2 = ref;
    t3 = cn("srp-card__body", props.className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("div", { ...t1, ref: t2, className: t3 });
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
var CardBody = /* @__PURE__ */ named("CardBody", CardBodyRender);
function CardFooterRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const rest = omit(props, {
      justify: 1,
      className: 1
    });
    const j = oneOf(["start", "end", "between"], props.justify, "end");
    t1 = rest;
    t2 = ref;
    t3 = cn("srp-card__footer", j !== "end" && "srp-card__footer--" + j, props.className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t1 || $[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("div", { ...t1, ref: t2, className: t3 });
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
var CardFooter = /* @__PURE__ */ named("CardFooter", CardFooterRender);
export {
  Card,
  CardBody,
  CardFooter,
  CardHeader
};
//# sourceMappingURL=Card.js.map
