# Switch

An on/off setting that takes effect at once. It's a native checkbox with `role="switch"`, so screen readers announce "on" and "off", drawn as a track (the input, `appearance: none`) and a thumb that slides along it. The track sits centered on the label's first line (each size's track is as tall as its line), and a click anywhere on the label flips it.

**Also called:** toggle, toggle switch, lightswitch.

```jsx
import { Switch } from '@diki-stwn/serupa-ds';

<Switch checked={wifi} onCheckedChange={setWifi}>Wi-Fi</Switch>

<Switch defaultChecked description="Pause notifications from 10 pm to 7 am.">Quiet hours</Switch>

// a settings list: the label first, the switch at the end of the row
<Switch labelPlacement="start" className="w-full justify-between">Autoplay videos</Switch>

// no visible label
<Switch aria-label="Enable rule" />
```

## When to use

- A setting that applies right away, like turning on Wi-Fi.
- A list of settings, each turned on or off on its own row.

## When not to use

- If the change waits for a Save button, use a [Checkbox](../Checkbox/README.md).
- An on/off button in a toolbar, such as bold: use [ToggleButton](../ToggleButton/README.md).

## Anatomy

Drawn from the `LongLabel` story.

1. **Track** (`.srp-switch__control`): the pill that shows on or off, over the native checkbox.
2. **Thumb** (`.srp-switch__thumb`): slides to the on side when it's on.
3. **Label** (`.srp-switch__text`): what it turns on; clicking it switches too.
4. **Description** (`.srp-switch__description`): optional detail under the label.

## Usage

- Label the setting, not the state: "Wi-Fi", not "Turn Wi-Fi on". The switch shows on or off.
- Don't change the label with the state, and don't add "On" and "Off" text beside it.
- In a settings list, put the label first and the switch at the end of the row.
- Add `icon` where color alone may not tell on from off, such as a switch on a busy or tinted surface: a check appears on the thumb while it's on.
- When a flip saves to a server, set `loading` while the request runs. Flip `checked` in `onChange` (optimistic) or once the save succeeds, and if it fails, put it back and say so in text nearby.

### Do and don't

- **Do:** Name the setting, and let the switch show whether it's on. (`DoNameTheSetting`)
- **Don't:** Describe the state in the label, such as "Notifications are on": it has to change with every flip. (`DontLabelTheState`)
- **Do:** Use [checkboxes](../Checkbox/README.md) in a form that waits for Save. (`DoCheckboxInForm`)
- **Don't:** Use switches there: people expect a switch to apply at once, so a flip seems to do nothing. (`DontSwitchInForm`)

## States

| State | Look |
| --- | --- |
| Off | A `track` track (the light gray Apple uses), a white thumb at the start, with the `elevation-part` shadow and no edge, as Apple's, in every theme |
| On | A `primary` track, the white thumb at the end |
| Hover | `border-strong` off, `primary-hover` on |
| Focus | From the keyboard: a 2px `focus-ring` outline 2px out (`focus-ring-width`, `focus-ring-offset`), like Button. The gap is transparent, so it reads on any background, and forced-colors mode draws it too |
| Invalid | A `danger` track while off, and a `danger` focus ring |
| Read-only | Looks as it is, with a default cursor and no hover change |
| Pending | A small `primary` ring turns on the thumb (3:1 on the thumb, on or off), with a `progress` cursor and no hover change |
| Disabled | Neutral colors at full opacity: a `disabled-surface` track in a `disabled-border` edge, a `disabled-text` thumb and label, and a `not-allowed` cursor; also inside a disabled fieldset |

The thumb slides in 100ms (`motion-press`, `ease-move`: feedback for a toggle takes 100ms or less) and jumps with `prefers-reduced-motion`. It follows the text direction: in right-to-left pages it starts on the right.

## Accessibility

- A press anywhere within 24px of the row counts (WCAG 2.5.8): when the row is shorter, its hit area reaches past what is drawn, so nothing moves. On a touch screen it's 44px high, as Apple and Material ask.
- A native checkbox with `role="switch"`: Space flips it, forms submit it (as a checkbox), and screen readers say "on" or "off". It also carries the native `switch` attribute, so Safari 18 on iPhone gives its haptic tick when it flips, as a system switch does. The tick follows the phone's own haptics setting, and the switch always shows its change, so the tick is never the only feedback.
- The label names it; a description is read after it. The thumb is decorative.
- `loading` sets `aria-busy` and stops clicks and Space from flipping it until the save is done, so a change can't be sent twice. It stays focusable and is still submitted. The ring is Loader's: a quarter arc on a faint track of the same color, turning once a second (`motion-loop-spinner`). It is decorative (`aria-hidden`), stands still and breathes with `prefers-reduced-motion`, and uses system colors in forced-colors mode.
- `readOnly` keeps it focusable and read out with `aria-readonly`, but a click or Space doesn't flip it, and `onChange` doesn't run (your `onClick` does). The browser's own `readonly` does nothing on a checkbox, so Switch cancels the click. An on read-only switch is still submitted, which `disabled` isn't.
- In forced-colors mode the track gets a border and the thumb and on track use system colors.
- The label and description keep 4.5:1; the tracks on the page, each thumb on its track (at rest and on hover) and the focus ring 3:1, in every theme (`Switch.test.tsx`).

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the switch |
| Space | Turn it on or off |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the native `<input role="switch">` (not the wrapper), so a `<label htmlFor>` or a Field can point at it. |
| `children` | node | | The label. Without one, give the switch an `aria-label` |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | A 28×16px track and 12px thumb with `text-xs`; 36×20 and 16 with `text-sm`; 44×24 and 20 with `text-base` |
| `description` | node | | A muted second line under the label, linked with `aria-describedby` (and kept out of the name) |
| `labelPlacement` | `'end'` \| `'start'` | `'end'` | The label after the track, or before it as in a settings list |
| `invalid` | boolean | `false` | A 2px danger edge on the track (on or off), a danger focus ring, and `aria-invalid` |
| `readOnly` | boolean | `false` | Focusable and read out (`aria-readonly`), but clicks and Space don't flip it; an on switch is still submitted |
| `icon` | boolean | `false` | A check on the thumb while on, so on and off differ by shape as well as by color; decorative, the name stays the label |
| `loading` | boolean | `false` | While a change is saved: a ring on the thumb, `aria-busy`, and clicks and Space don't flip it |

`onCheckedChange(checked, { event })` runs after `onChange` with the new state, the same shape as ToggleButton's `onPressedChange`, so you needn't read `event.target.checked`. Not while read-only or loading.

Everything else (`checked`, `defaultChecked`, `onChange`, `name`, `value`, `disabled`, `id`, `aria-*`) and `ref` go to the `<input type="checkbox" role="switch">` (`type` and `role` can't be changed). `className` and `style` go to the `<label>` around it, which has `data-component="switch"` and `data-size`.

## Component tokens

Each is an optional override: set it on the page, a container or one switch. The list lives in `src/components/Switch/switch.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from switch.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--switch-track` | `track` | The track while off: Apple's light gray. |
| `--switch-track-hover` | `border-strong` | The track while off, on hover: a step darker than track. |
| `--switch-track-pressed` | `border-control` | The off track while held down, one step past track-hover. |
| `--switch-track-checked` | `primary` | The track while on |
| `--switch-track-checked-hover` | `primary-hover` | The track while on, on hover |
| `--switch-track-checked-pressed` | `primary-pressed` | The on track while held down, one step past track-checked-hover. |
| `--switch-thumb` | `white` | The thumb while off: white in every theme, as Apple's. |
| `--switch-thumb-checked` | `white` | The thumb while on: white in every theme, as Apple's. |
| `--switch-thumb-ink-dark` | `text-inverse` | In a dark theme, the loading ring and the check on the white thumb: the dark inverse text, 3:1 or more on white in every brand (a dark theme's brand colors are light). |
| `--switch-icon` | `primary-text` | The check on the thumb while on, with icon (3:1 on the thumb) |
| `--switch-label-color` | `text` | The label |
| `--switch-description-color` | `text-muted` | The description |
| `--switch-focus-ring` | `focus-ring` | The focus ring |
| `--switch-invalid` | `danger` | The track's edge and the focus ring, when invalid |
| `--switch-pending` | `primary-text` | The loading ring on the off thumb (3:1 on it) |
| `--switch-pending-checked` | `primary-text` | The loading ring on the on thumb (3:1 on it) |
| `--switch-border-disabled` | `disabled-border` | Disabled: the edge. |
| `--switch-fill-disabled` | `disabled-surface` | Disabled: the fill, whatever its color when enabled. |
| `--switch-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |
| `--switch-track-edge-checked` | `primary-edge` | The on track's 1px edge inside its fill (Yellow Light; transparent where the fill is 3:1 on the page) |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--switch-thumb-shadow` | `elevation-part` | The thumb's shadow, on or off. |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--switch-width-sm` | `spacing-7` | Track width, sm (28px). |
| `--switch-width-md` | `spacing-9` | Track width, md (36px, default). |
| `--switch-width-lg` | `spacing-11` | Track width, lg (44px). |
| `--switch-height-sm` | `spacing-4` | Track height, sm (16px, the text-xs line). |
| `--switch-height-md` | `spacing-5` | Track height, md (20px, the text-sm line). |
| `--switch-height-lg` | `spacing-6` | Track height, lg (24px, the text-base line). |
| `--switch-thumb-size-sm` | `spacing-3` | Thumb size, sm (12px). |
| `--switch-thumb-size-md` | `spacing-4` | Thumb size, md (16px). |
| `--switch-thumb-size-lg` | `spacing-5` | Thumb size, lg (20px). |
| `--switch-press-stretch` | `spacing-1` | How much wider the thumb grows while it's held down (4px), toward the middle of the track, as Apple's. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--switch-padding` | `spacing-0.5` | Thumb to the track's ends (2px) |
| `--switch-gap` | `spacing-2` | Track to label (8px) |

**Motion**

| Token | Default | Use |
| --- | --- | --- |
| `--switch-press-scale` | `scale-100` | Size of the thumb while it's held down. 100%: off by default, since a press shows as the held track (track-pressed, track-checked-pressed). Set it, e.g. to `var(--scale-90)`, to add a shrink. |
<!-- token-table:end -->
