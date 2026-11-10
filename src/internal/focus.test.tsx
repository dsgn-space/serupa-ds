import { afterEach, expect, test } from 'vitest';
import { delegateFocus } from './focus';

const own = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus')!;
afterEach(() => { Object.defineProperty(HTMLElement.prototype, 'focus', own); document.body.innerHTML = ''; });

test('delegateFocus moves focus to the target', () => {
  document.body.innerHTML = '<div id="w"><button id="b">Go</button></div>';
  const w = document.getElementById('w')!, b = document.getElementById('b')!;
  delegateFocus(w, () => b);
  w.focus();
  expect(document.activeElement).toBe(b);
  delegateFocus(w, () => null);
  w.focus();
  expect(document.activeElement).toBe(b);
});

test('delegateFocus leaves other elements alone when HTMLElement.prototype.focus has a setter', () => {
  // Storybook's test loader wraps focus like this: a setter that replaces the focus every element uses.
  let current = own.value as HTMLElement['focus'];
  Object.defineProperty(HTMLElement.prototype, 'focus', { configurable: true, get() { return current; }, set(v: HTMLElement['focus']) { current = v; } });
  document.body.innerHTML = '<div id="w"><button id="b">Go</button></div><a id="s" tabindex="-1" href="#e">There is a problem</a>';
  const w = document.getElementById('w')!, b = document.getElementById('b')!, s = document.getElementById('s')!;
  delegateFocus(w, () => b);
  s.focus();
  expect(document.activeElement).toBe(s);
  w.focus();
  expect(document.activeElement).toBe(b);
});
