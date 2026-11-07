"use client";

// src/components/Tour/Tour.tsx
import * as React from "react";
import { cn, domId, omit, setRef, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { showLayer } from "../../internal/position.js";
import { deepActive, rootOf } from "../../internal/root.js";
import { useSettings } from "../../internal/provider.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { en as stepper } from "../Stepper/labels.js";
import { en as tour } from "./labels.js";
var words = /* @__PURE__ */ Object.assign({}, stepper, tour);
var OWN = { steps: 1, open: 1, defaultOpen: 1, onOpenChange: 1, step: 1, defaultStep: 1, onStepChange: 1, onFinish: 1, headingLevel: 1, className: 1, id: 1 };
function find(t, near) {
  const el = typeof t === "string" ? rootOf(near).querySelector(t) : t && "current" in t ? t.current : t;
  return el instanceof Element ? el : null;
}
var Tour = /* @__PURE__ */ component("Tour", function Tour2(props, ref) {
  const sds = useSettings(words);
  const own = domId("dk-tour", React.useId());
  const id = props.id || own;
  const steps = props.steps || [];
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen);
  const open = steps.length > 0 && (props.open !== void 0 ? !!props.open : ownOpen);
  const [ownStep, setOwnStep] = React.useState(props.defaultStep || 0);
  const at = Math.max(0, Math.min(steps.length - 1, props.step !== void 0 ? props.step : ownStep));
  const step = steps[at];
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && props.step === void 0) setOwnStep(props.defaultStep || 0);
  }
  const panel = React.useRef(null);
  const anchor = React.useRef(null);
  const opener = React.useRef(null);
  const [target, setTarget] = React.useState(null);
  const close = (reason) => {
    if (props.open === void 0) setOwnOpen(false);
    if (props.onOpenChange) props.onOpenChange(false, { reason });
  };
  const go = (to) => {
    if (props.step === void 0) setOwnStep(to);
    if (props.onStepChange) props.onStepChange(to);
  };
  const last = at === steps.length - 1;
  const next = () => {
    if (!last) {
      go(at + 1);
      return;
    }
    if (props.onFinish) props.onFinish();
    close("close");
  };
  useIsoLayoutEffect(() => {
    const el = open && step ? find(step.target, panel.current) : null;
    anchor.current = el;
    setTarget(el);
    if (!el) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    el.setAttribute("data-tour-target", "");
    return () => el.removeAttribute("data-tour-target");
  }, [open, step]);
  const exit = useExit(open, panel);
  useAnchoredLayer(open && !!target, panel, anchor, { placement: step && step.placement, offsetVar: "--dk-tour-offset", watch: target });
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || target || !p) return;
    p.style.top = p.style.left = "";
    showLayer(p);
  }, [open, target]);
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || !p) return;
    if (!opener.current) opener.current = deepActive();
    p.focus({ preventScroll: true });
  }, [open, at]);
  useIsoLayoutEffect(() => {
    if (open) return;
    const back = opener.current, p = panel.current, now = deepActive();
    opener.current = null;
    if (back && back.isConnected && typeof back.focus === "function" && (!now || now === document.body || !!p && p.contains(now))) back.focus({ preventScroll: true });
  }, [open]);
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || !p) return;
    const esc = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
      e.preventDefault();
      e.stopPropagation();
      close("escape");
    };
    p.addEventListener("keydown", esc);
    return () => p.removeEventListener("keydown", esc);
  }, [open, close]);
  if (!step) return null;
  const H = "h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel) >= 0 ? props.headingLevel : 2);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...omit(props, OWN),
      ref: (n) => {
        panel.current = n;
        setRef(ref, n);
      },
      id,
      role: "dialog",
      tabIndex: -1,
      ...{ popover: "manual" },
      hidden: !open || void 0,
      inert: !open || void 0,
      "aria-labelledby": id + "-title",
      "aria-describedby": step.content != null ? id + "-text" : void 0,
      className: cn("dk-tour", !target && "dk-tour--center", props.className),
      "data-component": "tour",
      "data-state": open ? "open" : "closed",
      "data-instant": exit.instant ? "" : void 0
    },
    open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "dk-tour__head" }, /* @__PURE__ */ React.createElement(H, { id: id + "-title", className: "dk-tour__title" }, step.title), /* @__PURE__ */ React.createElement(IconButton, { className: "dk-tour__close", icon: icons.Close, label: sds.labels.close, size: "sm", hideTitle: true, onClick: () => close("close") })), step.content != null ? /* @__PURE__ */ React.createElement("div", { id: id + "-text", className: "dk-tour__text" }, step.content) : null, /* @__PURE__ */ React.createElement("div", { className: "dk-tour__foot" }, steps.length > 1 ? /* @__PURE__ */ React.createElement("span", { className: "dk-tour__count" }, sds.labels.stepOf(at + 1, steps.length)) : null, /* @__PURE__ */ React.createElement("span", { className: "dk-tour__actions" }, at > 0 ? /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "secondary", onClick: () => go(at - 1) }, sds.labels.tourBack) : null, /* @__PURE__ */ React.createElement(Button, { size: "sm", onClick: next }, last ? sds.labels.tourDone : sds.labels.tourNext)))) : null
  );
});
export {
  Tour
};
//# sourceMappingURL=Tour.js.map
