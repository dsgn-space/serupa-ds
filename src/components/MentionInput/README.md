# MentionInput

A multi-line text field where typing "@" opens a list of people to mention, at the caret. Picking one writes "@Name" into the text, so a comment, a reply or a note can bring someone in, and the app can notify them.

**Also called:** mentions, @-mentions, user tagging.

```tsx
import { MentionInput, mentionsIn } from "serupa-ds";

const people = [{ id: "ayu", label: "Ayu Lestari", description: "Design lead" }, { id: "budi", label: "Budi Santoso" }];
const [text, setText] = React.useState("");
<Field label="Comment" hint="Type @ to mention someone.">
  <MentionInput options={people} value={text} onValueChange={setText} autoResize maxRows={8} />
</Field>

// on Send: who to notify
const notify = mentionsIn(text, people).map((p) => p.id);

// a large directory: load the matches as people type, and show them as given
<MentionInput aria-label="Reply" options={matches} filter={false} onSearch={(q) => { if (q != null) search(q); }} />
```

## When to use

- A comment, a reply, a chat message or a note where people bring someone in by name.
- Any text where a few known names or things are referred to inline, such as `#` for a channel (`trigger="#"`).

## When not to use

- Picking people as the field's value, such as assignees or reviewers: use [Combobox](../Combobox/README.md) `multiple`, which shows each one as a tag.
- A single line of text: use [Input](../Input/README.md), or Combobox `freeText` for suggestions.

## Anatomy

Drawn from the `Default` story.

1. **Field** (`.dk-textarea`): a [Textarea](../Textarea/README.md), with every prop it takes.
2. **List** (`.dk-mention-input__popup`): the people who match, under the line the caret is on. Each option shows an [Avatar](../Avatar/README.md), the name and its `description` line.

## Usage

- Say how it works under the field ("Type @ to mention someone."), in the Field's hint or the placeholder. Nothing else shows that "@" does something.
- The text stays plain: a mention is "@" and the label, as people see it. Use `mentionsIn(text, options)` when the text is sent, to find who to notify: at each "@" it takes the longest whole name written there, so "@Ayu Lestari" is Ayu Lestari and not also an "Ayu". Labels should be unique, such as a full name, so a mention points to one person.
- "@" counts only at the start of the text or after a space or an opening bracket, so an email address doesn't open the list. A space right before the caret closes it, and a space inside a name doesn't ("@Ayu L" still matches).
- `filter` (on by default) keeps the options whose label holds what's typed, ignoring case and accents, with names that start with it first. For a large directory, pass `filter={false}`, load matches in `onSearch`, and pass them as `options`.
- `description` tells people with the same first name apart (a role or a team). Mark someone who can't be mentioned here `disabled`, and say why in their description ("Can't see this project").
- Use `value` with `onValueChange`, which picking a mention also calls. `onChange` gets the textarea's own events, but a mention put in isn't one.
- It takes `name` and goes into a form like a Textarea: it submits its text and puts `defaultValue` back on reset.

### Do and don't

- **Do:** Say how to mention, in the hint: "Type @ to mention someone." (`DoSayHow`)
- **Don't:** Leave the field with no word that @ does anything. (`DontHide`)

## Accessibility

- **Role and name:** a `<textarea>` (a textbox), named by its Field or `aria-label`. It has `aria-autocomplete="list"`, and while the list is open, `aria-controls` names the listbox and `aria-activedescendant` the highlighted option. (A textarea can't take `role="combobox"`, so it stays a textbox.) The listbox is named by the same label.
- **Said:** how many match ("3 results", or "No results") is said politely after typing pauses, as in Combobox (4.1.3).
- **Keyboard:** see below. Focus never leaves the field, so typing goes on after a pick, with the caret after the name and its space.
- **Contrast:** options and their second line read 4.5:1 on the list, the highlighted one too, in all six themes (`MentionInput.test.tsx`).
- **What's still yours:** the hint that says how to mention, unique labels, and notifying the people `mentionsIn` returns.

### Keyboard

| Key | While the list is open |
| --- | --- |
| Down arrow, Up arrow | Highlight the next or previous person, past those who can't be picked, wrapping at the ends |
| Enter, Tab | Put the highlighted person in |
| Escape | Close the list for this mention; the next "@" opens it again. A dialog the field is in stays open |
| Shift+Tab | Leave the field, and the list closes (as a click outside it does) |

Every other key types. Nothing is taken while an input method is composing a character.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the native `<textarea>` (not the wrapper), so a `<label htmlFor>` or a Field can point at it. |
| `options` | `MentionOption[]` | | `{ id, label, description?, avatar?, disabled? }`: who can be mentioned. |
| `value` | `string` | | The text (controlled). |
| `defaultValue` | `string` | `''` | The text at first. |
| `onValueChange` | `(value: string) => void` | | Every change, typing or a mention put in. |
| `onSearch` | `(query: string \| null) => void` | | What's typed after "@" while the list is open, then `null`. |
| `onMention` | `(option: MentionOption) => void` | | A mention was put in. |
| `trigger` | `string` | `'@'` | The character that starts a mention. |
| `filter` | `boolean` | `true` | Narrows `options` to what's typed. Off when you filter. |
| `maxOptions` | `number` | `8` | The most options shown. |

Every [Textarea](../Textarea/README.md) prop works too (`size`, `rows`, `autoResize`, `maxRows`, `showCount`, `actions`, `invalid`, `name`…). `ref` and other props go to the `<textarea>`; `className` and `style` go to the wrapper. `mentionQuery(text, caret, trigger?)` is exported too: the open mention at a caret, or `null`.

## Component tokens

Each is an optional override: set it on the page, a container or one MentionInput. The list lives in `src/components/MentionInput/mention-input.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from mention-input.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--mention-input-listbox-bg` | `surface-overlay` | The list's background. |
| `--mention-input-listbox-border` | `border-overlay` | The list's outline. |
| `--mention-input-option-color` | `text` | An option's label, and its second line while it's highlighted. |
| `--mention-input-option-bg-active` | `highlight` | The highlighted option (hover or arrow keys). |
| `--mention-input-option-indicator` | `primary` | The 2px bar at the highlighted option's start. |
| `--mention-input-description-color` | `text-muted` | An option's second line and the no-match message. |
| `--mention-input-listbox-shadow` | `elevation-overlay` | The list's shadow. |
| `--mention-input-listbox-radius` | `radius-surface` | The list's corners (8px). |
| `--mention-input-option-radius` | `radius-control` | An option's corners. Unset, they nest in the list's: its radius less its padding and border (3px), following the brand and data-radius. |
| `--mention-input-listbox-max-height` | `spacing-60` | The list's height before it scrolls (240px). |
| `--mention-input-listbox-max-width` | `container-md` | The list's widest (448px). Longer labels wrap. |
| `--mention-input-option-height` | `control-height-md` | An option's least height (32px). |
| `--mention-input-listbox-padding` | `spacing-1` | Space inside the list (4px). |
| `--mention-input-option-padding-x` | `spacing-2` | Space on each side of an option (8px). |
| `--mention-input-offset` | `spacing-1` | The gap between the caret's line and the list (4px). |
| `--mention-input-z-index` | `z-popover` | The list's stacking order, where the top layer isn't available. |
<!-- token-table:end -->
