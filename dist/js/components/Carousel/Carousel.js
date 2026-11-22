"use client";

// src/components/Carousel/Carousel.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { useBreakpoint } from "../../internal/media.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { Icon } from "../Icon/Icon.js";
import { IconButton } from "../IconButton/IconButton.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { flattenChildren } from "../../internal/children.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { en as words } from "./labels.js";
import { project, speed, track as sample } from "../../internal/fling.js";
import { useControllable } from "../../internal/controllable.js";
var WIDTHS = [["sm", 640], ["md", 768], ["lg", 1024]];
var whole = (n) => Math.max(1, Math.floor(Number(n)) || 1);
function perAt(per, count) {
  if (per == null || typeof per !== "object") return null;
  const cap = Math.max(1, count), out = {
    base: Math.min(whole(per.base), cap)
  };
  let n = out.base;
  for (const [k] of WIDTHS) {
    if (per[k] != null) n = Math.min(whole(per[k]), cap);
    out[k] = n;
  }
  return out;
}
function usePerView(per) {
  const $ = _c(11);
  const map = per != null && typeof per === "object" ? per : null;
  const t0 = useBreakpoint("sm");
  const t1 = useBreakpoint("md");
  const t2 = useBreakpoint("lg");
  let t3;
  if ($[0] !== t0 || $[1] !== t1 || $[2] !== t2) {
    t3 = {
      sm: t0,
      md: t1,
      lg: t2
    };
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const at = t3;
  if (!map) {
    let t42;
    if ($[4] !== per) {
      t42 = whole(per);
      $[4] = per;
      $[5] = t42;
    } else {
      t42 = $[5];
    }
    return t42;
  }
  let t4;
  if ($[6] !== map.base) {
    t4 = whole(map.base);
    $[6] = map.base;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let n = t4;
  if ($[8] !== at || $[9] !== map) {
    for (const [k] of WIDTHS) {
      if (map[k] != null && at[k]) {
        n = whole(map[k]);
      }
    }
    $[8] = at;
    $[9] = map;
    $[10] = n;
  } else {
    n = $[10];
  }
  return n;
}
var OWN = {
  children: 1,
  index: 1,
  defaultIndex: 1,
  onIndexChange: 1,
  loop: 1,
  arrows: 1,
  dots: 1,
  previousLabel: 1,
  nextLabel: 1,
  slideLabel: 1,
  perView: 1,
  peek: 1,
  className: 1,
  style: 1
};
var SWIPE = 40;
var FLICK = 0.3;
var QUIET = 120;
function CarouselRender(t0) {
  const $ = _c(36);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Carousel", NAME_HOW.label);
  const restyle = useServerStyles(ref);
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const slides = flattenChildren(props.children);
  const count = slides.length;
  const per = Math.min(usePerView(props.perView), Math.max(1, count));
  const perMap = perAt(props.perView, count);
  const last = Math.max(0, count - per);
  let t1;
  if ($[0] !== last) {
    t1 = (i) => Math.min(Math.max(0, Math.floor(i) || 0), last);
    $[0] = last;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const clamp = t1;
  const [held, setOwn, controlled] = useControllable(props.index == null ? void 0 : props.index, props.defaultIndex || 0, "Carousel", "index");
  const index = clamp(held);
  const loop = !!props.loop && last > 0;
  const pages = Math.ceil(count / per);
  const page = index >= last ? pages - 1 : Math.floor(index / per);
  let t2;
  if ($[2] !== last || $[3] !== per) {
    t2 = (k) => Math.min(k * per, last);
    $[2] = last;
    $[3] = per;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  const pageStart = t2;
  const dotName = (k_0) => per > 1 ? sds.labels.slidesOf(pageStart(k_0) + 1, pageStart(k_0) + per, count) : name(k_0, count);
  const name = props.slideLabel || ((i_0, n) => sds.labels.slideOf(i_0 + 1, n));
  const dotsRef = React.useRef(null);
  const viewport = React.useRef(null);
  const track = React.useRef(null);
  const drag = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const dragged = React.useRef(false);
  const prevBtn = React.useRef(null);
  const nextBtn = React.useRef(null);
  const refocus = React.useRef(null);
  const [live, setLive] = React.useState(false);
  let t3;
  let t4;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      setLive(true);
    };
    t4 = [];
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  useIsoLayoutEffect(t3, t4);
  const [recheck, setRecheck] = React.useState(0);
  const heading = React.useRef(null);
  const go = (i_1) => {
    const next = loop ? (i_1 % (last + 1) + last + 1) % (last + 1) : clamp(i_1);
    if (next === index) {
      return;
    }
    if (!controlled) {
      setOwn(next);
    }
    if (props.onIndexChange) {
      props.onIndexChange(next);
    }
  };
  let t5;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => !!viewport.current && getComputedStyle(viewport.current).direction === "rtl";
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const rtl = t5;
  const [dir, setDir] = React.useState("ltr");
  let t6;
  if ($[8] !== dir) {
    t6 = () => {
      const d = rtl() ? "rtl" : "ltr";
      if (d !== dir) {
        setDir(d);
      }
    };
    $[8] = dir;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  useIsoLayoutEffect(t6);
  const delta = (i_2) => {
    const v = viewport.current;
    const s = track.current?.children[i_2];
    if (!v || !s) {
      return 0;
    }
    const vr = v.getBoundingClientRect();
    const sr = s.getBoundingClientRect();
    return rtl() ? sr.right - vr.right : sr.left - vr.left;
  };
  const scrolledTo = () => {
    const v_0 = viewport.current;
    if (!v_0 || last < 1) {
      return index;
    }
    if (Math.abs(v_0.scrollLeft) >= v_0.scrollWidth - v_0.clientWidth - 1) {
      return last;
    }
    let best = 0;
    let near = Infinity;
    for (let i_3 = 0; i_3 <= last; i_3++) {
      const d_0 = Math.abs(delta(i_3));
      if (d_0 < near) {
        near = d_0;
        best = i_3;
      }
    }
    return best;
  };
  const latest = React.useRef({
    index,
    go,
    scrolledTo,
    controlled
  });
  React.useInsertionEffect(function() {
    latest.current = {
      index,
      go,
      scrolledTo,
      controlled
    };
  });
  let t7;
  if ($[10] !== last) {
    t7 = [last];
    $[10] = last;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  useIsoLayoutEffect(() => {
    const v_1 = viewport.current;
    if (!v_1 || last < 1) {
      return;
    }
    let quiet = 0;
    const settled = () => {
      window.clearTimeout(quiet);
      if (drag.current) {
        return;
      }
      const l = latest.current;
      const n_0 = l.scrolledTo();
      if (heading.current != null) {
        if (n_0 === heading.current) {
          heading.current = null;
        }
        return;
      }
      if (n_0 === l.index) {
        return;
      }
      l.go(n_0);
      l.index = n_0;
      if (l.controlled) {
        setRecheck(_temp);
      }
    };
    const onScroll = () => {
      window.clearTimeout(quiet);
      quiet = window.setTimeout(settled, QUIET);
    };
    const mine = () => {
      heading.current = null;
    };
    v_1.addEventListener("scroll", onScroll, {
      passive: true
    });
    v_1.addEventListener("scrollend", settled);
    v_1.addEventListener("scrollsnapchange", settled);
    v_1.addEventListener("pointerdown", mine);
    v_1.addEventListener("wheel", mine, {
      passive: true
    });
    return () => {
      v_1.removeEventListener("pointerdown", mine);
      v_1.removeEventListener("wheel", mine);
      v_1.removeEventListener("scroll", onScroll);
      v_1.removeEventListener("scrollend", settled);
      v_1.removeEventListener("scrollsnapchange", settled);
      window.clearTimeout(quiet);
    };
  }, t7);
  const first = React.useRef(true);
  let t8;
  if ($[12] !== count || $[13] !== dragging || $[14] !== index || $[15] !== per || $[16] !== recheck) {
    t8 = [index, recheck, per, count, dragging];
    $[12] = count;
    $[13] = dragging;
    $[14] = index;
    $[15] = per;
    $[16] = recheck;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  useIsoLayoutEffect(() => {
    const v_2 = viewport.current;
    const at = first.current;
    first.current = false;
    if (!v_2 || dragging) {
      return;
    }
    const max = v_2.scrollWidth - v_2.clientWidth;
    const to = Math.min(rtl() ? 0 : max, Math.max(rtl() ? -max : 0, v_2.scrollLeft + delta(index)));
    if (Math.abs(to - v_2.scrollLeft) < 1) {
      return;
    }
    heading.current = at ? null : index;
    v_2.scrollTo({
      left: to,
      behavior: at ? "instant" : "auto"
    });
  }, t8);
  const onDotsKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const back = rtl() ? "ArrowRight" : "ArrowLeft";
    const fwd = rtl() ? "ArrowLeft" : "ArrowRight";
    let to_0;
    if (e.key === back) {
      to_0 = loop ? page - 1 : Math.max(0, page - 1);
    } else {
      if (e.key === fwd) {
        to_0 = loop ? page + 1 : Math.min(pages - 1, page + 1);
      } else {
        if (e.key === "Home") {
          to_0 = 0;
        } else {
          if (e.key === "End") {
            to_0 = pages - 1;
          } else {
            return;
          }
        }
      }
    }
    e.preventDefault();
    to_0 = (to_0 % pages + pages) % pages;
    refocus.current = "dot";
    go(pageStart(to_0));
  };
  const arrow = (step) => {
    const to_1 = index + step;
    if (!loop && (to_1 <= 0 || to_1 >= last)) {
      refocus.current = step > 0 ? "prev" : "next";
    }
    go(to_1);
  };
  let t9;
  if ($[18] !== page) {
    t9 = () => {
      const r = refocus.current;
      refocus.current = null;
      if (r === "dot") {
        dotsRef.current?.children[page]?.focus();
      } else {
        if (r) {
          const a = activeIn(viewport.current);
          if (!a || a === prevBtn.current || a === nextBtn.current || a === document.body) {
            (r === "prev" ? prevBtn : nextBtn).current?.focus();
          }
        }
      }
    };
    $[18] = page;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  useIsoLayoutEffect(t9);
  let t10;
  if ($[20] !== last) {
    t10 = (e_0) => {
      if (last < 1 || e_0.pointerType !== "mouse" || e_0.button !== 0 || !viewport.current) {
        return;
      }
      drag.current = {
        x: e_0.clientX,
        from: viewport.current.scrollLeft,
        id: e_0.pointerId,
        s: [{
          t: e_0.timeStamp,
          p: e_0.clientX
        }]
      };
      dragged.current = false;
    };
    $[20] = last;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  const onPointerDown = t10;
  let t11;
  if ($[22] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = (e_1) => {
      const d_1 = drag.current;
      const v_3 = viewport.current;
      if (!d_1 || d_1.id !== e_1.pointerId || !v_3) {
        return;
      }
      const dx = e_1.clientX - d_1.x;
      if (!dragged.current && Math.abs(dx) < 8) {
        return;
      }
      if (!dragged.current) {
        dragged.current = true;
        v_3.setAttribute("data-dragging", "");
        setDragging(true);
        try {
          v_3.setPointerCapture(e_1.pointerId);
        } catch {
        }
      }
      sample(d_1.s, e_1.timeStamp, e_1.clientX);
      v_3.scrollLeft = d_1.from - dx;
    };
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  const onPointerMove = t11;
  const onPointerEnd = (e_2) => {
    const d_2 = drag.current;
    if (!d_2 || d_2.id !== e_2.pointerId) {
      return;
    }
    drag.current = null;
    if (!dragged.current) {
      return;
    }
    const dx_0 = e_2.clientX - d_2.x;
    const sp = speed(d_2.s);
    const flick = Math.abs(dx_0) > 10 && Math.abs(sp) > FLICK && Math.sign(sp) === Math.sign(dx_0);
    const to_2 = dx_0 + project(sp);
    const far = Math.abs(dx_0) >= SWIPE && Math.sign(to_2) === Math.sign(dx_0) && Math.abs(to_2) >= SWIPE;
    const n_1 = flick || far ? index + (dx_0 < 0 !== rtl() ? 1 : -1) : index;
    setDragging(false);
    go(loop ? n_1 : clamp(n_1));
  };
  let t12;
  if ($[23] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (e_3) => {
      if (!drag.current || drag.current.id !== e_3.pointerId) {
        return;
      }
      drag.current = null;
      dragged.current = false;
      setDragging(false);
    };
    $[23] = t12;
  } else {
    t12 = $[23];
  }
  const onPointerCancel = t12;
  const style = {
    ...props.style,
    "--srp-carousel-count": count,
    ...perMap ? {
      "--srp-carousel-per-base": perMap.base,
      "--srp-carousel-per-sm": perMap.sm,
      "--srp-carousel-per-md": perMap.md,
      "--srp-carousel-per-lg": perMap.lg
    } : {
      "--srp-carousel-per": per
    }
  };
  const multi = perMap ? Math.max(perMap.base, perMap.sm, perMap.md, perMap.lg) > 1 : per > 1;
  const pastAt = (k_2) => perMap ? ["sm", "md", "lg"].filter((b) => k_2 >= Math.ceil(count / perMap[b])).join(" ") || void 0 : void 0;
  let t13;
  if ($[24] !== index || $[25] !== live || $[26] !== per) {
    t13 = (i_4) => !live || i_4 >= index && i_4 < index + per;
    $[24] = index;
    $[25] = live;
    $[26] = per;
    $[27] = t13;
  } else {
    t13 = $[27];
  }
  const shown = t13;
  const prevOff = !loop && index === 0;
  const nextOff = !loop && index >= last;
  let t14;
  if ($[28] !== nameRef || $[29] !== restyle) {
    t14 = (n_2) => {
      restyle(n_2);
      nameRef(n_2);
    };
    $[28] = nameRef;
    $[29] = restyle;
    $[30] = t14;
  } else {
    t14 = $[30];
  }
  const t15 = (multi || props.peek) && "srp-carousel--multi";
  const t16 = props.peek && "srp-carousel--peek";
  let t17;
  if ($[31] !== props || $[32] !== t15 || $[33] !== t16) {
    t17 = cn("srp-carousel", t15, t16, props.className);
    $[31] = props;
    $[32] = t15;
    $[33] = t16;
    $[34] = t17;
  } else {
    t17 = $[34];
  }
  let t18;
  if ($[35] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t18 = (e_5) => {
      if (dragged.current && e_5.detail) {
        dragged.current = false;
        e_5.preventDefault();
        e_5.stopPropagation();
      }
    };
    $[35] = t18;
  } else {
    t18 = $[35];
  }
  return /* @__PURE__ */ React.createElement("section", { ...rest, ref: t14, className: t17, style, "aria-roledescription": sds.labels.carouselRole, "data-component": "carousel", "data-index": index, "data-dir": dir, "data-per-map": perMap ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "srp-carousel__frame" }, /* @__PURE__ */ React.createElement("div", { className: "srp-carousel__viewport", ref: viewport, role: last > 0 ? "group" : void 0, tabIndex: last > 0 ? 0 : void 0, "aria-label": last > 0 ? per > 1 ? sds.labels.slidesOf(index + 1, index + per, count) : name(index, count) : void 0, onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel, onLostPointerCapture: onPointerCancel, onDragStart: _temp2, onClickCapture: t18, "data-dragging": dragging ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "srp-carousel__track", "aria-live": "polite", ref: track }, slides.map((s_0, i_5) => /* @__PURE__ */ React.createElement("div", { key: s_0.key ?? i_5, className: "srp-carousel__slide", role: "group", "aria-roledescription": sds.labels.slideRole, "aria-label": name(i_5, count), "aria-hidden": shown(i_5) ? void 0 : true, inert: !shown(i_5), "data-active": shown(i_5) ? "" : void 0 }, s_0)))), props.arrows !== false && last > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(IconButton, { className: "srp-carousel__arrow srp-carousel__arrow--prev", label: props.previousLabel || sds.labels.previousSlide, size: "sm", variant: "secondary", shape: "round", hideTitle: true, icon: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronLeft, className: "srp-carousel__ltr", mirror: false }), /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, className: "srp-carousel__rtl", mirror: false })), ref: prevBtn, disabled: prevOff, onClick: () => arrow(-1) }), /* @__PURE__ */ React.createElement(IconButton, { className: "srp-carousel__arrow srp-carousel__arrow--next", label: props.nextLabel || sds.labels.nextSlide, size: "sm", variant: "secondary", shape: "round", hideTitle: true, icon: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronRight, className: "srp-carousel__ltr", mirror: false }), /* @__PURE__ */ React.createElement(Icon, { icon: icons.ChevronLeft, className: "srp-carousel__rtl", mirror: false })), ref: nextBtn, disabled: nextOff, onClick: () => arrow(1) })) : null), props.dots !== false && last > 0 ? /* @__PURE__ */ React.createElement("div", { className: "srp-carousel__dots", ref: dotsRef, onKeyDown: onDotsKey }, Array.from({
    length: pages
  }, (_, k_3) => /* @__PURE__ */ React.createElement("button", { key: k_3, type: "button", className: "srp-carousel__dot", "aria-label": dotName(k_3), "aria-current": k_3 === page ? "true" : void 0, tabIndex: k_3 === page ? 0 : -1, "data-past": pastAt(k_3), onClick: () => go(pageStart(k_3)) }))) : null);
}
function _temp2(e_4) {
  return e_4.preventDefault();
}
function _temp(k_1) {
  return k_1 + 1;
}
var Carousel = /* @__PURE__ */ named("Carousel", CarouselRender);
export {
  Carousel
};
//# sourceMappingURL=Carousel.js.map
