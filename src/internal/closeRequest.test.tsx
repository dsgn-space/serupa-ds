import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Button } from '../components/Button/Button';
import { Dialog } from '../components/Dialog/Dialog';
import { Menu, MenuItem } from '../components/Menu/Menu';
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
});
