import { afterEach, describe, expect, test } from 'vitest';

let host: HTMLElement | null = null;
afterEach(() => { host?.remove(); host = null; });

const WORD = 'Datenschutzgrundverordnungsänderungen-https://example.com/a/very/long/path';

describe('base.css: long words (WCAG 1.4.10)', () => {
  test('a word longer than its line breaks inside the box instead of widening the page', () => {
    host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = `<div id="lw-box" style="width: 200px"><p id="lw-p">${WORD}</p></div>`;
    const p = document.getElementById('lw-p')!;
    expect(getComputedStyle(p).overflowWrap).toBe('break-word');
    expect(p.scrollWidth).toBeLessThanOrEqual(200);
  });

  test('min-content sizes are left alone, so a shrink-to-fit box is still as wide as the word', () => {
    host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = `<div style="width: 200px"><span id="lw-fit" style="display: inline-block; width: min-content">${WORD}</span></div>`;
    expect(document.getElementById('lw-fit')!.getBoundingClientRect().width).toBeGreaterThan(200);
  });
});
