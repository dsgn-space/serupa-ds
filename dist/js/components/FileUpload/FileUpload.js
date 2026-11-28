"use client";

// src/components/FileUpload/FileUpload.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, isInvalid, omit, useMergedRef } from "../../internal/cn.js";
import { Attachment } from "../Attachment/Attachment.js";
import { Button } from "../Button/Button.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { formatFileSize } from "../../internal/formatFileSize.js";
import { attachmentKind } from "../../internal/fileKind.js";
import { KIND_ICONS } from "../../internal/fileKindIcon.js";
import * as icons from "../../material/builtin.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { useFieldControl } from "../../internal/field.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { announce } from "../../internal/announce.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { en as fileWords } from "./labels.js";
import { en as boundary } from "../ErrorBoundary/labels.js";
import { en as progress } from "../Progress/labels.js";
import { useClipboardHandOn } from "../../internal/clipboardHandOn.js";
var words = /* @__PURE__ */ Object.assign({}, boundary, progress, fileWords);
var OWN = {
  files: 1,
  onFilesChange: 1,
  onReject: 1,
  accept: 1,
  multiple: 1,
  maxSize: 1,
  maxFiles: 1,
  disabled: 1,
  name: 1,
  form: 1,
  title: 1,
  buttonLabel: 1,
  hint: 1,
  removeLabel: 1,
  fileStatus: 1,
  onRetry: 1,
  thumbnails: 1,
  autoFocus: 1,
  className: 1,
  id: 1,
  "aria-describedby": 1,
  "aria-errormessage": 1,
  invalid: 1,
  required: 1,
  readOnly: 1,
  "aria-invalid": 1,
  "aria-required": 1,
  "aria-readonly": 1
};
var SAME_EXT = [[".jpg", ".jpeg", ".jpe", ".jfif"], [".tif", ".tiff"], [".htm", ".html"], [".mpg", ".mpeg"], [".yml", ".yaml"], [".mid", ".midi"]];
var SAME_TYPE = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "audio/mp3": "audio/mpeg",
  "image/x-png": "image/png"
};
var WILD_EXT = {
  "image/": [".png", ".jpg", ".jpeg", ".jpe", ".jfif", ".gif", ".webp", ".svg", ".avif", ".heic", ".heif", ".bmp", ".ico", ".tif", ".tiff"],
  "video/": [".mp4", ".m4v", ".mov", ".webm", ".ogv", ".mkv", ".avi", ".mpg", ".mpeg"],
  "audio/": [".mp3", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".flac", ".opus", ".weba", ".mid", ".midi"],
  "text/": [".txt", ".csv", ".tsv", ".md", ".json", ".xml", ".htm", ".html", ".css", ".js", ".yml", ".yaml"]
};
function accepts(file, accept) {
  if (!accept) return true;
  const name = file.name.toLowerCase(), type = (file.type || "").toLowerCase(), real = SAME_TYPE[type] || type;
  return accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).some((a) => a.startsWith(".") ? (SAME_EXT.find((g) => g.includes(a)) || [a]).some((e) => name.endsWith(e)) : a.endsWith("/*") ? type ? type.startsWith(a.slice(0, -1)) : (WILD_EXT[a.slice(0, -1)] ?? []).some((e) => name.endsWith(e)) : real === (SAME_TYPE[a] || a));
}
var KINDS = {
  image: "image",
  video: "video",
  audio: "audio file",
  text: "text file"
};
var SUBTYPES = {
  jpeg: "JPG",
  "svg+xml": "SVG",
  plain: "TXT",
  "x-icon": "ICO"
};
function acceptedTypes(accept) {
  const names = [];
  for (const a of accept.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)) {
    const [main = "", sub = ""] = a.split("/");
    const name = a.startsWith(".") ? a === ".jpeg" ? "JPG" : a.slice(1).toUpperCase() : sub === "*" ? KINDS[main] : SUBTYPES[sub] || (/^[a-z0-9]{2,5}$/.test(sub || "") ? sub.toUpperCase() : void 0);
    if (!name) return null;
    if (!names.includes(name)) names.push(name);
  }
  return names.length ? names : null;
}
var iconFor = (f) => KIND_ICONS[attachmentKind(f.name, f.type)];
var same = (a, b) => a.name === b.name && a.size === b.size && a.type === b.type;
function Thumbnail(t0) {
  const $ = _c(7);
  const {
    file,
    children
  } = t0;
  const canvas = React.useRef(null);
  const [broken, setBroken] = React.useState(null);
  let t1;
  let t2;
  if ($[0] !== file) {
    t1 = () => {
      const el = canvas.current;
      const ctx = el && el.getContext("2d");
      let live = true;
      (el && ctx && typeof createImageBitmap === "function" ? createImageBitmap(file) : Promise.reject(new Error("no canvas"))).then((bmp) => {
        if (live && el && ctx) {
          const side = el.clientWidth * (window.devicePixelRatio || 1) || 40;
          const k = Math.max(side / bmp.width, side / bmp.height);
          el.width = el.height = side;
          ctx.drawImage(bmp, (side - bmp.width * k) / 2, (side - bmp.height * k) / 2, bmp.width * k, bmp.height * k);
        }
        bmp.close();
      }, () => {
        if (live) {
          setBroken(file);
        }
      });
      return () => {
        live = false;
      };
    };
    t2 = [file];
    $[0] = file;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  React.useEffect(t1, t2);
  let t3;
  if ($[3] !== broken || $[4] !== children || $[5] !== file) {
    t3 = broken === file ? /* @__PURE__ */ React.createElement(React.Fragment, null, children) : /* @__PURE__ */ React.createElement("canvas", { ref: canvas, className: "srp-file-upload__thumbnail", "aria-hidden": true });
    $[3] = broken;
    $[4] = children;
    $[5] = file;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  return t3;
}
function FileUploadRender(t0) {
  const $ = _c(35);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
  const sds = useSettings(words);
  const locale = useLocale();
  props = useFieldControl(props);
  const rest = omit(props, OWN);
  const base = domId("srp-fu", React.useId());
  const inputId = props.id || base + "-input";
  const input = React.useRef(null);
  const chooser = React.useRef(null);
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => chooser.current;
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  const choose = t2;
  useAutoFocus(props.autoFocus, choose);
  const controlled = props.files !== void 0;
  let t3;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = [];
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  const [own, setOwn] = React.useState(t3);
  const files = controlled ? props.files : own;
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = [];
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const [rejected, setRejected] = React.useState(t4);
  const [tries, setTries] = React.useState(0);
  const [over, setOver] = React.useState(false);
  const depth = React.useRef(0);
  const multiple = !!props.multiple;
  const disabled = !!props.disabled;
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const readOnly = !disabled && !!(props.readOnly || props["aria-readonly"] === true || props["aria-readonly"] === "true");
  const still = disabled || readOnly;
  const off = () => still || !!input.current?.matches(":disabled");
  const required = props["aria-required"] != null ? props["aria-required"] === true || props["aria-required"] === "true" : !!props.required;
  const removeLabel = props.removeLabel || ((n) => sds.labels.remove + " " + n);
  const L = sds.labels;
  const [missing, setMissing] = React.useState(false);
  let t5;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = (e) => {
      if (!e.currentTarget.validity.valueMissing) {
        return;
      }
      e.preventDefault();
      setMissing(true);
      const form = e.currentTarget.form;
      const first = form ? Array.from(form.elements).find(_temp) : null;
      if ((!first || first === e.currentTarget) && chooser.current) {
        chooser.current.focus();
      }
    };
    $[3] = t5;
  } else {
    t5 = $[3];
  }
  const onInvalid = t5;
  const set = (next) => {
    if (next.length) {
      setMissing(false);
    }
    if (!controlled) {
      setOwn(next);
    }
    if (props.onFilesChange) {
      props.onFilesChange(next);
    }
  };
  const add = (list, folders) => {
    if (!list || off()) {
      return;
    }
    const incoming = Array.from(list);
    const ok = [];
    const bad = [];
    const limit = props.maxSize != null ? formatFileSize(props.maxSize, locale) : "";
    for (const f of incoming) {
      if (folders && folders.has(f)) {
        bad.push({
          file: f,
          reason: "folder",
          message: L.fileFolder(f.name)
        });
      } else {
        if (!accepts(f, props.accept)) {
          bad.push({
            file: f,
            reason: "type",
            message: L.fileWrongType(f.name, acceptedTypes(props.accept || ""))
          });
        } else {
          if (props.maxSize != null && f.size > props.maxSize) {
            bad.push({
              file: f,
              reason: "size",
              message: L.fileTooLarge(f.name, limit)
            });
          } else {
            ok.push(f);
          }
        }
      }
    }
    let next_0;
    if (!multiple) {
      next_0 = ok[0] ? [ok[0]] : files;
    } else {
      next_0 = files.slice();
      for (const f_0 of ok) {
        if (next_0.some((g) => same(f_0, g))) {
          bad.push({
            file: f_0,
            reason: "duplicate",
            message: L.fileAlreadyAdded(f_0.name)
          });
          continue;
        }
        if (props.maxFiles != null && next_0.length >= props.maxFiles) {
          bad.push({
            file: f_0,
            reason: "count",
            message: L.fileTooMany(f_0.name, props.maxFiles)
          });
          continue;
        }
        next_0.push(f_0);
      }
    }
    if (!multiple && ok.length > 1) {
      for (const f_1 of ok.slice(1)) {
        bad.push({
          file: f_1,
          reason: "count",
          message: L.fileOnlyOne(f_1.name)
        });
      }
    }
    setRejected(bad);
    if (bad.length) {
      setTries(_temp2);
    }
    if (bad.length && props.onReject) {
      props.onReject(bad);
    }
    if (next_0.length !== files.length || next_0.some((f_4, i) => f_4 !== files[i])) {
      set(next_0);
      const added = next_0.filter((f_2) => !files.includes(f_2));
      if (added.length) {
        announce(L.filesAdded(added.map(_temp3)));
      }
    } else {
      setSyncs(_temp4);
    }
  };
  const list_0 = React.useRef(null);
  const [refocus, setRefocus] = React.useState(null);
  const remove = (f_5) => {
    setRefocus(files.indexOf(f_5));
    set(files.filter((g_0) => g_0 !== f_5));
    setRejected([]);
    announce(L.fileRemoved(f_5.name));
  };
  let t6;
  if ($[4] !== refocus) {
    t6 = () => {
      if (refocus == null) {
        return;
      }
      setRefocus(null);
      const left = list_0.current ? list_0.current.querySelectorAll('li > [data-component="attachment"] > button:last-of-type') : [];
      const to = left.length ? left[Math.min(refocus, left.length - 1)] : chooser.current;
      if (to) {
        to.focus();
      }
    };
    $[4] = refocus;
    $[5] = t6;
  } else {
    t6 = $[5];
  }
  React.useEffect(t6, [refocus, files]);
  const statuses = files.map((f_6) => props.fileStatus && props.fileStatus(f_6) || null);
  const seen = React.useRef(null);
  React.useEffect(() => {
    const was = seen.current || (seen.current = /* @__PURE__ */ new WeakMap());
    files.forEach((f_7, i_0) => {
      const st = statuses[i_0];
      const now = st ? st.state : "";
      if (was.get(f_7) === "uploading" && now !== "uploading") {
        if (now === "done") {
          announce(L.progressComplete(f_7.name));
        } else {
          if (now === "error") {
            announce(f_7.name + ": " + L.fileError);
          }
        }
      }
      was.set(f_7, now);
    });
  });
  let t7;
  let t8;
  if ($[6] !== still) {
    t7 = () => {
      if (still) {
        return;
      }
      const stop = _temp5;
      document.addEventListener("dragover", stop);
      document.addEventListener("drop", stop);
      return () => {
        document.removeEventListener("dragover", stop);
        document.removeEventListener("drop", stop);
      };
    };
    t8 = [still];
    $[6] = still;
    $[7] = t7;
    $[8] = t8;
  } else {
    t7 = $[7];
    t8 = $[8];
  }
  React.useEffect(t7, t8);
  const [resets, setResets] = React.useState(0);
  const [syncs, t9] = React.useState(0);
  const setSyncs = t9;
  let t10;
  if ($[9] !== controlled) {
    t10 = () => {
      if (!controlled) {
        setOwn([]);
      }
      setRejected([]);
      setMissing(false);
      setResets(_temp6);
    };
    $[9] = controlled;
    $[10] = t10;
  } else {
    t10 = $[10];
  }
  useFormReset(input, t10, props.form);
  let t11;
  if ($[11] !== files || $[12] !== resets || $[13] !== syncs) {
    t11 = [files, resets, syncs];
    $[11] = files;
    $[12] = resets;
    $[13] = syncs;
    $[14] = t11;
  } else {
    t11 = $[14];
  }
  React.useEffect(() => {
    const i_1 = input.current;
    if (!i_1 || typeof DataTransfer === "undefined") {
      return;
    }
    try {
      const dt = new DataTransfer();
      files.forEach((f_8) => dt.items.add(f_8));
      i_1.files = dt.files;
    } catch {
    }
  }, t11);
  const hasFiles = _temp7;
  const drag = {
    onDragEnter: (e_2) => {
      if (off() || !hasFiles(e_2)) {
        return;
      }
      e_2.preventDefault();
      depth.current = depth.current + 1;
      setOver(true);
    },
    onDragOver: (e_3) => {
      if (off() || !hasFiles(e_3)) {
        return;
      }
      e_3.preventDefault();
      e_3.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e_4) => {
      if (off() || !hasFiles(e_4)) {
        return;
      }
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) {
        setOver(false);
      }
    },
    onDrop: (e_5) => {
      if (off() || !hasFiles(e_5)) {
        return;
      }
      e_5.preventDefault();
      depth.current = 0;
      setOver(false);
      const dropped = Array.from(e_5.dataTransfer.files);
      const items = Array.from(e_5.dataTransfer.items || []).filter(_temp8);
      const folders_0 = /* @__PURE__ */ new Set();
      items.forEach((it_0, i_2) => {
        const entry = typeof it_0.webkitGetAsEntry === "function" ? it_0.webkitGetAsEntry() : null;
        if (entry && entry.isDirectory && dropped[i_2]) {
          folders_0.add(dropped[i_2]);
        }
      });
      add(dropped, folders_0);
    }
  };
  const onPaste = (e_6) => {
    if (rest.onPaste) {
      rest.onPaste(e_6);
    }
    const pasted = e_6.clipboardData ? Array.from(e_6.clipboardData.files || []) : [];
    if (e_6.defaultPrevented || off() || !pasted.length) {
      return;
    }
    e_6.preventDefault();
    add(pasted);
  };
  const hasHint = props.hint != null && props.hint !== "";
  const fieldLabel = useFieldLabel(inputId);
  const errorId = invalid ? props["aria-errormessage"] : void 0;
  const given = props["aria-describedby"];
  const errorMessage = errorId && !(given || "").split(/\s+/).includes(errorId) ? errorId : void 0;
  const describedIds = cn(required && base + "-req", given, errorMessage, hasHint && base + "-hint", missing && base + "-missing");
  const described = describedIds || void 0;
  const root = React.useRef(null);
  useClipboardHandOn(root);
  let t12;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (n_3) => {
      root.current = n_3;
      delegateFocus(n_3, choose);
    };
    $[15] = t12;
  } else {
    t12 = $[15];
  }
  const mergedRef = useMergedRef(ref, t12);
  const t13 = cn("srp-file-upload", disabled && "srp-file-upload--disabled", readOnly && "srp-file-upload--readonly", (invalid || missing) && "srp-file-upload--invalid", props.className);
  const t14 = over && "srp-file-upload__zone--over";
  let t15;
  if ($[16] !== t14) {
    t15 = cn("srp-file-upload__zone", t14);
    $[16] = t14;
    $[17] = t15;
  } else {
    t15 = $[17];
  }
  let t16;
  if ($[18] !== still) {
    t16 = (e_7) => {
      if (!still && input.current && !(e_7.target instanceof Element && e_7.target.closest("button, input"))) {
        input.current.click();
      }
    };
    $[18] = still;
    $[19] = t16;
  } else {
    t16 = $[19];
  }
  let t17;
  if ($[20] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t17 = /* @__PURE__ */ React.createElement(Icon, { icon: icons.UploadFile, className: "srp-file-upload__icon" });
    $[20] = t17;
  } else {
    t17 = $[20];
  }
  let t18;
  if ($[21] !== readOnly) {
    t18 = () => {
      if (!readOnly && input.current) {
        input.current.click();
      }
    };
    $[21] = readOnly;
    $[22] = t18;
  } else {
    t18 = $[22];
  }
  let t19;
  if ($[23] !== base || $[24] !== required || $[25] !== sds.labels) {
    t19 = required ? /* @__PURE__ */ React.createElement("span", { className: "srp-file-upload__required", id: base + "-req" }, sds.labels.required) : null;
    $[23] = base;
    $[24] = required;
    $[25] = sds.labels;
    $[26] = t19;
  } else {
    t19 = $[26];
  }
  let t20;
  if ($[27] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = () => {
      const b = chooser.current;
      if (b && !b.disabled) {
        b.focus();
      }
    };
    $[27] = t20;
  } else {
    t20 = $[27];
  }
  let t21;
  if ($[28] !== L || $[29] !== base || $[30] !== missing || $[31] !== multiple || $[32] !== rejected || $[33] !== tries) {
    t21 = rejected.length || missing ? /* @__PURE__ */ React.createElement("div", { key: tries, className: "srp-file-upload__errors", role: "alert" }, missing ? /* @__PURE__ */ React.createElement("p", { className: "srp-file-upload__error", id: base + "-missing" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), L.fileMissing(multiple)) : null, rejected.map(_temp9)) : null;
    $[28] = L;
    $[29] = base;
    $[30] = missing;
    $[31] = multiple;
    $[32] = rejected;
    $[33] = tries;
    $[34] = t21;
  } else {
    t21 = $[34];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, onPaste, ref: mergedRef, "aria-disabled": disabled || void 0, className: t13, "data-disabled": disabled ? "" : void 0, "data-readonly": readOnly ? "" : void 0, "data-invalid": invalid || missing ? "" : void 0, "data-component": "file-upload" }, /* @__PURE__ */ React.createElement("div", { className: t15, "data-over": over ? "" : void 0, "data-dragging": over ? "" : void 0, role: "presentation", ...drag, onClick: t16 }, t17, /* @__PURE__ */ React.createElement("p", { className: "srp-file-upload__title" }, props.title ?? (multiple ? sds.labels.dragFiles : sds.labels.dragFile)), /* @__PURE__ */ React.createElement(Button, { ref: chooser, variant: "outline", size: "sm", disabled, onClick: t18, "aria-disabled": readOnly || void 0, "aria-labelledby": fieldLabel ? fieldLabel + " " + base + "-choose" : void 0, "aria-describedby": described }, /* @__PURE__ */ React.createElement("span", { id: base + "-choose" }, props.buttonLabel || (multiple ? sds.labels.chooseFiles : sds.labels.chooseFile))), t19, hasHint ? /* @__PURE__ */ React.createElement("p", { className: "srp-file-upload__hint", id: base + "-hint" }, props.hint) : null, /* @__PURE__ */ React.createElement("input", { ref: input, id: inputId, type: "file", className: "srp-file-upload__input", tabIndex: -1, "aria-hidden": true, name: props.name, form: props.form, accept: props.accept, multiple, disabled, required: props.required, "aria-invalid": invalid || missing || void 0, onChange: (e_8) => {
    add(e_8.target.files);
  }, onInvalid, onFocus: t20 })), t21, files.length ? /* @__PURE__ */ React.createElement("ul", { ref: list_0, role: "list", className: "srp-file-upload__list", "aria-label": multiple ? sds.labels.chosenFiles : sds.labels.chosenFile }, files.map((f_9, i_4) => {
    const st_0 = statuses[i_4];
    const failed = !!st_0 && st_0.state === "error";
    return /* @__PURE__ */ React.createElement("li", { key: f_9.name + f_9.size + f_9.lastModified + i_4, className: "srp-file-upload__item" }, /* @__PURE__ */ React.createElement(Attachment, { name: f_9.name, bytes: f_9.size, type: f_9.type, disabled, thumbnail: props.thumbnails && /^image\//.test(f_9.type) ? /* @__PURE__ */ React.createElement(Thumbnail, { file: f_9 }, /* @__PURE__ */ React.createElement(Icon, { icon: iconFor(f_9) })) : void 0, progress: st_0 && st_0.state === "uploading" ? typeof st_0.progress === "number" ? st_0.progress : null : void 0, done: !!st_0 && st_0.state === "done", error: failed ? st_0.message ?? true : void 0, onRetry: failed && props.onRetry && !still ? () => props.onRetry(f_9) : void 0, onRemove: readOnly ? void 0 : () => remove(f_9), removeLabel }));
  })) : null);
}
function _temp9(r, i_3) {
  return /* @__PURE__ */ React.createElement("p", { key: i_3, className: "srp-file-upload__error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), r.message);
}
function _temp8(it) {
  return it.kind === "file";
}
function _temp7(e_1) {
  return Array.from(e_1.dataTransfer.types || []).includes("Files");
}
function _temp6(n_2) {
  return n_2 + 1;
}
function _temp5(e_0) {
  if (e_0.defaultPrevented || !e_0.dataTransfer || !Array.from(e_0.dataTransfer.types || []).includes("Files")) {
    return;
  }
  e_0.preventDefault();
  if (e_0.type === "dragover") {
    e_0.dataTransfer.dropEffect = "none";
  }
}
function _temp4(n_1) {
  return n_1 + 1;
}
function _temp3(f_3) {
  return f_3.name;
}
function _temp2(n_0) {
  return n_0 + 1;
}
function _temp(x) {
  return x.willValidate && !x.validity.valid;
}
var FileUpload = /* @__PURE__ */ named("FileUpload", FileUploadRender);
export {
  FileUpload,
  formatFileSize
};
//# sourceMappingURL=FileUpload.js.map
