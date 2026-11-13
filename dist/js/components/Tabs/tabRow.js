"use client";

// src/components/Tabs/tabRow.ts
import * as React from "react";
import { useIsoLayoutEffect } from "../../internal/cn.js";
var FROM = ["--dk-tabs-from-shift", "--dk-tabs-from-scale", "--dk-tabs-span-l", "--dk-tabs-span-r", "--dk-tabs-span-t", "--dk-tabs-span-b", "--dk-tabs-from-l", "--dk-tabs-from-r", "--dk-tabs-from-t", "--dk-tabs-from-b"];
var shown = (on) => {
  const nums = (v) => (v.match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
  let x = on.offsetLeft, y = on.offsetTop, w = on.offsetWidth, h = on.offsetHeight;
  const line = getComputedStyle(on, "::after"), fill = getComputedStyle(on, "::before");
  if (line.translate && line.translate !== "none") {
    const [dx = 0, dy = 0] = nums(line.translate);
    x += dx;
    y += dy;
  }
  if (line.scale && line.scale !== "none") {
    const [sx = 1, sy = sx] = nums(line.scale);
    w *= sx;
    h *= sy;
  }
  if (/^inset\(/.test(fill.clipPath)) {
    const [t = 0, r = t, b = t, l = r] = nums(fill.clipPath.split(" round")[0]);
    const span = (k) => parseFloat(on.style.getPropertyValue("--dk-tabs-span-" + k)) || 0;
    const left = x - span("l") + l, top = y - span("t") + t;
    w = x + w + span("r") - r - left;
    h = y + h + span("b") - b - top;
    x = left;
    y = top;
  }
  return { x, y, w, h };
};
var slideIfStill = (sel) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const running = (pseudo) => document.getAnimations().some((a) => {
    const e = a.effect;
    return !!e && e.target === sel && e.pseudoElement === pseudo;
  });
  const time = (cs) => ({ duration: (parseFloat(cs.transitionDuration) || 0) * (/ms$/.test(cs.transitionDuration.split(",")[0]) ? 1 : 1e3), easing: cs.transitionTimingFunction.split(/,(?![^(]*\))/)[0].trim() || "ease" });
  const shift = sel.style.getPropertyValue("--dk-tabs-from-shift");
  const line = getComputedStyle(sel, "::after"), fill = getComputedStyle(sel, "::before");
  if (shift && line.content !== "none" && time(line).duration > 0 && !running("::after")) {
    sel.animate({ translate: [shift, "none"], scale: [sel.style.getPropertyValue("--dk-tabs-from-scale") || "none", "none"] }, { ...time(line), pseudoElement: "::after" });
  }
  const from = ["t", "r", "b", "l"].map((k) => sel.style.getPropertyValue("--dk-tabs-from-" + k));
  if (from.every(Boolean) && fill.content !== "none" && /^inset\(/.test(fill.clipPath) && time(fill).duration > 0 && !running("::before")) {
    const round = fill.clipPath.includes(" round ") ? " round " + fill.clipPath.split(" round ")[1].replace(/\)$/, "") : "";
    sel.animate({ clipPath: [`inset(${from.join(" ")}${round})`, fill.clipPath] }, { ...time(fill), pseudoElement: "::before" });
  }
};
function useTabRow(tab, on, vertical, value) {
  const list = React.useRef(null);
  const [fade, setFade] = React.useState({ before: false, after: false });
  const own = React.useRef(null);
  const place = React.useCallback((now) => {
    const el = list.current;
    if (!el) return;
    const tabs = Array.from(el.querySelectorAll(tab));
    const sel = el.querySelector(on);
    const b = sel && (now ? shown(sel) : { x: sel.offsetLeft, y: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight });
    for (const t of tabs) {
      if (t === sel) continue;
      if (!b || !t.offsetWidth || !t.offsetHeight) {
        for (const k of FROM) t.style.removeProperty(k);
        continue;
      }
      const dx = b.x - t.offsetLeft, dy = b.y - t.offsetTop, w = t.offsetWidth, h = t.offsetHeight;
      t.style.setProperty("--dk-tabs-from-shift", dx + "px " + dy + "px");
      t.style.setProperty("--dk-tabs-from-scale", b.w / w + " " + b.h / h);
      const l = Math.max(0, -dx), r = Math.max(0, dx + b.w - w), u = Math.max(0, -dy), d = Math.max(0, dy + b.h - h);
      const set = (k, n) => t.style.setProperty(k, n + "px");
      set("--dk-tabs-span-l", l);
      set("--dk-tabs-span-r", r);
      set("--dk-tabs-span-t", u);
      set("--dk-tabs-span-b", d);
      set("--dk-tabs-from-l", l + dx);
      set("--dk-tabs-from-r", w + r - dx - b.w);
      set("--dk-tabs-from-t", u + dy);
      set("--dk-tabs-from-b", h + d - dy - b.h);
    }
  }, [tab, on]);
  const measure = React.useCallback(() => {
    const el = list.current;
    if (!el) return;
    place();
    const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    let at = vertical ? el.scrollTop : el.scrollLeft;
    if (!vertical && getComputedStyle(el).direction === "rtl") at = max + at;
    const next = { before: max > 1 && at > 1, after: max > 1 && at < max - 1 };
    setFade((f) => f.before === next.before && f.after === next.after ? f : next);
  }, [vertical, place]);
  useIsoLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    measure();
    const scrolled = () => {
      if ((vertical ? el.scrollTop : el.scrollLeft) !== own.current) el.setAttribute("data-scrolled", "");
      measure();
    };
    el.addEventListener("scroll", scrolled, { passive: true });
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (ro) {
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
    }
    return () => {
      el.removeEventListener("scroll", scrolled);
      if (ro) ro.disconnect();
    };
  }, [measure]);
  const reveal = React.useCallback((first) => {
    const el = list.current;
    const sel = el && value != null ? el.querySelector(on) : null;
    if (!el || !sel) return;
    const room = parseFloat(getComputedStyle(el).getPropertyValue("--dk-tabs-fade")) || 0;
    const box = el.getBoundingClientRect(), t = sel.getBoundingClientRect();
    if (vertical) {
      if (t.top < box.top + room) el.scrollTop -= box.top + room - t.top;
      else if (t.bottom > box.bottom - room) el.scrollTop += t.bottom - (box.bottom - room);
    } else if (t.left < box.left + room) el.scrollLeft -= box.left + room - t.left;
    else if (t.right > box.right - room) el.scrollLeft += t.right - (box.right - room);
    if (first && !el.hasAttribute("data-scrolled")) own.current = vertical ? el.scrollTop : el.scrollLeft;
    measure();
  }, [value, on, vertical, measure]);
  const mounting = React.useRef(true);
  useIsoLayoutEffect(() => {
    const sel = !mounting.current && list.current && value != null ? list.current.querySelector(on) : null;
    if (sel && typeof sel.animate === "function") slideIfStill(sel);
    reveal(mounting.current);
    mounting.current = false;
  }, [reveal]);
  React.useEffect(() => {
    const fonts = typeof document !== "undefined" ? document.fonts : void 0;
    if (!fonts || fonts.status === "loaded") return;
    let live = true;
    void fonts.ready.then(() => {
      if (live) reveal(true);
    });
    return () => {
      live = false;
    };
  }, [reveal]);
  return [list, fade, place];
}
export {
  useTabRow
};
//# sourceMappingURL=tabRow.js.map
