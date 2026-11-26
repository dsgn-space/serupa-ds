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
import { useCut } from "../../internal/useCut.js";
function CopyButtonRender(t0) {
  const $ = _c(45);
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
  const first = React.useRef(null);
  const tipOk = !iconOnly && typeof label === "string" && rest.title == null && !rest["aria-label"] && !rest["aria-labelledby"] && !rest["aria-describedby"];
  let t5;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => first.current;
    $[3] = t5;
  } else {
    t5 = $[3];
  }
  const cut = useCut(tipOk, name, t5);
  const failedShort = sds.labels.copyFailedShort;
  const t6 = ref;
  const t7 = variant || "outline";
  const t8 = size || "sm";
  const t9 = cut && tipOk ? name : rest.title;
  const t10 = copied ? "" : void 0;
  const t11 = failed ? "" : void 0;
  const t12 = cn("srp-copy-btn", copied && "srp-copy-btn--copied", failed && "srp-copy-btn--failed", className);
  let t13;
  if ($[4] !== onClick || $[5] !== rest || $[6] !== t10 || $[7] !== t11 || $[8] !== t12 || $[9] !== t6 || $[10] !== t7 || $[11] !== t8 || $[12] !== t9) {
    t13 = {
      ...rest,
      ref: t6,
      onClick,
      variant: t7,
      size: t8,
      title: t9,
      "data-copied": t10,
      "data-failed": t11,
      className: t12
    };
    $[4] = onClick;
    $[5] = rest;
    $[6] = t10;
    $[7] = t11;
    $[8] = t12;
    $[9] = t6;
    $[10] = t7;
    $[11] = t8;
    $[12] = t9;
    $[13] = t13;
  } else {
    t13 = $[13];
  }
  const common = t13;
  if (iconOnly) {
    const said = copied ? done : failed ? failedShort : name;
    let t142;
    if ($[14] !== common || $[15] !== glyph || $[16] !== said) {
      t142 = /* @__PURE__ */ React.createElement(ButtonBase, { ...common, icon: glyph, "aria-label": said });
      $[14] = common;
      $[15] = glyph;
      $[16] = said;
      $[17] = t142;
    } else {
      t142 = $[17];
    }
    const button = t142;
    const own = rest.title != null || rest["aria-describedby"] != null || rest["aria-labelledby"] != null;
    let t152;
    if ($[18] !== button || $[19] !== own || $[20] !== said) {
      t152 = own ? button : /* @__PURE__ */ React.createElement(Tooltip, { content: said, role: "label" }, button);
      $[18] = button;
      $[19] = own;
      $[20] = said;
      $[21] = t152;
    } else {
      t152 = $[21];
    }
    return t152;
  }
  const t14 = shown && "srp-copy-btn__label--off";
  let t15;
  if ($[22] !== t14) {
    t15 = cn("srp-copy-btn__label", t14);
    $[22] = t14;
    $[23] = t15;
  } else {
    t15 = $[23];
  }
  const t16 = shown ? true : void 0;
  let t17;
  if ($[24] !== label || $[25] !== t15 || $[26] !== t16) {
    t17 = /* @__PURE__ */ React.createElement("span", { ref: first, className: t15, "aria-hidden": t16 }, label);
    $[24] = label;
    $[25] = t15;
    $[26] = t16;
    $[27] = t17;
  } else {
    t17 = $[27];
  }
  const t18 = !copied && "srp-copy-btn__label--off";
  let t19;
  if ($[28] !== t18) {
    t19 = cn("srp-copy-btn__label", t18);
    $[28] = t18;
    $[29] = t19;
  } else {
    t19 = $[29];
  }
  const t20 = !copied || void 0;
  let t21;
  if ($[30] !== done || $[31] !== t19 || $[32] !== t20) {
    t21 = /* @__PURE__ */ React.createElement("span", { className: t19, "aria-hidden": t20 }, done);
    $[30] = done;
    $[31] = t19;
    $[32] = t20;
    $[33] = t21;
  } else {
    t21 = $[33];
  }
  let t22;
  if ($[34] !== failed || $[35] !== failedShort) {
    t22 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-copy-btn__label" }, failedShort) : null;
    $[34] = failed;
    $[35] = failedShort;
    $[36] = t22;
  } else {
    t22 = $[36];
  }
  let t23;
  if ($[37] !== t17 || $[38] !== t21 || $[39] !== t22) {
    t23 = /* @__PURE__ */ React.createElement("span", { className: "srp-copy-btn__labels" }, t17, t21, t22);
    $[37] = t17;
    $[38] = t21;
    $[39] = t22;
    $[40] = t23;
  } else {
    t23 = $[40];
  }
  let t24;
  if ($[41] !== common || $[42] !== glyph || $[43] !== t23) {
    t24 = /* @__PURE__ */ React.createElement(ButtonBase, { ...common, startIcon: glyph }, t23);
    $[41] = common;
    $[42] = glyph;
    $[43] = t23;
    $[44] = t24;
  } else {
    t24 = $[44];
  }
  return t24;
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
