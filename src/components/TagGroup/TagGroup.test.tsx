import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, press, withMotion } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { TagGroup, type TagItem } from './TagGroup';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';

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
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', true, 'srp-tag-group extra', 'y', 'tag-group']);
    await expect.element(page.getByRole('grid', { name: 'Labels' })).toBeVisible();
    expect(page.getByRole('row').elements().map((r) => r.textContent)).toEqual(['Design', 'Bug', 'Checkout', 'Mobile']);
    await expect.element(page.getByRole('button', { name: 'Remove Design' })).toBeVisible();
    expect(page.getByRole('row').elements().map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
  });

  test('a tag sets its words as a small Button does, 12px on a 16px line in its 24px, and a tag that wraps keeps a one-line tag\'s inset', async () => {
    await render(<div style={{ width: '120px' }}>
      <TagGroup id="tw" label="Labels" items={[{ id: 'a', label: 'Bug' }, { id: 'b', label: 'A label long enough to wrap' }]} />
      <Button size="sm" id="tb">Bug</Button>
    </div>);
    const [one, two] = [...document.querySelectorAll<HTMLElement>('#tw [role="row"]')], text = one!.querySelector<HTMLElement>('[role="gridcell"]')!;
    const b = getComputedStyle(document.getElementById('tb')!);
    expect([getComputedStyle(one!).fontSize, getComputedStyle(one!).lineHeight, Math.round(one!.getBoundingClientRect().height)]).toEqual([b.fontSize, b.lineHeight, 24]);
    const inset = (r: HTMLElement) => Math.round(r.querySelector<HTMLElement>('[role="gridcell"]')!.getBoundingClientRect().top - r.getBoundingClientRect().top);
    expect([inset(one!), inset(two!), two!.getBoundingClientRect().height > 24]).toEqual([4, 4, true]);   // 1px border and 3px above the line
    expect(text.textContent).toBe('Bug');
  });

  test('a tag\'s icon, a selected tag\'s check and the × are 14px beside the 12px label, as a small Button\'s, not an icon\'s 24px default; --tag-group-icon-size sets them (GR421)', async () => {
    const items = [{ id: 'a', label: 'Bug', icon: 'bug_report' }, { id: 'b', label: 'Docs', icon: 'description' }];
    await render(<SerupaProvider locale="en-US">
      <TagGroup id="xs" label="Labels" items={items} onRemove={() => {}} selectionMode="multiple" defaultSelected={['b']} />
      <TagGroup id="xt" label="Labels" items={items} onRemove={() => {}} style={{ '--tag-group-icon-size': '12px' } as React.CSSProperties} />
    </SerupaProvider>);
    const sizes = (id: string) => [...document.querySelectorAll<HTMLElement>('#' + id + ' [data-icon]')].map((i) => Math.round(i.getBoundingClientRect().height));
    const x = document.querySelector<HTMLElement>('#xs button[aria-label^="Remove"]')!, button = x.getBoundingClientRect();
    // The × is drawn 22px, inside the tag's 1px border, so the tag stays 24px; a press 0.5px past any edge still lands on it (24px, WCAG 2.5.8).
    expect([sizes('xs'), sizes('xt'), button.width, button.height]).toEqual([[14, 14, 14, 14], [12, 12, 12, 12], 22, 22]);
    const mid = { x: button.left + button.width / 2, y: button.top + button.height / 2 };
    for (const [px, py] of [[button.left - 0.5, mid.y], [button.right + 0.5, mid.y], [mid.x, button.top - 0.5], [mid.x, button.bottom + 0.5]]) expect(x.contains(document.elementFromPoint(px!, py!))).toBe(true);
  });

  test('icon and avatar: decorative, before the words; the tag keeps its name, its height, and a selected tag shows its check in the icon\'s place', async () => {
    await render(<div>
      <TagGroup label="Plain" items={[{ id: 'p', label: 'Plain' }]} />
      <TagGroup label="To" items={[{ id: 'ana', label: 'Ana Silva', avatar: <Avatar name="Ana Silva" size="md" /> }]} onRemove={() => {}} />
      <TagGroup label="Kinds" items={[{ id: 'bug', label: 'Bug', icon: 'bug_report' }, { id: 'docs', label: 'Docs', icon: 'description' }]} selectionMode="multiple" defaultSelected={['docs']} />
    </div>);
    await expect.element(page.getByRole('row', { name: /^Ana Silva/ })).toBeVisible();
    await expect.element(page.getByRole('row', { name: 'Bug' })).toBeVisible();
    const h = (name: string) => Math.round(page.getByRole('row', { name }).element().getBoundingClientRect().height);
    expect([Math.round(page.getByRole('row', { name: /^Ana Silva/ }).element().getBoundingClientRect().height), h('Bug'), h('Plain')]).toEqual([24, 24, 24]);   // a small control's height, with a × or a picture too
    const docs = page.getByRole('row', { name: 'Docs' }).element(), bug = page.getByRole('row', { name: 'Bug' }).element();
    // A selected tag shows the check in its icon's place.
    expect([!!bug.querySelector('[data-icon="bug_report"]'), !!docs.querySelector('[data-icon="description"]'), !!docs.querySelector('svg, [data-icon="check"]')]).toEqual([true, false, true]);
    // The picture comes before the words, at the tag's start.
    const ana = page.getByRole('row', { name: /^Ana Silva/ }).element(), pic = ana.querySelector('[data-component="avatar"]')!.getBoundingClientRect(), box = ana.getBoundingClientRect();
    expect(getComputedStyle(ana).direction === 'rtl' ? box.right - pic.right : pic.left - box.left).toBeLessThan(8);
  });

  test('an avatar sits inside the tag\'s border, 1px clear of it above, below and at the start, so it never breaks the line (left to right and right to left)', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const s = await render(<div dir={dir}><TagGroup label="To" items={[{ id: 'ada', label: 'Ada Lovelace', avatar: <Avatar name="Ada Lovelace" size="xs" /> }]} onRemove={() => {}} /></div>);
      const row = page.getByRole('row', { name: /^Ada Lovelace/ }).element(), b = row.getBoundingClientRect();
      const p = row.querySelector('[data-component="avatar"]')!.getBoundingClientRect();
      expect([dir, Math.round(p.width), Math.round(p.top - b.top), Math.round(b.bottom - p.bottom), Math.round(dir === 'rtl' ? b.right - p.right : p.left - b.left), Math.round(b.height)])
        .toEqual([dir, 20, 2, 2, 2, 24]);
      await s.unmount();
    }
  });

  test('the × fades its fill on hover, as every control does, and changes at once when pressed', async () => {
    await render(<SerupaProvider locale="en-US"><TagGroup label="Labels" items={tags} onRemove={() => {}} /></SerupaProvider>);
    const x = page.getByRole('button', { name: 'Remove Design' }).element();
    const s = withMotion(() => [css(x).transitionProperty, css(x).transitionDuration]);
    expect(s[0]).toContain('background-color');
    expect(parseFloat(s[1]!)).toBeGreaterThan(0);
  });

  test('a tag that can be picked answers the pointer: surface-hover under it, pressed while held, and a picked one keeps its colors', async () => {
    await render(<SerupaProvider locale="en-US"><TagGroup label="Kinds" items={tags} selectionMode="multiple" defaultSelected={['bug']} /></SerupaProvider>);
    const off = page.getByRole('row', { name: /^Design/ }).element(), on = page.getByRole('row', { name: /^Bug/ }).element();
    const tag = (r: Element) => r as HTMLElement;
    expect(css(tag(off)).backgroundColor).toBe(color('var(--surface)'));
    await userEvent.hover(tag(off));
    await expect.poll(() => css(tag(off)).backgroundColor).toBe(color('var(--surface-hover)'));
    expect(await press(tag(off), () => css(tag(off)).backgroundColor)).toBe(color('var(--pressed)'));
    const picked = css(tag(on)).backgroundColor;
    await userEvent.hover(tag(on));
    await new Promise((r) => setTimeout(r, 200));
    expect(css(tag(on)).backgroundColor).toBe(picked);
  });

  test('"Show more" fades to its hover color over motion-hover, as a Link does', async () => {
    await render(<SerupaProvider locale="en-US"><TagGroup label="Labels" items={tags} max={2} /></SerupaProvider>);
    const m = page.getByRole('button', { name: /Show/ }).element();
    const s = withMotion(() => [css(m).transitionProperty, css(m).transitionDuration]);
    expect(s).toEqual(['color', '0.15s']);
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
    // Alt with an arrow is the browser's Back or Forward, not a move.
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
    expect(focused()).toBe('bug');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('mobile');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('mobile');
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe('checkout');
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
    const seen = new MutationObserver(() => { const t = document.querySelector('[data-srp-announcer]')?.textContent; if (t) said.push(t); });
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
    expect([row('bug').querySelector('[data-icon="check"]') != null, row('design').querySelector('[data-icon="check"]') != null]).toEqual([true, false]);
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

  test('"Show more" is underlined as a link is, 1px and 2px below the words, and pointed at turns primary-hover with a 2px underline', async () => {
    await render(<Removable max={2} />);
    const more = page.getByRole('button', { name: 'Show more' });
    const look = () => { const c = css(more.element()); return [c.color, c.textDecorationThickness, c.textUnderlineOffset]; };
    expect(look()).toEqual([color('var(--primary)'), '1px', '2px']);
    await more.hover();
    await expect.poll(look).toEqual([color('var(--primary-hover)'), '2px', '2px']);
    await userEvent.hover(document.body, { position: { x: 5, y: 600 } });
  });

  test('with max, removing the last tag shown moves focus to the next one, which takes its place, not back to the one before', async () => {
    await render(<Removable max={2} />);
    row('bug').focus();
    await userEvent.keyboard('{Delete}');
    expect([page.getByRole('row').elements().map((r) => r.textContent), focused()]).toEqual([['Design', 'Checkout'], 'checkout']);
  });

  test('a removed tag is no longer picked: picking another reports only tags still there', async () => {
    const picks: string[][] = [];
    await render(<Removable selectionMode="multiple" defaultSelected={['bug']} onSelectedChange={(ids) => picks.push(ids)} />);
    row('bug').focus();
    await userEvent.keyboard('{Delete}');
    await userEvent.keyboard(' ');
    expect([focused(), picks]).toEqual(['checkout', [['checkout']]]);
  });

  test('Indonesian names the × "Hapus Design"', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><TagGroup aria-label="Label" items={tags} onRemove={() => {}} /></SerupaProvider>);
    await expect.element(page.getByRole('button', { name: 'Hapus Design' })).toBeInTheDocument();
  });

  test('a tag reads 4.5:1 in every theme; a plain tag\'s border is border-strong, as a field\'s and an outline Badge\'s (its words mark it), a picked one\'s keeps 3:1', async () => {
    await render(<TagGroup aria-label="Skills" items={tags} selectionMode="multiple" defaultSelected={['bug']} />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const t of ['design', 'bug']) {
        const s = css(row(t)), bg = s.backgroundColor;
        const under = bg === 'rgba(0, 0, 0, 0)' ? css(document.body).backgroundColor : bg;
        expect(contrast(s.color, under), `${th} ${t}`).toBeGreaterThanOrEqual(4.5);
      }
      expect([th, css(row('design')).borderTopColor]).toEqual([th, color('var(--border-strong)')]);
      expect(contrast(css(row('bug')).borderTopColor, css(document.body).backgroundColor), `${th} picked border`).toBeGreaterThanOrEqual(3);
    }
  });
});
