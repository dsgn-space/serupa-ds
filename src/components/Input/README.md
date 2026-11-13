# Input

A single-line text field: a native `<input>` in a box that can hold icons. Three sizes at the control heights (24, 32 and 44px, like Button), a focus ring, and invalid, read-only and disabled states. Field colors come from the alias tokens (`field`, `field-border`, `placeholder`), so text keeps 4.5:1 and the focus ring 3:1 in all six themes.

**Also called:** text input, text field.

```jsx
const { Input, InputAction } = window.Serupa;

<label htmlFor="name">Name</label>
<Input id="name" placeholder="Dana Kim" />

<Input aria-label="Search projects" leftIcon="search" type="search" />
<Input size="lg" type="email" rightIcon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />

// invalid: say what's wrong in text, linked to the field
<Input id="email" invalid aria-describedby="email-error" />
<p id="email-error">Enter an email address like name@example.com.</p>

// a count at the end of the field: "12 / 30"
<Input id="title" maxLength={30} showCount />

// buttons inside the box, at the end: a text action, or an icon action named by its label
<Input aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)}
  actions={<InputAction label="Apply" onClick={() => apply(code)} />} />
<Input aria-label="Invite link" readOnly value={link}
  actions={<InputAction icon="content_copy" label="Copy invite link" onClick={() => navigator.clipboard.writeText(link)} />} />
```

## When to use

- A short answer on one line that people type freely: a name, an email address, a URL, a phone number.
- A code or an ID people copy in, such as a coupon or an invite code.

## When not to use

- An answer that can run past one line: use [Textarea](../Textarea/README.md).
- A choice from a known list: use [Select](../Select/README.md), or [Combobox](../Combobox/README.md) for a long one.
- A number people step up and down, such as a quantity: use [NumberInput](../NumberInput/README.md).
- A password or a search: use [PasswordInput](../PasswordInput/README.md) or [SearchInput](../SearchInput/README.md).

## Anatomy

Drawn from the `Icons` story.

1. **Field** (`.dk-input__field`): where the text is typed.
2. **Leading icon** (`.dk-input__icon--left`): an optional picture of what goes in, such as a search glass.
3. **Trailing icon** (`.dk-input__icon--right`): an optional picture or status at the end.
4. **Actions** (`.dk-input__actions`): InputAction buttons at the very end of the box, each the field's height less 6px (26px at md).

## Usage

- Match the input's size to the buttons beside it: an `md` input with an `md` Button lines up exactly.
- Keep labels above the field, short and specific; use the placeholder only for an example of the format.
- Show errors after someone leaves the field or submits, not on every keystroke.
- Show a count only when there's a limit people need to plan around, such as a short title.
- Use `mask` for text with a fixed shape, such as a card number (`"9999 9999 9999 9999"`), a date (`"99/99/9999"`) or an IBAN (`"AA99 **** **** **** **** **"`). `9` takes a digit, `a` a letter, `A` a letter in capitals and `*` either. `\` makes the next character plain, and everything else shows as it is. People type only the letters and digits; the spaces and slashes appear by themselves, a paste is laid into the pattern, and the caret stays where they were typing. Keep the format in the label or hint too ("Expiry date, MM/YY"), and check the value on the server: a mask shapes text, it doesn't validate it. For phone numbers with a country picker, use [PhoneInput](../PhoneInput/README.md).
- Use `actions` for a button that works on what's in the field: Apply for a coupon, Copy for a link, Clear, or Show. Keep it to one or two. Give an icon action a `label` that names what it does to what ("Copy invite link", not "Copy"); a text action shows its label as its words. A button that sends the whole form belongs outside the field, as a Button.
- Use `prefix` and `suffix` for fixed text people shouldn't type, such as "https://", "@" or "kg". Keep it short, and keep the unit in the label too ("Weight (kg)") when the field makes no sense without it.

### Do and don't

- **Do:** Give a field a width that fits what goes in it: a short field for a postcode says how much to type. (`DoFitWidth`)
- **Don't:** Make every field full width: a five-digit postcode as wide as a street address looks like it wants more. (`DontFullWidthShort`)
- **Do:** Say in the error how to put it right, through [Field](../Field/README.md)'s `error`. (`DoHelpfulError`)
- **Don't:** Only say that something is wrong: "Invalid input" leaves people guessing what to change. (`DontVagueError`)

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border` |
| Hover | `field-border-hover` |
| Focus | The border and a 1px ring hugging it in `focus-ring` (2px in all), shown at once and faded out on blur; a visible outline in forced-colors mode |
| Invalid | `danger` border, and a `danger` focus ring |
| Read-only | `field-readonly` background, no hover change; still focusable and selectable |
| Disabled | `field-readonly` background at 50%, `not-allowed` cursor |

## Accessibility

- On iOS the field's text is 16px at every size, so Safari doesn't zoom the page when it takes focus; the box keeps its height.
- A `prefix` or `suffix` is added to the field's `aria-describedby` (after your own), so screen readers say "https://" or "kg" too. A press on it focuses the field. Its `text-muted` keeps 4.5:1 on the field in all six themes (`Input.test.tsx`).
- Every input needs a name: a visible `<label htmlFor>` (best) or `aria-label`. A placeholder isn't a label: it disappears as soon as someone types.
- `invalid` sets `aria-invalid`, but color alone doesn't explain the problem: put the message in text and link it with `aria-describedby`.
- Native constraints (`required`, `type="email"`, `pattern`, `min`, `maxLength`…) show too: a field that fails them takes the `invalid` border once people have edited it or tried to send the form (`:user-invalid`), never on first paint. It's only the color: `aria-invalid` and the message stay yours (set `invalid` and Field's `error` when you check it yourself). To keep the browser out of it, leave out the attribute and check the value in your own code.
- Each action is a `<button type="button">`, so it never sends a form, after the field in the Tab order. An icon action is named by its `label` (its icon is `aria-hidden`), a text action by its words. A disabled Input disables its actions too. A press on an action presses it, and doesn't move focus into the field. At size `sm` an action is 18px, so the area that takes a press reaches 24px (WCAG 2.5.8). A text action's `primary` words keep 4.5:1 on the field and on its hover, an icon action's icon 3:1, in all six themes (`Input.test.tsx`).
- Icons are decorative (`aria-hidden`). A press anywhere on the box, on an icon, the side padding or the count, focuses the field with the caret at the end, as the text cursor over the box promises; keep meaning in the label.
- Text keeps 4.5:1 on `field`, and the placeholder, prefix, suffix and count 4.5:1, in all six themes (`Input.test.tsx`). The resting border is soft on purpose (`field-border`: about 1.5:1 in light, 1.9:1 to 2.6:1 in dark), under the 3:1 WCAG 1.4.11 asks of a control's edge: a deliberate design exception. The label above the field, its fill in dark, the accent border on hover and the 3:1 focus ring mark it, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border.
- Use the right `type` (`email`, `tel`, `url`, `search`) and `autoComplete` so phones show the right keyboard and browsers can fill it in. Email and URL fields, and ones with `autoComplete` `username`, `email`, `url` or `one-time-code`, get `autoCapitalize="off"`, `autoCorrect="off"` and `spellCheck={false}`, so a phone doesn't capitalize or "correct" an address. Any of the three you pass wins.
- The count is linked with `aria-describedby` (after any ids you pass), so screen readers read it when the field gets focus. While typing it's read out only near the limit: once when a few characters are left (10, or a fifth of a short limit) and once when it's reached. The words are the `charactersLeft` label.
- A native constraint the value fails (`required`, `type`, `minLength`, `maxLength`, `min`, `max`, `step`, `pattern`) is reported by the browser in its own language. Inside a `SerupaProvider` whose labels set `invalidValue` (`idLabels` does), the message is in the provider's words instead ("Isi kolom ini."). It's set when the browser checks the field and cleared on the next keystroke or value change. A message you set yourself with `setCustomValidity` stays. In English the browser's own message is kept.
- `maxLength` stops typing at the limit, counted in characters as people see them, like the count: an emoji such as 👨‍👩‍👧 is one. Input applies the limit itself, as Textarea does, so once the page is hydrated the `<input>` has no `maxlength` attribute. Server-rendered HTML keeps it, so the cap holds before the script runs. Say the limit in the label or hint too, since the count only shows it visually.
- The count keeps 4.5:1 on `field` in all six themes, as Textarea's does.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the field, then to each of its actions |
| Enter, Space (on an action) | Presses it |
| Enter | Submits the form it's in, as a native field does |
| Backspace, Delete | With `mask`, next to the pattern's own text (a space, a /), removes the typed character beyond it |

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the native `<input>` (not the wrapper), so a `<label htmlFor>` or a Field can point at it. |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24px with `text-xs`, 32px with `text-sm`, 44px with `text-base` |
| `invalid` | boolean | `false` | A danger border and focus ring, and `aria-invalid` |
| `leftIcon` | icon name or element | | A decorative icon before the text (14, 16 or 20px, in `text-muted`) |
| `rightIcon` | icon name or element | | A decorative icon after the text |
| `prefix` | node | | Text in the box before the field, in `text-muted`, such as "https://". Added to the field's description |
| `suffix` | node | | Text in the box after the field, such as "kg" or ".com". Added to the field's description |
| `mask` | string | none | Keeps the text in a pattern as people type, paste or delete, with the caret where they left it: `9` a digit, `a` a letter, `A` a letter in capitals, `*` either, `\` makes the next character plain. `value`, `defaultValue` and `onChange` use the masked text, and a digits-only mask gets the number keyboard on phones |
| `showCount` | boolean | `false` | A character count at the end of the field, in characters as people see them: "12 / 30" with `maxLength`, "12" without. It turns from `text-muted` to `text` once `maxLength` is reached, in the locale's digits |
| `maxLength` | number | | The most characters, counted as people see them (an emoji is one), applied by Input |
| `actions` | node | | InputAction buttons at the end of the box, after the field in the Tab order, disabled with it |

### InputAction

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | string | required | The action's name: the words on a text action, the accessible name of an icon action |
| `icon` | icon name or element | | Makes it an icon action: the icon, at the field's icon size, in `text-muted` |
| `disabled` | boolean | the Input's | Disabled on its own, dimmed to 50% as a disabled Button is; a disabled Input disables it anyway |

Every other button attribute (`onClick`, `aria-*`) and `ref` go to the `<button>`, which has `data-component="input-action"`.

Everything else (`type`, `value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `readOnly`, `required`, `name`, `id`, `aria-*`) and `ref` go to the `<input>`. `className` and `style` go to the box, so `className="w-64"` sets its width (full width by default). It can be narrower than the native field's 20 characters, so in a grid cell or a flex row it takes the room it's given and never pushes the page sideways. Beside a button in a flex row, give it `className="flex-1"` so it takes what the button leaves instead of squeezing it. The type defaults to `text`. The box has `data-component="input"` and `data-size`. Inside a `<fieldset disabled>` the box takes the disabled look too, as the native field is disabled with it; so do the fields built on Input (Combobox, NumberInput, SearchInput, PasswordInput, PhoneInput, DatePicker, DateRangePicker, TimePicker).

## Component tokens

Each is an optional override: set it on the page, a container or one input. The list lives in `src/components/Input/input.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from input.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--input-bg` | `field` | Background |
| `--input-bg-readonly` | `field-readonly` | Background when read-only or disabled |
| `--input-text` | `text` | The typed text |
| `--input-border` | `field-border` | Border |
| `--input-border-hover` | `field-border-hover` | Border on hover |
| `--input-placeholder` | `placeholder` | Placeholder text |
| `--input-icon-color` | `text-muted` | Left and right icons |
| `--input-affix` | `placeholder` | The `prefix` and `suffix` text |
| `--input-count` | `placeholder` | The character count |
| `--input-count-full` | `text` | The count once `maxLength` is reached |
| `--input-focus-ring` | `focus-ring` | Border and ring while focused |
| `--input-invalid` | `field-border-invalid` | Border and ring when invalid |
| `--input-action` | `text-muted` | An icon action's icon (3:1 on the field). |
| `--input-action-hover` | `text` | An icon action's icon on hover. |
| `--input-action-bg-hover` | `field-hover` | An icon action's background on hover. |
| `--input-action-bg-pressed` | `field-pressed` | An icon action's background while it's held down, one step past hover. |
| `--input-action-text` | `field-action` | A text action's words, such as Apply (4.5:1 on the field). |
| `--input-action-text-bg-hover` | `primary-subtle` | A text action's background on hover. |
| `--input-action-focus-ring` | `focus-ring` | The ring around a focused action. |
| `--input-rejected-color` | `text-muted` | The line under a DatePicker, DateRangePicker, TimePicker or NumberInput saying why typed text was put back. |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--input-height-sm` | `control-height-sm` | Height, sm (24px), like Button sm. |
| `--input-height-md` | `control-height-md` | Height, md (32px, default). |
| `--input-height-lg` | `control-height-lg` | Height, lg (44px). |
| `--input-icon-size-sm` | `spacing-3.5` | Icon size, sm (14px). |
| `--input-icon-size-md` | `spacing-4` | Icon size, md (16px). |
| `--input-icon-size-lg` | `spacing-5` | Icon size, lg (20px). |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--input-padding-x-sm` | `spacing-2` | Side padding, sm (8px). |
| `--input-padding-x-md` | `spacing-3` | Side padding, md (12px). |
| `--input-padding-x-lg` | `spacing-4` | Side padding, lg (16px). |
| `--input-gap` | `spacing-2` | Gap between an icon and the text (8px) |
| `--input-actions-inset` | `spacing-0.5` | Space between the actions and the box's edge (2px), so an action is the field's height less 6px. |
| `--input-action-padding-x` | `spacing-2` | Space at a text action's sides (8px). |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--input-border-width` | `border-width-1` | Border width (1px) |
| `--input-radius` | `radius-control` | Corner radius (6px), like Button and Badge |
| `--input-action-radius` | `radius-inner` | An action's corners (4px), inside the box's. |

**Shadow**

| Token | Default | Use |
| --- | --- | --- |
| `--input-depth` | `depth-field` | The tactile inner shade along the top of the box. None in the flat brands. |
<!-- token-table:end -->
