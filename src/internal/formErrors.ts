'use client';
import * as React from 'react';

/* The errors of a whole form, by field name, as a server sends them after a submit (FormErrors). Each Field inside
   finds its own message by its control's name, and an ErrorSummary with no errors of its own lists them all. A field's
   message clears as soon as it's edited; a new errors object (the next submit) brings every message back. */
export interface FormErrorsValue {
  /** The message for a field name, unless it has been edited since the errors came. */
  message: (name: string) => React.ReactNode;
  /** The field with this name was edited: its message goes. */
  clear: (name: string) => void;
  /** A Field says which control id holds a name, so the summary's links go there. Returns the undo. */
  place: (name: string, id: string) => () => void;
  /** The messages still showing, each with the id of its control (or its name, when no Field holds it). */
  list: () => Array<{ name: string; field: string; message: React.ReactNode }>;
  /** Changes with each new errors object, so a summary takes focus for a new submit but not for a cleared message. */
  version: number;
}
export const FormErrorsContext = /* @__PURE__ */ React.createContext<FormErrorsValue | null>(null);

const shown = (m: React.ReactNode) => m != null && m !== false && m !== '';

/** Holds a form's server errors for the Fields and ErrorSummary inside it. */
export function useFormErrors(errors: Readonly<Record<string, React.ReactNode>> | null | undefined): FormErrorsValue {
  // A new errors object is a new submit: every message shows again, and the version moves on.
  const [state, setState] = React.useState({ errors, cleared: new Set<string>(), version: 0 });
  if (state.errors !== errors) setState({ errors, cleared: new Set<string>(), version: state.version + 1 });
  const [ids, setIds] = React.useState<ReadonlyMap<string, string>>(new Map());
  const clear = React.useCallback((name: string) => {
    setState((s) => (s.errors && shown(s.errors[name]) && !s.cleared.has(name) ? { ...s, cleared: new Set(s.cleared).add(name) } : s));
  }, []);
  const place = React.useCallback((name: string, id: string) => {
    setIds((m) => (m.get(name) === id ? m : new Map(m).set(name, id)));
    return () => setIds((m) => { if (m.get(name) !== id) return m; const n = new Map(m); n.delete(name); return n; });
  }, []);
  // A setState during render (above) renders again at once with the new state, before anything is shown.
  const { errors: errs, cleared, version } = state;
  return React.useMemo(() => {
    const now = { errors: errs, cleared, version };
    const message = (name: string) => (now.errors && !now.cleared.has(name) && shown(now.errors[name]) ? now.errors[name] : null);
    const list = () => Object.keys(now.errors || {}).filter((n) => shown(message(n))).map((n) => ({ name: n, field: ids.get(n) || n, message: message(n) }));
    return { message, clear, place, list, version: now.version };
  }, [errs, cleared, version, ids, clear, place]);
}
