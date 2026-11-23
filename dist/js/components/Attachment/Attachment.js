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
import { formatFileSize } from "../../internal/formatFileSize.js";
import * as icons from "../../material/builtin.js";
import { attachmentKind } from "../../internal/fileKind.js";
import { KIND_ICONS } from "../../internal/fileKindIcon.js";
import { en as ownWords } from "./labels.js";
import { en as fileWords } from "../FileUpload/labels.js";
import { en as boundary } from "../ErrorBoundary/labels.js";
import { en as progressWords } from "../Progress/labels.js";
import { MiddleCutName } from "../../internal/middleCutName.js";
var words = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.assign({}, boundary, progressWords), fileWords, ownWords);
var OWN = {
  name: 1,
  bytes: 1,
  type: 1,
  kind: 1,
  href: 1,
  download: 1,
  progress: 1,
  thumbnail: 1,
  done: 1,
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
  const $ = _c(25);
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
  const t3 = props.thumbnail != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__thumbnail" }, props.thumbnail) : /* @__PURE__ */ React.createElement(Icon, { icon: ICONS[kind], className: "srp-attachment__icon" });
  const t4 = props.href && !disabled ? /* @__PURE__ */ React.createElement("a", { className: "srp-attachment__name", href: props.href, download: props.download === true ? "" : props.download || void 0, "aria-describedby": cn(base + "-meta", failed && base + "-error") }, name) : /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__name" }, name);
  const t5 = base + "-meta";
  const t6 = L[WORD[kind]];
  let t7;
  if ($[0] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__kind" }, t6);
    $[0] = t6;
    $[1] = t7;
  } else {
    t7 = $[1];
  }
  const t8 = size ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__size" }, size) : null;
  const t9 = props.done && !failed && !uploading ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__done" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.CheckCircle }), L.progressComplete("")) : null;
  let t10;
  if ($[2] !== t5 || $[3] !== t7 || $[4] !== t8 || $[5] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__meta", id: t5, dir: "auto" }, t7, t8, t9);
    $[2] = t5;
    $[3] = t7;
    $[4] = t8;
    $[5] = t9;
    $[6] = t10;
  } else {
    t10 = $[6];
  }
  let t11;
  if ($[7] !== base || $[8] !== uploading || $[9] !== value) {
    t11 = uploading ? /* @__PURE__ */ React.createElement(Progress, { className: "srp-attachment__progress", size: "sm", value, "aria-labelledby": base + "-name" }) : null;
    $[7] = base;
    $[8] = uploading;
    $[9] = value;
    $[10] = t11;
  } else {
    t11 = $[10];
  }
  const t12 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__error", id: base + "-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), props.error === true ? L.fileError : props.error) : null;
  let t13;
  if ($[11] !== t10 || $[12] !== t11 || $[13] !== t12 || $[14] !== t4) {
    t13 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__body" }, t4, t10, t11, t12);
    $[11] = t10;
    $[12] = t11;
    $[13] = t12;
    $[14] = t4;
    $[15] = t13;
  } else {
    t13 = $[15];
  }
  const t14 = failed && props.onRetry ? /* @__PURE__ */ React.createElement(Button, { className: "srp-attachment__retry", variant: "ghost", size: "sm", disabled, onClick: props.onRetry, "aria-labelledby": base + "-retry " + base + "-name", "aria-describedby": base + "-error" }, /* @__PURE__ */ React.createElement("span", { id: base + "-retry" }, L.tryAgain)) : null;
  const t15 = props.onRemove ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-attachment__remove", icon: icons.Close, label: removeLabel(props.name), size: "sm", variant: "ghost", disabled, onClick: props.onRemove }) : null;
  let t16;
  if ($[16] !== kind || $[17] !== ref || $[18] !== rest || $[19] !== t1 || $[20] !== t13 || $[21] !== t14 || $[22] !== t15 || $[23] !== t3) {
    t16 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-component": t2, "data-kind": kind }, t3, t13, t14, t15);
    $[16] = kind;
    $[17] = ref;
    $[18] = rest;
    $[19] = t1;
    $[20] = t13;
    $[21] = t14;
    $[22] = t15;
    $[23] = t3;
    $[24] = t16;
  } else {
    t16 = $[24];
  }
  return t16;
}
var Attachment = /* @__PURE__ */ named("Attachment", AttachmentRender);
export {
  Attachment,
  attachmentKind
};
//# sourceMappingURL=Attachment.js.map
