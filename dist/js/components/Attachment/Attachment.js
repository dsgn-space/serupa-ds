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
  const t2 = failed ? "" : void 0;
  const t3 = "attachment";
  const t4 = props.thumbnail != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__thumbnail" }, props.thumbnail) : /* @__PURE__ */ React.createElement(Icon, { icon: ICONS[kind], className: "srp-attachment__icon" });
  const t5 = props.href && !disabled ? /* @__PURE__ */ React.createElement("a", { className: "srp-attachment__name", href: props.href, download: props.download === true ? "" : props.download || void 0, "aria-describedby": cn(base + "-meta", failed && base + "-error") }, name) : /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__name" }, name);
  const t6 = base + "-meta";
  const t7 = L[WORD[kind]];
  let t8;
  if ($[0] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__kind" }, t7);
    $[0] = t7;
    $[1] = t8;
  } else {
    t8 = $[1];
  }
  const t9 = size ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__size" }, size) : null;
  const t10 = props.done && !failed && !uploading ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__done" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.CheckCircle }), L.progressComplete("")) : null;
  let t11;
  if ($[2] !== t10 || $[3] !== t6 || $[4] !== t8 || $[5] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__meta", id: t6, dir: "auto" }, t8, t9, t10);
    $[2] = t10;
    $[3] = t6;
    $[4] = t8;
    $[5] = t9;
    $[6] = t11;
  } else {
    t11 = $[6];
  }
  let t12;
  if ($[7] !== base || $[8] !== uploading || $[9] !== value) {
    t12 = uploading ? /* @__PURE__ */ React.createElement(Progress, { className: "srp-attachment__progress", size: "sm", value, "aria-labelledby": base + "-name" }) : null;
    $[7] = base;
    $[8] = uploading;
    $[9] = value;
    $[10] = t12;
  } else {
    t12 = $[10];
  }
  const t13 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__error", id: base + "-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), props.error === true ? L.fileError : props.error) : null;
  let t14;
  if ($[11] !== t11 || $[12] !== t12 || $[13] !== t13 || $[14] !== t5) {
    t14 = /* @__PURE__ */ React.createElement("span", { className: "srp-attachment__body" }, t5, t11, t12, t13);
    $[11] = t11;
    $[12] = t12;
    $[13] = t13;
    $[14] = t5;
    $[15] = t14;
  } else {
    t14 = $[15];
  }
  const t15 = failed && props.onRetry ? /* @__PURE__ */ React.createElement(Button, { className: "srp-attachment__retry", variant: "ghost", size: "sm", disabled, onClick: props.onRetry, "aria-labelledby": base + "-retry " + base + "-name", "aria-describedby": base + "-error" }, /* @__PURE__ */ React.createElement("span", { id: base + "-retry" }, L.tryAgain)) : null;
  const t16 = props.onRemove ? /* @__PURE__ */ React.createElement(IconButton, { className: "srp-attachment__remove", icon: icons.Close, label: removeLabel(props.name), size: "sm", variant: "ghost", disabled, onClick: props.onRemove }) : null;
  let t17;
  if ($[16] !== kind || $[17] !== ref || $[18] !== rest || $[19] !== t1 || $[20] !== t14 || $[21] !== t15 || $[22] !== t16 || $[23] !== t2 || $[24] !== t4) {
    t17 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-error": t2, "data-component": t3, "data-kind": kind }, t4, t14, t15, t16);
    $[16] = kind;
    $[17] = ref;
    $[18] = rest;
    $[19] = t1;
    $[20] = t14;
    $[21] = t15;
    $[22] = t16;
    $[23] = t2;
    $[24] = t4;
    $[25] = t17;
  } else {
    t17 = $[25];
  }
  return t17;
}
var Attachment = /* @__PURE__ */ named("Attachment", AttachmentRender);
export {
  Attachment,
  attachmentKind
};
//# sourceMappingURL=Attachment.js.map
