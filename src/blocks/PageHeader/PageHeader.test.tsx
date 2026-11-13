import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { PageHeader, type PageHeaderProps } from './PageHeader';

const active = () => document.activeElement as HTMLElement;
const visible = (el: Element) => (el as HTMLElement).getClientRects().length > 0;
const ALL: PageHeaderProps = {
  breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'Website redesign' }],
  title: 'Website redesign',
  description: 'The new marketing site.',
  primary: { label: 'New task', onSelect: () => {} },
  secondary: [{ label: 'Share', onSelect: () => {} }, { label: 'Export', href: '/export' }],
  sections: [{ label: 'Overview', href: '/o', current: true }, { label: 'Tasks', href: '/t' }],
  sectionsLabel: 'Project',
};

// Page header (BL1): it says where the page is and what it's called, keeps its actions in reading order, and never
// hides an action on a phone: the secondary ones move into a menu.
describe('Blocks/Page header', () => {
  test('the breadcrumb ends on this page, the title is the one h1, and the current section says so', async () => {
    await render(<PageHeader {...ALL} />);
    const crumbs = document.querySelector('nav[aria-label] ol, nav[aria-label] ul')!;
    expect(crumbs.lastElementChild!.querySelector('[aria-current="page"]')?.textContent).toBe('Website redesign');
    expect([...document.querySelectorAll('h1')].map((h) => h.textContent)).toEqual(['Website redesign']);
    const sections = document.querySelector('nav[aria-label="Project"]')!;
    expect([...sections.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('aria-current')])).toEqual([['Overview', 'page'], ['Tasks', null]]);
    // Drawn as tabs (a TabNav): the current section has the tab line under it, not only a bolder weight.
    const on = sections.querySelector<HTMLElement>('[aria-current="page"]')!;
    expect([sections.getAttribute('data-component'), getComputedStyle(on, '::after').content, getComputedStyle(on).textDecorationLine]).toEqual(['tab-nav', '""', 'none']);
  });

  test('from the keyboard: the breadcrumb, then the primary action, then the others, then the sections', async () => {
    await page.viewport(1024, 768);
    await render(<PageHeader {...ALL} />);
    const order: string[] = [];
    for (let i = 0; i < 7; i++) { await userEvent.tab(); order.push(active().textContent.trim()); }
    expect(order).toEqual(['Home', 'Projects', 'New task', 'Share', 'Export', 'Overview', 'Tasks']);
  });

  test('on a phone, the secondary actions move into "More actions" and still work, and the primary stays a button', async () => {
    await page.viewport(360, 720);
    let shared = 0;
    const screen = await render(<PageHeader {...ALL} secondary={[{ label: 'Share', onSelect: () => { shared++; } }, { label: 'Export', href: '/export' }]} />);
    expect(visible(screen.getByRole('button', { name: 'New task' }).element())).toBe(true);
    expect([...document.querySelectorAll('button')].filter(visible).map((b) => b.textContent || b.getAttribute('aria-label'))).toEqual(['New task', 'More actions']);
    await screen.getByRole('button', { name: 'More actions' }).click();
    expect([...document.querySelectorAll('[role="menuitem"]')].map((m) => m.textContent)).toEqual(['Share', 'Export']);
    await screen.getByRole('menuitem', { name: 'Share' }).click();
    expect(shared).toBe(1);
    // Nothing reaches past the screen's edge.
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
  });

  test('the phone menu takes its name in the page language (GR126)', async () => {
    await page.viewport(360, 720);
    const screen = await render(<PageHeader {...ALL} moreLabel="Weitere Aktionen" />);
    await expect.element(screen.getByRole('button', { name: 'Weitere Aktionen' })).toBeVisible();
  });

  test('a disabled action says so and does nothing, and an icon shows before its label', async () => {
    await page.viewport(1024, 768);
    let ran = 0;
    const screen = await render(<PageHeader title="Inbox" primary={{ label: 'Mark all as read', disabled: true, onSelect: () => { ran++; } }}
      secondary={[{ label: 'Settings', icon: 'settings', href: '/settings', disabled: true }]} />);
    await expect.element(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Settings' })).toBeDisabled();
    await expect.poll(() => screen.getByRole('button', { name: 'Settings' }).element().querySelector('svg')).not.toBeNull();
    expect(ran).toBe(0);
  });

  test('on a phone, a disabled secondary action is still listed but can\'t be chosen', async () => {
    await page.viewport(360, 720);
    const screen = await render(<PageHeader title="Inbox" secondary={[{ label: 'Export', icon: 'download', href: '/export', disabled: true }]} />);
    await screen.getByRole('button', { name: 'More actions' }).click();
    const item = screen.getByRole('menuitem', { name: 'Export' }).element();
    expect([item.getAttribute('aria-disabled'), item.getAttribute('href')]).toEqual(['true', null]);
  });

  test('with headingRef, the h1 can take focus from a script, for a page that moves focus to its title', async () => {
    function Page() {
      const ref = React.useRef<HTMLHeadingElement>(null);
      return <><PageHeader title="Inbox" headingRef={ref} /><button type="button" onClick={() => ref.current?.focus()}>Done</button></>;
    }
    const screen = await render(<Page />);
    await screen.getByRole('button', { name: 'Done' }).click();
    expect([active().tagName, active().textContent]).toEqual(['H1', 'Inbox']);
    // Out of the Tab order: only a script moves focus there.
    expect(document.querySelector('h1')!.getAttribute('tabindex')).toBe('-1');
  });

  test('with only a title, it shows only the h1: no empty breadcrumb, actions or nav', async () => {
    await render(<PageHeader title="Projects" />);
    expect([document.querySelectorAll('h1').length, document.querySelectorAll('nav, button, a').length]).toEqual([1, 0]);
  });
});
