import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { TagGroup, type TagItem } from './TagGroup';

const tags: TagItem[] = [{ id: 'design', label: 'Design' }, { id: 'bug', label: 'Bug' }, { id: 'checkout', label: 'Checkout' }, { id: 'mobile', label: 'Mobile' }];
function Removable({ initial = tags, log = [] as string[], ...rest }: { initial?: TagItem[]; log?: string[] } & Partial<React.ComponentProps<typeof TagGroup>>) {
  const [items, setItems] = React.useState(initial);
  return <SerupaProvider locale="en-US"><button type="button">Before</button><TagGroup label="Labels" empty="No labels yet" {...rest} items={items} onRemove={(id) => { log.push(id); setItems((t) => t.filter((x) => x.id !== id)); }} /></SerupaProvider>;
}
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.tagId;
const row = (tid: string) => document.querySelector<HTMLElement>(`[data-tag-id="${tid}"]`)!;

let errors: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); document.documentElement.removeAttribute('data-theme'); });

describe('TagGroup', () => {
  test('a grid named by its label, a row per tag with its words and a × named "Remove Design"; ref, className and other props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<SerupaProvider locale="en-US"><TagGroup id="x" ref={ref} className="extra" data-x="y" label="Labels" items={tags} onRemove={() => {}} /></SerupaProvider>);
    const e = document.getElementById('x')!;
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', true, 'dk-tag-group extra', 'y', 'tag-group']);
    await expect.element(page.getByRole('grid', { name: 'Labels' })).toBeVisible();
    expect(page.getByRole('row').elements().map((r) => r.textContent)).toEqual(['Design', 'Bug', 'Checkout', 'Mobile']);
    await expect.element(page.getByRole('button', { name: 'Remove Design' })).toBeVisible();
    expect(page.getByRole('row').elements().map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
  });

  test('one Tab stop: the arrow keys move between tags, Home and End to the ends, and Tab returns to the last tag focused', async () => {
    await render(<Removable />);
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('design');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe('checkout');
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('bug');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('mobile');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('mobile');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('design');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement!.textContent).toBe('Before');
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('bug');
    expect(page.getByRole('button', { name: 'Remove Bug' }).element().tabIndex).toBe(-1);
  });

  test('right to left, Left moves to the next tag', async () => {
    await render(<div dir="rtl"><Removable /></div>);
    row('design').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('bug');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('design');
  });

  test('Delete removes the focused tag and focus moves to the next (the one before at the end), "Bug removed" is said; the × removes too; the last one gone leaves the empty text', async () => {
    const log: string[] = [], said: string[] = [];
    const seen = new MutationObserver(() => { const t = document.querySelector('[data-dk-announcer]')?.textContent; if (t) said.push(t); });
    seen.observe(document.body, { subtree: true, childList: true, characterData: true });
    await render(<Removable log={log} />);
    row('bug').focus();
    await userEvent.keyboard('{Delete}');
    expect(log).toEqual(['bug']);
    expect(focused()).toBe('checkout');
    await expect.poll(() => said.at(-1)).toBe('Bug removed');
    await userEvent.keyboard('{End}{Backspace}');
    expect(focused()).toBe('checkout');
    await userEvent.click(page.getByRole('button', { name: 'Remove Checkout' }));
    expect(focused()).toBe('design');
    await userEvent.keyboard('{Delete}');
    expect(log).toEqual(['bug', 'mobile', 'checkout', 'design']);
    await expect.element(page.getByText('No labels yet')).toHaveFocus();
    seen.disconnect();
  });

  test('a disabled tag has no × and Delete leaves it', async () => {
    const log: string[] = [];
    await render(<Removable log={log} initial={[{ id: 'auto', label: 'Auto', disabled: true }, ...tags]} />);
    expect(row('auto').getAttribute('aria-disabled')).toBe('true');
    expect(row('auto').querySelector('button')).toBeNull();
    row('auto').focus();
    await userEvent.keyboard('{Delete}');
    expect(log).toEqual([]);
  });

  test('multiple choice: a press, Space or Enter picks a tag (aria-selected, with a tick), and again clears it', async () => {
    const log: string[][] = [];
    await render(<SerupaProvider locale="en-US"><TagGroup aria-label="Skills" items={tags} selectionMode="multiple" defaultSelected={['bug']} onSelectedChange={(x) => log.push(x)} /></SerupaProvider>);
    await expect.element(page.getByRole('grid', { name: 'Skills' })).toHaveAttribute('aria-multiselectable', 'true');
    expect(row('bug').getAttribute('aria-selected')).toBe('true');
    expect(row('bug').querySelector('.dk-tag-group__check')).not.toBeNull();
    await userEvent.click(row('design'));
    row('checkout').focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowLeft}{Enter}');
    expect(log).toEqual([['bug', 'design'], ['bug', 'design', 'checkout'], ['design', 'checkout']]);
    expect(page.getByRole('row').elements().map((r) => r.getAttribute('aria-selected'))).toEqual(['true', 'false', 'true', 'false']);
  });

  test('single choice: picking another clears the first; a controlled group shows what it is given', async () => {
    const log: string[][] = [];
    await render(<TagGroup aria-label="Topic" items={tags} selectionMode="single" selected={['bug']} onSelectedChange={(x) => log.push(x)} />);
    expect(page.getByRole('grid').element().hasAttribute('aria-multiselectable')).toBe(false);
    await userEvent.click(row('mobile'));
    await userEvent.click(row('bug'));
    expect(log).toEqual([['mobile'], []]);
    expect(row('bug').getAttribute('aria-selected')).toBe('true');
  });

  test('max shows the first few and "Show more" for the rest, which becomes "Show less"', async () => {
    await render(<Removable max={2} />);
    expect(page.getByRole('row').elements()).toHaveLength(2);
    const more = page.getByRole('button', { name: 'Show more' });
    await expect.element(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(page.getByRole('row').elements()).toHaveLength(4);
    await userEvent.click(page.getByRole('button', { name: 'Show less' }));
    expect(page.getByRole('row').elements()).toHaveLength(2);
  });

  test('Indonesian names the × "Hapus Design"', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><TagGroup aria-label="Label" items={tags} onRemove={() => {}} /></SerupaProvider>);
    await expect.element(page.getByRole('button', { name: 'Hapus Design' })).toBeInTheDocument();
  });

  test('a tag reads 4.5:1 and its border 3:1, picked or not, in all six themes', async () => {
    await render(<TagGroup aria-label="Skills" items={tags} selectionMode="multiple" defaultSelected={['bug']} />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const t of ['design', 'bug']) {
        const s = css(row(t)), bg = s.backgroundColor;
        const under = bg === 'rgba(0, 0, 0, 0)' ? css(document.body).backgroundColor : bg;
        expect(contrast(s.color, under), `${th} ${t}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(s.borderTopColor, css(document.body).backgroundColor), `${th} ${t} border`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
