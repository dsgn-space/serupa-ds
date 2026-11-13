import { expect, test } from 'vitest';

// A component's title balances its lines on its own (GR269): text-wrap: balance used to come only from base.css's
// h1-h6 rule, so a title that isn't a heading element (Alert, Toast, Card, EmptyState …), or one on a page without
// base.css, left a single word alone on its last line.
const TITLES = ['alert', 'card', 'dialog', 'drawer', 'empty-state', 'error-summary', 'offline-banner', 'popover', 'toast', 'tour', 'chat-approval', 'accordion', 'timeline', 'stepper', 'file-upload', 'chart', 'code-block'].map((c) => `.dk-${c}__title`);

function componentRules(): CSSStyleRule[] {
  const out: CSSStyleRule[] = [];
  const walk = (rules: CSSRuleList, inComponents: boolean) => {
    for (const r of rules) {
      const here = inComponents || (r instanceof CSSLayerBlockRule && r.name === 'dk.components');
      if (r instanceof CSSStyleRule && here) out.push(r);
      if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules, here);
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules, false); } catch { /* another origin */ } }
  return out;
}

test('every component title balances its lines itself, heading element or not, with or without base.css', () => {
  const rules = componentRules();
  expect(rules.length).toBeGreaterThan(500);   // the components' CSS is on the page
  const unbalanced = TITLES.filter((sel) => !rules.some((r) => r.selectorText === sel && r.style.getPropertyValue('text-wrap-style') === 'balance'));
  expect(unbalanced).toEqual([]);
});

test('an Alert title, which is not a heading element, balances its lines', () => {
  const host = document.body.appendChild(document.createElement('div'));
  host.innerHTML = '<div class="dk-alert__title" id="tb-a" style="width: 220px; font-size: 16px">Your changes were saved but two of the files could not be uploaded</div>';
  try {
    expect(getComputedStyle(document.getElementById('tb-a')!).textWrapStyle).toBe('balance');
  } finally { host.remove(); }
});
