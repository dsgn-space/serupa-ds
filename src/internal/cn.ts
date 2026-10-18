import * as React from "react";

/** Joins the truthy class names with spaces. */
export function cn(...names: unknown[]): string {
  return names.filter(Boolean).join(" ");
}

/** A React id made safe for HTML ids and CSS selectors, with a prefix: "dk-ta" + useId(). */
export function domId(prefix: string, reactId: string): string {
  return prefix + reactId.replace(/[^A-Za-z0-9_-]/g, "");
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
export function isInvalid(invalid: boolean | undefined, ariaInvalid: React.AriaAttributes["aria-invalid"]): boolean {
  return !!invalid || ariaInvalid === true || ariaInvalid === "true";
}

/** Sets a forwarded ref, a function or an object. */
export function setRef<T>(ref: React.ForwardedRef<T>, node: T | null): void {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export const SIZES = ["sm", "md", "lg"] as const;

/** useLayoutEffect in the browser; on the server (where it can't run, and React warns) useEffect. */
export const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
