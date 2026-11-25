import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { parts } from '../../tools/test/vitest/stories';

// Tables on a 390px phone (Table's README, "When a table scrolls sideways"): a pattern's table fits the screen, or, when
// it's too wide to (a week of hours, a comparison), it pins a column, so what names each row or acts on it stays in
// view while the rest scrolls. A table that scrolled with nothing pinned hid whole columns past the edge with no sign
// of them: Transactions' Money in, Activity log's What, Referral's Status.
const PATTERNS = new Set(Object.keys(import.meta.glob('../patterns/*/*.stories.tsx')).map((f) => f.split('/').at(-2)!));
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
let padding = '';
beforeAll(async () => { padding = document.body.style.padding; document.body.style.padding = '0'; await page.viewport(390, 844); });
afterAll(() => { document.body.style.padding = padding; });

for (const [name, list] of parts.filter(([n]) => PATTERNS.has(n))) {
  test(`${name}: at 390px each table fits, or pins a column while it scrolls`, async () => {
    await document.fonts.ready;
    const found: string[] = [];
    for (const [exportName, ui] of list) {
      const host = document.body.appendChild(document.createElement('div'));
      const root = createRoot(host);
      flushSync(() => root.render(ui));
      await frame();
      for (const t of host.querySelectorAll<HTMLElement>('[data-component="table"]')) {
        const over = t.scrollWidth - t.clientWidth;
        const pinned = t.classList.contains('srp-table--pin-start') || t.classList.contains('srp-table--pin-end');
        if (over > 1 && !pinned) found.push(`${exportName}: "${t.querySelector('caption')?.textContent ?? 'a table'}" is ${over}px wider than its frame, with nothing pinned`);
      }
      root.unmount();
      host.remove();
    }
    expect(found).toEqual([]);
  });
}
