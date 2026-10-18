# Input

A single-line text field: a native `<input>` in a box that can hold icons. Three sizes at the control heights (24, 32 and 44px, like Button), a focus ring, and invalid, read-only and disabled states. Field colors come from the alias tokens (`field`, `field-border`, `placeholder`), so text keeps 4.5:1 and the border 3:1 in all six themes.

```jsx
const { Input } = window.Serupa;

<label htmlFor="name">Name</label>
<Input id="name" placeholder="Dana Kim" />

<Input aria-label="Search projects" leftIcon="search" type="search" />
<Input size="lg" type="email" rightIcon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />

// invalid: say what's wrong in text, linked to the field
<Input id="email" invalid aria-describedby="email-error" />
<p id="email-error">Enter an email address like name@example.com.</p>
```

## When to use

- A short answer on one line that people type freely: a name, an email address, a URL, a phone number.
- A code or an ID people copy in, such as a coupon or an invite code.

## When not to use

- An answer that can run past one line: use [Textarea](../Textarea/README.md).
- A choice from a known list: use [Select](../Select/README.md), or [Combobox](../Combobox/README.md) for a long one.
- A number people step up and down, such as a quantity: use [NumberInput](../NumberInput/README.md).
- A password or a search: use [PasswordInput](../PasswordInput/README.md) or [SearchInput](../SearchInput/README.md).

## Usage

- Match the input's size to the buttons beside it: an `md` input with an `md` Button lines up exactly.
- Keep labels above the field, short and specific; use the placeholder only for an example of the format.
- Show errors after someone leaves the field or submits, not on every keystroke.

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border` |
| Hover | `field-border-hover` |
| Focus | The border and a 1px ring hugging it in `focus-ring` (2px in all); a visible outline in forced-colors mode |
| Invalid | `danger` border, and a `danger` focus ring |
| Read-only | `surface-muted` background, no hover change; still focusable and selectable |
| Disabled | `surface-muted` background at 50%, `not-allowed` cursor |

## Accessibility

- Every input needs a name: a visible `<label htmlFor>` (best) or `aria-label`. A placeholder isn't a label: it disappears as soon as someone types.
- `invalid` sets `aria-invalid`, but color alone doesn't explain the problem: put the message in text and link it with `aria-describedby`.
- Icons are decorative (`aria-hidden`) and don't take clicks, so clicking one focuses nothing; keep meaning in the label.
- Text keeps 4.5:1 on `field`, the placeholder 4.5:1 and the border 3:1, in all six themes (`tools/test/input.mjs`).
- Use the right `type` (`email`, `tel`, `url`, `search`) and `autoComplete` so phones show the right keyboard and browsers can fill it in.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24px with `text-xs`, 32px with `text-sm`, 44px with `text-base` |
| `invalid` | boolean | `false` | A danger border and focus ring, and `aria-invalid` |
| `leftIcon` | icon name or element | | A decorative icon before the text (14, 16 or 20px, in `text-muted`) |
| `rightIcon` | icon name or element | | A decorative icon after the text |

Everything else (`type`, `value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `readOnly`, `required`, `name`, `id`, `aria-*`) and `ref` go to the `<input>`. `className` and `style` go to the box, so `className="w-64"` sets its width (full width by default). The type defaults to `text`. The box has `data-component="input"` and `data-size`.

## Component tokens

Each is an optional override: set it on the page, a container or one input. The list lives in `src/components/Input/input.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--input-bg` | `field` | Background |
| `--input-bg-readonly` | `surface-muted` | Background when read-only or disabled |
| `--input-border` | `field-border` | Border |
| `--input-border-hover` | `field-border-hover` | Border on hover |
| `--input-placeholder` | `placeholder` | Placeholder text |
| `--input-focus-ring` | `focus-ring` | Border and ring while focused |
| `--input-invalid` | `danger` | Border and ring when invalid |
| `--input-height-sm` / `-md` / `-lg` | `control-height-sm` / `-md` / `-lg` | Heights (24, 32, 44px) |
| `--input-icon-size-sm` / `-md` / `-lg` | `spacing-3.5` / `spacing-4` / `spacing-5` | Icon sizes (14, 16, 20px) |
| `--input-padding-x-sm` / `-md` / `-lg` | `spacing-2` / `spacing-3` / `spacing-4` | Side padding (8, 12, 16px) |
| `--input-gap` | `spacing-2` | Gap between an icon and the text (8px) |
| `--input-border-width` | `border-width-1` | Border width (1px) |
| `--input-radius` | `rounded-md` | Corner radius (6px), like Button and Badge |
