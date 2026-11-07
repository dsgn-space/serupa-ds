"use client";

// src/components/Attachment/Attachment.tsx
import * as React from "react";
import { cn, domId, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { Progress } from "../Progress/Progress.js";
import { formatFileSize } from "../FileUpload/formatFileSize.js";
import * as icons from "../../material/builtin.js";
import { attachmentKind } from "./attachmentKind.js";
import { en as ownWords } from "./labels.js";
import { en as fileWords } from "../FileUpload/labels.js";
import { en as boundary } from "../ErrorBoundary/labels.js";
import { graphemes } from "../../internal/graphemes.js";
var words = /* @__PURE__ */ Object.assign({}, boundary, fileWords, ownWords);
var OWN = { name: 1, bytes: 1, type: 1, kind: 1, href: 1, download: 1, progress: 1, error: 1, onRetry: 1, onRemove: 1, removeLabel: 1, disabled: 1, className: 1 };
var ICONS = {
  pdf: icons.PictureAsPdf,
  image: icons.Image,
  sheet: icons.TableChart,
  doc: icons.Description,
  slides: icons.Slideshow,
  archive: icons.FolderZip,
  code: icons.Code,
  audio: icons.AudioFile,
  video: icons.Movie,
  other: icons.Draft
};
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
var JOINS = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}]/u;
var LETTER = /[\p{L}\p{M}]/u;
function nameCut(chars, ext) {
  let at = Math.max(0, chars.length - Math.min(chars.length, Math.min(ext, 10) + 6));
  if (at > 0 && JOINS.test(chars[at - 1]) && JOINS.test(chars[at])) {
    while (at > 0 && LETTER.test(chars[at - 1])) at--;
  }
  return at;
}
function FileName({ name, id }) {
  const [el, setEl] = React.useState(null);
  const [cut, setCut] = React.useState(false);
  React.useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => {
      const part = el.firstElementChild;
      if (part instanceof HTMLElement) setCut(part.scrollWidth > part.clientWidth + 1);
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    check();
    return () => ro.disconnect();
  }, [el, name, cut]);
  const chars = cut ? graphemes(name) : [], dot = name.lastIndexOf(".");
  const at = cut ? nameCut(chars, dot > 0 ? graphemes(name.slice(dot)).length : 0) : 0;
  return /* @__PURE__ */ React.createElement("span", { ref: setEl, className: "dk-attachment__name-text", dir: "auto", title: name }, cut && at > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__name-start", "aria-hidden": true }, chars.slice(0, at).join("")), /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__name-end", "aria-hidden": true }, chars.slice(at).join(""))) : /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__name-start", "aria-hidden": true }, name), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden", id }, name));
}
var Attachment = /* @__PURE__ */ component("Attachment", function Attachment2(props, ref) {
  const sds = useSettings(words), locale = useLocale(), L = sds.labels;
  const rest = omit(props, OWN);
  const base = domId("dk-at", React.useId());
  const kind = props.kind || attachmentKind(props.name, props.type);
  const disabled = !!props.disabled;
  const failed = props.error != null && props.error !== false && props.error !== "";
  const uploading = props.progress !== void 0 && !failed;
  const size = props.bytes != null ? formatFileSize(props.bytes, locale) : "";
  const value = typeof props.progress === "number" && isFinite(props.progress) ? Math.min(100, Math.max(0, props.progress)) : null;
  const name = /* @__PURE__ */ React.createElement(FileName, { name: props.name, id: base + "-name" });
  const removeLabel = props.removeLabel || ((n) => L.remove + " " + n);
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: (n) => setRef(ref, n), className: cn("dk-attachment", failed && "dk-attachment--error", uploading && "dk-attachment--uploading", disabled && "dk-attachment--disabled", props.className), "data-component": "attachment", "data-kind": kind }, /* @__PURE__ */ React.createElement(Icon, { icon: ICONS[kind], className: "dk-attachment__icon" }), /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__body" }, props.href && !disabled ? /* @__PURE__ */ React.createElement("a", { className: "dk-attachment__name", href: props.href, download: props.download === true ? "" : props.download || void 0, "aria-describedby": cn(base + "-meta", failed && base + "-error") }, name) : /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__name" }, name), /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__meta", id: base + "-meta", dir: "auto" }, /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__kind" }, L[WORD[kind]]), size ? /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__size" }, size) : null), uploading ? /* @__PURE__ */ React.createElement(Progress, { className: "dk-attachment__progress", size: "sm", value, "aria-labelledby": base + "-name" }) : null, failed ? /* @__PURE__ */ React.createElement("span", { className: "dk-attachment__error", id: base + "-error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), props.error === true ? L.fileError : props.error) : null), failed && props.onRetry ? /* @__PURE__ */ React.createElement(Button, { className: "dk-attachment__retry", variant: "ghost", size: "sm", disabled, onClick: props.onRetry, "aria-labelledby": base + "-retry " + base + "-name", "aria-describedby": base + "-error" }, /* @__PURE__ */ React.createElement("span", { id: base + "-retry" }, L.tryAgain)) : null, props.onRemove ? /* @__PURE__ */ React.createElement(IconButton, { className: "dk-attachment__remove", icon: icons.Close, label: removeLabel(props.name), size: "sm", variant: "ghost", disabled, onClick: props.onRemove }) : null);
});
export {
  Attachment,
  attachmentKind
};
//# sourceMappingURL=Attachment.js.map
