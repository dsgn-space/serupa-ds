import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import * as Sink from '../internal/KitchenSink/KitchenSink.stories';
import { withMotion } from '../../tools/test/vitest/helpers';

/** Applies the page's prefers-reduced-motion: reduce rules (and drops the no-preference ones). Returns the undo. */
function reduceMotion() {
  const undo: Array<() => void> = [];
  const walk = (rules: CSSRuleList) => {
    for (const r of rules) {
      if (r instanceof CSSMediaRule && /prefers-reduced-motion/.test(r.media.mediaText)) {
        const was = r.media.mediaText;
        r.media.mediaText = was.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width: 0px)').replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width: -1px)');
        undo.push(() => { r.media.mediaText = was; });
      }
      if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch { /* another origin */ } }
  return () => undo.forEach((f) => f());
}

describe('base.css: reduced motion', () => {
  // GD6: the page-wide rule was !important in dk.base, so it beat every component's own reduced-motion fade.
  test('page elements lose their transitions; a component keeps the short fade its own reduced-motion rule gives it, but no color or movement', () => withMotion(() => {
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = '<p id="bm-page" style="transition: opacity 300ms"></p><div class="dk-combobox__popup" id="bm-popup"><span id="bm-inner" style="transition: opacity 300ms"></span></div><b class="dk-zz" id="bm-color" style="transition: background-color 300ms, translate 300ms"></b>';
    const restore = reduceMotion();
    try {
      const dur = (id: string) => getComputedStyle(document.getElementById(id)!).transitionDuration;
      const props = (id: string) => getComputedStyle(document.getElementById(id)!).transitionProperty;
      expect([dur('bm-page'), dur('bm-popup'), props('bm-popup').split(', ')[0], dur('bm-inner')]).toEqual(['0s', '0.15s', 'opacity', '0s']);
      expect(props('bm-color')).not.toMatch(/background-color|translate/);
      expect(getComputedStyle(document.getElementById('bm-page')!).scrollBehavior).toBe('auto');
    } finally { restore(); host.remove(); }
  }));
});

// An app's own "Reduce motion" setting (HeroUI-style data-motion attribute): data-motion="reduce" on <html> must give
// every element the same motion as the system's prefers-reduced-motion: reduce. Compared on the kitchen sink's
// components and base.css's page rule, property by property.
describe('data-motion="reduce": the same motion as the system setting', () => {
  const MOTION = ['transitionProperty', 'transitionDuration', 'transitionDelay', 'animationName', 'animationDuration', 'scale', 'translate', 'scrollBehavior'] as const;
  const read = (host: HTMLElement) => [host, ...host.querySelectorAll<HTMLElement>('*')].flatMap((el) =>
    [el, '::before', '::after'].map((p) => { const cs = typeof p === 'string' ? getComputedStyle(el, p) : getComputedStyle(p); return MOTION.map((k) => cs[k]).join('|'); }));

  test('every element of the kitchen sink and a plain page element', () => withMotion(async () => {
    const host = document.body.appendChild(document.createElement('div'));
    const view = await render(<div>{(Sink.Default.render as () => React.ReactElement)()}<p style={{ transition: 'opacity 300ms' }}>Plain</p></div>, { container: host });
    try {
      const normal = read(host);
      const restore = reduceMotion();
      const system = read(host);
      restore();
      document.documentElement.setAttribute('data-motion', 'reduce');
      const app = read(host);
      document.documentElement.removeAttribute('data-motion');
      expect(system).not.toEqual(normal);   // the sink has motion to reduce, so the comparison means something
      expect(app).toEqual(system);
      expect(getComputedStyle(document.documentElement).scrollBehavior).toBe('auto');
    } finally { document.documentElement.removeAttribute('data-motion'); await view.unmount(); host.remove(); }
  }));
});
