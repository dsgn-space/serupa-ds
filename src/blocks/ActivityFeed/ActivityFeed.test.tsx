import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ActivityFeed, type ActivityEvent } from './ActivityFeed';

// Text read out by the shared polite announcer, wherever it lives on the page.
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const ago = (minutes: number) => Date.now() - minutes * 60_000;
const all: ActivityEvent[] = [
  { id: '1', actor: { name: 'Ana Putri' }, action: 'commented on', target: { label: 'Checkout redesign', href: '#checkout' }, date: ago(5), detail: 'Looks good on a phone.' },
  { id: '2', actor: { name: 'Budi Santoso' }, action: 'closed', target: { label: 'Login bug' }, date: ago(60), status: 'success' },
  { id: '3', actor: { name: 'Citra Dewi' }, action: 'joined the team', date: ago(120) },
  { id: '4', actor: { name: 'Dian Lestari' }, action: 'uploaded', target: { label: 'brand.pdf' }, date: ago(600) },
  { id: '5', actor: { name: 'Eko Prasetyo' }, action: 'created', target: { label: 'Q3 plan' }, date: ago(1440) },
];

function Harness({ size = 3 }: { size?: number }) {
  const [shown, setShown] = React.useState(size);
  const more = () => new Promise<void>((resolve) => { window.setTimeout(() => { setShown((n) => Math.min(n + 2, all.length)); resolve(); }, 50); });
  return <ActivityFeed events={all.slice(0, shown)} total={all.length} hasMore={shown < all.length} onLoadMore={more} />;
}

// Activity feed (BL7): a region named by its heading with the events as a list, who in words, a machine-readable
// time, and Load more that keeps focus and says how many were added.
describe('Blocks/Activity feed', () => {
  test('a named region with the events as a list: who did what to what, and when', async () => {
    await render(<Harness />);
    const feed = page.getByRole('region', { name: 'Activity' });
    await expect.element(feed).toBeVisible();
    expect(feed.getByRole('listitem').elements()).toHaveLength(3);
    const first = feed.getByRole('listitem').first().element();
    expect(first.textContent).toContain('Ana Putri commented on Checkout redesign');
    expect(first.textContent).toContain('Looks good on a phone.');
    await expect.element(feed.getByRole('link', { name: 'Checkout redesign' })).toHaveAttribute('href', '#checkout');
    expect(first.querySelector('time')!.getAttribute('datetime')).toMatch(/^\d{4}-\d\d-\d\dT/);
    expect(page.getByRole('img').elements()).toHaveLength(0);   // the avatars are decoration: the name is in the text
  });

  test('a sentence that wraps, its time and its detail all start at one edge, beside the avatar rather than under it', async () => {
    await render(<div style={{ width: '260px' }}><Harness /></div>);
    const first = page.getByRole('region', { name: 'Activity' }).getByRole('listitem').first().element();
    const name = [...first.querySelectorAll('strong')].find((s) => s.textContent === 'Ana Putri')!.getBoundingClientRect().left;
    const time = first.querySelector('time')!.getBoundingClientRect().left;
    const detail = [...first.querySelectorAll('span')].filter((s) => s.textContent === 'Looks good on a phone.').pop()!.getBoundingClientRect().left;
    expect([Math.round(time - name), Math.round(detail - name)]).toEqual([0, 0]);
  });

  test('Load more keeps focus on the button, says how many were added, and lands on the end text after the last page', async () => {
    await render(<Harness />);
    const button = page.getByRole('button', { name: 'Load more' });
    await userEvent.click(button);
    await expect.poll(() => page.getByRole('listitem').elements().length).toBe(5);
    await expect.poll(said).toMatch(/^.* more loaded\. Showing .* of .*\.$/);   // "2 more loaded. Showing 5 of 5.", in the locale's digits
    await expect.poll(() => document.activeElement?.textContent || '').toContain('reached the end');
  });

  test('no events: says so, with no Load more', async () => {
    await render(<ActivityFeed events={[]} hasMore={false} onLoadMore={() => {}} emptyText="Nothing has happened here yet" />);
    await expect.element(page.getByText('Nothing has happened here yet')).toBeVisible();
    expect(page.getByRole('button').elements()).toHaveLength(0);
  });

  test('loading: the list is busy, only the first skeleton is named, and there is no Load more until it ends', async () => {
    const screen = await render(<ActivityFeed events={[]} hasMore onLoadMore={() => {}} loading loadingCount={4} />);
    const feed = page.getByRole('region', { name: 'Activity' });
    const list = feed.getByRole('list').element();
    expect(list.getAttribute('aria-busy')).toBe('true');
    expect(feed.getByRole('listitem').elements()).toHaveLength(4);
    await expect.poll(() => feed.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading: Activity']);
    expect(page.getByRole('button').elements()).toHaveLength(0);
    expect(page.getByText('No activity yet').elements()).toHaveLength(0);   // not empty: still loading
    await screen.rerender(<ActivityFeed events={[]} hasMore onLoadMore={() => {}} title="Aktivitas" loading loadingLabel="Memuat aktivitas" />);
    await expect.poll(() => page.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Memuat aktivitas']);
    await screen.rerender(<ActivityFeed events={all.slice(0, 2)} hasMore onLoadMore={() => {}} title="Aktivitas" />);
    const loaded = page.getByRole('region', { name: 'Aktivitas' });
    expect(loaded.getByRole('list').element().hasAttribute('aria-busy')).toBe(false);
    expect(loaded.getByRole('listitem').elements()).toHaveLength(2);
    await expect.element(page.getByRole('button', { name: 'Load more' })).toBeVisible();
  });

  test('every word can be given in the page language', async () => {
    await render(<ActivityFeed events={[{ id: '1', actor: { name: 'Ana Putri' }, action: 'mengomentari', target: { label: 'Desain ulang' }, date: ago(5) }]}
      title="Aktivitas" headingLevel={3} hasMore onLoadMore={() => {}} loadMoreLabel="Muat lagi" />);
    await expect.element(page.getByRole('region', { name: 'Aktivitas' })).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 3, name: 'Aktivitas' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Muat lagi' })).toBeVisible();
  });

  test('the target can sit inside the action, for languages that put the object before the verb', async () => {
    await render(<ActivityFeed events={[{ id: '1', actor: { name: 'Ana Putri' }, action: (t) => <>hat {t} kommentiert</>, target: { label: 'Bericht 3', href: '#b3' }, date: ago(5) }]}
      hasMore={false} onLoadMore={() => {}} />);
    await expect.element(page.getByRole('link', { name: 'Bericht 3' })).toBeVisible();
    expect(page.getByRole('list').element().textContent).toContain('Ana Putri hat Bericht 3 kommentiert');
    await expect.element(page.getByRole('link', { name: 'Bericht 3' })).toHaveAttribute('href', '#b3');
  });

  test('a failed load: "Couldn’t load the activity" in its place, said once, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ActivityFeed events={[]} hasMore onLoadMore={() => {}} loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { name: 'Couldn’t load the activity' })).toBeVisible();
    expect(screen.getByRole('listitem').elements()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Load more' }).elements()).toHaveLength(0);
    await expect.element(screen.getByRole('region', { name: 'Activity' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
