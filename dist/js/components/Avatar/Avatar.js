"use client";

// src/components/Avatar/Avatar.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { Icon } from "../Icon/Icon.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { initials } from "./initials.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { quickArrival } from "../../internal/timing.js";
var OWN = { src: 1, name: 1, alt: 1, size: 1, shape: 1, status: 1, statusLabel: 1, imgProps: 1, className: 1, children: 1 };
var AVATAR_SIZES = ["xs", "sm", "md", "lg", "xl"];
var SIZES = AVATAR_SIZES;
var AvatarGroupSize = /* @__PURE__ */ React.createContext(null);
var STATUSES = ["online", "busy", "away", "offline"];
var Avatar = /* @__PURE__ */ component("Avatar", function Avatar2(props, ref) {
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
    const i = pic.current, src = props.src;
    if (!i || !src) return;
    if (i.complete) {
      i.decode().catch(() => {
        if (pic.current === i && i.complete && !i.naturalWidth) setFailedSrc(src);
      });
      return;
    }
    const t = setTimeout(() => {
      if (!i.complete) setLate([src, false]);
    }, quickArrival);
    return () => clearTimeout(t);
  }, [props.src]);
  const text = initials(props.name);
  const under = late && late[0] === props.src ? late : null;
  const img = props.imgProps;
  const fallback = text ? /* @__PURE__ */ React.createElement("span", { className: "dk-avatar__initials", "aria-hidden": "true" }, text) : /* @__PURE__ */ React.createElement(Icon, { className: "dk-avatar__icon", icon: icons.Person });
  const body = showImg ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      decoding: "async",
      ...img,
      className: cn("dk-avatar__img", under && "dk-avatar__img--late", under && under[1] && "dk-avatar__img--in", img && img.className),
      src: props.src,
      alt: "",
      ref: pic,
      onLoad: (e) => {
        if (img && img.onLoad) img.onLoad(e);
        if (under) setLate([under[0], true]);
      },
      onAnimationEnd: (e) => {
        if (img && img.onAnimationEnd) img.onAnimationEnd(e);
        setLate(null);
      },
      onError: (e) => {
        if (img && img.onError) img.onError(e);
        setFailedSrc(props.src);
      }
    }
  ), under ? fallback : null) : fallback;
  if (full) {
    rest.role = "img";
    rest["aria-label"] = full;
  } else if (!status) rest["aria-hidden"] = true;
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      ...rest,
      ref,
      className: cn("dk-avatar", "dk-avatar--" + size, square && "dk-avatar--square", props.className),
      "data-component": "avatar",
      "data-size": size,
      "data-shape": square ? "square" : "circle"
    },
    /* @__PURE__ */ React.createElement("span", { className: "dk-avatar__frame" }, body),
    status ? /* @__PURE__ */ React.createElement("span", { className: "dk-avatar__status dk-avatar__status--" + status, ...full ? { "aria-hidden": true } : { role: "img", "aria-label": said } }) : null
  );
});
export {
  AVATAR_SIZES,
  Avatar,
  AvatarGroupSize,
  initials
};
//# sourceMappingURL=Avatar.js.map
