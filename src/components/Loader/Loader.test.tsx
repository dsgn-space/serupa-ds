import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { color, css, settle, keepMotion } from '../../../tools/test/vitest/helpers';
import { Loader } from './Loader';
import { announcerIdle } from '../../internal/announce';

// About motion: transitions and animations stay on for this file (setup.ts turns them off elsewhere).
keepMotion();

const el = (id: string) => document.getElementById(id) as HTMLElement;
const q = (sel: string) => document.querySelector(sel) as HTMLElement;
const box = (id: string) => { const r = el(id).getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
const vars = (v: Record<string, string>) => v as React.CSSProperties;
const announcer = () => document.querySelector('[data-srp-announcer]') as HTMLElement;
/** Runs read() with the element's named animation paused at each time, then lets it play on. */
function at<T>(node: Element, name: string | null, times: number[], read: (n: Element) => T): T[] {
  const a = node.getAnimations().find((x) => !name || (x as CSSAnimation).animationName === name);
  if (!a) throw new Error(`No ${name} animation`);
  a.pause();
  const out = times.map((ms) => { a.currentTime = ms; return read(node); });
  a.play();
  return out;
}
/** Applies the page's prefers-reduced-motion: reduce rules (and drops the no-preference ones), as a viewer who asks for less motion sees them. Returns the undo. */
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

describe('Loader', () => {
  // EB1: the delay had no minimum, so work ending at 320ms showed a spinner for 20ms, cut off mid fade-in.
  test('delay, then a minimum: work ending at 320ms keeps the loader until 800ms; ending at 200ms never shows it; loading again during the minimum keeps it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      let set: (v: boolean) => void = () => {};
      function Wait() { const [on, s] = React.useState(true); set = s; return <div id="w"><Loader id="lw" loading={on} /></div>; }
      await render(<Wait />);
      const step = (ms: number) => React.act(async () => { vi.advanceTimersByTime(ms); });
      const state = () => { const l = el('lw'); return l ? (l.getAttribute('role') || 'waiting') : 'gone'; };
      expect(state()).toBe('waiting');
      await step(300);
      expect(state()).toBe('progressbar');
      await step(20);
      await React.act(async () => set(false));
      expect(state()).toBe('progressbar');   // 20ms in: stays
      await step(470);
      expect(state()).toBe('progressbar');   // 490ms in
      await step(10);
      expect(state()).toBe('gone');          // 500ms in: done
      await React.act(async () => set(true));
      await step(200);
      await React.act(async () => set(false));
      await step(1000);
      expect(state()).toBe('gone');          // ended inside the delay: never shown
      await React.act(async () => set(true));
      await step(300);
      await React.act(async () => set(false));
      await step(100);
      await React.act(async () => set(true));
      await step(1000);
      expect(state()).toBe('progressbar');   // loading again during the minimum: still shown
    } finally { vi.useRealTimers(); }
  });

  test('sizes: sm 16px, md 24px (default), lg 40px; an unknown variant, size and tone fall back to ring, md and neutral', async () => {
    await render(<>
      <Loader id="sm" size="sm" delay={0} />
      <Loader id="ring" delay={0} />
      <Loader id="lg" size="lg" delay={0} />
      {/* @ts-expect-error: unknown values, as plain JavaScript could pass */}
      <Loader id="bad" size="xl" variant="bars" tone="pink" delay={0} />
    </>);
    expect([box('sm'), box('ring'), box('lg')]).toEqual([[16, 16], [24, 24], [40, 40]]);
    expect(box('bad')).toEqual([24, 24]);
    expect(el('bad').className).toMatch(/srp-loader--ring/);
    expect(el('bad').className).not.toMatch(/pink/);
  });

  test('ring: an arc on a faint track (20%), rounded ends, stroke-width-2 in its 24-unit drawing; a quarter of the ring when still', async () => {
    await render(<Loader id="ring" delay={0} />);
    const tr = q('#ring svg > circle:first-of-type'), arc = q('#ring svg > circle:last-of-type'), s = css(arc);
    expect(css(tr).opacity).toBe('0.2');
    expect([s.opacity, s.strokeLinecap, s.fill, s.strokeWidth]).toEqual(['1', 'round', 'none', '2px']);
    expect([arc.getAttribute('pathLength'), arc.getAttribute('stroke-dasharray')]).toEqual(['100', '25 150']);
  });

  test('ring: the quarter arc stays as it is while the drawing turns steadily at motion-loop-spinner (0.7s a turn, KW22; the shared spin keyframes); nothing repaints on each frame (EE1)', async () => {
    await render(<Loader id="ring" delay={0} />);
    const svg = css(q('#ring svg')), arc = css(q('#ring svg > circle:last-of-type'));
    expect(`${svg.animationName} ${svg.animationDuration} ${svg.animationTimingFunction} ${svg.animationIterationCount}`).toBe('spin 0.7s linear infinite');
    expect([arc.animationName, q('#ring').getAnimations({ subtree: true }).filter((x) => (x as CSSAnimation).animationName !== 'srp-loader-in').map((x) => (x as CSSAnimation).animationName)]).toEqual(['none', ['spin']]);
  });

  test('dots: three dots pulsing (1s, forever), each 150ms after the one before', async () => {
    await render(<Loader id="dots" variant="dots" delay={0} />);
    const dots = [...document.querySelectorAll('#dots svg circle')].map((d) => { const s = getComputedStyle(d); return [s.animationName, s.animationDuration, s.animationDelay, s.animationIterationCount]; });
    expect(dots).toEqual([['srp-loader-dot', '1s', '0s', 'infinite'], ['srp-loader-dot', '1s', '0.15s', 'infinite'], ['srp-loader-dot', '1s', '0.3s', 'infinite']]);
  });

  test('spokes: eight rounded spokes round a circle, 24px (md) and 40px (lg), in the text color (or the tone)', async () => {
    await render(<><Loader id="spk" variant="spokes" delay={0} /><Loader id="spklg" variant="spokes" size="lg" tone="primary" delay={0} /></>);
    const ls = [...el('spk').querySelectorAll('svg line')], s = css(ls[0]!);
    expect([ls.length, el('spk').dataset.variant, s.strokeLinecap, s.strokeWidth]).toEqual([8, 'spokes', 'round', '4px']);
    expect((ls[0]!.parentNode as Element).getAttribute('transform')).toBe('scale(0.625)');
    expect(['x1', 'y1', 'x2', 'y2'].map((k) => ls[0]!.getAttribute(k)).join()).toBe('19.2,4,19.2,9.6');
    expect(s.stroke).toBe(css(el('spk')).color);
    expect(css(q('#spklg line')).stroke).toBe(color('var(--primary)'));
    expect([box('spk'), box('spklg')]).toEqual([[24, 24], [40, 40]]);
  });

  test('spokes: iOS proportions: each spoke about 10% of the size wide and 25% long, round a hole 40% across', async () => {
    await render(<Loader id="spk" variant="spokes" delay={0} />);
    const u = el('spk').getBoundingClientRect().width / 24, sc = 0.625;
    const w = 2.5 * u, len = ((9.6 - 4) * sc + 2.5) * u, hole = ((19.2 - 9.6) * sc - 1.25) * 2 / 24;
    expect(Math.abs(w / 24 - 0.104)).toBeLessThan(0.005);
    expect(Math.abs(len / 24 - 0.25)).toBeLessThan(0.01);
    expect(Math.abs(hole - 0.4)).toBeLessThan(0.01);
  });

  test('spokes: the lead spoke at full strength, the ones behind it (anticlockwise) fading to 25%', async () => {
    await render(<Loader id="spk" variant="spokes" delay={0} />);
    const ls = [...el('spk').querySelectorAll('svg line')];
    expect(ls.map((l) => l.getAttribute('transform')).join('|')).toBe([0, -45, -90, -135, -180, -225, -270, -315].map((d) => `rotate(${d} 19.2 19.2)`).join('|'));
    expect(ls.map((l) => +getComputedStyle(l).opacity).join()).toBe('1,0.85,0.7,0.55,0.45,0.35,0.3,0.25');
  });

  test('spokes: ticks a spoke at a time (45° steps, no turning in between), a full turn every 1s', async () => {
    await render(<Loader id="spk" variant="spokes" delay={0} />);
    const svg = q('#spk svg'), s = css(svg);
    expect(`${s.animationName} ${s.animationDuration} ${s.animationTimingFunction} ${s.animationIterationCount}`).toMatch(/^srp-loader-tick 1s (step-end|steps\(1(, (jump-)?end)?\)) infinite$/);
    const ticks = at(svg, null, [0, 60, 130, 260, 990], (n) => { const m = new DOMMatrix(getComputedStyle(n).transform); return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI); });
    expect(ticks).toEqual([0, 0, 45, 90, -45]);
  });

  test('tone neutral (default) draws in the text color around it; current, removed in 4.0.0, falls back to neutral like any unknown tone, with no warning', async () => {
    const warn = vi.spyOn(console, 'warn');
    await render(<>
      <Loader id="ring" delay={0} />
      <span style={{ color: 'rgb(200, 30, 40)' }}>
        <Loader id="tneutral" tone="neutral" delay={0} />
        {/* @ts-expect-error: removed in 4.0.0 */}
        <Loader id="tcurrent" tone="current" delay={0} />
        <Loader id="inherit" delay={0} />
      </span>
    </>);
    const strip = (e: HTMLElement) => e.className.replace(/\s+/g, ' ');
    expect([css(el('tneutral')).color, css(el('tcurrent')).color]).toEqual(['rgb(200, 30, 40)', 'rgb(200, 30, 40)']);
    expect(strip(el('tneutral'))).toBe(strip(el('tcurrent')));
    expect(el('tneutral').className + el('tcurrent').className + el('ring').className).not.toMatch(/neutral|current/);
    expect(warn.mock.calls.filter((c) => /current/.test(String(c[0])))).toEqual([]);
    warn.mockRestore();
    expect([css(el('inherit')).color, css(q('#inherit svg > circle:last-of-type')).stroke]).toEqual(['rgb(200, 30, 40)', 'rgb(200, 30, 40)']);
  });

  test('tone primary and muted color the ring or dots with the alias colors, and follow a nested theme', async () => {
    await render(<>
      <Loader id="ring" delay={0} />
      <Loader id="primary" tone="primary" delay={0} />
      <Loader id="muted" tone="muted" delay={0} />
      <div data-theme="violet-dark"><Loader id="nested" tone="primary" delay={0} /></div>
    </>);
    const art = (id: string) => css(q(`#${id} > span`)).color;
    expect(art('primary')).toBe(color('var(--primary)'));
    expect(css(q('#primary svg > circle:last-of-type')).stroke).toBe(color('var(--primary)'));
    expect(art('muted')).toBe(color('var(--text-muted)'));
    expect(art('primary')).not.toBe(css(el('ring')).color);
    const probe = document.createElement('div');
    probe.setAttribute('data-theme', 'violet-dark');
    probe.style.color = 'var(--primary)';
    document.body.appendChild(probe);
    const violet = css(probe).color;
    probe.remove();
    expect(art('nested')).toBe(violet);
  });

  test('tone inverse: a white ring, and white words in the text variant, whatever the text color around it, in a dark theme too', async () => {
    await render(<div id="scrim" style={{ background: '#000', color: 'rgb(15, 23, 42)' }}>
      <Loader id="inverse" tone="inverse" delay={0} />
      <Loader id="inversetext" variant="text" tone="inverse" label="Uploading" delay={0} />
    </div>);
    expect(css(el('inverse')).color).toBe('rgb(255, 255, 255)');
    expect(css(q('#inverse svg > circle:last-of-type')).stroke).toBe('rgb(255, 255, 255)');
    expect(css(q('#inversetext span:has(> [data-words])')).color).toBe('rgb(255, 255, 255)');
    el('scrim').setAttribute('data-theme', 'blue-dark');
    expect(css(el('inverse')).color).toBe('rgb(255, 255, 255)');
  });

  test('component tokens: --loader-size-md and --loader-track-opacity on one loader', async () => {
    await render(<Loader id="tok" delay={0} style={vars({ '--loader-size-md': 'var(--spacing-8)', '--loader-track-opacity': '0' })} />);
    expect(box('tok')).toEqual([32, 32]);
    expect(css(q('#tok svg > circle:first-of-type')).opacity).toBe('0');
  });

  test('named: role="progressbar" (indeterminate: no value) with aria-label "Loading…"; label sets the name; label="" makes it decorative', async () => {
    await render(<><Loader id="ring" delay={0} /><Loader id="named" label="Loading projects" delay={0} /><Loader id="deco" label="" delay={0} /></>);
    const r = el('ring'), d = el('deco');
    expect([r.getAttribute('role'), r.getAttribute('aria-label'), r.hasAttribute('aria-valuenow'), r.hasAttribute('aria-hidden')]).toEqual(['progressbar', 'Loading…', false, false]);
    expect(el('named').getAttribute('aria-label')).toBe('Loading projects');
    expect([d.getAttribute('aria-hidden'), d.hasAttribute('role'), d.hasAttribute('aria-label')]).toEqual(['true', false, false]);
    await expect.element(page.getByRole('progressbar', { name: 'Loading projects' })).toBeInTheDocument();
  });

  test('the drawing itself is hidden from assistive tech and not focusable', async () => {
    await render(<>{(['ring', 'spokes', 'dots'] as const).map((v) => <Loader key={v} variant={v} delay={0} />)}</>);
    const svgs = [...document.querySelectorAll('[data-component=loader] svg')];
    expect(svgs.length).toBe(3);
    expect(svgs.every((s) => s.getAttribute('aria-hidden') === 'true' && s.getAttribute('focusable') === 'false')).toBe(true);
  });

  test('it is announced through the shared polite status region', async () => {
    await render(<Loader delay={0} />);
    await expect.poll(() => announcer()?.textContent).toMatch(/Loading/);
    expect([announcer().getAttribute('role'), announcer().getAttribute('aria-live')]).toEqual(['status', 'polite']);
  });

  test('ref, className and other attributes pass through; data attributes for tests', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    await render(<Loader id="ref" delay={0} ref={ref} className="extra" data-x="y" />);
    const r = ref.current!;
    expect(r.id).toBe('ref');
    expect(r.classList.contains('extra')).toBe(true);
    expect([r.dataset.x, r.dataset.component, r.dataset.variant, r.dataset.size]).toEqual(['y', 'loader', 'ring', 'md']);
  });

  test('variant="text": just the words, no ring or dots, in the text color around it, 14px/20px (md), as tall as the line; hidden from assistive tech (no double reading)', async () => {
    await render(<span style={{ color: 'rgb(15, 23, 42)' }}><Loader id="lab" variant="text" label="Loading projects" delay={0} /></span>);
    const e = el('lab'), l = e.querySelector('span:has(> [data-words])')!, s = css(l);
    expect([l.textContent, !!e.querySelector('svg'), e.children.length, e.dataset.variant]).toEqual(['Loading projects', false, 1, 'text']);
    expect([s.color, `${s.fontSize}/${s.lineHeight}`, Math.round(e.getBoundingClientRect().height)]).toEqual(['rgb(15, 23, 42)', '14px/20px', 20]);
    expect([l.getAttribute('aria-hidden'), e.getAttribute('role'), e.getAttribute('aria-label')]).toEqual(['true', 'progressbar', 'Loading projects']);
  });

  test('shine: the words rest at 65% of the text color (label-dim); a soft-edged window half the words wide holds a full-color copy (not read: the label is hidden, and the copy is generated content), sweeping every 2s with ease-in-out, forever, on translate (EE1)', async () => {
    await render(<span style={{ color: 'rgb(15, 23, 42)' }}><Loader id="lab" variant="text" label="Loading projects" delay={0} /></span>);
    const l = q('#lab span:has(> [data-words])'), g = l.firstElementChild as HTMLElement, s = css(l), w = css(g), copy = getComputedStyle(g, '::after');
    expect(s.webkitTextFillColor).toMatch(/0\.65\)$/);
    expect([l.textContent, g.dataset.words, copy.content, copy.webkitTextFillColor, s.overflow]).toEqual(['Loading projects', 'Loading projects', '"Loading projects"', 'rgb(15, 23, 42)', 'hidden']);
    expect(w.maskImage || w.webkitMaskImage).toMatch(/linear-gradient/);
    expect(Math.round(g.getBoundingClientRect().width * 2)).toBe(Math.round(l.getBoundingClientRect().width));
    for (const a of [w, copy]) expect(`${a.animationName} ${a.animationDuration} ${a.animationTimingFunction} ${a.animationIterationCount}`).toBe('srp-loader-glint 2s cubic-bezier(0.65, 0, 0.35, 1) infinite');
  });

  test('shine: the window starts off the left of the words and ends off the right (seamless loop), halfway at half time (ease-in-out is symmetric), while the copy moves back by as much so it stays on the words', async () => {
    await render(<Loader id="lab" variant="text" label="Loading projects" delay={0} />);
    const l = q('#lab span:has(> [data-words])'), g = l.firstElementChild!, lw = l.getBoundingClientRect().width;
    const runs = g.getAnimations({ subtree: true }).filter((a): a is CSSAnimation => a instanceof CSSAnimation && a.animationName === 'srp-loader-glint');
    expect(runs.length).toBe(2);
    const left = (ms: number) => { runs.forEach((a) => { a.pause(); a.currentTime = ms; }); return (g.getBoundingClientRect().left - l.getBoundingClientRect().left) / lw; };
    const [start, mid, end] = [left(0), left(1000), left(1999)];
    expect(start).toBeCloseTo(-0.5, 1);
    expect(mid).toBeCloseTo(0.25, 2);
    expect(end).toBeGreaterThan(0.99);
    // The copy's translate is the window's, undone: in the copy's own width (twice the window's), half as many percent, the other way.
    const pct = (el: Element, pseudo?: string) => parseFloat(getComputedStyle(el, pseudo).translate);
    runs.forEach((a) => { a.currentTime = 700; });
    const gw = g.getBoundingClientRect().width;
    expect(pct(g) / 100 * gw + pct(g, '::after') / 100 * gw * 2).toBeCloseTo(0, 0);
    runs.forEach((a) => a.play());
  });

  test('shine: the resting words (text at 65%) keep 4.5:1 on surface in every theme', () => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const lum = (c: number[]) => { const v = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!; };
    const out: Record<string, number> = {};
    for (const th of ['blue-light', 'blue-dark', 'yellow-light', 'yellow-dark', 'violet-light', 'violet-dark']) {
      const d = document.createElement('div');
      d.setAttribute('data-theme', th);
      d.style.cssText = 'color:var(--text);background:var(--surface);opacity:var(--loader-label-dim, var(--opacity-65))';
      document.body.appendChild(d);
      const s = getComputedStyle(d), a = parseFloat(s.opacity), fg = rgb(s.color), bg = rgb(s.backgroundColor);
      d.remove();
      const L = [lum(fg.map((x, i) => x * a + bg[i]! * (1 - a))), lum(bg)].sort((x, y) => y - x);
      out[th] = Math.round(((L[0]! + 0.05) / (L[1]! + 0.05)) * 100) / 100;
    }
    expect(Object.entries(out).filter(([, r]) => r < 4.5)).toEqual([]);
  });

  test('text variant: tone primary keeps the words in the text color; sizes sm text-xs, md text-sm, lg text-base', async () => {
    await render(<>
      <span style={{ color: 'rgb(15, 23, 42)' }}><Loader id="labp" variant="text" tone="primary" label="Thinking" delay={0} /></span>
      <Loader id="labsm" variant="text" size="sm" label="Saving" delay={0} />
      <Loader id="lablg" variant="text" size="lg" label="Preparing" delay={0} />
    </>);
    expect(css(q('#labp span:has(> [data-words])')).color).toBe('rgb(15, 23, 42)');
    expect([css(q('#labsm span:has(> [data-words])')).fontSize, css(q('#lablg span:has(> [data-words])')).fontSize]).toEqual(['12px', '16px']);
  });

  test('text variant: with label="" it still shows "Loading…", decorative; without a label it shows and says "Loading…"; ring and dots have no words', async () => {
    await render(<>
      <Loader id="labempty" variant="text" label="" delay={0} />
      <Loader id="labdefault" variant="text" delay={0} />
      <Loader id="ring" delay={0} />
      <Loader id="dots" variant="dots" delay={0} />
    </>);
    const e = el('labempty'), d = el('labdefault');
    expect([e.querySelector('span:has(> [data-words])')!.textContent, e.getAttribute('aria-hidden'), e.getAttribute('role')]).toEqual(['Loading…', 'true', null]);
    expect([d.querySelector('span:has(> [data-words])')!.textContent, d.getAttribute('aria-label')]).toEqual(['Loading…', 'Loading…']);
    expect([!!q('#ring span:has(> [data-words])'), !!q('#dots span:has(> [data-words])')]).toEqual([false, false]);
    expect(box('ring')).toEqual([24, 24]);
  });

  test('delay: for the first 300ms nothing shows or is announced, but its space is kept; then it fades in, becomes a progressbar and is announced', async () => {
    let show!: () => void;
    function App() {
      const [late, setLate] = React.useState(false);
      show = () => setLate(true);
      return <div style={{ width: '300px' }}>
        {late ? <Loader id="delayed" /> : null}
      </div>;
    }
    await render(<App />);
    await expect.poll(announcerIdle, { timeout: 3000 }).toBe(true);   // earlier tests' announcements have all been said
    if (announcer()) announcer().textContent = '';
    const t0 = performance.now();
    show();
    await expect.poll(() => document.getElementById('delayed')).toBeTruthy();
    await settle(100);
    const e = el('delayed');
    expect(performance.now() - t0).toBeLessThan(290);
    expect([css(e).visibility, !!e.querySelector('svg'), e.getAttribute('aria-hidden'), e.getAttribute('role'), box('delayed')[0], announcer()?.textContent || '']).toEqual(['hidden', false, 'true', null, 24, '']);
    await expect.poll(() => el('delayed').getAttribute('role'), { timeout: 2000 }).toBe('progressbar');
    expect(performance.now() - t0).toBeGreaterThanOrEqual(300);
    expect([css(el('delayed')).visibility, !!el('delayed').querySelector('svg'), css(el('delayed')).animationName]).toEqual(['visible', true, 'srp-loader-in']);
    await expect.poll(() => announcer().textContent).toMatch(/Loading/);
  });

  test('delay: a loader removed before 300ms never appears (a fast request shows nothing)', async () => {
    let hide!: () => void;
    function App() {
      const [quick, setQuick] = React.useState(true);
      hide = () => setQuick(false);
      return quick ? <Loader id="quick" /> : null;
    }
    await render(<App />);
    await settle(100);
    expect(css(el('quick')).visibility).toBe('hidden');
    hide();
    await expect.poll(() => document.getElementById('quick')).toBeNull();
  });

  test('reduced motion: the label is plain text; the ring (a quarter arc) and the spokes stand still and breathe (opacity, 1.4s); the dots only fade (EE1)', async () => {
    await render(<>
      <span style={{ color: 'rgb(15, 23, 42)' }}><Loader id="lab" variant="text" label="Loading projects" delay={0} /></span>
      <Loader id="ring" delay={0} />
      <Loader id="dots" variant="dots" delay={0} />
      <Loader id="spk" variant="spokes" delay={0} />
    </>);
    const restore = reduceMotion();
    try {
      const l = css(q('#lab span:has(> [data-words])'));
      expect([l.webkitTextFillColor, css(q('#lab [data-words]')).display]).toEqual([l.color, 'none']);
      const arc = css(q('#ring svg > circle:last-of-type'));
      const ring = css(q('#ring svg'));
      expect([`${ring.animationName} ${ring.animationDuration}`, arc.animationName]).toEqual(['srp-loader-breathe 1.4s', 'none']);
      expect(arc.strokeDasharray).toMatch(/^25(px)?,? 150/);
      expect(css(q('#dots svg circle')).animationName).toBe('srp-loader-dot-fade');
      const spk = css(q('#spk svg'));
      expect(`${spk.animationName} ${spk.animationDuration}`).toBe('srp-loader-breathe 1.4s');
    } finally { restore(); }
  });

});
