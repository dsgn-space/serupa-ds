---
"serupa-ds": minor
---

- Added: the `secondary-pressed` color alias (zinc-300 light, zinc-500 dark), one step past `secondary-hover`, with its utility classes (`bg-secondary-pressed` and the rest). `pressed` is the same gray as `secondary-hover` in dark, so a control filled with `secondary` had no held step there.
- Added (TagGroup): a tag that can be picked answers the pointer, `surface-hover` under it and `pressed` while held (`--tag-group-bg-hover`, `--tag-group-bg-pressed`). A picked tag keeps its colors, as a pressed ToggleButton does.
- Fixed (Carousel): a dot under the pointer turns a step darker (`border-control-hover`). It read `text-muted`, the same zinc as the dot itself in every theme, so hover changed nothing.
- Fixed (AvatarGroup): the "+N" button held down reads `secondary-pressed`. In dark, `pressed` was its hover fill.
- Fixed (ImageCropper): the frame's grab and grabbing cursors read `--cursor-grab` and `--cursor-grabbing`, so a theme that changes them reaches the cropper too.
