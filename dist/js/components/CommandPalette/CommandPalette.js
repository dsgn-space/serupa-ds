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
function CommandPaletteRender(t0) {
  const $ = _c(112);
  const {
    ref,
    onOpenChange,
    commands,
    limit,
    ...props
  } = t0;
  const sds = useSettings(words);
  const labels = sds.labels;
  const locale = useLocale();
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
  let t1;
  if ($[0] !== controlled || $[1] !== onOpenChange || $[2] !== setOwn) {
    t1 = (next, details) => {
      if (!controlled) {
        setOwn(next);
      }
      if (onOpenChange) {
        onOpenChange(next, details);
      }
    };
    $[0] = controlled;
    $[1] = onOpenChange;
    $[2] = setOwn;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const change = t1;
  const keys = props.hotkey === false ? null : props.hotkey && props.hotkey.length ? props.hotkey : ["mod", "K"];
  let t2;
  if ($[4] !== change) {
    t2 = () => change(true, {
      reason: "trigger"
    });
    $[4] = change;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const t3 = !!keys && !open;
  let t4;
  if ($[6] !== labels.commandPalette || $[7] !== t3) {
    t4 = {
      description: labels.commandPalette,
      enabled: t3
    };
    $[6] = labels.commandPalette;
    $[7] = t3;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  useShortcut(keys || [], t2, t4);
  const [query, setOwnQuery, queryControlled] = useControllable(props.query ?? void 0, "", "CommandPalette", "query");
  const [active, setActive] = React.useState(0);
  const [was, setWas] = React.useState(open);
  if (was !== open) {
    setWas(open);
    if (open) {
      if (!queryControlled) {
        setOwnQuery("");
      }
      setActive(0);
    }
  }
  const told = React.useRef(query);
  const onQuery = useLatest(props.onQueryChange);
  let t5;
  let t6;
  if ($[9] !== onQuery || $[10] !== query || $[11] !== queryControlled) {
    t5 = () => {
      if (told.current === query) {
        return;
      }
      told.current = query;
      if (!queryControlled && onQuery.current) {
        onQuery.current(query);
      }
    };
    t6 = [query, queryControlled, onQuery];
    $[9] = onQuery;
    $[10] = query;
    $[11] = queryControlled;
    $[12] = t5;
    $[13] = t6;
  } else {
    t5 = $[12];
    t6 = $[13];
  }
  React.useEffect(t5, t6);
  let t7;
  if ($[14] !== onQuery || $[15] !== queryControlled || $[16] !== setOwnQuery) {
    t7 = (v) => {
      if (!queryControlled) {
        setOwnQuery(v);
        return;
      }
      told.current = v;
      if (onQuery.current) {
        onQuery.current(v);
      }
    };
    $[14] = onQuery;
    $[15] = queryControlled;
    $[16] = setOwnQuery;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  const setQuery = t7;
  let t8;
  if ($[18] !== query) {
    t8 = fold(query.trim());
    $[18] = query;
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  const q = t8;
  const own = props.filter !== false;
  const loading = !!props.loading;
  let t9;
  if ($[20] !== commands || $[21] !== limit || $[22] !== own || $[23] !== q) {
    bb0: {
      if (!own) {
        let t103;
        if ($[25] !== commands) {
          t103 = commands.map(_temp);
          $[25] = commands;
          $[26] = t103;
        } else {
          t103 = $[26];
        }
        t9 = t103;
        break bb0;
      }
      let t102;
      if ($[27] !== q) {
        t102 = (c_0, i_0) => ({
          c: c_0,
          i: i_0,
          s: score(c_0, q)
        });
        $[27] = q;
        $[28] = t102;
      } else {
        t102 = $[28];
      }
      const all = commands.map(t102).filter(_temp2);
      if (!q) {
        t9 = all;
        break bb0;
      }
      const near = _temp3;
      let t112;
      if ($[29] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
        t112 = (a, b) => b.s - a.s || near(a) - near(b) || a.i - b.i;
        $[29] = t112;
      } else {
        t112 = $[29];
      }
      t9 = all.sort(t112).slice(0, limit && limit > 0 ? limit : 50);
    }
    $[20] = commands;
    $[21] = limit;
    $[22] = own;
    $[23] = q;
    $[24] = t9;
  } else {
    t9 = $[24];
  }
  const rows = t9;
  let m;
  if ($[30] !== labels.otherCommands || $[31] !== rows) {
    m = /* @__PURE__ */ new Map();
    for (const r_1 of rows) {
      const g = r_1.c.group || labels.otherCommands;
      m.set(g, (m.get(g) || []).concat(r_1));
    }
    $[30] = labels.otherCommands;
    $[31] = rows;
    $[32] = m;
  } else {
    m = $[32];
  }
  let t10;
  if ($[33] !== m) {
    t10 = [...m];
    $[33] = m;
    $[34] = t10;
  } else {
    t10 = $[34];
  }
  const groups = t10;
  const usable = groups.flatMap(_temp4).filter(_temp5);
  const current = usable[Math.min(active, usable.length - 1)] ?? null;
  const base = domId("srp-cmdk", React.useId());
  let t11;
  if ($[35] !== base) {
    t11 = (r_3) => base + "-opt-" + r_3.i;
    $[35] = base;
    $[36] = t11;
  } else {
    t11 = $[36];
  }
  const optId = t11;
  const list = React.useRef(null);
  const field = React.useRef(null);
  const currentId = current ? optId(current) : null;
  let t12;
  let t13;
  if ($[37] !== currentId || $[38] !== open) {
    t12 = () => {
      if (!open || !currentId || !list.current) {
        return;
      }
      const el = list.current.querySelector("#" + currentId);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({
          block: "nearest"
        });
      }
    };
    t13 = [open, currentId];
    $[37] = currentId;
    $[38] = open;
    $[39] = t12;
    $[40] = t13;
  } else {
    t12 = $[39];
    t13 = $[40];
  }
  React.useEffect(t12, t13);
  const empty = typeof props.emptyText === "string" ? props.emptyText : labels.noCommands;
  const said = !query.trim() || loading ? "" : usable.length ? labels.commandsCount(usable.length, numberFormat(locale).format(usable.length)) : empty;
  React.useEffect(() => {
    if (!open || !said) {
      return;
    }
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [open, said, query]);
  const [chosen, setChosen] = React.useState(null);
  const done = useLatest(props.onSelect);
  let t14;
  let t15;
  if ($[41] !== chosen || $[42] !== done) {
    t14 = () => {
      if (!chosen) {
        return;
      }
      setChosen(null);
      const c_1 = chosen.c;
      if (c_1.onSelect) {
        c_1.onSelect();
      } else {
        if (c_1.href && typeof window !== "undefined") {
          go(c_1.href);
        }
      }
      if (done.current) {
        done.current(c_1);
      }
    };
    t15 = [chosen, done];
    $[41] = chosen;
    $[42] = done;
    $[43] = t14;
    $[44] = t15;
  } else {
    t14 = $[43];
    t15 = $[44];
  }
  React.useEffect(t14, t15);
  let t16;
  if ($[45] !== change) {
    t16 = (r_4) => {
      if (!r_4 || r_4.c.disabled) {
        return;
      }
      change(false, {
        reason: "select"
      });
      setChosen({
        c: r_4.c
      });
    };
    $[45] = change;
    $[46] = t16;
  } else {
    t16 = $[46];
  }
  const choose = t16;
  let t17;
  if ($[47] !== setActive || $[48] !== usable.length) {
    t17 = (to) => {
      if (usable.length) {
        setActive((to + usable.length) % usable.length);
      }
    };
    $[47] = setActive;
    $[48] = usable.length;
    $[49] = t17;
  } else {
    t17 = $[49];
  }
  const move = t17;
  let t18;
  if ($[50] !== current || $[51] !== setActive || $[52] !== usable) {
    t18 = (r_5) => {
      if (!r_5.c.disabled && current !== r_5) {
        setActive(usable.indexOf(r_5));
      }
    };
    $[50] = current;
    $[51] = setActive;
    $[52] = usable;
    $[53] = t18;
  } else {
    t18 = $[53];
  }
  let t19;
  if ($[54] !== choose || $[55] !== t18) {
    t19 = {
      choose,
      hover: t18
    };
    $[54] = choose;
    $[55] = t18;
    $[56] = t19;
  } else {
    t19 = $[56];
  }
  const handlers = t19;
  const live = useLatest(handlers);
  let t20;
  if ($[57] !== live) {
    t20 = {
      choose: (r_6) => live.current.choose(r_6),
      hover: (r_7) => live.current.hover(r_7)
    };
    $[57] = live;
    $[58] = t20;
  } else {
    t20 = $[58];
  }
  const act = t20;
  const at = current ? usable.indexOf(current) : 0;
  let t21;
  if ($[59] !== at || $[60] !== choose || $[61] !== current || $[62] !== move || $[63] !== usable.length) {
    t21 = (e) => {
      if (isComposing(e)) {
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        move(at + 1);
      } else {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          move(at - 1);
        } else {
          if (e.key === "PageDown") {
            e.preventDefault();
            move(usable.length - 1);
          } else {
            if (e.key === "PageUp") {
              e.preventDefault();
              move(0);
            } else {
              if (e.key === "Enter") {
                e.preventDefault();
                choose(current);
              }
            }
          }
        }
      }
    };
    $[59] = at;
    $[60] = choose;
    $[61] = current;
    $[62] = move;
    $[63] = usable.length;
    $[64] = t21;
  } else {
    t21 = $[64];
  }
  const onKeyDown = t21;
  const T0 = Dialog;
  const t22 = cn("srp-command-palette", props.className);
  const t23 = rest["aria-label"] || labels.commandPalette;
  const t24 = props.closeOnBackdrop;
  const t25 = props.finalFocus;
  const t26 = base + "-list";
  const t27 = currentId || void 0;
  const t28 = props.placeholder || labels.searchCommands;
  const t29 = props.placeholder || labels.searchCommands;
  let t30;
  if ($[65] !== setActive || $[66] !== setQuery) {
    t30 = (e_0) => {
      setQuery(e_0.currentTarget.value);
      setActive(0);
    };
    $[65] = setActive;
    $[66] = setQuery;
    $[67] = t30;
  } else {
    t30 = $[67];
  }
  let t31;
  if ($[68] !== onKeyDown || $[69] !== query || $[70] !== t26 || $[71] !== t27 || $[72] !== t28 || $[73] !== t29 || $[74] !== t30) {
    t31 = /* @__PURE__ */ React.createElement("input", { ref: field, className: "srp-command-palette__field", type: "text", role: "combobox", "aria-expanded": "true", "aria-controls": t26, "aria-autocomplete": "list", "aria-activedescendant": t27, "aria-label": t28, placeholder: t29, autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false, value: query, onChange: t30, onKeyDown });
    $[68] = onKeyDown;
    $[69] = query;
    $[70] = t26;
    $[71] = t27;
    $[72] = t28;
    $[73] = t29;
    $[74] = t30;
    $[75] = t31;
  } else {
    t31 = $[75];
  }
  const t32 = base + "-list";
  const t33 = labels.commandPalette;
  const t34 = loading || void 0;
  let t35;
  if ($[76] !== act || $[77] !== base || $[78] !== current || $[79] !== groups || $[80] !== optId || $[81] !== query) {
    t35 = groups.map((t362, g_0) => {
      const [name, rs_0] = t362;
      return /* @__PURE__ */ React.createElement("div", { key: name, role: "group", "aria-labelledby": base + "-g" + g_0, className: "srp-command-palette__group" }, /* @__PURE__ */ React.createElement("div", { id: base + "-g" + g_0, role: "presentation", className: "srp-command-palette__heading" }, name), rs_0.map((r_8) => /* @__PURE__ */ React.createElement(Option, { key: r_8.c.id, r: r_8, id: optId(r_8), on: current === r_8, query, act })));
    });
    $[76] = act;
    $[77] = base;
    $[78] = current;
    $[79] = groups;
    $[80] = optId;
    $[81] = query;
    $[82] = t35;
  } else {
    t35 = $[82];
  }
  let t36;
  if ($[83] !== labels.commandPalette || $[84] !== t32 || $[85] !== t34 || $[86] !== t35) {
    t36 = /* @__PURE__ */ React.createElement("div", { ref: list, id: t32, role: "listbox", "aria-label": t33, "aria-busy": t34, className: "srp-command-palette__list" }, t35);
    $[83] = labels.commandPalette;
    $[84] = t32;
    $[85] = t34;
    $[86] = t35;
    $[87] = t36;
  } else {
    t36 = $[87];
  }
  let t37;
  if ($[88] !== labels.loading || $[89] !== loading || $[90] !== props.loadingText) {
    t37 = loading ? /* @__PURE__ */ React.createElement("p", { className: "srp-command-palette__empty srp-command-palette__loading", role: "status" }, /* @__PURE__ */ React.createElement(LoaderRing, { size: "sm" }), props.loadingText || labels.loading) : null;
    $[88] = labels.loading;
    $[89] = loading;
    $[90] = props.loadingText;
    $[91] = t37;
  } else {
    t37 = $[91];
  }
  let t38;
  if ($[92] !== labels.noCommands || $[93] !== loading || $[94] !== props.emptyText || $[95] !== query || $[96] !== usable.length) {
    t38 = !usable.length && query.trim() && !loading ? /* @__PURE__ */ React.createElement("p", { className: "srp-command-palette__empty" }, props.emptyText != null ? props.emptyText : labels.noCommands) : null;
    $[92] = labels.noCommands;
    $[93] = loading;
    $[94] = props.emptyText;
    $[95] = query;
    $[96] = usable.length;
    $[97] = t38;
  } else {
    t38 = $[97];
  }
  let t39;
  if ($[98] !== T0 || $[99] !== change || $[100] !== open || $[101] !== props.closeOnBackdrop || $[102] !== props.finalFocus || $[103] !== ref || $[104] !== rest || $[105] !== t22 || $[106] !== t23 || $[107] !== t31 || $[108] !== t36 || $[109] !== t37 || $[110] !== t38) {
    t39 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, className: t22, "aria-label": t23, open, onOpenChange: change, closeButton: false, initialFocus: field, closeOnBackdrop: t24, finalFocus: t25 }, t31, t36, t37, t38);
    $[98] = T0;
    $[99] = change;
    $[100] = open;
    $[101] = props.closeOnBackdrop;
    $[102] = props.finalFocus;
    $[103] = ref;
    $[104] = rest;
    $[105] = t22;
    $[106] = t23;
    $[107] = t31;
    $[108] = t36;
    $[109] = t37;
    $[110] = t38;
    $[111] = t39;
  } else {
    t39 = $[111];
  }
  return t39;
}
function _temp5(r_2) {
  return !r_2.c.disabled;
}
function _temp4(t0) {
  const [, rs] = t0;
  return rs;
}
function _temp3(r_0) {
  return r_0.s > 1 ? r_0.c.label.length : 0;
}
function _temp2(r) {
  return r.s > 0;
}
function _temp(c, i) {
  return {
    c,
    i,
    s: 1
  };
}
var CommandPalette = /* @__PURE__ */ named("CommandPalette", CommandPaletteRender);
var Option = /* @__PURE__ */ React.memo(function Option2(t0) {
  const $ = _c(31);
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
  const t6 = on ? "" : void 0;
  const t7 = r.c.disabled ? "" : void 0;
  let t10;
  let t8;
  let t9;
  if ($[3] !== act || $[4] !== r) {
    t8 = () => act.hover(r);
    t9 = () => act.choose(r);
    t10 = (e_0) => {
      if (e_0.key === "Enter" || e_0.key === " ") {
        e_0.preventDefault();
        act.choose(r);
      }
    };
    $[3] = act;
    $[4] = r;
    $[5] = t10;
    $[6] = t8;
    $[7] = t9;
  } else {
    t10 = $[5];
    t8 = $[6];
    t9 = $[7];
  }
  let t11;
  if ($[8] !== r.c.icon) {
    t11 = r.c.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-command-palette__icon", "aria-hidden": true }, asIcon(r.c.icon)) : null;
    $[8] = r.c.icon;
    $[9] = t11;
  } else {
    t11 = $[9];
  }
  let t12;
  if ($[10] !== id || $[11] !== query || $[12] !== r.c.description || $[13] !== r.c.label) {
    t12 = r.c.description ? /* @__PURE__ */ React.createElement("span", { className: "srp-command-palette__text" }, /* @__PURE__ */ React.createElement(Highlight, { className: "srp-command-palette__label", query }, r.c.label), /* @__PURE__ */ React.createElement("span", { id: `${id}-d`, className: "srp-command-palette__description" }, r.c.description)) : /* @__PURE__ */ React.createElement(Highlight, { className: "srp-command-palette__label", query }, r.c.label);
    $[10] = id;
    $[11] = query;
    $[12] = r.c.description;
    $[13] = r.c.label;
    $[14] = t12;
  } else {
    t12 = $[14];
  }
  let t13;
  if ($[15] !== r.c.shortcut) {
    t13 = r.c.shortcut && r.c.shortcut.length ? /* @__PURE__ */ React.createElement(Kbd, { className: "srp-command-palette__keys", keys: r.c.shortcut }) : null;
    $[15] = r.c.shortcut;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  let t14;
  if ($[17] !== id || $[18] !== on || $[19] !== t1 || $[20] !== t10 || $[21] !== t11 || $[22] !== t12 || $[23] !== t13 || $[24] !== t2 || $[25] !== t5 || $[26] !== t6 || $[27] !== t7 || $[28] !== t8 || $[29] !== t9) {
    t14 = /* @__PURE__ */ React.createElement("div", { id, role: "option", tabIndex: -1, "aria-selected": on, "aria-disabled": t1, "aria-describedby": t2, className: t5, "data-active": t6, "data-disabled": t7, onMouseDown: _temp6, onMouseMove: t8, onClick: t9, onKeyDown: t10 }, t11, t12, t13);
    $[17] = id;
    $[18] = on;
    $[19] = t1;
    $[20] = t10;
    $[21] = t11;
    $[22] = t12;
    $[23] = t13;
    $[24] = t2;
    $[25] = t5;
    $[26] = t6;
    $[27] = t7;
    $[28] = t8;
    $[29] = t9;
    $[30] = t14;
  } else {
    t14 = $[30];
  }
  return t14;
});
function _temp6(e) {
  return e.preventDefault();
}
export {
  CommandPalette
};
//# sourceMappingURL=CommandPalette.js.map
