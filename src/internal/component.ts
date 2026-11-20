import type * as React from 'react';

// Every component is a plain function component that takes ref as a prop (React 19), named through this, called with
// a /* @__PURE__ */ mark, so a bundler can drop the components a project doesn't import. A bare
// `X.displayName = "X"` statement is a side effect that keeps every component in the bundle. The function itself is
// declared at the top of its file (function ButtonRender(…)), so the React Compiler and its lint rules see it.

/** A function component with a displayName (the name React DevTools and warnings show), kept when a minifier renames the function. */
// Typed as React.FC<P>, one interface React caches, rather than the function's own type: a project's editor checks
// fewer types, and the declarations name only the props, not the render function's inferred return.
export function named<P>(name: string, c: (props: P) => React.ReactNode): React.FC<P> {
  return Object.assign(c, { displayName: name });
}
