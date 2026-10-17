# ToggleButton

A Button that stays on or off, for a setting that applies right away: bold in a text editor, mute, show the grid. It has `aria-pressed`, and when it's on it turns primary-subtle with primary text.

## Usage

```jsx
const { ToggleButton, ButtonGroup } = window.Diki;

<ToggleButton defaultPressed leftIcon="grid_on">Show grid</ToggleButton>
<ToggleButton pressed={muted} onPressedChange={setMuted} icon={muted ? 'volume_off' : 'volume_up'} aria-label="Mute" />

<ButtonGroup aria-label="Text formatting">
  <ToggleButton icon="format_bold" aria-label="Bold" />
  <ToggleButton icon="format_italic" aria-label="Italic" />
</ButtonGroup>
```

For one choice out of several (Day, Week, Month), use a segmented control or radios instead: a set of toggles can all be on at once.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `pressed` | boolean | none | Whether it's on (controlled) |
| `defaultPressed` | boolean | `false` | Whether it starts on (uncontrolled) |
| `onPressedChange` | `(pressed) => void` | none | Called with the new state |
| `variant` | `'outline'` \| `'ghost'` | `'outline'` | Ghost suits toolbars |

Every other Button prop works (`size`, `icon`, `leftIcon`, `rightIcon`, `disabled`, `onClick`…), except `destructive` and `loading`. An `onClick` that calls `preventDefault()` stops the toggle. It renders Button's element, with `data-component="button"` and the class `dk-toggle-button`.

## Accessibility

- `aria-pressed` tells screen readers it's on or off. Keep the label the same either way ("Bold", not "Make bold" / "Remove bold"), since the state is announced separately.
- An icon-only toggle needs an `aria-label`.
- Pressed text keeps 4.5:1 on its background, and the pressed border 3:1 on `surface`, in all six themes (`tools/test/button-group.mjs`). In Windows high-contrast mode it uses the system highlight colors.

## Component tokens

Each is an optional override: set it on the page, a container or one toggle. The list lives in `src/components/ToggleButton/toggle-button.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--toggle-button-bg-pressed` | `primary-subtle` | The background while pressed (on). |
| `--toggle-button-text-pressed` | `primary` | Text and icon while pressed (4.5:1 on bg-pressed). |
| `--toggle-button-border-pressed` | `primary` | The outline variant's border while pressed (3:1 on surface). |
