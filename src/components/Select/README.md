# Select

A native `<select>` styled like Input: the same three heights (24, 32 and 44px), colors, focus ring and states, with a chevron and an optional left icon. It keeps everything the browser gives a select for free: the system picker on phones, type-to-find, and full keyboard and screen-reader support.

Where the browser lets a page style the list (`appearance: base-select`, in Chromium-based browsers today), the open list is drawn like Combobox's: an overlay surface with the shared shadow and corners, rows at control height, the highlight fill and a primary bar on the option under the pointer or keyboard, and a tick on the chosen one. Everywhere else the browser draws its own list. Your code and the way it reads out are the same either way.

**Also called:** dropdown, select input, picker.

```jsx
const { Select, Field } = window.Serupa;

<Field label="Role">
  <Select options={["Viewer", "Editor", "Admin"]} value={role} onChange={(e) => setRole(e.target.value)} />
</Field>

<Select aria-label="Country" placeholder="Choose a country" options={countries} />

// labels, disabled options and groups
<Select aria-label="Time zone" leftIcon="schedule" options={[
  { label: "Europe", options: [{ value: "Europe/London", label: "London (GMT+1)" }, { value: "Europe/Paris", label: "Paris (GMT+2)" }] },
  { value: "UTC", label: "UTC", disabled: true },
]} />

// or your own options
<Select aria-label="Sort"><option value="new">Newest</option><option value="old">Oldest</option></Select>
```

## When to use

- One choice from a short, fixed list of about 5 to 15 plain-text options, such as a role, a country or a time zone.
- Forms used on phones, where the system picker is easier than a custom list.

## When not to use

- 2 to 4 options: use [radios](../Radio/README.md), which show every choice at once.
- A long list people search through, options loaded as people type, options with more than a line of text (an avatar, a description), or several choices: use a [Combobox](../Combobox/README.md).
- Picking more than one option from a short list: use [checkboxes](../Checkbox/README.md); Select doesn't support `multiple`.
- A few options that change a view right away, such as Day, Week, Month: use [SegmentedControl](../SegmentedControl/README.md).

## Anatomy

Drawn from the `WithIcon` story.

1. **Leading icon** (`.dk-select__icon--left`): an optional picture of what is chosen.
2. **Field** (`.dk-select__field`): the native select, showing the chosen option.
3. **Chevron** (`.dk-select__icon--chevron`): says it opens a list.

## Usage

- Order options the way people expect: alphabetically, by frequency, or in their natural order (sizes, dates).
- Pick a sensible default when there is one; use a placeholder only when no default makes sense.
- Match its size to the inputs and buttons beside it.

### Do and don't

- **Do:** Give it a label above, in a [Field](../Field/README.md), which stays in view after a choice is made. (`DoLabelAbove`)
- **Don't:** Use the placeholder as the only label: once a value is chosen, nothing says what the field was for. (`DontPlaceholderLabel`)
- **Do:** Show two to four choices as [radios](../Radio/README.md), all in view at once. (`DoRadiosForFew`)
- **Don't:** Hide a few choices in a Select: people have to open it to see what they can pick. (`DontSelectForFew`)

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border`, chevron in `text-muted` |
| Placeholder | The placeholder in the `placeholder` color until something is picked, and again after a form reset |
| Hover | `field-border-hover` |
| Focus | The border and a 1px ring hugging it in `focus-ring` (2px in all), like Input; a visible outline in forced-colors mode |
| Invalid | `danger` border, and a `danger` focus ring |
| Read-only | `field-readonly` background, default cursor, no hover change; the value at full contrast |
| Disabled | `field-readonly` background at 50%, `not-allowed` cursor |
| Open, where the list is styled | `picker-bg` surface with a `picker-border` border, `picker-radius` corners and `picker-shadow`, at least as wide as the box and at most `picker-max-height` tall, then scrolling. Rows are `option-height` tall (`option-height-touch` on a touch screen) |
| Option under the pointer or keyboard | `option-bg-active` fill and a 2px `option-indicator` bar at the start edge; in forced-colors mode a `Highlight` outline |
| Chosen option | A tick in `check` at the start |
| Disabled option | At 50% |
| Group label | `group-label`, `text-xs` medium |

## Accessibility

- On iOS the field's text is 16px at every size, so Safari doesn't zoom the page when it takes focus; the box keeps its height.
- It's the browser's own select, so screen readers, the keyboard (arrows, Home/End, type to find) and the phone's picker all work without extra code.
- `readOnly` is for a value people should see but not change (a review step, a locked setting). The browser has no read-only select, so Select cancels the keys and press that would open or change it, and puts back a value a phone's picker sets. Unlike `disabled`, it stays in the Tab order and keeps its full contrast.
- Every select needs a name: Field, a `<label htmlFor>` or `aria-label`. The placeholder isn't a label.
- The chevron and left icon are decorative and don't take clicks: a click anywhere in the box opens the select.
- Text and placeholder keep 4.5:1 on `field`; the chevron, border, focus ring and invalid border 3:1, in all six themes. In a styled list, options and group labels keep 4.5:1 on the list and on the highlight fill, and the tick and the bar 3:1 (`Select.test.tsx`).
- Native constraints (`required` with an empty first option) show too: a field that fails them takes the `invalid` border once people have edited it or tried to send the form (`:user-invalid`), never on first paint. It's only the color: `aria-invalid` and the message stay yours (set `invalid` and Field's `error` when you check it yourself). To keep the browser out of it, leave out the attribute and check the value in your own code.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the select |
| ↑ ↓ | The previous or next option (on macOS, and where the list is styled, opens the list; then moves through it) |
| Alt+↓, Space | Opens the list |
| Enter | In an open list, picks the option and closes it |
| Esc | Closes the open list without changing the value |
| A letter | The next option that starts with it |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the native `<select>` (not the wrapper), so a `<label htmlFor>` or a Field can point at it. |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24px with `text-xs`, 32px with `text-sm`, 44px with `text-base`, like Input |
| `options` | array | | Strings (value and label), `{ value, label, disabled }`, or groups `{ label, options, disabled }`. `<option>` and `<optgroup>` children come after them |
| `placeholder` | string | | A first, empty option shown in the placeholder color until something is picked. It can't be picked back. An uncontrolled Select starts on it |
| `leftIcon` | icon name or element | | A decorative icon before the text (14, 16 or 20px, in `text-muted`) |
| `invalid` | boolean | `false` | A danger border and focus ring, and `aria-invalid` |
| `readOnly` | boolean | `false` | Focusable and read out (`aria-readonly`), and a form still sends the value, unlike `disabled`; keys, a press and the phone's picker don't change it, and `onChange` doesn't run |

Everything else (`value`, `defaultValue`, `onChange`, `name`, `disabled`, `required`, `id`, `aria-*`) and `ref` go to the `<select>`. `className` and `style` go to the box, so `className="w-48"` sets its width (full width by default). The box has `data-component="select"` and `data-size`. `multiple` isn't supported (a native multi-select is hard to use): it's ignored with a warning; use checkboxes. Inside a `<fieldset disabled>` the box takes the disabled look too, as the native select is disabled with it.

## Component tokens

Each is an optional override: set it on the page, a container or one select. The list lives in `src/components/Select/select.tokens.json` (also in `design-tokens/components/`). The defaults are the same shared tokens Input uses.

<!-- token-table:start (made from select.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--select-bg` | `field` | Background, and the options where the browser draws them |
| `--select-bg-disabled` | `field-readonly` | Background when read-only or disabled |
| `--select-text` | `text` | The chosen value, and the options where the browser draws them |
| `--select-border` | `field-border` | Border |
| `--select-border-hover` | `field-border-hover` | Border on hover |
| `--select-placeholder` | `placeholder` | The placeholder |
| `--select-icon-color` | `text-muted` | Chevron and left icon |
| `--select-focus-ring` | `focus-ring` | Border and ring while focused |
| `--select-invalid` | `danger` | Border and ring when invalid |
| `--select-picker-bg` | `surface-overlay` | The list of options, where the browser draws it with the page's styles (appearance: base-select). |
| `--select-picker-border` | `border-overlay` | The list's border. |
| `--select-option-bg-active` | `highlight` | The option under the pointer or the keyboard, as Combobox's. |
| `--select-option-indicator` | `primary` | The 2px bar at the start of that option, so it is marked by more than a fill. |
| `--select-check` | `primary` | The tick by the chosen option. |
| `--select-group-label` | `text-muted` | A group's name over its options. |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--select-height-sm` | `control-height-sm` | Height, sm (24px), like Input sm. |
| `--select-height-md` | `control-height-md` | Height, md (32px, default). |
| `--select-height-lg` | `control-height-lg` | Height, lg (44px). |
| `--select-icon-size-sm` | `spacing-3.5` | Icon size, sm (14px). |
| `--select-icon-size-md` | `spacing-4` | Icon size, md (16px). |
| `--select-icon-size-lg` | `spacing-5` | Icon size, lg (20px). |
| `--select-picker-max-height` | `spacing-60` | The list's greatest height before it scrolls (240px). |
| `--select-option-height` | `control-height-md` | An option's least height (32px), where the list is styled. |
| `--select-option-height-touch` | `control-height-lg` | An option's least height on a touch screen (44px), where the list is styled. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--select-padding-x-sm` | `spacing-2` | Side padding, sm (8px). |
| `--select-padding-x-md` | `spacing-3` | Side padding, md (12px). |
| `--select-padding-x-lg` | `spacing-4` | Side padding, lg (16px). |
| `--select-gap` | `spacing-2` | Gap between an icon and the text (8px) |
| `--select-picker-padding` | `spacing-1` | Space inside the list, around the options (4px). |
| `--select-option-padding-x` | `spacing-2` | An option's side padding (8px). |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--select-border-width` | `border-width-1` | Border width (1px) |
| `--select-radius` | `radius-control` | Corner radius (6px) |
| `--select-picker-radius` | `radius-surface` | The list's corners. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--select-depth` | `depth-field` | The tactile inner shade along the top of the box. None in the flat brands. |
| `--select-picker-shadow` | `elevation-overlay` | The list's shadow, as other popups. |
| `--select-picker-depth` | `depth-surface` | The list's tactile layer (none in the flat brands). |
<!-- token-table:end -->
