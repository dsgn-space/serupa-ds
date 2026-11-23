"use client";

// src/components/Avatar/Avatar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { initials } from "./initials.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { quickArrival } from "../../internal/timing.js";
var OWN = {
  src: 1,
  name: 1,
  alt: 1,
  size: 1,
  shape: 1,
  status: 1,
  statusLabel: 1,
  imgProps: 1,
  className: 1,
  children: 1
};
var AVATAR_SIZES = ["xs", "sm", "md", "lg", "xl"];
var SIZES = AVATAR_SIZES;
var AvatarGroupSize = /* @__PURE__ */ React.createContext(null);
var STATUSES = ["online", "busy", "away", "offline"];
function AvatarRender(t0) {
  const $ = _c(22);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const size = React.useContext(AvatarGroupSize) || oneOf(SIZES, props.size, "md");
  const square = props.shape === "square";
  const sds = useSettings(words);
  const status = props.status && STATUSES.indexOf(props.status) >= 0 ? props.status : null;
  const [failedSrc, setFailedSrc] = React.useState(null);
  const failed = failedSrc != null && failedSrc === props.src;
  const label = (props.alt != null ? props.alt : props.name || "").trim();
  const said = status ? props.statusLabel || sds.labels.avatarStatus(status) : "";
  const full = label && said ? label + ", " + said : label;
  const showImg = !!props.src && !failed;
  const pic = React.useRef(null);
  const [late, setLate] = React.useState(null);
  React.useEffect(() => {
    const i = pic.current;
    const src = props.src;
    if (!i || !src) {
      return;
    }
    if (i.complete) {
      i.decode().catch(() => {
        if (pic.current === i && i.complete && !i.naturalWidth) {
          setFailedSrc(src);
        }
      });
      return;
    }
    const t = setTimeout(() => {
      if (!i.complete) {
        setLate([src, false]);
      }
    }, quickArrival);
    return () => clearTimeout(t);
  }, [props.src]);
  let t1;
  if ($[0] !== props.name) {
    t1 = initials(props.name);
    $[0] = props.name;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const text = t1;
  const under = late && late[0] === props.src ? late : null;
  const img = props.imgProps;
  let t2;
  if ($[2] !== text) {
    t2 = text ? /* @__PURE__ */ React.createElement("span", { className: "srp-avatar__initials", "aria-hidden": "true" }, text) : /* @__PURE__ */ React.createElement(Icon, { className: "srp-avatar__icon", icon: icons.Person });
    $[2] = text;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const fallback = t2;
  const body = showImg ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("img", { loading: "lazy", decoding: "async", ...img, className: cn("srp-avatar__img", under && "srp-avatar__img--late", under && under[1] && "srp-avatar__img--in", img && img.className), src: props.src, alt: "", ref: pic, onLoad: (e) => {
    if (img && img.onLoad) {
      img.onLoad(e);
    }
    if (under) {
      setLate([under[0], true]);
    }
  }, onAnimationEnd: (e_0) => {
    if (img && img.onAnimationEnd) {
      img.onAnimationEnd(e_0);
    }
    setLate(null);
  }, onError: (e_1) => {
    if (img && img.onError) {
      img.onError(e_1);
    }
    setFailedSrc(props.src);
  } }), under ? fallback : null) : fallback;
  if (full) {
    rest.role = "img";
    rest["aria-label"] = full;
  } else {
    if (!status) {
      rest["aria-hidden"] = true;
    }
  }
  const t3 = "srp-avatar--" + size;
  const t4 = square && "srp-avatar--square";
  let t5;
  if ($[4] !== props.className || $[5] !== t3 || $[6] !== t4) {
    t5 = cn("srp-avatar", t3, t4, props.className);
    $[4] = props.className;
    $[5] = t3;
    $[6] = t4;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const t6 = square ? "square" : "circle";
  let t7;
  if ($[8] !== body) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-avatar__frame" }, body);
    $[8] = body;
    $[9] = t7;
  } else {
    t7 = $[9];
  }
  let t8;
  if ($[10] !== full || $[11] !== said || $[12] !== status) {
    t8 = status ? /* @__PURE__ */ React.createElement("span", { className: "srp-avatar__status srp-avatar__status--" + status, ...full ? {
      "aria-hidden": true
    } : {
      role: "img",
      "aria-label": said
    } }) : null;
    $[10] = full;
    $[11] = said;
    $[12] = status;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  let t9;
  if ($[14] !== ref || $[15] !== rest || $[16] !== size || $[17] !== t5 || $[18] !== t6 || $[19] !== t7 || $[20] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: t5, "data-component": "avatar", "data-size": size, "data-shape": t6 }, t7, t8);
    $[14] = ref;
    $[15] = rest;
    $[16] = size;
    $[17] = t5;
    $[18] = t6;
    $[19] = t7;
    $[20] = t8;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  return t9;
}
var Avatar = /* @__PURE__ */ named("Avatar", AvatarRender);
export {
  AVATAR_SIZES,
  Avatar,
  AvatarGroupSize,
  initials
};
//# sourceMappingURL=Avatar.js.map
