import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { MenuItem, MenuSub } from '../Menu/Menu';
import { Menubar, MenubarMenu } from './Menubar';

const top = (name: string) => page.getByRole('menubar').getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
const openMenu = () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')].find((m) => !m.hidden);
const focused = () => (document.activeElement as HTMLElement).textContent;

function Editor({ chosen = [], dir }: { chosen?: string[]; dir?: 'rtl' }) {
  const pick = (k: string) => () => { chosen.push(k); };
  return (
    <div dir={dir}>
      <Menubar aria-label="Editor" id="bar">
        <MenubarMenu label="File">
          <MenuItem onSelect={pick('new')}>New</MenuItem>
          <MenuSub label="Share"><MenuItem onSelect={pick('mail')}>Email</MenuItem></MenuSub>
        </MenubarMenu>
        <MenubarMenu label="Edit"><MenuItem onSelect={pick('undo')}>Undo</MenuItem><MenuItem>Redo</MenuItem></MenubarMenu>
        <MenubarMenu label="Format" disabled><MenuItem>Bold</MenuItem></MenubarMenu>
        <MenubarMenu label="View"><MenuItem>Zoom in</MenuItem></MenubarMenu>
      </Menubar>
      <button type="button">After</button>
    </div>
  );
}

describe('Menubar', () => {
  test('a named menubar of menuitems with popups; one Tab stop; className, ref and other props reach the bar', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Menubar aria-label="Editor" ref={ref} className="extra" data-x="y"><MenubarMenu label="File"><MenuItem>New</MenuItem></MenubarMenu><MenubarMenu label="Edit"><MenuItem>Undo</MenuItem></MenubarMenu></Menubar>);
    const bar = page.getByRole('menubar', { name: 'Editor' }).element() as HTMLElement;
    expect([ref.current === bar, bar.classList.contains('extra'), bar.dataset.x, bar.dataset.component]).toEqual([true, true, 'y', 'menubar']);
    expect([top('File').getAttribute('aria-haspopup'), top('File').getAttribute('aria-expanded'), top('File').tabIndex, top('Edit').tabIndex]).toEqual(['menu', 'false', 0, -1]);
  });

  test('← → move across the names (wrapping), Home and End jump, typing goes to a name; Tab leaves the bar', async () => {
    await render(<Editor />);
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('File');
    await userEvent.keyboard('{ArrowRight}');
    expect([focused(), top('Edit').tabIndex, top('File').tabIndex]).toEqual(['Edit', 0, -1]);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused()).toBe('View');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('File');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('View');
    await userEvent.keyboard('f');
    expect(focused()).toBe('File');
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('After');
  });

  test('↓ opens a menu on its first item; ← → move to the next menu, open, skipping into a disabled one closed; Escape goes back to its name', async () => {
    await render(<Editor />);
    top('File').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect([openMenu()?.getAttribute('aria-labelledby') === top('File').id, focused(), top('File').getAttribute('aria-expanded')]).toEqual([true, 'New', 'true']);
    await userEvent.keyboard('{ArrowRight}');
    expect([openMenu()?.getAttribute('aria-labelledby') === top('Edit').id, focused(), top('File').getAttribute('aria-expanded')]).toEqual([true, 'Undo', 'false']);
    await userEvent.keyboard('{ArrowRight}');
    expect([openMenu(), focused(), top('Format').getAttribute('aria-disabled')]).toEqual([undefined, 'Format', 'true']);
    await userEvent.keyboard('{ArrowDown}');
    expect(openMenu()).toBeUndefined();
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    expect([focused(), openMenu() !== undefined]).toEqual(['Redo', true]);
    await userEvent.keyboard('{Escape}');
    expect([focused(), openMenu()]).toEqual(['Edit', undefined]);
    await userEvent.keyboard(' ');
    expect([focused(), top('Edit').getAttribute('aria-expanded')]).toEqual(['Undo', 'true']);
    await userEvent.keyboard('{Escape}{Enter}');
    expect([focused(), top('Edit').getAttribute('aria-expanded')]).toEqual(['Undo', 'true']);
  });

  test('→ on a submenu opens the submenu, not the next menu; ← closes it; an item chosen closes the menu', async () => {
    const chosen: string[] = [];
    await render(<Editor chosen={chosen} />);
    top('File').focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    expect([focused(), top('File').getAttribute('aria-expanded')]).toEqual(['Email', 'true']);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Share');
    await userEvent.keyboard('{ArrowUp}{Enter}');
    expect([chosen, openMenu()]).toEqual([['new'], undefined]);
  });

  test('right to left, ← moves on and → back', async () => {
    await render(<Editor dir="rtl" />);
    top('File').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Edit');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('File');
  });

  test('a click opens a menu; while one is open, pointing at another name opens that one', async () => {
    await render(<Editor />);
    await userEvent.click(top('File'));
    expect(top('File').getAttribute('aria-expanded')).toBe('true');
    await userEvent.hover(top('View'));
    expect([top('File').getAttribute('aria-expanded'), top('View').getAttribute('aria-expanded')]).toEqual(['false', 'true']);
    await userEvent.click(top('View'));
    expect(openMenu()).toBeUndefined();
    await userEvent.hover(top('Edit'));
    expect(top('Edit').getAttribute('aria-expanded')).toBe('false');
  });

  test('a disabled menu does not open on a click', async () => {
    await render(<Editor />);
    await userEvent.click(top('Format'), { force: true });
    expect([openMenu(), top('Format').getAttribute('aria-expanded')]).toEqual([undefined, 'false']);
  });

  test('defaultOpen opens that menu on arrival', async () => {
    await render(<Menubar aria-label="Editor"><MenubarMenu label="File"><MenuItem>New</MenuItem></MenubarMenu><MenubarMenu label="Edit" defaultOpen><MenuItem>Undo</MenuItem></MenubarMenu></Menubar>);
    expect([top('Edit').getAttribute('aria-expanded'), top('Edit').tabIndex]).toEqual(['true', 0]);
  });

  test('outside a Menubar, a MenubarMenu is a plain menu behind its button', async () => {
    await render(<MenubarMenu label="Alone"><MenuItem>One</MenuItem></MenubarMenu>);
    const b = page.getByRole('menuitem', { name: 'Alone' }).element() as HTMLElement;
    await userEvent.click(b);
    expect([b.getAttribute('aria-expanded'), focused()]).toEqual(['true', 'One']);
  });

  test('names read 4.5:1 on the bar, under the pointer and open, and the focus ring 3:1, in all six themes', async () => {
    await render(<Editor />);
    const bar = page.getByRole('menubar').element() as HTMLElement;
    top('File').focus();
    await userEvent.keyboard('{ArrowDown}');
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(bar).backgroundColor;
      expect(contrast(css(top('Edit')).color, bg), th + ' name').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(top('File')).color, css(top('File')).backgroundColor), th + ' open').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(top('Edit')).color, getComputedStyle(document.documentElement).getPropertyValue('--highlight').trim() || bg), th + ' hover').toBeGreaterThanOrEqual(4.5);
      expect(contrast(getComputedStyle(document.documentElement).getPropertyValue('--focus-ring').trim(), bg), th + ' ring').toBeGreaterThanOrEqual(3);
    }
  });
});
