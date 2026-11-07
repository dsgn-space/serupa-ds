"use client";

// src/components/Combobox/Combobox.tsx
import * as React from "react";
import { pressFocuses } from "../../internal/affix.js";
import { cn, domId, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { warnOnce } from "../../internal/warn.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { Loader } from "../Loader/Loader.js";
import { component } from "../../internal/component.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { isComposing } from "../../internal/ime.js";
import { fieldName } from "../../internal/fieldName.js";
import * as icons from "../../material/builtin.js";
import { fold } from "../../internal/fold.js";
import { announce } from "../../internal/announce.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { Badge } from "../Badge/Badge.js";
import { Highlight } from "../Highlight/Highlight.js";
import { en as words } from "./labels.js";
import { windowBlur } from "../../internal/focus.js";
import { announcePause, typingPause } from "../../internal/timing.js";
import { useVirtual } from "../../internal/virtual.js";
var list = (v) => Array.isArray(v) ? v : [];
var ROW = 32;
var isGroup = (o) => typeof o === "object" && o !== null && Array.isArray(o.options);
function toOpts(source) {
  const out = [];
  const add = (o, g, gl, off) => {
    const x = typeof o === "string" ? { value: o, label: o } : { value: String(o.value), label: String(o.label ?? o.value), description: o.description };
    out.push({ ...x, disabled: typeof o !== "string" && !!o.disabled || !!off, i: out.length, folded: fold(x.label), g, gl });
  };
  (source || []).forEach((o, k) => {
    if (isGroup(o)) for (const x of o.options) add(x, k, String(o.label), o.disabled);
    else add(o);
  });
  return out;
}
var Row = /* @__PURE__ */ React.memo(function Row2(p) {
  const o = p.o;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      id: p.id,
      role: "option",
      "data-index": p.slot,
      style: p.top == null ? void 0 : { position: "absolute", insetInline: 0, top: p.top },
      "aria-selected": p.selected,
      "aria-posinset": p.index + 1,
      "aria-setsize": p.size,
      "aria-disabled": o.disabled || void 0,
      "aria-description": typeof o.description === "string" && o.description ? o.description : void 0,
      className: cn("dk-combobox__option", p.active && "dk-combobox__option--active", p.selected && "dk-combobox__option--selected"),
      onMouseMove: () => {
        if (!o.disabled && !p.active) p.onMove(o.i);
      },
      onClick: () => p.onPick(o.i)
    },
    /* @__PURE__ */ React.createElement("span", { className: "dk-combobox__text" }, /* @__PURE__ */ React.createElement("span", { className: "dk-combobox__label" }, p.query ? /* @__PURE__ */ React.createElement(Highlight, { query: p.query }, o.label) : o.label), o.description != null && o.description !== "" ? /* @__PURE__ */ React.createElement("span", { className: "dk-combobox__description", "aria-hidden": typeof o.description === "string" || void 0 }, o.description) : null),
    p.selected ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "dk-combobox__check" }) : null
  );
});
var Combobox = /* @__PURE__ */ component("Combobox", function Combobox2(given, ref) {
  let props = given;
  const nameRef = useNameCheck("Combobox", NAME_HOW.field);
  props = useFieldControl(props);
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const sds = useSettings(words);
  const rest = omit(props, { size: 1, invalid: 1, leftIcon: 1, className: 1, style: 1, options: 1, value: 1, defaultValue: 1, onValueChange: 1, onInputChange: 1, inputValue: 1, defaultInputValue: 1, filter: 1, clearable: 1, loading: 1, emptyText: 1, loadingText: 1, toggleLabel: 1, clearLabel: 1, name: 1, multiple: 1, loadOptions: 1, debounce: 1, open: 1, defaultOpen: 1, onOpenChange: 1, onCreate: 1 });
  const multi = props.multiple === true;
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) rest["aria-invalid"] = true;
  const base = domId("dk-cbx", React.useId());
  const [loaded, setLoaded] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const later = React.useRef(null);
  const source = props.loadOptions && loaded ? loaded : props.options;
  const opts = React.useMemo(() => toOpts(source), [source]);
  const seen = React.useRef(/* @__PURE__ */ new Map());
  for (const o of opts) seen.current.set(o.value, o.label);
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const had = /* @__PURE__ */ new Set();
      const twice = opts.find((o) => had.has(o.value) ? true : (had.add(o.value), false));
      if (twice) warnOnce("combobox-duplicate-value", `Combobox: more than one option has the value "${twice.value}", so picking one shows the first one's label and marks them all as selected. Give every option its own value.`);
    }
  }, [opts]);
  const creatable = !!props.onCreate;
  const loader = React.useRef({ timer: 0, ctl: null, n: 0, q: null });
  const loadFn = React.useRef(props.loadOptions);
  loadFn.current = props.loadOptions;
  const load = (q, wait) => {
    const l = loader.current, fn = loadFn.current;
    if (!fn) return;
    window.clearTimeout(l.timer);
    if (l.ctl) l.ctl.abort();
    l.ctl = null;
    l.q = q;
    setBusy(true);
    setFailed(false);
    const go = () => {
      const ctl = new AbortController(), n = ++l.n;
      l.ctl = ctl;
      let answer;
      try {
        answer = Promise.resolve(fn(q, { signal: ctl.signal }));
      } catch (err) {
        answer = Promise.reject(err instanceof Error ? err : new Error(String(err)));
      }
      answer.then(
        (list2) => {
          if (n !== l.n || ctl.signal.aborted) return;
          const got = Array.isArray(list2) ? list2 : [];
          setLoaded(got);
          setBusy(false);
          const o = toOpts(got), t = fold(q.trim()), first = t ? o.findIndex((x) => !x.disabled) : -1;
          setActive(first < 0 && t && creatable && !props.loading && !o.some((x) => x.folded === t) ? o.length : first);
        },
        () => {
          if (n === l.n && !ctl.signal.aborted) {
            setFailed(true);
            setBusy(false);
          }
        }
      );
    };
    if (wait > 0) l.timer = window.setTimeout(go, wait);
    else go();
  };
  React.useEffect(() => () => {
    const l = loader.current;
    window.clearTimeout(l.timer);
    if (l.ctl) l.ctl.abort();
  }, []);
  const pause = typeof props.debounce === "number" && props.debounce >= 0 ? props.debounce : typingPause;
  const loading = !!props.loading || busy;
  const controlled = props.value !== void 0;
  const one = (v) => multi || typeof v !== "string" ? null : v;
  const [ownValue, setOwnValue] = React.useState(() => one(props.defaultValue));
  const [ownValues, setOwnValues] = React.useState(() => multi ? list(props.defaultValue) : []);
  const value = multi ? null : controlled ? one(props.value) : ownValue;
  const values = multi ? controlled ? list(props.value) : ownValues : [];
  const chosen = new Set(values);
  const selected = multi ? null : opts.find((o) => o.value === value) || null;
  const pickedLabel = selected ? selected.label : value != null ? seen.current.get(value) ?? "" : "";
  const [ownText, setOwnText] = React.useState(() => props.defaultInputValue ?? pickedLabel);
  const text = props.inputValue !== void 0 ? props.inputValue : ownText;
  const textNow = React.useRef(text);
  textNow.current = text;
  const told = React.useRef(props.onInputChange);
  told.current = props.onInputChange;
  const setText = (t) => {
    setOwnText(t);
    if (t === textNow.current) return;
    textNow.current = t;
    if (told.current) told.current(t);
  };
  const [synced, setSynced] = React.useState(null);
  React.useEffect(() => {
    if (synced === null) return;
    setSynced(null);
    if (told.current) told.current(synced);
  }, [synced]);
  const [typed, setTyped] = React.useState(false);
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen);
  const open = !(rest.disabled || rest.readOnly) && (props.open !== void 0 ? props.open : ownOpen);
  const openNow = React.useRef(open);
  openNow.current = open;
  const askOpen = React.useRef(props.onOpenChange);
  askOpen.current = props.onOpenChange;
  const setOpen = (v, reason) => {
    setOwnOpen(v);
    if (v === openNow.current) return;
    openNow.current = v;
    if (askOpen.current) askOpen.current(v, { reason });
  };
  const [active, setActive] = React.useState(-1);
  const box = React.useRef(null);
  const input = React.useRef(null);
  const pop = React.useRef(null);
  const locked = !!rest.disabled || !!rest.readOnly;
  const showClear = !!props.clearable && (multi ? values.length > 0 : value != null) && !locked;
  const [name, setName] = React.useState("");
  React.useEffect(() => {
    if (showClear) setName(fieldName(input.current));
  }, [showClear]);
  useFormReset(input, () => {
    if (controlled) return;
    const v = one(props.defaultValue), o = opts.find((x) => x.value === v);
    setOwnValue(v);
    setOwnValues(multi ? list(props.defaultValue) : []);
    setText(o ? o.label : "");
    setTyped(false);
    setOpen(false, "api");
  });
  const label = pickedLabel;
  const [shownFor, setShownFor] = React.useState([value, label]);
  if (shownFor[0] !== value || shownFor[1] !== label) {
    setShownFor([value, label]);
    if ((!open || !typed) && label !== text) {
      setOwnText(label);
      setSynced(label);
    }
  }
  const filter = props.loadOptions ? false : props.filter;
  const matches = React.useMemo(() => {
    if (!typed || filter === false) return opts;
    if (typeof filter === "function") return opts.filter((o) => filter({ value: o.value, label: o.label }, text));
    const q = fold(text.trim());
    return opts.filter((o) => o.folded.includes(q));
  }, [opts, typed, filter, text]);
  const addText = text.trim();
  const adding = React.useMemo(() => {
    if (!creatable || !typed || !addText || loading) return null;
    const t = fold(addText);
    return opts.some((o) => o.folded === t) ? null : { value: "", label: "", i: opts.length, folded: "", add: addText };
  }, [creatable, typed, addText, loading, opts]);
  const shown = React.useMemo(() => adding ? matches.concat(adding) : matches, [matches, adding]);
  const byIndex = (i) => adding && i === adding.i ? adding : opts[i];
  const usable = React.useMemo(() => shown.filter((o) => !o.disabled), [shown]);
  const changed = props.onValueChange;
  const commit = (v) => {
    if (!controlled) setOwnValue(v);
    if (v !== value && changed) changed(v);
  };
  const commitMany = (next, said2) => {
    if (!controlled) setOwnValues(next);
    if (changed) changed(next);
    if (said2) announce(said2);
  };
  const labelOf = (v) => seen.current.get(v) ?? v;
  const remove = (v) => commitMany(values.filter((x) => x !== v), sds.labels.valueRemoved(labelOf(v)));
  const show = (to) => {
    if (locked) return;
    later.current = null;
    setOpen(true, "trigger");
    if (loader.current.q !== "") load("", 0);
    const list2 = opts.filter((o) => !o.disabled);
    const sel = selected && !selected.disabled ? selected.i : -1;
    setActive(to === "last" ? sel >= 0 ? sel : list2.length ? list2[list2.length - 1].i : -1 : to === "first" ? sel >= 0 ? sel : list2.length ? list2[0].i : -1 : sel);
  };
  const hide = (reason, revert = true) => {
    later.current = null;
    setOpen(false, reason);
    setActive(-1);
    setTyped(false);
    if (revert) setText(pickedLabel);
  };
  const pick = (o, reason = "select") => {
    if (o.disabled) return;
    later.current = null;
    if (o.add != null) {
      const made = props.onCreate ? props.onCreate(o.add) : void 0;
      if (typeof made !== "string") {
        hide(reason, !multi);
        if (multi) setText("");
        return;
      }
      seen.current.set(made, o.add);
      pick({ value: made, label: o.add, i: -1, folded: fold(o.add) }, reason);
      return;
    }
    if (multi) {
      if (chosen.has(o.value)) remove(o.value);
      else commitMany(values.concat(o.value), sds.labels.valueAdded(o.label));
      setActive(o.i);
      setTyped(false);
      if (text) {
        setText("");
        load("", 0);
      }
      return;
    }
    commit(o.value);
    setText(o.label);
    setOpen(false, reason);
    setActive(-1);
    setTyped(false);
  };
  const exact = () => {
    const t = fold(text.trim());
    const same = typed && t ? opts.filter((o) => !o.disabled && o.folded === t) : [];
    return same.length === 1 ? same[0] : null;
  };
  const move = (by) => {
    if (!usable.length) return;
    const i = usable.findIndex((o) => o.i === active);
    const n = i < 0 ? by > 0 ? 0 : usable.length - 1 : (i + by + usable.length) % usable.length;
    setActive(usable[n].i);
  };
  const page = (dir) => {
    if (!usable.length) return;
    const lb = listbox.current, row2 = lb && lb.querySelector("[role=option]");
    const h = row2 ? row2.offsetHeight : 0;
    const by = h && lb ? Math.max(1, Math.floor(lb.clientHeight / h)) : 10;
    const i = usable.findIndex((o) => o.i === active);
    const n = i < 0 ? dir > 0 ? 0 : usable.length - 1 : Math.min(usable.length - 1, Math.max(0, i + dir * by));
    setActive(usable[n].i);
  };
  const waiting = () => {
    if (!busy || !props.loadOptions || !typed || !text.trim()) return false;
    if (!loader.current.ctl) load(text, 0);
    return true;
  };
  React.useEffect(() => {
    const why = later.current;
    if (!why || busy) return;
    later.current = null;
    if (failed) {
      if (why === "blur") hide("blur");
      return;
    }
    const x = exact();
    if (why === "blur") {
      if (x) pick(x, "blur");
      else hide("blur");
      return;
    }
    const o = x || usable[0];
    if (o) pick(o);
    else hide("select");
  });
  const onChange = (e) => {
    later.current = null;
    const t = e.target.value;
    setText(t);
    setTyped(true);
    if (!locked) setOpen(true, "trigger");
    const q = fold(t.trim());
    const first = opts.find((o) => !o.disabled && (filter === false || (typeof filter === "function" ? filter({ value: o.value, label: o.label }, t) : o.folded.includes(q))));
    setActive(t.trim() && first ? first.i : t.trim() && props.onCreate && !props.loadOptions && !props.loading && !opts.some((o) => o.folded === q) ? opts.length : -1);
    load(t, pause);
  };
  const onKeyDown = (e) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (e.defaultPrevented || locked || isComposing(e)) return;
    if ((e.ctrlKey || e.metaKey) && /^(Arrow|Page)/.test(e.key)) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) show(e.altKey ? "selected" : "first");
      else move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) show("last");
      else move(-1);
    } else if (e.key === "Enter" && open && waiting()) {
      e.preventDefault();
      later.current = "select";
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      const o = byIndex(active);
      if (o && shown.includes(o)) pick(o);
      else {
        const x = exact() || adding;
        if (x) pick(x);
        else hide("select");
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      hide("escape");
    } else if ((e.key === "PageDown" || e.key === "PageUp") && open) {
      e.preventDefault();
      page(e.key === "PageDown" ? 1 : -1);
    } else if (e.key === "Backspace" && multi && text === "" && values.length) remove(values[values.length - 1]);
  };
  const onBlur = (e) => {
    if (rest.onBlur) rest.onBlur(e);
    if (windowBlur(e)) return;
    if (multi) {
      hide("blur");
      return;
    }
    if (waiting()) {
      later.current = "blur";
      setOpen(false, "blur");
      return;
    }
    const x = exact();
    if (text.trim() === "" && value != null) {
      commit(null);
      setOpen(false, "blur");
      setActive(-1);
      setTyped(false);
      setText("");
    } else if (x) pick(x, "blur");
    else hide("blur");
  };
  const clear = () => {
    if (multi) commitMany([]);
    else commit(null);
    setText("");
    setTyped(false);
    setActive(-1);
    if (input.current) input.current.focus();
  };
  const count = usable.length - (adding ? 1 : 0);
  const empty = typeof props.emptyText === "string" ? props.emptyText : sds.labels.noResults;
  const said = failed ? sds.labels.loadFailed : shown.length === 0 ? empty : count ? sds.labels.resultsCount(count) : adding ? sds.labels.createOption(adding.add) : "";
  React.useEffect(() => {
    if (!open || !typed || loading || !said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [open, typed, loading, said, text]);
  const opened = React.useRef(void 0);
  opened.current = () => {
    if (!typed && loader.current.q !== "") load("", 0);
  };
  React.useEffect(() => {
    if (open) opened.current?.();
  }, [open]);
  const exit = useExit(open, pop), shownList = open || exit.leaving;
  useAnchoredLayer(open, pop, box, { placement: "bottom-start", offsetVar: "--dk-combobox-offset", matchWidth: true });
  const listbox = React.useRef(null);
  const lay = React.useMemo(() => {
    const items = [], slot = [];
    let g;
    shown.forEach((o, n) => {
      if (o.g !== void 0 && o.g !== g) items.push({ n: -1, g: o.g, gl: o.gl });
      g = o.g;
      slot.push(items.length);
      items.push({ n, g: o.g, gl: o.gl });
    });
    return { items, slot };
  }, [shown]);
  const win = useVirtual({ count: shownList ? lay.items.length : 0, estimate: ROW });
  const attach = win.ref;
  const setListbox = React.useCallback((n) => {
    listbox.current = n;
    attach(n);
  }, [attach]);
  const at = active >= 0 ? shown.findIndex((o) => o.i === active) : -1;
  const toActive = React.useRef(void 0);
  toActive.current = () => {
    if (open && at >= 0) win.scrollToIndex(lay.slot[at]);
  };
  React.useEffect(() => toActive.current?.(), [active, open]);
  const left = asIcon(props.leftIcon);
  const keep = (e) => e.preventDefault();
  const listId = base + "-list";
  const latest = React.useRef({ pick, byIndex });
  latest.current = { pick, byIndex };
  const onMove = React.useCallback((i) => setActive(i), []);
  const onPick = React.useCallback((i) => {
    const l = latest.current;
    const o = l.byIndex(i);
    if (o) l.pick(o);
  }, []);
  const activeShown = at >= 0;
  const mark = typed && filter === void 0 ? text.trim() : "";
  const row = (n, top) => {
    let o = shown[n];
    if (o.add != null) o = { ...o, label: sds.labels.createOption(o.add) };
    return /* @__PURE__ */ React.createElement(Row, { key: o.add != null ? "\0add" : o.value, o, id: base + "-opt-" + o.i, index: n, slot: lay.slot[n], top, active: o.i === active, selected: o.add == null && (multi ? chosen.has(o.value) : o.value === value), size: shown.length, query: o.add != null ? "" : mark, onMove, onPick });
  };
  const rows = [];
  const inGroup = (key, g, gl, kids) => g === void 0 ? kids : [/* @__PURE__ */ React.createElement("div", { key, role: "group", "aria-label": gl, className: "dk-combobox__group" }, kids)];
  if (shownList) {
    const a = at >= 0 ? lay.slot[at] : -1, out = a >= 0 && (a < win.start || a >= win.end);
    const lone = () => inGroup("ga", shown[at].g, shown[at].gl, [row(at, win.offsetOf(a))]);
    if (out && a < win.start) rows.push(...lone());
    let seg = [], g, gl;
    const flush = () => {
      if (seg.length) rows.push(...inGroup("g" + g, g, gl, seg));
      seg = [];
    };
    for (let k = win.start; k < win.end; k++) {
      const it = lay.items[k];
      if (it.g !== g) {
        flush();
        g = it.g;
        gl = it.gl;
      }
      seg.push(it.n >= 0 ? row(it.n) : /* @__PURE__ */ React.createElement("div", { key: "h" + it.g, "data-index": k, role: "presentation", "aria-hidden": true, className: "dk-combobox__group-label" }, it.gl));
    }
    flush();
    if (out && a >= win.end) rows.push(...lone());
  }
  const field = /* @__PURE__ */ React.createElement(
    "input",
    {
      ...rest,
      ref: (n) => {
        input.current = n;
        nameRef(n);
        if (typeof ref === "function") ref(n);
        else if (ref) ref.current = n;
      },
      type: "text",
      role: "combobox",
      "aria-expanded": open,
      "aria-controls": open ? listId : void 0,
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-activedescendant": open && activeShown ? base + "-opt-" + active : void 0,
      autoComplete: rest.autoComplete || "off",
      autoCorrect: "off",
      autoCapitalize: rest.autoCapitalize ?? "off",
      spellCheck: false,
      className: "dk-input__field",
      value: text,
      required: multi && values.length ? false : rest.required,
      "aria-required": rest["aria-required"] ?? (rest.required || void 0),
      onChange,
      onKeyDown,
      onBlur,
      onClick: (e) => {
        if (rest.onClick) rest.onClick(e);
        if (!open) show("selected");
      }
    }
  );
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      ref: box,
      className: cn("dk-input dk-combobox", multi && "dk-combobox--multiple", "dk-input--size-" + size, invalid && "dk-input--invalid", rest.disabled && "dk-input--disabled", rest.readOnly && "dk-input--readonly", props.className),
      style: props.style,
      "data-component": "combobox",
      "data-size": size,
      "data-state": open ? "open" : "closed",
      onMouseDown: pressFocuses(input)
    },
    left != null && left !== false ? /* @__PURE__ */ React.createElement("span", { className: "dk-input__icon dk-input__icon--left", "aria-hidden": true }, left) : null,
    multi ? /* @__PURE__ */ React.createElement("span", { className: "dk-combobox__values" }, values.length ? /* @__PURE__ */ React.createElement("span", { className: "dk-combobox__tags", onMouseDown: keep }, values.map((v) => /* @__PURE__ */ React.createElement(
      Badge,
      {
        key: v,
        className: "dk-combobox__tag",
        removeLabel: sds.labels.remove,
        onRemove: locked ? void 0 : () => {
          remove(v);
          if (input.current) input.current.focus();
        }
      },
      labelOf(v)
    ))) : null, field) : field,
    showClear ? /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: -1, className: "dk-combobox__button dk-combobox__clear", "aria-label": props.clearLabel || sds.labels.clearValue(name || ""), onMouseDown: keep, onClick: clear }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Close })) : null,
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        tabIndex: -1,
        className: "dk-combobox__button dk-combobox__toggle",
        "aria-label": props.toggleLabel || sds.labels.showOptions,
        "aria-expanded": open,
        "aria-controls": open ? listId : void 0,
        disabled: locked,
        onMouseDown: keep,
        onClick: () => {
          if (open) hide("trigger");
          else show("selected");
          if (input.current) input.current.focus();
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore })
    ),
    /* @__PURE__ */ React.createElement("div", { ref: pop, className: "dk-combobox__popup", ...{ popover: "manual" }, hidden: !open || void 0, inert: !open || void 0, "data-instant": exit.instant ? "" : void 0, onMouseDown: keep }, loading ? /* @__PURE__ */ React.createElement("div", { className: "dk-combobox__message", role: "status" }, /* @__PURE__ */ React.createElement(Loader, { size: "sm", delay: 0, label: "" }), props.loadingText || sds.labels.loadingResults) : null, /* @__PURE__ */ React.createElement("div", { ref: setListbox, id: listId, role: "listbox", className: "dk-combobox__listbox", style: win.before || win.after ? { "--dk-cbx-before": win.before + "px", "--dk-cbx-after": win.after + "px" } : void 0, "aria-multiselectable": multi || void 0, "aria-labelledby": rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel), "aria-label": rest["aria-labelledby"] ? void 0 : rest["aria-label"] }, shownList ? rows : null), !loading && failed ? /* @__PURE__ */ React.createElement("div", { className: "dk-combobox__message" }, sds.labels.loadFailed) : null, !loading && !failed && shown.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "dk-combobox__message" }, props.emptyText ?? sds.labels.noResults) : null),
    props.name && multi ? values.map((v) => /* @__PURE__ */ React.createElement("input", { key: v, type: "hidden", name: props.name, form: rest.form, value: v, disabled: rest.disabled })) : null,
    props.name && !multi ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: rest.form, value: value ?? "", disabled: rest.disabled }) : null
  );
});
export {
  Combobox
};
//# sourceMappingURL=Combobox.js.map
