"use client";

// src/components/Pagination/Pagination.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { onFontsLoaded } from "../../internal/fontsLoaded.js";
import { Icon } from "../Icon/Icon.js";
import { Select } from "../Select/Select.js";
import { announce } from "../../internal/announce.js";
import { leave } from "../../internal/leave.js";
import { named } from "../../internal/component.js";
import { useControlSize } from "../../internal/controlSize.js";
import { displayNumber } from "../../internal/numbers.js";
import { latinDigits } from "../../internal/digits.js";
import { isComposing } from "../../internal/ime.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { paginationRange } from "./paginationRange.js";
import { useFocusHandover } from "../../internal/focus.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
function int(v, min, fallback) {
  return typeof v === "number" && isFinite(v) && v >= min ? Math.floor(v) : fallback;
}
function PaginationRender(t0) {
  const $ = _c(28);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, {
    count: 1,
    page: 1,
    defaultPage: 1,
    onPageChange: 1,
    getHref: 1,
    linkAs: 1,
    siblings: 1,
    boundaries: 1,
    size: 1,
    previousLabel: 1,
    nextLabel: 1,
    pageLabel: 1,
    total: 1,
    pageSize: 1,
    pageSizeOptions: 1,
    onPageSizeChange: 1,
    jump: 1,
    className: 1
  });
  const count = int(props.count, 0, 0);
  const [held, setOwn, controlled] = useControllable(props.page, int(props.defaultPage, 1, 1), "Pagination", "page");
  let t1;
  if ($[0] !== held) {
    t1 = int(held, 1, 1);
    $[0] = held;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const page = Math.min(Math.max(t1, 1), Math.max(count, 1));
  const size = oneOf(["sm", "md", "lg"], useControlSize(props.size), "md");
  const label = props.pageLabel || sds.labels.page;
  const said = (n) => {
    const shown = displayNumber(n, locale);
    const l = label(n);
    return shown === String(n) ? l : l.replace(new RegExp("(?<!\\d)" + n + "(?!\\d)", "g"), shown);
  };
  const siblings = int(props.siblings, 0, 1);
  const boundaries = int(props.boundaries, 0, 1);
  const [cut, setCut] = React.useState(0);
  const most = siblings + boundaries;
  const list = React.useRef(null);
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      const l_0 = list.current;
      return !!l_0 && l_0.scrollWidth > l_0.clientWidth + 1;
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const over = t2;
  const cutAt = React.useRef(0);
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = function() {
      setCut(0);
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  useIsoLayoutEffect(t3, [page, count]);
  let t4;
  let t5;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = function() {
      if (list.current) {
        list.current.setAttribute("data-fit", "");
      }
    };
    t5 = [];
    $[4] = t4;
    $[5] = t5;
  } else {
    t4 = $[4];
    t5 = $[5];
  }
  useIsoLayoutEffect(t4, t5);
  let t6;
  if ($[6] !== cut || $[7] !== most) {
    t6 = function() {
      const l_1 = list.current;
      if (!l_1) {
        return;
      }
      if (cut > 0 && l_1.clientWidth > cutAt.current + 1) {
        setCut(0);
      } else {
        if (cut < most && over()) {
          cutAt.current = l_1.clientWidth;
          setCut(cut + 1);
        }
      }
    };
    $[6] = cut;
    $[7] = most;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  useIsoLayoutEffect(t6);
  const [, remeasure] = React.useReducer(_temp, 0);
  let t7;
  if ($[9] !== remeasure) {
    t7 = function() {
      const l_2 = list.current;
      if (!l_2 || typeof ResizeObserver === "undefined") {
        return;
      }
      const ro = new ResizeObserver(remeasure);
      ro.observe(l_2);
      return () => ro.disconnect();
    };
    $[9] = remeasure;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = [];
    $[11] = t8;
  } else {
    t8 = $[11];
  }
  useIsoLayoutEffect(t7, t8);
  let t9;
  if ($[12] !== remeasure) {
    t9 = function() {
      const fonts = typeof document !== "undefined" ? document.fonts : void 0;
      if (!fonts) {
        return;
      }
      let live = true;
      const again = () => {
        if (!live) {
          return;
        }
        setCut(0);
        remeasure();
      };
      if (fonts.status !== "loaded") {
        fonts.ready.then(again, _temp2);
      }
      const off = onFontsLoaded(again);
      return () => {
        live = false;
        off();
      };
    };
    $[12] = remeasure;
    $[13] = t9;
  } else {
    t9 = $[13];
  }
  let t10;
  if ($[14] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = [];
    $[14] = t10;
  } else {
    t10 = $[14];
  }
  useIsoLayoutEffect(t9, t10);
  const handover = useFocusHandover();
  const go = (n_1, e) => {
    if (n_1 < 1 || n_1 > count || n_1 === page) {
      if (!props.getHref || n_1 === page) {
        e.preventDefault();
      }
      return;
    }
    const from = e.currentTarget;
    if (from.classList.contains("srp-pagination__arrow")) {
      handover(from, () => {
        const all = from.closest("nav")?.querySelectorAll(".srp-pagination__arrow");
        return all && all[n_1 < page ? all.length - 1 : 0];
      });
    }
    if (!controlled) {
      setOwn(n_1);
    }
    if (props.onPageChange) {
      props.onPageChange(n_1);
    }
  };
  const item = (n_2, content, aria, disabled, cls) => {
    const common = Object.assign({
      className: cn("srp-pagination__item", cls),
      "data-current": cls === "srp-pagination__item--current" ? "" : void 0,
      onClick: (e_0) => go(n_2, e_0)
    }, aria);
    if (props.getHref) {
      return disabled ? /* @__PURE__ */ React.createElement("a", { ...common, role: "link", "aria-disabled": "true" }, content) : React.createElement(props.linkAs || config.link, Object.assign(common, {
        href: props.getHref(n_2)
      }), content);
    }
    return /* @__PURE__ */ React.createElement("button", { type: "button", ...common, disabled }, content);
  };
  const arrow = (dir) => {
    const n_3 = dir === "prev" ? page - 1 : page + 1;
    const arrows = /* @__PURE__ */ React.createElement(Icon, { icon: dir === "prev" ? icons.ChevronLeft : icons.ChevronRight });
    return /* @__PURE__ */ React.createElement("li", { key: dir }, item(n_3, arrows, {
      "aria-label": dir === "prev" ? props.previousLabel || sds.labels.previousPage : props.nextLabel || sds.labels.nextPage,
      rel: props.getHref ? dir : void 0
    }, n_3 < 1 || n_3 > count, "srp-pagination__arrow"));
  };
  const total = int(props.total, 0, -1);
  const per = int(props.pageSize, 1, 0);
  const summary = total >= 0 && per > 0 ? sds.labels.itemsOf(displayNumber(total ? Math.min((page - 1) * per + 1, total) : 0, locale), displayNumber(Math.min(page * per, total), locale), displayNumber(total, locale)) : null;
  const sizeId = React.useId();
  const sizes = Array.isArray(props.pageSizeOptions) && props.pageSizeOptions.length && per > 0 ? props.pageSizeOptions.filter(_temp3) : null;
  const resize = (e_1) => {
    const next = int(Number(e_1.currentTarget.value), 1, per);
    const to = Math.floor((page - 1) * per / next) + 1;
    if (!controlled) {
      setOwn(to);
    }
    if (props.onPageSizeChange) {
      props.onPageSizeChange(next, {
        page: to
      });
    }
  };
  const jumpId = React.useId();
  const [typed, setTyped] = React.useState("");
  const jumpTo = (e_2) => {
    if (e_2.key !== "Enter" || isComposing(e_2)) {
      return;
    }
    e_2.preventDefault();
    const t = latinDigits(typed.normalize("NFKC")).trim().replace(/[\s,.'\u066c\u2019](?=\d{3}(?!\d))/g, "");
    if (!/^\d+$/.test(t) || count < 1) {
      return;
    }
    const n_5 = Number(t);
    const to_0 = Math.min(Math.max(n_5, 1), count);
    setTyped("");
    announce(said(to_0));
    if (to_0 === page) {
      return;
    }
    if (!controlled) {
      setOwn(to_0);
    }
    if (props.onPageChange) {
      props.onPageChange(to_0);
    } else {
      if (props.getHref && typeof window !== "undefined") {
        leave(props.getHref(to_0));
      }
    }
  };
  const jump = props.jump && count > 1 ? /* @__PURE__ */ React.createElement("span", { className: "srp-pagination__jump" }, /* @__PURE__ */ React.createElement("label", { htmlFor: jumpId }, sds.labels.goToPage), /* @__PURE__ */ React.createElement("span", { className: cn("srp-input", "srp-input--size-" + size, "srp-pagination__jump-field") }, /* @__PURE__ */ React.createElement("input", { id: jumpId, className: "srp-input__field", type: "text", inputMode: "numeric", autoComplete: "off", enterKeyHint: "go", value: typed, onChange: (e_3) => setTyped(e_3.currentTarget.value), onKeyDown: jumpTo }))) : null;
  const bar = summary != null || sizes != null || jump != null;
  const t11 = sds.labels.pagination;
  const t12 = "pagination";
  const t13 = cn("srp-pagination", size !== "md" && "srp-pagination--" + size, bar && "srp-pagination--summary", props.className);
  const t14 = summary != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-pagination__summary" }, summary) : null;
  const t15 = sizes ? /* @__PURE__ */ React.createElement("span", { className: "srp-pagination__page-size" }, /* @__PURE__ */ React.createElement("label", { htmlFor: sizeId }, sds.labels.perPage), /* @__PURE__ */ React.createElement(Select, { id: sizeId, size, value: String(per), onChange: resize, options: (sizes.indexOf(per) < 0 ? sizes.concat(per).sort(_temp4) : sizes).map((n_6) => ({
    value: String(n_6),
    label: displayNumber(n_6, locale)
  })) })) : null;
  const t16 = "srp-pagination__list";
  const t17 = arrow("prev");
  const t18 = paginationRange(page, count, Math.max(siblings - cut, 0), Math.max(boundaries - Math.max(cut - siblings, 0), 0)).map((e_4) => typeof e_4 === "number" ? /* @__PURE__ */ React.createElement("li", { key: e_4 }, item(e_4, displayNumber(e_4, locale), {
    "aria-label": said(e_4),
    "aria-current": e_4 === page ? "page" : void 0
  }, false, e_4 === page ? "srp-pagination__item--current" : "")) : /* @__PURE__ */ React.createElement("li", { key: e_4, className: "srp-pagination__ellipsis", "aria-hidden": "true" }, "\u2026"));
  const t19 = arrow("next");
  let t20;
  if ($[15] !== t17 || $[16] !== t18 || $[17] !== t19) {
    t20 = /* @__PURE__ */ React.createElement("ul", { className: t16, ref: list }, t17, t18, t19);
    $[15] = t17;
    $[16] = t18;
    $[17] = t19;
    $[18] = t20;
  } else {
    t20 = $[18];
  }
  let t21;
  if ($[19] !== jump || $[20] !== ref || $[21] !== rest || $[22] !== sds.labels.pagination || $[23] !== t13 || $[24] !== t14 || $[25] !== t15 || $[26] !== t20) {
    t21 = /* @__PURE__ */ React.createElement("nav", { "aria-label": t11, ...rest, ref, "data-component": t12, className: t13 }, t14, t15, t20, jump);
    $[19] = jump;
    $[20] = ref;
    $[21] = rest;
    $[22] = sds.labels.pagination;
    $[23] = t13;
    $[24] = t14;
    $[25] = t15;
    $[26] = t20;
    $[27] = t21;
  } else {
    t21 = $[27];
  }
  return t21;
}
function _temp4(a, b) {
  return a - b;
}
function _temp3(n_4) {
  return int(n_4, 1, 0) > 0;
}
function _temp2() {
}
function _temp(n_0) {
  return n_0 + 1;
}
var Pagination = /* @__PURE__ */ named("Pagination", PaginationRender);
export {
  Pagination,
  paginationRange
};
//# sourceMappingURL=Pagination.js.map
