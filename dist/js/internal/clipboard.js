"use client";

// src/internal/clipboard.ts
import * as React from "react";
import { deepActive } from "./root.js";
import { announce } from "./announce.js";
import { useSettings } from "./provider.js";
import { feedbackHold } from "./timing.js";
import { en as words } from "../components/CopyButton/labels.js";
async function writeText(text, at) {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      if (!fallback(text, at)) throw e;
      return;
    }
  }
  if (!fallback(text, at)) throw new Error("Copying isn't available here.");
}
function writeTextLater(text, at) {
  const clip = typeof navigator !== "undefined" ? navigator.clipboard : void 0;
  const after = () => text.then((t) => writeText(t, at).then(() => t));
  if (typeof ClipboardItem === "undefined" || !clip || !clip.write) return after();
  const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
  blob.catch(() => {
  });
  let item;
  try {
    item = new ClipboardItem({ "text/plain": blob });
  } catch {
    return after();
  }
  return clip.write([item]).then(() => text, after);
}
function fallback(text, at) {
  if (typeof document === "undefined") return false;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  ta.style.insetInlineStart = "-9999px";
  const back = deepActive();
  (at.closest("dialog") || document.body).appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  if (back && back.focus) back.focus();
  return ok;
}
function useCopyToClipboard(options) {
  const sds = useSettings(words);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState(void 0);
  const timer = React.useRef(null);
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const { copiedLabel, announce: speak, timeout } = options || {};
  const { copied: copiedWord, copyFailed } = sds.labels;
  const copy = React.useCallback(async (value) => {
    const say = speak !== false;
    const at = deepActive() || (typeof document !== "undefined" ? document.body : null);
    try {
      const got = typeof value === "function" ? value() : value;
      if (!at) throw new Error("Copying isn't available here.");
      if (typeof got === "string") await writeText(got, at);
      else await writeTextLater(Promise.resolve(got), at);
      setError(void 0);
      setCopied(true);
      if (say) announce(copiedLabel || copiedWord);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeout ?? feedbackHold);
      return true;
    } catch (err) {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      setCopied(false);
      setError(err);
      if (say) announce(copyFailed, { assertive: true });
      return false;
    }
  }, [speak, copiedLabel, timeout, copiedWord, copyFailed]);
  return { copy, copied, error };
}
export {
  useCopyToClipboard,
  writeText,
  writeTextLater
};
//# sourceMappingURL=clipboard.js.map
