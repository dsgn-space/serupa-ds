import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { ActivityFeed, type ActivityEvent } from './ActivityFeed';
import { useNameMap } from '../../../.storybook/content';

/* Activity feed (BL7): who did what and when, as a block an app copies. ActivityFeed.mdx says what each part is for.
   The stories put it on a small page (a skip link, main and an h1). Times are minutes before now, so they read the
   same whenever the story is drawn. */
const ago = (minutes: number) => Date.now() - minutes * 60_000;
const events: ActivityEvent[] = [
  { id: '1', actor: { name: 'Ana Putri' }, action: 'commented on', target: { label: 'Checkout redesign', href: '#checkout' }, date: ago(5), detail: '“Looks good on a phone. Can we make the total bigger?”' },
  { id: '2', actor: { name: 'Budi Santoso' }, action: 'closed', target: { label: 'Login fails on Safari', href: '#login' }, date: ago(48), status: 'success' },
  { id: '3', actor: { name: 'Citra Dewi' }, action: 'joined the team', date: ago(180), status: 'primary' },
  { id: '4', actor: { name: 'Dian Lestari' }, action: 'uploaded', target: { label: 'brand-guide.pdf', href: '#brand' }, date: ago(600) },
  { id: '5', actor: { name: 'Eko Prasetyo' }, action: 'reopened', target: { label: 'Slow search', href: '#search' }, date: ago(1500), status: 'warning' },
  { id: '6', actor: { name: 'Fajar Nugroho' }, action: 'created', target: { label: 'Q3 plan', href: '#plan' }, date: ago(2900) },
];

function Page({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>Checkout redesign</Heading><Card padding="lg">{children}</Card></main></div>;
}

/** Loads two more events per press, after a short wait. */
// The people follow Storybook's Content menu (.storybook/content.ts): the worst case's long and right-to-left names.
function Paged({ size }: { size: number }) {
  const as = useNameMap(events.map((e) => e.actor.name));
  const named = events.map((e) => ({ ...e, actor: { ...e.actor, name: as(e.actor.name) } }));
  const [shown, setShown] = React.useState(size);
  const more = () => new Promise<void>((resolve) => { window.setTimeout(() => { setShown((n) => Math.min(n + 2, events.length)); resolve(); }, 600); });
  return <ActivityFeed events={named.slice(0, shown)} total={events.length} hasMore={shown < events.length} onLoadMore={more} />;
}

const meta = {
  title: 'Blocks/Activity feed',
  component: ActivityFeed,
  parameters: { layout: 'fullscreen' },
  args: { events, hasMore: true, onLoadMore: () => {} },
} satisfies Meta<typeof ActivityFeed>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The newest events first. Load more adds two at a time: focus stays on the button, and how many were added is said. */
export const Default: Story = { render: () => <Page><Paged size={4} /></Page> };

/** After the last page: the button gives way to the end text. */
export const AllLoaded: Story = { render: () => <Page><Paged size={6} /></Page> };

/** While the first page loads: skeleton rows under the heading, named once for screen readers. */
export const Loading: Story = { render: () => <Page><ActivityFeed events={[]} hasMore={false} onLoadMore={() => {}} loading /></Page> };

/** Nothing has happened yet. */
export const Empty: Story = { render: () => <Page><ActivityFeed events={[]} hasMore={false} onLoadMore={() => {}} emptyText="Nothing has happened here yet. Changes and comments will show up here." /></Page> };
