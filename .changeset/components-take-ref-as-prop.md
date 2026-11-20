---
"@diki-stwn/serupa-ds": major
---

Every component is a plain function component that takes `ref` as a prop, as React 19 does, instead of a `React.forwardRef` component (React 19 deprecates `forwardRef`).

- **What breaks:** the components' types. Each is now `React.FC<XProps & React.RefAttributes<T>>`, not a `React.ForwardRefExoticComponent`. Code that names that type, reads `.render` or `$$typeof`, or checks `React.isValidElementType`-style fields of a component breaks. Passing `ref`, `React.ComponentRef<typeof Button>`, `React.ComponentProps<typeof Button>`, wrapping in `React.memo`, and styled-component or `as` wrappers keep working, and nothing renders differently.
- **Why:** React 19 deprecates `forwardRef`, and as plain functions the components are seen by the React Compiler and its lint rules, which the shared hooks already were.
- **Migration:** by hand, only where your code names the forwardRef type: write `typeof Button` or `React.ComponentProps<typeof Button>` instead of `React.ForwardRefExoticComponent<…>`, and drop `.render` or `$$typeof` checks.
