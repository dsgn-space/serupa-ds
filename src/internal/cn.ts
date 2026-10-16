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

/** Copies every prop except the component's own ones (the rest go to the DOM element). */
export function omit(props: Record<string, any>, own: Record<string, 1>): Record<string, any> {
  const rest: Record<string, any> = {};
  for (const k in props) if (!own[k]) rest[k] = props[k];
  return rest;
}

/** invalid, or aria-invalid passed as true or "true". */
export function isInvalid(props: Record<string, any>, rest: Record<string, any>): boolean {
  return !!props.invalid || rest["aria-invalid"] === true || rest["aria-invalid"] === "true";
}

/** Sets a forwarded ref, a function or an object. */
export function setRef<T>(ref: React.ForwardedRef<T>, node: T | null): void {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export const SIZES = ["sm", "md", "lg"] as const;

/** useLayoutEffect in the browser; on the server (where it can't run, and React warns) useEffect. */
export const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
