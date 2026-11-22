# ToggleButton

A Button that stays on or off, for a setting that applies right away: bold in a text editor, mute, show the grid. It has `aria-pressed`, and when it's on it turns primary-subtle with primary text.

**Also called:** on/off button, state button.

```jsx
import { ToggleButton, ButtonGroup } from '@diki-stwn/serupa-ds';

<ToggleButton defaultPressed startIcon="grid_on">Show grid</ToggleButton>
<ToggleButton pressed={muted} onPressedChange={setMuted} icon={muted ? 'volume_off' : 'volume_up'} aria-label="Mute" />

<ButtonGroup aria-label="Text formatting">
  <ToggleButton icon="format_bold" aria-label="Bold" />
  <ToggleButton icon="format_italic" aria-label="Italic" />
</ButtonGroup>
```

## When to use

- A setting that applies right away and stays on or off: bold in a text editor, mute, show the grid.
- A toolbar of independent options that can be on at the same time, such as bold and italic.

## When not to use

- For one choice out of several (Day, Week, Month), use a [SegmentedControl](../SegmentedControl/README.md) or [radios](../Radio/README.md) instead: a set of toggles can all be on at once.
- A labeled on/off setting in a form or a settings list: use [Switch](../Switch/README.md).
- An action that doesn't stay on, such as Save: use [Button](../Button/README.md).

## Usage

- Group related toggles that each keep their own state (mute, captions) in a [ButtonGroup](../ButtonGroup/README.md) with an `aria-label` that says what they're for ("Playback"), and put several groups of tools in a [Toolbar](../Toolbar/README.md).
- To give a set of toggles one value, with one on at a time (alignment) or any number (text styles), use a [ToggleGroup](../ToggleGroup/README.md).
- Use `variant="ghost"` in toolbars and the default `outline` elsewhere.
- Give the toggles in one group the same `size`.

### Do and don't

- **Do:** Group related toggles in a ButtonGroup with a name, in one size. (`DoGroup`)
- **Don't:** Scatter related toggles in mixed sizes, with no group to name them. (`DontScatter`)

## Accessibility

- `aria-pressed` tells screen readers it's on or off. Keep the label the same either way ("Bold", not "Make bold" / "Remove bold"), since the state is announced separately.
- An icon-only toggle needs an `aria-label`.
- Pressed text keeps 4.5:1 on its background, and the pressed border 3:1 on `surface`, in the six themes the tests draw (blue, yellow and violet, light and dark) (`ToggleButton.test.tsx`). In Windows high-contrast mode it uses the system highlight colors.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the button |
| Enter, Space | Turn it on or off (`aria-pressed`) |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<button>`. |
| `pressed` | boolean | none | Whether it's on (controlled) |
| `defaultPressed` | boolean | `false` | Whether it starts on (uncontrolled) |
| `onPressedChange` | `(pressed) => void` | none | Called with the new state |
| `variant` | `'outline'` \| `'ghost'` | `'outline'` | Ghost suits toolbars |

Every other Button prop works (`size`, `icon`, `startIcon`, `endIcon`, `disabled`, `onClick`…), except `destructive` and `loading`. An `onClick` that calls `preventDefault()` stops the toggle. Disabled while on, it is drawn in neutrals (the highlight fill, muted text, the control border), so it still reads as on but not as something to press. It renders Button's element, with `data-component="button"` and the class `srp-toggle-button`.

## Component tokens

Each is an optional override: set it on the page, a container or one toggle. The list lives in `src/components/ToggleButton/toggle-button.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from toggle-button.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--toggle-button-bg-pressed` | `primary-subtle` | The background while pressed (on). |
| `--toggle-button-text-pressed` | `primary` | Text and icon while pressed (4.5:1 on bg-pressed). |
| `--toggle-button-border-pressed` | `primary` | The outline variant's border while pressed (3:1 on surface). |
| `--toggle-button-bg-pressed-held` | `primary-subtle-pressed` | The background of an on toggle while held down, one step past bg-pressed. |
| `--toggle-button-text-pressed-held` | `primary-hover` | Text and icon of an on toggle while held down (4.5:1 on bg-pressed-held). |
| `--toggle-button-bg-pressed-disabled` | `highlight` | The background while on and disabled. |
| `--toggle-button-text-pressed-disabled` | `text-muted` | Text and icon while on and disabled (3.4:1 and up on bg-pressed-disabled, as on a disabled Button). |
| `--toggle-button-border-pressed-disabled` | `border-control` | The outline variant's border while on and disabled (3:1 on surface). |
<!-- token-table:end -->
