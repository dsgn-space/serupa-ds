# Kanban

A board of columns of cards, such as a sprint or a sales pipeline, that people move by dragging a handle, by keyboard, or from each card's "Move to…" menu. Each move is said out loud, and nothing changes until the card is dropped.

```tsx
import { Kanban, type KanbanColumn } from "serupa-ds";

interface Task { id: string; title: string }

const [columns, setColumns] = useState<KanbanColumn<Task>[]>([
  { id: "todo", title: "To do", items: tasks.todo },
  { id: "doing", title: "In progress", limit: 3, items: tasks.doing },
  { id: "done", title: "Done", items: tasks.done },
]);

<Kanban aria-label="Sprint 42" columns={columns} getKey={(t) => t.id} getLabel={(t) => t.title}
  renderCard={(t) => <TaskCard task={t} />} onMove={(next, move) => { setColumns(next); save(move); }} />
```

## When to use

- Work that moves through stages, where people see every stage at once and move items between them: tasks, tickets, leads, hiring.
- A column that should hold only a few items at a time (a work-in-progress limit).

## When not to use

- Reordering one list: use [SortableList](../SortableList/README.md).
- Many items with many fields to compare or sort: a [Table](../Table/README.md) with a status column reads better, and a status [Select](../Select/README.md) per row moves them.
- Stages in a fixed order that one item passes through: use a [Stepper](../Stepper/README.md) or [Timeline](../Timeline/README.md).

## Anatomy

Drawn from the `Default` story.

1. **Column** (`.dk-kanban__column`): one stage, a `section` named by its heading.
2. **Title** (`.dk-kanban__title`): the stage's name.
3. **Count** (`.dk-kanban__count`): how many cards, with the limit when there is one, and "Over limit" past it.
4. **Card** (`.dk-kanban__card`): one item: its handle, your content and its menu.
5. **Handle** (`.dk-kanban__handle`): picks the card up, by pointer or keyboard.
6. **Move to…** (`.dk-kanban__menu`): moves the card to another column without dragging.

## Usage

- `columns` is controlled: apply the new columns from `onMove`, which also gives the move (`item`, `from` and `to`, each a column id and index) for saving.
- `getLabel` names each card in words; it's read on its buttons and in every announcement, so keep it short and unique on the board ("Fix login", not "Task").
- `renderCard` draws what's on the card. Put links and buttons there as you like; the handle and the menu are Kanban's. Each card redraws only when its item, place or `renderCard` changes, so on a big board define `renderCard` outside the component or in a `useCallback`: a new function every render redraws every card.
- `limit` warns, it doesn't block: a column past its limit says "Over limit", and cards can still move in. Refuse a move in `onMove` if your process needs that.
- Name the board with `aria-label` ("Sprint 42"). Set `headingLevel` to fit the page's outline (3 by default).

## Behavior

- **Pointer:** press the handle and move; the card follows the pointer, the column it would land in is outlined, and the other cards make room. Near the board's edge the board scrolls sideways, and near a column's top or bottom the column scrolls. Let go to drop, or let the drag be cancelled (a pointer cancel) to put it back.
- **Keyboard:** Tab to a handle, Space or Enter picks the card up. Up and Down move it within its column, Left and Right to the column before or after in reading order (mirrored right to left), Home and End to the top and bottom. Space or Enter drops it; Escape, Tab or a click elsewhere puts it back. Focus stays on the card's handle as it moves.
- **Move to…:** each card's menu lists the other columns; picking one puts the card at the end of that column and keeps focus on it. It's the way to move a card with one tap or click (WCAG 2.5.7).
- A narrow board scrolls sideways in its own box, so the page doesn't.

### Loading and failed

- **Loading:** set `busy` and pass the columns you know with no cards yet. Each column keeps its title and shows two placeholder cards with no count, and the board is `aria-busy`, so nothing below it moves when the cards arrive. Name the wait in `loadingLabel` ("Loading tasks"): a screen reader hears it once, after the loader's delay, so a quick load says nothing. When you refresh cards already shown, keep them in and set `busy`: they stay until the new ones arrive.
- **Failed:** in place of the board, a danger [Alert](../Alert/README.md) that says what didn't load and offers Retry in `actions`. It's `role="alert"`, so the failure is heard as it appears. On Retry, go back to loading.

```tsx
type Task = { id: string; title: string };
{state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={load}>Retry</Button>}>The board didn't load.</Alert>
  : <Kanban aria-label="Sprint 42" columns={state === 'loading' ? STAGES : columns} busy={state === 'loading'} loadingLabel="Loading tasks"
      getKey={(t: Task) => t.id} getLabel={(t: Task) => t.title} renderCard={(t: Task) => t.title} onMove={setColumns} />}
```

### Do and don't

- **Do:** Give each card a short, unique name with `getLabel` ("Fix login"): it's read on its buttons and in every announcement. (`DoNameCards`)
- **Don't:** Give cards the same name ("Task"): screen reader users can't tell which one moved. (`DontVagueCards`)

## Accessibility

- **Roles and names:** the board is a `group` named by `aria-label`; each column a `section` (a region) named by its heading, with its cards in a list named the same way.
- **Handle:** a button named "Move Fix login", described by the keyboard instructions, and `aria-pressed` while the card is picked up.
- **Announcements:** each step is said politely: "Picked up Fix login. To do, position 1 of 3.", "Fix login, Done, position 2 of 5.", "Fix login moved to Done, position 2 of 5.", and "Canceled. Fix login is back in To do, position 1 of 3."
- **Without dragging:** the keyboard and the "Move to…" menu both move a card without a drag (WCAG 2.5.7), and the menu also works with a screen reader's virtual cursor.
- **Over limit:** said in words with a warning icon, not by colour alone (WCAG 1.4.1).
- **Contrast:** titles, counts, "Over limit" and card text read 4.5:1, and the handle 3:1, in all six themes (`Kanban.test.tsx`).
- **What's still yours:** the content of each card, and saying so if a move fails to save.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To each card's handle and its "Move to…" menu button |
| Space, Enter (on a handle) | Picks the card up; again, drops it where it is |
| ↑ ↓ | Moves the picked-up card within its column |
| ← → | Moves it to the column before or after (mirrored right to left) |
| Home, End | To the top or bottom of its column |
| Escape, Tab | Puts it back where it was |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `KanbanColumn<T>[]` | | Required. `{ id, title, items, limit? }` for each column, in order. |
| `getKey` | `(item: T) => string \| number` | | Required. A stable key for each card. |
| `getLabel` | `(item: T) => string` | | Required. The card's name in words. |
| `renderCard` | `(item: T, state) => ReactNode` | | Required. What the card shows; `state` has `column`, `index` and `dragging`. |
| `onMove` | `(columns, move) => void` | | Required. The new columns and the move, when a card is dropped somewhere new. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | The column headings' level. |
| `disabled` | `boolean` | `false` | Shows the cards without handles or menus. |
| `busy` | `boolean` | `false` | Its cards are loading: sets `aria-busy`, and while no column has cards yet, each shows two placeholder cards and no count. |
| `loadingLabel` | `string` | `"Loading…"` | Said once as the placeholder cards appear. |

`id`, `className`, `ref` and other props go to the board's `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Kanban. The list lives in `src/components/Kanban/kanban.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from kanban.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--kanban-text` | `text` | Titles and card text (4.5:1 on the column and the card). |
| `--kanban-muted` | `text-muted` | Counts, handles and the empty column's words (4.5:1 on the column). |
| `--kanban-column-bg` | `surface-muted` | A column's background. |
| `--kanban-card-bg` | `surface` | A card's background. |
| `--kanban-card-border` | `border` | A card's outline. |
| `--kanban-target-border` | `primary` | The outline of the column a moving card would land in (3:1). |
| `--kanban-over` | `danger-text` | A count over its column's limit (4.5:1 on the column). |
| `--kanban-handle-active` | `primary-subtle` | A picked-up card's handle. |
| `--kanban-focus-ring` | `focus-ring` | The ring around a focused handle. |
| `--kanban-column-radius` | `radius-surface` | A column's corners (8px). |
| `--kanban-card-radius` | `radius-control` | A card's corners (6px). |
| `--kanban-card-shadow` | `elevation-overlay` | The card being dragged. |
| `--kanban-gap` | `spacing-3` | Space between columns (12px). |
| `--kanban-padding` | `spacing-3` | Space inside a column (12px). |
| `--kanban-card-padding` | `spacing-2` | Space inside a card (8px). |
| `--kanban-column-width` | `spacing-72` | A column's width (288px). |
<!-- token-table:end -->
