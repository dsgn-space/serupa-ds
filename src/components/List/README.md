# List

Rows of related things: people, files, notifications, settings. Each row has a title, an optional muted description, something before it (an Avatar or an icon) and something after it (a date, a Badge, an action). A row can be a link or a button; trailing actions stay outside it, so controls are never nested. A press anywhere on the row works, trailing meta ("3 days ago") included, except on a trailing action, which keeps its own press.

```jsx
const { List, ListItem, Avatar, Badge, IconButton } = window.Serupa;

<List variant="card" aria-label="Members">
  {people.map((p) => (
    <ListItem key={p.id} href={`/people/${p.id}`}
      leading={<Avatar name={p.name} src={p.photo} alt="" size="sm" />}
      title={p.name} description={p.email}
      trailing={<IconButton icon="more_horiz" label={`More for ${p.name}`} />} />
  ))}
</List>

<List>
  <ListItem leading="description" title="Report.pdf" description="2 MB" trailing="Yesterday" />
  <ListItem leading="settings" title="Open settings" onClick={openSettings} />
</List>
```

## When to use

- A set of similar things people scan and pick from: people, files, notifications, settings.
- Rows that each open something or do one thing, with an action of their own at the end.
- A list beside a detail view, where the selected row shows what's open.

## When not to use

- Data with several columns to compare or sort: use [Table](../Table/README.md) instead.
- Items with pictures or a lot of content each: use [Card](../Card/README.md)s in a [Grid](../Grid/README.md).
- Actions behind a button: use [Menu](../Menu/README.md) instead.
- An app's main navigation: use [Sidebar](../Sidebar/README.md) instead.

## Anatomy

Drawn from the `Settings` story.

1. **Item** (`.dk-list__item`): one row.
2. **Leading** (`.dk-list__leading`): an optional icon, avatar or image before the text.
3. **Title** (`.dk-list__title`): the row's main line.
4. **Description** (`.dk-list__description`): a second line with more detail.
5. **Trailing** (`.dk-list__trailing`): an optional value, badge, switch or action at the end.

## Usage

- Put actions in `trailing`, never inside the row's link or button, and name them for their row ("More for Ada Lovelace").
- Use `as="ol"` when the order matters.
- Use `variant="card"` for a list that stands on its own; inside a Card or a panel that already has a frame, keep it `plain`.
- With a router, pass its link component as `as` and its props (such as `to`) in `linkProps`.

### Picking rows

Set `selectionMode="multiple"` when people pick rows to act on several at once: files to move, messages to archive, members to remove. Give each `ListItem` a `value`, keep the picked values in state, and put a `ListSelectAll` and the actions (TableActionBar's pattern) above the list.

```tsx
const [picked, setPicked] = React.useState<string[]>([]);
<ListSelectAll values={files.map((f) => f.id)} selected={picked} onSelectedChange={setPicked} />
<List aria-label="Files" selectionMode="multiple" selected={picked} onSelectedChange={setPicked}>
  {files.map((f) => <ListItem key={f.id} value={f.id} title={f.name} description={f.size} trailing={<IconButton icon="more_vert" label={`More for ${f.name}`} />} />)}
</List>
```

- Each row gets a checkbox named by its title. A press on the row picks it, and Shift with a press picks the run from the last one picked. A row with `href` or `onClick` keeps its link or button: only its checkbox picks it.
- `selectionMode="single"` picks one row at a time, with no checkboxes: a picked row is shaded with the primary bar.
- A `disabled` row can't be picked. Leave it out of `ListSelectAll`'s `values`.

### Loading, empty and failed

- **Loading:** set `loading` on the List and put a `ListLoadingItems` inside it, with `rows` set to about as many as will come and with the shape the rows will have: `description` when they have a second line, and `leading` set to `'icon'` or to the Avatar's size (`'sm'`, `'md'` and so on). Each placeholder is as tall as the real row, so nothing jumps when the data arrives. Name the wait in `label` ("Loading members"): a screen reader hears it once, after the loader's delay, so a quick load says nothing.
- **Empty:** in place of the List, an `EmptyState` that says what's missing and offers the action that adds the first one.
- **Failed:** in place of the List, a danger `Alert` that says what didn't load and offers Retry in `actions`. It's `role="alert"`, so the failure is heard as it appears. On Retry, go back to loading.

```tsx
{state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={load}>Retry</Button>}>Members didn't load.</Alert>
  : state === 'loaded' && !members.length ? <EmptyState size="sm" title="No members yet" />
  : <List aria-label="Members" loading={state === 'loading'}>
      {state === 'loading' ? <ListLoadingItems rows={4} description leading="sm" label="Loading members" />
        : members.map((m) => <ListItem key={m.id} title={m.name} description={m.email} leading={<Avatar name={m.name} size="sm" />} />)}
    </List>}
```

### Do and don't

- **Do:** Keep the title short, and put the detail in `description` and the status in `trailing`. (`DoTitleAndDetail`)
- **Don't:** Write everything into the title: it wraps, and people can't scan down the names. (`DontCrammedTitle`)

## Accessibility

- It's a real list, so screen readers say how many rows there are, Safari's VoiceOver included (`role="list"` keeps the role it would drop from a list without bullets). Name it with `aria-label` when there's no heading over it.
- A whole row is one link or button, named by its title and description; trailing actions are separate controls, so give them names that say which row they're for ("More for Ada Lovelace").
- An Avatar beside a written name repeats it, so give it `alt=""`, as in the example above. Otherwise every row reads the name twice ("Ada Lovelace Ada Lovelace ada@example.com"). An icon beside a title that says the same is decorative too.
- Selected rows have a bar and `aria-current` or `aria-pressed`, not only a background.
- Titles and descriptions keep 4.5:1 on plain and shaded rows, and the selected bar 3:1, in all six themes (`List.test.tsx`).
- **Keyboard:** an item with `href` or `onClick` has one Tab stop, its main area, where Enter (Space too for a button) acts. A disabled one is skipped. Controls in `trailing` are Tab stops of their own. Plain items add none.
- **With `selectionMode`:** the list is a grid (`role="grid"`, `aria-multiselectable` when multiple) of rows named by their titles, with `aria-selected`. It's one Tab stop: Up and Down move between rows, Home and End go to the ends, Right and Left reach the row's checkbox, link and actions. Space picks the focused row, Shift with Up or Down picks as it moves, Ctrl or Cmd+A picks every row, and Enter follows the row's link or presses its button. A picked row has a checked box and the primary bar, not only a background.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | A link or button row's main area, then its trailing controls. With `selectionMode`, the list is one Tab stop, on the last row focused |
| Enter | Follows the row's link or presses its button; with `selectionMode`, picks a row that has neither |
| Space | Presses a button row; with `selectionMode`, picks or clears the focused row (with Shift, the run from the last one picked) |
| Down / Up | With `selectionMode`: the next or previous row (with Shift, picking as it moves) |
| Home / End | With `selectionMode`: the first or last row |
| Right / Left | With `selectionMode`: into the row, through its checkbox, link and actions, and back to the row |
| Ctrl+A / Cmd+A | With `selectionMode="multiple"`: picks every row that isn't disabled |

## Props

### List

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<ul>` or `<ol>`. |
| `variant` | `'plain'` \| `'card'` | `'plain'` | Bare rows, or rows in a bordered, rounded frame |
| `divided` | boolean | `true` | Lines between rows |
| `as` | `'ul'` \| `'ol'` | `'ul'` | `ol` when the order matters |
| `loading` | boolean | `false` | Its rows are loading: sets `aria-busy` on the list. Pair it with `ListLoadingItems` |
| `busy` | boolean | | Deprecated, removed in 15.0.0: use `loading`, the API naming table's name |
| `selectionMode` | `'none'` \| `'single'` \| `'multiple'` | `'none'` | Rows people pick: a grid with one Tab stop, and a checkbox per row when multiple |
| `selected` / `defaultSelected` | string[] | | The picked rows' values |
| `onSelectedChange` | `(values) => void` | | Called with the picked rows' values |

`className`, `style`, `ref`, `aria-label` and everything else go to the list, which has `data-component="list"`.

### ListItem

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | node | required | The main line |
| `description` | node | none | A second, muted line |
| `leading` | an icon name or node | none | Before the text: a 20px muted icon, an Avatar, an image |
| `trailing` | node | none | After the text, outside any link or button |
| `href` | string | none | Makes the main area a link |
| `onClick` | function | none | Makes the main area a button (without `href`) |
| `as` | a component | the `configure({ link })` link, else `'a'` | Your router's link component; its props (such as `to`) go in `linkProps`. Set it once for the app with `configure({ link })`; `as` wins for one link. |
| `linkProps` | object | none | Extra props for the link or button |
| `selected` | boolean | `false` | Shaded with a primary bar; `aria-current="true"` on a link (an `aria-current` in `linkProps`, such as `"page"` for the current page of a nav list, wins), `aria-pressed` on a button |
| `disabled` | boolean | `false` | Dims a link or button row and stops it; with `selectionMode`, it can't be picked |
| `value` | string | | With `selectionMode`: what `onSelectedChange` reports for this row |

`className`, `ref` and everything else go to the `<li>`.

### ListSelectAll

The "Select all" box over a List with `selectionMode="multiple"`: checked when every row is picked, a dash (said as mixed) when some are. Picks outside `values` are kept.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `values` | string[] | required | The values of the rows it picks: the enabled ones |
| `selected` | string[] | required | The List's picked values |
| `onSelectedChange` | `(values) => void` | required | Called with every value, or none of them |
| `children` | node | `"Select all"` | Its label |

Every other prop goes to the Checkbox.

### ListLoadingItems

Placeholder rows, inside a List, while its rows load.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `rows` | number | `3` | How many placeholder rows (1 to 50) |
| `description` | boolean | `false` | Each row gets a second, shorter line, for rows with a description |
| `leading` | `'icon'` \| `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | none | A circle before the text: a 20px icon's, or an Avatar's of that size |
| `label` | string | `"Loading"` | Said once as the rows appear, after the loader's delay |

## Component tokens

Each is an optional override: set it on the page, a container or one list. The list lives in `src/components/List/list.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from list.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--list-border` | `border` | Lines between items, and the frame of variant="card". |
| `--list-bg` | `surface` | The background of variant="card". |
| `--list-title-color` | `text` | An item's title. |
| `--list-description-color` | `text-muted` | An item's description (4.5:1 on bg and bg-hover). |
| `--list-bg-hover` | `surface-hover` | A link or button item on hover, and a selected item. |
| `--list-bg-pressed` | `pressed` | A link or button item while it's pressed (not while its trailing action is), one step past hover. |
| `--list-indicator-selected` | `primary` | The bar at the start of a selected item. |
| `--list-focus-ring` | `focus-ring` | The keyboard focus ring. |
| `--list-title-size` | `text-sm` | Titles (14px). |
| `--list-title-weight` | `font-medium` | Title weight (500). |
| `--list-description-size` | `text-sm` | Descriptions (14px). |
| `--list-padding-x` | `spacing-3` | An item's side padding (12px; variant="card": padding-x-card). |
| `--list-padding-x-card` | `spacing-4` | An item's side padding in variant="card" (16px). |
| `--list-padding-y` | `spacing-3` | An item's top and bottom padding (12px). |
| `--list-gap` | `spacing-3` | Space between the leading element, the text and the trailing element (12px). |
| `--list-border-width` | `border-width-1` | Lines and frame (1px). |
| `--list-indicator-width` | `border-width-2` | The selected item's bar (2px). |
| `--list-radius` | `radius-surface` | The corners of variant="card" (8px). |
<!-- token-table:end -->
