"use client";

// src/components/Form/Form.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, useLatest, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { FormErrorsContext, FormSubmittingContext } from "../../internal/formErrors.js";
import { getPath, issueKey, merge, pathKey, readFlat, same, stamp, toNested } from "../../internal/formValues.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { problemText } from "../../internal/validity.js";
import { byId } from "../../internal/root.js";
import { en as inputWords } from "../Input/labels.js";
import { Alert } from "../Alert/Alert.js";
import { ErrorSummary } from "../ErrorSummary/ErrorSummary.js";
import { en as words } from "./labels.js";
var START = {
  shown: {},
  server: {},
  checking: /* @__PURE__ */ new Set(),
  failed: false,
  version: 0,
  message: null,
  submitting: false,
  submitCount: 0,
  dirty: false,
  draftSavedAt: null
};
var shows = (m) => m != null && m !== false && m !== "";
var without = (o, k) => {
  if (!(k in o)) return o;
  const n = {
    ...o
  };
  delete n[k];
  return n;
};
var keyed = (errors) => {
  const out = {};
  for (const [k, v] of Object.entries(errors || {})) if (shows(v)) out[pathKey(k)] = v;
  return out;
};
var draftKey = (key) => "serupa-form-draft:" + key;
var SERVER = "\0server";
var never = () => () => {
};
function readDraft(key) {
  if (!key) return null;
  try {
    return window.localStorage.getItem(draftKey(key));
  } catch {
    return null;
  }
}
function parseDraft(raw) {
  if (!raw || raw === SERVER) return null;
  let saved = null;
  try {
    saved = JSON.parse(raw);
  } catch {
    return null;
  }
  const values = saved && typeof saved === "object" ? saved.values : null;
  return values && typeof values === "object" ? values : null;
}
var DRAFT_WAIT = 600;
var CHECK_WAIT = 500;
var FormContext = /* @__PURE__ */ React.createContext(null);
var FormInternals = /* @__PURE__ */ React.createContext(null);
function FormRender({
  ref,
  ...props
}) {
  const {
    schema,
    defaultValues,
    onSubmit,
    checks,
    errors,
    message,
    draft,
    warnUnsaved,
    summary,
    onUnsavedChanges,
    onEdit,
    className,
    children,
    ...rest
  } = props;
  const sds = useSettings(words), say = useSettings(inputWords).labels.invalidValue, locale = useLocale();
  const [st, setSt] = React.useState(() => {
    const server = keyed(errors);
    return {
      ...START,
      server,
      failed: Object.keys(server).length > 0,
      message: shows(message) ? message : null
    };
  });
  const patch = React.useCallback((f) => setSt((s) => {
    const p = f(s);
    return p ? {
      ...s,
      ...p
    } : s;
  }), []);
  const latest = useLatest({
    schema,
    onSubmit,
    checks,
    onEdit,
    say,
    locale,
    draft,
    summary
  });
  const form = React.useRef(null);
  const mergedRef = useMergedRef(ref, (n) => {
    form.current = n;
  });
  const [given, setGiven] = React.useState({
    errors,
    message
  });
  if (given.errors !== errors || given.message !== message) {
    setGiven({
      errors,
      message
    });
    const server_0 = keyed(errors);
    setSt((s_0) => ({
      ...s_0,
      server: server_0,
      failed: Object.keys(server_0).length > 0,
      version: s_0.version + 1,
      message: shows(message) ? message : null
    }));
  }
  const stored = React.useSyncExternalStore(never, () => readDraft(draft), () => SERVER);
  const [taken, setTaken] = React.useState(stored);
  if (taken === SERVER && stored !== SERVER) setTaken(stored);
  const [discards, setDiscards] = React.useState(0);
  const restored = React.useMemo(() => parseDraft(taken), [taken]);
  const generation = (taken === SERVER ? "s" : "c") + discards;
  const defaults = React.useMemo(() => restored ? merge(defaultValues || {}, toNested(restored)) : defaultValues || {}, [defaultValues, restored]);
  const latestDefaults = useLatest(defaults);
  const live = React.useRef({
    flat: /* @__PURE__ */ new Map(),
    baseline: null,
    issues: {},
    eager: /* @__PURE__ */ new Set(),
    // fields that have shown a message: checked again as they change
    found: /* @__PURE__ */ new Map(),
    // the checks' answers, by the value they were for
    running: /* @__PURE__ */ new Map(),
    waits: /* @__PURE__ */ new Map(),
    listeners: /* @__PURE__ */ new Set(),
    nested: {},
    read: false,
    queued: false,
    draftTimer: 0,
    submitting: false,
    run: 0
  });
  const validate = React.useCallback(async (flat) => {
    const L = latest.current, nested = toNested(flat), issues = {};
    let output = nested;
    if (L.schema) {
      const r = await L.schema["~standard"].validate(nested);
      if (r.issues) {
        for (const i of r.issues) {
          const k = issueKey(i.path);
          if (!(k in issues)) issues[k] = i.message;
        }
      } else output = r.value;
    }
    const el = form.current;
    if (el) for (const c of Array.from(el.elements)) {
      if (!c.name || !c.willValidate || c.validity.valid || c.validity.customError) continue;
      const k_0 = pathKey(c.name);
      if (!(k_0 in issues)) issues[k_0] = problemText(c, L.say, L.locale) || c.validationMessage;
    }
    live.current.issues = issues;
    return {
      issues,
      output
    };
  }, [latest]);
  const check = React.useCallback((k_1, flat_0) => {
    const fn = latest.current.checks && latest.current.checks[k_1];
    if (!fn) return null;
    const L_0 = live.current, value = flat_0.get(k_1), v = stamp(value);
    const known = L_0.found.get(k_1);
    if (known && known.value === v) return Promise.resolve(known.message);
    const now = L_0.running.get(k_1);
    if (now && now.value === v) return now.done;
    if (now) now.abort.abort();
    const abort = new AbortController();
    const done = Promise.resolve().then(() => fn(value, {
      values: toNested(flat_0),
      signal: abort.signal
    })).then((m) => m, () => null);
    L_0.running.set(k_1, {
      value: v,
      done,
      abort
    });
    patch((s_1) => s_1.checking.has(k_1) ? null : {
      checking: new Set(s_1.checking).add(k_1)
    });
    void done.then((message_0) => {
      if (abort.signal.aborted) return;
      L_0.running.delete(k_1);
      L_0.found.set(k_1, {
        value: v,
        message: message_0
      });
      patch((s_2) => {
        const c_0 = new Set(s_2.checking);
        c_0.delete(k_1);
        return {
          checking: c_0
        };
      });
    });
    return done;
  }, [latest, patch]);
  const showFor = React.useCallback((keys, flat_1) => {
    const L_1 = live.current, next = {};
    const gone = [];
    for (const k_2 of keys) {
      const own = L_1.issues[k_2];
      if (shows(own)) {
        next[k_2] = own;
        L_1.eager.add(k_2);
        continue;
      }
      const known_0 = L_1.found.get(k_2);
      if (known_0 && known_0.value === stamp(flat_1.get(k_2)) && shows(known_0.message)) {
        next[k_2] = known_0.message;
        L_1.eager.add(k_2);
        continue;
      }
      gone.push(k_2);
    }
    patch((s_3) => {
      let shown = s_3.shown;
      for (const k_3 of gone) shown = without(shown, k_3);
      for (const [k_4, m_0] of Object.entries(next)) if (shown[k_4] !== m_0) shown = {
        ...shown,
        [k_4]: m_0
      };
      return shown === s_3.shown ? null : {
        shown,
        failed: s_3.failed && Object.keys(shown).length + Object.keys(s_3.server).length > 0
      };
    });
  }, [patch]);
  const recheck = React.useCallback(async (keys_0, wait) => {
    const L_2 = live.current, run = ++L_2.run, flat_2 = L_2.flat;
    await validate(flat_2);
    if (run !== L_2.run) return;
    showFor(keys_0, flat_2);
    for (const k_5 of keys_0) {
      if (shows(L_2.issues[k_5]) || !(latest.current.checks && latest.current.checks[k_5])) continue;
      const known_1 = L_2.found.get(k_5);
      if (known_1 && known_1.value === stamp(flat_2.get(k_5))) continue;
      window.clearTimeout(L_2.waits.get(k_5));
      L_2.waits.set(k_5, window.setTimeout(() => {
        const p_0 = check(k_5, L_2.flat);
        if (p_0) void p_0.then(() => showFor([k_5], L_2.flat));
      }, wait));
    }
  }, [validate, showFor, check, latest]);
  const saveDraft = React.useCallback(() => {
    const L_3 = live.current, key = latest.current.draft, el_0 = form.current;
    if (!key || !el_0) return;
    window.clearTimeout(L_3.draftTimer);
    L_3.draftTimer = window.setTimeout(() => {
      const secret = new Set(Array.from(el_0.querySelectorAll('input[type=password], [autocomplete^="cc-"], [autocomplete~="one-time-code"]'), (c_1) => pathKey(c_1.name)));
      const keep = {};
      L_3.flat.forEach((v_0, k_6) => {
        if (!secret.has(k_6) && !(typeof File !== "undefined" && (v_0 instanceof File || Array.isArray(v_0) && v_0.some((f_0) => f_0 instanceof File)))) keep[k_6] = v_0;
      });
      try {
        window.localStorage.setItem(draftKey(key), JSON.stringify({
          at: Date.now(),
          values: keep
        }));
      } catch {
        return;
      }
      patch(() => ({
        draftSavedAt: Date.now()
      }));
    }, DRAFT_WAIT);
  }, [latest, patch]);
  const changed = React.useCallback(() => {
    const L_4 = live.current;
    if (L_4.queued) return;
    L_4.queued = true;
    queueMicrotask(() => {
      L_4.queued = false;
      const el_1 = form.current;
      if (!el_1 || !el_1.isConnected) return;
      const prev = L_4.flat, flat_3 = readFlat(el_1);
      L_4.flat = flat_3;
      const moved = /* @__PURE__ */ new Set();
      flat_3.forEach((v_1, k_7) => {
        if (!prev.has(k_7) || !same(prev.get(k_7), v_1)) moved.add(k_7);
      });
      prev.forEach((_, k_8) => {
        if (!flat_3.has(k_8)) moved.add(k_8);
      });
      const first = !L_4.read;
      if (first) {
        L_4.read = true;
        L_4.baseline = stamp(flat_3);
      }
      if (!moved.size) return;
      L_4.nested = toNested(flat_3);
      L_4.listeners.forEach((f_1) => {
        f_1();
      });
      const dirty = stamp(flat_3) !== L_4.baseline;
      patch((s_4) => {
        let server_1 = s_4.server;
        for (const k_9 of moved) if (prev.has(k_9) && flat_3.has(k_9)) server_1 = without(server_1, k_9);
        return server_1 === s_4.server && dirty === s_4.dirty ? null : {
          server: server_1,
          dirty
        };
      });
      const cb = latest.current.onEdit;
      if (cb) cb(L_4.nested);
      if (L_4.eager.size) void recheck(Array.from(L_4.eager), CHECK_WAIT);
      if (!first) saveDraft();
    });
  }, [patch, recheck, latest, saveDraft]);
  React.useEffect(() => {
    const el_2 = form.current;
    if (!el_2) return;
    changed();
    const watch = new MutationObserver(changed);
    watch.observe(el_2, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["value", "disabled", "name"]
    });
    const L_5 = live.current;
    return () => {
      watch.disconnect();
      L_5.waits.forEach((t) => {
        window.clearTimeout(t);
      });
      window.clearTimeout(L_5.draftTimer);
      L_5.running.forEach((r_0) => {
        r_0.abort.abort();
      });
    };
  }, [changed, generation]);
  const left = (e) => {
    const t_0 = e.target;
    const root = t_0.closest('[data-component="field"]') || t_0;
    const named2 = t_0.name ? [t_0] : Array.from(root.querySelectorAll("[name]"));
    const keys_1 = named2.filter((c_2) => c_2.form === form.current).map((c_3) => pathKey(c_3.name));
    if (!keys_1.length) return;
    window.setTimeout(() => {
      const doc = root.ownerDocument;
      if (root !== t_0 && (root.contains(doc.activeElement) || root.querySelector('[aria-expanded="true"]'))) return;
      void recheck(keys_1, 0);
    });
  };
  const first_0 = React.useRef(false);
  const fail = React.useCallback((issues_0, keys_2) => {
    const L_6 = live.current, shown_0 = {};
    for (const [k_10, m_1] of Object.entries(issues_0)) if (k_10 && shows(m_1) && (!keys_2 || keys_2.indexOf(k_10) >= 0)) {
      shown_0[k_10] = m_1;
      L_6.eager.add(k_10);
    }
    first_0.current = latest.current.summary === false;
    patch((s_5) => ({
      shown: keys_2 ? {
        ...s_5.shown,
        ...shown_0
      } : shown_0,
      failed: true,
      version: s_5.version + 1,
      message: keys_2 ? s_5.message : issues_0[""] || null
    }));
  }, [latest, patch]);
  const everything = React.useCallback(async (flat_4, keys_3) => {
    const res = await validate(flat_4);
    const issues_1 = {
      ...res.issues
    };
    const names = Object.keys(latest.current.checks || {}).filter((k_11) => flat_4.has(k_11) && !shows(issues_1[k_11]) && (!keys_3 || keys_3.indexOf(k_11) >= 0));
    const answers = await Promise.all(names.map((k_12) => Promise.resolve(check(k_12, flat_4))));
    names.forEach((k_13, i_0) => {
      if (shows(answers[i_0])) issues_1[k_13] = answers[i_0];
    });
    const bad = Object.keys(issues_1).filter((k_14) => shows(issues_1[k_14]) && (!keys_3 || keys_3.indexOf(k_14) >= 0));
    return {
      issues: issues_1,
      output: res.output,
      ok: !bad.length
    };
  }, [validate, check, latest]);
  const submit = async () => {
    const L_7 = live.current, el_3 = form.current;
    if (!el_3 || L_7.submitting) return;
    L_7.submitting = true;
    const flat_5 = readFlat(el_3);
    L_7.flat = flat_5;
    patch((s_6) => ({
      submitCount: s_6.submitCount + 1,
      message: null
    }));
    try {
      const res = await everything(flat_5);
      if (!res.ok) {
        fail(res.issues);
        return;
      }
      patch(() => ({
        shown: {},
        server: {},
        failed: false,
        submitting: true
      }));
      const send = latest.current.onSubmit;
      const answer = send ? await send(res.output, handleRef.current) : void 0;
      if (answer && (shows(answer.message) || Object.keys(keyed(answer.errors)).length)) {
        const server = keyed(answer.errors);
        patch((s) => ({
          server,
          failed: Object.keys(server).length > 0,
          version: s.version + 1,
          message: answer.message ?? null
        }));
        return;
      }
      L_7.baseline = stamp(L_7.flat);
      patch(() => ({
        dirty: false,
        draftSavedAt: null
      }));
      const key = latest.current.draft;
      if (key) {
        window.clearTimeout(L_7.draftTimer);
        try {
          window.localStorage.removeItem(draftKey(key));
        } catch {
        }
      }
    } finally {
      L_7.submitting = false;
      patch((s) => s.submitting ? {
        submitting: false
      } : null);
    }
  };
  const onFormSubmit = (e_0) => {
    if (e_0.target !== e_0.currentTarget) return;
    e_0.preventDefault();
    void submit();
  };
  const onFormReset = () => {
    const L_8 = live.current;
    L_8.eager.clear();
    L_8.found.clear();
    L_8.issues = {};
    patch(() => ({
      shown: {},
      server: {},
      failed: false,
      message: null
    }));
    window.setTimeout(changed);
  };
  const [ids, setIds] = React.useState(/* @__PURE__ */ new Map());
  const place = React.useCallback((name, id) => {
    const k_15 = pathKey(name);
    setIds((m_2) => m_2.get(k_15) === id ? m_2 : new Map(m_2).set(k_15, id));
    return () => setIds((m_3) => {
      if (m_3.get(k_15) !== id) return m_3;
      const n_0 = new Map(m_3);
      n_0.delete(k_15);
      return n_0;
    });
  }, []);
  const list = () => {
    const el_4 = form.current, all = {
      ...st.server,
      ...st.shown
    };
    const where = (k_16) => {
      const id_0 = ids.get(k_16);
      const byName = el_4 ? Array.from(el_4.elements).find((c_4) => c_4.name && pathKey(c_4.name) === k_16) : void 0;
      return (id_0 && el_4 ? byId(el_4, id_0) : null) || byName || null;
    };
    const rows = Object.keys(all).filter((k_17) => k_17 && shows(all[k_17])).map((k_18) => {
      const at = where(k_18);
      return {
        name: k_18,
        at,
        field: at && at.id || ids.get(k_18) || k_18,
        message: all[k_18]
      };
    });
    rows.sort((a, b) => a.at && b.at ? a.at.compareDocumentPosition(b.at) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1 : a.at ? -1 : b.at ? 1 : 0);
    return rows.map(({
      name: name_0,
      field,
      message: message_1
    }) => ({
      name: name_0,
      field,
      message: message_1
    }));
  };
  React.useEffect(() => {
    if (!first_0.current || !st.failed) return;
    first_0.current = false;
    const top = list()[0], el_5 = form.current;
    const to = top && el_5 ? byId(el_5, top.field) : null;
    if (to) to.focus();
  });
  const prefix = sds.labels.formErrorTitle("");
  React.useEffect(() => {
    if (!st.failed || typeof document === "undefined") return;
    const before = document.title;
    if (!before.startsWith(prefix)) document.title = sds.labels.formErrorTitle(before);
    return () => {
      if (document.title === sds.labels.formErrorTitle(before)) document.title = before;
    };
  }, [st.failed, prefix, sds.labels]);
  const tellDirty = useLatest(onUnsavedChanges);
  const toldDirty = React.useRef(false);
  React.useEffect(() => {
    if (toldDirty.current === st.dirty) return;
    toldDirty.current = st.dirty;
    if (tellDirty.current) tellDirty.current(st.dirty);
  }, [st.dirty, tellDirty]);
  React.useEffect(() => {
    if (!warnUnsaved || !st.dirty || st.submitting) return;
    const ask = (e_1) => {
      e_1.preventDefault();
      e_1.returnValue = "";
    };
    window.addEventListener("beforeunload", ask);
    return () => {
      window.removeEventListener("beforeunload", ask);
    };
  }, [warnUnsaved, st.dirty, st.submitting]);
  const errorsValue = {
    message: (name_1) => {
      const k_19 = pathKey(name_1);
      return shows(st.shown[k_19]) ? st.shown[k_19] : shows(st.server[k_19]) ? st.server[k_19] : null;
    },
    clear: (name_2) => {
      const k_20 = pathKey(name_2);
      patch((s_7) => k_20 in s_7.server ? {
        server: without(s_7.server, k_20)
      } : null);
    },
    place,
    list: () => st.failed ? list() : [],
    version: st.version,
    checking: (name_3) => st.checking.has(pathKey(name_3)) ? sds.labels.formChecking : null,
    // A field takes its default while the form first mounts, and later only if a field of that name was already there
    // (the form mounting again with a draft): a FieldList row added later starts empty, not with a removed row's value.
    defaultValue: (name_4) => {
      const k_21 = pathKey(name_4), L_9 = live.current;
      return !L_9.read || L_9.flat.has(k_21) ? getPath(defaults, k_21) : void 0;
    }
  };
  const handle = {
    values: () => toNested(form.current ? readFlat(form.current) : live.current.flat),
    defaults,
    setErrors: (errs, message_2) => {
      const server_2 = keyed(errs);
      patch((s_8) => ({
        server: server_2,
        failed: Object.keys(server_2).length > 0,
        version: s_8.version + 1,
        message: message_2 ?? null
      }));
    },
    validate: async (names_0) => {
      const el_6 = form.current;
      if (!el_6) return true;
      const flat_6 = readFlat(el_6), keys_4 = names_0 ? names_0.map(pathKey) : void 0;
      live.current.flat = flat_6;
      const res_0 = await everything(flat_6, keys_4);
      if (res_0.ok) {
        showFor(keys_4 || Object.keys(st.shown), flat_6);
        return true;
      }
      fail(res_0.issues, keys_4);
      return false;
    },
    submit: () => {
      if (form.current) form.current.requestSubmit();
    },
    reset: () => {
      if (form.current) form.current.reset();
    },
    discardDraft: () => {
      const key_0 = latest.current.draft;
      if (key_0) {
        window.clearTimeout(live.current.draftTimer);
        try {
          window.localStorage.removeItem(draftKey(key_0));
        } catch {
        }
      }
      live.current.read = false;
      setTaken(null);
      setDiscards((d) => d + 1);
      patch(() => ({
        shown: {},
        server: {},
        failed: false,
        dirty: false,
        draftSavedAt: null
      }));
    },
    dirty: st.dirty,
    submitting: st.submitting,
    submitCount: st.submitCount,
    draftSavedAt: st.draftSavedAt,
    draftRestored: restored != null
  };
  const handleRef = useLatest(handle);
  const internals = React.useMemo(() => ({
    show: (keys_5) => handleRef.current.validate(keys_5)
  }), [handleRef]);
  const store = React.useMemo(() => ({
    subscribe: (f_2) => {
      live.current.listeners.add(f_2);
      return () => {
        live.current.listeners.delete(f_2);
      };
    },
    get: (name_5) => live.current.read ? getPath(live.current.nested, pathKey(name_5)) : getPath(latestDefaults.current, pathKey(name_5))
  }), [latestDefaults]);
  return /* @__PURE__ */ React.createElement("form", { noValidate: true, ...rest, ref: mergedRef, className: cn("srp-form", className), "data-component": "form", "aria-busy": st.submitting || void 0, onSubmit: onFormSubmit, onReset: onFormReset, onInput: changed, onChange: changed, onBlur: left }, /* @__PURE__ */ React.createElement(FormContext.Provider, { value: handle }, /* @__PURE__ */ React.createElement(StoreContext.Provider, { value: store }, /* @__PURE__ */ React.createElement(FormInternals.Provider, { value: internals }, /* @__PURE__ */ React.createElement(FormErrorsContext.Provider, { value: errorsValue }, /* @__PURE__ */ React.createElement(FormSubmittingContext.Provider, { value: st.submitting }, shows(st.message) ? /* @__PURE__ */ React.createElement(Alert, { tone: "danger", role: "alert", className: "srp-form__message" }, st.message) : null, summary !== false ? /* @__PURE__ */ React.createElement(ErrorSummary, { className: "srp-form__summary" }) : null, /* @__PURE__ */ React.createElement(React.Fragment, { key: generation }, children)))))));
}
var StoreContext = /* @__PURE__ */ React.createContext(null);
var Form = /* @__PURE__ */ named("Form", FormRender);
function useForm() {
  const f = React.useContext(FormContext);
  if (!f) {
    throw new Error("useForm: call it inside a <Form>.");
  }
  return f;
}
function useFormValue(name) {
  const $ = _c(3);
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error("useFormValue: call it inside a <Form>.");
  }
  let t0;
  if ($[0] !== name || $[1] !== store) {
    t0 = () => store.get(name);
    $[0] = name;
    $[1] = store;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const get = t0;
  return React.useSyncExternalStore(store.subscribe, get, get);
}
export {
  Form,
  FormInternals,
  useForm,
  useFormValue
};
//# sourceMappingURL=Form.js.map
