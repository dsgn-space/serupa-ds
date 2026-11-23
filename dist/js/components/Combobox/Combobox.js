"use client";

// src/components/Combobox/Combobox.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { pressFocuses } from "../../internal/affix.js";
import { useMergedRef, cn, domId, isInvalid, omit, oneOf, SIZES } from "../../internal/cn.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { warnOnce } from "../../internal/warn.js";
import { Icon } from "../Icon/Icon.js";
import { asIcon } from "../Icon/asIcon.js";
import { LoaderRing } from "../../internal/loaderRing.js";
import { InputAction } from "../Input/Input.js";
import { named } from "../../internal/component.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
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
import { useControllable } from "../../internal/controllable.js";
var list = (v) => Array.isArray(v) ? v : [];
var ROW = 32;
var isGroup = (o) => typeof o === "object" && o !== null && Array.isArray(o.options);
function toOpts(source) {
  const out = [];
  const add = (o, g, gl, off) => {
    const x = typeof o === "string" ? {
      value: o,
      label: o
    } : {
      value: String(o.value),
      label: String(o.label ?? o.value),
      description: o.description
    };
    out.push({
      ...x,
      disabled: typeof o !== "string" && !!o.disabled || !!off,
      i: out.length,
      folded: fold(x.label),
      g,
      gl
    });
  };
  (source || []).forEach((o, k) => {
    if (isGroup(o)) for (const x of o.options) add(x, k, String(o.label), o.disabled);
    else add(o);
  });
  return out;
}
var Row = /* @__PURE__ */ React.memo(function Row2(p) {
  const $ = _c(38);
  const o = p.o;
  const t0 = p.id;
  const t1 = p.slot;
  let t2;
  if ($[0] !== p.top) {
    t2 = p.top == null ? void 0 : {
      position: "absolute",
      insetInline: 0,
      top: p.top
    };
    $[0] = p.top;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = p.selected;
  const t4 = p.index + 1;
  const t5 = p.size;
  const t6 = o.disabled || void 0;
  const t7 = typeof o.description === "string" && o.description ? o.description : void 0;
  const t8 = p.active && "srp-combobox__option--active";
  const t9 = p.selected && "srp-combobox__option--selected";
  let t10;
  if ($[2] !== t8 || $[3] !== t9) {
    t10 = cn("srp-combobox__option", t8, t9);
    $[2] = t8;
    $[3] = t9;
    $[4] = t10;
  } else {
    t10 = $[4];
  }
  let t11;
  if ($[5] !== o.disabled || $[6] !== o.i || $[7] !== p) {
    t11 = () => {
      if (!o.disabled && !p.active) {
        p.onMove(o.i);
      }
    };
    $[5] = o.disabled;
    $[6] = o.i;
    $[7] = p;
    $[8] = t11;
  } else {
    t11 = $[8];
  }
  let t12;
  if ($[9] !== o.i || $[10] !== p) {
    t12 = () => p.onPick(o.i);
    $[9] = o.i;
    $[10] = p;
    $[11] = t12;
  } else {
    t12 = $[11];
  }
  let t13;
  if ($[12] !== o.label || $[13] !== p.query) {
    t13 = p.query ? /* @__PURE__ */ React.createElement(Highlight, { query: p.query }, o.label) : o.label;
    $[12] = o.label;
    $[13] = p.query;
    $[14] = t13;
  } else {
    t13 = $[14];
  }
  let t14;
  if ($[15] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("span", { className: "srp-combobox__label" }, t13);
    $[15] = t13;
    $[16] = t14;
  } else {
    t14 = $[16];
  }
  let t15;
  if ($[17] !== o.description) {
    t15 = o.description != null && o.description !== "" ? /* @__PURE__ */ React.createElement("span", { className: "srp-combobox__description", "aria-hidden": typeof o.description === "string" || void 0 }, o.description) : null;
    $[17] = o.description;
    $[18] = t15;
  } else {
    t15 = $[18];
  }
  let t16;
  if ($[19] !== t14 || $[20] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("span", { className: "srp-combobox__text" }, t14, t15);
    $[19] = t14;
    $[20] = t15;
    $[21] = t16;
  } else {
    t16 = $[21];
  }
  let t17;
  if ($[22] !== p.selected) {
    t17 = p.selected ? /* @__PURE__ */ React.createElement(Icon, { icon: icons.Check, className: "srp-combobox__check" }) : null;
    $[22] = p.selected;
    $[23] = t17;
  } else {
    t17 = $[23];
  }
  let t18;
  if ($[24] !== p.id || $[25] !== p.selected || $[26] !== p.size || $[27] !== p.slot || $[28] !== t10 || $[29] !== t11 || $[30] !== t12 || $[31] !== t16 || $[32] !== t17 || $[33] !== t2 || $[34] !== t4 || $[35] !== t6 || $[36] !== t7) {
    t18 = /* @__PURE__ */ React.createElement("div", { id: t0, role: "option", "data-index": t1, style: t2, "aria-selected": t3, "aria-posinset": t4, "aria-setsize": t5, "aria-disabled": t6, "aria-description": t7, className: t10, onMouseMove: t11, onClick: t12 }, t16, t17);
    $[24] = p.id;
    $[25] = p.selected;
    $[26] = p.size;
    $[27] = p.slot;
    $[28] = t10;
    $[29] = t11;
    $[30] = t12;
    $[31] = t16;
    $[32] = t17;
    $[33] = t2;
    $[34] = t4;
    $[35] = t6;
    $[36] = t7;
    $[37] = t18;
  } else {
    t18 = $[37];
  }
  return t18;
});
function ComboboxRender({
  ref,
  ...given
}) {
  let props = given;
  const nameRef = useNameCheck("Combobox", NAME_HOW.field);
  props = useFieldControl(props);
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, {
    size: 1,
    invalid: 1,
    startIcon: 1,
    className: 1,
    style: 1,
    options: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    onInputValueChange: 1,
    inputValue: 1,
    defaultInputValue: 1,
    filter: 1,
    clearable: 1,
    loading: 1,
    emptyText: 1,
    loadingText: 1,
    toggleLabel: 1,
    clearLabel: 1,
    name: 1,
    multiple: 1,
    loadOptions: 1,
    debounce: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    onCreate: 1,
    limit: 1,
    freeText: 1,
    inlineComplete: 1
  });
  const multi = props.multiple === true;
  const free = !multi && props.freeText === true, inline = free && !!props.inlineComplete;
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) rest["aria-invalid"] = true;
  const base = domId("srp-cbx", React.useId());
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
      const twice = opts.find((o_0) => had.has(o_0.value) ? true : (had.add(o_0.value), false));
      if (twice) warnOnce("combobox-duplicate-value", `Combobox: more than one option has the value "${twice.value}", so picking one shows the first one's label and marks them all as selected. Give every option its own value.`);
    }
  }, [opts]);
  const creatable = !!props.onCreate && !free;
  const loader = React.useRef({
    timer: 0,
    ctl: null,
    n: 0,
    q: null
  });
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
        answer = Promise.resolve(fn(q, {
          signal: ctl.signal
        }));
      } catch (err) {
        answer = Promise.reject(err instanceof Error ? err : new Error(String(err)));
      }
      answer.then((list2) => {
        if (n !== l.n || ctl.signal.aborted) return;
        const got = Array.isArray(list2) ? list2 : [];
        setLoaded(got);
        setBusy(false);
        const o_1 = toOpts(got), t = fold(q.trim()), first = t ? o_1.findIndex((x) => !x.disabled) : -1;
        setActive(first < 0 && t && creatable && !props.loading && !o_1.some((x_0) => x_0.folded === t) ? o_1.length : first);
      }, () => {
        if (n === l.n && !ctl.signal.aborted) {
          setFailed(true);
          setBusy(false);
        }
      });
    };
    if (wait > 0) l.timer = window.setTimeout(go, wait);
    else go();
  };
  React.useEffect(() => () => {
    const l_0 = loader.current;
    window.clearTimeout(l_0.timer);
    if (l_0.ctl) l_0.ctl.abort();
  }, []);
  const pause = typeof props.debounce === "number" && props.debounce >= 0 ? props.debounce : typingPause;
  const loading = !!props.loading || busy;
  const one = (v) => multi || typeof v !== "string" ? null : v;
  const [held, setHeld, controlled] = useControllable(props.value, multi ? list(props.defaultValue) : one(props.defaultValue), "Combobox", "value");
  const value = multi ? null : one(held);
  const values = multi ? list(held) : [];
  const chosen = new Set(values);
  const selected = multi ? null : opts.find((o_2) => free ? o_2.label === value : o_2.value === value) || null;
  const pickedLabel = free ? value ?? "" : selected ? selected.label : value != null ? seen.current.get(value) ?? "" : "";
  const [textHeld, setOwnText] = useControllable(props.inputValue, props.defaultInputValue ?? pickedLabel, "Combobox", "inputValue");
  const text = textHeld;
  const textNow = React.useRef(text);
  textNow.current = text;
  const told = React.useRef(props.onInputValueChange);
  told.current = props.onInputValueChange;
  const setText = (t_0) => {
    setOwnText(t_0);
    if (t_0 === textNow.current) return;
    textNow.current = t_0;
    if (told.current) told.current(t_0);
  };
  const [synced, setSynced] = React.useState(null);
  React.useEffect(() => {
    if (synced === null) return;
    setSynced(null);
    if (told.current) told.current(synced);
  }, [synced]);
  const [typed, setTyped] = React.useState(false);
  const [openHeld, setOwnOpen] = useControllable(props.open, !!props.defaultOpen, "Combobox", "open");
  const open = !(rest.disabled || rest.readOnly) && !!openHeld;
  const openNow = React.useRef(open);
  openNow.current = open;
  const askOpen = React.useRef(props.onOpenChange);
  askOpen.current = props.onOpenChange;
  const setOpen = (v_0, reason) => {
    setOwnOpen(v_0);
    if (v_0 === openNow.current) return;
    openNow.current = v_0;
    if (askOpen.current) askOpen.current(v_0, {
      reason
    });
  };
  const [active, setActive] = React.useState(-1);
  const box = React.useRef(null);
  const input = React.useRef(null);
  const mergedRef = useMergedRef(ref, (n_0) => {
    input.current = n_0;
    nameRef(n_0);
  });
  const pop = React.useRef(null);
  const locked = !!rest.disabled || !!rest.readOnly;
  const showClear = !!props.clearable && (multi ? values.length > 0 : value != null) && !locked;
  const [name, setName] = React.useState("");
  React.useEffect(() => {
    if (showClear) setName(fieldName(input.current));
  }, [showClear]);
  useFormReset(input, () => {
    if (controlled) return;
    const v_1 = one(props.defaultValue), o_3 = opts.find((x_1) => x_1.value === v_1);
    setHeld(multi ? list(props.defaultValue) : v_1);
    setText(o_3 ? o_3.label : "");
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
    if (typeof filter === "function") return opts.filter((o_4) => filter({
      value: o_4.value,
      label: o_4.label
    }, text));
    const q_0 = fold(text.trim());
    return opts.filter((o_5) => o_5.folded.includes(q_0));
  }, [opts, typed, filter, text]);
  const addText = text.trim();
  const adding = React.useMemo(() => {
    if (!creatable || !typed || !addText || loading) return null;
    const t_1 = fold(addText);
    return opts.some((o_6) => o_6.folded === t_1) ? null : {
      value: "",
      label: "",
      i: opts.length,
      folded: "",
      add: addText
    };
  }, [creatable, typed, addText, loading, opts]);
  const cap = typeof props.limit === "number" && props.limit >= 1 ? Math.floor(props.limit) : Infinity;
  const more = Math.max(0, matches.length - cap);
  const shown = React.useMemo(() => {
    const few = cap < matches.length ? matches.slice(0, cap) : matches;
    return adding ? few.concat(adding) : few;
  }, [matches, adding, cap]);
  const byIndex = (i) => adding && i === adding.i ? adding : opts[i];
  const usable = React.useMemo(() => shown.filter((o_7) => !o_7.disabled), [shown]);
  const changed = props.onValueChange;
  const commit = (v_2) => {
    if (!controlled) setHeld(v_2);
    if (v_2 !== value && changed) changed(v_2);
  };
  const commitMany = (next, said) => {
    if (!controlled) setHeld(next);
    if (changed) changed(next);
    if (said) announce(said);
  };
  const labelOf = (v_3) => seen.current.get(v_3) ?? v_3;
  const remove = (v_4) => commitMany(values.filter((x_2) => x_2 !== v_4), sds.labels.valueRemoved(labelOf(v_4)));
  const show = (to) => {
    if (locked) return;
    later.current = null;
    setOpen(true, "trigger");
    if (loader.current.q !== "") load("", 0);
    const list_0 = opts.filter((o_8) => !o_8.disabled);
    const sel = selected && !selected.disabled ? selected.i : -1;
    setActive(to === "last" ? sel >= 0 ? sel : list_0.at(-1)?.i ?? -1 : to === "first" ? sel >= 0 ? sel : list_0[0]?.i ?? -1 : sel);
  };
  const hide = (reason_0, revert = true) => {
    later.current = null;
    setOpen(false, reason_0);
    setActive(-1);
    setTyped(false);
    if (revert) setText(pickedLabel);
  };
  const pick = (o_9, reason_1 = "select") => {
    if (o_9.disabled) return;
    later.current = null;
    if (free) {
      commit(o_9.label);
      setText(o_9.label);
      setOpen(false, reason_1);
      setActive(-1);
      setTyped(false);
      return;
    }
    if (o_9.add != null) {
      const made = props.onCreate ? props.onCreate(o_9.add) : void 0;
      if (typeof made !== "string") {
        hide(reason_1, !multi);
        if (multi) setText("");
        return;
      }
      seen.current.set(made, o_9.add);
      pick({
        value: made,
        label: o_9.add,
        i: -1,
        folded: fold(o_9.add)
      }, reason_1);
      return;
    }
    if (multi) {
      if (chosen.has(o_9.value)) remove(o_9.value);
      else commitMany(values.concat(o_9.value), sds.labels.valueAdded(o_9.label));
      setActive(o_9.i);
      setTyped(false);
      if (text) {
        setText("");
        load("", 0);
      }
      return;
    }
    commit(o_9.value);
    setText(o_9.label);
    setOpen(false, reason_1);
    setActive(-1);
    setTyped(false);
  };
  const onPaste = (e) => {
    if (rest.onPaste) rest.onPaste(e);
    if (!multi || e.defaultPrevented || locked) return;
    const pasted = e.clipboardData.getData("text");
    if (!/[,;\t\n]/.test(pasted)) return;
    const parts = pasted.split(/[,;\t\r\n]+/).map((t_2) => t_2.trim()).filter(Boolean);
    const next_0 = values.slice(), added = [], left = [];
    for (const t_3 of parts) {
      const f = fold(t_3), o_10 = opts.find((x_3) => !x_3.disabled && x_3.add == null && (x_3.folded === f || fold(x_3.value) === f));
      if (!o_10) {
        left.push(t_3);
        continue;
      }
      if (next_0.indexOf(o_10.value) < 0) {
        next_0.push(o_10.value);
        added.push(o_10.label);
      }
    }
    if (!added.length) return;
    e.preventDefault();
    commitMany(next_0, sds.labels.valueAdded(added.join(", ")));
    setText(left.join(", "));
    if (left.length) {
      setTyped(true);
      load(left.join(", "), 0);
    }
  };
  const exact = () => {
    const t_4 = fold(text.trim());
    const same = typed && t_4 ? opts.filter((o_11) => !o_11.disabled && o_11.folded === t_4) : [];
    return same.length === 1 ? same[0] : null;
  };
  const move = (by) => {
    if (!usable.length) return;
    const i_0 = usable.findIndex((o_12) => o_12.i === active);
    const n_1 = i_0 < 0 ? by > 0 ? 0 : usable.length - 1 : (i_0 + by + usable.length) % usable.length;
    setActive(usable[n_1]?.i ?? -1);
  };
  const page = (dir) => {
    if (!usable.length) return;
    const lb = listbox.current, row = lb && lb.querySelector("[role=option]");
    const h = row ? row.offsetHeight : 0;
    const by_0 = h && lb ? Math.max(1, Math.floor(lb.clientHeight / h)) : 10;
    const i_1 = usable.findIndex((o_13) => o_13.i === active);
    const n_2 = i_1 < 0 ? dir > 0 ? 0 : usable.length - 1 : Math.min(usable.length - 1, Math.max(0, i_1 + dir * by_0));
    setActive(usable[n_2]?.i ?? -1);
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
    const x_4 = exact();
    if (why === "blur") {
      if (x_4) pick(x_4, "blur");
      else hide("blur");
      return;
    }
    const o_14 = x_4 || usable[0];
    if (o_14) pick(o_14);
    else hide("select");
  });
  const complete = (el, t_5) => {
    const head = fold(t_5);
    const o_15 = inline && t_5 ? opts.find((x_5) => !x_5.disabled && x_5.folded.startsWith(head) && fold(x_5.label.slice(0, t_5.length)) === head) : void 0;
    if (!o_15 || o_15.label.length <= t_5.length) return t_5;
    const n_3 = t_5.length;
    t_5 = t_5 + o_15.label.slice(n_3);
    select.current = [n_3, t_5.length];
    el.value = t_5;
    el.setSelectionRange(n_3, t_5.length);
    return t_5;
  };
  const onCompositionEnd = (e_0) => {
    if (rest.onCompositionEnd) rest.onCompositionEnd(e_0);
    if (!free || !inline) return;
    const el_0 = e_0.currentTarget, t_6 = complete(el_0, el_0.value);
    if (t_6 !== text) {
      commit(t_6 === "" ? null : t_6);
      setText(t_6);
    }
  };
  const onChange = (e_1) => {
    later.current = null;
    let t_7 = e_1.target.value;
    if (free) {
      const kind = e_1.nativeEvent.inputType || "", composing = isComposing(e_1) || kind === "insertCompositionText";
      if (!kind.startsWith("delete") && !composing) t_7 = complete(e_1.target, t_7);
      commit(t_7 === "" ? null : t_7);
    }
    setText(t_7);
    setTyped(true);
    if (!locked) setOpen(true, "trigger");
    const q_1 = fold(t_7.trim());
    const first_0 = opts.find((o_16) => !o_16.disabled && (filter === false || (typeof filter === "function" ? filter({
      value: o_16.value,
      label: o_16.label
    }, t_7) : o_16.folded.includes(q_1))));
    setActive(t_7.trim() && first_0 ? first_0.i : t_7.trim() && props.onCreate && !props.loadOptions && !props.loading && !opts.some((o_17) => o_17.folded === q_1) ? opts.length : -1);
    load(t_7, pause);
  };
  const onKeyDown = (e_2) => {
    if (rest.onKeyDown) rest.onKeyDown(e_2);
    if (e_2.defaultPrevented || locked || isComposing(e_2)) return;
    if ((e_2.ctrlKey || e_2.metaKey) && /^(Arrow|Page)/.test(e_2.key)) return;
    if (e_2.key === "ArrowDown") {
      e_2.preventDefault();
      if (!open) show(e_2.altKey ? "selected" : "first");
      else move(1);
    } else if (e_2.key === "ArrowUp") {
      e_2.preventDefault();
      if (!open) show("last");
      else move(-1);
    } else if (e_2.key === "Enter" && open && waiting()) {
      e_2.preventDefault();
      later.current = "select";
    } else if (e_2.key === "Enter" && open && free) {
      const o_18 = byIndex(active);
      if (o_18 && shown.includes(o_18)) {
        e_2.preventDefault();
        pick(o_18);
      } else hide("select", false);
    } else if (e_2.key === "Enter" && open) {
      e_2.preventDefault();
      const o_19 = byIndex(active);
      if (o_19 && shown.includes(o_19)) pick(o_19);
      else {
        const x_6 = exact() || adding;
        if (x_6) pick(x_6);
        else hide("select");
      }
    } else if (e_2.key === "Escape" && open) {
      e_2.preventDefault();
      e_2.stopPropagation();
      hide("escape", !free);
    } else if ((e_2.key === "PageDown" || e_2.key === "PageUp") && open) {
      e_2.preventDefault();
      page(e_2.key === "PageDown" ? 1 : -1);
    } else if (e_2.key === "Backspace" && multi && text === "") {
      const last = values.at(-1);
      if (last !== void 0) remove(last);
    }
  };
  const onBlur = (e_3) => {
    if (rest.onBlur) rest.onBlur(e_3);
    if (windowBlur(e_3)) return;
    if (multi) {
      hide("blur");
      return;
    }
    if (free) {
      hide("blur", false);
      return;
    }
    if (waiting()) {
      later.current = "blur";
      setOpen(false, "blur");
      return;
    }
    const x_7 = exact();
    if (text.trim() === "" && value != null) {
      commit(null);
      setOpen(false, "blur");
      setActive(-1);
      setTyped(false);
      setText("");
    } else if (x_7) pick(x_7, "blur");
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
  const moreText = more ? sds.labels.moreResults(more, displayNumber(more, locale)) : "";
  const said_0 = failed ? sds.labels.loadFailed : shown.length === 0 ? empty : count ? sds.labels.resultsCount(count + more, displayNumber(count + more, locale)) + (moreText ? ". " + moreText : "") : adding ? sds.labels.createOption(adding.add) : "";
  React.useEffect(() => {
    if (!open || !typed || loading || !said_0) return;
    const t_8 = setTimeout(() => announce(said_0), announcePause);
    return () => clearTimeout(t_8);
  }, [open, typed, loading, said_0, text]);
  const opened = React.useRef(void 0);
  opened.current = () => {
    if (!typed && loader.current.q !== "") load("", 0);
  };
  React.useEffect(() => {
    if (open) opened.current?.();
  }, [open]);
  const exit = useExit(open, pop), shownList = open || exit.leaving;
  useAnchoredLayer(open, pop, box, {
    placement: "bottom-start",
    offsetVar: "--srp-combobox-offset",
    matchWidth: true
  });
  const listbox = React.useRef(null);
  const lay = React.useMemo(() => {
    const items = [], slot = [];
    let g;
    shown.forEach((o_20, n_4) => {
      if (o_20.g !== void 0 && o_20.g !== g) items.push({
        n: -1,
        g: o_20.g,
        gl: o_20.gl
      });
      g = o_20.g;
      slot.push(items.length);
      items.push({
        n: n_4,
        g: o_20.g,
        gl: o_20.gl
      });
    });
    return {
      items,
      slot
    };
  }, [shown]);
  const win = useVirtual({
    count: shownList ? lay.items.length : 0,
    estimate: ROW
  });
  const attach = win.ref;
  const setListbox = React.useCallback((n_5) => {
    listbox.current = n_5;
    attach(n_5);
  }, [attach]);
  const at = active >= 0 ? shown.findIndex((o_21) => o_21.i === active) : -1;
  const toActive = React.useRef(void 0);
  toActive.current = () => {
    const s = lay.slot[at];
    if (open && s !== void 0) win.scrollToIndex(s);
  };
  React.useEffect(() => toActive.current?.(), [active, open]);
  const select = React.useRef(null);
  React.useLayoutEffect(() => {
    const r = select.current, el_1 = input.current;
    select.current = null;
    if (r && el_1 && el_1.value.length >= r[1]) el_1.setSelectionRange(r[0], r[1]);
  });
  const left_0 = asIcon(props.startIcon);
  const keep = (e_4) => e_4.preventDefault();
  const listId = base + "-list";
  const latest = React.useRef({
    pick,
    byIndex
  });
  latest.current = {
    pick,
    byIndex
  };
  const onMove = React.useCallback((i_2) => setActive(i_2), []);
  const onPick = React.useCallback((i_3) => {
    const l_1 = latest.current;
    const o_22 = l_1.byIndex(i_3);
    if (o_22) l_1.pick(o_22);
  }, []);
  const activeShown = at >= 0;
  const mark = typed && filter === void 0 ? text.trim() : "";
  const row_0 = (n_6, top) => {
    let o_23 = shown[n_6];
    if (!o_23) return null;
    if (o_23.add != null) o_23 = {
      ...o_23,
      label: sds.labels.createOption(o_23.add)
    };
    return /* @__PURE__ */ React.createElement(Row, { key: o_23.add != null ? "\0add" : o_23.value, o: o_23, id: base + "-opt-" + o_23.i, index: n_6, slot: lay.slot[n_6] ?? n_6, top, active: o_23.i === active, selected: o_23.add == null && (multi ? chosen.has(o_23.value) : o_23.value === value), size: shown.length, query: o_23.add != null ? "" : mark, onMove, onPick });
  };
  const rows = [];
  const inGroup = (key, g_0, gl, kids) => g_0 === void 0 ? kids : [/* @__PURE__ */ React.createElement("div", { key, role: "group", "aria-label": gl, className: "srp-combobox__group" }, kids)];
  if (shownList) {
    const a = lay.slot[at] ?? -1, out = a >= 0 && (a < win.start || a >= win.end);
    const lone = () => inGroup("ga", shown[at]?.g, shown[at]?.gl, [row_0(at, win.offsetOf(a))]);
    if (out && a < win.start) rows.push(...lone());
    let seg = [], g_1, gl_0;
    const flush = () => {
      if (seg.length) rows.push(...inGroup("g" + g_1, g_1, gl_0, seg));
      seg = [];
    };
    for (let k = win.start; k < win.end; k++) {
      const it = lay.items[k];
      if (!it) continue;
      if (it.g !== g_1) {
        flush();
        g_1 = it.g;
        gl_0 = it.gl;
      }
      seg.push(it.n >= 0 ? row_0(it.n) : /* @__PURE__ */ React.createElement("div", { key: "h" + it.g, "data-index": k, role: "presentation", "aria-hidden": true, className: "srp-combobox__group-label" }, it.gl));
    }
    flush();
    if (out && a >= win.end) rows.push(...lone());
  }
  const field = /* @__PURE__ */ React.createElement(
    "input",
    {
      ...rest,
      ref: mergedRef,
      type: "text",
      role: "combobox",
      "aria-expanded": open,
      "aria-controls": open ? listId : void 0,
      "aria-autocomplete": inline ? "both" : "list",
      "aria-haspopup": "listbox",
      "aria-activedescendant": open && activeShown ? base + "-opt-" + active : void 0,
      autoComplete: rest.autoComplete || "off",
      autoCorrect: "off",
      autoCapitalize: rest.autoCapitalize ?? "off",
      spellCheck: false,
      className: "srp-input__field",
      value: text,
      required: multi && values.length ? false : rest.required,
      "aria-required": rest["aria-required"] ?? (rest.required || void 0),
      onChange,
      onCompositionEnd,
      onKeyDown,
      onBlur,
      onPaste,
      onClick: (e_5) => {
        if (rest.onClick) rest.onClick(e_5);
        if (!open) show("selected");
      }
    }
  );
  return /* @__PURE__ */ React.createElement("span", { ref: box, className: cn("srp-input srp-combobox", multi && "srp-combobox--multiple", "srp-input--size-" + size, invalid && "srp-input--invalid", rest.disabled && "srp-input--disabled", rest.readOnly && "srp-input--readonly", props.className), style: props.style, "data-component": "combobox", "data-size": size, "data-state": open ? "open" : "closed", onMouseDown: pressFocuses(input) }, left_0 != null && left_0 !== false ? /* @__PURE__ */ React.createElement("span", { className: "srp-input__icon srp-input__icon--start", "aria-hidden": true }, left_0) : null, multi ? /* @__PURE__ */ React.createElement("span", { className: "srp-combobox__values" }, values.length ? /* @__PURE__ */ React.createElement("span", { className: "srp-combobox__tags", onMouseDown: keep }, values.map((v_5) => /* @__PURE__ */ React.createElement(Badge, { key: v_5, className: "srp-combobox__tag", removeLabel: sds.labels.remove, onRemove: locked ? void 0 : () => {
    remove(v_5);
    if (input.current) input.current.focus();
  } }, labelOf(v_5)))) : null, field) : field, /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, showClear ? /* @__PURE__ */ React.createElement(InputAction, { tabIndex: -1, className: "srp-combobox__button srp-combobox__clear", icon: icons.Close, label: props.clearLabel || sds.labels.clearValue(name || ""), onMouseDown: keep, onClick: clear }) : null, /* @__PURE__ */ React.createElement(InputAction, { tabIndex: -1, className: "srp-combobox__button srp-combobox__toggle", icon: icons.ExpandMore, label: props.toggleLabel || sds.labels.showOptions, "aria-expanded": open, "aria-controls": open ? listId : void 0, disabled: locked, onMouseDown: keep, onClick: () => {
    if (open) hide("trigger");
    else show("selected");
    if (input.current) input.current.focus();
  } })), /* @__PURE__ */ React.createElement("div", { ref: pop, className: "srp-combobox__popup", ...{
    popover: "manual"
  }, hidden: !open || void 0, inert: !open || void 0, "data-instant": exit.instant ? "" : void 0, onMouseDown: keep }, loading ? /* @__PURE__ */ React.createElement("div", { className: "srp-combobox__message", role: "status" }, /* @__PURE__ */ React.createElement(LoaderRing, { size: "sm" }), props.loadingText || sds.labels.loadingResults) : null, /* @__PURE__ */ React.createElement("div", { ref: setListbox, id: listId, role: "listbox", className: "srp-combobox__listbox", style: win.before || win.after ? {
    "--srp-cbx-before": win.before + "px",
    "--srp-cbx-after": win.after + "px"
  } : void 0, "aria-multiselectable": multi || void 0, "aria-labelledby": rest["aria-labelledby"] || (rest["aria-label"] ? void 0 : fieldLabel), "aria-label": rest["aria-labelledby"] ? void 0 : rest["aria-label"] }, shownList ? rows : null), more && !loading && !failed ? /* @__PURE__ */ React.createElement("div", { className: "srp-combobox__message" }, moreText) : null, !loading && failed ? /* @__PURE__ */ React.createElement("div", { className: "srp-combobox__message" }, sds.labels.loadFailed) : null, !loading && !failed && shown.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "srp-combobox__message" }, props.emptyText ?? sds.labels.noResults) : null), props.name && multi ? values.map((v_6) => /* @__PURE__ */ React.createElement("input", { key: v_6, type: "hidden", name: props.name, form: rest.form, value: v_6, disabled: rest.disabled })) : null, props.name && !multi ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: rest.form, value: value ?? "", disabled: rest.disabled }) : null);
}
var Combobox = /* @__PURE__ */ named("Combobox", ComboboxRender);
export {
  Combobox
};
//# sourceMappingURL=Combobox.js.map
