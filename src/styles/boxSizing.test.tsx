import { afterEach, describe, expect, test } from 'vitest';

let host: HTMLElement | null = null;
afterEach(() => { host?.remove(); host = null; });

describe('base.css: sizing includes padding and border everywhere', () => {
  test('an element and its ::before and ::after are border-box (a pseudo-element can not match inside :where())', () => {
    host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = '<style>#bs-el::before, #bs-el::after { content: ""; display: block; inline-size: 24px; padding: 4px; }</style><div id="bs-el"></div>';
    const el = document.getElementById('bs-el')!;
    expect([getComputedStyle(el).boxSizing, getComputedStyle(el, '::before').boxSizing, getComputedStyle(el, '::after').boxSizing])
      .toEqual(['border-box', 'border-box', 'border-box']);
  });

  test('a class still wins: zero specificity, on pseudo-elements too', () => {
    host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = '<style>.bs-content::before { content: ""; box-sizing: content-box; }</style><div id="bs-cls" class="bs-content"></div>';
    expect(getComputedStyle(document.getElementById('bs-cls')!, '::before').boxSizing).toBe('content-box');
  });
});
