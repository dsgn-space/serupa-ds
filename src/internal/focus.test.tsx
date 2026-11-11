import * as React from 'react';
import { afterEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { delegateFocus, useFocusHandover } from './focus';

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

// A control that, used, ends up as `after` says: removed, disabled, still there, or having sent focus elsewhere itself.
function Handover({ after }: { after: 'remove' | 'disable' | 'stay' | 'elsewhere' }) {
  const handover = useFocusHandover();
  const [used, setUsed] = React.useState(false);
  const back = React.useRef<HTMLButtonElement>(null), other = React.useRef<HTMLInputElement>(null);
  const use = (e: React.MouseEvent<HTMLButtonElement>) => {
    handover(e.currentTarget, () => back.current);
    if (after === 'elsewhere') other.current!.focus();
    setUsed(true);
  };
  return <div>
    <button type="button" id="ho-back" ref={back}>Back</button>
    <input id="ho-other" ref={other} aria-label="Other" />
    {after === 'remove' && used ? null : <button type="button" id="ho-next" disabled={after === 'disable' && used} onClick={use}>Next</button>}
  </div>;
}
const handedOver = async (after: 'remove' | 'disable' | 'stay' | 'elsewhere') => {
  const screen = await render(<Handover after={after} />);
  const next = document.getElementById('ho-next')!;
  next.focus();
  next.click();
  await new Promise(requestAnimationFrame);
  const id = document.activeElement?.id || document.activeElement?.tagName;
  await screen.unmount();
  return id;
};

test('useFocusHandover: a control that removes or disables itself hands focus over; one that stays, or sent focus on, keeps it (GR277)', async () => {
  // Removed: the browser drops focus to <body>, the fallback the hook catches; disabled: focus stays on a disabled control.
  expect([await handedOver('remove'), await handedOver('disable'), await handedOver('stay'), await handedOver('elsewhere')])
    .toEqual(['ho-back', 'ho-back', 'ho-next', 'ho-other']);
});
