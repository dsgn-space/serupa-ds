"use client";

// src/components/Toast/Toast.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn, oneOf, useIsoLayoutEffect, useMergedRef } from "../../internal/cn.js";
import { reducedMotion } from "../../internal/mediaList.js";
import { toMs } from "../../internal/cssTime.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { warnOnce } from "../../internal/warn.js";
import { Icon } from "../Icon/Icon.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { onModalChange, topModal } from "../../internal/layers.js";
import { settleTime, speed, track } from "../../internal/fling.js";
import * as icons from "../../material/builtin.js";
import { en as ownWords } from "./labels.js";
import { repeatQuiet } from "../../internal/timing.js";
import { deepActive } from "../../internal/root.js";
import { pageShared } from "../../internal/pageShared.js";
import { isApple } from "../../internal/keys.js";
var page = /* @__PURE__ */ pageShared("toast@1", () => ({
  items: [],
  listeners: /* @__PURE__ */ new Set(),
  next: 0,
  hint: "",
  hinted: false,
  repeated: null,
  undoWord: "",
  repeatTimers: /* @__PURE__ */ new Map(),
  watchers: /* @__PURE__ */ new Set(),
  onClose: /* @__PURE__ */ new Map(),
  undos: /* @__PURE__ */ new Map()
}));
var emit = () => {
  let left = page.listeners.size;
  page.listeners.forEach((l) => l(--left ? [] : page.items));
};
var text = (n) => typeof n === "string" || typeof n === "number" ? String(n) : "";
var TONES = ["neutral", "info", "success", "warning", "danger"];
var HOTKEY = "F8";
function watchToasts(fn) {
  page.watchers.add(fn);
  return () => {
    page.watchers.delete(fn);
  };
}
var tell = (t) => page.watchers.forEach((w) => w({
  id: t.id,
  title: t.title,
  description: t.description,
  tone: t.tone,
  count: t.count
}));
var said = (o) => o.announcement != null ? o.announcement : [text(o.title), text(o.description)].filter(Boolean).join(". ");
function show(options) {
  const o = typeof options === "string" ? {
    title: options
  } : options;
  const tone = oneOf(TONES, o.tone, "neutral");
  const same = o.id || o.action ? -1 : page.items.findIndex((x) => !x.action && x.tone === tone && text(x.title) !== "" && text(x.title) === text(o.title) && text(x.description) === text(o.description));
  const was = page.items[same];
  if (was) {
    const again = Object.assign({}, was, {
      count: was.count + 1
    });
    page.items = page.items.map((x, i) => i === same ? again : x);
    emit();
    tell(again);
    const rid = again.id;
    const wait = page.repeatTimers.get(rid);
    if (wait) clearTimeout(wait);
    page.repeatTimers.set(rid, setTimeout(() => {
      page.repeatTimers.delete(rid);
      const now = page.items.find((x) => x.id === rid), say2 = now ? said(now) : "";
      if (now && say2 && page.repeated) announce(say2 + ". " + page.repeated(now.count) + ".", {
        assertive: now.tone === "danger"
      });
    }, repeatQuiet));
    return rid;
  }
  const id = o.id || "srp-toast-" + ++page.next;
  const item = Object.assign({}, o, {
    id,
    tone,
    count: 1
  });
  const at = page.items.findIndex((x) => x.id === id);
  page.items = at >= 0 ? page.items.map((x, i) => i === at ? item : x) : page.items.concat(item);
  emit();
  tell(item);
  let say = said(o);
  if (say && o.action && page.hint && !page.hinted) {
    say += ". " + page.hint;
    page.hinted = true;
  }
  if (say) announce(say, {
    assertive: item.tone === "danger"
  });
  return id;
}
function dismiss(id) {
  const gone = id == null ? page.items : page.items.filter((x) => x.id === id);
  page.items = id == null ? [] : page.items.filter((x) => x.id !== id);
  emit();
  for (const x of gone) {
    const then = page.onClose.get(x.id);
    if (then) {
      page.onClose.delete(x.id);
      then();
    }
  }
}
var asOptions = (m) => typeof m === "string" ? {
  title: m
} : m;
function promise(work, messages) {
  const p = typeof work === "function" ? work() : work;
  const id = "srp-toast-" + ++page.next;
  show(Object.assign({
    autoDismiss: false
  }, asOptions(messages.loading), {
    id
  }));
  const settle = (m, arg, tone) => {
    let o;
    try {
      o = asOptions(typeof m === "function" ? m(arg) : m);
    } catch (thrown) {
      if (process.env.NODE_ENV !== "production") warnOnce("toast-promise-threw", "toast.promise: the " + (tone === "success" ? "success" : "error") + " message threw (" + String(thrown) + "), so " + (tone === "success" ? "the error message shows instead." : "the toast closes."));
      if (tone === "success") settle(messages.error, thrown, "danger");
      else dismiss(id);
      return;
    }
    show(Object.assign({
      tone
    }, o, {
      id
    }));
  };
  p.then((v) => settle(messages.success, v, "success"), (e) => settle(messages.error, e, "danger"));
  return p;
}
function undo(options) {
  const {
    commit,
    onUndo,
    undoLabel,
    ...rest
  } = options;
  const prev = rest.id != null ? page.onClose.get(rest.id) : void 0;
  if (prev) {
    page.onClose.delete(rest.id);
    prev();
  }
  let settled = false;
  const returned = (e) => {
    window.removeEventListener("pageshow", returned);
    if (e.persisted) dismiss(id);
  };
  const once = (f, leaving) => () => {
    if (settled) return;
    settled = true;
    page.undos.delete(id);
    window.removeEventListener("pagehide", left);
    if (leaving) window.addEventListener("pageshow", returned);
    if (f) f();
  };
  const keep = once(commit), back = once(onUndo), left = once(commit, true);
  const id = show(Object.assign({}, rest, {
    action: {
      label: undoLabel || page.undoWord || ownWords.undo,
      onClick: back
    }
  }));
  page.onClose.set(id, keep);
  page.undos.set(id, back);
  window.addEventListener("pagehide", left);
  unseen();
  return id;
}
var unseenTimer;
function unseen() {
  clearTimeout(unseenTimer);
  unseenTimer = setTimeout(() => {
    if (page.listeners.size || !page.onClose.size) return;
    if (process.env.NODE_ENV !== "production") warnOnce("toast-undo-no-toaster", "toast.undo: no Toaster is mounted, so its Undo can't be seen and the action was done for good. Render one Toaster, once, near the root.");
    for (const id of [...page.onClose.keys()]) dismiss(id);
  }, 0);
}
var toast = /* @__PURE__ */ Object.assign(show, {
  dismiss,
  promise,
  undo
});
var POSITIONS = ["top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end"];
var ICONS = {
  neutral: null,
  info: icons.Info,
  success: icons.CheckCircle,
  warning: icons.Warning,
  danger: icons.Error
};
var typing = (e) => e instanceof HTMLElement && (e.isContentEditable || e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement && !/^(button|checkbox|radio|submit|reset|image|color|file|range)$/.test(e.type));
function ToasterRender(t0) {
  const $ = _c(91);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(ownWords);
  const {
    placement,
    dismissLabel,
    limit,
    duration,
    autoDismiss,
    className,
    ...rest
  } = props;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const [list, setList] = React.useState(t1);
  const self = React.useRef(null);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = (n) => {
      self.current = n;
    };
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const mergedRef = useMergedRef(ref, t2);
  const before = React.useRef(null);
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      const region = self.current;
      if (!region || before.current) {
        return;
      }
      before.current = new Map([...region.querySelectorAll(MOVES)].map(_temp));
    };
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const snap = t3;
  const [early, setEarly] = React.useState(_temp2);
  const arriving = React.useRef(true);
  let t4;
  let t5;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => {
      ensureAnnouncer();
      page.hinted = false;
      if (process.env.NODE_ENV !== "production" && page.listeners.size) {
        warnOnce("toaster-twice", "Toaster: another Toaster is already mounted, so only this newer one shows toasts. Render one Toaster, once, near the root.");
      }
      const take = (l) => {
        snap();
        if (arriving.current) {
          setEarly((e_0) => /* @__PURE__ */ new Set([...e_0, ...l.map(_temp3)]));
        }
        setList(l);
      };
      arriving.current = true;
      page.listeners.add(take);
      emit();
      Promise.resolve().then(() => {
        arriving.current = false;
      });
      return () => {
        page.listeners.delete(take);
        emit();
        unseen();
      };
    };
    t5 = [];
    $[3] = t4;
    $[4] = t5;
  } else {
    t4 = $[3];
    t5 = $[4];
  }
  React.useEffect(t4, t5);
  const pos = oneOf(POSITIONS, placement, "bottom-end");
  let t6;
  if ($[5] !== sds.labels) {
    t6 = sds.labels.toastShortcut(HOTKEY);
    $[5] = sds.labels;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  const shortcut = t6;
  let t7;
  let t8;
  if ($[7] !== shortcut) {
    t7 = () => {
      page.hint = shortcut;
      return _temp4;
    };
    t8 = [shortcut];
    $[7] = shortcut;
    $[8] = t7;
    $[9] = t8;
  } else {
    t7 = $[8];
    t8 = $[9];
  }
  React.useEffect(t7, t8);
  const times = sds.labels.toastRepeated;
  const locale = useLocale();
  let t10;
  let t9;
  if ($[10] !== locale || $[11] !== times) {
    t9 = () => {
      page.repeated = (n_0) => times(n_0, displayNumber(n_0, locale));
      return _temp5;
    };
    t10 = [times, locale];
    $[10] = locale;
    $[11] = times;
    $[12] = t10;
    $[13] = t9;
  } else {
    t10 = $[12];
    t9 = $[13];
  }
  React.useEffect(t9, t10);
  const undoText = sds.labels.undo;
  let t11;
  let t12;
  if ($[14] !== undoText) {
    t11 = () => {
      page.undoWord = undoText;
      return _temp6;
    };
    t12 = [undoText];
    $[14] = undoText;
    $[15] = t11;
    $[16] = t12;
  } else {
    t11 = $[15];
    t12 = $[16];
  }
  React.useEffect(t11, t12);
  const back = React.useRef(null);
  React.useEffect(() => {
    const away = () => {
      const b = back.current;
      back.current = null;
      if (b && b.isConnected) {
        b.focus();
      }
    };
    const onKey = (e_1) => {
      const region_0 = self.current;
      if (!region_0 || e_1.defaultPrevented) {
        return;
      }
      const active = deepActive();
      const inside = region_0.contains(active);
      if (e_1.key.toLowerCase() === "z" && !e_1.altKey && !e_1.shiftKey && (isApple() ? e_1.metaKey && !e_1.ctrlKey : e_1.ctrlKey && !e_1.metaKey)) {
        if (typing(active)) {
          return;
        }
        const ids = [...region_0.querySelectorAll("[data-toast]:not([data-leaving])")].map(_temp7).filter(_temp8);
        const id = ids[pos.startsWith("top") ? 0 : ids.length - 1];
        if (id == null) {
          return;
        }
        e_1.preventDefault();
        page.undos.get(id)();
        dismiss(id);
        return;
      }
      if (e_1.altKey || e_1.ctrlKey || e_1.metaKey || e_1.shiftKey) {
        return;
      }
      if (e_1.key === HOTKEY) {
        const toasts = region_0.querySelectorAll("[data-toast]:not([data-leaving])");
        if (inside) {
          e_1.preventDefault();
          away();
          return;
        }
        if (!toasts.length) {
          return;
        }
        e_1.preventDefault();
        back.current = active;
        toasts[pos.startsWith("top") ? 0 : toasts.length - 1]?.focus();
      } else {
        if (e_1.key === "Escape" && inside && back.current) {
          e_1.preventDefault();
          away();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pos]);
  const held = React.useRef(null);
  const onFocus = (e_2) => {
    if (rest.onFocus) {
      rest.onFocus(e_2);
    }
    const t_0 = e_2.target.closest(".srp-toast");
    if (t_0 && self.current) {
      held.current = {
        toast: t_0,
        at: [...self.current.querySelectorAll("[data-toast]:not([data-leaving])")].indexOf(t_0),
        keys: e_2.target.matches(":focus-visible")
      };
    }
  };
  const onPointerDown = (e_3) => {
    if (rest.onPointerDown) {
      rest.onPointerDown(e_3);
    }
    if (held.current) {
      held.current.keys = false;
    }
  };
  const onBlur = (e_4) => {
    if (rest.onBlur) {
      rest.onBlur(e_4);
    }
    const h = held.current;
    const to = e_4.relatedTarget;
    if (to && self.current && !self.current.contains(to)) {
      held.current = null;
    } else {
      if (!to && h) {
        window.setTimeout(() => {
          if (held.current === h && h.toast.isConnected && !h.toast.contains(deepActive())) {
            held.current = null;
          }
        }, 0);
      }
    }
  };
  let t13;
  if ($[17] !== list) {
    t13 = [list];
    $[17] = list;
    $[18] = t13;
  } else {
    t13 = $[18];
  }
  useIsoLayoutEffect(() => {
    const h_0 = held.current;
    const region_1 = self.current;
    if (!h_0 || h_0.toast.isConnected && !h_0.toast.hasAttribute("data-leaving") || !region_1) {
      return;
    }
    held.current = null;
    if (!h_0.keys) {
      return;
    }
    const now = deepActive();
    if (now && now !== document.body && now.isConnected && !h_0.toast.contains(now)) {
      return;
    }
    const b_0 = back.current;
    const toasts_0 = region_1.querySelectorAll("[data-toast]:not([data-leaving])");
    if (b_0 && b_0.isConnected) {
      back.current = null;
      b_0.focus();
    } else {
      toasts_0[Math.min(h_0.at, toasts_0.length - 1)]?.focus();
    }
  }, t13);
  const [room, setRoom] = React.useState(Infinity);
  let t14;
  let t15;
  if ($[19] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = () => {
      const all = () => setRoom(Infinity);
      window.addEventListener("resize", all);
      return () => window.removeEventListener("resize", all);
    };
    t15 = [];
    $[19] = t14;
    $[20] = t15;
  } else {
    t14 = $[19];
    t15 = $[20];
  }
  React.useEffect(t14, t15);
  const max = Math.max(1, Math.min(room, Math.floor(limit != null && limit > 0 ? limit : 3)));
  const shown = list.slice(-max);
  const waiting = list.length - shown.length;
  let t16;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = {
      waiting: 0,
      words: ""
    };
    $[21] = t16;
  } else {
    t16 = $[21];
  }
  const [moreWas, setMoreWas] = React.useState(t16);
  let t17;
  if ($[22] !== locale || $[23] !== moreWas.words || $[24] !== sds.labels || $[25] !== waiting) {
    t17 = waiting > 0 ? sds.labels.moreToasts(waiting, displayNumber(waiting, locale)) : moreWas.words;
    $[22] = locale;
    $[23] = moreWas.words;
    $[24] = sds.labels;
    $[25] = waiting;
    $[26] = t17;
  } else {
    t17 = $[26];
  }
  const words = t17;
  if (waiting !== moreWas.waiting || waiting > 0 && words !== moreWas.words) {
    setMoreWas({
      waiting,
      words: waiting > 0 ? words : moreWas.words
    });
  }
  const moreRef = React.useRef(null);
  const moreLeaving = waiting === 0 && words !== "";
  let t18;
  let t19;
  if ($[27] !== moreLeaving) {
    t18 = () => {
      const e_5 = moreRef.current;
      if (!moreLeaving || !e_5) {
        return;
      }
      const runs = typeof e_5.getAnimations === "function" ? e_5.getAnimations().filter(_temp9) : [];
      const end = () => {
        snap();
        setMoreWas(_temp0);
      };
      if (!runs.length) {
        end();
        return;
      }
      let on = true;
      Promise.all(runs.map(_temp10)).then(() => {
        if (on) {
          end();
        }
      });
      return () => {
        on = false;
      };
    };
    t19 = [moreLeaving];
    $[27] = moreLeaving;
    $[28] = t18;
    $[29] = t19;
  } else {
    t18 = $[28];
    t19 = $[29];
  }
  useIsoLayoutEffect(t18, t19);
  let t20;
  if ($[30] !== early || $[31] !== list || $[32] !== waiting) {
    let t212;
    if ($[34] !== early) {
      t212 = (x_1) => early.has(x_1.id);
      $[34] = early;
      $[35] = t212;
    } else {
      t212 = $[35];
    }
    t20 = list.slice(0, waiting).every(t212);
    $[30] = early;
    $[31] = list;
    $[32] = waiting;
    $[33] = t20;
  } else {
    t20 = $[33];
  }
  const moreInstant = t20;
  let t21;
  if ($[36] !== moreInstant || $[37] !== moreLeaving || $[38] !== words) {
    t21 = words ? /* @__PURE__ */ React.createElement("li", { key: "more", ref: moreRef, className: "srp-toaster__more", "data-leaving": moreLeaving ? "" : void 0, "data-instant": moreInstant ? "" : void 0, "aria-hidden": moreLeaving || void 0 }, words) : null;
    $[36] = moreInstant;
    $[37] = moreLeaving;
    $[38] = words;
    $[39] = t21;
  } else {
    t21 = $[39];
  }
  const more = t21;
  const ordered = pos.startsWith("top") ? shown.slice().reverse() : shown;
  let t22;
  if ($[40] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t22 = [];
    $[40] = t22;
  } else {
    t22 = $[40];
  }
  const [gone, setGone] = React.useState(t22);
  let t23;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t23 = [];
    $[41] = t23;
  } else {
    t23 = $[41];
  }
  const [last, setLast] = React.useState(t23);
  const key = ordered.map(_temp11).join(" ");
  if (key !== last.map(_temp12).join(" ")) {
    const ids_0 = new Set(ordered.map(_temp13));
    const held_0 = new Set(list.map(_temp14));
    setGone(gone.filter((g) => !ids_0.has(g.item.id)).concat(last.flatMap((t_4, at) => ids_0.has(t_4.id) ? [] : [{
      item: t_4,
      at,
      after: last[at - 1]?.id ?? null,
      queued: held_0.has(t_4.id)
    }])));
    setLast(ordered);
  }
  const rows = ordered.map(_temp15);
  for (const g_0 of gone) {
    const i = g_0.after == null ? -1 : rows.findIndex((r) => r.item.id === g_0.after);
    rows.splice(g_0.after == null ? 0 : i >= 0 ? i + 1 : Math.min(g_0.at, rows.length), 0, {
      item: g_0.item,
      leaving: g_0.queued ? "queued" : "closed"
    });
  }
  const [clocks] = React.useState(_temp16);
  let t24;
  let t25;
  if ($[42] !== clocks || $[43] !== list || $[44] !== waiting) {
    t24 = () => {
      const ids_1 = new Set(list.map(_temp17));
      for (const id_0 of clocks.keys()) {
        if (!ids_1.has(id_0)) {
          clocks.delete(id_0);
        }
      }
      const run = list.slice(0, waiting).flatMap((t_8) => {
        const c = clocks.get(t_8.id);
        if (!c || c.item !== t_8 || !(c.left > 0)) {
          return [];
        }
        c.since = Date.now();
        return [{
          c,
          timer: window.setTimeout(() => toast.dismiss(t_8.id), c.left)
        }];
      });
      return () => {
        for (const r_0 of run) {
          window.clearTimeout(r_0.timer);
          r_0.c.left = timeLeft(r_0.c);
          r_0.c.since = null;
        }
      };
    };
    t25 = [list, waiting, clocks];
    $[42] = clocks;
    $[43] = list;
    $[44] = waiting;
    $[45] = t24;
    $[46] = t25;
  } else {
    t24 = $[45];
    t25 = $[46];
  }
  React.useEffect(t24, t25);
  let t26;
  if ($[47] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t26 = (id_1) => {
      snap();
      setGone((l_0) => l_0.filter((g_1) => g_1.item.id !== id_1));
    };
    $[47] = t26;
  } else {
    t26 = $[47];
  }
  const done = t26;
  let t27;
  if ($[48] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t27 = () => {
      const was = before.current;
      const region_2 = self.current;
      before.current = null;
      if (!was || !region_2 || reducedMotion(region_2)) {
        return;
      }
      const cs = getComputedStyle(region_2);
      const ms = toMs(cs.getPropertyValue("--srp-toast-move"));
      if (!ms) {
        return;
      }
      for (const e_6 of region_2.querySelectorAll(MOVES)) {
        const from = was.get(e_6.dataset.toast || "more");
        if (from == null || typeof e_6.animate !== "function") {
          continue;
        }
        for (const a_1 of e_6.getAnimations()) {
          if (a_1.id === "srp-toast-move") {
            a_1.cancel();
          }
        }
        const dy = from - e_6.getBoundingClientRect().top;
        if (Math.abs(dy) < 0.5) {
          continue;
        }
        e_6.animate([{
          translate: "0 " + dy + "px"
        }, {
          translate: "0 0"
        }], {
          duration: ms,
          easing: cs.getPropertyValue("--srp-toast-move-ease").trim() || "ease",
          id: "srp-toast-move",
          composite: e_6.style.translate ? "add" : "replace"
        });
      }
    };
    $[48] = t27;
  } else {
    t27 = $[48];
  }
  useIsoLayoutEffect(t27);
  let t28;
  if ($[49] !== pos) {
    t28 = () => {
      const region_3 = self.current;
      if (!region_3) {
        return;
      }
      const live = [...region_3.querySelectorAll("[data-toast]:not([data-leaving]), .srp-toaster__more:not([data-leaving])")];
      const toastsLive = live.filter(_temp18).length;
      if (toastsLive < 2) {
        return;
      }
      const cs_0 = getComputedStyle(region_3);
      const gap = parseFloat(getComputedStyle(region_3.firstElementChild).rowGap) || 0;
      const edge = parseFloat(pos.startsWith("top") ? cs_0.top : cs_0.bottom) || 0;
      const tall = live.reduce(_temp19, 0) + gap * (live.length - 1);
      if (tall > window.innerHeight - 2 * edge + 0.5) {
        setRoom(toastsLive - 1);
      }
    };
    $[49] = pos;
    $[50] = t28;
  } else {
    t28 = $[50];
  }
  useIsoLayoutEffect(t28);
  const spaceVar = "--srp-toaster-space-" + pos;
  let t29;
  if ($[51] !== pos) {
    t29 = pos.split("-");
    $[51] = pos;
    $[52] = t29;
  } else {
    t29 = $[52];
  }
  const edgeVar = "--srp-toaster-space-" + t29[0];
  let t30;
  if ($[53] !== edgeVar || $[54] !== pos || $[55] !== spaceVar) {
    t30 = () => {
      const region_4 = self.current;
      const root = document.documentElement;
      const live_0 = region_4 ? [...region_4.querySelectorAll("[data-toast]:not([data-leaving]), .srp-toaster__more:not([data-leaving])")] : [];
      if (!region_4 || !live_0.some(_temp20)) {
        root.style.removeProperty(spaceVar);
        root.style.removeProperty(edgeVar);
        return;
      }
      const cs_1 = getComputedStyle(region_4);
      const gap_0 = parseFloat(getComputedStyle(region_4.firstElementChild).rowGap) || 0;
      const edge_0 = parseFloat(pos.startsWith("top") ? cs_1.top : cs_1.bottom) || 0;
      const tall_0 = live_0.reduce(_temp21, 0) + gap_0 * (live_0.length - 1);
      root.style.setProperty(spaceVar, Math.ceil(edge_0 + tall_0 + 8) + "px");
      root.style.setProperty(edgeVar, Math.ceil(edge_0 + tall_0 + 8) + "px");
    };
    $[53] = edgeVar;
    $[54] = pos;
    $[55] = spaceVar;
    $[56] = t30;
  } else {
    t30 = $[56];
  }
  useIsoLayoutEffect(t30);
  let t31;
  let t32;
  if ($[57] !== edgeVar || $[58] !== spaceVar) {
    t31 = () => () => {
      document.documentElement.style.removeProperty(spaceVar);
      document.documentElement.style.removeProperty(edgeVar);
    };
    t32 = [spaceVar, edgeVar];
    $[57] = edgeVar;
    $[58] = spaceVar;
    $[59] = t31;
    $[60] = t32;
  } else {
    t31 = $[59];
    t32 = $[60];
  }
  React.useEffect(t31, t32);
  const modal = React.useSyncExternalStore(onModalChange, topModal, _temp22);
  const t33 = rest["aria-label"] || sds.labels.notifications;
  const t34 = cn("srp-toaster", "srp-toaster--" + pos, className);
  const t35 = "toaster";
  const t36 = "srp-toaster__list";
  const t37 = "list";
  let t38;
  if ($[61] !== more || $[62] !== pos) {
    t38 = pos.startsWith("top") ? null : more;
    $[61] = more;
    $[62] = pos;
    $[63] = t38;
  } else {
    t38 = $[63];
  }
  let t39;
  if ($[64] !== autoDismiss || $[65] !== clocks || $[66] !== dismissLabel || $[67] !== duration || $[68] !== early || $[69] !== sds) {
    t39 = (r_1) => /* @__PURE__ */ React.createElement(ToastView, { key: r_1.item.id, item: r_1.item, leaving: r_1.leaving, clocks, instant: early.has(r_1.item.id), onGone: done, dismissLabel: dismissLabel || sds.labels.dismiss, time: r_1.item.autoDismiss ?? autoDismiss ?? true ? Math.max(0, r_1.item.duration ?? duration ?? 5e3) : 0 });
    $[64] = autoDismiss;
    $[65] = clocks;
    $[66] = dismissLabel;
    $[67] = duration;
    $[68] = early;
    $[69] = sds;
    $[70] = t39;
  } else {
    t39 = $[70];
  }
  const t40 = rows.map(t39);
  let t41;
  if ($[71] !== more || $[72] !== pos) {
    t41 = pos.startsWith("top") ? more : null;
    $[71] = more;
    $[72] = pos;
    $[73] = t41;
  } else {
    t41 = $[73];
  }
  let t42;
  if ($[74] !== t38 || $[75] !== t40 || $[76] !== t41) {
    t42 = /* @__PURE__ */ React.createElement("ol", { className: t36, role: t37 }, t38, t40, t41);
    $[74] = t38;
    $[75] = t40;
    $[76] = t41;
    $[77] = t42;
  } else {
    t42 = $[77];
  }
  let t43;
  if ($[78] !== mergedRef || $[79] !== onBlur || $[80] !== onFocus || $[81] !== onPointerDown || $[82] !== pos || $[83] !== rest || $[84] !== t33 || $[85] !== t34 || $[86] !== t42) {
    t43 = /* @__PURE__ */ React.createElement("section", { ...rest, ref: mergedRef, onFocus, onBlur, onPointerDown, "aria-label": t33, className: t34, "data-component": t35, "data-position": pos }, t42);
    $[78] = mergedRef;
    $[79] = onBlur;
    $[80] = onFocus;
    $[81] = onPointerDown;
    $[82] = pos;
    $[83] = rest;
    $[84] = t33;
    $[85] = t34;
    $[86] = t42;
    $[87] = t43;
  } else {
    t43 = $[87];
  }
  const region_5 = t43;
  let t44;
  if ($[88] !== modal || $[89] !== region_5) {
    t44 = modal ? createPortal(region_5, modal) : region_5;
    $[88] = modal;
    $[89] = region_5;
    $[90] = t44;
  } else {
    t44 = $[90];
  }
  return t44;
}
function _temp22() {
  return null;
}
function _temp21(h_2, e_10) {
  return h_2 + e_10.offsetHeight;
}
function _temp20(e_9) {
  return e_9.hasAttribute("data-toast");
}
function _temp19(h_1, e_8) {
  return h_1 + e_8.getBoundingClientRect().height;
}
function _temp18(e_7) {
  return e_7.hasAttribute("data-toast");
}
function _temp17(t_7) {
  return t_7.id;
}
function _temp16() {
  return /* @__PURE__ */ new Map();
}
function _temp15(t_6) {
  return {
    item: t_6,
    leaving: false
  };
}
function _temp14(t_3) {
  return t_3.id;
}
function _temp13(t_2) {
  return t_2.id;
}
function _temp12(t_5) {
  return t_5.id;
}
function _temp11(t_1) {
  return t_1.id;
}
function _temp10(a_0) {
  return a_0.finished.catch(_temp1);
}
function _temp1() {
}
function _temp0(m) {
  return m.waiting ? m : {
    waiting: 0,
    words: ""
  };
}
function _temp9(a) {
  return a.id !== "srp-toast-move";
}
function _temp8(x_0) {
  return page.undos.has(x_0);
}
function _temp7(t) {
  return t.dataset.toast;
}
function _temp6() {
  page.undoWord = "";
}
function _temp5() {
  page.repeated = null;
}
function _temp4() {
  page.hint = "";
}
function _temp3(x) {
  return x.id;
}
function _temp2() {
  return /* @__PURE__ */ new Set();
}
function _temp(e) {
  return [e.dataset.toast || "more", e.getBoundingClientRect().top];
}
var Toaster = /* @__PURE__ */ named("Toaster", ToasterRender);
var timeLeft = (c) => c.left - (c.since == null ? 0 : Date.now() - c.since);
var MOVES = "[data-toast], .srp-toaster__more";
function ToastView(props) {
  const $ = _c(78);
  const t = props.item;
  const self = React.useRef(null);
  const {
    leaving,
    onGone
  } = props;
  let t0;
  if ($[0] !== leaving || $[1] !== onGone || $[2] !== t.id) {
    t0 = () => {
      const e = self.current;
      if (!leaving || !e) {
        return;
      }
      if (!e.hasAttribute("data-gone")) {
        e.style.top = e.offsetTop + "px";
        e.setAttribute("data-gone", "");
      }
      const runs = typeof e.getAnimations === "function" ? e.getAnimations().filter(_temp23) : [];
      if (!runs.length) {
        onGone(t.id);
        return;
      }
      let on = true;
      Promise.all(runs.map(_temp25)).then(() => {
        if (on) {
          onGone(t.id);
        }
      });
      return () => {
        on = false;
      };
    };
    $[0] = leaving;
    $[1] = onGone;
    $[2] = t.id;
    $[3] = t0;
  } else {
    t0 = $[3];
  }
  let t1;
  if ($[4] !== leaving) {
    t1 = [leaving];
    $[4] = leaving;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  useIsoLayoutEffect(t0, t1);
  const sds = useSettings(ownWords);
  const duration = props.time;
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const paused = hovered || focused || hidden || held;
  const {
    clocks
  } = props;
  let t2;
  if ($[6] !== clocks || $[7] !== t.id) {
    t2 = () => clocks.get(t.id);
    $[6] = clocks;
    $[7] = t.id;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const [kept] = React.useState(t2);
  let t3;
  if ($[9] !== duration || $[10] !== kept || $[11] !== t) {
    t3 = kept && kept.item === t ? Math.max(0, timeLeft(kept)) : duration;
    $[9] = duration;
    $[10] = kept;
    $[11] = t;
    $[12] = t3;
  } else {
    t3 = $[12];
  }
  const left = React.useRef(t3);
  const shown = React.useRef(t);
  let t4;
  let t5;
  if ($[13] !== duration || $[14] !== t) {
    t4 = () => {
      if (shown.current !== t) {
        shown.current = t;
        left.current = duration;
      }
    };
    t5 = [t, duration];
    $[13] = duration;
    $[14] = t;
    $[15] = t4;
    $[16] = t5;
  } else {
    t4 = $[15];
    t5 = $[16];
  }
  React.useEffect(t4, t5);
  let t6;
  let t7;
  if ($[17] !== clocks || $[18] !== duration || $[19] !== leaving || $[20] !== paused || $[21] !== t) {
    t6 = () => {
      if (leaving) {
        return;
      }
      clocks.set(t.id, {
        item: t,
        left: left.current,
        since: null
      });
      if (!duration || paused) {
        return;
      }
      const start = Date.now();
      const timer = window.setTimeout(() => toast.dismiss(t.id), left.current);
      return () => {
        window.clearTimeout(timer);
        left.current = left.current - (Date.now() - start);
        clocks.set(t.id, {
          item: t,
          left: left.current,
          since: null
        });
      };
    };
    t7 = [paused, t, duration, leaving, clocks];
    $[17] = clocks;
    $[18] = duration;
    $[19] = leaving;
    $[20] = paused;
    $[21] = t;
    $[22] = t6;
    $[23] = t7;
  } else {
    t6 = $[22];
    t7 = $[23];
  }
  React.useEffect(t6, t7);
  let t8;
  let t9;
  if ($[24] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = () => {
      const vis = () => setHidden(document.hidden);
      document.addEventListener("visibilitychange", vis);
      return () => document.removeEventListener("visibilitychange", vis);
    };
    t9 = [];
    $[24] = t8;
    $[25] = t9;
  } else {
    t8 = $[24];
    t9 = $[25];
  }
  React.useEffect(t8, t9);
  const drag = React.useRef(null);
  let t10;
  if ($[26] !== leaving) {
    t10 = (e_0) => {
      if (leaving || e_0.pointerType !== "touch" || !e_0.isPrimary || e_0.target.closest("button, a, input, textarea, select")) {
        return;
      }
      drag.current = {
        id: e_0.pointerId,
        x: e_0.clientX,
        y: e_0.clientY,
        d: 0,
        on: false,
        s: [{
          t: e_0.timeStamp,
          p: 0
        }]
      };
    };
    $[26] = leaving;
    $[27] = t10;
  } else {
    t10 = $[27];
  }
  const onSwipeDown = t10;
  let t11;
  if ($[28] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = (e_1) => {
      const g = drag.current;
      if (!g || e_1.pointerId !== g.id) {
        return;
      }
      const d = e_1.clientX - g.x;
      const across = Math.abs(e_1.clientY - g.y);
      const el = e_1.currentTarget;
      if (!g.on) {
        if (across > 10 && across > Math.abs(d)) {
          drag.current = null;
          return;
        }
        if (Math.abs(d) < 10) {
          return;
        }
        g.on = true;
        setHeld(true);
        el.setAttribute("data-dragging", "");
        try {
          el.setPointerCapture(e_1.pointerId);
        } catch {
        }
      }
      g.d = d;
      track(g.s, e_1.timeStamp, d);
      el.style.translate = d + "px 0";
      el.style.opacity = String(Math.max(0, 1 - Math.abs(d) / el.offsetWidth));
    };
    $[28] = t11;
  } else {
    t11 = $[28];
  }
  const onSwipeMove = t11;
  let t12;
  if ($[29] !== t.id) {
    t12 = (e_2) => {
      const g_0 = drag.current;
      if (!g_0 || e_2.pointerId !== g_0.id) {
        return;
      }
      drag.current = null;
      const el_0 = e_2.currentTarget;
      const w = el_0.offsetWidth;
      const v = speed(g_0.s);
      const dir = Math.sign(g_0.d);
      el_0.removeAttribute("data-dragging");
      setHeld(false);
      if (!g_0.on) {
        return;
      }
      const away = v * dir;
      const out = e_2.type === "pointerup" && (away > 0.2 || Math.abs(g_0.d) > w / 3 && away > -0.1);
      if (out && !reducedMotion(el_0)) {
        el_0.style.transition = ["translate", "opacity"].map((p) => p + " " + settleTime(w - Math.abs(g_0.d), Math.max(0, away)) + "ms var(--ease-fling)").join(", ");
        el_0.style.translate = dir * w + "px 0";
        el_0.style.opacity = "0";
      } else {
        el_0.style.translate = el_0.style.opacity = "";
      }
      if (!out) {
        return;
      }
      toast.dismiss(t.id);
    };
    $[29] = t.id;
    $[30] = t12;
  } else {
    t12 = $[30];
  }
  const onSwipeEnd = t12;
  const titleId = t.id + "-title";
  const descId = t.id + "-desc";
  const locale = useLocale();
  const icon = ICONS[t.tone];
  const actionBelow = !!t.action && t.action.label.length > 12;
  const t13 = "srp-toast--" + t.tone;
  let t14;
  if ($[31] !== t13) {
    t14 = cn("srp-toast", t13);
    $[31] = t13;
    $[32] = t14;
  } else {
    t14 = $[32];
  }
  const t15 = actionBelow ? "below" : void 0;
  const t16 = leaving ? leaving === "queued" ? "queued" : "" : void 0;
  const t17 = props.instant ? "" : void 0;
  const t18 = leaving ? true : void 0;
  const t19 = t.description != null ? descId : void 0;
  let t20;
  let t21;
  let t22;
  let t23;
  if ($[33] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = () => setHovered(true);
    t21 = () => setHovered(false);
    t22 = () => setFocused(true);
    t23 = (e_3) => {
      if (!e_3.currentTarget.contains(e_3.relatedTarget)) {
        setFocused(false);
      }
    };
    $[33] = t20;
    $[34] = t21;
    $[35] = t22;
    $[36] = t23;
  } else {
    t20 = $[33];
    t21 = $[34];
    t22 = $[35];
    t23 = $[36];
  }
  let t24;
  if ($[37] !== icon) {
    t24 = icon ? /* @__PURE__ */ React.createElement("span", { className: "srp-toast__icon", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { icon })) : null;
    $[37] = icon;
    $[38] = t24;
  } else {
    t24 = $[38];
  }
  let t25;
  if ($[39] !== locale || $[40] !== sds || $[41] !== t.count) {
    t25 = t.count > 1 ? /* @__PURE__ */ React.createElement("span", { className: "srp-toast__count" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\xD7" + displayNumber(t.count, locale, {
      useGrouping: false
    })), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, ", " + sds.labels.toastRepeated(t.count, displayNumber(t.count, locale)))) : null;
    $[39] = locale;
    $[40] = sds;
    $[41] = t.count;
    $[42] = t25;
  } else {
    t25 = $[42];
  }
  let t26;
  if ($[43] !== t.title || $[44] !== t25 || $[45] !== titleId) {
    t26 = /* @__PURE__ */ React.createElement("p", { className: "srp-toast__title", id: titleId }, t.title, t25);
    $[43] = t.title;
    $[44] = t25;
    $[45] = titleId;
    $[46] = t26;
  } else {
    t26 = $[46];
  }
  let t27;
  if ($[47] !== descId || $[48] !== t.description) {
    t27 = t.description != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-toast__description", id: descId }, t.description) : null;
    $[47] = descId;
    $[48] = t.description;
    $[49] = t27;
  } else {
    t27 = $[49];
  }
  let t28;
  if ($[50] !== t26 || $[51] !== t27) {
    t28 = /* @__PURE__ */ React.createElement("div", { className: "srp-toast__content" }, t26, t27);
    $[50] = t26;
    $[51] = t27;
    $[52] = t28;
  } else {
    t28 = $[52];
  }
  let t29;
  if ($[53] !== t.action || $[54] !== t.id) {
    t29 = t.action ? /* @__PURE__ */ React.createElement(Button, { className: "srp-toast__action", size: "sm", variant: "secondary", onClick: () => {
      t.action.onClick();
      toast.dismiss(t.id);
    } }, t.action.label) : null;
    $[53] = t.action;
    $[54] = t.id;
    $[55] = t29;
  } else {
    t29 = $[55];
  }
  let t30;
  if ($[56] !== t.id) {
    t30 = () => toast.dismiss(t.id);
    $[56] = t.id;
    $[57] = t30;
  } else {
    t30 = $[57];
  }
  let t31;
  if ($[58] !== props.dismissLabel || $[59] !== t30 || $[60] !== titleId) {
    t31 = /* @__PURE__ */ React.createElement(IconButton, { className: "srp-toast__close", icon: icons.Close, label: props.dismissLabel, "aria-describedby": titleId, size: "sm", hideTitle: true, onClick: t30 });
    $[58] = props.dismissLabel;
    $[59] = t30;
    $[60] = titleId;
    $[61] = t31;
  } else {
    t31 = $[61];
  }
  let t32;
  if ($[62] !== onSwipeDown || $[63] !== onSwipeEnd || $[64] !== t.id || $[65] !== t.tone || $[66] !== t14 || $[67] !== t15 || $[68] !== t16 || $[69] !== t17 || $[70] !== t18 || $[71] !== t19 || $[72] !== t24 || $[73] !== t28 || $[74] !== t29 || $[75] !== t31 || $[76] !== titleId) {
    t32 = /* @__PURE__ */ React.createElement("li", { ref: self, tabIndex: -1, className: t14, "data-tone": t.tone, "data-toast": t.id, "data-action": t15, "data-leaving": t16, "data-instant": t17, inert: t18, "aria-labelledby": titleId, "aria-describedby": t19, onPointerDown: onSwipeDown, onPointerMove: onSwipeMove, onPointerUp: onSwipeEnd, onPointerCancel: onSwipeEnd, onMouseEnter: t20, onMouseLeave: t21, onFocus: t22, onBlur: t23 }, t24, t28, t29, t31);
    $[62] = onSwipeDown;
    $[63] = onSwipeEnd;
    $[64] = t.id;
    $[65] = t.tone;
    $[66] = t14;
    $[67] = t15;
    $[68] = t16;
    $[69] = t17;
    $[70] = t18;
    $[71] = t19;
    $[72] = t24;
    $[73] = t28;
    $[74] = t29;
    $[75] = t31;
    $[76] = titleId;
    $[77] = t32;
  } else {
    t32 = $[77];
  }
  return t32;
}
function _temp25(a_0) {
  return a_0.finished.catch(_temp24);
}
function _temp24() {
}
function _temp23(a) {
  return a.id !== "srp-toast-move";
}
export {
  Toaster,
  toast,
  watchToasts
};
//# sourceMappingURL=Toast.js.map
