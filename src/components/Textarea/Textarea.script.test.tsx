import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Textarea } from './Textarea';

// autoResize where the browser can't size a field to its content (Firefox, older Safari): measured in script. This
// file reports no field-sizing support before Textarea reads it, so Chromium runs the fallback (Textarea.test.tsx
// covers the CSS path).
vi.hoisted(() => {
  const supports = CSS.supports.bind(CSS);
  CSS.supports = (a: string, b?: string) => (a === 'field-sizing' ? false : b === undefined ? supports(a) : supports(a, b));
});

const el = (id: string) => document.getElementById(id) as HTMLTextAreaElement;
const height = (id: string) => Math.round(el(id).getBoundingClientRect().height);

describe('Textarea autoResize, measured in script', () => {
  test('sets the height inline: grows a line at a time from rows, stops at maxRows, shrinks back; refits when the width changes, with no ResizeObserver loop error', async () => {
    const errors: string[] = [], onError = (e: ErrorEvent) => { errors.push(e.message); };
    addEventListener('error', onError);
    try {
      await render(<div style={{ width: '320px' }}>
        <Textarea id="js" autoResize rows={2} maxRows={4} aria-label="Script" />
        <div id="js-narrow" style={{ width: '320px' }}><Textarea id="js-wrap" autoResize rows={1} defaultValue="one two three four five six seven eight nine ten eleven twelve" aria-label="Wrap" /></div>
      </div>);
      expect([el('js').style.height !== '', height('js')]).toEqual([true, 2 * 20 + 12]);
      await userEvent.click(el('js'));
      await userEvent.keyboard('1{Enter}2{Enter}3');
      await expect.poll(() => height('js')).toBe(3 * 20 + 12);
      await userEvent.keyboard('{Enter}4{Enter}5{Enter}6');
      await expect.poll(() => height('js')).toBe(4 * 20 + 12);
      await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
      await expect.poll(() => height('js')).toBe(2 * 20 + 12);
      const w1 = height('js-wrap');
      document.getElementById('js-narrow')!.style.width = '160px';
      await expect.poll(() => height('js-wrap')).toBeGreaterThan(w1);
      await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
      expect(errors).toEqual([]);
    } finally { removeEventListener('error', onError); }
  });

  test('refits when a web font arrives and the text wraps to fewer lines, though the field keeps its width', async () => {
    // The font's rule is added only once the field is measured, so nothing loads it sooner. Monospace is wider than
    // Inter, so the same text takes fewer lines once Inter arrives.
    const rule = document.createElement('style');
    rule.textContent = "@font-face { font-family: TaLate; src: url(/fonts/InterVariable-latin.woff2) format('woff2'); }";
    try {
      const text = 'Every line of this note wraps in a narrow field, and the font that arrives later is narrower than the one drawn first, so it needs fewer lines.';
      await render(<div style={{ width: '200px', fontFamily: 'TaLate, monospace' }}><Textarea id="js-font" autoResize rows={1} defaultValue={text} aria-label="Late font" style={{ fontFamily: 'inherit' }} /></div>);
      const before = height('js-font');
      document.head.append(rule);
      await expect.poll(() => height('js-font'), { timeout: 5000 }).toBeLessThan(before);
      // ...to the height the text needs now: nothing hidden, nothing spare.
      expect(el('js-font').scrollHeight).toBeLessThanOrEqual(el('js-font').clientHeight);
    } finally { rule.remove(); }
  });
});
