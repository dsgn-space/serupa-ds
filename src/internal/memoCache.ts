import * as React from 'react';

// The React Compiler's cache for one component (ADR-0017). The compiled components (tools/build/react-compiler.mjs)
// import this rather than react/compiler-runtime, which Preact's React compatibility doesn't have: a Preact app
// failed to import the package at all. It is what react/compiler-runtime does on React 18: one array per component
// instance, kept with useState, each slot marked empty until the component first fills it. Only compiled output
// imports it, so knip.json lists it as an entry.
const EMPTY = Symbol.for('react.memo_cache_sentinel');

/** An array of `size` slots that lives as long as the component that calls it. */
function useMemoCache(size: number): unknown[] {
  return React.useState(() => Array.from({ length: size }, () => EMPTY))[0];
}

// The compiler names the import `c`.
export { useMemoCache as c };
