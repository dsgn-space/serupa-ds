---
"@diki-stwn/serupa-ds": major
---

- **Breaking.** The easing tokens are the roles, each named for what it moves: `ease-enter`, `ease-exit`, `ease-move`, `ease-settle`, `ease-pop`, `ease-spring`, `ease-fling` and `ease-celebrate`, plus `ease-linear`. Each role keeps the curve it had.
- Removed: the 16 raw curves the roles pointed at, as tokens (`--ease-out-quart`, `{transitions.ease-out-quart}`) and as utility classes (`ease-out-quart`, `hover:ease-out-quart`): `ease-in`, `ease-out`, `ease-in-out`, `ease-out-cubic`, `ease-out-quart`, `ease-out-expo`, `ease-in-cubic`, `ease-in-quart`, `ease-in-expo`, `ease-in-out-cubic`, `ease-in-out-quart`, `ease-in-out-expo`, `ease-out-back`, `ease-spring-soft`, `ease-spring-snappy` and `ease-elastic`.
- Changed: the `transition` utility classes animate with `ease-move` unless an `ease-*` class says otherwise. It is the curve they had (`ease-in-out` was the same curve).

**Migration:** run `npx serupa-migrate src --write`. Each removed curve becomes the role with the same curve: `ease-out` and `ease-out-quart` are `ease-enter`, `ease-in-out` and `ease-in-out-cubic` are `ease-move`, `ease-out-expo` is `ease-settle`, `ease-out-cubic` is `ease-fling`, `ease-out-back` is `ease-pop`, `ease-spring-snappy` is `ease-spring` and `ease-elastic` is `ease-celebrate`. No role has the curve of `ease-in` and its `-cubic`, `-quart` and `-expo` forms, `ease-in-out-quart`, `ease-in-out-expo` or `ease-spring-soft`: serupa-migrate writes the role that does their job (`ease-exit`, `ease-move` and `ease-spring`) and lists each place, because the curve changes. A bare `ease-in-out` in your CSS is the browser's keyword and is left as it is.
