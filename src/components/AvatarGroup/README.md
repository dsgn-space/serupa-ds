# AvatarGroup

Avatars in an overlapping row, such as the people on a project or the assignees of a task. Avatars past `max` fold into a "+N" avatar at the end.

```tsx
import { Avatar, AvatarGroup } from "@diki/design-system";

<AvatarGroup label="Assigned to" max={3}>
  <Avatar name="Ada Lovelace" src="/ada.jpg" />
  <Avatar name="Grace Hopper" />
  <Avatar name="Alan Turing" />
  <Avatar name="Katherine Johnson" />
</AvatarGroup>

<AvatarGroup label="Members" size="sm" total={members.length}>
  {members.slice(0, 5).map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}
</AvatarGroup>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `<Avatar>` elements | | The avatars, in order. Each can sit inside a Tooltip or a link, and fragments are opened up. |
| `max` | `number` | all | The most avatars to show; the rest become "+N". |
| `total` | `number` | the number of children | How many there are in all, when you pass only some. "+N" counts the ones not shown. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Every avatar's size, wrapped ones included. It wins over each avatar's own `size`. |
| `label` | `string` | | The group's accessible name, such as "Assigned to". |
| `moreLabel` | `(count) => string` | `"N more"` | What a screen reader hears for "+N". |

`ref`, `className` and other props go to the outer `<div>`.

## Behavior

- Each avatar overlaps the one before by 8px (xs, sm), 12px (md, lg) or 16px (xl); earlier ones sit on top, so every status dot shows. The overlap uses logical margins, so the row runs right to left in RTL.
- Each avatar has a 2px ring in `surface`. On another background, set `--avatar-group-ring` to that color.
- Past 99, "+N" reads "99+" (past 9 at `xs`, "9+") so it fits; its name keeps the exact count ("116 more").
- Wrap an avatar in a Tooltip to show the name on hover; it still lines up with the others.
- To show who's in "+N", wrap the group in a Tooltip or Popover with the full list.

## Accessibility

- The group is `role="group"`, named by `label`. Each avatar keeps its own name (and status), so a screen reader reads every person shown, then "N more".
- The "+N" text keeps 4.5:1 on its background in all six themes (`tools/test/avatar-group.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one group. The list lives in `src/components/AvatarGroup/avatar-group.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--avatar-group-ring` | `surface` | The ring around each avatar, which keeps the overlapping edges clear. Set it to the background the group sits on. |
| `--avatar-group-more-bg` | `secondary` | The "+N" avatar's background. |
| `--avatar-group-more-color` | `text` | The "+N" text (4.5:1 on more-bg). |
| `--avatar-group-ring-width` | `border-width-2` | The ring's width (2px). |
| `--avatar-group-overlap-sm` | `spacing-2` | How far each avatar overlaps the one before at size xs and sm (8px). |
| `--avatar-group-overlap-md` | `spacing-3` | The overlap at size md, the default, and lg (12px). |
| `--avatar-group-overlap-lg` | `spacing-4` | The overlap at size xl (16px). |
