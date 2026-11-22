import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { FabMenu, type FabMenuAction } from './FabMenu';
import { Fab } from '../Fab/Fab';

const picked: string[] = [];
const ACTIONS: FabMenuAction[] = [
  { label: 'New document', icon: 'description', onSelect: () => { picked.push('doc'); } },
  { label: 'New folder', icon: 'create_new_folder', onSelect: () => { picked.push('folder'); } },
  { label: 'Paste', icon: 'content_paste', onSelect: () => { picked.push('paste'); }, disabled: true },
  { label: 'Upload a file', icon: 'upload', onSelect: () => { picked.push('upload'); } },
];
const fab = () => page.getByRole('button', { name: 'Create' }).element() as HTMLButtonElement;
const menu = () => document.querySelector<HTMLElement>('[role=menu]')!;
const items = () => [...menu().querySelectorAll<HTMLElement>('[role=menuitem]')];

describe('FabMenu', () => {
  test('the Fab is a menu button named by its label; ref, className and props reach it; the menu is named the same', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(<FabMenu ref={ref} icon="add" label="Create" placement="static" className="extra" data-x="y" actions={ACTIONS} />);
    const b = fab();
    expect([ref.current === b, b.classList.contains('srp-fab'), b.classList.contains('extra'), b.dataset.x, b.getAttribute('aria-haspopup'), b.getAttribute('aria-expanded')])
      .toEqual([true, true, true, 'y', 'menu', 'false']);
    expect([menu().getAttribute('aria-label'), menu().classList.contains('srp-fab-menu'), menu().hidden]).toEqual(['Create', true, true]);
  });

  test('a press opens the actions, each with its words shown, and focus goes to the first; the arrows move, a pick runs it, closes the menu and puts focus back on the Fab', async () => {
    picked.length = 0;
    await render(<FabMenu icon="add" label="Create" placement="static" actions={ACTIONS} />);
    await userEvent.click(fab());
    await expect.poll(() => fab().getAttribute('aria-expanded')).toBe('true');
    expect(items().map((i) => [i.textContent, i.getClientRects().length > 0, i.getAttribute('aria-disabled')])).toEqual([
      ['New document', true, null], ['New folder', true, null], ['Paste', true, 'true'], ['Upload a file', true, null]]);
    expect(document.activeElement).toBe(items()[0]);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Upload a file');   // disabled Paste is reached, then passed
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => fab().getAttribute('aria-expanded')).toBe('false');
    expect([picked, document.activeElement === fab()]).toEqual([['upload'], true]);
  });

  test('Escape closes it and focus goes back to the Fab; ArrowUp on the Fab opens it on the last action; onOpenChange says so', async () => {
    const changes: boolean[] = [];
    await render(<FabMenu icon="add" label="Create" placement="static" actions={ACTIONS} onOpenChange={(o) => changes.push(o)} />);
    fab().focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(() => document.activeElement?.textContent).toBe('Upload a file');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.activeElement).toBe(fab());
    expect([fab().getAttribute('aria-expanded'), changes]).toEqual(['false', [true, false]]);
  });

  test('a press outside closes it', async () => {
    await render(<><button id="out">Elsewhere</button><FabMenu icon="add" label="Create" placement="static" actions={ACTIONS} /></>);
    await userEvent.click(fab());
    await expect.poll(() => fab().getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(document.getElementById('out')!);
    await expect.poll(() => fab().getAttribute('aria-expanded')).toBe('false');
  });

  test('the actions open toward the middle of the screen: above a Fab at the bottom, under one at the top, 8px off it and lined up with its outer edge', async () => {
    await page.viewport(800, 600);
    const { rerender } = await render(<FabMenu icon="add" label="Create" actions={ACTIONS} open onOpenChange={vi.fn()} />);
    await expect.poll(() => menu().getBoundingClientRect().height).toBeGreaterThan(0);
    let f = fab().getBoundingClientRect(), m = menu().getBoundingClientRect();
    expect([Math.round(f.top - m.bottom), Math.round(f.right - m.right)]).toEqual([8, 0]);
    for (const placement of ['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const) {
      await rerender(<FabMenu icon="add" label="Create" placement={placement} actions={ACTIONS} open onOpenChange={vi.fn()} />);
      const top = placement.startsWith('top'), start = placement.endsWith('start');
      await expect.poll(() => { const a = fab().getBoundingClientRect(), b = menu().getBoundingClientRect(); return Math.round(top ? b.top - a.bottom : a.top - b.bottom); }, { message: placement }).toBe(8);
      f = fab().getBoundingClientRect(); m = menu().getBoundingClientRect();
      expect(Math.round(start ? m.left - f.left : f.right - m.right), placement).toBe(0);
    }
  });
  test('size and surface reach the Fab: 40px with size="sm", 56px with "md", and the same colors as a Fab on a light or dark picture', async () => {
    for (const [size, px] of [['sm', 40], ['md', 56]] as const) {
      const { unmount } = await render(<FabMenu icon="add" label="Create" size={size} placement="static" actions={ACTIONS} />);
      expect(Math.round(fab().getBoundingClientRect().height), size).toBe(px);
      await unmount();
    }
    for (const surface of ['light', 'dark'] as const) {
      const { unmount } = await render(<div style={{ background: 'black' }}>
        <FabMenu icon="add" label="Create" surface={surface} placement="static" actions={ACTIONS} />
        <Fab icon="add" label="Plain" surface={surface} placement="static" />
      </div>);
      const plain = page.getByRole('button', { name: 'Plain' }).element();
      const look = (e: Element) => { const c = getComputedStyle(e); return [c.backgroundColor, c.color, c.borderColor]; };
      expect(look(fab()), surface).toEqual(look(plain));
      await unmount();
    }
  });
});
