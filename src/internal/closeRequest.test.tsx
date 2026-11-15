import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Button } from '../components/Button/Button';
import { Dialog } from '../components/Dialog/Dialog';
import { Drawer } from '../components/Drawer/Drawer';
import { Menu, MenuItem } from '../components/Menu/Menu';
import { Navbar, NavbarLink, NavbarMenu, NavbarMenuLink } from '../components/Navbar/Navbar';
import { Popover } from '../components/Popover/Popover';

// The system's close request: Android's Back gesture or button, and Escape pressed anywhere on the page. A modal
// Dialog gets it from the browser; the Menus, Popovers and pickers open as popovers, which didn't, so Back left the
// page with a Menu open. Now the innermost open layer closes first, as Escape inside it would, and focus goes back
// to its trigger. A real Escape with focus outside the layer stands in for Back: Chromium sends both the same way.
const blur = () => { (document.activeElement as HTMLElement | null)?.blur(); };

describe('the close request (Back on a phone)', () => {
  test('closes an open Menu, and focus goes back to its button', async () => {
    await render(<Menu trigger={<Button>Actions</Button>}><MenuItem>Edit</MenuItem></Menu>);
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    blur();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu', { includeHidden: true })).not.toBeVisible();
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Actions' }).element());
  });

  test('closes an open Popover', async () => {
    await render(<Popover trigger={<Button>Details</Button>} title="Shipping">Ships in two days.</Popover>);
    await page.getByRole('button', { name: 'Details' }).click();
    const panel = page.getByRole('dialog', { name: 'Shipping' });
    await expect.element(panel).toBeVisible();
    const el = panel.element();
    blur();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => el.checkVisibility()).toBe(false);
  });

  test('in a Dialog, closes the Menu first and leaves the Dialog open', async () => {
    await render(<Dialog defaultOpen title="Edit file"><Menu trigger={<Button>More</Button>}><MenuItem>Rename</MenuItem></Menu></Dialog>);
    await page.getByRole('button', { name: 'More' }).click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    (page.getByRole('dialog', { name: 'Edit file' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu', { includeHidden: true })).not.toBeVisible();
    await expect.element(page.getByRole('dialog', { name: 'Edit file' })).toBeVisible();
  });

  // Panels shown in place, not as a popover or a modal <dialog>: the browser sends them nothing of its own.
  const narrow = async () => { await page.viewport(375, 700); await expect.poll(() => window.innerWidth).toBe(375); };
  const expanded = (name: string) => page.getByRole('button', { name }).element().getAttribute('aria-expanded');

  test("closes the Navbar's small-screen menu, and focus goes back to its button", async () => {
    await narrow();
    await render(<Navbar brand="Docs"><NavbarLink href="#a">Guides</NavbarLink></Navbar>);
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect.element(page.getByRole('link', { name: 'Guides' })).toBeVisible();
    blur();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => expanded('Menu')).toBe('false');
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Menu' }).element());
  });

  test('in the small-screen menu, closes an open NavbarMenu panel first and leaves the menu open', async () => {
    await narrow();
    await render(<Navbar brand="Docs"><NavbarMenu label="Products"><NavbarMenuLink href="#billing">Billing</NavbarMenuLink></NavbarMenu></Navbar>);
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Products' }).click();
    await expect.element(page.getByRole('link', { name: 'Billing' })).toBeVisible();
    blur();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => expanded('Products')).toBe('false');
    expect([expanded('Menu'), document.activeElement]).toEqual(['true', page.getByRole('button', { name: 'Products' }).element()]);
  });

  // A non-modal Drawer is a side panel beside a usable page: Escape on the page leaves it open (Drawer.test.tsx),
  // so Escape can't stand in for Back here. A stand-in CloseWatcher takes the request instead, as Android sends it.
  test('asks to close a non-modal Drawer (reason "escape")', async () => {
    const real: unknown = Reflect.get(window, 'CloseWatcher');
    const live: { onclose: (() => void) | null }[] = [];
    class Fake { onclose: (() => void) | null = null; constructor() { live.push(this); } destroy() { live.splice(live.indexOf(this), 1); } }
    Reflect.set(window, 'CloseWatcher', Fake);
    try {
      const why: string[] = [];
      function Side() {
        const [open, setOpen] = React.useState(false);
        return <><Button onClick={() => setOpen(true)}>Details</Button>
          <Drawer modal={false} open={open} onOpenChange={(v, d) => { why.push(d.reason); setOpen(v); }} title="Order 1042">Shipped.</Drawer></>;
      }
      await render(<Side />);
      await page.getByRole('button', { name: 'Details' }).click();
      const d = page.getByRole('dialog', { name: 'Order 1042' }).element() as HTMLDialogElement;
      await expect.poll(() => d.open).toBe(true);
      await expect.poll(() => live.length).toBe(1);
      const w = live[live.length - 1];
      if (w && w.onclose) w.onclose();
      await expect.poll(() => d.open).toBe(false);
      expect([why, live.length]).toEqual([['escape'], 0]);
    } finally { Reflect.set(window, 'CloseWatcher', real); }
  });
});
