# TruncatedText

Text that may not fit its space, such as a file name in a narrow column: cut with an ellipsis, with the whole text shown beside it on hover, keyboard focus or a tap. Text that fits stays plain text.

**Also called:** ellipsis, text overflow, line clamp.

```tsx
import { TruncatedText } from "@diki-stwn/serupa-ds";

<TruncatedText>quarterly-report-final-version-2.pdf</TruncatedText>
<TruncatedText lines={2}>{comment}</TruncatedText>
```

## When to use

- A name or value the app doesn't control, in a space that can't grow: a file name in a list, an email address in a table cell, a project title in a card's header.
- Rows that must stay one line high, where some values fit and some don't.

## When not to use

- Text that has room to wrap: let it wrap. Cutting text is the last resort, since most people never open what's hidden.
- A long description or comment to open in place: [ShowMore](../ShowMore/README.md).
- A preview whose full text is a link away, with nothing to show on hover: [Text](../Text/README.md) with `lines`.
- The label of a Button, a tab or a menu item: put a [Tooltip](../Tooltip/README.md) on the control, which already shows a cut label in full.

## Usage

- It is a block as wide as its container, so the container decides where it cuts: a grid column, a table cell with a width, a flex item (it can shrink below its text's width).
- A grid column or flex item that holds it must be allowed to shrink below the text's width, or the whole text widens it: a `minmax(0, 1fr)` column, or `min-width: 0` on the flex item (`min-w-0`).
- Pass the text as a string. Style it from the parent, or with `className`: it uses the surrounding font and color.
- `lines` allows 2 to 6 lines before the cut, for a title that may take two lines but not three.
- Keep it out of a `<p>`: the full text is drawn in an element of its own beside it, which a paragraph can't hold. Use `as="p"` to make it the paragraph.
- Put what people need in order to tell rows apart at the start of the text, where the cut never reaches.

### Do and don't

- **Do:** Put what tells the rows apart at the start: "March 2026 statement, account…". (`DoDifferenceFirst`)
- **Don't:** Start every row with the same words: the cut leaves each one the same text, and people open them one by one to find theirs. (`DontSameStart`)

## Accessibility

- **Role and name:** plain text with no role. The whole text stays in the element, so screen readers and find-in-page get all of it, cut or not. The text shown on hover repeats it for the eye, so it is hidden from screen readers and nothing points at it.
- **Keyboard:** cut text takes a tab stop, and focus shows the whole text; `Esc` hides it. Text that fits has no tab stop. Inside a link, a button or another element that takes focus, it adds no tab stop of its own: that control's keyboard focus shows the whole text.
- **Touch:** a tap shows the whole text, and the next tap, or a tap elsewhere, hides it. Inside a link or a button, a tap is the control's: it follows the link or opens the picker, and the whole text stays in the control's name.
- **Contrast:** it takes the surrounding text's color; its focus ring reads 3:1 on the surface in every theme (`TruncatedText.test.tsx`).
- **What's still yours:** a width for its container, and a color for the text that reads 4.5:1 on its background.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `string` | | The text. All of it stays in the page |
| `id` | string | none | Goes to the root element |
| `lines` | number | `1` | How many lines it may take before the cut: 1 to 6 (more counts as 6). It sets no style attribute, so it holds under a strict Content Security Policy |
| `as` | `'span'` \| `'p'` \| `'div'` | `'span'` | The element. Whichever it is, it's a block as wide as its container |
| `placement` | `'top'` \| `'bottom'` \| `'left'` \| `'right'`, or with `-start` / `-end` | `'top'` | Where the whole text shows. It flips when there's no room |

`className`, `ref` and other props go to the element, which has `data-component="truncated-text"`, and `data-truncated` while it's cut.

## Component tokens

Each is an optional override: set it on the page, a container or one TruncatedText. The list lives in `src/components/TruncatedText/truncated-text.tokens.json` (also in `design-tokens/components/`). The whole text shows in a [Tooltip](../Tooltip/README.md), which has its own tokens.

<!-- token-table:start (made from truncated-text.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--truncated-text-focus-ring` | `focus-ring` | The ring inside its edge while cut text has keyboard focus. |
<!-- token-table:end -->
