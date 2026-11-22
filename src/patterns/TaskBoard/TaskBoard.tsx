'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Alert } from '../../components/Alert/Alert';
import { Toaster, toast } from '../../components/Toast/Toast';
import { Kanban, type KanbanColumn, type KanbanMove } from '../../components/Kanban/Kanban';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Task board: a team's tasks in columns, moved between stages and saved as they move, with a way to add one. For an
   app to copy. What it carries (WCAG 2.2):
   - 2.5.7, 2.1.1: Kanban moves a card by dragging its handle, by keyboard, or from its "Move to…" menu, so no move
     needs a drag.
   - 4.1.3: Kanban says each move as it happens. A move that can't be saved puts the card back where it was and says
     so in a toast that names the card and the column, so nobody is left looking at a board that isn't true.
   - 1.4.1, 3.3.1: a column over its limit says "Over limit" in words (Kanban), and a line above the board says which
     column and what to do about it.
   - 3.3.2, 3.3.1: a new task needs only a title; a missing one is said next to the field, which gets focus. An add
     that fails says so in the dialog, which stays open with what was typed.
   - 2.4.3: after an add, focus goes back to New task, and a toast says where the task went.
   - 4.1.3, 3.3.1: while the tasks load, each column shows placeholder cards, named once; a failed load says so, with
     Try again.
   Saving is the app's job: onMove gets each move and onAdd each new task; reject their promises when saving fails. */

export interface BoardTask {
  id: string;
  /** Short and unlike the others: it's read on the card's buttons and in every move. */
  title: string;
  /** Who has it: "Ana Lima". */
  assignee?: string | undefined;
  /** A word for its kind: "Bug". */
  tag?: string | undefined;
}
export type BoardColumn = KanbanColumn<BoardTask>;
export interface BoardTaskDraft {
  title: string;
  /** The id of the column it starts in. */
  column: string;
}

export interface TaskBoardProps {
  /** The board's name: the page's h1. Default: "Sprint 42". */
  title?: string | undefined;
  /** The columns and their tasks, in order. Default: a demo sprint. */
  columns?: readonly BoardColumn[] | undefined;
  /** A card was dropped somewhere new. Return its promise: a rejection puts the card back and says so. */
  onMove?: ((move: KanbanMove<BoardTask>) => unknown) | undefined;
  /** A task was added. Return its id, or a promise of it: a rejection keeps the dialog open and says so. */
  onAdd?: ((draft: BoardTaskDraft) => unknown) | undefined;
  /** The tasks are on their way: placeholder cards in each column, named once ("Loading tasks"). Default: false. */
  loading?: boolean | undefined;
  /** The tasks failed to load: a message with Try again, which calls onRetry, in the board's place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the tasks again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: BoardColumn[] = [
  { id: 'todo', title: 'To do', items: [
    { id: 't1', title: 'Fix login on Safari', assignee: 'Budi Santoso', tag: 'Bug' },
    { id: 't2', title: 'Write the release notes', assignee: 'Ana Lima' },
    { id: 't3', title: 'Translate checkout into Indonesian' },
  ] },
  { id: 'doing', title: 'In progress', limit: 2, items: [
    { id: 't4', title: 'Dark mode for charts', assignee: 'Ana Lima' },
    { id: 't5', title: 'Invoice PDF export', assignee: 'Chen Wei' },
  ] },
  { id: 'review', title: 'In review', limit: 3, items: [{ id: 't6', title: 'Cart summary block', assignee: 'Budi Santoso' }] },
  { id: 'done', title: 'Done', items: [{ id: 't7', title: 'Audit form labels', assignee: 'Chen Wei' }] },
];

/** "1 task" or "3 tasks": English's rule, since the words are English; an app translating them uses its own. */
export const countTasks = (n: number, locale = 'en-US'): string => (n === 1 ? '1 task' : `${formatNumber(n, locale)} tasks`);

/** The columns with a moved card back where it came from, wherever it is now. */
export function putBack(columns: readonly BoardColumn[], move: KanbanMove<BoardTask>): BoardColumn[] {
  return columns.map((c) => {
    const items = c.items.filter((t) => t.id !== move.item.id);
    if (c.id === move.from.column) items.splice(Math.min(move.from.index, items.length), 0, move.item);
    return { ...c, items };
  });
}

/** The columns holding more than their limit, each as a sentence: "In progress has 3 tasks, over its limit of 2." */
export function overLimit(columns: readonly BoardColumn[], locale = 'en-US'): string[] {
  return columns.filter((c) => c.limit != null && c.items.length > c.limit).map((c) => `${c.title} has ${countTasks(c.items.length, locale)}, over its limit of ${formatNumber(c.limit!, locale)}.`);
}

/** The task board: a skip link, a header, then main with the board's h1, New task and the columns. */
export function TaskBoard({ title = 'Sprint 42', columns: start = demo, onMove, onAdd, loading = false, loadFailed = false, onRetry, online }: TaskBoardProps) {
  const locale = useLocale();
  const [columns, setColumns] = React.useState<readonly BoardColumn[]>(start);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) setColumns(start); }
  const total = columns.reduce((n, c) => n + c.items.length, 0);
  const over = overLimit(columns);

  // A move shows at once and is saved after. One that can't be saved goes back, and says so.
  const move = (next: KanbanColumn<BoardTask>[], m: KanbanMove<BoardTask>) => {
    setColumns(next);
    void Promise.resolve().then(() => onMove?.(m)).catch(() => {
      setColumns((now) => putBack(now, m));
      const from = columns.find((c) => c.id === m.from.column)?.title ?? '';
      toast({ title: `Couldn’t move “${m.item.title}”`, description: `It’s back in ${from}. Try again.`, tone: 'danger' });
    });
  };

  // Adding: a dialog with a title and the column to start in.
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState<BoardTaskDraft>({ title: '', column: start[0]?.id ?? '' });
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const [addFailed, setAddFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const made = React.useRef(0);
  const ask = (open: boolean) => {
    if (open) { setDraft({ title: '', column: columns[0]?.id ?? '' }); setTitleError(null); setAddFailed(false); }
    setAdding(open);
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const kept = draft.title.trim();
    if (!kept) { setTitleError('Enter a title for the task.'); document.getElementById('task-title')?.focus(); return; }
    const sent = { title: kept, column: draft.column };
    setAddFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onAdd?.(sent)).then((id) => {
      const task: BoardTask = { id: typeof id === 'string' && id ? id : `new-${++made.current}`, title: kept };
      setColumns((now) => now.map((c) => (c.id === sent.column ? { ...c, items: [...c.items, task] } : c)));
      setAdding(false);
      toast({ title: `Added “${kept}” to ${columns.find((c) => c.id === sent.column)?.title ?? ''}`, tone: 'success' });
    }, () => setAddFailed(true)).finally(() => setBusy(false));
  };

  const card = (t: BoardTask) => (
    <div className="flex flex-col items-start gap-1">
      <span>{t.title}</span>
      {t.assignee || t.tag ? (
        <span className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {t.tag ? <Badge tone={t.tag === 'Bug' ? 'danger' : 'info'}>{t.tag}</Badge> : null}
          {t.assignee}
        </span>
      ) : null}
    </div>
  );
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-6xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">This is the board as it was when the page loaded. Moving or adding cards needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Boards', href: '#boards' }, { label: title }]} title={title}
          description={loading || loadFailed ? undefined : countTasks(total, locale)}
          primary={{ label: 'New task', icon: 'add', onSelect: () => ask(true), disabled: loading || loadFailed }} />

        <div className="flex flex-col gap-4 pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the board" onRetry={() => onRetry?.()} headingLevel={2} /> : <>
            {!loading && over.length ? (
              <Alert tone="warning" role="status" title={over.join(' ')}>Finish or move a task before starting another.</Alert>
            ) : null}
            <Kanban aria-label={title} headingLevel={2} loading={loading} loadingLabel="Loading tasks"
              columns={loading ? columns.map((c) => ({ ...c, items: [] })) : columns}
              getKey={(t) => t.id} getLabel={(t) => t.title} renderCard={card} onMove={move} />
          </>}
        </div>

        <Dialog open={adding} onOpenChange={ask} title="New task">
          <form onSubmit={add} noValidate className="flex flex-col gap-4">
            {addFailed ? <Alert tone="danger">Couldn’t add the task. Try again.</Alert> : null}
            <Field label="Title" id="task-title" hint="A few words that say what’s to be done." error={titleError ?? undefined} required>
              <Input name="title" value={draft.title} autoComplete="off" onChange={(e) => { setDraft({ ...draft, title: e.target.value }); if (titleError) setTitleError(null); }} />
            </Field>
            <Field label="Column" id="task-column">
              <Select value={draft.column} options={columns.map((c) => ({ value: c.id, label: c.title }))} onChange={(e) => setDraft({ ...draft, column: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={busy}>Add task</Button>
              <Button variant="outline" onClick={() => ask(false)}>Cancel</Button>
            </div>
          </form>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
