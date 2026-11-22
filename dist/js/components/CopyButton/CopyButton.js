"use client";

// src/components/CopyButton/CopyButton.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { writeText as write, writeTextLater as writeLater } from "../../internal/clipboard.js";
import { useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { feedbackHold } from "../../internal/timing.js";
function CopyButtonRender(t0) {
  const $ = _c(43);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const {
    value,
    children,
    copiedLabel,
    iconOnly,
    timeout,
    onCopy,
    onCopyError,
    className,
    variant,
    size,
    ...rest
  } = props;
  const [shown, setShown] = React.useState(null);
  const copied = shown === "copied";
  const failed = shown === "failed";
  const timer = React.useRef(null);
  let t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  React.useEffect(t1, t2);
  const label = children == null || children === false ? sds.labels.copy : children;
  const done = copiedLabel || sds.labels.copied;
  const name = typeof label === "string" ? label : sds.labels.copy;
  const show = (what) => {
    setShown(what);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setShown(null), timeout ?? feedbackHold);
  };
  const onClick = async (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
    if (e.defaultPrevented) {
      return;
    }
    ;
    try {
      const text = await copy(value, e.currentTarget);
      show("copied");
      announce(done);
      if (onCopy) {
        onCopy(text);
      }
    } catch (t3) {
      const err = t3;
      show("failed");
      announce(sds.labels.copyFailed, {
        assertive: true
      });
      if (onCopyError) {
        onCopyError(err);
      }
    }
  };
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ React.createElement("span", { className: "srp-copy-btn__icons" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ContentCopy, className: "srp-copy-btn__icon srp-copy-btn__icon--copy" }), /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-copy-btn__icon srp-copy-btn__icon--done" }), /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "srp-copy-btn__icon srp-copy-btn__icon--failed" }));
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const glyph = t4;
  const failedShort = sds.labels.copyFailedShort;
  const t5 = ref;
  const t6 = variant || "outline";
  const t7 = size || "sm";
  const t8 = copied ? "" : void 0;
  const t9 = failed ? "" : void 0;
  const t10 = cn("srp-copy-btn", copied && "srp-copy-btn--copied", failed && "srp-copy-btn--failed", className);
  let t11;
  if ($[3] !== onClick || $[4] !== rest || $[5] !== t10 || $[6] !== t5 || $[7] !== t6 || $[8] !== t7 || $[9] !== t8 || $[10] !== t9) {
    t11 = {
      ...rest,
      ref: t5,
      onClick,
      variant: t6,
      size: t7,
      "data-copied": t8,
      "data-failed": t9,
      className: t10
    };
    $[3] = onClick;
    $[4] = rest;
    $[5] = t10;
    $[6] = t5;
    $[7] = t6;
    $[8] = t7;
    $[9] = t8;
    $[10] = t9;
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  const common = t11;
  if (iconOnly) {
    const said = copied ? done : failed ? failedShort : name;
    let t122;
    if ($[12] !== common || $[13] !== glyph || $[14] !== said) {
      t122 = /* @__PURE__ */ React.createElement(ButtonBase, { ...common, icon: glyph, "aria-label": said });
      $[12] = common;
      $[13] = glyph;
      $[14] = said;
      $[15] = t122;
    } else {
      t122 = $[15];
    }
    const button = t122;
    const own = rest.title != null || rest["aria-describedby"] != null || rest["aria-labelledby"] != null;
    let t132;
    if ($[16] !== button || $[17] !== own || $[18] !== said) {
      t132 = own ? button : /* @__PURE__ */ React.createElement(Tooltip, { content: said, role: "label" }, button);
      $[16] = button;
      $[17] = own;
      $[18] = said;
      $[19] = t132;
    } else {
      t132 = $[19];
    }
    return t132;
  }
  const t12 = shown && "srp-copy-btn__label--off";
  let t13;
  if ($[20] !== t12) {
    t13 = cn("srp-copy-btn__label", t12);
    $[20] = t12;
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  const t14 = shown ? true : void 0;
  let t15;
  if ($[22] !== label || $[23] !== t13 || $[24] !== t14) {
    t15 = /* @__PURE__ */ React.createElement("span", { className: t13, "aria-hidden": t14 }, label);
    $[22] = label;
    $[23] = t13;
    $[24] = t14;
    $[25] = t15;
  } else {
    t15 = $[25];
  }
  const t16 = !copied && "srp-copy-btn__label--off";
  let t17;
  if ($[26] !== t16) {
    t17 = cn("srp-copy-btn__label", t16);
    $[26] = t16;
    $[27] = t17;
  } else {
    t17 = $[27];
  }
  const t18 = !copied || void 0;
  let t19;
  if ($[28] !== done || $[29] !== t17 || $[30] !== t18) {
    t19 = /* @__PURE__ */ React.createElement("span", { className: t17, "aria-hidden": t18 }, done);
    $[28] = done;
    $[29] = t17;
    $[30] = t18;
    $[31] = t19;
  } else {
    t19 = $[31];
  }
  let t20;
  if ($[32] !== failed || $[33] !== failedShort) {
    t20 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-copy-btn__label" }, failedShort) : null;
    $[32] = failed;
    $[33] = failedShort;
    $[34] = t20;
  } else {
    t20 = $[34];
  }
  let t21;
  if ($[35] !== t15 || $[36] !== t19 || $[37] !== t20) {
    t21 = /* @__PURE__ */ React.createElement("span", { className: "srp-copy-btn__labels" }, t15, t19, t20);
    $[35] = t15;
    $[36] = t19;
    $[37] = t20;
    $[38] = t21;
  } else {
    t21 = $[38];
  }
  let t22;
  if ($[39] !== common || $[40] !== glyph || $[41] !== t21) {
    t22 = /* @__PURE__ */ React.createElement(ButtonBase, { ...common, startIcon: glyph }, t21);
    $[39] = common;
    $[40] = glyph;
    $[41] = t21;
    $[42] = t22;
  } else {
    t22 = $[42];
  }
  return t22;
}
async function copy(value, at) {
  const got = typeof value === "function" ? value() : value;
  if (typeof got === "string") {
    await write(got, at);
    return got;
  }
  return writeLater(Promise.resolve(got), at);
}
var CopyButton = /* @__PURE__ */ named("CopyButton", CopyButtonRender);
export {
  CopyButton
};
//# sourceMappingURL=CopyButton.js.map
