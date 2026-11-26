'use client';
import * as React from 'react';
import { cn, useLatest, useMergedRef } from '../../internal/cn';
import { named } from '../../internal/component';
import { FormErrorsContext, FormSubmittingContext, type FormErrorsValue } from '../../internal/formErrors';
import { getPath, issueKey, merge, pathKey, readFlat, same, stamp, toNested, type FlatValues } from '../../internal/formValues';
import type { InferInput, InferOutput, StandardSchemaV1 } from '../../internal/standardSchema';
import { useLocale, useSettings } from '../../internal/provider';
import { problemText } from '../../internal/validity';
import { byId } from '../../internal/root';
import { en as inputWords } from '../Input/labels';
import { en as errorWords } from '../ErrorBoundary/labels';
import { Alert } from '../Alert/Alert';
import { ErrorSummary } from '../ErrorSummary/ErrorSummary';
import { en as words } from './labels';

/** What onSubmit can answer when the server turns the values down: messages by field name, and one for the whole form. */
export interface FormSubmitResult {
  /** Messages by field name ("email", "addresses.1.city"), as the server sent them. Each shows on its field and in the summary. */
  errors?: Readonly<Record<string, React.ReactNode>> | null | undefined;
  /** A problem that isn't one field's ("The payment was declined"), in an alert at the top of the form. */
  message?: React.ReactNode;
}

/** A check that runs after the schema passes, often on the server: the message when the answer won't do, else null. */
export type FormCheck = (value: unknown, context: { values: Record<string, unknown>; signal: AbortSignal }) => React.ReactNode | Promise<React.ReactNode>;

/** The form, for code inside it (useForm) and for onSubmit. */
export interface FormHandle {
  /** The values now, as the fields hold them, before the schema checks them. */
  values: () => Record<string, unknown>;
  /** The values the form started with: defaultValues, with a restored draft laid over them. */
  defaults: Record<string, unknown>;
  /** Shows messages on fields by name, as a failed submit does (the summary lists them and takes focus); null clears them. */
  setErrors: (errors: Readonly<Record<string, React.ReactNode>> | null, message?: React.ReactNode) => void;
  /** Checks the fields with these names (all, without names) and shows what's wrong with them. True when they pass. */
  validate: (names?: readonly string[]) => Promise<boolean>;
  /** Submits the form, as its submit button does. */
  submit: () => void;
  /** Puts every field back as it started, and clears the messages. */
  reset: () => void;
  /** Forgets the saved draft and puts the fields back to defaultValues. */
  discardDraft: () => void;
  /** Something differs from how the form started, or from what was last sent. */
  dirty: boolean;
  /** onSubmit is running. */
  submitting: boolean;
  /** How many times the form was submitted, whether or not it passed. */
  submitCount: number;
  /** With draft: when the draft was last saved (ms since 1970), or null. */
  draftSavedAt: number | null;
  /** With draft: the fields were filled from a saved draft. */
  draftRestored: boolean;
}

type In<S> = S extends StandardSchemaV1 ? InferInput<S> : Record<string, unknown>;
type Out<S> = S extends StandardSchemaV1 ? InferOutput<S> : Record<string, unknown>;
type DeepPartial<T> = T extends readonly (infer U)[] ? readonly DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export interface FormProps<S extends StandardSchemaV1 | undefined = undefined> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'action' | 'children' | 'defaultValue'> {
  /** The rules, as a Zod, Valibot or ArkType schema (any Standard Schema). Its messages are the fields' errors, and
   *  onSubmit gets its output, typed. Without one, the controls' own constraints (required, type="email") are checked. */
  schema?: S | undefined;
  /** The values the fields start with, by name: { email: 'ani@example.com', address: { city: 'Bandung' } }. A field
   *  whose control has its own value or defaultValue keeps it. */
  defaultValues?: DeepPartial<In<S>> | undefined;
  /** Called with the checked values when the form is submitted and passes. Return or resolve { errors, message } when
   *  the server turns them down; a promise keeps the submit button loading until it settles. */
  onSubmit?: ((values: Out<S>, form: FormHandle) => void | FormSubmitResult | Promise<void | FormSubmitResult | undefined>) | undefined;
  /** Checks that run once a field passes the schema, by field name, such as whether a username is taken: each gets
   *  the value and a `signal`, and returns the field's message, or null. The field says "Checking…" meanwhile; a newer
   *  answer cancels the older check. */
  checks?: Readonly<Record<string, FormCheck>> | undefined;
  /** Messages by field name from a server, such as a form action's answer: a new object shows them all again. */
  errors?: Readonly<Record<string, React.ReactNode>> | null | undefined;
  /** A message from a server that isn't one field's ("The payment was declined"), such as a form action's answer: an
   *  alert at the top of the form. */
  message?: React.ReactNode;
  /** Saves the answers in the browser under this key as people type, and fills them back in when the form comes back.
   *  Passwords and card numbers are never saved. The draft is forgotten when the form is sent. */
  draft?: string | undefined;
  /** Asks before the page is closed or reloaded while there are changes that weren't sent. */
  warnUnsaved?: boolean | undefined;
  /** An ErrorSummary at the top when a submit fails. false: none (place your own, or focus moves to the first field
   *  with an error). Default: true. */
  summary?: boolean | undefined;
  /** Called when the form gets changes that weren't sent, and when it has none again: a Dialog around it takes this as
   *  its unsaved prop, so closing it asks first. */
  onUnsavedChanges?: ((unsaved: boolean) => void) | undefined;
  /** Called with the values (unchecked) whenever a field changes. */
  onEdit?: ((values: Record<string, unknown>) => void) | undefined;
  /** The fields and the submit button. */
  children?: React.ReactNode | undefined;
}

interface State {
  shown: Readonly<Record<string, React.ReactNode>>;   // the schema's and the checks' messages showing, by path
  server: Readonly<Record<string, React.ReactNode>>;  // the server's messages still showing
  checking: ReadonlySet<string>;
  failed: boolean;      // a submit failed: the summary lists the messages
  version: number;      // moves on with each failed submit, so the summary takes focus again
  message: React.ReactNode;
  submitting: boolean;
  submitCount: number;
  dirty: boolean;
  draftSavedAt: number | null;
}
const START: State = { shown: {}, server: {}, checking: new Set(), failed: false, version: 0, message: null, submitting: false, submitCount: 0, dirty: false, draftSavedAt: null };
const shows = (m: React.ReactNode) => m != null && m !== false && m !== '';
const without = <T,>(o: Readonly<Record<string, T>>, k: string) => { if (!(k in o)) return o; const n = { ...o }; delete n[k]; return n; };
const keyed = (errors: Readonly<Record<string, React.ReactNode>> | null | undefined) => {
  const out: Record<string, React.ReactNode> = {};
  for (const [k, v] of Object.entries(errors || {})) if (shows(v)) out[pathKey(k)] = v;
  return out;
};
const draftKey = (key: string) => 'serupa-form-draft:' + key;
const SERVER = '\u0000server';   // the draft before hydrating: unknown yet
const never = () => () => {};
function readDraft(key: string | undefined): string | null {
  if (!key) return null;
  try { return window.localStorage.getItem(draftKey(key)); } catch { return null; }   // storage blocked: no draft
}
function parseDraft(raw: string | null): Record<string, unknown> | null {
  if (!raw || raw === SERVER) return null;
  let saved: unknown = null;
  try { saved = JSON.parse(raw); } catch { return null; }
  const values = saved && typeof saved === 'object' ? (saved as { values?: unknown }).values : null;
  return values && typeof values === 'object' ? (values as Record<string, unknown>) : null;
}
const DRAFT_WAIT = 600, CHECK_WAIT = 500;

interface Live {
  flat: FlatValues;
  baseline: string | null;
  issues: Record<string, React.ReactNode>;
  eager: Set<string>;
  found: Map<string, { value: string; message: React.ReactNode }>;
  running: Map<string, { value: string; done: Promise<React.ReactNode>; abort: AbortController }>;
  waits: Map<string, number>;
  listeners: Set<() => void>;
  nested: Record<string, unknown>;
  read: boolean;
  queued: boolean;
  draftTimer: number;
  submitting: boolean;
  run: number;
}

const FormContext = /* @__PURE__ */ React.createContext<FormHandle | null>(null);
/** Steps in a form (FormSteps) check their own fields this way. */
export const FormInternals = /* @__PURE__ */ React.createContext<{ show: (keys: readonly string[]) => Promise<boolean> } | null>(null);

function FormRender<S extends StandardSchemaV1 | undefined = undefined>({ ref, ...props }: FormProps<S> & React.RefAttributes<HTMLFormElement>) {
  const { schema, defaultValues, onSubmit, checks, errors, message, draft, warnUnsaved, summary, onUnsavedChanges, onEdit, className, children, ...rest } = props;
  const sds = useSettings(words), say = useSettings(inputWords).labels.invalidValue, submitFailed = useSettings(errorWords).labels.errorTitle, locale = useLocale();
  // The server's answer it starts with (a form action's, rendered on the server) shows from the first render.
  const [st, setSt] = React.useState<State>(() => {
    const server = keyed(errors);
    return { ...START, server, failed: Object.keys(server).length > 0, message: shows(message) ? message : null };
  });
  const patch = React.useCallback((f: (s: State) => Partial<State> | null) => setSt((s) => { const p = f(s); return p ? { ...s, ...p } : s; }), []);
  const latest = useLatest({ schema, onSubmit, checks, onEdit, say, submitFailed, locale, draft, summary });
  const form = React.useRef<HTMLFormElement | null>(null);
  const mergedRef = useMergedRef(ref, (n) => { form.current = n; });

  // A new errors object from the server (a form action's next answer) shows every message again (setState in render).
  const [given, setGiven] = React.useState({ errors, message });
  if (given.errors !== errors || given.message !== message) {
    setGiven({ errors, message });
    const server = keyed(errors);
    setSt((s) => ({ ...s, server, failed: Object.keys(server).length > 0, version: s.version + 1, message: shows(message) ? message : null }));
  }

  // Draft: read from the browser's storage as the form first renders (after hydrating, on a page the server drew), then
  // kept: saving as people type doesn't change what was restored. The fields mount again when it arrives late.
  const stored = React.useSyncExternalStore(never, () => readDraft(draft), () => SERVER);
  const [taken, setTaken] = React.useState<string | null>(stored);
  if (taken === SERVER && stored !== SERVER) setTaken(stored);
  const [discards, setDiscards] = React.useState(0);
  const restored = React.useMemo(() => parseDraft(taken), [taken]);
  const generation = (taken === SERVER ? 's' : 'c') + discards;
  const defaults = React.useMemo(() => (restored ? merge(defaultValues || {}, toNested(restored)) : defaultValues || {}) as Record<string, unknown>, [defaultValues, restored]);
  const latestDefaults = useLatest(defaults);

  // What the form knows that doesn't draw anything.
  const live = React.useRef<Live>({
    flat: new Map<string, unknown>(),
    baseline: null,
    issues: {},
    eager: new Set<string>(),            // fields that have shown a message: checked again as they change
    found: new Map<string, { value: string; message: React.ReactNode }>(),   // the checks' answers, by the value they were for
    running: new Map<string, { value: string; done: Promise<React.ReactNode>; abort: AbortController }>(),
    waits: new Map<string, number>(),
    listeners: new Set<() => void>(),
    nested: {},
    read: false,
    queued: false,
    draftTimer: 0,
    submitting: false,
    run: 0,
  });

  // The schema's messages, and the controls' own constraints, by path (the first one for each).
  const validate = React.useCallback(async (flat: FlatValues) => {
    const L = latest.current, nested = toNested(flat), issues: Record<string, React.ReactNode> = {};
    let output: unknown = nested;
    if (L.schema) {
      const r = await L.schema['~standard'].validate(nested);
      if (r.issues) { for (const i of r.issues) { const k = issueKey(i.path); if (!(k in issues)) issues[k] = i.message; } }
      else output = r.value;
    }
    // The schema's words win; a constraint it doesn't cover (maxLength, type="email") still counts.
    const el = form.current;
    if (el) for (const c of Array.from(el.elements) as HTMLInputElement[]) {
      if (!c.name || !c.willValidate || c.validity.valid || c.validity.customError) continue;
      const k = pathKey(c.name);
      if (!(k in issues)) issues[k] = problemText(c, L.say, L.locale) || c.validationMessage;
    }
    live.current.issues = issues;
    return { issues, output };
  }, [latest]);

  // A check's answer for the value a field has now: from before, from one running, or a new one.
  const check = React.useCallback((k: string, flat: FlatValues): Promise<React.ReactNode> | null => {
    const fn = latest.current.checks && latest.current.checks[k];
    if (!fn) return null;
    const L = live.current, value = flat.get(k), v = stamp(value);
    const known = L.found.get(k);
    if (known && known.value === v) return Promise.resolve(known.message);
    const now = L.running.get(k);
    if (now && now.value === v) return now.done;
    if (now) now.abort.abort();
    const abort = new AbortController();
    const done = Promise.resolve().then(() => fn(value, { values: toNested(flat), signal: abort.signal })).then((m) => m, () => null);
    L.running.set(k, { value: v, done, abort });
    patch((s) => (s.checking.has(k) ? null : { checking: new Set(s.checking).add(k) }));
    void done.then((message) => {
      if (abort.signal.aborted) return;
      L.running.delete(k);
      L.found.set(k, { value: v, message });
      patch((s) => { const c = new Set(s.checking); c.delete(k); return { checking: c }; });
    });
    return done;
  }, [latest, patch]);

  // Shows (or takes away) the messages of these fields from the latest issues and checks.
  const showFor = React.useCallback((keys: Iterable<string>, flat: FlatValues) => {
    const L = live.current, next: Record<string, React.ReactNode> = {};
    const gone: string[] = [];
    for (const k of keys) {
      const own = L.issues[k];
      if (shows(own)) { next[k] = own; L.eager.add(k); continue; }
      const known = L.found.get(k);
      if (known && known.value === stamp(flat.get(k)) && shows(known.message)) { next[k] = known.message; L.eager.add(k); continue; }
      gone.push(k);
    }
    patch((s) => {
      let shown = s.shown;
      for (const k of gone) shown = without(shown, k);
      for (const [k, m] of Object.entries(next)) if (shown[k] !== m) shown = { ...shown, [k]: m };
      return shown === s.shown ? null : { shown, failed: s.failed && Object.keys(shown).length + Object.keys(s.server).length > 0 };
    });
  }, [patch]);

  // A field was left or changed: validate, show its message, and run its check once the schema passes.
  const recheck = React.useCallback(async (keys: readonly string[], wait: number) => {
    const L = live.current, run = ++L.run, flat = L.flat;
    try { await validate(flat); } catch { return; }
    if (run !== L.run) return;
    showFor(keys, flat);
    for (const k of keys) {
      if (shows(L.issues[k]) || !(latest.current.checks && latest.current.checks[k])) continue;
      const known = L.found.get(k);
      if (known && known.value === stamp(flat.get(k))) continue;
      window.clearTimeout(L.waits.get(k));
      L.waits.set(k, window.setTimeout(() => {
        const p = check(k, L.flat);
        if (p) void p.then(() => showFor([k], L.flat));
      }, wait));
    }
  }, [validate, showFor, check, latest]);

  const saveDraft = React.useCallback(() => {
    const L = live.current, key = latest.current.draft, el = form.current;
    if (!key || !el) return;
    window.clearTimeout(L.draftTimer);
    L.draftTimer = window.setTimeout(() => {
      const secret = new Set(Array.from(el.querySelectorAll<HTMLInputElement>('input[type=password], [autocomplete~="current-password"], [autocomplete~="new-password"], [autocomplete^="cc-"], [autocomplete~="one-time-code"]'), (c) => pathKey(c.name)));
      const keep: Record<string, unknown> = {};
      L.flat.forEach((v, k) => { if (!secret.has(k) && !(typeof File !== 'undefined' && (v instanceof File || (Array.isArray(v) && v.some((f) => f instanceof File))))) keep[k] = v; });
      try { window.localStorage.setItem(draftKey(key), JSON.stringify({ at: Date.now(), values: keep })); } catch { return; }
      patch(() => ({ draftSavedAt: Date.now() }));
    }, DRAFT_WAIT);
  }, [latest, patch]);

  // Reads the values after the event (or the hidden input's change) that moved them, once per batch.
  const changed = React.useCallback(() => {
    const L = live.current;
    if (L.queued) return;
    L.queued = true;
    queueMicrotask(() => {
      L.queued = false;
      const el = form.current;
      if (!el || !el.isConnected) return;
      const prev = L.flat, flat = readFlat(el);
      L.flat = flat;
      const moved = new Set<string>();
      flat.forEach((v, k) => { if (!prev.has(k) || !same(prev.get(k), v)) moved.add(k); });
      prev.forEach((_, k) => { if (!flat.has(k)) moved.add(k); });
      const first = !L.read;
      if (first) { L.read = true; L.baseline = stamp(flat); }
      if (!moved.size) return;
      L.nested = toNested(flat);
      L.listeners.forEach((f) => { f(); });
      const dirty = stamp(flat) !== L.baseline;
      patch((s) => {
        let server = s.server;
        // Only an edit takes a server message away: not the first read, nor a field that has just appeared.
        for (const k of moved) if (prev.has(k) && flat.has(k)) server = without(server, k);
        return server === s.server && dirty === s.dirty ? null : { server, dirty };
      });
      const cb = latest.current.onEdit;
      if (cb) cb(L.nested);
      // A field showing a message is checked again as it changes, and so is every other one showing one: "Confirm
      // password" stops saying they don't match once the password is changed to match it.
      if (L.eager.size) void recheck(Array.from(L.eager), CHECK_WAIT);
      // The first read is the form as it came, not an answer: a form nobody has typed in keeps no draft.
      if (!first) saveDraft();
    });
  }, [patch, recheck, latest, saveDraft]);

  // Watch the form: typing and changes, and hidden inputs whose value a component sets (Combobox, DatePicker).
  React.useEffect(() => {
    const el = form.current;
    if (!el) return;
    changed();
    const watch = new MutationObserver(changed);
    watch.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['value', 'disabled', 'name'] });
    const L = live.current;
    return () => { watch.disconnect(); L.waits.forEach((t) => { window.clearTimeout(t); }); window.clearTimeout(L.draftTimer); L.running.forEach((r) => { r.abort.abort(); }); };
  }, [changed, generation]);

  // A field left: its message, once focus has really gone (not to the field's own popup or another of its radios).
  const left = (e: React.FocusEvent<HTMLFormElement>) => {
    const t = e.target as HTMLElement;
    const root = t.closest('[data-component="field"]') || t;
    const named = (t as HTMLInputElement).name ? [t as HTMLInputElement] : Array.from(root.querySelectorAll<HTMLInputElement>('[name]'));
    const keys = named.filter((c) => c.form === form.current).map((c) => pathKey(c.name));
    if (!keys.length) return;
    window.setTimeout(() => {
      const doc = root.ownerDocument;
      if (root !== t && (root.contains(doc.activeElement) || root.querySelector('[aria-expanded="true"]'))) return;
      void recheck(keys, 0);
    });
  };

  const first = React.useRef(false);   // focus the first field with a message once it has rendered (no summary)
  const fail = React.useCallback((issues: Record<string, React.ReactNode>, keys?: readonly string[]) => {
    const L = live.current, shown: Record<string, React.ReactNode> = {};
    for (const [k, m] of Object.entries(issues)) if (k && shows(m) && (!keys || keys.indexOf(k) >= 0)) { shown[k] = m; L.eager.add(k); }
    first.current = latest.current.summary === false;
    patch((s) => ({ shown: keys ? { ...s.shown, ...shown } : shown, failed: true, version: s.version + 1, message: keys ? s.message : issues[''] || null }));
  }, [latest, patch]);

  // Every check for the current values, the schema's issues first; the checks run for fields that pass it.
  const everything = React.useCallback(async (flat: FlatValues, keys?: readonly string[]) => {
    const res = await validate(flat);
    const issues = { ...res.issues };
    const names = Object.keys(latest.current.checks || {}).filter((k) => flat.has(k) && !shows(issues[k]) && (!keys || keys.indexOf(k) >= 0));
    const answers = await Promise.all(names.map((k) => Promise.resolve(check(k, flat))));
    names.forEach((k, i) => { if (shows(answers[i])) issues[k] = answers[i]; });
    const bad = Object.keys(issues).filter((k) => shows(issues[k]) && (!keys || keys.indexOf(k) >= 0));
    return { issues, output: res.output, ok: !bad.length };
  }, [validate, check, latest]);

  const submit = async () => {
    const L = live.current, el = form.current;
    if (!el || L.submitting) return;
    L.submitting = true;
    const flat = readFlat(el);
    L.flat = flat;
    patch((s) => ({ submitCount: s.submitCount + 1, message: null }));
    try {
      await (async () => {
        const res = await everything(flat);
        if (!res.ok) { fail(res.issues); return; }
        patch(() => ({ shown: {}, server: {}, failed: false, submitting: true }));
        const send = latest.current.onSubmit;
        const answer = send ? await send(res.output as Out<S>, handleRef.current) : undefined;
        if (answer && (shows(answer.message) || Object.keys(keyed(answer.errors)).length)) {
          const server = keyed(answer.errors);
          patch((s) => ({ server, failed: Object.keys(server).length > 0, version: s.version + 1, message: answer.message ?? null }));
          return;
        }
        // Sent: this is how the form starts now, and the draft has done its job.
        L.baseline = stamp(L.flat);
        patch(() => ({ dirty: false, draftSavedAt: null }));
        const key = latest.current.draft;
        if (key) { window.clearTimeout(L.draftTimer); try { window.localStorage.removeItem(draftKey(key)); } catch { /* storage blocked: nothing saved */ } }
      })().catch((err: unknown) => {
        const msg = err instanceof Error && err.message ? err.message : submitFailed;
        patch((s) => ({ failed: true, version: s.version + 1, message: msg }));
      });
    } finally {
      L.submitting = false;
      patch((s) => (s.submitting ? { submitting: false } : null));
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (e.target !== e.currentTarget) return;   // a form inside a portal (a Dialog's) isn't this one
    e.preventDefault();
    void submit();
  };
  const onFormReset = () => {
    const L = live.current;
    L.eager.clear(); L.found.clear(); L.issues = {};
    patch(() => ({ shown: {}, server: {}, failed: false, message: null }));
    window.setTimeout(changed);   // after the controls have their defaults back
  };

  const [ids, setIds] = React.useState<ReadonlyMap<string, string>>(new Map());
  const place = React.useCallback((name: string, id: string) => {
    const k = pathKey(name);
    setIds((m) => (m.get(k) === id ? m : new Map(m).set(k, id)));
    return () => setIds((m) => { if (m.get(k) !== id) return m; const n = new Map(m); n.delete(k); return n; });
  }, []);
  // The messages showing, in the order of their fields on the page.
  const list = () => {
    const el = form.current, all = { ...st.server, ...st.shown };
    const where = (k: string) => {
      const id = ids.get(k);
      const byName = el ? (Array.from(el.elements) as HTMLInputElement[]).find((c) => c.name && pathKey(c.name) === k) : undefined;
      return (id && el ? byId(el, id) : null) || byName || null;
    };
    const rows = Object.keys(all).filter((k) => k && shows(all[k])).map((k) => { const at = where(k); return { name: k, at, field: (at && at.id) || ids.get(k) || k, message: all[k] }; });
    rows.sort((a, b) => (a.at && b.at ? (a.at.compareDocumentPosition(b.at) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1) : a.at ? -1 : b.at ? 1 : 0));
    return rows.map(({ name, field, message }) => ({ name, field, message }));
  };

  // No summary: focus the first field with a message, as the summary would have.
  // every render: the failed submit's messages land a render after the submit; the flag says which one.
  React.useEffect(() => {
    if (!first.current || !st.failed) return;
    first.current = false;
    const top = list()[0], el = form.current;
    const to = top && el ? byId(el, top.field) : null;
    if (to) to.focus();
  });

  // The page's title says "Error:" while a failed submit's messages show.
  const prefix = sds.labels.formErrorTitle('');
  React.useEffect(() => {
    if (!st.failed || typeof document === 'undefined') return;
    const before = document.title;
    if (!before.startsWith(prefix)) document.title = sds.labels.formErrorTitle(before);
    return () => { if (document.title === sds.labels.formErrorTitle(before)) document.title = before; };
  }, [st.failed, prefix, sds.labels]);

  const tellDirty = useLatest(onUnsavedChanges);
  const toldDirty = React.useRef(false);
  React.useEffect(() => {
    if (toldDirty.current === st.dirty) return;
    toldDirty.current = st.dirty;
    if (tellDirty.current) tellDirty.current(st.dirty);
  }, [st.dirty, tellDirty]);

  // Changes that weren't sent: the browser asks before the page goes.
  React.useEffect(() => {
    if (!warnUnsaved || !st.dirty || st.submitting) return;
    const ask = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', ask);
    return () => { window.removeEventListener('beforeunload', ask); };
  }, [warnUnsaved, st.dirty, st.submitting]);

  const errorsValue: FormErrorsValue = {
    message: (name) => { const k = pathKey(name); return shows(st.shown[k]) ? st.shown[k] : shows(st.server[k]) ? st.server[k] : null; },
    clear: (name) => { const k = pathKey(name); patch((s) => (k in s.server ? { server: without(s.server, k) } : null)); },
    place,
    list: () => (st.failed ? list() : []),
    version: st.version,
    checking: (name) => (st.checking.has(pathKey(name)) ? sds.labels.formChecking : null),
    // A field takes its default while the form first mounts, and later only if a field of that name was already there
    // (the form mounting again with a draft): a FieldList row added later starts empty, not with a removed row's value.
    defaultValue: (name) => { const k = pathKey(name), L = live.current; return !L.read || L.flat.has(k) ? getPath(defaults, k) : undefined; },
  };

  const handle: FormHandle = {
    values: () => toNested(form.current ? readFlat(form.current) : live.current.flat),
    defaults,
    setErrors: (errs, message) => {
      const server = keyed(errs);
      patch((s) => ({ server, failed: Object.keys(server).length > 0, version: s.version + 1, message: message ?? null }));
    },
    validate: async (names) => {
      const el = form.current;
      if (!el) return true;
      const flat = readFlat(el), keys = names ? names.map(pathKey) : undefined;
      live.current.flat = flat;
      const res = await everything(flat, keys);
      if (res.ok) { showFor(keys || Object.keys(st.shown), flat); return true; }
      fail(res.issues, keys);
      return false;
    },
    submit: () => { if (form.current) form.current.requestSubmit(); },
    reset: () => { if (form.current) form.current.reset(); },
    discardDraft: () => {
      const key = latest.current.draft;
      if (key) { window.clearTimeout(live.current.draftTimer); try { window.localStorage.removeItem(draftKey(key)); } catch { /* storage blocked */ } }
      live.current.read = false;
      setTaken(null);
      setDiscards((d) => d + 1);
      patch(() => ({ shown: {}, server: {}, failed: false, dirty: false, draftSavedAt: null }));
    },
    dirty: st.dirty,
    submitting: st.submitting,
    submitCount: st.submitCount,
    draftSavedAt: st.draftSavedAt,
    draftRestored: restored != null,
  };
  const handleRef = useLatest(handle);
  const internals = React.useMemo(() => ({ show: (keys: readonly string[]) => handleRef.current.validate(keys) }), [handleRef]);
  // Steps and values read the live store.
  const store = React.useMemo(() => ({
    subscribe: (f: () => void) => { live.current.listeners.add(f); return () => { live.current.listeners.delete(f); }; },
    get: (name: string) => (live.current.read ? getPath(live.current.nested, pathKey(name)) : getPath(latestDefaults.current, pathKey(name))),
  }), [latestDefaults]);

  return (
    <form noValidate {...rest} ref={mergedRef} className={cn('srp-form', className)} data-component="form" aria-busy={st.submitting || undefined}
      onSubmit={onFormSubmit} onReset={onFormReset} onInput={changed} onChange={changed} onBlur={left}>
      <FormContext.Provider value={handle}>
        <StoreContext.Provider value={store}>
          <FormInternals.Provider value={internals}>
            <FormErrorsContext.Provider value={errorsValue}>
              <FormSubmittingContext.Provider value={st.submitting}>
                {shows(st.message) ? <Alert tone="danger" role="alert" className="srp-form__message">{st.message}</Alert> : null}
                {summary !== false ? <ErrorSummary className="srp-form__summary" /> : null}
                <React.Fragment key={generation}>{children}</React.Fragment>
              </FormSubmittingContext.Provider>
            </FormErrorsContext.Provider>
          </FormInternals.Provider>
        </StoreContext.Provider>
      </FormContext.Provider>
    </form>
  );
}

const StoreContext = /* @__PURE__ */ React.createContext<{ subscribe: (f: () => void) => () => void; get: (name: string) => unknown } | null>(null);

/* Form: a <form> that checks its fields against one schema (Zod, Valibot, ArkType: any Standard Schema) with no
   wiring per field. It reads every named control inside, by name ("email", "address.city", FieldList's
   "addresses[1].city"), and each Field shows its own message. A field is checked when it's left, then again as it
   changes once it has shown a message; everything is checked on submit, when an ErrorSummary at the top lists what's
   wrong and takes focus. onSubmit gets the schema's typed output, and can answer with the server's errors by name.
   checks run after the schema (a username that's taken), draft keeps the answers in the browser, warnUnsaved asks
   before the page goes. className, ref and other props go to the <form>. */
/** A form checked against one schema: messages on each field when it's left, everything on submit with a summary at
 *  the top, the server's errors by name, async checks, drafts and an unsaved-changes warning.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Form = /* @__PURE__ */ named('Form', FormRender) as <S extends StandardSchemaV1 | undefined = undefined>(props: FormProps<S> & { ref?: React.Ref<HTMLFormElement> | undefined }) => React.ReactElement;

/** The Form around this component: its values, state (dirty, submitting) and actions (validate, setErrors, reset).
 *  Throws outside a Form. */
export function useForm(): FormHandle {
  const f = React.useContext(FormContext);
  if (!f) throw new Error('useForm: call it inside a <Form>.');
  return f;
}

/** A field's value as it changes, by name, for fields that depend on it: show "State" only when the country has states. */
export function useFormValue<T = unknown>(name: string): T {
  const store = React.useContext(StoreContext);
  if (!store) throw new Error('useFormValue: call it inside a <Form>.');
  const get = () => store.get(name) as T;
  return React.useSyncExternalStore(store.subscribe, get, get);
}
