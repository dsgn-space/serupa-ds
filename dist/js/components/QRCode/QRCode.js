"use client";

// src/components/QRCode/QRCode.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { warnOnce } from "../../internal/warn.js";
import { Button } from "../Button/Button.js";
import { Icon } from "../Icon/Icon.js";
import { Loader } from "../Loader/Loader.js";
import * as icons from "../../material/builtin.js";
import { encodeQR } from "./encode.js";
import { en as words } from "./labels.js";
var SIZES = ["sm", "md", "lg"];
var STATUSES = ["active", "loading", "expired", "scanned"];
var QUIET = 4;
var QRCode = /* @__PURE__ */ component("QRCode", function QRCode2(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, { value: 1, label: 1, size: 1, level: 1, logo: 1, status: 1, onRefresh: 1, className: 1 });
  const size = oneOf(SIZES, props.size, "md");
  const status = oneOf(STATUSES, props.status, "active");
  const level = props.level && /^[LMQH]$/.test(props.level) ? props.level : props.logo ? "H" : "M";
  const path = React.useMemo(() => {
    try {
      return draw(encodeQR(props.value, level));
    } catch (e) {
      if (process.env.NODE_ENV !== "production") warnOnce("qr-code-too-long", String(e.message) + ". Shorten it, or link to a page that holds the rest.");
      return null;
    }
  }, [props.value, level]);
  const said = React.useRef(null);
  React.useEffect(() => {
    if (said.current !== null && said.current !== status) {
      if (status === "expired") announce(sds.labels.qrExpired);
      else if (status === "scanned") announce(sds.labels.qrScanned);
    }
    said.current = status;
  }, [status, sds.labels]);
  const n = path ? path.size : 21;
  const box = n + QUIET * 2;
  const logo = props.logo && path ? Math.round(n * 0.2) | 1 : 0;
  const at = QUIET + (n - logo) / 2;
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-qr-code", "dk-qr-code--" + size, status !== "active" && "dk-qr-code--" + status, props.className), "data-component": "qr-code", "data-status": status }, /* @__PURE__ */ React.createElement("svg", { className: "dk-qr-code__code", viewBox: "0 0 " + box + " " + box, role: "img", "aria-label": props.label, shapeRendering: "crispEdges", focusable: "false" }, /* @__PURE__ */ React.createElement("rect", { className: "dk-qr-code__light", width: box, height: box }), path ? /* @__PURE__ */ React.createElement("path", { className: "dk-qr-code__dark", d: path.d }) : null, logo ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { className: "dk-qr-code__light", x: at - 0.5, y: at - 0.5, width: logo + 1, height: logo + 1 }), /* @__PURE__ */ React.createElement("image", { href: props.logo, x: at, y: at, width: logo, height: logo, preserveAspectRatio: "xMidYMid meet" })) : null), status !== "active" ? /* @__PURE__ */ React.createElement("div", { className: "dk-qr-code__status" }, status === "loading" ? /* @__PURE__ */ React.createElement(Loader, { size: size === "sm" ? "sm" : "md", label: sds.labels.loading }) : null, status === "scanned" ? /* @__PURE__ */ React.createElement("p", { className: "dk-qr-code__message" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.CheckCircle, className: "dk-qr-code__icon" }), sds.labels.qrScanned) : null, status === "expired" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "dk-qr-code__message" }, sds.labels.qrExpired), props.onRefresh ? /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "outline", onClick: props.onRefresh }, sds.labels.qrRefresh) : null) : null) : null);
});
function draw(m) {
  let d = "";
  for (let y = 0; y < m.length; y++) {
    const row = m[y];
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue;
      let run = 1;
      while (x + run < row.length && row[x + run]) run++;
      d += "M" + (x + QUIET) + " " + (y + QUIET) + "h" + run + "v1h-" + run + "z";
      x += run - 1;
    }
  }
  return { d, size: m.length };
}
export {
  QRCode
};
//# sourceMappingURL=QRCode.js.map
