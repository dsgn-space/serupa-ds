"use client";

// src/components/Attachment/Attachment.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { Progress } from "../Progress/Progress.js";
import { formatFileSize } from "../FileUpload/formatFileSize.js";
import * as icons from "../../material/builtin.js";
import { attachmentKind } from "./attachmentKind.js";
import { KIND_ICONS } from "./kindIcon.js";
import { en as ownWords } from "./labels.js";
import { en as fileWords } from "../FileUpload/labels.js";
import { en as boundary } from "../ErrorBoundary/labels.js";
import { MiddleCutName } from "../../internal/middleCutName.js";
var words = /* @__PURE__ */ Object.assign({}, boundary, fileWords, ownWords);
var OWN = {
  name: 1,
  bytes: 1,
  type: 1,
  kind: 1,
  href: 1,
  download: 1,
  progress: 1,
  error: 1,
  onRetry: 1,
  onRemove: 1,
  removeLabel: 1,
  disabled: 1,
  className: 1
};
var ICONS = KIND_ICONS;
var WORD = {
  pdf: "attachmentPdf",
  image: "attachmentImage",
  sheet: "attachmentSheet",
  doc: "attachmentDoc",
  slides: "attachmentSlides",
  archive: "attachmentArchive",
  code: "attachmentCode",
  audio: "attachmentAudio",
  video: "attachmentVideo",
  other: "attachmentOther"
};
var NAME = {
  root: "srp-attachment__name-text",
  start: "srp-attachment__name-start",
  end: "srp-attachment__name-end",
  hidden: "srp-visually-hidden"
};
function AttachmentRender(t0) {
  const $ = _c(26);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const locale = useLocale();
  const L = sds.labels;
  const rest = omit(props, OWN);
  const base = domId("srp-at", React.useId());
  const kind = props.kind || attachmentKind(props.name, props.type);
  const disabled = !!props.disabled;
  const failed = props.error != null && props.error !== false && props.error !== "";
  const uploading = props.progress !== void 0 && !failed;
  const size = props.bytes != null ? formatFileSize(props.bytes, locale) : "";
  const value = typeof props.progress === "number" && isFinite(props.progress) ? Math.min(100, Math.max(0, props.progress)) : null;
  const name = /* @__PURE__ */ React.createElement(MiddleCutName, { name: props.name, id: base + "-name", cls: NAME });
  const removeLabel = props.removeLabel || ((n) => L.remove + " " + n);
  const t1 = cn("srp-attachment", failed && "srp-attachment--error", uploading && "srp-attachment--uploading", disabled && "srp-attachment--disabled", props.className);
  const t2 = "attachment";
  const t3 = ICONS[kind];
  let t4;
  if ($[0] !== t3) {
    t4 = /* @__PURE__ */ React.createElement(Icon, { icon: t3, className: "srp-attachment__icon" });
    $[0] = t3;
    $[1] = t4;
  } else {
    t4 = $[1];
  }
  const t5 = props.href && !disabled ? /* @__PURE__ */ React.createElement("a", { className: "srp-attachment__name", href: props.href, download: props.download === true ? "" : props.download || void 0, "aria-describedby": cn(base + "-meta", failed && base + "-error") }, name) : /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__name" }, name);
  const t6 = base + "-meta";
  const t7 = L[WORD[kind]];
  let t8;
  if ($[2] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__kind" }, t7);
    $[2] = t7;
    $[3] = t8;
  } else {
    t8 = $[3];
  }
  const t9 = size ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__size" }, size) : null;
  let t10;
  if ($[4] !== t6 || $[5] !== t8 || $[6] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__meta", id: t6, dir: "auto" }, t8, t9);
    $[4] = t6;
    $[5] = t8;
    $[6] = t9;
    $[7] = t10;
  } else {
    t10 = $[7];
  }
  let t11;
  if ($[8] !== base || $[9] !== uploading || $[10] !== value) {
    t11 = uploading ? /* @__PURE__ */ React.createElement(Progress, { className: "srp-attachment__progress", size: "sm", value, "aria-labelledby": base + "-name" }) : null;
    $[8] = base;
    $[9] = uploading;
    $[10] = value;
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  const t12 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__error", id: base + "-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), props.error === true ? L.fileError : props.error) : null;
  let t13;
  if ($[12] !== t10 || $[13] !== t11 || $[14] !== t12 || $[15] !== t5) {
    t13 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__body" }, t5, t10, t11, t12);
    $[12] = t10;
    $[13] = t11;
    $[14] = t12;
    $[15] = t5;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  const t14 = failed && props.onRetry ? /* @__PURE__ */ React.createElement(Button, { className: "srp-attachment__retry", variant: "ghost", size: "sm", disabled, onClick: props.onRetry, "aria-labelledby": base + "-retry " + base + "-name", "aria-describedby": base + "-error" }, /* @__PURE__ */ React.createElement("span", { id: base + "-retry" }, L.tryAgain)) : null;
  const t15 = props.onRemove ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-attachment__remove", icon: icons.Close, label: removeLabel(props.name), size: "sm", variant: "ghost", disabled, onClick: props.onRemove }) : null;
  let t16;
  if ($[17] !== kind || $[18] !== ref || $[19] !== rest || $[20] !== t1 || $[21] !== t13 || $[22] !== t14 || $[23] !== t15 || $[24] !== t4) {
    t16 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-component": t2, "data-kind": kind }, t4, t13, t14, t15);
    $[17] = kind;
    $[18] = ref;
    $[19] = rest;
    $[20] = t1;
    $[21] = t13;
    $[22] = t14;
    $[23] = t15;
    $[24] = t4;
    $[25] = t16;
  } else {
    t16 = $[25];
  }
  return t16;
}
var Attachment = /* @__PURE__ */ named("Attachment", AttachmentRender);
export {
  Attachment,
  attachmentKind
};
//# sourceMappingURL=Attachment.js.map
