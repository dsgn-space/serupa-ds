import * as React from 'react';

/** Joins the truthy class names with spaces. */
export function cn(...names: unknown[]): string {
  return names.filter(Boolean).join(' ');
}

/** A React id made safe for HTML ids and CSS selectors, with a prefix: "dk-ta" + useId(). */
export function domId(prefix: string, reactId: string): string {
  return prefix + reactId.replace(/[^A-Za-z0-9_-]/g, '');
}

/** The value when it's one of the allowed ones, otherwise the default. */
export function oneOf<T extends string>(list: readonly T[], value: unknown, fallback: T): T {
  return list.indexOf(value as T) < 0 ? fallback : (value as T);
}

/** Attributes a component adds for tests, analytics and styling (data-component, data-size…). */
export type DataAttributes = { [attr: `data-${string}`]: string | boolean | undefined };

/** The props a component passes on to its DOM element: every prop except its own ones, still typed, plus data-* hooks. */
export type Rest<P, K extends PropertyKey> = Omit<P, K> & DataAttributes;

/** Copies every prop except the component's own ones (the rest go to the DOM element). */
export function omit<P extends object, K extends PropertyKey>(props: P, own: { readonly [k in K]: 1 }): Rest<P, K> {
  const rest: Record<string, unknown> = {};
  for (const k in props) if (!(own as Record<PropertyKey, 1 | undefined>)[k]) rest[k] = props[k];
  return rest as Rest<P, K>;
}

/** invalid, or aria-invalid passed as true or "true". */
export function isInvalid(invalid: boolean | undefined, ariaInvalid: React.AriaAttributes['aria-invalid']): boolean {
  return !!invalid || ariaInvalid === true || ariaInvalid === 'true';
}

const nothing = () => {};

/** Sets a forwarded ref, a function or an object, to node, and returns what undoes it (GR237): the cleanup a callback
 *  ref returned (React 19), else a call with null, or `current` back to null. */
export function setRef<T>(ref: React.Ref<T> | undefined, node: T | null): () => void {
  if (typeof ref === 'function') { const done = ref(node); return typeof done === 'function' ? done : () => { ref(null); }; }
  if (ref) { ref.current = node; return () => { ref.current = null; }; }
  return nothing;
}

/** The callback ref for an element that the component holds as well as its caller (GR237). It is the same function from
 *  render to render while the caller's refs are, so their ref is set once for the node, not undone and set again on
 *  every render. `own` gets the node, and null when it goes; it is the latest render's, so it may read refs but not
 *  props or state. When the node goes, each caller's ref is undone the React 19 way: the cleanup it returned, else a
 *  call with null. `also` is a second caller's ref, as on a cloned child that came with its own. */
export function useMergedRef<T>(ref: React.Ref<T> | undefined, own?: (node: T | null) => void, also?: React.Ref<T>): (node: T | null) => () => void {
  const latest = React.useRef(own);
  React.useInsertionEffect(function () { latest.current = own; });   // every render: keeps the latest own, before React attaches refs
  return React.useCallback(function (node: T | null) {
    if (latest.current) latest.current(node);
    const undo = setRef(ref, node), undoAlso = setRef(also, node);
    return function () { if (latest.current) latest.current(null); undo(); undoAlso(); };
  }, [ref, also]);
}

/** The ref already on an element we clone: a prop since React 19 (reading element.ref there warns), element.ref before. */
export function elementRef<T>(el: React.ReactElement): React.ForwardedRef<T> | undefined {
  const r = parseInt(React.version, 10) >= 19 ? (el.props as { ref?: unknown }).ref : (el as { ref?: unknown }).ref;
  return (r ?? undefined) as React.ForwardedRef<T> | undefined;
}

export const SIZES = ['sm', 'md', 'lg'] as const;

/** useLayoutEffect in the browser; on the server (where it can't run, and React warns) useEffect. */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
