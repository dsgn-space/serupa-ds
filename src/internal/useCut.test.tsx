import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Sidebar, SidebarItem, SidebarSection } from '../components/Sidebar/Sidebar';

// Cut labels (useCut): every Button, Badge and SidebarItem label is watched for being cut with an ellipsis, so its full
// text can show as a title. GR242: each made its own ResizeObserver and font listener; they now share one of each.

function Many({ n, width }: { n: number; width: number }) {
  return <div style={{ width }}>
    {Array.from({ length: n }, (_, i) => <div key={i} style={{ width }}><Button id={`b${i}`}>{`Export every report of the quarter ${i}`}</Button><Badge>{`Waiting for review ${i}`}</Badge></div>)}
  </div>;
}

describe('cut labels', () => {
  test('200 Buttons and 200 Badges share one ResizeObserver and add at most one font listener', async () => {
    const Real = window.ResizeObserver, fonts = document.fonts, realAdd = fonts.addEventListener.bind(fonts);
    let made = 0, heard = 0;
    window.ResizeObserver = class extends Real { constructor(cb: ResizeObserverCallback) { super(cb); made++; } };
    fonts.addEventListener = ((type: string, ...rest: unknown[]) => { if (type === 'loadingdone') heard++; return (realAdd as (...a: unknown[]) => void)(type, ...rest); }) as typeof fonts.addEventListener;
    try {
      await render(<Many n={200} width={120} />);
      expect([made <= 1, heard <= 1]).toEqual([true, true]);
    } finally { window.ResizeObserver = Real; fonts.addEventListener = realAdd; }
  });

  test('a label cut after a resize gets its title, and loses it when it fits again', async () => {
    const { rerender } = await render(<Many n={1} width={600} />);
    const b = document.getElementById('b0')!;
    await expect.poll(() => b.hasAttribute('title')).toBe(false);
    await rerender(<Many n={1} width={90} />);
    await expect.poll(() => b.getAttribute('title')).toBe('Export every report of the quarter 0');
    await rerender(<Many n={1} width={600} />);
    await expect.poll(() => b.hasAttribute('title')).toBe(false);
  });

  test('a label a late web font cuts gets its title, in every engine (WebKit sends no "loadingdone")', async () => {
    // A Sidebar item's label is as wide as the sidebar lets it be, so a wider font doesn't change its box and only the
    // font's loading says so. The rule is added once the label is laid out in the fallback, so nothing loads it
    // sooner, and the font is drawn half as large again, so it's wider than any engine's fallback serif.
    const rule = document.createElement('style');
    rule.textContent = "@font-face { font-family: CutLate; src: url(/fonts/InterVariable-latin.woff2) format('woff2'); size-adjust: 150%; }";
    try {
      await render(<div style={{ height: 400, fontFamily: 'CutLate, serif' }}><Sidebar aria-label="Late"><SidebarSection>
        <SidebarItem id="cl" href="#a" icon="settings" label="Notification settings" /></SidebarSection></Sidebar></div>);
      const item = document.getElementById('cl')!;
      const label = [...item.querySelectorAll('span')].find((n) => n.textContent === 'Notification settings')!;
      label.style.fontFamily = 'CutLate, serif';
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      expect([label.scrollWidth <= label.clientWidth, item.hasAttribute('title')]).toEqual([true, false]);
      document.head.append(rule);
      await expect.poll(() => label.scrollWidth > label.clientWidth, { timeout: 3000 }).toBe(true);   // the font came and cut it
      // WebKit once left it untitled after the cut: the message says what the font set and the label read then.
      await expect.poll(() => item.getAttribute('title'), { message: JSON.stringify({ status: document.fonts.status, scroll: label.scrollWidth, client: label.clientWidth }) }).toBe('Notification settings');
    } finally { rule.remove(); }
  });
});
