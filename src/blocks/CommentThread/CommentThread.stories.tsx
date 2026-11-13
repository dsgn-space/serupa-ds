import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { Toaster } from '../../components/Toast/Toast';
import { CommentThread, type ThreadComment } from './CommentThread';
import type { MentionOption } from '../../components/MentionInput/MentionInput';
import { useContent, useNameMap } from '../../../.storybook/content';

/* Comment thread (BL8): comments, a reply box, and edit and delete for your own, as a block an app copies.
   CommentThread.mdx says what each part is for. The stories put it on a small page (a skip link, main and an h1),
   with a Toaster for Delete's Undo. Times are minutes before now, so they read the same whenever the story is drawn. */
const ago = (minutes: number) => Date.now() - minutes * 60_000;
const comments: ThreadComment[] = [
  { id: '1', author: { name: 'Ana Putri' }, body: 'The total is easy to miss on a phone. Can we make it bigger?', date: ago(95) },
  { id: '2', author: { name: 'You' }, body: 'Good catch. I’ll try 20px and bold.', date: ago(80), mine: true, edited: true },
  { id: '3', author: { name: 'Budi Santoso' }, body: 'Checked it on an old Android phone too: it fits on one line.', date: ago(12) },
];

// The other people follow Storybook's Content menu (.storybook/content.ts), and a change of menu starts the thread again.
function Live({ initial, people }: { initial: readonly ThreadComment[]; people?: readonly MentionOption[] }) {
  return <Thread key={useContent()} initial={initial} people={people} />;
}
/** Keeps the comments in state, so replying, editing and deleting work in the story. */
function Thread({ initial, people }: { initial: readonly ThreadComment[]; people?: readonly MentionOption[] | undefined }) {
  const as = useNameMap(initial.filter((c) => !c.mine).map((c) => c.author.name));
  const [list, setList] = React.useState(() => initial.map((c) => (c.mine ? c : { ...c, author: { ...c.author, name: as(c.author.name) } })));
  const wait = () => new Promise((resolve) => { window.setTimeout(resolve, 600); });
  return <>
    <CommentThread comments={list} maxLength={500} people={people}
      onReply={(body) => wait().then(() => setList((c) => [...c, { id: String(Date.now()), author: { name: 'You' }, body, date: Date.now(), mine: true }]))}
      onEdit={(id, body) => setList((c) => c.map((x) => (x.id === id ? { ...x, body, edited: true } : x)))}
      onDelete={(id) => setList((c) => c.filter((x) => x.id !== id))} />
    <Toaster />
  </>;
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>Checkout redesign</Heading><Card padding="lg">{children}</Card></main></div>;
}

const meta = {
  title: 'Blocks/Comment thread',
  component: CommentThread,
  parameters: { layout: 'fullscreen' },
  args: { comments, onReply: () => {} },
} satisfies Meta<typeof CommentThread>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three comments, one of them yours with Edit and Delete, and the reply box with its limit and count. */
export const Default: Story = { render: () => <Page><Live initial={comments} /></Page> };

/** No comments yet: an invitation, and the reply box. */
export const Empty: Story = { render: () => <Page><Live initial={[]} /></Page> };

const team: MentionOption[] = [
  { id: 'ana', label: 'Ana Putri', description: 'Design' },
  { id: 'budi', label: 'Budi Santoso', description: 'Engineering' },
  { id: 'citra', label: 'Citra Dewi', description: 'Product' },
];
/** While the comments load: skeleton comments, named once for screen readers, with the reply box already there. */
export const Loading: Story = { render: () => <Page><CommentThread comments={[]} onReply={() => {}} loading /></Page> };

/** With people: type "@" in the reply box to mention someone; mentions in comments are bold, and onReply gets who to notify. */
export const WithMentions: Story = {
  name: 'With mentions',
  render: () => <Page><Live people={team} initial={[comments[0], { ...comments[1], body: 'Good catch, @Ana Putri. I’ll try 20px and bold.' }, comments[2]]} /></Page>,
};
