"use client";

// src/components/Textarea/Textarea.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { useValidityMessages } from "../../internal/validity.js";
import { cn, domId, isInvalid, oneOf, omit, useMergedRef, SIZES, useIsoLayoutEffect } from "../../internal/cn.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale } from "../../internal/provider.js";
import { useTextLimit } from "../../internal/textLimit.js";
import { pressFocuses } from "../../internal/affix.js";
import { useServerStyles } from "../../internal/serverStyles.js";
var PLAIN = {
  useGrouping: false
};
var OWN = {
  size: 1,
  invalid: 1,
  rows: 1,
  autoResize: 1,
  maxRows: 1,
  resize: 1,
  showCount: 1,
  actions: 1,
  className: 1,
  style: 1
};
var cssSizing;
function sizesInCss() {
  if (cssSizing === void 0) cssSizing = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("field-sizing", "content");
  return cssSizing;
}
function TextareaRender(t0) {
  const $ = _c(71);
  let props;
  let ref;
  if ($[0] !== t0) {
    ({
      ref,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = props;
    $[2] = ref;
  } else {
    props = $[1];
    ref = $[2];
  }
  const nameRef = useNameCheck("Textarea", NAME_HOW.field);
  props = useFieldControl(props);
  let rest = omit(props, OWN);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  let t1;
  if ($[3] !== props.rows) {
    t1 = props.rows > 0 && Number.isFinite(props.rows) ? Math.floor(props.rows) : 3;
    $[3] = props.rows;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const rows = t1;
  const auto = !!props.autoResize;
  let t2;
  if ($[5] !== props.maxRows || $[6] !== rows) {
    t2 = props.maxRows > 0 && Number.isFinite(props.maxRows) ? Math.max(rows, Math.floor(props.maxRows)) : 0;
    $[5] = props.maxRows;
    $[6] = rows;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  const maxRows = t2;
  const resize = auto || props.resize === "none" ? "none" : "vertical";
  const own = React.useRef(null);
  const t3 = !!props.showCount;
  let t4;
  if ($[8] !== t3) {
    t4 = {
      announce: t3
    };
    $[8] = t3;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const limited = useTextLimit(rest, own, t4);
  const {
    length,
    max
  } = limited;
  rest = useValidityMessages(limited.props, own);
  const countId = domId("srp-ta", React.useId());
  const locale = useLocale();
  let t5;
  if ($[10] !== locale) {
    t5 = (n) => displayNumber(n, locale, PLAIN);
    $[10] = locale;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const num = t5;
  let t6;
  if ($[12] !== auto) {
    t6 = auto && !sizesInCss();
    $[12] = auto;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const js = t6;
  let t7;
  if ($[14] !== js || $[15] !== maxRows) {
    t7 = function() {
      const el = own.current;
      if (!js || !el) {
        return;
      }
      const cs = getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || 0;
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      el.style.height = "auto";
      const need = el.scrollHeight;
      const max_0 = maxRows ? maxRows * line + pad : Infinity;
      el.style.height = Math.min(need, max_0) + "px";
      el.style.overflowY = need > max_0 ? "auto" : "hidden";
    };
    $[14] = js;
    $[15] = maxRows;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  const fit = t7;
  let t8;
  if ($[17] !== fit || $[18] !== length || $[19] !== rest.value || $[20] !== rows || $[21] !== size) {
    t8 = [fit, rest.value, length, size, rows];
    $[17] = fit;
    $[18] = length;
    $[19] = rest.value;
    $[20] = rows;
    $[21] = size;
    $[22] = t8;
  } else {
    t8 = $[22];
  }
  useIsoLayoutEffect(fit, t8);
  const changed = rest.onChange;
  let t9;
  if ($[23] !== changed || $[24] !== fit || $[25] !== js) {
    t9 = js ? function(e) {
      if (changed) {
        changed(e);
      }
      fit();
    } : changed;
    $[23] = changed;
    $[24] = fit;
    $[25] = js;
    $[26] = t9;
  } else {
    t9 = $[26];
  }
  const onChange = t9;
  let t10;
  let t11;
  if ($[27] !== fit || $[28] !== js) {
    t10 = function() {
      if (!js || typeof ResizeObserver === "undefined" || !own.current) {
        return;
      }
      let w = own.current.offsetWidth;
      let raf = 0;
      const ro = new ResizeObserver(function() {
        const nw = own.current && own.current.offsetWidth;
        if (nw !== w) {
          w = nw;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(fit);
        }
      });
      ro.observe(own.current);
      const stop = onFontsLoaded(fit);
      return function() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        stop();
      };
    };
    t11 = [js, fit];
    $[27] = fit;
    $[28] = js;
    $[29] = t10;
    $[30] = t11;
  } else {
    t10 = $[29];
    t11 = $[30];
  }
  React.useEffect(t10, t11);
  const setRefs = useMergedRef(ref, nameRef, own);
  const restyle = useServerStyles();
  const describedBy = props.showCount ? cn(rest["aria-describedby"], countId) : rest["aria-describedby"];
  const acts = props.actions != null && props.actions !== false;
  const t12 = max != null && length >= max && "srp-textarea__count--full";
  let t13;
  if ($[31] !== t12) {
    t13 = cn("srp-textarea__count", t12);
    $[31] = t12;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  const t14 = acts ? void 0 : "";
  const t15 = max != null ? num(length) + " / " + num(max) : num(length);
  let t16;
  if ($[33] !== countId || $[34] !== t13 || $[35] !== t14 || $[36] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("span", { className: t13, id: countId, key: "count", "data-field-end": t14 }, t15);
    $[33] = countId;
    $[34] = t13;
    $[35] = t14;
    $[36] = t15;
    $[37] = t16;
  } else {
    t16 = $[37];
  }
  const count = t16;
  const t17 = cn("srp-textarea", "srp-textarea--size-" + size, invalid && "srp-textarea--invalid", rest.disabled && "srp-textarea--disabled", rest.readOnly && "srp-textarea--readonly", resize === "none" && "srp-textarea--resize-none", auto && "srp-textarea--auto", acts && "srp-textarea--actions", props.className);
  const t18 = invalid ? "" : void 0;
  const t19 = rest.disabled ? "" : void 0;
  const t20 = rest.readOnly ? "" : void 0;
  let t21;
  if ($[38] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t21 = (e_0) => pressFocuses(own)(e_0);
    $[38] = t21;
  } else {
    t21 = $[38];
  }
  const t22 = invalid || rest["aria-invalid"];
  const t23 = auto ? maxRows || void 0 : void 0;
  let t24;
  if ($[39] !== rows || $[40] !== t23) {
    t24 = {
      "--srp-ta-rows": rows,
      "--srp-ta-max-rows": t23
    };
    $[39] = rows;
    $[40] = t23;
    $[41] = t24;
  } else {
    t24 = $[41];
  }
  const t25 = t24;
  let t26;
  if ($[42] !== describedBy || $[43] !== onChange || $[44] !== rest || $[45] !== rows || $[46] !== setRefs || $[47] !== t22 || $[48] !== t25) {
    t26 = /* @__PURE__ */ React.createElement("textarea", { ...rest, "aria-invalid": t22, "aria-describedby": describedBy, onChange, ref: setRefs, rows, className: "srp-textarea__field", key: "field", style: t25 });
    $[42] = describedBy;
    $[43] = onChange;
    $[44] = rest;
    $[45] = rows;
    $[46] = setRefs;
    $[47] = t22;
    $[48] = t25;
    $[49] = t26;
  } else {
    t26 = $[49];
  }
  let t27;
  if ($[50] !== acts || $[51] !== count || $[52] !== props.actions || $[53] !== props.showCount || $[54] !== rest.disabled) {
    t27 = acts ? /* @__PURE__ */ React.createElement("fieldset", { className: "srp-textarea__actions", role: "none", disabled: !!rest.disabled, key: "actions" }, props.showCount ? count : null, props.actions) : null;
    $[50] = acts;
    $[51] = count;
    $[52] = props.actions;
    $[53] = props.showCount;
    $[54] = rest.disabled;
    $[55] = t27;
  } else {
    t27 = $[55];
  }
  let t28;
  if ($[56] !== props.style || $[57] !== restyle || $[58] !== size || $[59] !== t17 || $[60] !== t18 || $[61] !== t19 || $[62] !== t20 || $[63] !== t26 || $[64] !== t27) {
    t28 = /* @__PURE__ */ React.createElement("span", { className: t17, "data-invalid": t18, "data-disabled": t19, "data-readonly": t20, ref: restyle, style: props.style, "data-component": "textarea", "data-size": size, onMouseDown: t21 }, t26, t27);
    $[56] = props.style;
    $[57] = restyle;
    $[58] = size;
    $[59] = t17;
    $[60] = t18;
    $[61] = t19;
    $[62] = t20;
    $[63] = t26;
    $[64] = t27;
    $[65] = t28;
  } else {
    t28 = $[65];
  }
  const box = t28;
  let t29;
  if ($[66] !== acts || $[67] !== box || $[68] !== count || $[69] !== props.showCount) {
    t29 = props.showCount && !acts ? /* @__PURE__ */ React.createElement("span", { className: "srp-textarea__wrap", "data-field-row": "" }, box, count) : box;
    $[66] = acts;
    $[67] = box;
    $[68] = count;
    $[69] = props.showCount;
    $[70] = t29;
  } else {
    t29 = $[70];
  }
  return t29;
}
var Textarea = /* @__PURE__ */ named("Textarea", TextareaRender);
export {
  Textarea
};
//# sourceMappingURL=Textarea.js.map
