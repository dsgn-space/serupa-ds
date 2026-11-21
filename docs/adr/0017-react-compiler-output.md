# ADR-0017: The package ships its client components compiled by the React Compiler

**Status:** Accepted
**Accepted:** 20 November 2026 (Diki), once 17.0.0 made every component a plain function the compiler can see.

## Context

The React Compiler memoizes a component's values, callbacks and JSX so that rendering it again with the same props does less work. An app gets that for its own code by adding the compiler to its build, but a bundler doesn't run it over `node_modules`, so Serupa's components never got it. Until 17.0.0 the compiler couldn't see them anyway: every component went through a `forwardRef` wrapper. Since then each is a plain function that takes `ref` as a prop.

Measured on 20 November 2026, with the compiler over every "use client" file in `src/components/` and `src/internal/`:

| | Plain | Compiled |
|---|---|---|
| Component tests (Chromium) | 10,783 pass | 10,783 pass |
| Mounting every story (`mountTime.test.tsx`) | 1,092 ms | 1,037 ms (5% less) |
| Rendering every story again, nothing changed | 633 ms | 518 ms (18% less) |
| Input response (`inp.test.tsx`, five stories) | 80 ms | 72 ms |
| All components, gzipped | 217.7 KiB | 245.6 KiB (13% more) |

## Decision

- **`tools/build/react-compiler.mjs` compiles each "use client" file** in `src/components/` and `src/internal/` before esbuild builds `dist/js/`. A file without "use client" is a server component or plain helpers: the compiler's cache hook can't run on a server, so it stays as written.
- **The tests run the compiled code.** `vitest.config.ts` goes through the same function, so what the component tests check is what ships.
- **A function the compiler can't prove safe is left as written** (`panicThreshold: 'none'`). The lint rules that find those (`eslint-plugin-react-hooks`) keep their findings in `eslint-suppressions.json`; each one fixed lets the compiler take that function too.
- **The browser script (`serupa.iife.js`) isn't compiled.** It takes React from `window.React`, and it keeps development warnings for plain pages, where speed matters less than being told what went wrong.
- **The cache comes from the package, not from React.** The compiled code imports `src/internal/memoCache.ts` in place of `react/compiler-runtime`, which Preact's React compatibility doesn't have (a Preact app couldn't import the package). It keeps one array per component instance with `useState`, as `react/compiler-runtime` does on React 18.

## Consequences

- An app re-renders Serupa's components with less work, with no setup.
- The package is about 28 KiB (gzipped) bigger in total, and a component imported alone a few hundred bytes bigger. The size budgets were raised to match.
- A component that breaks the rules of React in a way the lint doesn't catch can behave differently once memoized. The component tests running the compiled code are the guard; a bug found later is fixed in the component, not by turning the compiler off for it.
