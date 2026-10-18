import * as React from "react";

// Every component is made through these two, called with a /* @__PURE__ */ mark, so a bundler can drop the
// components a project doesn't import. A bare `X.displayName = "X"` statement is a side effect that keeps
// every component in the bundle.

/** React.forwardRef with a displayName (the name React DevTools and warnings show). */
export function component<T, P = object>(name: string, render: React.ForwardRefRenderFunction<T, React.PropsWithoutRef<P>>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {
  const c = React.forwardRef<T, P>(render);
  c.displayName = name;
  return c;
}

/** A function component with a displayName, kept when a minifier renames the function. */
export function named<C extends (props: never) => React.ReactNode>(name: string, c: C): C & { displayName: string } {
  return Object.assign(c, { displayName: name });
}
