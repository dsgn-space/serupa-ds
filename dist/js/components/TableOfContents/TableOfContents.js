"use client";

// src/components/TableOfContents/TableOfContents.tsx
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { en as words } from "./labels.js";
var slug = (text) => text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
var reduced = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var TableOfContents = /* @__PURE__ */ component("TableOfContents", function TableOfContents2(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { items: 1, container: 1, headings: 1, title: 1, offset: 1, className: 1 });
  const titleId = domId("dk-toc", React.useId()) + "-title";
  const offset = props.offset ?? 96;
  const [found, setFound] = React.useState([]);
  const items = props.items || found;
  const [current, setCurrent] = React.useState(null);
  const selector = props.headings || "h2, h3";
  const pinned = React.useRef(0);
  const styled = useServerStyles(ref);
  React.useEffect(() => {
    if (props.items) return;
    const box = typeof props.container === "string" ? document.querySelector(props.container) : props.container || document.querySelector("main") || document.body;
    if (!box) return;
    let last = "", frameId = 0, hashDone = false;
    const read = () => {
      frameId = 0;
      const used = /* @__PURE__ */ new Set();
      const next = [...box.querySelectorAll(selector)].filter((h) => !h.closest("[data-component='table-of-contents']")).map((h) => {
        if (!h.id) {
          const b = slug(h.textContent);
          let id = b, n = 2;
          while (document.getElementById(id) || used.has(id)) id = b + "-" + n++;
          h.id = id;
        }
        used.add(h.id);
        return { id: h.id, label: h.textContent, level: Number(h.tagName.slice(1)) || 2 };
      });
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setFound(next);
      }
      if (!hashDone) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const h = hash ? document.getElementById(hash) : null;
        if (!hash) hashDone = true;
        else if (h && used.has(hash)) {
          hashDone = true;
          h.scrollIntoView({ block: "start" });
        }
      }
    };
    read();
    const watch = new MutationObserver((list) => {
      const mine = (n) => {
        const e = n instanceof Element ? n : n.parentElement;
        return !!e && !!e.closest("[data-component='table-of-contents']");
      };
      if (frameId || list.every((m) => mine(m.target))) return;
      frameId = requestAnimationFrame(read);
    });
    watch.observe(box, { childList: true, subtree: true, characterData: true });
    return () => {
      watch.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [props.items, props.container, selector]);
  const ids = items.map((i) => i.id).join("\n");
  React.useEffect(() => {
    if (!ids) return;
    const list = ids.split("\n");
    let frame = 0;
    const scroller = () => {
      for (let e = document.getElementById(list[0])?.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
        const o = getComputedStyle(e).overflowY;
        if ((o === "auto" || o === "scroll" || o === "overlay") && e.scrollHeight > e.clientHeight) return e;
      }
      return null;
    };
    const update = () => {
      frame = 0;
      if (Date.now() < pinned.current) return;
      const pane = scroller(), top = pane ? pane.getBoundingClientRect().top : 0;
      let at = null;
      for (const id of list) {
        const h = document.getElementById(id);
        if (!h) continue;
        if (h.getBoundingClientRect().top - top - offset <= 1 || at == null) at = id;
        else break;
      }
      const bottom = pane ? pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (bottom) {
        const last = list[list.length - 1];
        if (last && document.getElementById(last)) at = last;
      }
      setCurrent(at);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onEnd = () => {
      pinned.current = 0;
    };
    update();
    const opts = { capture: true, passive: true };
    document.addEventListener("scroll", onScroll, opts);
    document.addEventListener("scrollend", onEnd, { capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll, opts);
      document.removeEventListener("scrollend", onEnd, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offset]);
  const go = (e, id) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const h = document.getElementById(id);
    if (!h) return;
    e.preventDefault();
    pinned.current = Date.now() + 1e3;
    h.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
    if (window.location.hash !== "#" + id) window.history.pushState(null, "", "#" + id);
    setCurrent(id);
  };
  const title = props.title === void 0 ? L.tocTitle : props.title;
  const minLevel = items.reduce((m, i) => Math.min(m, i.level ?? 2), 6);
  return /* @__PURE__ */ React.createElement(
    "nav",
    {
      ...rest,
      ref: styled,
      className: cn("dk-toc", props.className),
      "data-component": "table-of-contents",
      "aria-labelledby": props["aria-label"] || props["aria-labelledby"] || title == null ? props["aria-labelledby"] : titleId
    },
    title != null ? /* @__PURE__ */ React.createElement("p", { className: "dk-toc__title", id: titleId }, title) : null,
    /* @__PURE__ */ React.createElement("ul", { className: "dk-toc__list", role: "list" }, items.map((it) => /* @__PURE__ */ React.createElement("li", { key: it.id, className: "dk-toc__item", style: { "--dk-toc-depth": Math.max(0, (it.level ?? 2) - minLevel) } }, /* @__PURE__ */ React.createElement("a", { className: "dk-toc__link", href: "#" + it.id, "aria-current": current === it.id ? "location" : void 0, onClick: (e) => go(e, it.id) }, it.label))))
  );
});
export {
  TableOfContents
};
//# sourceMappingURL=TableOfContents.js.map
