import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { MenuItem } from '../Menu/Menu';
import { SplitButton } from './SplitButton';

const el = (id: string) => document.getElementById(id) as HTMLElement;

function Save(props: { log: string[]; disabled?: boolean; loading?: boolean }) {
  return <SplitButton id="sb" aria-label="Save" menuLabel="More save options" disabled={props.disabled} loading={props.loading} className="extra" data-x="y"
    onClick={() => props.log.push('save')}
    menu={<><MenuItem onSelect={() => props.log.push('copy')}>Save a copy</MenuItem><MenuItem onSelect={() => props.log.push('template')}>Save as template</MenuItem></>}>Save</SplitButton>;
}

describe('SplitButton', () => {
  test('a named group of two buttons: the main action runs onClick, and the arrow is named by menuLabel; className and props reach the wrapper', async () => {
    const log: string[] = [], ref = React.createRef<HTMLDivElement>();
    await render(<SplitButton ref={ref} id="r" className="extra" data-x="y" aria-label="Save" menuLabel="More save options" menu={<MenuItem>Save a copy</MenuItem>} onClick={() => log.push('save')}>Save</SplitButton>);
    const w = el('r');
    expect([ref.current === w, w.className, w.dataset.x, w.dataset.component]).toEqual([true, 'srp-split-button extra', 'y', 'split-button']);
    await expect.element(page.getByRole('group', { name: 'Save' })).toBeInTheDocument();
    const arrow = page.getByRole('button', { name: 'More save options' });
    await expect.element(arrow).toHaveAttribute('aria-haspopup', 'menu');
    await expect.element(arrow).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(page.getByRole('button', { name: 'Save', exact: true }));
    expect(log).toEqual(['save']);
  });

  test('the arrow opens the menu, an item runs, and the menu closes back to the arrow; the keyboard opens it too', async () => {
    const log: string[] = [];
    await render(<Save log={log} />);
    const arrow = page.getByRole('button', { name: 'More save options' });
    await userEvent.click(arrow);
    await expect.element(arrow).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(page.getByRole('menuitem', { name: 'Save as template' }));
    expect(log).toEqual(['template']);
    await expect.element(arrow).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => document.activeElement).toBe(arrow.element());
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitem', { name: 'Save a copy' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.activeElement).toBe(arrow.element());
    expect(log).toEqual(['template']);
  });

  test('one control: the halves touch, share their height, and the menu opens under the arrow lined up with the group\'s end', async () => {
    // Room on its start side, so the menu has space to line up with the group's end.
    await render(<div style={{ paddingInlineStart: '320px' }}><Save log={[]} /></div>);
    const [main, arrow] = [...el('sb').querySelectorAll('button')].map((b) => b.getBoundingClientRect());
    expect([Math.round(arrow!.left - main!.right) <= 0, Math.round(arrow!.height), Math.round(arrow!.width)]).toEqual([true, Math.round(main!.height), Math.round(main!.height)]);
    await userEvent.click(page.getByRole('button', { name: 'More save options' }));
    const m = page.getByRole('menu').element().getBoundingClientRect();
    expect([Math.abs(m.right - arrow!.right) <= 1, m.top >= arrow!.bottom]).toEqual([true, true]);
    await userEvent.keyboard('{Escape}');
  });

  test('disabled turns off both halves; loading only the main one, and the menu stays usable', async () => {
    const log: string[] = [];
    const { rerender } = await render(<Save log={log} disabled />);
    for (const b of el('sb').querySelectorAll('button')) expect(b.matches(':disabled, [aria-disabled="true"]')).toBe(true);
    await rerender(<Save log={log} loading />);
    const [main, arrow] = [...el('sb').querySelectorAll('button')];
    expect([main!.getAttribute('aria-busy') === 'true' || main!.matches(':disabled, [aria-disabled="true"]'), arrow!.matches(':disabled, [aria-disabled="true"]')]).toEqual([true, false]);
    await userEvent.click(main!, { force: true });
    expect(log).toEqual([]);
    await userEvent.click(arrow!);
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  });

  test('two primary halves have an edge between them in their text color', async () => {
    await render(<Save log={[]} />);
    const arrow = el('sb').querySelectorAll('button')[1]!;
    expect(css(arrow).borderInlineStartColor).not.toBe(css(el('sb').querySelector('button')).borderInlineStartColor);
  });
  test('placement: the menu opens on the side asked for, every one of the twelve (bottom-end by default)', async () => {
    const all = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'] as const;
    const sides: string[] = [];
    for (const p of [undefined, ...all]) {
      const r = await render(<div style={{ padding: 240 }}><SplitButton aria-label="Save" menuLabel="More" placement={p} defaultOpen menu={<MenuItem>Save a copy</MenuItem>}>Save</SplitButton></div>);
      await expect.poll(() => document.querySelector<HTMLElement>('[role="menu"]')?.dataset.side).toBeTruthy();
      sides.push(document.querySelector<HTMLElement>('[role="menu"]')!.dataset.side!);
      await r.unmount();
    }
    expect(sides).toEqual(['bottom', ...all.map((p) => p.split('-')[0])]);
  });
});
