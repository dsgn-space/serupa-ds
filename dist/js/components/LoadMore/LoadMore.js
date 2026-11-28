"use client";

// src/components/LoadMore/LoadMore.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useMergedRef, cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
var isThenable = (v) => v != null && typeof v.then === "function";
function LoadMoreRender(t0) {
  const $ = _c(74);
  let className;
  let countIn;
  let endText;
  let infinite;
  let label;
  let loading;
  let more;
  let onLoadMore;
  let ref;
  let rest;
  let totalIn;
  if ($[0] !== t0) {
    ({
      ref,
      onLoadMore,
      hasMore: more,
      loading,
      count: countIn,
      total: totalIn,
      infinite,
      label,
      endText,
      className,
      ...rest
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = countIn;
    $[3] = endText;
    $[4] = infinite;
    $[5] = label;
    $[6] = loading;
    $[7] = more;
    $[8] = onLoadMore;
    $[9] = ref;
    $[10] = rest;
    $[11] = totalIn;
  } else {
    className = $[1];
    countIn = $[2];
    endText = $[3];
    infinite = $[4];
    label = $[5];
    loading = $[6];
    more = $[7];
    onLoadMore = $[8];
    ref = $[9];
    rest = $[10];
    totalIn = $[11];
  }
  const sds = useSettings(words);
  const labels = sds.labels;
  const locale = useLocale();
  const count = Number.isNaN(countIn) ? void 0 : countIn;
  const total = Number.isNaN(totalIn) ? void 0 : totalIn;
  const hasMore = more !== false;
  const [pending, setPending] = React.useState(false);
  const busy = !!loading || pending;
  const box = React.useRef(null);
  const end = React.useRef(null);
  const summary = React.useRef(null);
  const hadFocus = React.useRef(false);
  const follow = React.useRef(null);
  let t1;
  if ($[12] !== locale) {
    t1 = (n) => n.toLocaleString(locale);
    $[12] = locale;
    $[13] = t1;
  } else {
    t1 = $[13];
  }
  const num = t1;
  let t2;
  if ($[14] !== busy || $[15] !== count || $[16] !== labels || $[17] !== onLoadMore) {
    t2 = () => {
      if (busy) {
        return;
      }
      hadFocus.current = !!box.current && box.current.contains(activeIn(box.current));
      follow.current = hadFocus.current ? {
        from: count
      } : null;
      const out = onLoadMore();
      if (!isThenable(out)) {
        return;
      }
      setPending(true);
      const done = () => setPending(false);
      out.then(() => {
        done();
        if (count == null) {
          announce(labels.moreLoaded);
        }
      }, done);
    };
    $[14] = busy;
    $[15] = count;
    $[16] = labels;
    $[17] = onLoadMore;
    $[18] = t2;
  } else {
    t2 = $[18];
  }
  const run = t2;
  let t3;
  if ($[19] !== labels || $[20] !== locale || $[21] !== total) {
    t3 = {
      labels,
      total,
      locale
    };
    $[19] = labels;
    $[20] = locale;
    $[21] = total;
    $[22] = t3;
  } else {
    t3 = $[22];
  }
  const latest = React.useRef(t3);
  let t4;
  if ($[23] !== labels || $[24] !== locale || $[25] !== total) {
    t4 = () => {
      latest.current = {
        labels,
        total,
        locale
      };
    };
    $[23] = labels;
    $[24] = locale;
    $[25] = total;
    $[26] = t4;
  } else {
    t4 = $[26];
  }
  React.useEffect(t4);
  const before = React.useRef(count);
  let t5;
  let t6;
  if ($[27] !== count) {
    t5 = () => {
      const was = before.current;
      before.current = count;
      if (count == null || was == null || count <= was) {
        return;
      }
      const {
        labels: l,
        total: all,
        locale: t72
      } = latest.current;
      const at = t72;
      const n_0 = (x) => x.toLocaleString(at);
      const added = l.loadedMore(n_0(count - was));
      announce(all != null ? added + ". " + l.showingOf(n_0(count), n_0(all)) + "." : added);
    };
    t6 = [count];
    $[27] = count;
    $[28] = t5;
    $[29] = t6;
  } else {
    t5 = $[28];
    t6 = $[29];
  }
  React.useEffect(t5, t6);
  let t7;
  let t8;
  if ($[30] !== hasMore) {
    t7 = () => {
      const to = end.current || summary.current || box.current;
      if (!hasMore && hadFocus.current && to && !box.current.contains(activeIn(box.current))) {
        if (to === box.current) {
          to.tabIndex = -1;
        }
        to.focus();
      }
      if (!hasMore) {
        hadFocus.current = false;
      }
    };
    t8 = [hasMore];
    $[30] = hasMore;
    $[31] = t7;
    $[32] = t8;
  } else {
    t7 = $[31];
    t8 = $[32];
  }
  React.useEffect(t7, t8);
  let t10;
  let t9;
  if ($[33] !== busy || $[34] !== count) {
    t9 = () => {
      if (busy || !follow.current || count != null && count === follow.current.from) {
        return;
      }
      follow.current = null;
      const at_0 = activeIn(box.current);
      if (at_0 && box.current && box.current.contains(at_0) && typeof at_0.scrollIntoView === "function") {
        at_0.scrollIntoView({
          block: "nearest"
        });
      }
    };
    t10 = [busy, count];
    $[33] = busy;
    $[34] = count;
    $[35] = t10;
    $[36] = t9;
  } else {
    t10 = $[35];
    t9 = $[36];
  }
  React.useEffect(t9, t10);
  const [near, setNear] = React.useState(false);
  let t11;
  let t12;
  if ($[37] !== infinite) {
    t11 = () => {
      if (!infinite || !box.current || typeof IntersectionObserver === "undefined") {
        return;
      }
      const io = new IntersectionObserver((es) => setNear(!!es[es.length - 1]?.isIntersecting), {
        rootMargin: "0px 0px 200px 0px"
      });
      io.observe(box.current);
      return () => io.disconnect();
    };
    t12 = [infinite];
    $[37] = infinite;
    $[38] = t11;
    $[39] = t12;
  } else {
    t11 = $[38];
    t12 = $[39];
  }
  React.useEffect(t11, t12);
  const loadedAt = React.useRef(null);
  let t13;
  let t14;
  if ($[40] !== busy || $[41] !== count || $[42] !== hasMore || $[43] !== infinite || $[44] !== near || $[45] !== run) {
    t13 = () => {
      if (!near) {
        loadedAt.current = null;
        return;
      }
      if (!infinite || !hasMore || busy || loadedAt.current !== null && loadedAt.current === count) {
        return;
      }
      loadedAt.current = count;
      run();
    };
    t14 = [near, infinite, hasMore, busy, count, run];
    $[40] = busy;
    $[41] = count;
    $[42] = hasMore;
    $[43] = infinite;
    $[44] = near;
    $[45] = run;
    $[46] = t13;
    $[47] = t14;
  } else {
    t13 = $[46];
    t14 = $[47];
  }
  React.useEffect(t13, t14);
  let t15;
  if ($[48] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t15 = (node) => {
      box.current = node;
    };
    $[48] = t15;
  } else {
    t15 = $[48];
  }
  const setRef = useMergedRef(ref, t15);
  let t16;
  if ($[49] !== className) {
    t16 = cn("srp-load-more", className);
    $[49] = className;
    $[50] = t16;
  } else {
    t16 = $[50];
  }
  let t17;
  if ($[51] !== rest) {
    t17 = (e) => {
      if (rest.onBlur) {
        rest.onBlur(e);
      }
      if (e.target === e.currentTarget) {
        e.currentTarget.removeAttribute("tabindex");
      }
    };
    $[51] = rest;
    $[52] = t17;
  } else {
    t17 = $[52];
  }
  let t18;
  if ($[53] !== count || $[54] !== endText || $[55] !== hasMore || $[56] !== labels || $[57] !== num || $[58] !== total) {
    t18 = count != null && total != null ? /* @__PURE__ */ React.createElement("p", { ref: summary, className: "srp-load-more__summary", tabIndex: !hasMore && endText === null ? -1 : void 0 }, labels.showingOf(num(count), num(total))) : null;
    $[53] = count;
    $[54] = endText;
    $[55] = hasMore;
    $[56] = labels;
    $[57] = num;
    $[58] = total;
    $[59] = t18;
  } else {
    t18 = $[59];
  }
  let t19;
  if ($[60] !== busy || $[61] !== endText || $[62] !== hasMore || $[63] !== label || $[64] !== labels || $[65] !== run) {
    t19 = hasMore ? /* @__PURE__ */ React.createElement(Button, { variant: "outline", className: "srp-load-more__button", wrap: true, loading: busy, loadingLabel: "", onClick: run }, label != null ? label : labels.loadMore) : endText !== null ? /* @__PURE__ */ React.createElement("p", { className: "srp-load-more__end", ref: end, tabIndex: -1 }, endText !== void 0 ? endText : labels.allLoaded) : null;
    $[60] = busy;
    $[61] = endText;
    $[62] = hasMore;
    $[63] = label;
    $[64] = labels;
    $[65] = run;
    $[66] = t19;
  } else {
    t19 = $[66];
  }
  let t20;
  if ($[67] !== rest || $[68] !== setRef || $[69] !== t16 || $[70] !== t17 || $[71] !== t18 || $[72] !== t19) {
    t20 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: setRef, className: t16, "data-component": "load-more", onBlur: t17 }, t18, t19);
    $[67] = rest;
    $[68] = setRef;
    $[69] = t16;
    $[70] = t17;
    $[71] = t18;
    $[72] = t19;
    $[73] = t20;
  } else {
    t20 = $[73];
  }
  return t20;
}
var LoadMore = /* @__PURE__ */ named("LoadMore", LoadMoreRender);
export {
  LoadMore
};
//# sourceMappingURL=LoadMore.js.map
