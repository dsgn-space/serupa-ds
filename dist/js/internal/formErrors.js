"use client";

// src/internal/formErrors.ts
import * as React from "react";
var FormErrorsContext = /* @__PURE__ */ React.createContext(null);
var shown = (m) => m != null && m !== false && m !== "";
function useFormErrors(errors) {
  const [state, setState] = React.useState({ errors, cleared: /* @__PURE__ */ new Set(), version: 0 });
  if (state.errors !== errors) setState({ errors, cleared: /* @__PURE__ */ new Set(), version: state.version + 1 });
  const [ids, setIds] = React.useState(/* @__PURE__ */ new Map());
  const clear = React.useCallback((name) => {
    setState((s) => s.errors && shown(s.errors[name]) && !s.cleared.has(name) ? { ...s, cleared: new Set(s.cleared).add(name) } : s);
  }, []);
  const place = React.useCallback((name, id) => {
    setIds((m) => m.get(name) === id ? m : new Map(m).set(name, id));
    return () => setIds((m) => {
      if (m.get(name) !== id) return m;
      const n = new Map(m);
      n.delete(name);
      return n;
    });
  }, []);
  const { errors: errs, cleared, version } = state;
  return React.useMemo(() => {
    const now = { errors: errs, cleared, version };
    const message = (name) => now.errors && !now.cleared.has(name) && shown(now.errors[name]) ? now.errors[name] : null;
    const list = () => Object.keys(now.errors || {}).filter((n) => shown(message(n))).map((n) => ({ name: n, field: ids.get(n) || n, message: message(n) }));
    return { message, clear, place, list, version: now.version };
  }, [errs, cleared, version, ids, clear, place]);
}
export {
  FormErrorsContext,
  useFormErrors
};
//# sourceMappingURL=formErrors.js.map
