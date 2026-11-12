import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, lowContrast } from '../../../tools/test/vitest/helpers';
import { Loader } from '../Loader/Loader';
import { Timeline, TimelineItem } from './Timeline';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const rect = (e: Element) => e.getBoundingClientRect();
const q = (root: Element, sel: string) => root.querySelector(sel) as HTMLElement;

function Order(p: { align?: 'start' | 'alternate' }) {
  return <Timeline id="tl" aria-label="Order history" align={p.align}>
    <TimelineItem id="a" title="Order placed" time="12 Mar" dateTime="2026-03-12" status="success" icon="check">Two items.</TimelineItem>
    <TimelineItem id="b" title="Delivery delayed" time="13 Mar" status="warning" />
    <TimelineItem id="c" title="Out for delivery" time="15 Mar" />
  </Timeline>;
}

describe('Timeline', () => {
  test('renders an <ol> of <li>s; ref, className and other props reach them', async () => {
    const ref = React.createRef<HTMLOListElement>();
    const iref = React.createRef<HTMLLIElement>();
    await render(<Timeline id="x" ref={ref} className="extra" data-x="y"><TimelineItem id="i" ref={iref} className="mine" data-y="z" title="One" /></Timeline>);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['OL', true, 'dk-timeline extra', 'y', 'timeline']);
    expect([el('i').tagName, iref.current === el('i'), el('i').classList.contains('mine'), el('i').dataset.y]).toEqual(['LI', true, true, 'z']);
  });

  test('a list named by aria-label, with each event\'s title, a <time> with dateTime, and the content; the marker is hidden', async () => {
    await render(<Order />);
    await expect.element(page.getByRole('list', { name: 'Order history' })).toBeInTheDocument();
    expect(page.getByRole('listitem').all().length).toBe(3);
    const t = q(el('a'), 'time');
    expect([t.textContent, t.getAttribute('dateTime'), q(el('a'), '.dk-timeline__content').textContent]).toEqual(['12 Mar', '2026-03-12', 'Two items.']);
    expect([el('a').textContent, q(el('a'), '.dk-timeline__rail').getAttribute('aria-hidden')]).toEqual(['Order placed12 MarTwo items.', 'true']);
    // Without children there is no content box; without time, no <time>.
    await render(<Timeline><TimelineItem id="bare" title="Bare" /></Timeline>);
    expect([el('bare').querySelector('time'), q(el('bare'), '.dk-timeline__content')]).toEqual([null, null]);
  });

  test('a time without dateTime is a <span>, not a <time> with text no machine can read; a <RelativeTime> passed as time isn\'t nested in another <time> (L8E59)', async () => {
    await render(<Order />);
    const t = q(el('b'), '.dk-timeline__time');
    expect([t.tagName, t.textContent, el('b').querySelector('time')]).toEqual(['SPAN', '13 Mar', null]);
    expect(q(el('a'), '.dk-timeline__time').tagName).toBe('TIME');
    await render(<Timeline><TimelineItem id="rt" title="Shipped" time={<time dateTime="2026-03-12">2 hours ago</time>} /></Timeline>);
    expect(el('rt').querySelectorAll('time').length).toBe(1);
  });

  test('the line joins each marker to the next, and the last has none; the title\'s first line sits level with the marker', async () => {
    await render(<Order />);
    const line = (id: string) => getComputedStyle(q(el(id), '.dk-timeline__rail'), '::after');
    expect([line('a').visibility, line('a').width, line('c').visibility]).toEqual(['visible', '2px', 'hidden']);
    const m = rect(q(el('b'), '.dk-timeline__marker')), title = rect(q(el('b'), '.dk-timeline__title'));
    expect([m.width, m.height, Math.round(title.top - m.top), Math.round(title.height)]).toEqual([24, 24, 0, 24]);
    // The rail of the first item reaches down to the second item's top.
    expect(Math.round(rect(q(el('a'), '.dk-timeline__rail')).bottom)).toBe(Math.round(rect(el('b')).top));
  });

  test('status colors the dot, or tints an icon\'s circle; unknown values fall back to neutral', async () => {
    await render(<Timeline><TimelineItem id="s" title="S" status="danger" /><TimelineItem id="n" title="N" status={'bogus' as 'info'} /><TimelineItem id="ic" title="I" icon="check" status="success" /></Timeline>);
    const dot = (id: string) => getComputedStyle(q(el(id), '.dk-timeline__marker'), '::before').backgroundColor;
    expect([el('s').classList.contains('dk-timeline__item--danger'), el('n').classList.contains('dk-timeline__item--neutral')]).toEqual([true, true]);
    expect(dot('s')).not.toBe(dot('n'));
    const ic = q(el('ic'), '.dk-timeline__marker');
    expect([getComputedStyle(ic, '::before').content, q(ic, '.dk-icon') !== null, css(ic).backgroundColor !== 'rgba(0, 0, 0, 0)']).toEqual(['none', true, true]);
  });

  test('align="alternate": from 768px up the rail is centered and bodies take turns; narrower they stay on one side', async () => {
    const w = window.innerWidth, h = window.innerHeight;
    try {
      await page.viewport(1000, 700);
      await render(<div style={{ width: '800px' }}><Order align="alternate" /></div>);
      const tl = rect(el('tl')), rail = rect(q(el('a'), '.dk-timeline__rail'));
      expect(Math.abs((rail.left + rail.right) / 2 - (tl.left + tl.right) / 2)).toBeLessThan(1);
      expect([rect(q(el('a'), '.dk-timeline__body')).left > rail.right, rect(q(el('b'), '.dk-timeline__body')).right <= rect(q(el('b'), '.dk-timeline__rail')).left]).toEqual([true, true]);
      expect(css(q(el('b'), '.dk-timeline__body')).textAlign).toBe('end');
      await page.viewport(500, 700);
      await expect.poll(() => rect(q(el('b'), '.dk-timeline__body')).left > rect(q(el('b'), '.dk-timeline__rail')).right).toBe(true);
    } finally { await page.viewport(w, h); }
  });

  test('right to left: the rail is on the right', async () => {
    await render(<div dir="rtl"><Order /></div>);
    expect(rect(q(el('a'), '.dk-timeline__rail')).left > rect(q(el('a'), '.dk-timeline__body')).right).toBe(true);
  });

  test('titles, times and content read 4.5:1 on the page in all six themes', async () => {
    await render(<Order />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(document.body).backgroundColor;
      for (const sel of ['.dk-timeline__title', '.dk-timeline__time', '.dk-timeline__content']) expect(contrast(css(q(el('a'), sel)).color, bg), th + sel).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('an icon reads 3:1 on its circle, for every status in all six themes', async () => {
    const all = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;
    await render(<Timeline>{all.map((st) => <TimelineItem key={st} id={'i-' + st} title={st} icon="check" status={st} />)}</Timeline>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const st of all) { const m = q(el('i-' + st), '.dk-timeline__marker'); expect(contrast(css(m).color, css(m).backgroundColor), th + ' ' + st).toBeGreaterThanOrEqual(3); }
    }
  });

  test('a word longer than the body wraps, so at 320px the page doesn\'t scroll sideways (RF1, WCAG 1.4.10)', async () => {
    await page.viewport(320, 640);
    await render(<div id="box" style={{ width: '240px' }}><Timeline aria-label="Order history">
      <TimelineItem id="lw" title="Donaudampfschifffahrtsgesellschaftskapitänskajüte" time="12 Mar" icon="schedule">Two items. Donaudampfschifffahrtsgesellschaftskapitänskajüte.</TimelineItem>
    </Timeline></div>);
    const body = q(el('lw'), '.dk-timeline__body');
    expect([el('box').scrollWidth <= 241, body.scrollWidth <= body.clientWidth + 1, rect(body).right <= rect(el('box')).right + 1]).toEqual([true, true, true]);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  });
});

describe('Timeline orientation="horizontal" (RU12)', () => {
  const Row = (p: { stack?: boolean; dir?: 'rtl' }) => <div dir={p.dir}>
    <Timeline id="h" orientation="horizontal" stackWhenNarrow={p.stack} aria-label="Order tracking" className="mine">
      <TimelineItem id="h1" title="Ordered" time="12 Mar">Two items, paid by card, packed at the warehouse.</TimelineItem>
      <TimelineItem id="h2" title="Shipped" time="13 Mar" />
      <TimelineItem id="h3" title="Out for delivery" time="15 Mar" />
      <TimelineItem id="h4" title="Delivered" time="16 Mar" />
    </Timeline>
  </div>;

  test('events in a row along the line, each 192px wide, the rail above the body; the list is still a list', async () => {
    await render(<div style={{ width: 1000 }}><Row /></div>);
    await expect.element(page.getByRole('list')).toBeInTheDocument();
    expect(page.getByRole('listitem').all().length).toBe(4);
    const [a, b] = [rect(el('h1')), rect(el('h2'))];
    expect([a.top, Math.round(b.left - a.left), Math.round(a.width) >= 192]).toEqual([b.top, Math.round(a.width), true]);
    expect(rect(q(el('h1'), '.dk-timeline__rail')).bottom).toBeLessThanOrEqual(rect(q(el('h1'), '.dk-timeline__body')).top);
    // Every marker on one line, however long an event's text.
    expect(rect(q(el('h1'), '.dk-timeline__marker')).top).toBe(rect(q(el('h2'), '.dk-timeline__marker')).top);
  });

  test('className and style go to the box around the <ol>; ref and the rest to the <ol>', async () => {
    const ref = React.createRef<HTMLOListElement>();
    await render(<Timeline id="r" ref={ref} orientation="horizontal" aria-label="Phases" className="mine" style={{ maxWidth: 300 }} data-x="y"><TimelineItem title="One" /></Timeline>);
    const box = el('r').parentElement!;
    expect([ref.current === el('r'), el('r').dataset.x, box.classList.contains('mine'), box.style.maxWidth, box.dataset.orientation]).toEqual([true, 'y', true, '300px', 'horizontal']);
  });

  test('while it scrolls, the box is a Tab stop and a region with the name (or "Timeline"); when it fits, or is stacked, it isn\'t, and the list keeps the name (GR281)', async () => {
    await render(<div style={{ width: 300 }}><Timeline id="s1" orientation="horizontal" aria-label="Phases"><TimelineItem title="One" /><TimelineItem title="Two" /></Timeline></div>);
    await expect.element(page.getByRole('region', { name: 'Phases' })).toBeInTheDocument();
    expect(el('s1').parentElement!.tabIndex).toBe(0);
    await render(<div style={{ width: 300 }}><Timeline id="s2" orientation="horizontal"><TimelineItem title="One" /><TimelineItem title="Two" /></Timeline></div>);
    await expect.element(page.getByRole('region', { name: 'Timeline' })).toBeInTheDocument();
    await render(<div style={{ width: 900 }}><Timeline id="s3" orientation="horizontal" aria-label="Fits"><TimelineItem title="One" /><TimelineItem title="Two" /></Timeline></div>);
    await render(<div style={{ width: 360 }}><Timeline id="s4" orientation="horizontal" stackWhenNarrow aria-label="Stacked"><TimelineItem title="One" /><TimelineItem title="Two" /></Timeline></div>);
    for (const id of ['s3', 's4']) expect([el(id).parentElement!.hasAttribute('tabindex'), el(id).parentElement!.getAttribute('role')]).toEqual([false, null]);
    await expect.element(page.getByRole('list', { name: 'Fits' })).toBeInTheDocument();
    await expect.element(page.getByRole('list', { name: 'Stacked' })).toBeInTheDocument();
  });

  test('past its width it scrolls sideways in its own box, not the page; Tab reaches the box and an arrow key scrolls it', async () => {
    await render(<div style={{ width: 320 }}><Row /></div>);
    const box = el('h').parentElement!;
    expect([box.scrollWidth > box.clientWidth, Math.round(rect(box).width), css(box).overscrollBehaviorInline]).toEqual([true, 320, 'contain']);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(box);
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => box.scrollLeft).toBeGreaterThan(0);
    // WebKit scrolls for the arrow smoothly: read where it comes to rest, not a point on the way there, or the
    // ArrowLeft below starts from a smaller number than the box ends up at.
    const frame = () => new Promise((ok) => requestAnimationFrame(ok));
    let last = -1;
    await expect.poll(async () => { const was = last; await frame(); await frame(); last = box.scrollLeft; return last === was; }).toBe(true);
    const moved = box.scrollLeft;
    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(() => box.scrollLeft).toBeLessThan(moved);
  });

  test('right to left, the first event is at the right', async () => {
    await render(<div style={{ width: 1000 }}><Row dir="rtl" /></div>);
    expect(rect(el('h1')).left).toBeGreaterThan(rect(el('h2')).left);
  });

  test('stackWhenNarrow: under 480px of box the events go down a line; wider, they stay in a row', async () => {
    await render(<div style={{ width: 360 }}><Row stack /></div>);
    const box = el('h').parentElement!;
    expect([rect(el('h2')).top > rect(el('h1')).bottom - 1, box.scrollWidth <= box.clientWidth]).toEqual([true, true]);
  });

  test('stackWhenNarrow in a box 480px or wider: the events stay in a row', async () => {
    await render(<div style={{ width: 1000 }}><Row stack /></div>);
    expect(rect(el('h1')).top).toBe(rect(el('h2')).top);
  });

  test('the scrolling box\'s focus ring keeps 3:1 on the page in all six themes', () => {
    expect(lowContrast([['focus ring', 'var(--focus-ring)', 'var(--surface)', 3]])).toEqual([]);
  });
  // The README's loading recipe: each event's title and time are skeleton lines of their text's size, the list is busy
  // and the skeletons are decorative (the first Loader's label is said once, through the page's announcer). Each event keeps its height when the events arrive, so nothing jumps.
  test('the loading recipe: skeleton titles and times keep each event as tall as a loaded one', async () => {
    function History(p: { busy: boolean }) {
      return <div style={{ width: 480 }}><Timeline id="tl" aria-label="Order history" aria-busy={p.busy || undefined}>
        {[0, 1, 2].map((i) => p.busy
          ? <TimelineItem key={i} title={<Loader variant="skeleton" size="lg" className="w-1/2" label={i === 0 ? 'Loading history' : ''} />} time={<Loader variant="skeleton" size="md" className="w-24" label="" />} />
          : <TimelineItem key={i} title="Order placed" time="12 Mar, 09:14" dateTime="2026-03-12T09:14" />)}
      </Timeline></div>;
    }
    const heights = () => [...el('tl').children].map((c) => rect(c).height);
    const { rerender } = await render(<History busy />);
    expect(el('tl').getAttribute('aria-busy')).toBe('true');
    expect([...el('tl').querySelectorAll('[data-component="loader"]')].every((x) => x.getAttribute('aria-hidden') === 'true')).toBe(true);
    const busy = heights();
    await rerender(<History busy={false} />);
    expect(heights()).toEqual(busy);
  });
});
