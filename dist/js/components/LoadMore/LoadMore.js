"use client";

// src/components/LoadMore/LoadMore.tsx
import * as React from "react";
import { useMergedRef, cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { activeIn } from "../../internal/root.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { Button } from "../Button/Button.js";
import { en as words } from "./labels.js";
var isThenable = (v) => v != null && typeof v.then === "function";
function LoadMoreRender({
  ref,
  ...props
}) {
  const sds = useSettings(words), labels = sds.labels, locale = useLocale();
  const {
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
  } = props;
  const count = Number.isNaN(countIn) ? void 0 : countIn, total = Number.isNaN(totalIn) ? void 0 : totalIn;
  const hasMore = more !== false;
  const [pending, setPending] = React.useState(false);
  const busy = !!loading || pending;
  const box = React.useRef(null);
  const end = React.useRef(null);
  const summary = React.useRef(null);
  const hadFocus = React.useRef(false);
  const follow = React.useRef(null);
  const num = (n) => n.toLocaleString(locale);
  const run = React.useCallback(() => {
    if (busy) return;
    hadFocus.current = !!box.current && box.current.contains(activeIn(box.current));
    follow.current = hadFocus.current ? {
      from: count
    } : null;
    const out = onLoadMore();
    if (!isThenable(out)) return;
    setPending(true);
    const done = () => setPending(false);
    out.then(() => {
      done();
      if (count == null) announce(labels.moreLoaded);
    }, done);
  }, [busy, onLoadMore, count, labels]);
  const latest = React.useRef({
    labels,
    total,
    locale
  });
  React.useEffect(() => {
    latest.current = {
      labels,
      total,
      locale
    };
  });
  const before = React.useRef(count);
  React.useEffect(() => {
    const was = before.current;
    before.current = count;
    if (count == null || was == null || count <= was) return;
    const {
      labels: l,
      total: all,
      locale: at
    } = latest.current, n_0 = (x) => x.toLocaleString(at);
    const added = l.loadedMore(n_0(count - was));
    announce(all != null ? added + ". " + l.showingOf(n_0(count), n_0(all)) + "." : added);
  }, [count]);
  React.useEffect(() => {
    const to = end.current || summary.current || box.current;
    if (!hasMore && hadFocus.current && to && !box.current.contains(activeIn(box.current))) {
      if (to === box.current) to.tabIndex = -1;
      to.focus();
    }
    if (!hasMore) hadFocus.current = false;
  }, [hasMore]);
  React.useEffect(() => {
    if (busy || !follow.current || count != null && count === follow.current.from) return;
    follow.current = null;
    const at_0 = activeIn(box.current);
    if (at_0 && box.current && box.current.contains(at_0) && typeof at_0.scrollIntoView === "function") at_0.scrollIntoView({
      block: "nearest"
    });
  }, [busy, count]);
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    if (!infinite || !box.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => setNear(!!es[es.length - 1]?.isIntersecting), {
      rootMargin: "0px 0px 200px 0px"
    });
    io.observe(box.current);
    return () => io.disconnect();
  }, [infinite]);
  const loadedAt = React.useRef(null);
  React.useEffect(() => {
    if (!near) {
      loadedAt.current = null;
      return;
    }
    if (!infinite || !hasMore || busy || loadedAt.current !== null && loadedAt.current === count) return;
    loadedAt.current = count;
    run();
  }, [near, infinite, hasMore, busy, count, run]);
  const setRef = useMergedRef(ref, (node) => {
    box.current = node;
  });
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: setRef, className: cn("srp-load-more", className), "data-component": "load-more", onBlur: (e) => {
    if (rest.onBlur) rest.onBlur(e);
    if (e.target === e.currentTarget) e.currentTarget.removeAttribute("tabindex");
  } }, count != null && total != null ? /* @__PURE__ */ React.createElement("p", { ref: summary, className: "srp-load-more__summary", tabIndex: !hasMore && endText === null ? -1 : void 0 }, labels.showingOf(num(count), num(total))) : null, hasMore ? /* @__PURE__ */ React.createElement(Button, { variant: "outline", className: "srp-load-more__button", wrap: true, loading: busy, loadingLabel: "", onClick: run }, label != null ? label : labels.loadMore) : endText !== null ? /* @__PURE__ */ React.createElement("p", { className: "srp-load-more__end", ref: end, tabIndex: -1 }, endText !== void 0 ? endText : labels.allLoaded) : null);
}
var LoadMore = /* @__PURE__ */ named("LoadMore", LoadMoreRender);
export {
  LoadMore
};
//# sourceMappingURL=LoadMore.js.map
