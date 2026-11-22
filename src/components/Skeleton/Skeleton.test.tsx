import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { css, forcedColors, settle, keepMotion } from '../../../tools/test/vitest/helpers';
import { Skeleton } from './Skeleton';
import { announcerIdle } from '../../internal/announce';

// About motion: transitions and animations stay on for this file (setup.ts turns them off elsewhere).
keepMotion();

const el = (id: string) => document.getElementById(id) as HTMLElement;
const q = (sel: string) => document.querySelector(sel) as HTMLElement;
const box = (id: string) => { const r = el(id).getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
const vars = (v: Record<string, string>) => v as React.CSSProperties;
const announcer = () => document.querySelector('[data-srp-announcer]') as HTMLElement;
/** Applies the page's prefers-reduced-motion: reduce rules, as a viewer who asks for less motion sees them. Returns the undo. */
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

describe('Skeleton', () => {
  test('a <span>; ref, className and other attributes reach it, with data-component, data-shape and data-size', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    await render(<Skeleton id="x" ref={ref} className="extra" data-x="y" delay={0} />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className.split(' ').includes('extra'), e.dataset.x, e.dataset.component, e.dataset.shape, e.dataset.size]).toEqual(['SPAN', true, true, 'y', 'skeleton', 'text', 'md']);
  });

  test('forced colors: the bones keep a still GrayText fill instead of going blank (AM1)', async () => {
    await render(<div style={{ background: 'Canvas' }}><Skeleton id="fcs" lines={2} label="" delay={0} /></div>);
    const r = await forcedColors(async (active) => {
      if (!active) return null;
      const bone = css(q('#fcs span:empty')), page = css(q('#fcs').parentElement);
      return [bone.backgroundColor !== page.backgroundColor && bone.backgroundColor !== 'rgba(0, 0, 0, 0)', getComputedStyle(q('#fcs span:empty'), '::after').display];
    });
    if (r) expect(r).toEqual([true, 'none']);
  });

  function Skeletons() {
    return <div style={{ width: '300px', color: 'rgb(15, 23, 42)' }}>
      <Skeleton id="sk1" delay={0} />
      <Skeleton id="sk3" lines={3} label="" delay={0} />
      <Skeleton id="sksm" size="sm" lines={2} label="" delay={0} />
      <Skeleton id="sklg" size="lg" label="" delay={0} />
      <Skeleton id="skc" shape="circle" label="" delay={0} />
      <Skeleton id="skclg" shape="circle" size="lg" label="" delay={0} />
      <Skeleton id="skcz" shape="circle" className="size-12" label="" delay={0} />
      <Skeleton id="skr" shape="rect" label="" delay={0} />
      <Skeleton id="skrc" shape="rect" className="w-48 h-32" label="" delay={0} />
      {/* @ts-expect-error: an unknown shape */}
      <Skeleton id="skbad" shape="hex" lines={99} label="" delay={0} />
      <Skeleton id="sktok" shape="rect" label="" delay={0} style={vars({ '--skeleton-rect-height': 'var(--spacing-10)', '--skeleton-radius': '0' })} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton id="skav" shape="circle" size="lg" label="" delay={0} />
        <Skeleton id="skrow" lines={2} label="" delay={0} />
      </div>
    </div>;
  }
  const bones = (id: string) => [...el(id).querySelectorAll('span:empty')].map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  const lines = (id: string) => el(id).querySelectorAll(':scope > span:not(:empty)').length;
  const radius = (id: string) => css(el(id).querySelector('span:empty')).borderRadius;

  test('shape "text" by default, one line as tall as the text-sm line (20px) with a 14px bar, full width, 4px corners; lines={3} is a paragraph, the last 60% wide', async () => {
    await render(<Skeletons />);
    expect([el('sk1').dataset.component, el('sk1').dataset.shape, lines('sk1'), box('sk1'), bones('sk1'), radius('sk1')]).toEqual(['skeleton', 'text', 1, [300, 20], [[300, 14]], '4px']);
    expect(el('sk1').querySelectorAll('svg, [data-words]').length).toBe(0);
    expect([lines('sk3'), box('sk3')[1], bones('sk3')]).toEqual([3, 60, [[300, 14], [300, 14], [180, 14]]]);
  });

  test('text sizes: sm 16px lines with 12px bars, lg 24px lines with 16px bars', async () => {
    await render(<Skeletons />);
    expect([box('sksm')[1], bones('sksm')[0]![1], box('sklg')[1], bones('sklg')[0]![1]]).toEqual([32, 12, 24, 16]);
  });

  test('circle: 24px at md and 40px at lg, fully round; className (size-12) sets another size', async () => {
    await render(<Skeletons />);
    expect([box('skc'), box('skclg')[0], box('skcz'), bones('skcz')]).toEqual([[24, 24], 40, [48, 48], [[48, 48]]]);
    expect(parseFloat(radius('skc'))).toBeGreaterThanOrEqual(9999);
  });

  test('rect: full width and 96px tall, 6px corners; className (w-48 h-32) sets the size; tokens --skeleton-rect-height and --skeleton-radius', async () => {
    await render(<Skeletons />);
    expect([box('skr'), radius('skr'), box('skrc'), bones('skrc')]).toEqual([[300, 96], '6px', [192, 128], [[192, 128]]]);
    expect([box('sktok')[1], radius('sktok')]).toEqual([40, '0px']);
  });

  test('in a row next to an avatar, the lines take the rest of the width and the avatar keeps its size; an unknown shape falls back to text, lines are kept to 20', async () => {
    await render(<Skeletons />);
    expect([box('skav')[0], box('skrow')[0]]).toEqual([40, 248]);
    expect([el('skbad').dataset.shape, lines('skbad')]).toEqual(['text', 20]);
  });

  test('named like a Loader (progressbar "Loading…"); label="" makes it decorative; tone inverse is white', async () => {
    await render(<><Skeletons /><div style={{ background: '#000', width: '200px' }}><Skeleton id="skinv" tone="inverse" label="" delay={0} /></div></>);
    expect([el('sk1').getAttribute('role'), el('sk1').getAttribute('aria-label')]).toEqual(['progressbar', 'Loading…']);
    expect([el('sk3').getAttribute('aria-hidden'), el('sk3').getAttribute('role')]).toEqual(['true', null]);
    expect([css(el('sk1')).color, css(el('skinv')).color]).toEqual(['rgb(15, 23, 42)', 'rgb(255, 255, 255)']);
  });

  test('fill: the text color at 10%, with a lighter band (5%) sweeping left to right every 2s, ease-in-out, on translate (EE1)', async () => {
    await render(<Skeletons />);
    const b = q('#sk1 span:empty'), s = getComputedStyle(b, '::after'), stops = s.backgroundImage.match(/color\(srgb [^)]*\)|rgba?\([^)]*\)/g) || [];
    expect(stops.length).toBe(13);
    expect(stops[0]).toMatch(/15 23 42|0\.0588/);
    expect(stops[0]).toMatch(/\/ 0\.1\)|, 0\.1\)/);
    expect(stops[6]).toMatch(/\/ 0\.05\)|, 0\.05\)/);
    expect(`${s.animationName} ${s.animationDuration} ${s.animationTimingFunction} ${s.animationIterationCount}`).toBe('srp-skeleton-sweep 2s cubic-bezier(0.65, 0, 0.35, 1) infinite');
    // Three bones wide, it starts with its last third on the bone and ends with its first: the band passes through.
    const w = b.getBoundingClientRect().width;
    expect([Math.round(parseFloat(s.width) / w), css(b).overflow]).toEqual([3, 'hidden']);
    const moves = b.getAnimations({ subtree: true }).filter((a): a is CSSAnimation => a instanceof CSSAnimation && a.animationName === 'srp-skeleton-sweep');
    // read the band where the sweep ends (Firefox hands back the keyframe's var() unresolved): two bones on,
    // a percentage of the band or a length
    moves[0]!.pause();
    moves[0]!.currentTime = 1999;
    const t = getComputedStyle(b, '::after').translate;
    const moved = t.endsWith('%') ? parseFloat(t) / 100 * parseFloat(s.width) / w : parseFloat(t) / w;
    moves[0]!.play();
    expect(Math.round(moved)).toBe(2);
  });

  test('reduced motion: the skeleton is a still fill (the text color at 10%), no shimmer', async () => {
    await render(<div style={{ width: '300px', color: 'rgb(15, 23, 42)' }}><Skeleton id="sk1" delay={0} /></div>);
    const restore = reduceMotion();
    try {
      const s = css(q('#sk1 span:empty'));
      expect([s.animationName, s.backgroundImage]).toEqual(['none', 'none']);
      expect([s.backgroundColor, getComputedStyle(q('#sk1 span:empty'), '::after').display]).toEqual([expect.stringMatching(/0\.1\)$/), 'none']);
    } finally { restore(); }
  });

  test('delay: for the first 300ms its shapes keep their space but show nothing, and nothing is said; then it fades in, becomes a progressbar and is announced', async () => {
    let show!: () => void;
    function App() {
      const [late, setLate] = React.useState(false);
      show = () => setLate(true);
      return <div style={{ width: '300px' }}>{late ? <Skeleton id="skwait" lines={2} /> : null}</div>;
    }
    await render(<App />);
    await expect.poll(announcerIdle, { timeout: 3000 }).toBe(true);
    if (announcer()) announcer().textContent = '';
    const t0 = performance.now();
    show();
    await expect.poll(() => document.getElementById('skwait')).toBeTruthy();
    await settle(100);
    expect(performance.now() - t0).toBeLessThan(290);
    expect([css(el('skwait')).visibility, lines('skwait'), box('skwait')[1], el('skwait').getAttribute('role')]).toEqual(['hidden', 2, 40, null]);
    await expect.poll(() => el('skwait').getAttribute('role'), { timeout: 2000 }).toBe('progressbar');
    expect([css(el('skwait')).visibility, css(el('skwait')).animationName]).toEqual(['visible', 'srp-skeleton-in']);
    await expect.poll(() => announcer().textContent).toMatch(/Loading/);
  });

  test('loading={false}: once shown it stays at least 500ms, then renders nothing', async () => {
    const screen = await render(<Skeleton id="done" delay={0} />);
    await screen.rerender(<Skeleton id="done" delay={0} loading={false} />);
    expect(document.getElementById('done')).not.toBeNull();
    await expect.poll(() => document.getElementById('done'), { timeout: 2000 }).toBeNull();
  });
});
