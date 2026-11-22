"use client";

// src/components/QRCode/QRCode.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
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
function QRCodeRender(t0) {
  const $ = _c(37);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const rest = omit(props, {
    value: 1,
    label: 1,
    size: 1,
    level: 1,
    logo: 1,
    status: 1,
    onRefresh: 1,
    className: 1
  });
  const size = oneOf(SIZES, props.size, "md");
  const status = oneOf(STATUSES, props.status, "active");
  const level = props.level && /^[LMQH]$/.test(props.level) ? props.level : props.logo ? "H" : "M";
  let t1;
  ;
  try {
    let t32;
    if ($[0] !== level || $[1] !== props.value) {
      t32 = draw(encodeQR(props.value, level));
      $[0] = level;
      $[1] = props.value;
      $[2] = t32;
    } else {
      t32 = $[2];
    }
    t1 = t32;
  } catch (t2) {
    const e = t2;
    if (process.env.NODE_ENV !== "production") {
      warnOnce("qr-code-too-long", String(e.message) + ". Shorten it, or link to a page that holds the rest.");
    }
    t1 = null;
  }
  const path = t1;
  const said = React.useRef(null);
  let t3;
  let t4;
  if ($[3] !== sds.labels || $[4] !== status) {
    t3 = () => {
      if (said.current !== null && said.current !== status) {
        if (status === "expired") {
          announce(sds.labels.qrExpired);
        } else {
          if (status === "scanned") {
            announce(sds.labels.qrScanned);
          }
        }
      }
      said.current = status;
    };
    t4 = [status, sds.labels];
    $[3] = sds.labels;
    $[4] = status;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  React.useEffect(t3, t4);
  const n = path ? path.size : 21;
  const box = n + QUIET * 2;
  const logo = props.logo && path ? Math.round(n * 0.2) | 1 : 0;
  const at = QUIET + (n - logo) / 2;
  const t5 = "srp-qr-code--" + size;
  const t6 = status !== "active" && "srp-qr-code--" + status;
  let t7;
  if ($[7] !== props.className || $[8] !== t5 || $[9] !== t6) {
    t7 = cn("srp-qr-code", t5, t6, props.className);
    $[7] = props.className;
    $[8] = t5;
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const t8 = "0 0 " + box + " " + box;
  let t9;
  if ($[11] !== box) {
    t9 = /* @__PURE__ */ React.createElement("rect", { className: "srp-qr-code__light", width: box, height: box });
    $[11] = box;
    $[12] = t9;
  } else {
    t9 = $[12];
  }
  let t10;
  if ($[13] !== path) {
    t10 = path ? /* @__PURE__ */ React.createElement("path", { className: "srp-qr-code__dark", d: path.d }) : null;
    $[13] = path;
    $[14] = t10;
  } else {
    t10 = $[14];
  }
  let t11;
  if ($[15] !== at || $[16] !== logo || $[17] !== props.logo) {
    t11 = logo ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { className: "srp-qr-code__light", x: at - 0.5, y: at - 0.5, width: logo + 1, height: logo + 1 }), /* @__PURE__ */ React.createElement("image", { href: props.logo, x: at, y: at, width: logo, height: logo, preserveAspectRatio: "xMidYMid meet" })) : null;
    $[15] = at;
    $[16] = logo;
    $[17] = props.logo;
    $[18] = t11;
  } else {
    t11 = $[18];
  }
  let t12;
  if ($[19] !== props.label || $[20] !== t10 || $[21] !== t11 || $[22] !== t8 || $[23] !== t9) {
    t12 = /* @__PURE__ */ React.createElement("svg", { className: "srp-qr-code__code", viewBox: t8, role: "img", "aria-label": props.label, shapeRendering: "crispEdges", focusable: "false" }, t9, t10, t11);
    $[19] = props.label;
    $[20] = t10;
    $[21] = t11;
    $[22] = t8;
    $[23] = t9;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  let t13;
  if ($[25] !== props.onRefresh || $[26] !== sds.labels || $[27] !== size || $[28] !== status) {
    t13 = status !== "active" ? /* @__PURE__ */ React.createElement("div", { className: "srp-qr-code__status" }, status === "loading" ? /* @__PURE__ */ React.createElement(Loader, { size: size === "sm" ? "sm" : "md", label: sds.labels.loading }) : null, status === "scanned" ? /* @__PURE__ */ React.createElement("p", { className: "srp-qr-code__message" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.CheckCircle, className: "srp-qr-code__icon" }), sds.labels.qrScanned) : null, status === "expired" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "srp-qr-code__message" }, sds.labels.qrExpired), props.onRefresh ? /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "outline", onClick: props.onRefresh }, sds.labels.qrRefresh) : null) : null) : null;
    $[25] = props.onRefresh;
    $[26] = sds.labels;
    $[27] = size;
    $[28] = status;
    $[29] = t13;
  } else {
    t13 = $[29];
  }
  let t14;
  if ($[30] !== ref || $[31] !== rest || $[32] !== status || $[33] !== t12 || $[34] !== t13 || $[35] !== t7) {
    t14 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t7, "data-component": "qr-code", "data-status": status }, t12, t13);
    $[30] = ref;
    $[31] = rest;
    $[32] = status;
    $[33] = t12;
    $[34] = t13;
    $[35] = t7;
    $[36] = t14;
  } else {
    t14 = $[36];
  }
  return t14;
}
var QRCode = /* @__PURE__ */ named("QRCode", QRCodeRender);
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
  return {
    d,
    size: m.length
  };
}
export {
  QRCode
};
//# sourceMappingURL=QRCode.js.map
