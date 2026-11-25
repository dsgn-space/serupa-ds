import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, test } from 'vitest';
import { parts } from '../../tools/test/vitest/stories';

// Section headings on app screens (docs/foundations.md, Type roles): under the screen's 30px h1, a section's h2 is
// 18px (size="lg"), or 16px for a small aside such as "Need help?". 24px is kept for the screen's news: a
// confirmation that replaces a form and takes focus ("Message sent"), and the marketing Landing page's sections.
// Only the patterns, and only the h2s they write: a component's own heading (Calendar's month, Kanban's columns)
// carries its class and keeps its own size.
const PATTERNS = new Set(Object.keys(import.meta.glob('../patterns/*/*.stories.tsx')).map((f) => f.split('/').at(-2)!));
const own = (h: Element) => ![...h.classList].some((c) => c.startsWith('srp-') && !c.startsWith('srp-heading'));
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
// 24px h2s that don't take focus but are the screen's news, with why: "<Pattern>".
const NEWS: Record<string, string> = {
  OrderStatus: "the order's state (\"On its way\") is the screen's headline, above the steps",
  HelpCenter: "Faq's title, which sits above Faq's own 18px group headings, so it stays a step larger",
};
// Documents, where the page's own sections take the 24px page-section heading (and the invoice its 14px labels).
const DOCUMENT: Record<string, string> = {
  Article: 'an article: its sections are the page\'s own',
  SignAgreement: 'an agreement to read through: numbered sections of one document',
  Invoice: 'an invoice: its amount due is the headline, and From, To and Dates are its small labels',
};

for (const [name, list] of parts.filter(([n]) => PATTERNS.has(n))) {
  test(`${name}: each h2 is 18px (or 16px), and 24px only for the screen's news`, async () => {
    const found: string[] = [];
    for (const [exportName, ui] of list) {
      const host = document.body.appendChild(document.createElement('div'));
      const root = createRoot(host);
      flushSync(() => root.render(ui));
      await frame();
      for (const h of host.querySelectorAll<HTMLElement>('h2')) {
        if (DOCUMENT[name] || !h.getClientRects().length || !own(h) || h.closest('[role="dialog"], footer, .sr-only')) continue;
        const px = getComputedStyle(h).fontSize;
        const news = h.tabIndex === -1 && h.hasAttribute('tabindex');
        if (px === '18px' || px === '16px') continue;
        if (px === '24px' && (news || name === 'Landing' || NEWS[name])) continue;
        found.push(`${exportName}: "${(h.textContent || '').trim().slice(0, 40)}" is ${px}`);
      }
      root.unmount();
      host.remove();
    }
    expect([...new Set(found)]).toEqual([]);
  });
}
