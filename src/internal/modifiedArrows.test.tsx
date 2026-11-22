import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, expect, test } from 'vitest';
import { stories } from '../../tools/test/vitest/stories';

// Alt+← and Alt+→ are the browser's Back and Forward, and Ctrl or ⌘ with an arrow belongs to the browser or the
// system too: every component that moves focus with the arrow keys leaves them alone (Tabs, Toolbar, Menu, Radio and
// the rest check this in their own tests; these are the ones that read arrows on items of their own).
const CASES: Array<[string, string, string]> = [
  ['TagGroup', 'Selectable', '[role=row]'],
  ['List', 'Selectable', '[data-list-value]'],
  ['StatusTracker', 'ThirtyDays', '[tabindex="0"]'],
];
const host = document.createElement('div');
document.body.append(host);
let root: ReturnType<typeof createRoot> | null = null;
afterEach(() => { root?.unmount(); root = null; });

test.each(CASES)('%s leaves Alt, Ctrl and ⌘ with an arrow key to the browser', (name, story, item) => {
  const el = stories.find(([n]) => n === name)![1].find(([s]) => s === story)![1];
  root = createRoot(host);
  flushSync(() => root!.render(el));
  const t = host.querySelector<HTMLElement>(item)!;
  t.focus();
  const pressed = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].flatMap((key) => ['altKey', 'ctrlKey', 'metaKey'].map((m) => {
    const ev = new KeyboardEvent('keydown', { key, [m]: true, bubbles: true, cancelable: true });
    t.dispatchEvent(ev);
    return ev.defaultPrevented;
  }));
  expect([pressed.some(Boolean), document.activeElement === t]).toEqual([false, true]);
});
