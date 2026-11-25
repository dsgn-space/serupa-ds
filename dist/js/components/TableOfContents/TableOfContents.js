"use client";

// src/components/TableOfContents/TableOfContents.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { reducedMotion as reduced } from "../../internal/mediaList.js";
import { named } from "../../internal/component.js";
import { pageHash } from "../../internal/hash.js";
import { useSettings } from "../../internal/provider.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { en as words } from "./labels.js";
var slug = (text) => text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
function TableOfContentsRender(t0) {
  const $ = _c(35);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const rest = omit(props, {
    items: 1,
    container: 1,
    headings: 1,
    title: 1,
    offset: 1,
    variant: 1,
    className: 1
  });
  const rail = props.variant === "rail";
  const titleId = domId("srp-toc", React.useId()) + "-title";
  const offset = props.offset ?? 96;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const [found, setFound] = React.useState(t1);
  const items = props.items || found;
  const [current, setCurrent] = React.useState(null);
  const selector = props.headings || "h2, h3";
  const pinned = React.useRef(0);
  const styled = useServerStyles(ref);
  React.useEffect(() => {
    if (props.items) {
      return;
    }
    const box = typeof props.container === "string" ? document.querySelector(props.container) : props.container || document.querySelector("main") || document.body;
    if (!box) {
      return;
    }
    let last = "";
    let frameId = 0;
    let hashDone = false;
    const read = () => {
      frameId = 0;
      const used = /* @__PURE__ */ new Set();
      const next = [...box.querySelectorAll(selector)].filter(_temp).map((h_0) => {
        if (!h_0.id) {
          const b = slug(h_0.textContent);
          let id = b;
          let n = 2;
          while (document.getElementById(id) || used.has(id)) {
            id = b + "-" + n++;
          }
          h_0.id = id;
        }
        used.add(h_0.id);
        return {
          id: h_0.id,
          label: h_0.textContent,
          level: Number(h_0.tagName.slice(1)) || 2
        };
      });
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setFound(next);
      }
      if (!hashDone) {
        const hash = pageHash();
        const h_1 = hash ? document.getElementById(hash) : null;
        if (!hash) {
          hashDone = true;
        } else {
          if (h_1 && used.has(hash)) {
            hashDone = true;
            h_1.scrollIntoView({
              block: "start"
            });
          }
        }
      }
    };
    read();
    const watch = new MutationObserver((list) => {
      const mine = _temp2;
      if (frameId || list.every((m) => mine(m.target))) {
        return;
      }
      frameId = requestAnimationFrame(read);
    });
    watch.observe(box, {
      childList: true,
      subtree: true,
      characterData: true
    });
    return () => {
      watch.disconnect();
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [props.items, props.container, selector]);
  const ids = items.map(_temp3).join("\n");
  React.useEffect(() => {
    if (!ids) {
      return;
    }
    const list_0 = ids.split("\n");
    let frame = 0;
    const scroller = () => {
      for (let e_0 = document.getElementById(list_0[0] ?? "")?.parentElement; e_0 && e_0 !== document.body && e_0 !== document.documentElement; e_0 = e_0.parentElement) {
        const o = getComputedStyle(e_0).overflowY;
        if ((o === "auto" || o === "scroll" || o === "overlay") && e_0.scrollHeight > e_0.clientHeight) {
          return e_0;
        }
      }
      return null;
    };
    const update = () => {
      frame = 0;
      if (Date.now() < pinned.current) {
        return;
      }
      const pane = scroller();
      const top = pane ? pane.getBoundingClientRect().top : 0;
      let at = null;
      for (const id_0 of list_0) {
        const h_2 = document.getElementById(id_0);
        if (!h_2) {
          continue;
        }
        if (h_2.getBoundingClientRect().top - top - offset <= 1 || at == null) {
          at = id_0;
        } else {
          break;
        }
      }
      const bottom = pane ? pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (bottom) {
        const last_0 = list_0[list_0.length - 1];
        if (last_0 && document.getElementById(last_0)) {
          at = last_0;
        }
      }
      setCurrent(at);
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    const onEnd = () => {
      pinned.current = 0;
    };
    update();
    const opts = {
      capture: true,
      passive: true
    };
    document.addEventListener("scroll", onScroll, opts);
    document.addEventListener("scrollend", onEnd, {
      capture: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll, opts);
      document.removeEventListener("scrollend", onEnd, {
        capture: true
      });
      window.removeEventListener("resize", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [ids, offset]);
  const go = (e_1, id_1) => {
    if (e_1.defaultPrevented || e_1.button !== 0 || e_1.metaKey || e_1.ctrlKey || e_1.shiftKey || e_1.altKey) {
      return;
    }
    const h_3 = document.getElementById(id_1);
    if (!h_3) {
      return;
    }
    e_1.preventDefault();
    pinned.current = Date.now() + 1e3;
    h_3.scrollIntoView({
      behavior: reduced(h_3) ? "auto" : "smooth",
      block: "start"
    });
    if (!h_3.hasAttribute("tabindex")) {
      h_3.setAttribute("tabindex", "-1");
    }
    h_3.focus({
      preventScroll: true
    });
    if (window.location.hash !== "#" + id_1) {
      window.history.pushState(null, "", "#" + id_1);
    }
    setCurrent(id_1);
  };
  const reveal = _temp4;
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const navEl = React.useRef(null);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = (n_1) => {
      navEl.current = n_1;
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const setNav = useMergedRef(styled, t2);
  let t3;
  if ($[2] !== open || $[3] !== setOpen) {
    t3 = () => {
      if (!open) {
        return;
      }
      const away = (e_3) => {
        if (navEl.current && !navEl.current.contains(e_3.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("pointerdown", away, true);
      return () => document.removeEventListener("pointerdown", away, true);
    };
    $[2] = open;
    $[3] = setOpen;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== open) {
    t4 = [open];
    $[5] = open;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  React.useEffect(t3, t4);
  const railHandlers = rail ? {
    onKeyDown: (e_4) => {
      if (props.onKeyDown) {
        props.onKeyDown(e_4);
      }
      if (e_4.key === "Escape" && !e_4.defaultPrevented && !dismissed) {
        setDismissed(true);
        setOpen(false);
      }
    },
    onPointerLeave: (e_5) => {
      if (props.onPointerLeave) {
        props.onPointerLeave(e_5);
      }
      if (e_5.pointerType === "mouse" && navEl.current && !navEl.current.contains(document.activeElement)) {
        setDismissed(false);
      }
    },
    onBlur: (e_6) => {
      if (props.onBlur) {
        props.onBlur(e_6);
      }
      if (!e_6.currentTarget.contains(e_6.relatedTarget)) {
        setDismissed(false);
        setOpen(false);
      }
    }
  } : null;
  const title = props.title === void 0 ? L.tocTitle : props.title;
  const minLevel = items.reduce(_temp5, 6);
  const t5 = "srp-toc__list";
  const t6 = "list";
  const t7 = items.map((it) => /* @__PURE__ */ React.createElement("li", { key: it.id, className: "srp-toc__item", style: {
    "--srp-toc-depth": Math.max(0, (it.level ?? 2) - minLevel)
  } }, /* @__PURE__ */ React.createElement("a", { className: "srp-toc__link", href: "#" + it.id, "aria-current": current === it.id ? "location" : void 0, onClick: (e_7) => {
    go(e_7, it.id);
    if (rail) {
      setOpen(false);
    }
  } }, it.label)));
  let t8;
  if ($[7] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("ul", { className: t5, role: t6 }, t7);
    $[7] = t7;
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  const list_1 = t8;
  let t9;
  if ($[9] !== title || $[10] !== titleId) {
    t9 = title != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-toc__title", id: titleId }, title) : null;
    $[9] = title;
    $[10] = titleId;
    $[11] = t9;
  } else {
    t9 = $[11];
  }
  const head = t9;
  const t10 = rail && "srp-toc--rail";
  let t11;
  if ($[12] !== props.className || $[13] !== t10) {
    t11 = cn("srp-toc", t10, props.className);
    $[12] = props.className;
    $[13] = t10;
    $[14] = t11;
  } else {
    t11 = $[14];
  }
  const t12 = rail ? "rail" : void 0;
  const t13 = rail && open ? "" : void 0;
  const t14 = rail && dismissed ? "" : void 0;
  const t15 = props["aria-label"] || props["aria-labelledby"] || title == null ? props["aria-labelledby"] : titleId;
  let t16;
  if ($[15] !== current || $[16] !== head || $[17] !== items || $[18] !== list_1 || $[19] !== minLevel || $[20] !== rail || $[21] !== reveal || $[22] !== setDismissed || $[23] !== setOpen) {
    t16 = rail ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-toc__rail", "aria-hidden": "true", onPointerDown: (e_8) => {
      if (e_8.pointerType !== "mouse") {
        setDismissed(false);
        setOpen(_temp6);
      }
    } }, items.map((it_0) => /* @__PURE__ */ React.createElement("span", { key: it_0.id, className: "srp-toc__dash", "data-current": current === it_0.id ? "" : void 0, style: {
      "--srp-toc-depth": Math.min(2, Math.max(0, (it_0.level ?? 2) - minLevel))
    } }))), /* @__PURE__ */ React.createElement("div", { className: "srp-toc__panel", onFocus: rail ? reveal : void 0 }, head, list_1)) : /* @__PURE__ */ React.createElement(React.Fragment, null, head, list_1);
    $[15] = current;
    $[16] = head;
    $[17] = items;
    $[18] = list_1;
    $[19] = minLevel;
    $[20] = rail;
    $[21] = reveal;
    $[22] = setDismissed;
    $[23] = setOpen;
    $[24] = t16;
  } else {
    t16 = $[24];
  }
  let t17;
  if ($[25] !== railHandlers || $[26] !== rest || $[27] !== setNav || $[28] !== t11 || $[29] !== t12 || $[30] !== t13 || $[31] !== t14 || $[32] !== t15 || $[33] !== t16) {
    t17 = /* @__PURE__ */ React.createElement("nav", { ...rest, ...railHandlers, ref: setNav, className: t11, "data-component": "table-of-contents", "data-variant": t12, "data-open": t13, "data-dismissed": t14, "aria-labelledby": t15 }, t16);
    $[25] = railHandlers;
    $[26] = rest;
    $[27] = setNav;
    $[28] = t11;
    $[29] = t12;
    $[30] = t13;
    $[31] = t14;
    $[32] = t15;
    $[33] = t16;
    $[34] = t17;
  } else {
    t17 = $[34];
  }
  return t17;
}
function _temp6(o_0) {
  return !o_0;
}
function _temp5(m_0, i_0) {
  return Math.min(m_0, i_0.level ?? 2);
}
function _temp4(e_2) {
  const p = e_2.currentTarget;
  const a = e_2.target.getBoundingClientRect();
  const r = p.getBoundingClientRect();
  const k = r.height / p.offsetHeight || 1;
  const top_0 = (a.top - r.top) / k - p.clientTop + p.scrollTop;
  const end = top_0 + a.height / k;
  if (top_0 < p.scrollTop) {
    p.scrollTop = top_0;
  } else {
    if (end > p.scrollTop + p.clientHeight) {
      p.scrollTop = end - p.clientHeight;
    }
  }
}
function _temp3(i) {
  return i.id;
}
function _temp2(n_0) {
  const e = n_0 instanceof Element ? n_0 : n_0.parentElement;
  return !!e && !!e.closest("[data-component='table-of-contents']");
}
function _temp(h) {
  return !h.closest("[data-component='table-of-contents']");
}
var TableOfContents = /* @__PURE__ */ named("TableOfContents", TableOfContentsRender);
export {
  TableOfContents
};
//# sourceMappingURL=TableOfContents.js.map
