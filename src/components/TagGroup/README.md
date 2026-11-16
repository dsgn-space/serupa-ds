# TagGroup

Short labels people remove or pick: the labels on a ticket, the recipients of a message, the skills on a profile. The tags are one Tab stop, the arrow keys move between them, and Delete or the × removes one without losing focus.

```tsx
import { TagGroup } from "@diki-stwn/serupa-ds";

<TagGroup label="Labels" items={[{ id: "design", label: "Design" }, { id: "bug", label: "Bug" }]}
  onRemove={(id) => setItems((t) => t.filter((x) => x.id !== id))} />
```

## When to use

- A short list of things on a record that people take off one at a time: labels, recipients, attached categories.
- A set of words people pick from, several at once or one, where each choice is a word rather than a setting: interests, skills, topics (`selectionMode`).

## When not to use

- A status or a count that nobody acts on: use [Badge](../Badge/README.md).
- Filters on a list or table, with an editor per filter: use [FilterBar](../FilterBar/README.md), whose chips say the filter in words.
- Two to five options of a setting, one shown pressed: use [SegmentedControl](../SegmentedControl/README.md) or [ToggleGroup](../ToggleGroup/README.md).
- Picking values while typing: use [Combobox](../Combobox/README.md) with `multiple`.

## Anatomy

Drawn from the `Default` story.

1. **Label** (`.dk-tag-group__label`): names the group, above the tags.
2. **Tags** (`.dk-tag-group__tags`): the grid, a wrapping row of tags.
3. **Tag** (`.dk-tag-group__tag`): one tag's row.
4. **Text** (`.dk-tag-group__text`): the tag's words, after a tick when it's picked.
5. **Remove** (`.dk-tag-group__remove`): the × that takes the tag off, in its own cell.

Past `max`, a Show more button follows the tags; with none, the `empty` words take their place.

## Usage

- Give it a `label`, shown above the tags, so the group has a name; or `aria-label` when the screen already says what they are.
- With `onRemove`, take the tag out of `items` in it. Focus moves to the next tag (or the one before, or the group), and "Design removed" is said.
- With `selectionMode`, a press, Space or Enter picks a tag. A picked tag has a tick as well as its color.
- Give a recipient tag its `avatar`, or a label tag an `icon` for its kind, when the picture helps people find one at a glance. Both are decorative, so the words still have to say it all.
- Use `max` for a list that can grow long: the rest wait behind "Show more", which becomes "Show less".
- Pass `empty` ("No labels yet") so a list with nothing in it still says so.
- Keep each tag to a word or two; long ones wrap inside the tag.

### Do and don't

- **Do:** A word or two in each tag. (`DoShortTags`)
- **Don't:** Sentences in tags: they wrap, stop reading as tags, and crowd the row. Put a sentence in the text beside them. (`DontSentences`)

## Accessibility

- **Role and name:** a grid (`role="grid"`) named by its label, with a row per tag; the tag's words are its first cell and its × the second, a button named "Remove Design". Picked tags have `aria-selected`, and a multiple-choice group `aria-multiselectable`.
- **Keyboard:** one Tab stop, on the last tag focused (the table below).
- **Focus:** removing a tag moves focus to the next one, so it's never dropped to the page.
- **Contrast:** a tag's words read 4.5:1 and its border 3:1 in every theme, picked or not (`TagGroup.test.tsx`).
- **What's still yours:** the label, and what removing or picking a tag does in your app (saving it, undoing it).

### Keyboard

| Key | Does |
| --- | --- |
| Tab | Into the tags, on the last one focused, and on out; the × buttons aren't Tab stops |
| Right / Left | The next or previous tag, in the reading direction |
| Down / Up | The next or previous tag |
| Home / End | The first or last tag |
| Delete / Backspace | Removes the focused tag (with `onRemove`); focus moves to the next |
| Space / Enter | Picks or clears the focused tag (with `selectionMode`) |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the outer `<div>` |
| `items` | `TagItem[]` | | `{ id, label, disabled?, icon?, avatar? }`, in order. `icon` (an icon name or element) and `avatar` (a picture such as `<Avatar size="xs" />`, drawn at 24px, as tall as the tag) sit before the words and are decorative: the words name the tag. A selected tag shows its check where its icon was |
| `label` | `ReactNode` | | The group's visible label |
| `onRemove` | `(id) => void` | | Shows a × on each tag; Delete and Backspace remove too |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | Picking tags |
| `selected` / `defaultSelected` | `string[]` | | The picked ids |
| `onSelectedChange` | `(ids) => void` | | Called with the picked ids |
| `max` | `number` | all | Show this many, and "Show more" for the rest |
| `empty` | `ReactNode` | | Shown when there are no tags |

`className`, `ref` and other props go to the outer `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one TagGroup. The list lives in `src/components/TagGroup/tag-group.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from tag-group.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--tag-group-bg` | `surface` | A tag's background. |
| `--tag-group-text` | `text` | A tag's words (4.5:1 on bg). |
| `--tag-group-border` | `border-control` | A tag's border (3:1 on the page, so the tag's edge is seen). |
| `--tag-group-bg-selected` | `primary-subtle` | A picked tag's background. |
| `--tag-group-text-selected` | `primary` | A picked tag's words and tick (4.5:1 on bg-selected). |
| `--tag-group-border-selected` | `primary` | A picked tag's border. |
| `--tag-group-remove-hover` | `surface-hover` | The × button's background under the pointer. |
| `--tag-group-remove-pressed` | `pressed` | The × while it's held down, one step past remove-hover. |
| `--tag-group-label` | `text` | The group's label. |
| `--tag-group-muted` | `text-muted` | The empty text. |
| `--tag-group-focus-ring` | `focus-ring` | The focus ring around the focused tag. |
| `--tag-group-more` | `primary` | The Show more and Show less button's words (4.5:1 on the page). |
| `--tag-group-icon` | `text-muted` | A tag's leading icon (decorative; the words name the tag). |
| `--tag-group-border-disabled` | `disabled-border` | Disabled: the edge. |
| `--tag-group-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |
| `--tag-group-radius` | `radius-control` | A tag's corners, as other controls'. |
| `--tag-group-gap` | `spacing-2` | The space between tags (8px). |
| `--tag-group-label-gap` | `spacing-1.5` | The space between the label and the tags, as between a Field's label and its control (6px). |
| `--tag-group-avatar-size` | `spacing-6` | The picture before a tag's words (24px, an xs Avatar's own size, so its initials have room), as tall as the tag. |
| `--tag-group-icon-size` | `spacing-4` | A tag's icon, the check of a selected tag and the × (16px), beside the 14px label. |
<!-- token-table:end -->
