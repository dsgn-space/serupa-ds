import { expect, test } from 'vitest';

// The radius roles the docs promise (GR244): a brand that sets --radius-inner, -control, -surface or -container
// reaches every component, because no component's corner names a step of the rounded scale (rounded-sm … 4xl).
// rounded-none, rounded-xs (a text mark's hairline curve) and rounded-full are fine.
const STEP = /var\(\s*--rounded-(sm|md|lg|xl|2xl|3xl|4xl)\s*\)/;

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

test('no component corner names a step of the rounded scale', () => {
  const rules = componentRules();
  expect(rules.length).toBeGreaterThan(500);   // the components' CSS is on the page
  const steps = rules.flatMap((r) => [...r.style].filter((p) => /radius/.test(p) && STEP.test(r.style.getPropertyValue(p))).map((p) => `${r.selectorText} { ${p}: ${r.style.getPropertyValue(p)} }`));
  expect(steps).toEqual([]);
});

test('a brand that rounds controls and surfaces more reaches CodeBlock, ErrorSummary and OfflineBanner', () => {
  const host = document.body.appendChild(document.createElement('div'));
  host.style.cssText = '--radius-control: 13px; --radius-surface: 17px;';
  host.innerHTML = '<div class="dk-code-block" id="rr-code"></div><div class="dk-error-summary" id="rr-err"></div><div class="dk-offline-banner" id="rr-off"></div>';
  try {
    const r = (id: string) => getComputedStyle(document.getElementById(id)!).borderStartStartRadius;
    expect([r('rr-code'), r('rr-err'), r('rr-off')]).toEqual(['13px', '13px', '17px']);
  } finally { host.remove(); }
});
