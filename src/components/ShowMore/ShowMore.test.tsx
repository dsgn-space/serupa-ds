import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { idLabels } from '../../internal/labels';
import { SerupaProvider } from '../../internal/provider';
import { ShowMore } from './ShowMore';

const LONG = 'A long review that runs over many lines in a narrow column, so only the first few show until the button is pressed. '.repeat(4);
const el = (id: string) => document.getElementById(id) as HTMLElement;
const text = (id: string) => el(id).querySelector('[id$="-text"]') as HTMLElement;
const Narrow = ({ children }: { children: React.ReactNode }) => <div style={{ width: '200px', fontSize: '14px', lineHeight: '20px' }}>{children}</div>;

describe('ShowMore', () => {
  test('renders a <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<ShowMore id="x" ref={ref} className="extra" data-x="y">Hello</ShowMore>);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', true, 'dk-show-more extra', 'y', 'show-more']);
  });

  test('closed: cut after `lines` lines, with a Show more button that opens it and becomes Show less; the whole text is always in the page', async () => {
    await render(<Narrow><ShowMore id="s" lines={2}>{LONG}</ShowMore></Narrow>);
    const t = text('s');
    expect(Math.round(t.getBoundingClientRect().height)).toBe(40);
    expect(t.textContent).toBe(LONG);
    const more = page.getByRole('button', { name: 'Show more' });
    await expect.element(more).toHaveAttribute('aria-expanded', 'false');
    expect(more.element().getAttribute('aria-controls')).toBe(t.id);
    await userEvent.click(more);
    const less = page.getByRole('button', { name: 'Show less' });
    await expect.element(less).toHaveAttribute('aria-expanded', 'true');
    expect(t.getBoundingClientRect().height).toBeGreaterThan(100);
    expect(document.activeElement).toBe(less.element());
    expect(el('s').hasAttribute('data-expanded')).toBe(true);
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    expect(Math.round(t.getBoundingClientRect().height)).toBe(40);
  });

  test('short text that fits has no button; one that stops fitting when its box narrows gets it', async () => {
    function Box({ width }: { width: number }) { return <div style={{ width, fontSize: '14px', lineHeight: '20px' }}><ShowMore id="b" lines={2}>Fresh coffee, packed well and sent the same day.</ShowMore></div>; }
    const { rerender } = await render(<Box width={600} />);
    expect(page.getByRole('button').query()).toBeNull();
    await rerender(<Box width={60} />);
    await expect.element(page.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
  });

  test('a web font that arrives after the first paint and lets the text fit takes the button away, though the box keeps its size', async () => {
    // The font's rule is added only once it's measured, so nothing loads it sooner. Monospace is wider than Inter:
    // the text takes three lines in it and two in Inter, and the two-line box is as tall either way.
    const rule = document.createElement('style');
    rule.textContent = "@font-face { font-family: SmLate; src: url(/fonts/InterVariable-latin.woff2) format('woff2'); }";
    try {
      await render(<SerupaProvider locale="en"><div style={{ width: '300px', fontSize: '14px', lineHeight: '20px', fontFamily: 'SmLate, monospace' }}>
        <ShowMore id="f" lines={2}>Fresh coffee, packed well and sent the same day, with a note from the roaster.</ShowMore></div></SerupaProvider>);
      await expect.element(page.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
      document.head.append(rule);
      await expect.poll(() => page.getByRole('button').query(), { timeout: 5000 }).toBeNull();
      expect(text('f').scrollHeight).toBeLessThanOrEqual(text('f').clientHeight + 1);
    } finally { rule.remove(); }
  });

  test('lines runs from 1 to 6 (more counts as 6), set without a style attribute so a strict CSP keeps it', async () => {
    await render(<Narrow><ShowMore id="l1" lines={1}>{LONG}</ShowMore><ShowMore id="l9" lines={9}>{LONG}</ShowMore></Narrow>);
    expect([Math.round(text('l1').getBoundingClientRect().height), Math.round(text('l9').getBoundingClientRect().height), text('l9').hasAttribute('style')]).toEqual([20, 120, false]);
  });

  test('controlled: expanded with onExpandedChange; the default is 3 lines', async () => {
    const onExpandedChange = vi.fn();
    function Ctl() { const [open, setOpen] = React.useState(false); return <Narrow><ShowMore id="c" expanded={open} onExpandedChange={(v) => { onExpandedChange(v); setOpen(v); }}>{LONG}</ShowMore></Narrow>; }
    await render(<Ctl />);
    expect(Math.round(text('c').getBoundingClientRect().height)).toBe(60);
    await userEvent.click(page.getByRole('button', { name: 'Show more' }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);
    await expect.element(page.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
    await render(<Narrow><ShowMore id="o" expanded>{LONG}</ShowMore></Narrow>);
    await userEvent.click(page.getByRole('button', { name: 'Show less' }).last());
    await expect.element(page.getByRole('button', { name: 'Show less' }).last()).toBeInTheDocument();
  });

  test('defaultExpanded opens it at first; the button speaks the provider\'s language; the cut ends in an ellipsis', async () => {
    await render(<SerupaProvider labels={idLabels}><Narrow><ShowMore id="d" defaultExpanded>{LONG}</ShowMore><ShowMore id="e">{LONG}</ShowMore></Narrow></SerupaProvider>);
    await expect.element(page.getByRole('button', { name: 'Tampilkan lebih sedikit' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Tampilkan lebih banyak' })).toBeInTheDocument();
    expect(css(text('e')).webkitLineClamp).toBe('3');
  });
});
