"use client";

// src/components/CommandPalette/CommandPalette.tsx
import { c as _c } from "../../internal/memoCache.js";
import { numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { useControllable } from "../../internal/controllable.js";
import { cn, domId, omit, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { announce } from "../../internal/announce.js";
import { isComposing } from "../../internal/ime.js";
import { fold } from "../../internal/fold.js";
import { announcePause } from "../../internal/timing.js";
import { LoaderRing } from "../../internal/loaderRing.js";
import { asIcon } from "../Icon/asIcon.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Highlight } from "../Highlight/Highlight.js";
import { Kbd } from "../Kbd/Kbd.js";
import { useShortcut } from "../../internal/shortcuts.js";
import { en as words } from "./labels.js";
import { warnOnce } from "../../internal/warn.js";
import { leave } from "../../internal/leave.js";
function go(href) {
  if (!leave(href) && process.env.NODE_ENV !== "production") warnOnce("command-palette-href", "CommandPalette: a command's href " + JSON.stringify(href) + " isn't a web page, mailto: or tel: link, so choosing it does nothing. Use onSelect to run code.");
}
function score(c, q) {
  if (!q) return 1;
  const label = fold(c.label);
  if (label === q) return 5;
  if (label.startsWith(q)) return 4;
  const at = label.indexOf(q);
  if (at > 0 && /[\s\-_/.:]/.test(label.charAt(at - 1))) return 3;
  if (at > 0) return 2;
  return (c.keywords || []).concat(c.description || []).some((k) => fold(k).includes(q)) ? 1 : 0;
}
function CommandPaletteRender({
  ref,
  ...props
}) {
  const sds = useSettings(words), labels = sds.labels, locale = useLocale();
  const rest = omit(props, {
    commands: 1,
    onSelect: 1,
    hotkey: 1,
    placeholder: 1,
    emptyText: 1,
    limit: 1,
    query: 1,
    onQueryChange: 1,
    filter: 1,
    loading: 1,
    loadingText: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    className: 1,
    closeOnBackdrop: 1,
    finalFocus: 1
  });
  const [openIn, setOwn, controlled] = useControllable(props.open == null ? void 0 : props.open, !!props.defaultOpen, "CommandPalette", "open");
  const open = !!openIn;
  const {
    onOpenChange
  } = props;
  const change = React.useCallback((next, details) => {
    if (!controlled) setOwn(next);
    if (onOpenChange) onOpenChange(next, details);
  }, [onOpenChange, controlled, setOwn]);
  const keys = props.hotkey === false ? null : props.hotkey && props.hotkey.length ? props.hotkey : ["mod", "K"];
  useShortcut(keys || [], () => change(true, {
    reason: "trigger"
  }), {
    description: labels.commandPalette,
    enabled: !!keys && !open
  });
  const [query, setOwnQuery, queryControlled] = useControllable(props.query ?? void 0, "", "CommandPalette", "query");
  const [active, setActive] = React.useState(0);
  const [was, setWas] = React.useState(open);
  if (was !== open) {
    setWas(open);
    if (open) {
      if (!queryControlled) setOwnQuery("");
      setActive(0);
    }
  }
  const told = React.useRef(query);
  const onQuery = useLatest(props.onQueryChange);
  React.useEffect(() => {
    if (told.current === query) return;
    told.current = query;
    if (!queryControlled && onQuery.current) onQuery.current(query);
  }, [query, queryControlled, onQuery]);
  const setQuery = (v) => {
    if (!queryControlled) {
      setOwnQuery(v);
      return;
    }
    told.current = v;
    if (onQuery.current) onQuery.current(v);
  };
  const q = fold(query.trim());
  const {
    commands,
    limit
  } = props;
  const own = props.filter !== false, loading = !!props.loading;
  const rows = React.useMemo(() => {
    if (!own) return commands.map((c, i) => ({
      c,
      i,
      s: 1
    }));
    const all = commands.map((c_0, i_0) => ({
      c: c_0,
      i: i_0,
      s: score(c_0, q)
    })).filter((r) => r.s > 0);
    if (!q) return all;
    const near = (r_0) => r_0.s > 1 ? r_0.c.label.length : 0;
    return all.sort((a, b) => b.s - a.s || near(a) - near(b) || a.i - b.i).slice(0, limit && limit > 0 ? limit : 50);
  }, [commands, q, limit, own]);
  const groups = React.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const r_1 of rows) {
      const g = r_1.c.group || labels.otherCommands;
      m.set(g, (m.get(g) || []).concat(r_1));
    }
    return [...m];
  }, [rows, labels.otherCommands]);
  const usable = groups.flatMap(([, rs]) => rs).filter((r_2) => !r_2.c.disabled);
  const current = usable[Math.min(active, usable.length - 1)] ?? null;
  const base = domId("srp-cmdk", React.useId());
  const optId = (r_3) => base + "-opt-" + r_3.i;
  const list = React.useRef(null);
  const field = React.useRef(null);
  const currentId = current ? optId(current) : null;
  React.useEffect(() => {
    if (!open || !currentId || !list.current) return;
    const el = list.current.querySelector("#" + currentId);
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({
      block: "nearest"
    });
  }, [open, currentId]);
  const empty = typeof props.emptyText === "string" ? props.emptyText : labels.noCommands;
  const said = !query.trim() || loading ? "" : usable.length ? labels.commandsCount(usable.length, numberFormat(locale).format(usable.length)) : empty;
  React.useEffect(() => {
    if (!open || !said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [open, said, query]);
  const [chosen, setChosen] = React.useState(null);
  const done = useLatest(props.onSelect);
  React.useEffect(() => {
    if (!chosen) return;
    setChosen(null);
    const c_1 = chosen.c;
    if (c_1.onSelect) c_1.onSelect();
    else if (c_1.href && typeof window !== "undefined") go(c_1.href);
    if (done.current) done.current(c_1);
  }, [chosen, done]);
  const choose = (r_4) => {
    if (!r_4 || r_4.c.disabled) return;
    change(false, {
      reason: "select"
    });
    setChosen({
      c: r_4.c
    });
  };
  const move = (to) => {
    if (usable.length) setActive((to + usable.length) % usable.length);
  };
  const handlers = {
    choose,
    hover: (r_5) => {
      if (!r_5.c.disabled && current !== r_5) setActive(usable.indexOf(r_5));
    }
  };
  const live = React.useRef(handlers);
  live.current = handlers;
  const act = React.useMemo(() => ({
    choose: (r_6) => live.current.choose(r_6),
    hover: (r_7) => live.current.hover(r_7)
  }), []);
  const at = current ? usable.indexOf(current) : 0;
  const onKeyDown = (e) => {
    if (isComposing(e)) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(at + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(at - 1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      move(usable.length - 1);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      move(0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(current);
    }
  };
  return /* @__PURE__ */ React.createElement(Dialog, { ...rest, ref, className: cn("srp-command-palette", props.className), "aria-label": rest["aria-label"] || labels.commandPalette, open, onOpenChange: change, closeButton: false, initialFocus: field, closeOnBackdrop: props.closeOnBackdrop, finalFocus: props.finalFocus }, /* @__PURE__ */ React.createElement("input", { ref: field, className: "srp-command-palette__field", type: "text", role: "combobox", "aria-expanded": "true", "aria-controls": base + "-list", "aria-autocomplete": "list", "aria-activedescendant": currentId || void 0, "aria-label": props.placeholder || labels.searchCommands, placeholder: props.placeholder || labels.searchCommands, autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false, value: query, onChange: (e_0) => {
    setQuery(e_0.currentTarget.value);
    setActive(0);
  }, onKeyDown }), /* @__PURE__ */ React.createElement("div", { ref: list, id: base + "-list", role: "listbox", "aria-label": labels.commandPalette, "aria-busy": loading || void 0, className: "srp-command-palette__list" }, groups.map(([name, rs_0], g_0) => /* @__PURE__ */ React.createElement("div", { key: name, role: "group", "aria-labelledby": base + "-g" + g_0, className: "srp-command-palette__group" }, /* @__PURE__ */ React.createElement("div", { id: base + "-g" + g_0, role: "presentation", className: "srp-command-palette__heading" }, name), rs_0.map((r_8) => /* @__PURE__ */ React.createElement(Option, { key: r_8.c.id, r: r_8, id: optId(r_8), on: current === r_8, query, act }))))), loading ? /* @__PURE__ */ React.createElement("p", { className: "srp-command-palette__empty srp-command-palette__loading", role: "status" }, /* @__PURE__ */ React.createElement(LoaderRing, { size: "sm" }), props.loadingText || labels.loading) : null, !usable.length && query.trim() && !loading ? /* @__PURE__ */ React.createElement("p", { className: "srp-command-palette__empty" }, props.emptyText != null ? props.emptyText : labels.noCommands) : null);
}
var CommandPalette = /* @__PURE__ */ named("CommandPalette", CommandPaletteRender);
var Option = /* @__PURE__ */ React.memo(function Option2(t0) {
  const $ = _c(29);
  const {
    r,
    id,
    on,
    query,
    act
  } = t0;
  const t1 = r.c.disabled || void 0;
  const t2 = r.c.description ? `${id}-d` : void 0;
  const t3 = on && "srp-command-palette__option--active";
  const t4 = r.c.disabled && "srp-command-palette__option--disabled";
  let t5;
  if ($[0] !== t3 || $[1] !== t4) {
    t5 = cn("srp-command-palette__option", t3, t4);
    $[0] = t3;
    $[1] = t4;
    $[2] = t5;
  } else {
    t5 = $[2];
  }
  let t6;
  let t7;
  let t8;
  if ($[3] !== act || $[4] !== r) {
    t6 = () => act.hover(r);
    t7 = () => act.choose(r);
    t8 = (e_0) => {
      if (e_0.key === "Enter" || e_0.key === " ") {
        e_0.preventDefault();
        act.choose(r);
      }
    };
    $[3] = act;
    $[4] = r;
    $[5] = t6;
    $[6] = t7;
    $[7] = t8;
  } else {
    t6 = $[5];
    t7 = $[6];
    t8 = $[7];
  }
  let t9;
  if ($[8] !== r.c.icon) {
    t9 = r.c.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-command-palette__icon", "aria-hidden": true }, asIcon(r.c.icon)) : null;
    $[8] = r.c.icon;
    $[9] = t9;
  } else {
    t9 = $[9];
  }
  let t10;
  if ($[10] !== id || $[11] !== query || $[12] !== r.c.description || $[13] !== r.c.label) {
    t10 = r.c.description ? /* @__PURE__ */ React.createElement("span", { className: "srp-command-palette__text" }, /* @__PURE__ */ React.createElement(Highlight, { className: "srp-command-palette__label", query }, r.c.label), /* @__PURE__ */ React.createElement("span", { id: `${id}-d`, className: "srp-command-palette__description" }, r.c.description)) : /* @__PURE__ */ React.createElement(Highlight, { className: "srp-command-palette__label", query }, r.c.label);
    $[10] = id;
    $[11] = query;
    $[12] = r.c.description;
    $[13] = r.c.label;
    $[14] = t10;
  } else {
    t10 = $[14];
  }
  let t11;
  if ($[15] !== r.c.shortcut) {
    t11 = r.c.shortcut && r.c.shortcut.length ? /* @__PURE__ */ React.createElement(Kbd, { className: "srp-command-palette__keys", keys: r.c.shortcut, size: "sm" }) : null;
    $[15] = r.c.shortcut;
    $[16] = t11;
  } else {
    t11 = $[16];
  }
  let t12;
  if ($[17] !== id || $[18] !== on || $[19] !== t1 || $[20] !== t10 || $[21] !== t11 || $[22] !== t2 || $[23] !== t5 || $[24] !== t6 || $[25] !== t7 || $[26] !== t8 || $[27] !== t9) {
    t12 = /* @__PURE__ */ React.createElement("div", { id, role: "option", tabIndex: -1, "aria-selected": on, "aria-disabled": t1, "aria-describedby": t2, className: t5, onMouseDown: _temp, onMouseMove: t6, onClick: t7, onKeyDown: t8 }, t9, t10, t11);
    $[17] = id;
    $[18] = on;
    $[19] = t1;
    $[20] = t10;
    $[21] = t11;
    $[22] = t2;
    $[23] = t5;
    $[24] = t6;
    $[25] = t7;
    $[26] = t8;
    $[27] = t9;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return t12;
});
function _temp(e) {
  return e.preventDefault();
}
export {
  CommandPalette
};
//# sourceMappingURL=CommandPalette.js.map
