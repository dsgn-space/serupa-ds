/** Lays the page out now, so the styles set before this call are where a CSS transition starts from (a FLIP, a
 *  slide from where something was). Its own function on purpose: the React Compiler drops a bare
 *  `void el.offsetWidth;` inside a component or hook as code with no effect, and the transition then starts from
 *  the end. ESLint flags that statement in src/ and points here. */
export function reflow(el: HTMLElement): number {
  return el.offsetWidth;
}
