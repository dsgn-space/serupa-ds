import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kanban, type KanbanColumn } from './Kanban';
import { Badge } from '../Badge/Badge';
import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';

type Task = { id: string; title: string; tag?: string };
const BOARD: KanbanColumn<Task>[] = [
  { id: 'todo', title: 'To do', items: [{ id: 't1', title: 'Fix login on Safari', tag: 'Bug' }, { id: 't2', title: 'Write the release notes' }, { id: 't3', title: 'Translate checkout into Indonesian' }] },
  { id: 'doing', title: 'In progress', limit: 2, items: [{ id: 't4', title: 'Dark mode for charts' }, { id: 't5', title: 'Invoice PDF export', tag: 'Feature' }, { id: 't6', title: 'Audit form labels' }] },
  { id: 'review', title: 'In review', limit: 3, items: [{ id: 't7', title: 'Cart summary block' }] },
  { id: 'done', title: 'Done', items: [] },
];

const Card = (t: Task) => <div className="flex flex-col items-start gap-1"><span>{t.title}</span>{t.tag ? <Badge tone={t.tag === 'Bug' ? 'danger' : 'info'}>{t.tag}</Badge> : null}</div>;
function Board(props: { columns?: KanbanColumn<Task>[]; disabled?: boolean; width?: number }) {
  const [cols, setCols] = React.useState(props.columns || BOARD);
  return <div style={{ maxWidth: props.width }}><Kanban aria-label="Sprint 42" columns={cols} getKey={(t) => t.id} getLabel={(t) => t.title} renderCard={Card} onMove={setCols} disabled={props.disabled} /></div>;
}

const meta = {
  title: 'Components/Content/Kanban',
  component: Kanban,
  args: { 'aria-label': 'Sprint 42', columns: BOARD, getKey: (t: unknown) => (t as Task).id, getLabel: (t: unknown) => (t as Task).title, renderCard: (t: unknown) => Card(t as Task), onMove: () => {} },
} satisfies Meta<typeof Kanban>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { render: () => <Board /> };
// "In progress" is over its limit of 2: the count says so in words, not only in red.
export const Default: Story = { render: () => <Board /> };
// Narrower than the board: it scrolls sideways in its own box.
export const Narrow: Story = { render: () => <Board width={420} /> };
export const Disabled: Story = { render: () => <Board disabled /> };
export const HeadingLevel: Story = { name: 'Heading level', render: () => <Kanban aria-label="Board" headingLevel={2} columns={BOARD.slice(0, 2)} getKey={(t) => t.id} getLabel={(t) => t.title} renderCard={Card} onMove={() => {}} /> };
// The stress story (G14): long titles and words, many cards in a column.
export const LongText: Story = {
  render: () => <Board columns={[
    { id: 'a', title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', items: [{ id: 'l1', title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung 🎉 and a title long enough to wrap twice' }] },
    { id: 'b', title: 'Many', limit: 4, items: Array.from({ length: 12 }, (_, i) => ({ id: 'm' + i, title: 'Card ' + (i + 1) })) },
  ]} />,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a short, unique name for each card, which is read on its buttons and in every announcement. */
export const DoNameCards: Story = { name: 'Do: name each card', render: () => <Board /> };
/** Don't: cards all called "Task", which screen readers can't tell apart as they move. */
export const DontVagueCards: Story = {
  name: "Don't: give cards the same name",
  render: () => <Board columns={[
    { id: 'todo', title: 'To do', items: [{ id: 'v1', title: 'Task' }, { id: 'v2', title: 'Task' }] },
    { id: 'doing', title: 'In progress', items: [{ id: 'v3', title: 'Task' }] },
    { id: 'done', title: 'Done', items: [] },
  ]} />,
};

// Loading and failed: the columns keep their titles with placeholder cards and no counts, and a failure offers Retry.
function States() {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'failed'>('loading');
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['loading', 'loaded', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      {state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>The board didn't load. Check your connection and try again.</Alert>
        : state === 'loaded' ? <Board />
        : <Kanban aria-label="Sprint 42" loading="Loading tasks" columns={BOARD.map((c) => ({ ...c, items: [] }))} getKey={(t) => t.id} getLabel={(t) => t.title} renderCard={Card} onMove={() => {}} />}
    </div>
  );
}
/** Loading: each column's title and two placeholder cards, with no count. Failed: an Alert with Retry. */
export const LoadingAndErrors: Story = { name: 'Loading and failed', render: () => <States /> };
