"use client";

// src/components/Form/FormSteps.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, useIsoLayoutEffect, useLatest, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useControllable } from "../../internal/controllable.js";
import { pathKey } from "../../internal/formValues.js";
import { useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { Stepper } from "../Stepper/Stepper.js";
import { FormInternals } from "./Form.js";
import { en as words } from "./labels.js";
function FormStep(props) {
  const $ = _c(2);
  let t0;
  if ($[0] !== props.children) {
    t0 = /* @__PURE__ */ React.createElement(React.Fragment, null, props.children);
    $[0] = props.children;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}
function FormStepsRender(t0) {
  const $ = _c(29);
  const {
    ref,
    ...props
  } = t0;
  const {
    children,
    submitLabel,
    step,
    defaultStep,
    onStepChange,
    headingLevel,
    className,
    ...rest
  } = props;
  const sds = useSettings(words);
  const internals = React.useContext(FormInternals);
  const steps = React.Children.toArray(children).filter(_temp);
  const last = Math.max(0, steps.length - 1);
  const [raw, setOwn] = useControllable(step, defaultStep || 0, "FormSteps", "step");
  const current = Math.min(Math.max(0, raw), last);
  const [startAt] = React.useState(current);
  const base = domId("srp-form-steps", React.useId());
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const panels = React.useRef(t1);
  const moved = React.useRef(false);
  const go = (to) => {
    moved.current = true;
    setOwn(to);
    if (onStepChange) {
      onStepChange(to);
    }
  };
  let t2;
  if ($[1] !== current) {
    t2 = () => {
      panels.current.forEach((p, i) => {
        if (!p) {
          return;
        }
        if (i === current) {
          p.removeAttribute("hidden");
        } else {
          p.setAttribute("hidden", "until-found");
        }
      });
    };
    $[1] = current;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  useIsoLayoutEffect(t2);
  const latestGo = useLatest(go);
  let t3;
  if ($[3] !== latestGo) {
    t3 = () => {
      const list = panels.current.slice();
      const offs = list.map((p_0, i_0) => {
        if (!p_0) {
          return _temp2;
        }
        const open = () => {
          latestGo.current(i_0);
        };
        p_0.addEventListener("beforematch", open);
        return () => {
          p_0.removeEventListener("beforematch", open);
        };
      });
      return () => {
        offs.forEach(_temp3);
      };
    };
    $[3] = latestGo;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  React.useEffect(t3, [steps.length, latestGo]);
  let t4;
  let t5;
  if ($[5] !== current) {
    t4 = () => {
      if (!moved.current) {
        return;
      }
      moved.current = false;
      const h = panels.current[current] && panels.current[current].querySelector(".srp-form-steps__title");
      if (h) {
        if (typeof h.scrollIntoView === "function") {
          h.scrollIntoView({
            block: "start"
          });
        }
        h.focus({
          preventScroll: true
        });
      }
    };
    t5 = [current];
    $[5] = current;
    $[6] = t4;
    $[7] = t5;
  } else {
    t4 = $[6];
    t5 = $[7];
  }
  React.useEffect(t4, t5);
  const next = async () => {
    const p_1 = panels.current[current];
    const keys = p_1 ? Array.from(new Set(Array.from(p_1.querySelectorAll("[name]"), _temp4))) : [];
    if (internals && keys.length && !await internals.show(keys)) {
      return;
    }
    go(Math.min(current + 1, last));
  };
  let t6;
  if ($[8] !== current || $[9] !== last || $[10] !== next) {
    t6 = (e) => {
      const t = e.target;
      if (e.key !== "Enter" || e.defaultPrevented || e.isComposing || current >= last || t.tagName !== "INPUT") {
        return;
      }
      if (/^(button|submit|reset|checkbox|radio|file|image|color|range)$/.test(t.type) || t.getAttribute("aria-expanded") === "true") {
        return;
      }
      e.preventDefault();
      next();
    };
    $[8] = current;
    $[9] = last;
    $[10] = next;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  const onKeyDown = t6;
  const latestKey = useLatest(onKeyDown);
  const root = React.useRef(null);
  let t7;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = (n) => {
      root.current = n;
    };
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  const mergedRef = useMergedRef(ref, t7);
  let t8;
  let t9;
  if ($[13] !== latestKey) {
    t8 = () => {
      const n_0 = root.current;
      if (!n_0) {
        return;
      }
      const on = (e_0) => {
        latestKey.current(e_0);
      };
      n_0.addEventListener("keydown", on);
      return () => {
        n_0.removeEventListener("keydown", on);
      };
    };
    t9 = [latestKey];
    $[13] = latestKey;
    $[14] = t8;
    $[15] = t9;
  } else {
    t8 = $[14];
    t9 = $[15];
  }
  React.useEffect(t8, t9);
  const H = "h" + ([2, 3, 4, 5, 6].indexOf(headingLevel) < 0 ? 2 : headingLevel);
  let t10;
  if ($[16] !== current || $[17] !== last || $[18] !== next || $[19] !== sds || $[20] !== submitLabel) {
    t10 = current < last ? /* @__PURE__ */ React.createElement(Button, { type: "button", onClick: next }, sds.labels.formNext) : /* @__PURE__ */ React.createElement(Button, { type: "submit" }, submitLabel);
    $[16] = current;
    $[17] = last;
    $[18] = next;
    $[19] = sds;
    $[20] = submitLabel;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== current || $[23] !== go || $[24] !== sds) {
    t11 = current > 0 ? /* @__PURE__ */ React.createElement(Button, { type: "button", variant: "secondary", onClick: () => {
      go(current - 1);
    } }, sds.labels.formBack) : null;
    $[22] = current;
    $[23] = go;
    $[24] = sds;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== t10 || $[27] !== t11) {
    t12 = /* @__PURE__ */ React.createElement("div", { className: "srp-form-steps__actions" }, t10, t11);
    $[26] = t10;
    $[27] = t11;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: mergedRef, className: cn("srp-form-steps", className), "data-component": "form-steps" }, /* @__PURE__ */ React.createElement(Stepper, { className: "srp-form-steps__progress", current, onStepClick: (i_1) => {
    if (i_1 < current) {
      go(i_1);
    }
  }, steps: steps.map(_temp5) }), steps.map((s_0, i_2) => /* @__PURE__ */ React.createElement("section", { key: i_2, ref: (n_1) => {
    panels.current[i_2] = n_1;
  }, className: "srp-form-steps__panel", "aria-labelledby": base + "-" + i_2, hidden: i_2 !== startAt || void 0 }, /* @__PURE__ */ React.createElement(H, { id: base + "-" + i_2, className: "srp-form-steps__title", tabIndex: -1 }, s_0.props.title), s_0)), t12);
}
function _temp5(s) {
  return {
    title: s.props.title,
    description: s.props.description,
    optional: s.props.optional
  };
}
function _temp4(c_0) {
  return pathKey(c_0.name);
}
function _temp3(off) {
  off();
}
function _temp2() {
}
function _temp(c) {
  return React.isValidElement(c);
}
var FormSteps = /* @__PURE__ */ named("FormSteps", FormStepsRender);
export {
  FormStep,
  FormSteps
};
//# sourceMappingURL=FormSteps.js.map
